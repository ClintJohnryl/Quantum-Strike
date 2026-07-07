// ===== MAIN GAME CLASS =====

const Game = {
    player: null,
    enemies: [],
    asteroids: [],
    powerups: [],
    mines: [],
    droneBullets: [],

    setDroneCommand(cmd) {
        if (this.player) {
            this.player.setDroneCommand(cmd);
        }
    },

    start(mode) {
        console.log('🎮 Starting game with mode:', mode);
        console.log('📦 Selected ship:', GameData.getSelectedShip());
        
        gameRunning = true;
        gameMode = mode;
        
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
        this.generatePowerUps();
        
        this.mines = [];
        camera.x = this.player.x;
        camera.y = this.player.y;
        camera.zoom = 1;
        
        console.log('✅ Game initialized, starting loop...');
        
        if (animationId) cancelAnimationFrame(animationId);
        this.loop();
    },

    generateAsteroids() {
        this.asteroids = [];
        const count = Math.floor((mapWidth * mapHeight) / 50000);
        for (let i = 0; i < count; i++) {
            this.asteroids.push(new Asteroid(Math.random() * mapWidth, Math.random() * mapHeight, Math.random() * 40 + 20));
        }
    },

    generateEnemies(mode) {
        this.enemies = [];
        const diff = GameData.getDifficulty();
        const diffMult = diff === 'easy' ? 0.7 : 
                        diff === 'hard' ? 1.8 : 
                        diff === 'insane' ? 3.0 : 
                        diff === 'nightmare' ? 4.5 : 1;
        
        const basicTypes = ['scout', 'fighter', 'tank', 'sniper', 'bomber', 'swarm', 'shield'];
        const eliteTypes = ['elite_scout', 'elite_fighter', 'elite_tank'];
        const bossTypes = ['boss_standard', 'boss_heavy', 'boss_ancient'];
        
        let count = 0;
        let typePool = [];
        
        switch(mode) {
            case 'explore':
                count = Math.floor(10 * diffMult);
                typePool = basicTypes;
                break;
            case 'survival':
                count = Math.floor(20 * diffMult);
                typePool = [...basicTypes, ...eliteTypes];
                break;
            case 'horde':
                count = Math.floor(40 * diffMult);
                typePool = [...basicTypes, ...basicTypes, ...eliteTypes];
                break;
            case 'boss':
                count = Math.floor(8 * diffMult);
                typePool = [...basicTypes, ...eliteTypes];
                break;
            default:
                count = Math.floor(10 * diffMult);
                typePool = basicTypes;
        }
        
        for (let i = 0; i < count; i++) {
            let type = typePool[Math.floor(Math.random() * typePool.length)];
            if (Math.random() < 0.1 && mode !== 'boss') {
                type = eliteTypes[Math.floor(Math.random() * eliteTypes.length)];
            }
            this.enemies.push(new AIEnemy(
                Math.random() * mapWidth,
                Math.random() * mapHeight,
                type
            ));
        }
        
        if (mode === 'boss') {
            for (let i = 0; i < Math.min(3, 1 + Math.floor(diffMult)); i++) {
                const bossType = bossTypes[i % bossTypes.length];
                this.enemies.push(new AIEnemy(
                    mapWidth * (0.2 + i * 0.3),
                    mapHeight * (0.3 + Math.random() * 0.4),
                    bossType
                ));
            }
        }
        
        if (mode === 'horde') {
            for (let i = 0; i < Math.min(5, 2 + Math.floor(diffMult)); i++) {
                const eliteType = eliteTypes[i % eliteTypes.length];
                this.enemies.push(new AIEnemy(
                    mapWidth * (0.1 + Math.random() * 0.8),
                    mapHeight * (0.1 + Math.random() * 0.8),
                    eliteType
                ));
            }
        }
    },

    generatePowerUps() {
        this.powerups = [];
        const types = ['health', 'shield', 'speed', 'spread', 'qubits', 'bomb', 'health_big'];
        for (let i = 0; i < 40; i++) {
            this.powerups.push(new PowerUp(
                Math.random() * mapWidth,
                Math.random() * mapHeight,
                types[Math.floor(Math.random() * types.length)]
            ));
        }
    },

    spawnPowerUp() {
        if (this.powerups.length < 30 && Math.random() < 0.015) {
            const types = ['health', 'shield', 'speed', 'spread', 'qubits', 'bomb', 'health_big'];
            this.powerups.push(new PowerUp(
                this.player.x + (Math.random() - 0.5) * 1000,
                this.player.y + (Math.random() - 0.5) * 1000,
                types[Math.floor(Math.random() * types.length)]
            ));
        }
    },

    spawnEnemy() {
        const maxEnemies = gameMode === 'horde' ? 60 : 35;
        if (this.enemies.filter(e => e.alive).length < maxEnemies) {
            const a = Math.random() * Math.PI * 2;
            const d = 800 + Math.random() * 400;
            
            let type;
            const roll = Math.random();
            if (roll < 0.05 && gameMode === 'horde') {
                type = 'elite_scout';
            } else if (roll < 0.02 && gameMode !== 'explore') {
                type = 'elite_fighter';
            } else if (roll < 0.01 && gameMode === 'boss') {
                type = 'boss_standard';
            } else if (roll < 0.08) {
                type = 'shield';
            } else if (roll < 0.15) {
                type = 'bomber';
            } else if (roll < 0.22) {
                type = 'sniper';
            } else if (roll < 0.30) {
                type = 'swarm';
            } else if (roll < 0.45) {
                type = 'tank';
            } else if (roll < 0.65) {
                type = 'fighter';
            } else {
                type = 'scout';
            }
            
            this.enemies.push(new AIEnemy(
                Math.max(50, Math.min(mapWidth - 50, this.player.x + Math.cos(a) * d)),
                Math.max(50, Math.min(mapHeight - 50, this.player.y + Math.sin(a) * d)),
                type
            ));
        }
    },

    loop() {
        if (!gameRunning) return;
        
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
        this.powerups.forEach(p => p.update());

        // Mines
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

        this.handleInput();
        this.checkCollisions();

        this.spawnPowerUp();
        if ((gameMode === 'survival' || gameMode === 'horde') && Math.random() < (gameMode === 'horde' ? 0.05 : 0.02)) {
            this.spawnEnemy();
        }

        // Draw everything
        this.asteroids.forEach(a => a.draw(ctx, camera.x, camera.y, camera.zoom));
        this.powerups.forEach(p => p.timer > 0 && p.draw(ctx, camera.x, camera.y, camera.zoom));
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

        if (this.player) {
            GUI.updateHUD(this.player, this.enemies);
            GUI.updateMinimap(this.player, this.enemies, this.powerups, this.asteroids);
            if (!this.player.alive) this.gameOver();
        }
        animationId = requestAnimationFrame(() => this.loop());
    },

    handleInput() {
        if (!this.player) return;
        const k = GameInput.keys;
        
        // Debug - log key presses
        // console.log('Thrust:', k[KEYBINDS.thrust] || k['ArrowUp']);
        // console.log('Reverse:', k[KEYBINDS.reverse] || k['ArrowDown']);
        
        // Thrust/Reverse (W/S or Up/Down)
        this.player.thrusting = k[KEYBINDS.thrust] || k['ArrowUp'];
        this.player.reversing = k[KEYBINDS.reverse] || k['ArrowDown'];
        
        // Rotation (A/D - rotate left/right)
        this.player.rotatingLeft = k[KEYBINDS.left];
        this.player.rotatingRight = k[KEYBINDS.right];
        
        // Strafe (Left/Right Arrow keys)
        this.player.strafingLeft = k['ArrowLeft'] && !k[KEYBINDS.left];
        this.player.strafingRight = k['ArrowRight'] && !k[KEYBINDS.right];
        
        // Weapons
        if (k[KEYBINDS.primary]) this.player.shoot();
        if (k[KEYBINDS.secondary]) this.player.shootSecondary();
        if (k[KEYBINDS.autocannon]) this.player.toggleAuto();
        if (k[KEYBINDS.drones]) this.player.launchDrones();
        if (k[KEYBINDS.ability]) this.player.useAbility();
    },
    checkCollisions() {
        if (!this.player) return;
        const p = this.player;

        // Primary bullets
        for (let i = p.bullets.length - 1; i >= 0; i--) {
            const b = p.bullets[i];
            let hit = false;
            
            // Heavy Railgun: Vaporize everything in a line
            if (b.heavyRailgun) {
                for (const enemy of this.enemies) {
                    if (!enemy.alive) continue;
                    const dx = enemy.x + enemy.size/2 - b.x;
                    const dy = enemy.y + enemy.size/2 - b.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 150) {
                        enemy.takeDamage(b.damage);
                        spawnExplosion(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#ff44ff', 60);
                        spawnExplosion(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#ffffff', 30);
                        if (!enemy.alive) {
                            const bonus = enemy.isBoss ? 500 : enemy.isElite ? 200 : 100;
                            p.score += bonus;
                            p.kills++;
                            p.combo = (p.combo || 0) + 1;
                            p.comboTimer = 120;
                            GameData.addQubits(enemy.isBoss ? 50 : enemy.isElite ? 25 : 10);
                            GameData.addXP(enemy.isBoss ? 30 : enemy.isElite ? 15 : 5);
                        }
                    }
                }
                
                for (const a of this.asteroids) {
                    if (!a.alive) continue;
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 150) {
                        spawnExplosion(a.x, a.y, '#ff44ff', 30);
                        a.alive = false;
                        if (a.size > 25) {
                            for (let j = 0; j < 2; j++) {
                                this.asteroids.push(new Asteroid(
                                    a.x + (Math.random() - 0.5) * 20,
                                    a.y + (Math.random() - 0.5) * 20,
                                    a.size * 0.5
                                ));
                            }
                        }
                    }
                }
                
                if (b.life <= 0 || b.x < -200 || b.x > mapWidth + 200 || b.y < -200 || b.y > mapHeight + 200) {
                    spawnExplosion(b.x, b.y, '#ff44ff', 50);
                    spawnExplosion(b.x, b.y, '#ffffff', 25);
                    p.bullets.splice(i, 1);
                }
                continue;
            }
            
            // Normal primary bullet collision with enemies
            for (const enemy of this.enemies) {
                if (enemy.alive && checkCollision({ x: b.x, y: b.y, size: b.size }, enemy, enemy.size / 2 + 5)) {
                    enemy.takeDamage(b.damage);
                    if (!enemy.alive) {
                        spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color, enemy.isBoss ? 50 : enemy.isElite ? 30 : 20);
                        const bonus = enemy.isBoss ? 500 : enemy.isElite ? 200 : 100;
                        p.score += bonus;
                        p.kills++;
                        p.combo = (p.combo || 0) + 1;
                        p.comboTimer = 120;
                        GameData.addQubits(enemy.isBoss ? 50 : enemy.isElite ? 25 : 10);
                        GameData.addXP(enemy.isBoss ? 30 : enemy.isElite ? 15 : 5);
                        if (b.lifesteal) {
                            p.hp = Math.min(p.maxHp, p.hp + b.damage * b.lifesteal);
                        }
                    }
                    if (!b.piercing) { hit = true; break; }
                }
            }
            
            // Primary bullet collision with asteroids
            if (!hit) {
                for (const a of this.asteroids) {
                    if (a.alive && checkCollision({ x: b.x, y: b.y, size: b.size }, a, a.size)) {
                        spawnExplosion(b.x, b.y, '#888', 10);
                        if (a.size > 25) {
                            for (let j = 0; j < 2; j++) {
                                this.asteroids.push(new Asteroid(
                                    a.x + (Math.random() - 0.5) * 20,
                                    a.y + (Math.random() - 0.5) * 20,
                                    a.size * 0.5
                                ));
                            }
                        }
                        a.alive = false;
                        if (!b.piercing) { hit = true; break; }
                    }
                }
            }
            
            // Explosive bullet explosion
            if (b.explosive && !hit && (b.life <= 1 || b.x <= 0 || b.x >= mapWidth || b.y <= 0 || b.y >= mapHeight)) {
                spawnExplosion(b.x, b.y, '#f60', 25);
                for (const enemy of this.enemies) {
                    if (enemy.alive && Math.sqrt((enemy.x + enemy.size / 2 - b.x) ** 2 + (enemy.y + enemy.size / 2 - b.y) ** 2) < b.explosionRadius) {
                        enemy.takeDamage(b.damage * 2);
                        if (!enemy.alive) {
                            spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color, enemy.isBoss ? 50 : enemy.isElite ? 30 : 20);
                            const bonus = enemy.isBoss ? 500 : enemy.isElite ? 200 : 100;
                            p.score += bonus;
                            p.kills++;
                            p.combo = (p.combo || 0) + 1;
                            p.comboTimer = 120;
                            GameData.addQubits(enemy.isBoss ? 50 : enemy.isElite ? 25 : 10);
                            GameData.addXP(enemy.isBoss ? 30 : enemy.isElite ? 15 : 5);
                        }
                    }
                }
                for (const a of this.asteroids) {
                    if (a.alive && Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) < b.explosionRadius) {
                        spawnExplosion(a.x, a.y, '#888', 15);
                        if (a.size > 25) {
                            for (let j = 0; j < 2; j++) {
                                this.asteroids.push(new Asteroid(
                                    a.x + (Math.random() - 0.5) * 20,
                                    a.y + (Math.random() - 0.5) * 20,
                                    a.size * 0.5
                                ));
                            }
                        }
                        a.alive = false;
                    }
                }
                hit = true;
            }
            if (hit) p.bullets.splice(i, 1);
        }

        // Enemy bullets
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            for (let i = enemy.bullets.length - 1; i >= 0; i--) {
                const b = enemy.bullets[i];
                let hit = false;
                if (b.targetIsDrone && p.drones) {
                    for (const d of p.drones) {
                        if (d.alive && checkCollision({ x: b.x, y: b.y, size: 3 }, d, d.size / 2)) {
                            d.takeDamage(b.damage);
                            hit = true;
                            break;
                        }
                    }
                }
                if (!hit) {
                    for (const a of this.asteroids) {
                        if (a.alive && checkCollision({ x: b.x, y: b.y, size: 3 }, a, a.size)) {
                            hit = true;
                            spawnExplosion(b.x, b.y, '#888', 8);
                            if (a.size > 25) {
                                for (let j = 0; j < 2; j++) {
                                    this.asteroids.push(new Asteroid(
                                        a.x + (Math.random() - 0.5) * 20,
                                        a.y + (Math.random() - 0.5) * 20,
                                        a.size * 0.5
                                    ));
                                }
                            }
                            a.alive = false;
                            break;
                        }
                    }
                }
                if (hit) enemy.bullets.splice(i, 1);
            }
            for (let i = enemy.bullets.length - 1; i >= 0; i--) {
                if (p.alive && !enemy.bullets[i].targetIsDrone &&
                    checkCollision({ x: enemy.bullets[i].x, y: enemy.bullets[i].y, size: 4 }, p, p.size / 2)) {
                    p.takeDamage(enemy.bullets[i].damage);
                    enemy.bullets.splice(i, 1);
                }
            }
        }

        // Secondary bullets
        for (let i = p.secondaryBullets.length - 1; i >= 0; i--) {
            const b = p.secondaryBullets[i];
            let hit = false;
            for (const enemy of this.enemies) {
                if (!enemy.alive) continue;
                if (checkCollision({ x: b.x, y: b.y, size: b.size || 6 }, enemy, enemy.size / 2 + 5)) {
                    enemy.takeDamage(b.damage);
                    if (!enemy.alive) {
                        spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color, enemy.isBoss ? 50 : enemy.isElite ? 30 : 20);
                        const bonus = enemy.isBoss ? 500 : enemy.isElite ? 200 : 100;
                        p.score += bonus;
                        p.kills++;
                        p.combo = (p.combo || 0) + 1;
                        p.comboTimer = 120;
                        GameData.addQubits(enemy.isBoss ? 50 : enemy.isElite ? 25 : 10);
                        GameData.addXP(enemy.isBoss ? 30 : enemy.isElite ? 15 : 5);
                    }
                    if (b.explosive) {
                        spawnExplosion(b.x, b.y, '#f60', 25);
                        for (const e of this.enemies) {
                            if (e.alive && Math.sqrt((e.x + e.size / 2 - b.x) ** 2 + (e.y + e.size / 2 - b.y) ** 2) < (b.explosionRadius || 80)) {
                                e.takeDamage(b.damage * 2);
                                if (!e.alive) {
                                    spawnExplosion(e.x + e.size / 2, e.y + e.size / 2, e.color, e.isBoss ? 50 : e.isElite ? 30 : 20);
                                    const bonus = e.isBoss ? 500 : e.isElite ? 200 : 100;
                                    p.score += bonus;
                                    p.kills++;
                                    p.combo = (p.combo || 0) + 1;
                                    p.comboTimer = 120;
                                    GameData.addQubits(e.isBoss ? 50 : e.isElite ? 25 : 10);
                                    GameData.addXP(e.isBoss ? 30 : e.isElite ? 15 : 5);
                                }
                            }
                        }
                        for (const a of this.asteroids) {
                            if (a.alive && Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) < (b.explosionRadius || 80)) {
                                spawnExplosion(a.x, a.y, '#888', 15);
                                if (a.size > 25) {
                                    for (let j = 0; j < 2; j++) {
                                        this.asteroids.push(new Asteroid(
                                            a.x + (Math.random() - 0.5) * 20,
                                            a.y + (Math.random() - 0.5) * 20,
                                            a.size * 0.5
                                        ));
                                    }
                                }
                                a.alive = false;
                            }
                        }
                    }
                    hit = true;
                    break;
                }
            }
            if (!hit) {
                for (const a of this.asteroids) {
                    if (a.alive && checkCollision({ x: b.x, y: b.y, size: b.size || 6 }, a, a.size)) {
                        spawnExplosion(b.x, b.y, '#888', 10);
                        if (a.size > 25) {
                            for (let j = 0; j < 2; j++) {
                                this.asteroids.push(new Asteroid(
                                    a.x + (Math.random() - 0.5) * 20,
                                    a.y + (Math.random() - 0.5) * 20,
                                    a.size * 0.5
                                ));
                            }
                        }
                        a.alive = false;
                        hit = true;
                        break;
                    }
                }
            }
            if (hit) { p.secondaryBullets.splice(i, 1); continue; }
            if (b.explosive && (b.life <= 1 || b.x <= 0 || b.x >= mapWidth || b.y <= 0 || b.y >= mapHeight)) {
                spawnExplosion(b.x, b.y, '#f60', 25);
                for (const enemy of this.enemies) {
                    if (enemy.alive && Math.sqrt((enemy.x + enemy.size / 2 - b.x) ** 2 + (enemy.y + enemy.size / 2 - b.y) ** 2) < (b.explosionRadius || 80)) {
                        enemy.takeDamage(b.damage * 2);
                        if (!enemy.alive) {
                            spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color, enemy.isBoss ? 50 : enemy.isElite ? 30 : 20);
                            const bonus = enemy.isBoss ? 500 : enemy.isElite ? 200 : 100;
                            p.score += bonus;
                            p.kills++;
                            p.combo = (p.combo || 0) + 1;
                            p.comboTimer = 120;
                            GameData.addQubits(enemy.isBoss ? 50 : enemy.isElite ? 25 : 10);
                            GameData.addXP(enemy.isBoss ? 30 : enemy.isElite ? 15 : 5);
                        }
                    }
                }
                for (const a of this.asteroids) {
                    if (a.alive && Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) < (b.explosionRadius || 80)) {
                        spawnExplosion(a.x, a.y, '#888', 15);
                        if (a.size > 25) {
                            for (let j = 0; j < 2; j++) {
                                this.asteroids.push(new Asteroid(
                                    a.x + (Math.random() - 0.5) * 20,
                                    a.y + (Math.random() - 0.5) * 20,
                                    a.size * 0.5
                                ));
                            }
                        }
                        a.alive = false;
                    }
                }
                p.secondaryBullets.splice(i, 1);
            }
        }

        // Auto-cannon bullets
        for (let i = p.autocannonBullets.length - 1; i >= 0; i--) {
            const b = p.autocannonBullets[i];
            let hit = false;
            for (const enemy of this.enemies) {
                if (!enemy.alive) continue;
                if (checkCollision({ x: b.x, y: b.y, size: b.size || 5 }, enemy, enemy.size / 2 + 5)) {
                    enemy.takeDamage(b.damage);
                    if (!enemy.alive) {
                        spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color, enemy.isBoss ? 50 : enemy.isElite ? 30 : 20);
                        const bonus = enemy.isBoss ? 500 : enemy.isElite ? 200 : 100;
                        p.score += bonus;
                        p.kills++;
                        p.combo = (p.combo || 0) + 1;
                        p.comboTimer = 120;
                        GameData.addQubits(enemy.isBoss ? 50 : enemy.isElite ? 25 : 10);
                        GameData.addXP(enemy.isBoss ? 30 : enemy.isElite ? 15 : 5);
                    }
                    hit = true;
                    break;
                }
            }
            if (!hit) {
                for (const a of this.asteroids) {
                    if (a.alive && checkCollision({ x: b.x, y: b.y, size: b.size || 5 }, a, a.size)) {
                        spawnExplosion(b.x, b.y, '#888', 8);
                        if (a.size > 25) {
                            for (let j = 0; j < 2; j++) {
                                this.asteroids.push(new Asteroid(
                                    a.x + (Math.random() - 0.5) * 20,
                                    a.y + (Math.random() - 0.5) * 20,
                                    a.size * 0.5
                                ));
                            }
                        }
                        a.alive = false;
                        hit = true;
                        break;
                    }
                }
            }
            if (hit) { p.autocannonBullets.splice(i, 1); continue; }
            if (b.x <= 0 || b.x >= mapWidth || b.y <= 0 || b.y >= mapHeight || b.life <= 0) {
                p.autocannonBullets.splice(i, 1);
            }
        }

        // Drone bullets
        for (let i = this.droneBullets.length - 1; i >= 0; i--) {
            const b = this.droneBullets[i];
            let hit = false;
            for (const enemy of this.enemies) {
                if (!enemy.alive) continue;
                if (checkCollision({ x: b.x, y: b.y, size: b.size || 3 }, enemy, enemy.size / 2 + 5)) {
                    enemy.takeDamage(b.damage);
                    if (!enemy.alive) {
                        spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color, enemy.isBoss ? 50 : enemy.isElite ? 30 : 20);
                        const bonus = enemy.isBoss ? 500 : enemy.isElite ? 200 : 100;
                        p.score += bonus;
                        p.kills++;
                        p.combo = (p.combo || 0) + 1;
                        p.comboTimer = 120;
                        GameData.addQubits(enemy.isBoss ? 50 : enemy.isElite ? 25 : 10);
                        GameData.addXP(enemy.isBoss ? 30 : enemy.isElite ? 15 : 5);
                    }
                    hit = true;
                    break;
                }
            }
            if (!hit) {
                for (const a of this.asteroids) {
                    if (a.alive && checkCollision({ x: b.x, y: b.y, size: b.size || 3 }, a, a.size)) {
                        spawnExplosion(b.x, b.y, '#888', 6);
                        if (a.size > 25) {
                            for (let j = 0; j < 2; j++) {
                                this.asteroids.push(new Asteroid(
                                    a.x + (Math.random() - 0.5) * 20,
                                    a.y + (Math.random() - 0.5) * 20,
                                    a.size * 0.5
                                ));
                            }
                        }
                        a.alive = false;
                        hit = true;
                        break;
                    }
                }
            }
            if (hit || b.life <= 0 || b.x < 0 || b.x > mapWidth || b.y < 0 || b.y > mapHeight) {
                this.droneBullets.splice(i, 1);
            }
        }

        // Powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            if (checkCollision(p, this.powerups[i], 40)) {
                const pu = this.powerups[i];
                switch (pu.type) {
                    case 'health':
                        p.hp = Math.min(p.maxHp, p.hp + 30);
                        break;
                    case 'health_big':
                        p.hp = Math.min(p.maxHp, p.hp + 80);
                        spawnExplosion(pu.x, pu.y, '#00ff88', 15);
                        break;
                    case 'shield':
                        p.shieldActive = true;
                        p.shieldTimer = 300;
                        p.activePowerups.push({ type: 'shield', color: '#0ff', icon: '🛡️' });
                        break;
                    case 'speed':
                        p.speedBoost = 1.8;
                        p.speedTimer = 300;
                        p.activePowerups.push({ type: 'speed', color: '#ff0', icon: '⚡' });
                        break;
                    case 'spread':
                        p.spreadShot = true;
                        p.spreadTimer = 300;
                        p.activePowerups.push({ type: 'spread', color: '#f0f', icon: '✧' });
                        break;
                    case 'qubits':
                        GameData.addQubits(35);
                        break;
                    case 'bomb':
                        for (const e of this.enemies) {
                            if (e.alive) {
                                e.alive = false;
                                spawnExplosion(e.x + e.size / 2, e.y + e.size / 2, e.color, e.isBoss ? 50 : e.isElite ? 30 : 20);
                                const bonus = e.isBoss ? 500 : e.isElite ? 200 : 100;
                                p.score += bonus;
                                p.kills++;
                                GameData.addQubits(e.isBoss ? 50 : e.isElite ? 25 : 10);
                                GameData.addXP(e.isBoss ? 30 : e.isElite ? 15 : 5);
                            }
                        }
                        for (const a of this.asteroids) {
                            if (a.alive) {
                                spawnExplosion(a.x, a.y, '#888', 20);
                                a.alive = false;
                            }
                        }
                        spawnExplosion(pu.x, pu.y, '#ff4400', 50);
                        break;
                }
                this.powerups.splice(i, 1);
                spawnExplosion(pu.x, pu.y, pu.color, 8);
            }
        }

        // ===== ASTEROIDS VS PLAYER - NEWTONIAN PHYSICS WITH KINETIC ENERGY DAMAGE =====
        for (const a of this.asteroids) {
            if (a.alive && checkCollision(p, a, a.size / 2 + p.size / 2 - 5)) {
                // Get ship mass and velocity
                const shipMass = p.shipData.stats.weight || 1000;
                const shipVx = p.vx;
                const shipVy = p.vy;
                const shipSpeed = Math.sqrt(shipVx * shipVx + shipVy * shipVy);
                
                // Asteroid mass and velocity
                const asteroidMass = a.mass || (a.size * a.size / 4);
                const asteroidVx = a.vx;
                const asteroidVy = a.vy;
                const asteroidSpeed = Math.sqrt(asteroidVx * asteroidVx + asteroidVy * asteroidVy);
                
                // Calculate collision normal
                const dx = p.x - a.x;
                const dy = p.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = dx / dist;  // Normal unit vector
                const ny = dy / dist;
                
                // Relative velocity along normal
                const relativeVx = shipVx - asteroidVx;
                const relativeVy = shipVy - asteroidVy;
                const relativeVn = relativeVx * nx + relativeVy * ny;
                
                // Only resolve if objects are approaching
                if (relativeVn < 0) {
                    // === CALCULATE KINETIC ENERGY DAMAGE ===
                    // Kinetic Energy = 1/2 * m * v^2
                    // Using relative velocity for impact energy
                    const impactVelocity = Math.abs(relativeVn);
                    const kineticEnergy = 0.5 * shipMass * impactVelocity * impactVelocity / 100000;
                    
                    // Scale damage based on:
                    // 1. Kinetic energy (primary factor)
                    // 2. Asteroid size (larger asteroids do more damage)
                    // 3. Ship weight multiplier (heavier ships take less damage per energy)
                    const weightReduction = Math.max(0.3, Math.min(0.9, 800 / shipMass));
                    const asteroidSizeMultiplier = 0.5 + (a.size / 80);
                    
                    // Calculate final damage
                    let damage = kineticEnergy * 2 * asteroidSizeMultiplier * weightReduction;
                    
                    // Clamp damage to reasonable values
                    damage = Math.max(1, Math.min(25, damage));
                    
                    // Apply damage to player
                    p.takeDamage(damage);
                    
                    // === PHYSICS RESPONSE (Conservation of Momentum) ===
                    const restitution = 0.3; // Coefficient of restitution (bounciness)
                    
                    // Impulse magnitude
                    const impulse = -(1 + restitution) * relativeVn / (1/shipMass + 1/asteroidMass);
                    
                    // Apply impulse to ship (Newton's Second Law: F = ma)
                    const impulseX = impulse * nx;
                    const impulseY = impulse * ny;
                    p.vx += impulseX / shipMass;
                    p.vy += impulseY / shipMass;
                    
                    // Apply equal and opposite impulse to asteroid (Newton's Third Law)
                    a.vx -= impulseX / asteroidMass;
                    a.vy -= impulseY / asteroidMass;
                    
                    // Transfer angular momentum to asteroid
                    const impactForce = Math.abs(impulse) / 1000;
                    a.rotationSpeed += (Math.random() - 0.5) * 0.03 * Math.min(2, impactForce);
                    
                    // Visual feedback based on impact energy
                    const particleCount = Math.min(30, 10 + Math.floor(kineticEnergy * 2));
                    spawnExplosion(a.x, a.y, '#ff8800', particleCount);
                    
                    // Debug (uncomment to see values)
                    // console.log(`⚡ Impact: KE=${kineticEnergy.toFixed(1)}, Damage=${damage.toFixed(1)}, Speed=${impactVelocity.toFixed(1)}`);
                }
            }
        }

        // Enemies vs player
        for (const e of this.enemies) {
            if (e.alive && checkCollision(p, e, p.size / 2 + e.size / 2 - 5)) {
                p.takeDamage(20);
                const dx = p.x - e.x;
                const dy = p.y - e.y;
                const d = Math.sqrt(dx * dx + dy * dy) || 1;
                p.vx += (dx / d) * 5;
                p.vy += (dy / d) * 5;
            }
        }

        // Drones vs enemies
        if (p.drones) {
            for (const d of p.drones) {
                if (!d.alive) continue;
                for (const e of this.enemies) {
                    if (e.alive && checkCollision(d, e, d.size / 2 + e.size / 2 - 5)) {
                        const dx = d.x - e.x;
                        const dy = d.y - e.y;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const push = 0.3 / (dist + 1);
                        d.vx += dx * push;
                        d.vy += dy * push;
                        e.vx -= dx * push * 0.5;
                        e.vy -= dy * push * 0.5;
                        d.takeDamage(5);
                        e.takeDamage(5);
                        if (!e.alive) {
                            spawnExplosion(e.x + e.size / 2, e.y + e.size / 2, e.color, e.isBoss ? 50 : e.isElite ? 30 : 20);
                            const bonus = e.isBoss ? 500 : e.isElite ? 200 : 100;
                            p.score += bonus;
                            p.kills++;
                            p.combo = (p.combo || 0) + 1;
                            p.comboTimer = 120;
                            GameData.addQubits(e.isBoss ? 50 : e.isElite ? 25 : 10);
                            GameData.addXP(e.isBoss ? 30 : e.isElite ? 15 : 5);
                        }
                        break;
                    }
                }
            }
        }
    },

    gameOver() {
        gameRunning = false;
        if (animationId) cancelAnimationFrame(animationId);
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
                GUI.startGame(gameMode);
            } else if (e.code === 'Escape') {
                window.removeEventListener('keydown', h);
                location.reload();
            }
        };
        window.addEventListener('keydown', h);
    }
};