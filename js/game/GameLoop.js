// ===== GAME LOOP =====

const GameLoop = {
    updateMines() {
        this.mines.forEach(m => {
            m.timer--;
            if (m.timer <= 0 && !m.armed) {
                m.armed = true;
                if (m.owner === 'enemy' && this.player && this.player.alive &&
                    Math.sqrt((this.player.x - m.x) ** 2 + (this.player.y - m.y) ** 2) < 100) {
                    this.player.takeDamage(m.damage || 40);
                }
                if (m.owner === 'player') {
                    for (const e of this.enemies) {
                        if (e.alive && Math.sqrt((e.x - m.x) ** 2 + (e.y - m.y) ** 2) < 80) {
                            e.takeDamage(m.damage || 6);
                            if (!e.alive) {
                                spawnExplosion(e.x + e.size / 2, e.y + e.size / 2, e.color, e.isBoss ? 50 : e.isElite ? 30 : 20);
                                if (this.player) {
                                    const bonus = e.isBoss ? 500 : e.isElite ? 200 : 100;
                                    this.player.score += bonus;
                                    this.player.kills++;
                                    this.player.combo = (this.player.combo || 0) + 1;
                                    this.player.comboTimer = 120;
                                    GameData.addQubits(e.isBoss ? 50 : e.isElite ? 25 : 10);
                                    GameData.addXP(e.isBoss ? 30 : e.isElite ? 15 : 5);
                                }
                            }
                        }
                    }
                }
                spawnExplosion(m.x, m.y, '#f0f', 20);
            }
        });
        this.mines = this.mines.filter(m => m.timer > -30);
    },

    loop() {
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

        // REMOVED: spawnPowerUp - completely removed
        // REMOVED: spawnEnemy - completely removed

        // Draw everything
        this.drawAll();
        
        // UI Updates
        if (this.player) {
            GUI.updateHUD(this.player, this.enemies);
            GUI.updateMinimap(this.player, this.enemies, [], this.asteroids);
            if (!this.player.alive) this.gameOver();
        }
        this.animationId = requestAnimationFrame(() => this.loop());
    },

    drawAll() {
        this.asteroids.forEach(a => a.draw(ctx, camera.x, camera.y, camera.zoom));
        // REMOVED: powerups drawing
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
    },

    gameOver() {
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
    },

    // In the spawnEnemy method, add:
    spawnEnemy() {
    const maxEnemies = this.mode === 'horde' ? 60 : 35;
    if (this.enemies.filter(e => e.alive).length < maxEnemies) {
        // ... existing code ...
        
        const enemy = new AIEnemy(
            Math.max(50, Math.min(mapWidth - 50, this.player.x + Math.cos(a) * d)),
            Math.max(50, Math.min(mapHeight - 50, this.player.y + Math.sin(a) * d)),
            type
        );
        this.enemies.push(enemy);
        
        if (typeof Audio !== 'undefined' && Audio) {
            Audio.playEnemySpawn(0.15);
        }
    }
}
};