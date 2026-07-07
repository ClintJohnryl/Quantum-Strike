// ===== MULTIPLAYER MANAGER =====

class MultiplayerManager {
    constructor() {
        this.client = null;
        this.localPlayer = null;
        this.remotePlayers = {};
        this.initialized = false;
        this.serverHost = 'localhost';
        this.serverPort = 8081;
        this.isHost = false;
        
        // Sync interval
        this.syncInterval = null;
        this.syncRate = 50; // ms
    }
    
    // Initialize multiplayer
    init(host = 'localhost', port = 8081) {
        this.serverHost = host;
        this.serverPort = port;
        this.client = new MultiplayerClient();
        
        // Setup callbacks
        this.client.on('init', (data) => this.handleInit(data));
        this.client.on('player_joined', (player) => this.handlePlayerJoined(player));
        this.client.on('player_left', (id) => this.handlePlayerLeft(id));
        this.client.on('player_update', (player) => this.handlePlayerUpdate(player));
        this.client.on('projectile', (data) => this.handleProjectile(data));
        this.client.on('score_update', (data) => this.handleScoreUpdate(data));
        this.client.on('asteroids_sync', (asteroids) => this.handleAsteroidsSync(asteroids));
        this.client.on('enemies_sync', (enemies) => this.handleEnemiesSync(enemies));
        this.client.on('onDisconnect', () => this.handleDisconnect());
        
        return this.client.connect(host, port);
    }
    
    // Handle initialization
    handleInit(data) {
        this.localPlayer = data.playerId;
        this.remotePlayers = {};
        
        // Add remote players
        Object.keys(data.state.players).forEach(id => {
            if (id !== this.localPlayer) {
                this.remotePlayers[id] = data.state.players[id];
            }
        });
        
        // Sync asteroids and enemies
        if (data.state.asteroids) {
            Game.asteroids = data.state.asteroids.map(a => new Asteroid(a.x, a.y, a.size));
        }
        
        this.initialized = true;
        console.log('🎮 Multiplayer initialized!');
        
        // Start sync loop
        this.startSyncLoop();
    }
    
    // Handle player joined
    handlePlayerJoined(player) {
        if (player.id !== this.localPlayer) {
            this.remotePlayers[player.id] = player;
            console.log(`👤 Player ${player.name} joined!`);
            
            // Show notification
            if (GUI && GUI.showNotification) {
                GUI.showNotification(`👤 ${player.name} joined the game!`, '#44ff44');
            }
        }
    }
    
    // Handle player left
    handlePlayerLeft(id) {
        delete this.remotePlayers[id];
        console.log(`👤 Player ${id} left`);
        
        if (GUI && GUI.showNotification) {
            GUI.showNotification(`👤 Player left`, '#ff4444');
        }
    }
    
    // Handle player update
    handlePlayerUpdate(player) {
        if (player.id !== this.localPlayer) {
            this.remotePlayers[player.id] = player;
        }
    }
    
    // Handle projectile
    handleProjectile(data) {
        // Add remote projectile to game
        if (Game && Game.player) {
            const weapon = WEAPONS[data.weapon] || WEAPONS.laser;
            const bullet = {
                x: data.x,
                y: data.y,
                dx: Math.cos(data.angle),
                dy: Math.sin(data.angle),
                damage: weapon.damage || 1,
                color: weapon.bulletColor || '#ff0',
                size: weapon.bulletSize || 4,
                life: weapon.bulletLifetime || 60,
                trail: weapon.trail || false,
                explosive: weapon.explosive || false,
                explosionRadius: weapon.explosionRadius || 50,
                piercing: weapon.piercing || false,
                trailPoints: [],
                isRemote: true,
                ownerId: data.playerId
            };
            
            // Add to game bullets
            if (Game.player) {
                Game.player.bullets.push(bullet);
            }
        }
    }
    
    // Handle score update
    handleScoreUpdate(data) {
        if (this.remotePlayers[data.playerId]) {
            this.remotePlayers[data.playerId].score = data.score;
            this.remotePlayers[data.playerId].kills = data.kills;
        }
    }
    
