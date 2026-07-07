// ===== DRONE CLASS =====

class Drone {
    constructor(x, y, owner, bayData, index) {
        this.x = x + (Math.random() - 0.5) * 80;
        this.y = y + (Math.random() - 0.5) * 80;
        this.owner = owner;
        this.bayData = bayData;
        this.size = bayData.droneSize || 20;
        this.hp = bayData.droneHp || 20;
        this.maxHp = this.hp;
        this.speed = bayData.droneSpeed || 3.5;
        this.damage = bayData.droneDamage || 2;
        this.range = bayData.droneRange || 450;
        this.fireRate = bayData.droneFireRate || 300;
        this.alive = true;
        this.angle = Math.random() * Math.PI * 2;
        this.vx = 0;
        this.vy = 0;
        this.lastShot = 0;
        this.target = null;
        this.index = index;
        this.color = bayData.color || '#00ffcc';
        this.orbitAngle = Math.random() * Math.PI * 2;
        this.orbitRadius = 80 + Math.random() * 60;
        this.command = 'attack';
        this.glowPulse = Math.random() * Math.PI * 2;
        this.desiredRange = 120 + Math.random() * 60;
        this.avoidanceRadius = 80;
    }

    update(player) {
        if (!this.alive) return;
        this.glowPulse += 0.05;

        // Asteroid avoidance
        let avoidX = 0,
            avoidY = 0;
        for (const a of Game.asteroids) {
            if (!a.alive) continue;
            const dx = this.x - a.x;
            const dy = this.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < a.size + this.avoidanceRadius) {
                const push = 3 / (dist + 1);
                avoidX += dx * push;
                avoidY += dy * push;
            }
        }
        this.vx += avoidX * 0.05;
        this.vy += avoidY * 0.05;

