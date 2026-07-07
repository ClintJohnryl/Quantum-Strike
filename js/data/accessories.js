// ===== ACCESSORIES =====

const ACCESSORIES = {
    halo: {
        id: 'halo',
        name: 'Angelic Halo',
        description: 'Divine light ring',
        price: 200,
        icon: '👼',
        color: '#ffff44',
        rarity: 'rare',
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.strokeStyle = '#ffff44';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ffff44';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, -size / 2 - 15, size / 3, 0, Math.PI);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    },
    crown: {
        id: 'crown',
        name: 'Quantum Crown',
        description: 'Royal authority',
        price: 350,
        icon: '👑',
        color: '#ffdd00',
        rarity: 'epic',
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.fillStyle = '#ffdd00';
            ctx.shadowColor = '#ffdd00';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(-size / 4, -size / 2);
            ctx.lineTo(-size / 6, -size / 2 - 12);
            ctx.lineTo(0, -size / 2 - 5);
            ctx.lineTo(size / 6, -size / 2 - 12);
            ctx.lineTo(size / 4, -size / 2);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    },
    aura: {
        id: 'aura',
        name: 'Energy Aura',
        description: 'Shimmering energy field',
        price: 150,
        icon: '💫',
        color: '#00ffcc',
        rarity: 'uncommon',
        draw: function(ctx, ship, size) {
            ctx.save();
            const pulse = Math.sin(Date.now() / 1000) * 0.1 + 0.9;
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3 * pulse;
            ctx.beginPath();
            ctx.arc(0, 0, size / 1.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 0.2 * pulse;
            ctx.beginPath();
            ctx.arc(0, 0, size / 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    },
    flame_effect: {
        id: 'flame_effect',
        name: 'Flame Trail',
        description: 'Burning exhaust trail',
        price: 250,
        icon: '🔥',
        color: '#ff4400',
        rarity: 'rare',
        draw: function(ctx, ship, size) {
            // Handled in particle system
        }
    },
    star_effect: {
        id: 'star_effect',
        name: 'Star Effect',
        description: 'Sparkling star particles',
        price: 180,
        icon: '⭐',
        color: '#ffff00',
        rarity: 'uncommon',
        draw: function(ctx, ship, size) {
            // Handled in particle system
        }
    },
    tentacles: {
        id: 'tentacles',
        name: 'Cosmic Tentacles',
        description: 'Eldritch horror aesthetic',
        price: 500,
        icon: '🐙',
        color: '#8844ff',
        rarity: 'epic',
        draw: function(ctx, ship, size) {
            ctx.save();
            ctx.strokeStyle = '#8844ff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * size / 3, Math.sin(a) * size / 3);
                for (let t = 0; t < 1; t += 0.1) {
                    const wave = Math.sin(t * 10 + Date.now() / 1000 + i) * size / 6;
                    ctx.lineTo(
                        Math.cos(a + t * 0.5) * size / 1.8 + wave * Math.cos(a + Math.PI / 2),
                        Math.sin(a + t * 0.5) * size / 1.8 + wave * Math.sin(a + Math.PI / 2)
                    );
                }
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }
};