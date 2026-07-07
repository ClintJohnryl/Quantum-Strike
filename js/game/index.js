// ===== GAME - Main Object (Combines all modules) =====

// Create the main game object
const Game = {
    // Properties
    player: null,
    enemies: [],
    asteroids: [],
    powerups: [], // Kept as empty array but not used
    mines: [],
    droneBullets: [],
    isRunning: false,
    mode: 'explore',
    animationId: null,

    // Methods will be added below
    setDroneCommand: function(cmd) {
        if (this.player) {
            this.player.setDroneCommand(cmd);
        }
    }
};

// Copy all methods from the modules
Object.assign(Game, GameInit);
Object.assign(Game, GameLoop);
Object.assign(Game, GameInputHandler);
Object.assign(Game, GameCollisions);

// Override start - NO POWERUPS
Game.start = function(mode) {
    console.log('🎮 Starting game with mode:', mode);
    console.log('📦 Selected ship:', GameData.getSelectedShip());
    
    this.isRunning = true;
    this.mode = mode;
    
    const shipData = SHIPS.find(s => s.id === GameData.getSelectedShip());
    console.log('🚀 Ship data:', shipData);
    
    if (!shipData) {
        console.warn('⚠️ Ship not found, using default');
        this.player = new Player(mapWidth / 2, mapHeight / 2, SHIPS[0]);
    } else {
        this.player = new Player(mapWidth / 2, mapHeight / 2, shipData);
    }
    
    console.log('👤 Player created:', this.player);
    
    this.droneBullets = [];
    generateBackground();
    this.generateAsteroids();
    this.generateEnemies(mode);
    // REMOVED: generatePowerUps
    
    this.mines = [];
    camera.x = this.player.x;
    camera.y = this.player.y;
    camera.zoom = 1;
    
    console.log('✅ Game initialized, starting loop...');
    
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.loop();
};

// Override loop - NO POWERUPS
Game.loop = function() {
    if (!this.isRunning) return;
    
    // Apply recoil shake to camera
    let shakeX = 0;
    let shakeY = 0;
    if (this.player && this.player.recoilShake > 0) {
        shakeX = (Math.random() - 0.5) * this.player.recoilShake * 1.5;
        shakeY = (Math.random() - 0.5) * this.player.recoilShake * 1.5;
    }
    
    if (this.player && this.player.alive) {
        camera.x += (this.player.x - camera.x) * 0.1 + shakeX;
        camera.y += (this.player.y - camera.y) * 0.1 + shakeY;
    }
    camera.zoom = 1;
    ctx.clearRect(0, 0, W, H);
    drawBackground(ctx, camera.x, camera.y, camera.zoom);

    if (this.player) {
        this.player.update();
        this.enemies.forEach(e => e.update(this.player));
    } else {
        this.enemies.forEach(e => e.update(null));
    }
    this.asteroids.forEach(a => a.update());

    // Update mines
    this.updateMines();

    this.handleInput();
    this.checkCollisions();

    // Draw everything
    this.drawAll();
    
    // UI Updates
    if (this.player) {
        GUI.updateHUD(this.player, this.enemies);
        GUI.updateMinimap(this.player, this.enemies, [], this.asteroids);
        if (!this.player.alive) this.gameOver();
    }
    this.animationId = requestAnimationFrame(() => this.loop());
};

// Override drawAll - NO POWERUPS
Game.drawAll = function() {
    this.asteroids.forEach(a => a.draw(ctx, camera.x, camera.y, camera.zoom));
    this.enemies.forEach(e => e.alive && e.draw(ctx, camera.x, camera.y, camera.zoom));
    if (this.player) this.player.draw(ctx, camera.x, camera.y, camera.zoom);

    // Mines
    this.mines.forEach(m => {
        const sx = m.x - camera.x + W / 2 / camera.zoom;
        const sy = m.y - camera.y + H / 2 / camera.zoom;
        ctx.fillStyle = m.armed ? '#f0f' : '#f80';
        ctx.beginPath();
        ctx.arc(sx * camera.zoom, sy * camera.zoom, m.size * camera.zoom, 0, Math.PI * 2);
        ctx.fill();
    });

    updateParticles();
    drawParticles(ctx, camera.x, camera.y, camera.zoom);

    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 3;
    ctx.strokeRect(
        (-camera.x + W / 2 / camera.zoom) * camera.zoom,
        (-camera.y + H / 2 / camera.zoom) * camera.zoom,
        mapWidth * camera.zoom,
        mapHeight * camera.zoom
    );

    if (this.player) {
        const cd = this.player.abilityCooldown / 120;
        if (cd > 0) {
            ctx.fillStyle = 'rgba(0,255,255,0.3)';
            ctx.fillRect(W / 2 - 20, H - 80, 40, 6);
            ctx.fillStyle = 'rgba(0,255,255,0.8)';
            ctx.fillRect(W / 2 - 20, H - 80, 40 * (1 - cd), 6);
        }
    }
};

// Override gameOver
Game.gameOver = function() {
    this.isRunning = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f00';
    ctx.font = '48px Orbitron, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 80);
    ctx.fillStyle = '#fff';
    ctx.font = '24px Orbitron, Arial';
    const score = this.player ? this.player.score : 0;
    const kills = this.player ? this.player.kills : 0;
    ctx.fillText(`Score: ${score} | Kills: ${kills}`, W / 2, H / 2 - 20);
    ctx.fillStyle = '#ffaa00';
    ctx.font = '20px Orbitron, Arial';
    ctx.fillText(`Qubits Earned: ${GameData.getQubits()}`, W / 2, H / 2 + 30);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Orbitron, Arial';
    ctx.fillText('Press R to restart or ESC for menu', W / 2, H / 2 + 80);
    
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText('Created by Clint Johnryl Henon Dagno', W / 2, H / 2 + 130);
    
    const h = (e) => {
        if (e.code === 'KeyR') {
            window.removeEventListener('keydown', h);
            GUI.startGame(this.mode);
        } else if (e.code === 'Escape') {
            window.removeEventListener('keydown', h);
            location.reload();
        }
    };
    window.addEventListener('keydown', h);
};

// Export the Game object
window.Game = Game;

console.log('✅ Game object loaded successfully!');
console.log('📦 Powerups have been completely removed!');
console.log('📦 Game modules combined:');
console.log('  - GameCore');
console.log('  - GameInit');
console.log('  - GameLoop');
console.log('  - GameInputHandler');
console.log('  - GameCollisions');