        // Asteroid collision
        for (const a of Game.asteroids) {
            if (!a.alive) continue;
            const dx = this.x - a.x;
            const dy = this.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < a.size + this.size / 2) {
                const push = 0.5 / (dist + 1);
                this.vx += dx * push;
                this.vy += dy * push;
                this.takeDamage(3);
                break;
            }
        }

        const distToPlayer = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);

        // Find best target
        let bestTarget = null;
        let bestScore = -Infinity;
        const enemies = Game.enemies.filter(e => e.alive);

        if (this.command === 'defend') {
            for (const e of enemies) {
                const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
                if (d < this.range * 1.2) {
                    const score = 1000 - d;
                    if (score > bestScore) { bestScore = score;
                        bestTarget = e; }
                }
            }
        } else if (this.command === 'clear') {
            for (const e of enemies) {
                const d = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (d < this.range * 1.5) {
                    const hpRatio = e.hp / e.maxHp;
                    const score = (1 - hpRatio) * 1500 - d * 0.5;
                    if (score > bestScore) { bestScore = score;
                        bestTarget = e; }
                }
            }
        } else {
            for (const e of enemies) {
                const d = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (d < this.range) {
                    const score = 1000 - d;
                    if (score > bestScore) { bestScore = score;
                        bestTarget = e; }
                }
            }
        }

        if (bestTarget) {
            this.attackTarget(bestTarget, player);
        } else if (distToPlayer > 200) {
            this.orbitAround(player);
        } else {
            this.orbitAround(player);
        }

        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.speed * 1.2) {
            this.vx = (this.vx / speed) * this.speed * 1.2;
            this.vy = (this.vy / speed) * this.speed * 1.2;
        }
    }

    orbitAround(player) {
        this.orbitAngle += 0.015;
        const targetX = player.x + Math.cos(this.orbitAngle + this.index * 1.5) * this.orbitRadius;
        const targetY = player.y + Math.sin(this.orbitAngle + this.index * 1.5) * this.orbitRadius;
        this.vx += (targetX - this.x) * 0.025;
        this.vy += (targetY - this.y) * 0.025;
        this.angle += 0.02;

        this.x += this.vx;
        this.y += this.vy;
        this.x = Math.max(5, Math.min(mapWidth - 5, this.x));
        this.y = Math.max(5, Math.min(mapHeight - 5, this.y));
    }

    attackTarget(target, player) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetAngle = Math.atan2(dy, dx);

        // Keep at desired range
        const rangeDiff = d - this.desiredRange;
        const approachSpeed = Math.min(Math.abs(rangeDiff) * 0.03, 0.5);
        const dir = rangeDiff > 0 ? 1 : -1;

        this.vx += (dx / d) * approachSpeed * dir * 0.5;
        this.vy += (dy / d) * approachSpeed * dir * 0.5;

        // Strafe around target
        const strafeAngle = targetAngle + Math.PI / 2 * (Math.sin(this.glowPulse + this.index) > 0 ? 1 : -1);
        this.vx += Math.cos(strafeAngle) * 0.06;
        this.vy += Math.sin(strafeAngle) * 0.06;

        this.angle = targetAngle;

        this.x += this.vx;
        this.y += this.vy;
        this.x = Math.max(5, Math.min(mapWidth - 5, this.x));
        this.y = Math.max(5, Math.min(mapHeight - 5, this.y));

        // SHOOT at target
        if (d < this.range) {
            const now = Date.now();
            if (now - this.lastShot > this.fireRate) {
                this.lastShot = now;
                const spread = 0.08;
                const angle = targetAngle + (Math.random() - 0.5) * spread;
                // Add bullet to Game.droneBullets
                if (window.Game) {
                    Game.droneBullets.push({
                        x: this.x + Math.cos(angle) * this.size / 2,
                        y: this.y + Math.sin(angle) * this.size / 2,
                        dx: Math.cos(angle),
                        dy: Math.sin(angle),
                        damage: this.damage,
                        color: this.color,
                        size: 4,
                        life: 50,
                        owner: this.owner
                    });
                }
            }
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.alive = false;
            spawnExplosion(this.x, this.y, this.color, 20);
        }
    }

    draw(ctx, camX, camY, zoom) {
        if (!this.alive) return;
        const sx = this.x - camX + W / 2 / zoom;
        const sy = this.y - camY + H / 2 / zoom;
        if (sx < -50 || sx > W / zoom + 50 || sy < -50 || sy > H / zoom + 50) return;

        ctx.save();
        ctx.translate(sx * zoom, sy * zoom);
        ctx.scale(zoom, zoom);
        ctx.translate(this.size / 2, this.size / 2);
        ctx.rotate(this.angle);

        const glowSize = this.size * 1.8 + Math.sin(this.glowPulse) * 3;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        grad.addColorStop(0, this.color + '30');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.moveTo(this.size / 2, 0);
        ctx.lineTo(-this.size / 2, -this.size / 3);
        ctx.lineTo(-this.size / 4, -this.size / 6);
        ctx.lineTo(-this.size / 4, this.size / 6);
        ctx.lineTo(-this.size / 2, this.size / 3);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff30';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + this.glowPulse * 0.5;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * this.size / 3, Math.sin(a) * this.size / 3);
            ctx.lineTo(Math.cos(a) * this.size / 1.6, Math.sin(a) * this.size / 1.6);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        const cmdColors = { attack: '#ff4444', defend: '#44ff44', clear: '#ff8800' };
        ctx.strokeStyle = cmdColors[this.command] || '#00ffcc';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 1.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.restore();

        if (this.hp < this.maxHp) {
            const barW = 24 * zoom;
            const barH = 3 * zoom;
            const bx = (sx + this.size / 2) * zoom - barW / 2;
            const by = (sy - 10) * zoom;
            ctx.fillStyle = 'rgba(255,0,0,0.4)';
            ctx.fillRect(bx, by, barW, barH);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(bx, by, barW * (this.hp / this.maxHp), barH);
        }
    }
}