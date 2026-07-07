// ===== PLAYER CORE - Base Class =====

class PlayerCore {
    constructor(x, y, shipData) {
        this.x = x;
        this.y = y;
        this.shipData = shipData;
        this.shipClass = shipData.classType || 'light';
        const classInfo = SHIP_CLASSES[this.shipClass] || SHIP_CLASSES.light;
        this.size = classInfo.size;
        this.color = shipData.color;
        this.angle = 0;
        this.vx = 0;
        this.vy = 0;
        
        // Equipment
        this.equippedAttachments = GameData.getEquippedAttachments();
        this.equippedSecondary = GameData.getEquippedSecondary();
        this.equippedAutocannon = GameData.getEquippedAutocannon();
        this.equippedDroneBay = GameData.getEquippedDroneBay();
        this.equippedAccessories = GameData.getEquippedAccessories();
        this.equippedWeapon = GameData.getEquippedWeapon();
        this.autoEnabled = true;
        this.isCarrier = this.shipClass === 'carrier';
        
        // Drones
        this.drones = [];
        this.droneCooldown = 0;
        this.maxDrones = 0;
        this.droneBayData = null;
        this.droneCommand = 'attack';
        
        if (this.equippedDroneBay && this.isCarrier) {
            this.droneBayData = DRONE_BAYS[this.equippedDroneBay];
            this.maxDrones = this.droneBayData ? this.droneBayData.droneCount : 0;
        }
        
        // Stats
        this.calculateStats();
        
        // State
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldRegenTimer = 0;
        this.speedBoost = 1;
        this.speedTimer = 0;
        this.spreadShot = false;
        this.spreadTimer = 0;
        this.activePowerups = [];
        this.alive = true;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.abilityCooldown = 0;
        this.abilityActive = false;
        this.abilityTimer = 0;
        
        // Combat
        this.bullets = [];
        this.secondaryBullets = [];
        this.autocannonBullets = [];
        this.lastShot = 0;
        this.lastSecondaryShot = 0;
        this.lastAutocannonShot = 0;
        
        // Cooldown timers for UI (in milliseconds)
        this._primaryCooldown = 0;
        this._secondaryCooldown = 0;
        this._autocannonCooldown = 0;
        
        // Heavy Railgun charge state
        this._isCharging = false;
        this._chargeStartTime = 0;
        this._chargeProgress = 0;
        this._chargeKeyPressed = false;
        
        // Movement - Einsteinian Physics
        this.thrusting = false;
        this.reversing = false;
        this.rotatingLeft = false;
        this.rotatingRight = false;
        this.strafingLeft = false;
        this.strafingRight = false;
        this.angularVelocity = 0;
        this.maxAngularVelocity = 0.12;
        this.angularDrag = 0.92;
        this.trail = [];
        
        // Relativistic properties
        this._lengthContraction = 1;
        this._gamma = 1;
        this._relativisticMass = this.shipData.stats.weight || 1000;
        this._speedOfLight = 10;
        this._maxSpeedPercent = this.getMaxSpeedPercent();
        this._shipMaxSpeed = this._speedOfLight * this._maxSpeedPercent;
        this._shipClassLabel = SHIP_CLASSES[this.shipClass]?.label || 'Unknown';
        
        // Score
        this.score = 0;
        this.kills = 0;
        this.combo = 0;
        this.comboTimer = 0;
        
        // Auto-cannon burst tracking
        this.burstIndex = 0;
        this.burstTimer = 0;
        
        // Recoil shake
        this.recoilShake = 0;
        this.recoilShakeDecay = 0.85;
        
        // Nametag
        this.nametag = {
            username: getUsername(),
            rank: getRank(GameData.getXP()),
            xp: GameData.getXP()
        };
    }
    
    getMaxSpeedPercent() {
        const weight = this.shipData.stats.weight || 1000;
        if (weight < 1000) {
            return Math.min(0.98, 0.90 + (1000 - weight) / 10000);
        } else if (weight < 2000) {
            return Math.min(0.80, 0.65 + (2000 - weight) / 10000);
        } else if (weight < 4000) {
            return Math.min(0.60, 0.50 + (4000 - weight) / 20000);
        } else if (weight < 6000) {
            return Math.min(0.45, 0.35 + (6000 - weight) / 30000);
        } else {
            return Math.max(0.25, 0.35 - (weight - 6000) / 20000);
        }
    }
    
    calculateStats() {
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

        const shipId = this.shipData.id;
        const hpUpgradeBonus = UpgradeManager.getBonus(shipId, 'hp');
        hpBonus += hpUpgradeBonus;
        
        const speedUpgradeBonus = UpgradeManager.getBonus(shipId, 'speed');
        speedMult *= (1 + speedUpgradeBonus);
        
        const damageUpgradeBonus = UpgradeManager.getBonus(shipId, 'damage');
        damageMult += damageUpgradeBonus;
        
        const agilityUpgradeBonus = UpgradeManager.getBonus(shipId, 'agility');
        agilityMult *= (1 + agilityUpgradeBonus);
        
        const shieldUpgradeBonus = UpgradeManager.getBonus(shipId, 'shield_regen');
        if (shieldUpgradeBonus > 0) {
            this.hasShieldRegen = true;
            this._shieldRegenSpeed = 300 - (shieldUpgradeBonus * 100);
        } else {
            this._shieldRegenSpeed = 300;
        }

        const classInfo = SHIP_CLASSES[this.shipClass] || SHIP_CLASSES.light;
        const level = GameData.getUpgradeLevel(this.shipData.id);
        
        this.maxHp = Math.max(10, (this.shipData.stats.hp * classInfo.hpMult + level * 10) + hpBonus);
        this.hp = this.maxHp;
        this.baseSpeed = Math.max(0.1, Math.min(5, this.shipData.stats.speed * classInfo.speedMult * speedMult + level * 0.05));
        this.baseDamage = Math.max(0.1, (this.shipData.stats.damage * classInfo.damageMult + level * 0.1) * damageMult);
        this.agility = Math.max(0.1, Math.min(3, agilityMult * (this.shipClass === 'light' ? 1.2 : this.shipClass === 'medium' ? 1 : 0.8)));
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
}