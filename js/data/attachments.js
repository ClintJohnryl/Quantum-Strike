// ===== ATTACHMENTS =====

const ATTACHMENTS = {
    // ===== EXISTING ATTACHMENTS (15 total) =====
    large_wings: {
        id: 'large_wings',
        name: 'Large Wings',
        type: 'wings',
        description: 'Extended wingspan for stability',
        price: 100,
        icon: '🪽',
        color: '#88ccff',
        rarity: 'common',
        stats: { speed: 1.1, agility: 1.2 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(-size / 4, -size / 4);
            ctx.lineTo(-size, -size / 2);
            ctx.lineTo(-size * 0.8, -size / 3);
            ctx.lineTo(-size / 3, -size / 6);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-size / 4, size / 4);
            ctx.lineTo(-size, size / 2);
            ctx.lineTo(-size * 0.8, size / 3);
            ctx.lineTo(-size / 3, size / 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    },
    dragon_wings: {
        id: 'dragon_wings',
        name: 'Dragon Wings',
        type: 'wings',
        description: 'Aggressive swept-back wings',
        price: 250,
        icon: '🐉',
        color: '#ff4444',
        rarity: 'uncommon',
        stats: { speed: 1.2, agility: 1.1 },
        draw: function(ctx, ship, size) {
            ctx.save();
            for (let side = -1; side <= 1; side += 2) {
                ctx.beginPath();
                ctx.moveTo(-size / 3, side * size / 5);
                ctx.lineTo(-size * 0.9, side * size * 0.7);
                ctx.lineTo(-size * 0.6, side * size * 0.3);
                ctx.lineTo(-size / 4, side * size / 6);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.globalAlpha = 0.8;
                ctx.fill();
                ctx.strokeStyle = '#ff8888';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            ctx.restore();
        }
    },
    angel_wings: {
        id: 'angel_wings',
        name: 'Angel Wings',
        type: 'wings',
        description: 'Divine feathered wings',
        price: 500,
        icon: '👼',
        color: '#ffffff',
        rarity: 'rare',
        stats: { speed: 1.15, agility: 1.3, hp: 20 },
        draw: function(ctx, ship, size) {
            ctx.save();
            for (let side = -1; side <= 1; side += 2) {
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.3;
                for (let i = 0; i < 5; i++) {
                    const yOff = side * (size / 4 + i * size / 10);
                    ctx.beginPath();
                    ctx.ellipse(-size / 2 - i * size / 8, yOff, size / 6, size / 8, 0.3 * side, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
            ctx.restore();
        }
    },
    twin_engine: {
        id: 'twin_engine',
        name: 'Twin Engine',
        type: 'engine',
        description: 'Dual thrusters for speed',
        price: 150,
        icon: '⚡',
        color: '#ffaa00',
        rarity: 'common',
        stats: { speed: 1.3 },
        draw: function(ctx, ship, size) {
            ctx.save();
            for (let side = -1; side <= 1; side += 2) {
                ctx.fillStyle = '#ff6600';
                ctx.fillRect(-size / 2, side * size / 4 - 4, -8, 8);
                ctx.fillStyle = '#ffaa00';
                ctx.fillRect(-size / 2 - 4, side * size / 4 - 2, -4, 4);
            }
            ctx.restore();
        }
    },
    ion_drive: {
        id: 'ion_drive',
        name: 'Ion Drive',
        type: 'engine',
        description: 'Efficient ion propulsion',
        price: 350,
        icon: '💫',
        color: '#00aaff',
        rarity: 'rare',
        stats: { speed: 1.5, hp: -10 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.fillStyle = '#0066ff';
            ctx.fillRect(-size / 2, -5, -10, 10);
            const grad = ctx.createLinearGradient(-size / 2, 0, -size / 2 - 15, 0);
            grad.addColorStop(0, '#00aaff');
            grad.addColorStop(1, 'rgba(0,170,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(-size / 2 - 15, -3, -15, 6);
            ctx.restore();
        }
    },
    warp_drive: {
        id: 'warp_drive',
        name: 'Warp Drive',
        type: 'engine',
        description: 'Faster-than-light propulsion',
        price: 800,
        icon: '🌀',
        color: '#aa44ff',
        rarity: 'epic',
        stats: { speed: 1.8, hp: -20 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.fillStyle = '#6600aa';
            ctx.fillRect(-size / 2, -8, -15, 16);
            const grad = ctx.createRadialGradient(-size / 2 - 15, 0, 0, -size / 2 - 15, 0, 20);
            grad.addColorStop(0, 'rgba(170,68,255,0.5)');
            grad.addColorStop(1, 'rgba(170,68,255,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(-size / 2 - 15, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },
    armor_plates: {
        id: 'armor_plates',
        name: 'Armor Plates',
        type: 'armor',
        description: 'Reinforced hull plating',
        price: 120,
        icon: '🛡️',
        color: '#888888',
        rarity: 'common',
        stats: { hp: 30, speed: 0.95 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, -size / 3);
            ctx.lineTo(-size / 4, -size / 4);
            ctx.moveTo(-size / 2, size / 3);
            ctx.lineTo(-size / 3, size / 3);
            ctx.lineTo(-size / 4, size / 4);
            ctx.stroke();
            ctx.fillStyle = 'rgba(150,150,150,0.3)';
            ctx.fillRect(-size / 2, -size / 4, size * 0.7, size / 2);
            ctx.restore();
        }
    },
    energy_shield: {
        id: 'energy_shield',
        name: 'Energy Shield Gen',
        type: 'armor',
        description: 'Passive shield regeneration',
        price: 400,
        icon: '🔮',
        color: '#ff00ff',
        rarity: 'rare',
        stats: { hp: 50, shield_regen: true },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, size / 2 + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    },
    nanite_armor: {
        id: 'nanite_armor',
        name: 'Nanite Armor',
        type: 'armor',
        description: 'Self-repairing nanite plating',
        price: 600,
        icon: '🧬',
        color: '#00ffaa',
        rarity: 'epic',
        stats: { hp: 80, shield_regen: true, speed: 0.97 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.strokeStyle = '#00ffaa';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(-size / 3 * Math.cos(a), -size / 3 * Math.sin(a), size / 8, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }
    },
    missile_pod: {
        id: 'missile_pod',
        name: 'Missile Pod',
        type: 'weapon_pod',
        description: 'Side-mounted missile launchers',
        price: 200,
        icon: '🚀',
        color: '#ff6600',
        rarity: 'uncommon',
        stats: { damage: 0.3 },
        draw: function(ctx, ship, size) {
            ctx.save();
            for (let side = -1; side <= 1; side += 2) {
                ctx.fillStyle = '#444';
                ctx.fillRect(-size / 3, side * size / 3 - 3, 6, 6);
                ctx.fillStyle = '#ff6600';
                ctx.fillRect(-size / 3 - 2, side * size / 3 - 1, 4, 2);
            }
            ctx.restore();
        }
    },
    laser_turret: {
        id: 'laser_turret',
        name: 'Laser Turret',
        type: 'weapon_pod',
        description: 'Auto-targeting laser turret',
        price: 500,
        icon: '🎯',
        color: '#00ff00',
        rarity: 'rare',
        stats: { damage: 0.5, auto_aim: true },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, -size / 3, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
            ctx.fillStyle = '#0f0';
            ctx.fillRect(0, -size / 3 - 3, 8, 2);
            ctx.restore();
        }
    },
    plasma_turret: {
        id: 'plasma_turret',
        name: 'Plasma Turret',
        type: 'weapon_pod',
        description: 'Heavy plasma autocannon',
        price: 700,
        icon: '🔥',
        color: '#ff44ff',
        rarity: 'epic',
        stats: { damage: 0.8, auto_aim: true },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, -size / 3, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#660066';
            ctx.fill();
            ctx.fillStyle = '#ff44ff';
            ctx.fillRect(0, -size / 3 - 4, 10, 3);
            ctx.restore();
        }
    },
    lifesteal_core: {
        id: 'lifesteal_core',
        name: 'Lifesteal Core',
        type: 'special',
        description: 'Heal on enemy hits',
        price: 450,
        icon: '❤️‍🔥',
        color: '#ff0044',
        rarity: 'rare',
        stats: { lifesteal: true, damage: 0.1 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.fillStyle = 'rgba(255,0,68,0.2)';
            ctx.beginPath();
            ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },
    thorns_shield: {
        id: 'thorns_shield',
        name: 'Thorns Shield',
        type: 'special',
        description: 'Reflect damage back to attackers',
        price: 550,
        icon: '🌵',
        color: '#44ff44',
        rarity: 'epic',
        stats: { thorns: true, hp: 20 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.strokeStyle = '#44ff44';
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + Date.now() / 2000;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * size / 3, Math.sin(a) * size / 3);
                ctx.lineTo(Math.cos(a) * size / 2, Math.sin(a) * size / 2);
                ctx.stroke();
            }
            ctx.restore();
        }
    },
    neon_trim: {
        id: 'neon_trim',
        name: 'Neon Trim',
        type: 'cosmetic',
        description: 'Glowing neon accents',
        price: 80,
        icon: '✨',
        color: '#00ffff',
        rarity: 'common',
        stats: {},
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    },
    spoiler: {
        id: 'spoiler',
        name: 'Quantum Spoiler',
        type: 'cosmetic',
        description: 'Racing-style spoiler',
        price: 150,
        icon: '🏎️',
        color: '#ff00ff',
        rarity: 'uncommon',
        stats: { agility: 1.05 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(-size / 3, -size / 2 - 8, size * 0.6, 4);
            ctx.fillRect(-size / 3 + 5, -size / 2 - 4, 4, 6);
            ctx.fillRect(-size / 3 + size * 0.6 - 9, -size / 2 - 4, 4, 6);
            ctx.restore();
        }
    },
    stealth_module: {
        id: 'stealth_module',
        name: 'Stealth Module',
        type: 'special',
        description: 'Become invisible to enemies',
        price: 900,
        icon: '👻',
        color: '#8844ff',
        rarity: 'legendary',
        stats: { stealth: true, speed: 1.1 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.fillStyle = 'rgba(136,68,255,0.15)';
            ctx.beginPath();
            ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },

    // ===== NEW ATTACHMENTS (15 more) =====
    
    // 1. Advanced Targeting System
    advanced_targeting: {
        id: 'advanced_targeting',
        name: 'Advanced Targeting System',
        type: 'weapon_pod',
        description: 'Enhanced auto-aim and critical hit chance',
        price: 750,
        icon: '🎯',
        color: '#ff8800',
        rarity: 'epic',
        stats: { damage: 0.4, auto_aim: true },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            // Crosshair
            ctx.beginPath();
            ctx.moveTo(-size / 4, -size / 4);
            ctx.lineTo(-size / 6, -size / 6);
            ctx.moveTo(-size / 4, size / 4);
            ctx.lineTo(-size / 6, size / 6);
            ctx.moveTo(size / 4, -size / 4);
            ctx.lineTo(size / 6, -size / 6);
            ctx.moveTo(size / 4, size / 4);
            ctx.lineTo(size / 6, size / 6);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    },

    // 2. Reinforced Hull
    reinforced_hull: {
        id: 'reinforced_hull',
        name: 'Reinforced Hull',
        type: 'armor',
        description: 'Dramatically increases ship durability',
        price: 300,
        icon: '🛡️',
        color: '#ffaa44',
        rarity: 'rare',
        stats: { hp: 60, speed: 0.92 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.fillStyle = 'rgba(255,170,68,0.15)';
            ctx.strokeStyle = '#ffaa44';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    },

    // 3. Quantum Core
    quantum_core: {
        id: 'quantum_core',
        name: 'Quantum Core',
        type: 'engine',
        description: 'Unstable quantum energy boost',
        price: 1000,
        icon: '⚛️',
        color: '#00ff88',
        rarity: 'mythic',
        stats: { speed: 2.0, hp: -15, damage: 0.2 },
        draw: function(ctx, ship, size) {
            ctx.save();
            const pulse = Math.sin(Date.now() / 500) * 0.2 + 0.3;
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 20 * pulse;
            ctx.fillStyle = `rgba(0,255,136,${0.1 * pulse})`;
            ctx.beginPath();
            ctx.arc(-size / 3, 0, size / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#00ff88';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚛', -size / 3, 0);
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    },

    // 4. Phase Shift
    phase_shift: {
        id: 'phase_shift',
        name: 'Phase Shift Module',
        type: 'special',
        description: 'Phases through enemies and obstacles',
        price: 1200,
        icon: '🌀',
        color: '#8844ff',
        rarity: 'legendary',
        stats: { stealth: true, speed: 1.3, agility: 1.2 },
        draw: function(ctx, ship, size) {
            ctx.save();
            const time = Date.now() / 1000;
            ctx.strokeStyle = '#8844ff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 3; i++) {
                const a = time + (i / 3) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * size / 2.5, Math.sin(a) * size / 2.5, size / 5, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    },

    // 5. Solar Panels
    solar_panels: {
        id: 'solar_panels',
        name: 'Solar Panels',
        type: 'wings',
        description: 'Energy absorbing solar arrays',
        price: 200,
        icon: '☀️',
        color: '#ffdd44',
        rarity: 'uncommon',
        stats: { speed: 1.05, hp: 10 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.fillStyle = '#ffdd44';
            ctx.globalAlpha = 0.3;
            for (let side = -1; side <= 1; side += 2) {
                ctx.fillRect(-size / 1.8, side * size / 2.5, size / 3, size / 6);
                ctx.fillRect(-size / 1.8, side * size / 3.5, size / 3, size / 6);
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    },

    // 6. Afterburner
    afterburner: {
        id: 'afterburner',
        name: 'Afterburner',
        type: 'engine',
        description: 'Massive speed boost in short bursts',
        price: 450,
        icon: '🔥',
        color: '#ff4400',
        rarity: 'rare',
        stats: { speed: 1.6, hp: -5 },
        draw: function(ctx, ship, size) {
            ctx.save();
            const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.3;
            ctx.fillStyle = `rgba(255,68,0,${0.3 * pulse})`;
            const grad = ctx.createRadialGradient(-size / 2, 0, 0, -size / 2, 0, size / 2);
            grad.addColorStop(0, `rgba(255,200,0,${0.4 * pulse})`);
            grad.addColorStop(0.3, `rgba(255,100,0,${0.2 * pulse})`);
            grad.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(-size / 2, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },

    // 7. EMP Generator
    emp_generator: {
        id: 'emp_generator',
        name: 'EMP Generator',
        type: 'weapon_pod',
        description: 'Disables enemy shields and slows them',
        price: 650,
        icon: '⚡',
        color: '#00ccff',
        rarity: 'epic',
        stats: { damage: 0.3, auto_aim: true },
        draw: function(ctx, ship, size) {
            ctx.save();
            const time = Date.now() / 1000;
            ctx.strokeStyle = '#00ccff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 4; i++) {
                const a = time + (i / 4) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * size / 3, Math.sin(a) * size / 3, size / 6, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    },

    // 8. Deflector Array
    deflector_array: {
        id: 'deflector_array',
        name: 'Deflector Array',
        type: 'armor',
        description: 'Chance to deflect incoming attacks',
        price: 500,
        icon: '🔄',
        color: '#44ddff',
        rarity: 'rare',
        stats: { hp: 40, shield_regen: true },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.strokeStyle = '#44ddff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            const time = Date.now() / 1000;
            for (let i = 0; i < 8; i++) {
                const a = time + (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * size / 2.5, Math.sin(a) * size / 2.5);
                ctx.lineTo(Math.cos(a + 0.3) * size / 2, Math.sin(a + 0.3) * size / 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    },

    // 9. Nanite Repair System
    nanite_repair: {
        id: 'nanite_repair',
        name: 'Nanite Repair System',
        type: 'special',
        description: 'Slowly regenerates hull over time',
        price: 700,
        icon: '🧬',
        color: '#44ff88',
        rarity: 'epic',
        stats: { hp: 30, shield_regen: true },
        draw: function(ctx, ship, size) {
            ctx.save();
            const pulse = Math.sin(Date.now() / 800) * 0.2 + 0.3;
            ctx.fillStyle = `rgba(68,255,136,${0.05 * pulse})`;
            ctx.beginPath();
            ctx.arc(0, 0, size / 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#44ff88';
            ctx.globalAlpha = 0.3 * pulse;
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + Date.now() / 2000;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * size / 3, Math.sin(a) * size / 3, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    },

    // 10. Mini Shield Generator
    mini_shield: {
        id: 'mini_shield',
        name: 'Mini Shield Generator',
        type: 'armor',
        description: 'Small but efficient shield',
        price: 350,
        icon: '🔰',
        color: '#00ddff',
        rarity: 'uncommon',
        stats: { hp: 25, shield_regen: true },
        draw: function(ctx, ship, size) {
            ctx.save();
            const pulse = Math.sin(Date.now() / 1000) * 0.1 + 0.2;
            ctx.strokeStyle = `rgba(0,221,255,${pulse})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, size / 2 + 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    },

    // 11. Gravity Anchor
    gravity_anchor: {
        id: 'gravity_anchor',
        name: 'Gravity Anchor',
        type: 'special',
        description: 'Pulls enemies closer and slows them',
        price: 800,
        icon: '🌌',
        color: '#aa44ff',
        rarity: 'legendary',
        stats: { agility: 1.4, speed: 0.9 },
        draw: function(ctx, ship, size) {
            ctx.save();
            const time = Date.now() / 1000;
            ctx.strokeStyle = '#aa44ff';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 3; i++) {
                const a = time + (i / 3) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * size / 2, Math.sin(a) * size / 2, size / 3, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    },

    // 12. Speed Boost Module
    speed_boost: {
        id: 'speed_boost',
        name: 'Speed Boost Module',
        type: 'engine',
        description: 'Permanent speed enhancement',
        price: 250,
        icon: '💨',
        color: '#66ff66',
        rarity: 'uncommon',
        stats: { speed: 1.4 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.fillStyle = '#66ff66';
            ctx.globalAlpha = 0.2;
            for (let side = -1; side <= 1; side += 2) {
                ctx.fillRect(-size / 2 - 5, side * size / 4 - 2, -10, 4);
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    },

    // 13. Shield Booster
    shield_booster: {
        id: 'shield_booster',
        name: 'Shield Booster',
        type: 'armor',
        description: 'Enhanced shield capacity',
        price: 550,
        icon: '🛡️',
        color: '#44aaff',
        rarity: 'rare',
        stats: { hp: 45, shield_regen: true },
        draw: function(ctx, ship, size) {
            ctx.save();
            const pulse = Math.sin(Date.now() / 700) * 0.1 + 0.3;
            ctx.strokeStyle = `rgba(68,170,255,${pulse})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(0, 0, size / 2 + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    },

    // 14. Weapon Stabilizer
    weapon_stabilizer: {
        id: 'weapon_stabilizer',
        name: 'Weapon Stabilizer',
        type: 'weapon_pod',
        description: 'Reduces weapon spread and recoil',
        price: 300,
        icon: '🎯',
        color: '#ff8800',
        rarity: 'uncommon',
        stats: { damage: 0.25 },
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.moveTo(size / 4, -size / 4);
            ctx.lineTo(size / 4, size / 4);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    },

    // 15. Cloaking Device
    cloaking_device: {
        id: 'cloaking_device',
        name: 'Cloaking Device',
        type: 'special',
        description: 'Temporarily becomes invisible',
        price: 1500,
        icon: '👻',
        color: '#8844ff',
        rarity: 'mythic',
        stats: { stealth: true, speed: 1.2, hp: -10 },
        draw: function(ctx, ship, size) {
            ctx.save();
            const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.2;
            ctx.fillStyle = `rgba(136,68,255,${0.05 * pulse})`;
            ctx.beginPath();
            ctx.arc(0, 0, size / 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8844ff';
            ctx.globalAlpha = 0.3 * pulse;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('👻', 0, 0);
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }
};