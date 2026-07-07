// ===== PLAYER STATUS - HP, Shields, Powerups =====

const PlayerStatus = {
    updateStatus() {
        if (!this.alive) return;
        
        // Decay cooldown timers (in milliseconds)
        if (this._primaryCooldown > 0) {
            this._primaryCooldown -= 16.67;
            if (this._primaryCooldown < 0) this._primaryCooldown = 0;
        }
        if (this._secondaryCooldown > 0) {
            this._secondaryCooldown -= 16.67;
            if (this._secondaryCooldown < 0) this._secondaryCooldown = 0;
        }
        if (this._autocannonCooldown > 0) {
            this._autocannonCooldown -= 16.67;
            if (this._autocannonCooldown < 0) this._autocannonCooldown = 0;
        }
        
        // Update charge progress (auto-fire after 7 seconds)
        if (this._isCharging) {
            const elapsed = Date.now() - this._chargeStartTime;
            this._chargeProgress = Math.min(1, elapsed / 7000);
        }
        
        this.nametag.username = getUsername();
        this.nametag.rank = getRank(GameData.getXP());
        this.nametag.xp = GameData.getXP();
        
        if (this.recoilShake > 0) {
            this.recoilShake *= this.recoilShakeDecay || 0.85;
            if (this.recoilShake < 0.1) this.recoilShake = 0;
        }
        
        if (this.droneCooldown > 0) this.droneCooldown--;
        if (this.abilityTimer > 0) { 
            this.abilityTimer--; 
            if (this.abilityTimer <= 0) this.abilityActive = false; 
        }
        if (this.abilityCooldown > 0) this.abilityCooldown--;
        if (this.invincibleTimer > 0) { 
            this.invincibleTimer--; 
            if (this.invincibleTimer <= 0) this.invincible = false; 
        }
        
        if (this.shieldTimer > 0) { 
            this.shieldTimer--; 
            if (this.shieldTimer <= 0) { this.shieldActive = false; } 
        }
        if (this.speedTimer > 0) { 
            this.speedTimer--; 
            if (this.speedTimer <= 0) { this.speedBoost = 1; } 
        }
        if (this.spreadTimer > 0) { 
            this.spreadTimer--; 
            if (this.spreadTimer <= 0) { this.spreadShot = false; } 
        }
        if (this.comboTimer > 0) { 
            this.comboTimer--; 
            if (this.comboTimer <= 0) this.combo = 0; 
        }

        if (this.hasShieldRegen && !this.shieldActive) {
            this.shieldRegenTimer++;
            if (this.shieldRegenTimer > (this._shieldRegenSpeed || 300)) {
                this.shieldActive = true;
                this.shieldTimer = 150;
                this.shieldRegenTimer = 0;
            }
        }
    },

    takeDamage(amount) {
        if (!this.alive || this.invincible) return false;
        if (this.shieldActive) {
            this.shieldActive = false;
            this.shieldTimer = 0;
            
            if (typeof Audio !== 'undefined' && Audio) {
                Audio.playShieldBreak(0.3);
            }
            return false;
        }
        this.hp -= amount;
        
        if (typeof Audio !== 'undefined' && Audio) {
            Audio.playShipHit(0.2);
        }
        
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
        if (this.hp <= 0) { 
            this.hp = 0;
            this.alive = false;
            this.vx = 0;
            this.vy = 0;
            this.angularVelocity = 0;
            
            if (typeof Audio !== 'undefined' && Audio) {
                Audio.playGameOver(0.5);
            }
        }
        return true;
    },

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
        
        if (typeof Audio !== 'undefined' && Audio) {
            Audio.playShoot(0.2);
        }
    }
};