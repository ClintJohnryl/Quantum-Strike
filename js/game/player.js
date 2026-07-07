// ===== PLAYER CLASS =====

class Player {
    constructor(x, y, shipData) {
        this.x = x;
        this.y = y;
        this.shipData = shipData;
        this.shipClass = shipData.classType || 'light';
        const classInfo = SHIP_CLASSES[this.shipClass];
        this.size = classInfo.size;
        this.color = shipData.color;
        this.angle = 0;
        this.vx = 0;
        this.vy = 0;
        this.equippedAttachments = GameData.getEquippedAttachments();
        this.equippedSecondary = GameData.getEquippedSecondary();
        this.equippedAutocannon = GameData.getEquippedAutocannon();
        this.equippedDroneBay = GameData.getEquippedDroneBay();
        this.equippedAccessories = GameData.getEquippedAccessories();
        this.equippedWeapon = GameData.getEquippedWeapon();
        this.autoEnabled = true;
        this.drones = [];
        this.droneCooldown = 0;
        this.maxDrones = 0;
        this.droneBayData = null;
        this.droneCommand = 'attack';
        this.isCarrier = this.shipClass === 'carrier';

        if (this.equippedDroneBay && this.isCarrier) {
            this.droneBayData = DRONE_BAYS[this.equippedDroneBay];
            this.maxDrones = this.droneBayData ? this.droneBayData.droneCount : 0;
        }

        let hpBonus = 0;
        let speedMult = 1;
        let damageMult = 1;
        let agilityMult = 1;
        this.hasShieldRegen = false;
        this.hasLifesteal = false;
        this.hasThorns = false;
        this.hasStealth = false;

        this.equippedAttachments.forEach(id => {
            const att = ATTACHMENTS[id];
            if (!att) return;
            if (att.stats.hp) hpBonus += att.stats.hp;
            if (att.stats.speed) speedMult *= att.stats.speed;
            if (att.stats.damage) damageMult += att.stats.damage;
            if (att.stats.agility) agilityMult *= att.stats.agility;
            if (att.stats.shield_regen) this.hasShieldRegen = true;
            if (att.stats.lifesteal) this.hasLifesteal = true;
            if (att.stats.thorns) this.hasThorns = true;
            if (att.stats.stealth) this.hasStealth = true;
        });

        const level = GameData.getUpgradeLevel(shipData.id);
        this.maxHp = Math.max(10, (shipData.stats.hp * classInfo.hpMult + level * 10) + hpBonus);
        this.hp = this.maxHp;
        this.baseSpeed = Math.max(0.1, Math.min(5, shipData.stats.speed * classInfo.speedMult * speedMult + level * 0.05));
        this.baseDamage = Math.max(0.1, (shipData.stats.damage * classInfo.damageMult + level * 0.1) * damageMult);
        this.agility = Math.max(0.1, Math.min(3, agilityMult * (this.shipClass === 'light' ? 1.2 : this.shipClass === 'medium' ? 1 : 0.8)));

        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldRegenTimer = 0;
        this.speedBoost = 1;
        this.speedTimer = 0;
        this.spreadShot = false;
        this.spreadTimer = 0;
        this.activePowerups = [];
        this.bullets = [];
        this.secondaryBullets = [];
        this.autocannonBullets = [];
        this.lastShot = 0;
        this.lastSecondaryShot = 0;
        this.lastAutocannonShot = 0;
        this.alive = true;
        this.thrusting = false;
        this.reversing = false;
        this.rotatingLeft = false;
        this.rotatingRight = false;
        this.trail = [];
        this.score = 0;
        this.kills = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.abilityCooldown = 0;
        this.abilityActive = false;
        this.abilityTimer = 0;
        
        // Auto-cannon burst tracking for battleship cannon
        this.burstIndex = 0;
        this.burstTimer = 0;
        
        this.nametag = {
            username: getUsername(),
            rank: getRank(GameData.getXP()),
            xp: GameData.getXP()
        };
    }

