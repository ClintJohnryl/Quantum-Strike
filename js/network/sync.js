// ===== STATE SYNCHRONIZATION =====

class StateSync {
    constructor() {
        this.isHost = false;
        this.syncInterval = null;
        this.syncRate = 100; // ms
        this.lastSync = 0;
    }
    
    // Initialize sync
    init(isHost = false) {
        this.isHost = isHost;
        this.startSync();
    }
    
    // Start sync loop
    startSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            this.sync();
        }, this.syncRate);
    }
    
    // Stop sync
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
    
    // Sync state
    sync() {
        if (!window.multiplayer || !window.multiplayer.isConnected()) return;
        if (!Game || !Game.player) return;
        
        const now = Date.now();
        if (now - this.lastSync < this.syncRate) return;
        this.lastSync = now;
        
        // Host syncs enemies and asteroids
        if (this.isHost) {
            this.syncEnemies();
            this.syncAsteroids();
        }
        
        // All players sync their position
        this.syncPlayer();
    }
    
    // Sync player position
    syncPlayer() {
        if (!Game || !Game.player) return;
        const player = Game.player;
        const rank = getRank(GameData.getXP());
        
        window.multiplayer.client.updatePlayer(
            player.x,
            player.y,
            player.angle,
            player.hp,
            player.score,
            player.kills,
            rank.title
        );
    }
    
    // Sync enemies (host only)
    syncEnemies() {
        if (!Game || !Game.enemies) return;
        
        const enemyData = Game.enemies
            .filter(e => e.alive)
            .map(e => ({
                x: e.x,
                y: e.y,
                hp: e.hp,
                maxHp: e.maxHp,
                type: e.type,
                size: e.size,
                color: e.color,
                isBoss: e.isBoss || false,
                isElite: e.isElite || false,
                angle: e.angle,
                alive: e.alive
            }));
        
        window.multiplayer.client.send({
            type: 'sync_enemies',
            enemies: enemyData
        });
    }
    
    // Sync asteroids (host only)
    syncAsteroids() {
        if (!Game || !Game.asteroids) return;
        
        const asteroidData = Game.asteroids
            .filter(a => a.alive)
            .map(a => ({
                x: a.x,
                y: a.y,
                size: a.size,
                angle: a.angle,
                rotationSpeed: a.rotationSpeed,
                vertices: a.vertices,
                alive: a.alive
            }));
        
        window.multiplayer.client.send({
            type: 'sync_asteroids',
            asteroids: asteroidData
        });
    }
    
    // Sync projectile
    syncProjectile(x, y, angle, weapon) {
        window.multiplayer.client.send({
            type: 'shoot',
            x: x,
            y: y,
            angle: angle,
            weapon: weapon
        });
    }
    
    // Sync enemy kill
    syncEnemyKill(score) {
        window.multiplayer.client.send({
            type: 'enemy_killed',
            score: score
        });
    }
    
    // Handle incoming sync
    handleSync(data) {
        switch (data.type) {
            case 'sync_enemies':
                if (!this.isHost && Game) {
                    // Update enemies from server
                    Game.enemies = data.enemies.map(e => {
                        const enemy = new AIEnemy(e.x, e.y, e.type);
                        enemy.hp = e.hp;
                        enemy.maxHp = e.maxHp;
                        enemy.alive = e.alive;
                        enemy.size = e.size;
                        enemy.color = e.color;
                        enemy.isBoss = e.isBoss;
                        enemy.isElite = e.isElite;
                        enemy.angle = e.angle;
                        return enemy;
                    });
                }
                break;
                
            case 'sync_asteroids':
                if (!this.isHost && Game) {
                    Game.asteroids = data.asteroids.map(a => {
                        const asteroid = new Asteroid(a.x, a.y, a.size);
                        asteroid.angle = a.angle;
                        asteroid.rotationSpeed = a.rotationSpeed;
                        asteroid.vertices = a.vertices;
                        asteroid.alive = a.alive;
                        return asteroid;
                    });
                }
                break;
                
            case 'shoot':
                // Handle remote shot
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
                        isRemote: true
                    };
                    Game.player.bullets.push(bullet);
                }
                break;
        }
    }
}

// Create global instance
window.StateSync = StateSync;
window.stateSync = new StateSync();