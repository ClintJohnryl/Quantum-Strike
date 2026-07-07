// ===== PLAYER COMBAT - Shooting and Weapons =====

const PlayerCombat = {
    shoot() {
        if (!this.alive || this.isCarrier) return;
        const now = Date.now();
        const weapon = this.getWeaponData();
        if (!weapon) return;
        
        // Check if this is a charged weapon
        if (weapon.requiresCharge) {
            this.handleChargedWeapon(weapon, now);
            return;
        }
        
        // Normal weapon fire
        let fireRate = weapon.fireRate;
        if (!weapon.heavyRailgun) {
            fireRate = weapon.fireRate / Math.max(0.1, this.baseDamage);
        }
        
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const gamma = this._gamma || 1;
        const timeDilationFactor = 1 / gamma;
        const dilatedFireRate = fireRate * (1 + (1 - timeDilationFactor) * 0.5);
        
        const timeSinceLastShot = now - this.lastShot;
        if (timeSinceLastShot < dilatedFireRate) {
            this._primaryCooldown = dilatedFireRate - timeSinceLastShot;
            return;
        }
        
        this.lastShot = now;
        this._primaryCooldown = dilatedFireRate;
        this.fireWeapon(weapon, now);
    },

    handleChargedWeapon(weapon, now) {
        // If already charging, just wait for auto-fire
        if (this._isCharging) {
            const elapsed = Date.now() - this._chargeStartTime;
            this._chargeProgress = Math.min(1, elapsed / 7000);
            
            if (elapsed >= 7000) {
                // AUTO-FIRE after 7 seconds - NO SECOND CLICK NEEDED
                this.fireWeapon(weapon, now);
                this._isCharging = false;
                this._chargeProgress = 0;
                this._chargeKeyPressed = false;
                this.lastShot = now;
                this._primaryCooldown = weapon.fireRate;
                console.log('Heavy Railgun fired automatically after 7-second charge!');
            }
            return;
        }
        
        // Check if on cooldown
        const timeSinceLastShot = now - this.lastShot;
        if (timeSinceLastShot < weapon.fireRate) {
            this._primaryCooldown = weapon.fireRate - timeSinceLastShot;
            return;
        }
        
        // Only start charging if the key was JUST PRESSED (not held)
        const keyPressed = GameInput.keys[KEYBINDS.primary];
        if (!this._chargeKeyPressed && keyPressed) {
            // Key was just pressed - start charging
            this._chargeKeyPressed = true;
            this._isCharging = true;
            this._chargeStartTime = now;
            this._chargeProgress = 0;
            
            // PLAY THE HEAVY RAILGUN WAV SOUND
            if (typeof Audio !== 'undefined' && Audio) {
                if (Audio._heavyRailgunBuffer) {
                    Audio.playBufferedSound(Audio._heavyRailgunBuffer, 0.5);
                    console.log('Heavy Railgun sound playing (17 seconds)');
                } else {
                    Audio.loadSound('assets/audio/heavy_railgun.wav')
                        .then(buffer => {
                            Audio._heavyRailgunBuffer = buffer;
                            Audio.playBufferedSound(buffer, 0.5);
                            console.log('Heavy Railgun sound loaded and playing (17 seconds)');
                        })
                        .catch(() => {
                            console.log('Failed to load Heavy Railgun sound');
                        });
                }
            }
        }
        
        // Reset key press tracking when key is released
        if (!keyPressed) {
            this._chargeKeyPressed = false;
        }
    },

    fireWeapon(weapon, now) {
        const bulletX = this.x + this.size / 2 + Math.cos(this.angle) * this.size / 2;
        const bulletY = this.y + this.size / 2 + Math.sin(this.angle) * this.size / 2;
        
        if (weapon.heavyRailgun) {
            this.fireHeavyRailgun(weapon, bulletX, bulletY, now);
            return;
        }
        
        // Normal weapon firing
        if (typeof Audio !== 'undefined' && Audio) {
            Audio.playShoot(0.15);
        }
        
        const gamma = this._gamma || 1;
        for (let i = 0; i < weapon.bulletCount; i++) {
            const spreadAngle = weapon.spread * (Math.random() - 0.5) * (this.spreadShot ? 2 : 1);
            const bulletSpeed = weapon.bulletSpeed * (1 + (gamma - 1) * 0.05);
            
            this.bullets.push({
                x: bulletX,
                y: bulletY,
                dx: Math.cos(this.angle + spreadAngle),
                dy: Math.sin(this.angle + spreadAngle),
                damage: weapon.damage * this.baseDamage * (1 + (gamma - 1) * 0.05),
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
    },

    fireHeavyRailgun(weapon, bulletX, bulletY, now) {
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const gamma = this._gamma || 1;
        
        // === HEAVY RAILGUN RECOIL ===
        const restMass = 10;
        const relativisticMass = restMass * gamma;
        const projectileSpeed = weapon.bulletSpeed || 30;
        const momentum = relativisticMass * projectileSpeed;
        const shipMass = this.shipData.stats.weight || 1000;
        const recoilSpeed = momentum / shipMass;
        
        this.vx -= Math.cos(this.angle) * recoilSpeed * 0.8;
        this.vy -= Math.sin(this.angle) * recoilSpeed * 0.8;
        
        const recoilEnergy = 0.5 * shipMass * recoilSpeed * recoilSpeed;
        this.recoilShake = Math.min(12, Math.max(2, recoilEnergy / 1000));
        
        // Muzzle flash
        spawnExplosion(bulletX, bulletY, '#ff44ff', 30);
        spawnExplosion(bulletX, bulletY, '#ffffff', 15);
        spawnExplosion(
            bulletX - Math.cos(this.angle) * 10,
            bulletY - Math.sin(this.angle) * 10,
            '#ff88ff', 20
        );
        
        // The WAV sound is already playing from when the charge started
        // We don't play it again here
        
        const blueShift = 1 + (currentSpeed / this._speedOfLight) * 0.3;
        
        const bullet = {
            x: bulletX,
            y: bulletY,
            dx: Math.cos(this.angle),
            dy: Math.sin(this.angle),
            damage: weapon.damage * this.baseDamage * (1 + (gamma - 1) * 0.1),
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
            glowIntensity: 1.0 * blueShift,
            vaporize: true,
            glowTrail: [],
            relativisticMass: relativisticMass
        };
        this.bullets.push(bullet);
    },

    shootSecondary() {
        if (!this.alive) return;
        const secData = this.getSecondaryData();
        if (!secData) return;
        const now = Date.now();
        
        const timeSinceLastShot = now - this.lastSecondaryShot;
        if (timeSinceLastShot < secData.fireRate) {
            this._secondaryCooldown = secData.fireRate - timeSinceLastShot;
            return;
        }
        
        this.lastSecondaryShot = now;
        this._secondaryCooldown = secData.fireRate;
        
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
    },

    toggleAuto() {
        this.autoEnabled = !this.autoEnabled;
        GUI.updateAutoStatus(this.autoEnabled);
    },

    updateBullets() {
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
                this.updateHoming(b);
            }
            if (b.gravity) {
                this.updateGravity(b);
            }
            if (b.emp) {
                this.updateEMP(b);
            }
        });
        this.secondaryBullets = this.secondaryBullets.filter(b =>
            b.life > 0 && b.x > -50 && b.x < mapWidth + 50 &&
            b.y > -50 && b.y < mapHeight + 50
        );

        const autoData = this.getAutocannonData();
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
    },

    updateHoming(b) {
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
    },

    updateGravity(b) {
        for (const e of Game.enemies) {
            if (!e.alive) continue;
            const d = Math.sqrt((e.x - b.x) ** 2 + (e.y - b.y) ** 2);
            if (d < 150 && d > 10) {
                const force = 0.3 / (d / 100);
                e.x += (b.x - e.x) * force;
                e.y += (b.y - e.y) * force;
            }
        }
    },

    updateEMP(b) {
        for (const e of Game.enemies) {
            if (!e.alive) continue;
            const d = Math.sqrt((e.x - b.x) ** 2 + (e.y - b.y) ** 2);
            if (d < 120) {
                e.slowTimer = 30;
            }
        }
    },

    updateAutocannon() {
        const autoData = this.getAutocannonData();
        let target = null;
        
        if (autoData && this.autoEnabled) {
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
                
                if (autoData.isBattleship && autoData.chainEffect) {
                    this.updateBattleshipChain(autoData, target, now);
                } else {
                    this.updateRegularAutocannon(autoData, target, now);
                }
            }
        }
        
        if (!target) {
            this.burstIndex = 0;
        }
    },

    updateBattleshipChain(autoData, target, now) {
        if (now - this.lastAutocannonShot >= autoData.fireRate) {
            this.lastAutocannonShot = now;
            this.burstIndex = 0;
            this.burstTimer = 0;
        }
        
        if (this.burstIndex < autoData.bulletCount) {
            const burstDelay = autoData.burstDelay || 150;
            const timeSinceBurstStart = now - this.lastAutocannonShot;
            
            if (timeSinceBurstStart >= this.burstIndex * burstDelay) {
                const angle = Math.atan2(target.y - this.y, target.x - this.x);
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
                    life: autoData.bulletLifetime,
                    trail: true,
                    trailPoints: [],
                    isBattleship: true,
                    glowIntensity: autoData.glowIntensity || 0.8,
                    glowColor: autoData.glowColor || '#ff44cc',
                    size: autoData.bulletSize * 1.2
                };
                
                this.autocannonBullets.push(bullet);
                this.burstIndex++;
                spawnExplosion(bulletX, bulletY, '#ff44cc', 10);
            }
        }
    },

    updateRegularAutocannon(autoData, target, now) {
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
};