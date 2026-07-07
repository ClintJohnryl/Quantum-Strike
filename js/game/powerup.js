// ===== POWERUP CLASS =====

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 20;
        this.timer = 600;
        this.alpha = 1;
        this.pulse = 0;
        const types = {
            health: ['#00ff00', '♥'],
            shield: ['#00ffff', '🛡️'],
            speed: ['#ffff00', '⚡'],
            spread: ['#ff00ff', '✧'],
            qubits: ['#ffaa00', '💎'],
            bomb: ['#ff4400', '💣'],
            health_big: ['#00ff88', '💚']
        };
        [this.color, this.icon] = types[type] || ['#fff', '?'];
    }

    update() {
        this.timer--;
        this.pulse += 0.05;
        if (this.timer < 120) this.alpha = this.timer / 120;
    }

    draw(ctx, camX, camY, zoom) {
        const sx = this.x - camX + W / 2 / zoom;
        const sy = this.y - camY + H / 2 / zoom;
        if (sx < -50 || sx > W / zoom + 50 || sy < -50 || sy > H / zoom + 50) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(sx * zoom, sy * zoom);
        ctx.scale(zoom * (1 + Math.sin(this.pulse) * 0.2), zoom * (1 + Math.sin(this.pulse) * 0.2));
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace(')', ',0.3)').replace('rgb', 'rgba');
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        ctx.restore();
    }
}