    // Handle asteroids sync
    handleAsteroidsSync(asteroids) {
        if (Game) {
            Game.asteroids = asteroids.map(a => {
                const ast = new Asteroid(a.x, a.y, a.size);
                ast.alive = a.alive !== undefined ? a.alive : true;
                return ast;
            });
        }
    }
    
    // Handle enemies sync
    handleEnemiesSync(enemies) {
        // Only sync if we're the host
        if (this.isHost && Game) {
            // Send enemies to server
            this.client.send({
                type: 'sync_enemies',
                enemies: Game.enemies.map(e => ({
                    x: e.x,
                    y: e.y,
                    hp: e.hp,
                    maxHp: e.maxHp,
                    type: e.type,
                    alive: e.alive,
                    size: e.size,
                    color: e.color,
                    isBoss: e.isBoss || false,
                    isElite: e.isElite || false
                }))
            });
        }
    }
    
    // Handle disconnect
    handleDisconnect() {
        this.initialized = false;
        this.stopSyncLoop();
        console.log('❌ Disconnected from server');
        
        if (GUI && GUI.showNotification) {
            GUI.showNotification('❌ Disconnected from server', '#ff4444');
        }
    }
    
    // Start sync loop
    startSyncLoop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            this.syncPlayer();
        }, this.syncRate);
    }
    
    // Stop sync loop
    stopSyncLoop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
    
    // Sync local player
    syncPlayer() {
        if (!this.client || !this.client.isConnected()) return;
        if (!Game || !Game.player) return;
        
        const player = Game.player;
        const rank = getRank(GameData.getXP());
        
        this.client.updatePlayer(
            player.x,
            player.y,
            player.angle,
            player.hp,
            player.score,
            player.kills,
            rank.title
        );
    }
    
    // Send shoot event
    sendShoot(x, y, angle) {
        if (!this.client || !this.client.isConnected()) return;
        const weapon = Game.player?.equippedWeapon || 'laser';
        this.client.shoot(x, y, angle, weapon);
    }
    
    // Send enemy killed
    sendEnemyKilled(score) {
        if (!this.client || !this.client.isConnected()) return;
        this.client.enemyKilled(score);
    }
    
    // Draw remote players
    drawRemotePlayers(ctx, camX, camY, zoom) {
        Object.values(this.remotePlayers).forEach(player => {
            const sx = (player.x - camX + W / 2 / zoom) * zoom;
            const sy = (player.y - camY + H / 2 / zoom) * zoom;
            
            if (sx < -100 || sx > W / zoom + 100 || sy < -100 || sy > H / zoom + 100) return;
            
            // Draw player indicator
            ctx.save();
            ctx.translate(sx, sy);
            ctx.scale(zoom, zoom);
            
            // Player ship
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(-10, -8);
            ctx.lineTo(-10, 8);
            ctx.closePath();
            ctx.fillStyle = player.color || '#ffaa00';
            ctx.shadowColor = player.color || '#ffaa00';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Name tag
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(player.name || 'Player', 0, -20);
            
            // Rank
            ctx.fillStyle = '#ffaa00';
            ctx.font = '8px Arial';
            ctx.fillText(player.rank || 'Recruit', 0, -12);
            
            ctx.restore();
            
            // HP bar
            const hpRatio = player.hp / player.maxHp;
            ctx.fillStyle = 'rgba(255,0,0,0.5)';
            ctx.fillRect(sx - 15, sy + 15, 30, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(sx - 15, sy + 15, 30 * hpRatio, 4);
        });
    }
    
    // Get player count
    getPlayerCount() {
        return Object.keys(this.remotePlayers).length + (this.localPlayer ? 1 : 0);
    }
    
    // Check if connected
    isConnected() {
        return this.client && this.client.isConnected();
    }
    
    // Disconnect
    disconnect() {
        this.stopSyncLoop();
        if (this.client) {
            this.client.disconnect();
        }
        this.initialized = false;
    }
}

// Create global instance
window.MultiplayerManager = MultiplayerManager;
window.multiplayer = new MultiplayerManager();