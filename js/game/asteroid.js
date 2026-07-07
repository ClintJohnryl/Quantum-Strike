// ===== ASTEROID CLASS =====

class Asteroid {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.alive = true;
        this.hp = size * 2; // HP based on size
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.vertices = [];
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            this.vertices.push({
                x: Math.cos(a) * size * (0.7 + Math.random() * 0.3),
                y: Math.sin(a) * size * (0.7 + Math.random() * 0.3)
            });
        }
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.mass = size * size / 4;
    }

    update() {
        this.angle += this.rotationSpeed;
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > mapWidth) this.vx *= -1;
        if (this.y < 0 || this.y > mapHeight) this.vy *= -1;
        this.x = Math.max(0, Math.min(mapWidth, this.x));
        this.y = Math.max(0, Math.min(mapHeight, this.y));
        // Minimal drag
        this.vx *= 0.9995;
        this.vy *= 0.9995;
    }

    draw(ctx, camX, camY, zoom) {
        if (!this.alive) return;
        const sx = this.x - camX + W / 2 / zoom;
        const sy = this.y - camY + H / 2 / zoom;
        if (sx < -this.size * 2 || sx > W / zoom + this.size * 2 ||
            sy < -this.size * 2 || sy > H / zoom + this.size * 2) return;
        ctx.save();
        ctx.translate(sx * zoom, sy * zoom);
        ctx.scale(zoom, zoom);
        ctx.rotate(this.angle);
        ctx.beginPath();
        this.vertices.forEach((v, i) => {
            i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y);
        });
        ctx.closePath();
        ctx.fillStyle = '#444';
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}