// ===== BULLET FUNCTIONS =====
// This file contains helper functions for bullet collision checking

// Check primary bullet collisions
function checkBulletCollisions(player, enemies, asteroids) {
    if (!player) return;
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const b = player.bullets[i];
        let hit = false;
        for (const enemy of enemies) {
            if (enemy.alive && checkCollision({ x: b.x, y: b.y, size: b.size }, enemy, enemy.size / 2 + 5)) {
                enemy.hp -= b.damage;
                if (enemy.hp <= 0) {
                    enemy.alive = false;
                    spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color, enemy.isBoss ? 50 : enemy.isElite ? 30 : 20);
                    const bonus = enemy.isBoss ? 500 : enemy.isElite ? 200 : 100;
                    player.score += bonus;
                    player.kills++;
                    player.combo = (player.combo || 0) + 1;
                    player.comboTimer = 120;
                    GameData.addQubits(enemy.isBoss ? 50 : enemy.isElite ? 25 : 10);
                    GameData.addXP(enemy.isBoss ? 30 : enemy.isElite ? 15 : 5);
                    if (b.lifesteal) {
                        player.hp = Math.min(player.maxHp, player.hp + b.damage * b.lifesteal);
                    }
                }
                if (!b.piercing) { hit = true; break; }
            }
        }
        if (!hit) {
            for (const a of asteroids) {
                if (a.alive && checkCollision({ x: b.x, y: b.y, size: b.size }, a, a.size)) {
                    spawnExplosion(b.x, b.y, '#888', 8);
                    if (a.size > 25) {
                        for (let j = 0; j < 2; j++) {
                            asteroids.push(new Asteroid(a.x + (Math.random() - 0.5) * 20, a.y + (Math.random() - 0.5) * 20, a.size * 0.5));
                        }
                    }
                    a.alive = false;
                    if (!b.piercing) { hit = true; break; }
                }
            }
        }
        if (b.explosive && !hit && (b.life <= 1 || b.x <= 0 || b.x >= mapWidth || b.y <= 0 || b.y >= mapHeight)) {
            spawnExplosion(b.x, b.y, '#f60', 25);
            for (const enemy of enemies) {
                if (enemy.alive && Math.sqrt((enemy.x + enemy.size / 2 - b.x) ** 2 + (enemy.y + enemy.size / 2 - b.y) ** 2) < b.explosionRadius) {
                    enemy.hp -= b.damage * 2;
                    if (enemy.hp <= 0) {
                        enemy.alive = false;
                        spawnExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.color, enemy.isBoss ? 50 : enemy.isElite ? 30 : 20);
                        const bonus = enemy.isBoss ? 500 : enemy.isElite ? 200 : 100;
                        player.score += bonus;
                        player.kills++;
                        player.combo = (player.combo || 0) + 1;
                        player.comboTimer = 120;
                        GameData.addQubits(enemy.isBoss ? 50 : enemy.isElite ? 25 : 10);
                        GameData.addXP(enemy.isBoss ? 30 : enemy.isElite ? 15 : 5);
                    }
                }
            }
            hit = true;
        }
        if (hit) player.bullets.splice(i, 1);
    }
}

// Check enemy bullets against player and drones
function checkEnemyBullets(player, enemies, asteroids) {
    if (!player) return;
    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            const b = enemy.bullets[i];
            let hit = false;
            if (b.targetIsDrone && player.drones) {
                for (const d of player.drones) {
                    if (d.alive && checkCollision({ x: b.x, y: b.y, size: 3 }, d, d.size / 2)) {
                        d.takeDamage(b.damage);
                        hit = true;
                        break;
                    }
                }
            }
            if (!hit) {
                for (const a of asteroids) {
                    if (a.alive && checkCollision({ x: b.x, y: b.y, size: 3 }, a, a.size)) {
                        hit = true;
                        spawnExplosion(b.x, b.y, '#888', 5);
                        if (a.size > 25) {
                            for (let j = 0; j < 2; j++) {
                                asteroids.push(new Asteroid(a.x + (Math.random() - 0.5) * 20, a.y + (Math.random() - 0.5) * 20, a.size * 0.5));
                            }
                        }
                        a.alive = false;
                        break;
                    }
                }
            }
            if (hit) enemy.bullets.splice(i, 1);
        }
        // Check player hit
        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            if (player.alive && !enemy.bullets[i].targetIsDrone &&
                checkCollision({ x: enemy.bullets[i].x, y: enemy.bullets[i].y, size: 4 }, player, player.size / 2)) {
                player.takeDamage(enemy.bullets[i].damage);
                enemy.bullets.splice(i, 1);
            }
        }
    }
}