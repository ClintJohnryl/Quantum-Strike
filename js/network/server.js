// ===== LAN MULTIPLAYER SERVER =====
// Run this in Node.js: node js/network/server.js

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 8080;
const WS_PORT = 8081;

// HTTP Server for serving the game
const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, '../../', filePath);
    
    const ext = path.extname(filePath);
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    }[ext] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// WebSocket Server
const wss = new WebSocket.Server({ port: WS_PORT });

// Game state
const gameState = {
    players: {},
    enemies: [],
    asteroids: [],
    powerups: [],
    projectiles: []
};

let nextPlayerId = 1;

// Broadcast to all clients
function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    const playerId = `player_${nextPlayerId++}`;
    
    // Create new player
    const newPlayer = {
        id: playerId,
        name: `Player_${playerId}`,
        x: Math.random() * 4000,
        y: Math.random() * 4000,
        angle: 0,
        hp: 100,
        maxHp: 100,
        alive: true,
        shipType: 'default',
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        score: 0,
        kills: 0,
        rank: 'Recruit'
    };
    
    gameState.players[playerId] = newPlayer;
    
    // Send current state to new player
    ws.send(JSON.stringify({
        type: 'init',
        playerId: playerId,
        state: gameState
    }));
    
    // Notify other players
    broadcast({
        type: 'player_joined',
        player: newPlayer
    });
    
    console.log(`Player ${playerId} connected (${wss.clients.size} total)`);
    
    // Handle messages from client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'update_player':
                    // Update player position
                    if (gameState.players[playerId]) {
                        const p = gameState.players[playerId];
                        p.x = data.x || p.x;
                        p.y = data.y || p.y;
                        p.angle = data.angle || p.angle;
                        p.hp = data.hp || p.hp;
                        p.score = data.score || p.score;
                        p.kills = data.kills || p.kills;
                        p.rank = data.rank || p.rank;
                        
                        // Broadcast player update
                        broadcast({
                            type: 'player_update',
                            playerId: playerId,
                            player: p
                        });
                    }
                    break;
                    
                case 'shoot':
                    // Broadcast shot
                    broadcast({
                        type: 'projectile',
                        playerId: playerId,
                        x: data.x,
                        y: data.y,
                        angle: data.angle,
                        weapon: data.weapon
                    });
                    break;
                    
                case 'enemy_killed':
                    // Update score
                    if (gameState.players[playerId]) {
                        gameState.players[playerId].score += data.score || 100;
                        gameState.players[playerId].kills += 1;
                    }
                    broadcast({
                        type: 'score_update',
                        playerId: playerId,
                        score: gameState.players[playerId]?.score || 0,
                        kills: gameState.players[playerId]?.kills || 0
                    });
                    break;
                    
                case 'name_update':
                    if (gameState.players[playerId]) {
                        gameState.players[playerId].name = data.name || `Player_${playerId}`;
                        broadcast({
                            type: 'player_update',
                            playerId: playerId,
                            player: gameState.players[playerId]
                        });
                    }
                    break;
                    
                case 'sync_asteroids':
                    // Sync asteroid data
                    gameState.asteroids = data.asteroids || [];
                    broadcast({
                        type: 'asteroids_sync',
                        asteroids: gameState.asteroids
                    });
                    break;
                    
                case 'sync_enemies':
                    // Sync enemy data
                    gameState.enemies = data.enemies || [];
                    broadcast({
                        type: 'enemies_sync',
                        enemies: gameState.enemies
                    });
                    break;
            }
        } catch (e) {
            console.error('Error handling message:', e);
        }
    });
    
    // Handle disconnection
    ws.on('close', () => {
        delete gameState.players[playerId];
        broadcast({
            type: 'player_left',
            playerId: playerId
        });
        console.log(`Player ${playerId} disconnected (${wss.clients.size} total)`);
    });
});

// Send periodic server time to keep connections alive
setInterval(() => {
    broadcast({
        type: 'ping',
        time: Date.now()
    });
}, 30000);

// Asteroid simulation (server-side)
setInterval(() => {
    // Simple asteroid movement
    gameState.asteroids.forEach(a => {
        a.x += a.vx || 0;
        a.y += a.vy || 0;
        if (a.x < 0 || a.x > 4000) a.vx *= -1;
        if (a.y < 0 || a.y > 4000) a.vy *= -1;
        a.x = Math.max(0, Math.min(4000, a.x));
        a.y = Math.max(0, Math.min(4000, a.y));
    });
    
    // Sync asteroids every 5 seconds
    broadcast({
        type: 'asteroids_sync',
        asteroids: gameState.asteroids
    });
}, 5000);

// Start servers
server.listen(PORT, () => {
    console.log(`🚀 LAN Server running at http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server running on port ${WS_PORT}`);
    console.log('📋 Players can connect by visiting the URL above');
    console.log('💡 To join, click "LAN Multiplayer" in the game menu');
});

console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);