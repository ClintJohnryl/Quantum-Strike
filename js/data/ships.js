// ===== SHIP DEFINITIONS =====

const SHIPS = [
    // LIGHT SHIPS (Light weight = more recoil)
    {
        id: 'default',
        name: 'Quantum Fighter',
        price: 0,
        classType: 'light',
        rarity: 'common',
        stats: { hp: 80, speed: 1.5, damage: 1, weight: 800 },
        color: '#00ffff',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    },
    {
        id: 'scout',
        name: 'Scout Class',
        price: 50,
        classType: 'light',
        rarity: 'common',
        stats: { hp: 60, speed: 1.8, damage: 0.8, weight: 600 },
        color: '#44ff88',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 4);
            ctx.lineTo(-size / 4, 0);
            ctx.lineTo(-size / 2, size / 4);
            ctx.closePath();
            ctx.fillStyle = '#44ff88';
            ctx.shadowColor = '#44ff88';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 4);
            ctx.lineTo(-size / 4, 0);
            ctx.lineTo(-size / 2, size / 4);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    },
    {
        id: 'red',
        name: 'Crimson Fury',
        price: 100,
        classType: 'light',
        rarity: 'uncommon',
        stats: { hp: 90, speed: 1.5, damage: 1.2, weight: 750 },
        color: '#ff4444',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#ff4444';
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    },
    {
        id: 'phantom',
        name: 'Phantom Stealth',
        price: 400,
        classType: 'light',
        rarity: 'rare',
        stats: { hp: 100, speed: 1.6, damage: 1.3, weight: 700 },
        color: '#8844ff',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 4, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#8844ff';
            ctx.shadowColor = '#8844ff';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 4, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    },
    // MEDIUM SHIPS (Medium weight = moderate recoil)
    {
        id: 'medium_gunship',
        name: 'Gunship MK-II',
        price: 250,
        classType: 'medium',
        rarity: 'uncommon',
        stats: { hp: 160, speed: 1.1, damage: 1.2, weight: 1400 },
        color: '#ffcc00',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-size / 3, -size / 4);
            ctx.lineTo(-size / 3, size / 4);
            ctx.stroke();
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-size / 3, -size / 4);
            ctx.lineTo(-size / 3, size / 4);
            ctx.stroke();
        }
    },
    {
        id: 'medium_assault',
        name: 'Assault Cruiser',
        price: 350,
        classType: 'medium',
        rarity: 'rare',
        stats: { hp: 200, speed: 1.0, damage: 1.4, weight: 1600 },
        color: '#ff8800',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#ff8800';
            ctx.shadowColor = '#ff8800';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.fillStyle = '#ff4400';
            ctx.fillRect(-size / 3, -size / 4, -size / 6, size / 2);
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ff4400';
            ctx.fillRect(-size / 3, -size / 4, -size / 6, size / 2);
        }
    },
    {
        id: 'medium_guardian',
        name: 'Guardian Class',
        price: 500,
        classType: 'medium',
        rarity: 'epic',
        stats: { hp: 240, speed: 0.9, damage: 1.3, weight: 1800 },
        color: '#44aaff',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#44aaff';
            ctx.shadowColor = '#44aaff';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.strokeStyle = '#00ccff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, size / 3.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#00ccff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, size / 3.5, 0, Math.PI * 2);
            ctx.stroke();
        }
    },
    // HEAVY SHIPS (Heavy weight = less recoil)
    {
        id: 'green',
        name: 'Emerald Tank',
        price: 200,
        classType: 'heavy',
        rarity: 'uncommon',
        stats: { hp: 280, speed: 0.8, damage: 1.2, weight: 2800 },
        color: '#00ff44',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#00ff44';
            ctx.shadowColor = '#00ff44';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.fillStyle = 'rgba(0,255,68,0.2)';
            ctx.beginPath();
            ctx.arc(0, 0, size / 2.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0,255,68,0.2)';
            ctx.beginPath();
            ctx.arc(0, 0, size / 2.8, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    {
        id: 'gold',
        name: 'Golden Nova',
        price: 500,
        classType: 'heavy',
        rarity: 'epic',
        stats: { hp: 320, speed: 0.75, damage: 1.5, weight: 3200 },
        color: '#ffdd00',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#ffdd00';
            ctx.shadowColor = '#ffdd00';
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-size / 2, -size / 4);
            ctx.lineTo(-size / 2, size / 4);
            ctx.stroke();
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-size / 2, -size / 4);
            ctx.lineTo(-size / 2, size / 4);
            ctx.stroke();
        }
    },
    {
        id: 'dragoon',
        name: 'Dragoon Class',
        price: 800,
        classType: 'heavy',
        rarity: 'legendary',
        stats: { hp: 400, speed: 0.7, damage: 1.8, weight: 3800 },
        color: '#ff4400',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#ff4400';
            ctx.shadowColor = '#ff4400';
            ctx.shadowBlur = 25;
            ctx.fill();
            ctx.fillStyle = '#ff8800';
            for (let i = 0; i < 4; i++) {
                const a = (i / 4) * Math.PI * 2;
                ctx.fillRect(Math.cos(a) * size / 3 - 3, Math.sin(a) * size / 3 - 3, 6, 6);
            }
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ff8800';
            for (let i = 0; i < 4; i++) {
                const a = (i / 4) * Math.PI * 2;
                ctx.fillRect(Math.cos(a) * size / 3 - 3, Math.sin(a) * size / 3 - 3, 6, 6);
            }
        }
    },
    // SUPER HEAVY (Very heavy = minimal recoil)
    {
        id: 'battleship',
        name: 'Battleship Class',
        price: 1200,
        classType: 'superheavy',
        rarity: 'mythic',
        stats: { hp: 600, speed: 0.55, damage: 2.0, weight: 5500 },
        color: '#ff44cc',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#ff44cc';
            ctx.shadowColor = '#ff44cc';
            ctx.shadowBlur = 30;
            ctx.fill();
            ctx.fillStyle = '#ff88dd';
            ctx.fillRect(-size / 6, -size / 3 - 5, size / 8, size / 6);
            ctx.fillStyle = '#ff66cc';
            for (let side = -1; side <= 1; side += 2) {
                ctx.fillRect(-size / 3, side * size / 4 - 3, -size / 5, 6);
                ctx.fillRect(-size / 4, side * size / 3 - 3, -size / 6, 6);
            }
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ff88dd';
            ctx.fillRect(-size / 6, -size / 3 - 5, size / 8, size / 6);
            ctx.fillStyle = '#ff66cc';
            for (let side = -1; side <= 1; side += 2) {
                ctx.fillRect(-size / 3, side * size / 4 - 3, -size / 5, 6);
                ctx.fillRect(-size / 4, side * size / 3 - 3, -size / 6, 6);
            }
            ctx.fillStyle = 'rgba(255,68,204,0.3)';
            ctx.beginPath();
            ctx.arc(-size / 2.5, 0, size / 4, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    {
        id: 'void',
        name: 'Void Walker',
        price: 1500,
        classType: 'superheavy',
        rarity: 'mythic',
        stats: { hp: 700, speed: 0.5, damage: 2.2, weight: 6500 },
        color: '#8800ff',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#8800ff';
            ctx.shadowColor = '#8800ff';
            ctx.shadowBlur = 35;
            ctx.fill();
            ctx.strokeStyle = '#aa44ff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#aa44ff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    },
    // CARRIER (Very heavy = minimal recoil)
    {
        id: 'carrier',
        name: 'Carrier Class',
        price: 1000,
        classType: 'carrier',
        rarity: 'legendary',
        stats: { hp: 500, speed: 0.6, damage: 0.5, weight: 5000 },
        color: '#00ffcc',
        preview(ctx, size) {
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = '#00ffcc';
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 25;
            ctx.fill();
            ctx.fillStyle = '#44ffdd';
            ctx.fillRect(-size / 4, -size / 4, size / 3, size / 2);
            ctx.fillStyle = '#0088aa';
            ctx.fillRect(-size / 6, -size / 5, size / 8, size / 2.5);
            ctx.fillStyle = '#00ddbb';
            for (let i = -1; i <= 1; i += 2) {
                ctx.fillRect(-size / 3, i * size / 5 - 2, size / 5, 4);
            }
            ctx.restore();
        },
        draw(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 3);
            ctx.lineTo(-size / 3, 0);
            ctx.lineTo(-size / 2, size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#44ffdd';
            ctx.fillRect(-size / 4, -size / 4, size / 3, size / 2);
            ctx.fillStyle = '#0088aa';
            ctx.fillRect(-size / 6, -size / 5, size / 8, size / 2.5);
            ctx.fillStyle = '#00ddbb';
            for (let i = -1; i <= 1; i += 2) {
                ctx.fillRect(-size / 3, i * size / 5 - 2, size / 5, 4);
            }
            ctx.fillStyle = 'rgba(0,255,204,0.3)';
            ctx.beginPath();
            ctx.arc(-size / 2.5, 0, size / 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
];