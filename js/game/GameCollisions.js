// ===== GAME COLLISIONS =====

const GameCollisions = {
    checkCollisions() {
        if (!this.player) return;
        const p = this.player;

        this.checkPrimaryBullets(p);
        this.checkEnemyBullets(p);
        this.checkSecondaryBullets(p);
        this.checkAutocannonBullets(p);
        this.checkDroneBullets(p);
        this.checkAsteroidCollisions(p);
        this.checkEnemyCollisions(p);
        this.checkDroneEnemyCollisions(p);
        this.checkAsteroidAsteroidCollisions();
    },

    // === ASTEROID TO ASTEROID COLLISIONS ===
    checkAsteroidAsteroidCollisions() {
        for (let i = 0; i < this.asteroids.length; i++) {
            const a = this.asteroids[i];
            if (!a.alive) continue;
            
            for (let j = i + 1; j < this.asteroids.length; j++) {
                const b = this.asteroids[j];
                if (!b.alive) continue;
                
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = a.size + b.size;
                
                if (dist < minDist) {
                    const nx = dx / dist || 1;
                    const ny = dy / dist || 1;
                    
                    const massA = a.size * a.size;
                    const massB = b.size * b.size;
                    const totalMass = massA + massB;
                    
                    const relVx = a.vx - b.vx;
                    const relVy = a.vy - b.vy;
                    const relVn = relVx * nx + relVy * ny;
                    
                    if (relVn < 0) {
                        const restitution = 0.3;
                        const impulse = -(1 + restitution) * relVn / (1/massA + 1/massB);
                        
                        a.vx += (impulse * nx) / massA;
                        a.vy += (impulse * ny) / massA;
                        b.vx -= (impulse * nx) / massB;
                        b.vy -= (impulse * ny) / massB;
                        
                        const impactForce = Math.abs(impulse) / 1000;
                        a.rotationSpeed += (Math.random() - 0.5) * 0.02 * Math.min(3, impactForce);
                        b.rotationSpeed += (Math.random() - 0.5) * 0.02 * Math.min(3, impactForce);
                        
                        const overlap = (minDist - dist) / 2;
                        a.x += nx * overlap * 1.1;
                        a.y += ny * overlap * 1.1;
                        b.x -= nx * overlap * 1.1;
                        b.y -= ny * overlap * 1.1;
                        
                        const particleCount = Math.min(20, 5 + Math.floor(impactForce * 2));
                        spawnExplosion((a.x + b.x) / 2, (a.y + b.y) / 2, '#ff8844', particleCount);
                        
                        const soundVolume = Math.min(0.5, 0.1 + impactForce * 0.05);
                        const asteroidSize = (a.size + b.size) / 80;
                        if (typeof Audio !== 'undefined' && Audio) {
                            Audio.playAsteroidCollision(soundVolume, asteroidSize);
                        }
                        
                        const damage = impactForce * 2;
                        a.hp = (a.hp || a.size * 2) - damage * 0.3;
                        b.hp = (b.hp || b.size * 2) - damage * 0.3;
                        
                        if (a.hp <= 0 || a.size < 10) {
                            a.alive = false;
                            spawnExplosion(a.x, a.y, '#ff8844', 15);
                            if (a.size > 25) {
                                for (let k = 0; k < 2; k++) {
                                    this.asteroids.push(new Asteroid(
                                        a.x + (Math.random() - 0.5) * 20,
                                        a.y + (Math.random() - 0.5) * 20,
                                        a.size * 0.5
                                    ));
                                }
                            }
                        }
                        if (b.hp <= 0 || b.size < 10) {
                            b.alive = false;
                            spawnExplosion(b.x, b.y, '#ff8844', 15);
                            if (b.size > 25) {
                                for (let k = 0; k < 2; k++) {
                                    this.asteroids.push(new Asteroid(
                                        b.x + (Math.random() - 0.5) * 20,
                                        b.y + (Math.random() - 0.5) * 20,
                                        b.size * 0.5
                                    ));
                                }
                            }
                        }
                    }
                }
            }
        }
        this.asteroids = this.asteroids.filter(a => a.alive);
    },

    checkPrimaryBullets(p) {
        for (let i = p.bullets.length - 1; i >= 0; i--) {
            const b = p.bullets[i];
            let hit = false;
            
            if (b.heavyRailgun) {
                this.handleHeavyRailgun(p, b);
                if (b.life <= 0 || b.x < -200 || b.x > mapWidth + 200 || b.y < -200 || b.y > mapHeight + 200) {
                    spawnExplosion(b.x, b.y, '#ff44ff', 50);
                    spawnExplosion(b.x, b.y, '#ffffff', 25);
                    p.bullets.splice(i, 1);
                }
                continue;
            }
            
            for (const enemy of this.enemies) {
                if (enemy.alive && checkCollision({ x: b.x, y: b.y, size: b.size }, enemy, enemy.size / 2 + 5)) {
                    enemy.takeDamage(b.damage);
                    if (!enemy.alive) {
                        this.handleEnemyKill(p, enemy);
                        if (b.lifesteal) {
                            p.hp = Math.min(p.maxHp, p.hp + b.damage * b.lifesteal);
                        }
                    }
                    if (!b.piercing) { hit = true; break; }
                }
            }
            
            if (!hit) {
                hit = this.handleBulletVsAsteroids(b, p);
            }
            
            if (b.explosive && !hit && (b.life <= 1 || b.x <= 0 || b.x >= mapWidth || b.y <= 0 || b.y >= mapHeight)) {
                this.handleExplosion(p, b);
                hit = true;
            }
            if (hit) p.bullets.splice(i, 1);
        }
    },

    handleBulletVsAsteroids(b, p) {
        for (const a of this.asteroids) {
            if (a.alive && checkCollision({ x: b.x, y: b.y, size: b.size }, a, a.size)) {
                spawnExplosion(b.x, b.y, '#888', 10);
                
                if (typeof Audio !== 'undefined' && Audio) {
                    const volume = Math.min(0.3, 0.05 + a.size / 200);
                    Audio.playAsteroidCollision(volume, a.size / 40);
                }
                
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
                return true;
            }
        }
        return false;
    },

    handleHeavyRailgun(p, b) {
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            const dx = enemy.x + enemy.size/2 - b.x;
            const dy = enemy.y + enemy.size/2 - b.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                enemy.takeDamage(b.damage);
                spawnExplosion(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#ff44ff', 60);
                spawnExplosion(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#ffffff', 30);
                if (!enemy.alive) this.handleEnemyKill(p, enemy);
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
    },

    handleExplosion(p, b) {
        spawnExplosion(b.x, b.y, '#f60', 25);
        
        if (typeof Audio !== 'undefined' && Audio) {
            Audio.playExplosion(0.4, 1);
        }
        
        for (const enemy of this.enemies) {
            if (enemy.alive && Math.sqrt((enemy.x + enemy.size / 2 - b.x) ** 2 + (enemy.y + enemy.size / 2 - b.y) ** 2) < b.explosionRadius) {
                enemy.takeDamage(b.damage * 2);
                if (!enemy.alive) this.handleEnemyKill(p, enemy);
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
    },

    handleEnemyKill(p, enemy) {
        spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color, enemy.isBoss ? 50 : enemy.isElite ? 30 : 20);
        const bonus = enemy.isBoss ? 500 : enemy.isElite ? 200 : 100;
        p.score += bonus;
        p.kills++;
        p.combo = (p.combo || 0) + 1;
        p.comboTimer = 120;
        GameData.addQubits(enemy.isBoss ? 50 : enemy.isElite ? 25 : 10);
        GameData.addXP(enemy.isBoss ? 30 : enemy.isElite ? 15 : 5);
        
        if (typeof Audio !== 'undefined' && Audio) {
            const volume = enemy.isBoss ? 0.6 : enemy.isElite ? 0.4 : 0.2;
            Audio.playExplosion(volume, enemy.isBoss ? 1.5 : enemy.isElite ? 1 : 0.7);
        }
    },

    checkEnemyBullets(p) {
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
    },

    checkSecondaryBullets(p) {
        for (let i = p.secondaryBullets.length - 1; i >= 0; i--) {
            const b = p.secondaryBullets[i];
            let hit = false;
            for (const enemy of this.enemies) {
                if (!enemy.alive) continue;
                if (checkCollision({ x: b.x, y: b.y, size: b.size || 6 }, enemy, enemy.size / 2 + 5)) {
                    enemy.takeDamage(b.damage);
                    if (!enemy.alive) this.handleEnemyKill(p, enemy);
                    if (b.explosive) {
                        spawnExplosion(b.x, b.y, '#f60', 25);
                        for (const e of this.enemies) {
                            if (e.alive && Math.sqrt((e.x + e.size / 2 - b.x) ** 2 + (e.y + e.size / 2 - b.y) ** 2) < (b.explosionRadius || 80)) {
                                e.takeDamage(b.damage * 2);
                                if (!e.alive) this.handleEnemyKill(p, e);
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
                this.handleExplosion(p, b);
                p.secondaryBullets.splice(i, 1);
            }
        }
    },

    checkAutocannonBullets(p) {
        for (let i = p.autocannonBullets.length - 1; i >= 0; i--) {
            const b = p.autocannonBullets[i];
            let hit = false;
            for (const enemy of this.enemies) {
                if (!enemy.alive) continue;
                if (checkCollision({ x: b.x, y: b.y, size: b.size || 5 }, enemy, enemy.size / 2 + 5)) {
                    enemy.takeDamage(b.damage);
                    if (!enemy.alive) this.handleEnemyKill(p, enemy);
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
    },

    checkDroneBullets(p) {
        for (let i = this.droneBullets.length - 1; i >= 0; i--) {
            const b = this.droneBullets[i];
            let hit = false;
            for (const enemy of this.enemies) {
                if (!enemy.alive) continue;
                if (checkCollision({ x: b.x, y: b.y, size: b.size || 3 }, enemy, enemy.size / 2 + 5)) {
                    enemy.takeDamage(b.damage);
                    if (!enemy.alive) this.handleEnemyKill(p, enemy);
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
    },

    checkAsteroidCollisions(p) {
        for (const a of this.asteroids) {
            if (a.alive && checkCollision(p, a, a.size / 2 + p.size / 2 - 5)) {
                const shipMass = p.shipData.stats.weight || 1000;
                const shipSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const asteroidMass = a.mass || (a.size * a.size / 4);
                
                const dx = p.x - a.x;
                const dy = p.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = dx / dist;
                const ny = dy / dist;
                
                const relativeVn = (p.vx - a.vx) * nx + (p.vy - a.vy) * ny;
                
                if (relativeVn < 0) {
                    const impactVelocity = Math.abs(relativeVn);
                    const kineticEnergy = 0.5 * shipMass * impactVelocity * impactVelocity / 100000;
                    
                    const weightReduction = Math.max(0.3, Math.min(0.9, 800 / shipMass));
                    const asteroidSizeMultiplier = 0.5 + (a.size / 80);
                    let damage = kineticEnergy * 2 * asteroidSizeMultiplier * weightReduction;
                    damage = Math.max(1, Math.min(25, damage));
                    p.takeDamage(damage);
                    
                    if (typeof Audio !== 'undefined' && Audio) {
                        const volume = Math.min(0.5, 0.1 + kineticEnergy * 0.02);
                        Audio.playAsteroidCollision(volume, a.size / 40);
                    }
                    
                    const restitution = 0.3;
                    const impulse = -(1 + restitution) * relativeVn / (1/shipMass + 1/asteroidMass);
                    const impulseX = impulse * nx;
                    const impulseY = impulse * ny;
                    p.vx += impulseX / shipMass;
                    p.vy += impulseY / shipMass;
                    a.vx -= impulseX / asteroidMass;
                    a.vy -= impulseY / asteroidMass;
                    
                    a.rotationSpeed += (Math.random() - 0.5) * 0.03 * Math.min(2, Math.abs(impulse) / 1000);
                    spawnExplosion(a.x, a.y, '#ff8800', Math.min(30, 10 + Math.floor(kineticEnergy * 2)));
                }
            }
        }
    },

    checkEnemyCollisions(p) {
        for (const e of this.enemies) {
            if (e.alive && checkCollision(p, e, p.size / 2 + e.size / 2 - 5)) {
                const shipMass = p.shipData.stats.weight || 1000;
                const shipSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const enemyMass = e.size * e.size / 4;
                
                const dx = p.x - e.x;
                const dy = p.y - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = dx / dist;
                const ny = dy / dist;
                
                const relativeVn = (p.vx - e.vx) * nx + (p.vy - e.vy) * ny;
                const impactVelocity = Math.abs(relativeVn);
                const kineticEnergy = 0.5 * shipMass * impactVelocity * impactVelocity / 100000;
                
                const enemySizeMultiplier = 0.3 + (e.size / 100);
                let damage = Math.max(3, Math.min(30, kineticEnergy * 3 * enemySizeMultiplier));
                const weightReduction = Math.max(0.4, Math.min(0.9, 800 / shipMass));
                damage *= weightReduction;
                
                p.takeDamage(damage);
                
                if (typeof Audio !== 'undefined' && Audio) {
                    Audio.playCollision(0.3, Math.min(1, kineticEnergy / 10));
                }
                
                const pushForce = Math.min(8, 3 + kineticEnergy * 0.5);
                p.vx += (dx / dist) * pushForce;
                p.vy += (dy / dist) * pushForce;
                e.vx -= (dx / dist) * pushForce * 0.3;
                e.vy -= (dy / dist) * pushForce * 0.3;
                
                spawnExplosion(e.x + e.size / 2, e.y + e.size / 2, '#ff4444', Math.min(20, 5 + Math.floor(kineticEnergy * 2)));
            }
        }
    },

    checkDroneEnemyCollisions(p) {
        if (!p.drones) return;
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
                    if (!e.alive) this.handleEnemyKill(p, e);
                    break;
                }
            }
        }
    }
};