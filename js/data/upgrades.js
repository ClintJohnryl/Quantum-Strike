// ===== SHIP UPGRADE SYSTEM =====

const UPGRADE_TYPES = {
    // Each upgrade has 5 levels max
    maxLevel: 5,
    
    // Upgrade categories with balanced stat increases
    categories: {
        // Hull upgrades - Small HP increases
        hull: {
            name: 'Hull Reinforcement',
            icon: '🛡️',
            description: 'Reinforced hull plating increases durability',
            stat: 'hp',
            baseBonus: 15,
            multiplier: 1.2,
            priceBase: 100,
            priceMultiplier: 1.5,
            maxLevel: 5
        },
        // Engine upgrades - Small speed increases
        engine: {
            name: 'Engine Tuning',
            icon: '⚡',
            description: 'Optimized thrusters for better speed',
            stat: 'speed',
            baseBonus: 0.04,
            multiplier: 1.15,
            priceBase: 120,
            priceMultiplier: 1.5,
            maxLevel: 5
        },
        // Weapons - Small damage increases
        weapons: {
            name: 'Weapon Calibration',
            icon: '🔫',
            description: 'Fine-tuned weapons for more damage',
            stat: 'damage',
            baseBonus: 0.04,
            multiplier: 1.15,
            priceBase: 130,
            priceMultiplier: 1.5,
            maxLevel: 5
        },
        // Shields - Shield regeneration boost
        shields: {
            name: 'Shield Generator',
            icon: '🔮',
            description: 'Enhanced shield regeneration rate',
            stat: 'shield_regen',
            baseBonus: 0.08,
            multiplier: 1.1,
            priceBase: 150,
            priceMultiplier: 1.6,
            maxLevel: 5
        },
        // Agility - Better turning
        agility: {
            name: 'Gyro Stabilizers',
            icon: '🌀',
            description: 'Improved maneuverability',
            stat: 'agility',
            baseBonus: 0.04,
            multiplier: 1.15,
            priceBase: 140,
            priceMultiplier: 1.5,
            maxLevel: 5
        }
    }
};

// ===== UPGRADE MANAGER =====

const UpgradeManager = {
    // Get upgrade level for a ship and category
    getLevel: function(shipId, category) {
        try {
            var key = 'upgrade_' + shipId + '_' + category;
            var value = localStorage.getItem(key);
            return value ? parseInt(value) : 0;
        } catch (e) {
            return 0;
        }
    },
    
    // Set upgrade level
    setLevel: function(shipId, category, level) {
        var key = 'upgrade_' + shipId + '_' + category;
        localStorage.setItem(key, level.toString());
    },
    
    // Get upgrade cost for next level
    getCost: function(shipId, category) {
        var currentLevel = this.getLevel(shipId, category);
        var upgradeData = UPGRADE_TYPES.categories[category];
        if (!upgradeData) return Infinity;
        
        if (currentLevel >= upgradeData.maxLevel) return Infinity;
        
        var nextLevel = currentLevel + 1;
        var cost = Math.floor(upgradeData.priceBase * Math.pow(upgradeData.priceMultiplier, nextLevel - 1));
        return cost;
    },
    
    // Apply upgrade
    applyUpgrade: function(shipId, category) {
        var currentLevel = this.getLevel(shipId, category);
        var upgradeData = UPGRADE_TYPES.categories[category];
        
        if (!upgradeData) {
            return { success: false, message: 'Invalid upgrade category' };
        }
        if (currentLevel >= upgradeData.maxLevel) {
            return { success: false, message: 'Max level reached' };
        }
        
        var cost = this.getCost(shipId, category);
        var qubits = GameData.getQubits();
        
        if (qubits < cost) {
            return { success: false, message: 'Not enough Qubits' };
        }
        
        // Deduct qubits
        GameData.setQubits(qubits - cost);
        
        // Apply upgrade
        var newLevel = currentLevel + 1;
        this.setLevel(shipId, category, newLevel);
        
        // Recalculate ship stats if in game
        if (Game && Game.player) {
            Game.player.calculateStats();
        }
        
        return { 
            success: true, 
            message: upgradeData.name + ' upgraded to level ' + newLevel + '!',
            level: newLevel,
            cost: cost
        };
    },
    
    // Get total upgrade level for a ship (sum of all categories)
    getTotalLevel: function(shipId) {
        var total = 0;
        var categories = UPGRADE_TYPES.categories;
        for (var key in categories) {
            if (categories.hasOwnProperty(key)) {
                total += this.getLevel(shipId, key);
            }
        }
        return total;
    },
    
    // Get upgrade bonus for a specific stat
    getBonus: function(shipId, stat) {
        var totalBonus = 0;
        var categories = UPGRADE_TYPES.categories;
        for (var key in categories) {
            if (categories.hasOwnProperty(key)) {
                var data = categories[key];
                if (data.stat === stat) {
                    var level = this.getLevel(shipId, key);
                    if (level > 0) {
                        var bonus = 0;
                        for (var i = 1; i <= level; i++) {
                            bonus += data.baseBonus * Math.pow(data.multiplier, i - 1);
                        }
                        totalBonus += bonus;
                    }
                }
            }
        }
        return totalBonus;
    },
    
    // Get all upgrade info for a ship
    getShipUpgrades: function(shipId) {
        var upgrades = {};
        var categories = UPGRADE_TYPES.categories;
        for (var key in categories) {
            if (categories.hasOwnProperty(key)) {
                var data = categories[key];
                var level = this.getLevel(shipId, key);
                var cost = this.getCost(shipId, key);
                upgrades[key] = {
                    name: data.name,
                    icon: data.icon,
                    description: data.description,
                    level: level,
                    maxLevel: data.maxLevel,
                    cost: cost,
                    isMaxed: level >= data.maxLevel,
                    stat: data.stat,
                    bonus: level > 0 ? this.getBonus(shipId, data.stat) : 0
                };
            }
        }
        return upgrades;
    }
};

// Make UpgradeManager globally accessible
window.UpgradeManager = UpgradeManager;
window.UPGRADE_TYPES = UPGRADE_TYPES;

console.log('⬆️ Upgrade system loaded!');
console.log('📊 5 upgrade categories with 5 levels each');
console.log('  - Hull Reinforcement (HP)');
console.log('  - Engine Tuning (Speed)');
console.log('  - Weapon Calibration (Damage)');
console.log('  - Shield Generator (Regen)');
console.log('  - Gyro Stabilizers (Agility)');