    setDroneCommand(cmd) {
        this.droneCommand = cmd;
        this.drones.forEach(d => d.command = cmd);
        document.querySelectorAll('.drone-command-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.cmd === cmd);
        });
    }

    getWeaponData() {
        if (this.isCarrier) return null;
        return WEAPONS[this.equippedWeapon] || WEAPONS.laser;
    }

    getSecondaryData() {
        return SECONDARY_WEAPONS[this.equippedSecondary] || null;
    }

    getAutocannonData() {
        const auto = AUTOCANNONS[this.equippedAutocannon] || null;
        if (!auto) return null;
        const classOrder = ['light', 'medium', 'heavy', 'superheavy', 'carrier'];
        const shipIdx = classOrder.indexOf(this.shipClass);
        const reqIdx = classOrder.indexOf(auto.requiredClass);
        if (shipIdx < reqIdx) return null;
        if (this.isCarrier && auto.requiredClass === 'carrier') return auto;
        if (!this.isCarrier && auto.requiredClass === 'carrier') return null;
        return auto;
    }

    launchDrones() {
        if (!this.isCarrier || !this.droneBayData) return;
        if (this.droneCooldown > 0) return;
        const activeDrones = this.drones.filter(d => d.alive).length;
        if (activeDrones >= this.maxDrones) return;
        const bayData = this.droneBayData;
        const drone = new Drone(
            this.x + (Math.random() - 0.5) * 60,
            this.y + (Math.random() - 0.5) * 60,
            this,
            bayData,
            this.drones.length
        );
        drone.command = this.droneCommand;
        this.drones.push(drone);
        this.droneCooldown = 20;
        spawnExplosion(drone.x, drone.y, '#00ffcc', 8);
    }

    useAbility() {
        if (this.abilityCooldown > 0 || this.abilityActive) return;
        this.abilityActive = true;
        this.abilityTimer = 15;
        this.abilityCooldown = 120;
        const dashPower = this.shipClass === 'light' ? 18 :
            this.shipClass === 'medium' ? 14 :
            this.shipClass === 'heavy' ? 10 : 7;
        this.vx += Math.cos(this.angle) * dashPower;
        this.vy += Math.sin(this.angle) * dashPower;
        this.invincible = true;
        this.invincibleTimer = 30;
        spawnExplosion(this.x - Math.cos(this.angle) * 20, this.y - Math.sin(this.angle) * 20, '#00ffff', 10);
    }

    update() {
        if (!this.alive) return;
        
        this.nametag.username = getUsername();
        this.nametag.rank = getRank(GameData.getXP());
        this.nametag.xp = GameData.getXP();
        
        if (this.droneCooldown > 0) this.droneCooldown--;
        if (this.abilityTimer > 0) { this.abilityTimer--; if (this.abilityTimer <= 0) this.abilityActive = false; }
        if (this.abilityCooldown > 0) this.abilityCooldown--;
        if (this.invincibleTimer > 0) { this.invincibleTimer--; if (this.invincibleTimer <= 0) this.invincible = false; }
        if (this.shieldTimer > 0) { this.shieldTimer--; if (this.shieldTimer <= 0) { this.shieldActive = false; } }
        if (this.speedTimer > 0) { this.speedTimer--; if (this.speedTimer <= 0) { this.speedBoost = 1; } }
        if (this.spreadTimer > 0) { this.spreadTimer--; if (this.spreadTimer <= 0) { this.spreadShot = false; } }
        if (this.comboTimer > 0) { this.comboTimer--; if (this.comboTimer <= 0) this.combo = 0; }

        if (this.hasShieldRegen && !this.shieldActive) {
            this.shieldRegenTimer++;
            if (this.shieldRegenTimer > 300) {
                this.shieldActive = true;
                this.shieldTimer = 150;
                this.shieldRegenTimer = 0;
            }
        }

        if (this.rotatingLeft) this.angle -= 0.07 * this.agility;
        if (this.rotatingRight) this.angle += 0.07 * this.agility;

        const speed = Math.max(0.1, this.baseSpeed);
        const accel = 0.2 * speed * this.speedBoost;
        
        if (this.thrusting) {
            this.vx += Math.cos(this.angle) * accel;
            this.vy += Math.sin(this.angle) * accel;
            this.trail.push({ x: this.x, y: this.y, alpha: 1, size: 3, color: '#0ff' });
        }
        if (this.reversing) {
            this.vx -= Math.cos(this.angle) * accel * 0.6;
            this.vy -= Math.sin(this.angle) * accel * 0.6;
            this.trail.push({ x: this.x + this.size, y: this.y, alpha: 1, size: 3, color: '#f80' });
        }

        this.vx *= 0.99;
        this.vy *= 0.99;
        
        const maxSpeed = Math.max(0.5, 6 * speed * this.speedBoost);
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > maxSpeed) {
            this.vx *= maxSpeed / currentSpeed;
            this.vy *= maxSpeed / currentSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.x = Math.max(0, Math.min(mapWidth - this.size, this.x));
        this.y = Math.max(0, Math.min(mapHeight - this.size, this.y));

        this.trail.forEach(t => t.alpha -= 0.05);
        this.trail = this.trail.filter(t => t.alpha > 0);

        this.drones.forEach(d => d.update(this));
        this.drones = this.drones.filter(d => d.alive);

        if (!this.isCarrier) {
            const weapon = this.getWeaponData();
            if (weapon) {
                this.bullets.forEach(b => {
                    b.x += b.dx * weapon.bulletSpeed;
                    b.y += b.dy * weapon.bulletSpeed;
                    b.life--;
                });
                this.bullets = this.bullets.filter(b =>
                    b.life > 0 && b.x > -50 && b.x < mapWidth + 50 &&
                    b.y > -50 && b.y < mapHeight + 50
                );
            }
        }

        this.secondaryBullets.forEach(b => {
            const sData = this.getSecondaryData();
            if (!sData) return;
            const spd = sData.bulletSpeed || 5;
            b.x += b.dx * spd;
            b.y += b.dy * spd;
            b.life--;
            if (b.homing) {
                let target = null;
                let minDist = Infinity;
                for (const e of Game.enemies) {
                    if (!e.alive) continue;
                    const d = Math.sqrt((e.x - b.x) ** 2 + (e.y - b.y) ** 2);
                    if (d < minDist) { minDist = d;
                        target = e; }
                }
                if (target) {
                    const ang = Math.atan2(target.y - b.y, target.x - b.x);
                    const current = Math.atan2(b.dy, b.dx);
                    let diff = ang - current;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    const turn = Math.min(0.06, Math.max(-0.06, diff));
                    const newAng = current + turn;
                    b.dx = Math.cos(newAng);
                    b.dy = Math.sin(newAng);
                }
            }
            if (b.gravity) {
                for (const e of Game.enemies) {
                    if (!e.alive) continue;
                    const d = Math.sqrt((e.x - b.x) ** 2 + (e.y - b.y) ** 2);
                    if (d < 150 && d > 10) {
                        const force = 0.3 / (d / 100);
                        e.x += (b.x - e.x) * force;
                        e.y += (b.y - e.y) * force;
                    }
                }
            }
            if (b.emp) {
                for (const e of Game.enemies) {
                    if (!e.alive) continue;
                    const d = Math.sqrt((e.x - b.x) ** 2 + (e.y - b.y) ** 2);
                    if (d < 120) {
                        e.slowTimer = 30;
                    }
                }
            }
        });
        this.secondaryBullets = this.secondaryBullets.filter(b =>
            b.life > 0 && b.x > -50 && b.x < mapWidth + 50 &&
            b.y > -50 && b.y < mapHeight + 50
        );

        const autoData = this.getAutocannonData();
        if (autoData && this.autoEnabled) {
            let target = null;
            let minDist = Infinity;
            for (const e of Game.enemies) {
                if (!e.alive) continue;
                const d = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (d < minDist && d < autoData.range) {
                    minDist = d;
                    target = e;
                }
            }
            if (target) {
                const now = Date.now();
                
                // For battleship cannon - chain fire
                if (autoData.isBattleship && autoData.chainEffect) {
                    // Check if we should start a new burst
                    if (now - this.lastAutocannonShot >= autoData.fireRate) {
                        this.lastAutocannonShot = now;
                        this.burstIndex = 0;
                        this.burstTimer = 0;
                    }
                    
                    // Fire chain shots with delay
                    if (this.burstIndex < autoData.bulletCount) {
                        const burstDelay = autoData.burstDelay || 150;
                        const timeSinceBurstStart = now - this.lastAutocannonShot;
                        
                        if (timeSinceBurstStart >= this.burstIndex * burstDelay) {
                            // Fire one shot in the chain
                            const angle = Math.atan2(target.y - this.y, target.x - this.x);
                            // Add slight spread to each shot for chain effect
                            const spreadOffset = (this.burstIndex - (autoData.bulletCount - 1) / 2) * autoData.spread;
                            const shotAngle = angle + spreadOffset;
                            
                            const bulletX = this.x + this.size / 2 + Math.cos(shotAngle) * this.size / 2;
                            const bulletY = this.y + this.size / 2 + Math.sin(shotAngle) * this.size / 2;
                            
                            const bullet = {
                                x: bulletX,
                                y: bulletY,
                                dx: Math.cos(shotAngle),
                                dy: Math.sin(shotAngle),
                                damage: autoData.damage * this.baseDamage,
                                color: autoData.bulletColor,
                                size: autoData.bulletSize,
                                life: autoData.bulletLifetime,
                                trail: true,
                                trailPoints: [],
                                isBattleship: true,
                                glowIntensity: autoData.glowIntensity || 0.8,
                                glowColor: autoData.glowColor || '#ff44cc',
                                // Slightly larger for visual impact
                                size: autoData.bulletSize * 1.2
                            };
                            
                            this.autocannonBullets.push(bullet);
                            this.burstIndex++;
                            
                            // Visual feedback - small explosion at barrel for each shot
                            spawnExplosion(bulletX, bulletY, '#ff44cc', 10);
                        }
                    }
                } else {
                    // Regular auto-cannon fire
                    if (now - this.lastAutocannonShot >= autoData.fireRate) {
                        this.lastAutocannonShot = now;
                        const angle = Math.atan2(target.y - this.y, target.x - this.x);
                        const bulletX = this.x + this.size / 2 + Math.cos(angle) * this.size / 2;
                        const bulletY = this.y + this.size / 2 + Math.sin(angle) * this.size / 2;
                        for (let i = 0; i < autoData.bulletCount; i++) {
                            const spreadAngle = autoData.spread * (Math.random() - 0.5);
                            
                            const bullet = {
                                x: bulletX,
                                y: bulletY,
                                dx: Math.cos(angle + spreadAngle),
                                dy: Math.sin(angle + spreadAngle),
                                damage: autoData.damage * this.baseDamage,
                                color: autoData.bulletColor,
                                size: autoData.bulletSize,
                                life: autoData.bulletLifetime,
                                trail: true,
                                trailPoints: []
                            };
                            
                            if (autoData.isBattleship) {
                                bullet.isBattleship = true;
                                bullet.glowIntensity = autoData.glowIntensity || 0.8;
                                bullet.glowColor = autoData.glowColor || '#ff44cc';
                                bullet.size = autoData.bulletSize * 1.2;
                            }
                            
                            this.autocannonBullets.push(bullet);
                        }
                    }
                }
            }
        }
        
        // Reset burst if target lost
        if (!target) {
            this.burstIndex = 0;
        }
        
        // Update auto-cannon bullets
        if (autoData) {
            this.autocannonBullets.forEach(b => {
                b.x += b.dx * autoData.bulletSpeed;
                b.y += b.dy * autoData.bulletSpeed;
                b.life--;
            });
            this.autocannonBullets = this.autocannonBullets.filter(b =>
                b.life > 0 && b.x > -50 && b.x < mapWidth + 50 &&
                b.y > -50 && b.y < mapHeight + 50
            );
        }
    }

    shoot() {
        if (!this.alive || this.isCarrier) return;
        const now = Date.now();
        const weapon = this.getWeaponData();
        if (!weapon) return;
        
        let fireRate = weapon.fireRate;
        if (!weapon.heavyRailgun) {
            fireRate = weapon.fireRate / Math.max(0.1, this.baseDamage);
        }
        
        if (now - this.lastShot < fireRate) return;
        this.lastShot = now;
        const bulletX = this.x + this.size / 2 + Math.cos(this.angle) * this.size / 2;
        const bulletY = this.y + this.size / 2 + Math.sin(this.angle) * this.size / 2;
        
        if (weapon.heavyRailgun) {
            const bullet = {
                x: bulletX,
                y: bulletY,
                dx: Math.cos(this.angle),
                dy: Math.sin(this.angle),
                damage: weapon.damage * this.baseDamage,
                color: weapon.bulletColor,
                size: weapon.bulletSize,
                life: weapon.bulletLifetime,
                trail: weapon.trail,
                explosive: weapon.explosive,
                explosionRadius: weapon.explosionRadius,
                piercing: weapon.piercing,
                trailPoints: [],
                lifesteal: this.hasLifesteal ? 0.2 : 0,
                heavyRailgun: true,
                glowIntensity: 1.0,
                vaporize: true,
                glowTrail: []
            };
            this.bullets.push(bullet);
            spawnExplosion(bulletX, bulletY, '#ff44ff', 30);
            spawnExplosion(bulletX, bulletY, '#ffffff', 15);
            return;
        }
        
        for (let i = 0; i < weapon.bulletCount; i++) {
            const spreadAngle = weapon.spread * (Math.random() - 0.5) * (this.spreadShot ? 2 : 1);
            this.bullets.push({
                x: bulletX,
                y: bulletY,
                dx: Math.cos(this.angle + spreadAngle),
                dy: Math.sin(this.angle + spreadAngle),
                damage: weapon.damage * this.baseDamage,
                color: weapon.bulletColor,
                size: weapon.bulletSize,
                life: weapon.bulletLifetime,
                trail: weapon.trail,
                explosive: weapon.explosive,
                explosionRadius: weapon.explosionRadius,
                piercing: weapon.piercing,
                trailPoints: [],
                lifesteal: this.hasLifesteal ? 0.2 : 0,
                heavyRailgun: false
            });
        }
    }

    shootSecondary() {
        if (!this.alive) return;
        const secData = this.getSecondaryData();
        if (!secData) return;
        const now = Date.now();
        if (now - this.lastSecondaryShot < secData.fireRate) return;
        this.lastSecondaryShot = now;
        const bulletX = this.x + this.size / 2 + Math.cos(this.angle) * this.size / 2;
        const bulletY = this.y + this.size / 2 + Math.sin(this.angle) * this.size / 2;
        if (secData.mine) {
            Game.mines.push({
                x: this.x + this.size / 2,
                y: this.y + this.size / 2,
                timer: 90,
                armed: false,
                size: 15,
                owner: 'player',
                damage: secData.damage * this.baseDamage
            });
        } else if (secData.beam) {
            this.secondaryBullets.push({
                x: bulletX,
                y: bulletY,
                dx: Math.cos(this.angle),
                dy: Math.sin(this.angle),
                damage: secData.damage * this.baseDamage,
                color: secData.bulletColor || '#f04',
                size: secData.bulletSize || 4,
                life: secData.bulletLifetime || 30,
                explosive: secData.explosive || false,
                explosionRadius: secData.explosionRadius || 80,
                homing: false,
                gravity: false,
                emp: secData.emp || false,
                beam: true,
                trailPoints: []
            });
        } else {
            for (let i = 0; i < (secData.bulletCount || 1); i++) {
                const spread = secData.spread || 0;
                const angle = this.angle + (spread * (Math.random() - 0.5));
                this.secondaryBullets.push({
                    x: bulletX,
                    y: bulletY,
                    dx: Math.cos(angle),
                    dy: Math.sin(angle),
                    damage: secData.damage * this.baseDamage,
                    color: secData.bulletColor || '#f80',
                    size: secData.bulletSize || 6,
                    life: secData.bulletLifetime || 100,
                    explosive: secData.explosive || false,
                    explosionRadius: secData.explosionRadius || 80,
                    homing: secData.homing || false,
                    gravity: secData.gravity || false,
                    emp: secData.emp || false,
                    mine: false,
                    trailPoints: []
                });
            }
        }
    }

    toggleAuto() {
        this.autoEnabled = !this.autoEnabled;
        GUI.updateAutoStatus(this.autoEnabled);
    }

    takeDamage(amount) {
        if (!this.alive || this.invincible) return false;
        if (this.shieldActive) {
            this.shieldActive = false;
            this.shieldTimer = 0;
            return false;
        }
        this.hp -= amount;
        if (this.hasThorns) {
            for (const e of Game.enemies) {
                if (e.alive && Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2) < 150) {
                    e.takeDamage(amount * 0.3);
                    if (!e.alive) {
                        spawnExplosion(e.x + e.size / 2, e.y + e.size / 2, e.color, e.isBoss ? 40 : 20);
                        this.score += e.isBoss ? 500 : 100;
                        this.kills++;
                        GameData.addQubits(e.isBoss ? 50 : 10);
                    }
                }
            }
        }
        if (this.hp <= 0) { this.hp = 0;
            this.alive = false; }
        return true;
    }

    drawNametag(ctx, sx, sy, zoom) {
        const username = this.nametag.username;
        const rank = this.nametag.rank;
        
        const text = `${username} - ${rank.title}`;
        ctx.font = 'bold 14px Orbitron, Segoe UI, sans-serif';
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const padding = 14;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = 34;
        const boxX = (sx + this.size / 2) * zoom - boxWidth / 2;
        const boxY = (sy - 30) * zoom - boxHeight;
        
        const glowGrad = ctx.createRadialGradient(
            (sx + this.size / 2) * zoom, (sy - 30) * zoom - boxHeight / 2, 0,
            (sx + this.size / 2) * zoom, (sy - 30) * zoom - boxHeight / 2, boxWidth * 0.8
        );
        glowGrad.addColorStop(0, rank.color + '20');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc((sx + this.size / 2) * zoom, (sy - 30) * zoom - boxHeight / 2, boxWidth * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(0, 10, 20, 0.85)';
        ctx.shadowColor = rank.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = rank.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = rank.color;
        ctx.font = 'bold 14px Orbitron, Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = rank.color;
        ctx.shadowBlur = 10;
        ctx.fillText(text, (sx + this.size / 2) * zoom, (sy - 30) * zoom - boxHeight / 2 + 2);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = rank.color;
        ctx.globalAlpha = 0.6;
        ctx.font = '10px Orbitron, Segoe UI, sans-serif';
        ctx.fillText(rank.title, (sx + this.size / 2) * zoom, (sy - 30) * zoom - boxHeight / 2 + 18);
        ctx.globalAlpha = 1;
    }

    draw(ctx, camX, camY, zoom) {
        if (!this.alive) return;
        const sx = this.x - camX + W / 2 / zoom;
        const sy = this.y - camY + H / 2 / zoom;
        if (sx < -100 || sx > W / zoom + 100 || sy < -100 || sy > H / zoom + 100) return;

        this.drawNametag(ctx, sx, sy, zoom);

        this.equippedAccessories.forEach(id => {
            const acc = ACCESSORIES[id];
            if (acc && acc.draw) {
                ctx.save();
                ctx.translate(sx * zoom, sy * zoom);
                ctx.scale(zoom, zoom);
                ctx.translate(this.size / 2, this.size / 2);
                acc.draw(ctx, this, this.size);
                ctx.restore();
            }
        });

        this.trail.forEach(t => {
            const tx = t.x - camX + W / 2 / zoom;
            const ty = t.y - camY + H / 2 / zoom;
            ctx.fillStyle = t.color.replace(')', `,${t.alpha * 0.5})`).replace('rgb', 'rgba');
            ctx.fillRect(tx * zoom, ty * zoom, t.size * zoom, t.size * zoom);
        });

        ctx.save();
        ctx.translate(sx * zoom, sy * zoom);
        ctx.scale(zoom, zoom);
        ctx.translate(this.size / 2, this.size / 2);
        ctx.rotate(this.angle);

        this.equippedAttachments.forEach(id => {
            const att = ATTACHMENTS[id];
            if (att && att.draw) att.draw(ctx, this, this.size);
        });

        if (this.shipData && this.shipData.draw) {
            this.shipData.draw.call(this, ctx, this.size);
        } else {
            ctx.beginPath();
            ctx.moveTo(this.size / 2, 0);
            ctx.lineTo(-this.size / 2, -this.size / 3);
            ctx.lineTo(-this.size / 3, 0);
            ctx.lineTo(-this.size / 2, this.size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        const classInfo = SHIP_CLASSES[this.shipClass];
        ctx.strokeStyle = classInfo.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (this.isCarrier) {
            ctx.fillStyle = '#00ffcc';
            ctx.globalAlpha = 0.3;
            for (let i = -1; i <= 1; i += 2) {
                ctx.fillRect(-this.size / 3, i * this.size / 5 - 1, this.size / 5, 2);
            }
            ctx.globalAlpha = 1;
        }

        if (this.hasStealth) {
            ctx.fillStyle = 'rgba(136,68,255,0.15)';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.shieldActive) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2 + 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (this.abilityActive) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2 + 15, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (this.autoEnabled && this.getAutocannonData()) {
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        if (this.thrusting) {
            ctx.beginPath();
            ctx.moveTo(-this.size / 2, 0);
            ctx.lineTo(-this.size / 2 - 15, -8);
            ctx.lineTo(-this.size / 2 - 15, 8);
            ctx.closePath();
            const grad = ctx.createLinearGradient(-this.size / 2, 0, -this.size / 2 - 15, 0);
            grad.addColorStop(0, '#ffaa00');
            grad.addColorStop(1, 'rgba(255,100,0,0)');
            ctx.fillStyle = grad;
            ctx.fill();
        }
        if (this.reversing) {
            ctx.beginPath();
            ctx.moveTo(this.size / 2, 0);
            ctx.lineTo(this.size / 2 + 10, -6);
            ctx.lineTo(this.size / 2 + 10, 6);
            ctx.closePath();
            const grad = ctx.createLinearGradient(this.size / 2, 0, this.size / 2 + 10, 0);
            grad.addColorStop(0, '#ff6600');
            grad.addColorStop(1, 'rgba(255,100,0,0)');
            ctx.fillStyle = grad;
            ctx.fill();
        }
        ctx.restore();

        if (!this.isCarrier) {
            this.bullets.forEach(b => {
                const bx = (b.x - camX + W / 2 / zoom) * zoom;
                const by = (b.y - camY + H / 2 / zoom) * zoom;
                
                // Heavy Railgun - Glowing light blur gradient effect
                if (b.heavyRailgun) {
                    const glowSize = 120 * zoom * b.glowIntensity;
                    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, glowSize);
                    grad.addColorStop(0, 'rgba(255, 68, 255, 0.9)');
                    grad.addColorStop(0.1, 'rgba(255, 100, 255, 0.6)');
                    grad.addColorStop(0.3, 'rgba(200, 50, 255, 0.3)');
                    grad.addColorStop(0.6, 'rgba(150, 0, 255, 0.1)');
                    grad.addColorStop(1, 'rgba(100, 0, 200, 0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(bx, by, glowSize, 0, Math.PI * 2);
                    ctx.fill();
                    
                    const coreGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 30 * zoom);
                    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                    coreGrad.addColorStop(0.3, 'rgba(255, 200, 255, 0.8)');
                    coreGrad.addColorStop(0.7, 'rgba(255, 100, 255, 0.4)');
                    coreGrad.addColorStop(1, 'rgba(255, 50, 255, 0)');
                    ctx.fillStyle = coreGrad;
                    ctx.beginPath();
                    ctx.arc(bx, by, 30 * zoom, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.shadowColor = '#ff44ff';
                    ctx.shadowBlur = 40 * zoom;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(bx - 4 * zoom, by - 4 * zoom, 8 * zoom, 8 * zoom);
                    ctx.shadowBlur = 0;
                    
                    if (b.glowTrail && b.glowTrail.length > 1) {
                        for (let t = 0; t < b.glowTrail.length - 1; t++) {
                            const trailAlpha = t / b.glowTrail.length * 0.5;
                            const trailSize = (t / b.glowTrail.length) * 20 * zoom;
                            const grad2 = ctx.createRadialGradient(
                                b.glowTrail[t].x * zoom, b.glowTrail[t].y * zoom, 0,
                                b.glowTrail[t].x * zoom, b.glowTrail[t].y * zoom, trailSize
                            );
                            grad2.addColorStop(0, `rgba(255, 68, 255, ${trailAlpha * 0.5})`);
                            grad2.addColorStop(1, 'rgba(255, 68, 255, 0)');
                            ctx.fillStyle = grad2;
                            ctx.beginPath();
                            ctx.arc(b.glowTrail[t].x * zoom, b.glowTrail[t].y * zoom, trailSize, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    
                    b.glowTrail = b.glowTrail || [];
                    b.glowTrail.push({ x: bx / zoom, y: by / zoom });
                    if (b.glowTrail.length > 20) b.glowTrail.shift();
                    
                    return;
                }
                
                // Normal bullet drawing
                if (b.trail && b.trailPoints.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(b.trailPoints[0].x * zoom, b.trailPoints[0].y * zoom);
                    for (let i = 1; i < b.trailPoints.length; i++) ctx.lineTo(b.trailPoints[i].x * zoom, b.trailPoints[i].y * zoom);
                    ctx.strokeStyle = b.color.replace(')', ',0.5)').replace('rgb', 'rgba');
                    ctx.lineWidth = b.size * zoom * 0.5;
                    ctx.stroke();
                }
                ctx.beginPath();
                ctx.arc(bx, by, b.size * zoom * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = b.color.replace(')', ',0.3)').replace('rgb', 'rgba');
                ctx.fill();
                ctx.fillStyle = b.color;
                ctx.fillRect(bx - b.size * zoom / 2, by - b.size * zoom / 2, b.size * zoom, b.size * zoom);
                b.trailPoints.push({ x: bx / zoom, y: by / zoom });
                if (b.trailPoints.length > 5) b.trailPoints.shift();
            });
        }

        this.secondaryBullets.forEach(b => {
            const bx = (b.x - camX + W / 2 / zoom) * zoom;
            const by = (b.y - camY + H / 2 / zoom) * zoom;
            const size = (b.size || 6);
            const grad = ctx.createRadialGradient(bx, by, 0, bx, by, size * zoom * 2);
            grad.addColorStop(0, b.color || '#f80');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(bx - size * zoom * 2, by - size * zoom * 2, size * zoom * 4, size * zoom * 4);
            ctx.fillStyle = b.color || '#f80';
            ctx.fillRect(bx - size * zoom / 2, by - size * zoom / 2, size * zoom, size * zoom);
            if (b.homing) {
                ctx.strokeStyle = '#ff8800';
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(bx, by, 12 * zoom, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            if (b.emp) {
                ctx.strokeStyle = '#00ccff';
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.arc(bx, by, 20 * zoom, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        });

        // Auto-Cannon bullets
        this.autocannonBullets.forEach(b => {
            const bx = (b.x - camX + W / 2 / zoom) * zoom;
            const by = (b.y - camY + H / 2 / zoom) * zoom;
            const size = (b.size || 5);
            
            // Check if this is a battleship cannon bullet
            if (b.isBattleship) {
                // === BATTLESHIP CANNON - GLOWING PLASMA ROUND (Smaller Heavy Railgun style) ===
                const glowSize = 45 * zoom * (b.glowIntensity || 0.8);
                
                // Outer glow
                const grad = ctx.createRadialGradient(bx, by, 0, bx, by, glowSize);
                grad.addColorStop(0, 'rgba(255, 68, 204, 0.8)');
                grad.addColorStop(0.2, 'rgba(255, 100, 220, 0.5)');
                grad.addColorStop(0.5, 'rgba(200, 50, 255, 0.2)');
                grad.addColorStop(1, 'rgba(150, 0, 200, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(bx, by, glowSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Middle glow
                const midGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 20 * zoom);
                midGrad.addColorStop(0, 'rgba(255, 200, 255, 0.9)');
                midGrad.addColorStop(0.3, 'rgba(255, 150, 255, 0.6)');
                midGrad.addColorStop(0.7, 'rgba(255, 68, 204, 0.3)');
                midGrad.addColorStop(1, 'rgba(255, 68, 204, 0)');
                ctx.fillStyle = midGrad;
                ctx.beginPath();
                ctx.arc(bx, by, 20 * zoom, 0, Math.PI * 2);
                ctx.fill();
                
                // Bright core
                ctx.shadowColor = '#ff44cc';
                ctx.shadowBlur = 25 * zoom;
                const coreGrad = ctx.createRadialGradient(bx, by, 0, bx, by, size * zoom * 0.8);
                coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                coreGrad.addColorStop(0.5, 'rgba(255, 200, 255, 0.8)');
                coreGrad.addColorStop(1, 'rgba(255, 68, 204, 0.4)');
                ctx.fillStyle = coreGrad;
                ctx.beginPath();
                ctx.arc(bx, by, size * zoom * 0.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Inner bright dot
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 10 * zoom;
                ctx.beginPath();
                ctx.arc(bx, by, size * zoom * 0.25, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Glow trail
                if (b.trailPoints && b.trailPoints.length > 1) {
                    for (let t = 0; t < b.trailPoints.length - 1; t++) {
                        const trailAlpha = (t / b.trailPoints.length) * 0.4;
                        const trailSize = (t / b.trailPoints.length) * 12 * zoom;
                        const trailGrad = ctx.createRadialGradient(
                            b.trailPoints[t].x * zoom, b.trailPoints[t].y * zoom, 0,
                            b.trailPoints[t].x * zoom, b.trailPoints[t].y * zoom, trailSize
                        );
                        trailGrad.addColorStop(0, `rgba(255, 68, 204, ${trailAlpha * 0.5})`);
                        trailGrad.addColorStop(1, 'rgba(255, 68, 204, 0)');
                        ctx.fillStyle = trailGrad;
                        ctx.beginPath();
                        ctx.arc(b.trailPoints[t].x * zoom, b.trailPoints[t].y * zoom, trailSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                
                // Update trail
                b.trailPoints = b.trailPoints || [];
                b.trailPoints.push({ x: bx / zoom, y: by / zoom });
                if (b.trailPoints.length > 15) b.trailPoints.shift();
                
                return;
            }
            
            // Normal auto-cannon bullet
            const grad = ctx.createRadialGradient(bx, by, 0, bx, by, size * zoom * 2.5);
            grad.addColorStop(0, b.color || '#fa0');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(bx - size * zoom * 2.5, by - size * zoom * 2.5, size * zoom * 5, size * zoom * 5);
            ctx.fillStyle = b.color || '#fa0';
            ctx.shadowColor = b.color || '#fa0';
            ctx.shadowBlur = 10 * zoom;
            ctx.fillRect(bx - size * zoom / 2, by - size * zoom / 2, size * zoom, size * zoom);
            ctx.shadowBlur = 0;
            if (b.trail && b.trailPoints && b.trailPoints.length > 1) {
                ctx.beginPath();
                ctx.moveTo(b.trailPoints[0].x * zoom, b.trailPoints[0].y * zoom);
                for (let i = 1; i < b.trailPoints.length; i++) ctx.lineTo(b.trailPoints[i].x * zoom, b.trailPoints[i].y * zoom);
                ctx.strokeStyle = (b.color || '#fa0').replace(')', ',0.3)').replace('rgb', 'rgba');
                ctx.lineWidth = (b.size || 5) * zoom * 0.6;
                ctx.stroke();
            }
            b.trailPoints = b.trailPoints || [];
            b.trailPoints.push({ x: bx / zoom, y: by / zoom });
            if (b.trailPoints.length > 5) b.trailPoints.shift();
        });

        this.drones.forEach(d => d.draw(ctx, camX, camY, zoom));

        const barWidth = 40 * zoom;
        const barHeight = 4 * zoom;
        const barX = (sx + this.size / 2) * zoom - barWidth / 2;
        const barY = (sy - 15) * zoom;
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight);
    }
}

// Add roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (r > w / 2) r = w / 2;
        if (r > h / 2) r = h / 2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        return this;
    };
}