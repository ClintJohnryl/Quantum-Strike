// ===== LAN MULTIPLAYER CLIENT =====

class MultiplayerClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.playerId = null;
        this.players = {};
        this.remotePlayers = {};
        this.enemies = [];
        this.asteroids = [];
        this.projectiles = [];
        this.serverUrl = null;
        this.callbacks = {};
        
        // Connection status
        this.status = 'disconnected';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    
    // Connect to server
    connect(host = 'localhost', port = 8081) {
        return new Promise((resolve, reject) => {
            try {
                this.serverUrl = `ws://${host}:${port}`;
                this.ws = new WebSocket(this.serverUrl);
                
                this.ws.onopen = () => {
                    this.connected = true;
                    this.status = 'connected';
                    this.reconnectAttempts = 0;
                    console.log('✅ Connected to LAN server');
                    resolve();
                };
                
                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (e) {
                        console.error('Error parsing message:', e);
                    }
                };
                
                this.ws.onclose = () => {
                    this.connected = false;
                    this.status = 'disconnected';
                    console.log('❌ Disconnected from server');
                    this.handleReconnect();
                };
                
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.status = 'error';
                    reject(error);
                };
            } catch (e) {
                reject(e);
            }
        });
    }
    
    // Handle reconnection
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts})`);
            setTimeout(() => {
                if (!this.connected) {
                    this.connect().catch(() => {});
                }
            }, 3000 * this.reconnectAttempts);
        } else {
            this.status = 'failed';
            console.log('❌ Max reconnect attempts reached');
            if (this.callbacks.onDisconnect) {
                this.callbacks.onDisconnect();
            }
        }
    }
    
    // Handle incoming messages
    handleMessage(data) {
        switch (data.type) {
            case 'init':
                this.playerId = data.playerId;
                this.players = data.state.players || {};
                this.enemies = data.state.enemies || [];
                this.asteroids = data.state.asteroids || [];
                
                // Add remote players
                Object.keys(this.players).forEach(id => {
                    if (id !== this.playerId) {
                        this.remotePlayers[id] = this.players[id];
                    }
                });
                
                if (this.callbacks.onInit) {
                    this.callbacks.onInit(data);
                }
                break;
                
            case 'player_joined':
                this.players[data.player.id] = data.player;
                if (data.player.id !== this.playerId) {
                    this.remotePlayers[data.player.id] = data.player;
                    if (this.callbacks.onPlayerJoined) {
                        this.callbacks.onPlayerJoined(data.player);
                    }
                }
                break;
                
            case 'player_left':
                delete this.players[data.playerId];
                delete this.remotePlayers[data.playerId];
                if (this.callbacks.onPlayerLeft) {
                    this.callbacks.onPlayerLeft(data.playerId);
                }
                break;
                
            case 'player_update':
                if (this.players[data.playerId]) {
                    this.players[data.playerId] = data.player;
                    if (data.playerId !== this.playerId) {
                        this.remotePlayers[data.playerId] = data.player;
                        if (this.callbacks.onPlayerUpdate) {
                            this.callbacks.onPlayerUpdate(data.player);
                        }
                    }
                }
                break;
                
            case 'projectile':
                if (this.callbacks.onProjectile) {
                    this.callbacks.onProjectile(data);
                }
                break;
                
            case 'score_update':
                if (this.players[data.playerId]) {
                    this.players[data.playerId].score = data.score;
                    this.players[data.playerId].kills = data.kills;
                    if (this.callbacks.onScoreUpdate) {
                        this.callbacks.onScoreUpdate(data);
                    }
                }
                break;
                
            case 'asteroids_sync':
                this.asteroids = data.asteroids || [];
                if (this.callbacks.onAsteroidsSync) {
                    this.callbacks.onAsteroidsSync(data.asteroids);
                }
                break;
                
            case 'enemies_sync':
                this.enemies = data.enemies || [];
                if (this.callbacks.onEnemiesSync) {
                    this.callbacks.onEnemiesSync(data.enemies);
                }
                break;
                
            case 'ping':
                // Respond with pong
                this.send({
                    type: 'pong',
                    time: data.time
                });
                break;
                
            default:
                // Forward to custom handler
                if (this.callbacks.onCustomMessage) {
                    this.callbacks.onCustomMessage(data);
                }
        }
    }
    
    // Send message to server
    send(data) {
        if (this.connected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('Cannot send message: not connected');
        }
    }
    
    // Update player position
    updatePlayer(x, y, angle, hp, score, kills, rank) {
        this.send({
            type: 'update_player',
            x: x,
            y: y,
            angle: angle,
            hp: hp,
            score: score,
            kills: kills,
            rank: rank
        });
    }
    
    // Send shoot event
    shoot(x, y, angle, weapon) {
        this.send({
            type: 'shoot',
            x: x,
            y: y,
            angle: angle,
            weapon: weapon
        });
    }
    
    // Enemy killed
    enemyKilled(score) {
        this.send({
            type: 'enemy_killed',
            score: score
        });
    }
    
    // Update name
    updateName(name) {
        this.send({
            type: 'name_update',
            name: name
        });
    }
    
    // Get local player
    getLocalPlayer() {
        return this.players[this.playerId] || null;
    }
    
    // Get remote players
    getRemotePlayers() {
        return this.remotePlayers;
    }
    
    // Disconnect
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.connected = false;
        this.status = 'disconnected';
    }
    
    // Set callbacks
    on(event, callback) {
        this.callbacks[event] = callback;
    }
    
    // Check if connected
    isConnected() {
        return this.connected;
    }
    
    // Get connection status
    getStatus() {
        return this.status;
    }
}

// Create global instance
window.MultiplayerClient = MultiplayerClient;