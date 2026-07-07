// ===== PLAYER BULLET DRAWING =====

const PlayerBullets = {
    drawBullets(ctx, camX, camY, zoom) {
        if (!this.isCarrier) {
            this.bullets.forEach(b => {
                const bx = (b.x - camX + W / 2 / zoom) * zoom;
                const by = (b.y - camY + H / 2 / zoom) * zoom;
                
                if (b.heavyRailgun) {
                    this.drawHeavyRailgunBullet(ctx, bx, by, b, zoom);
                    return;
                }
                
                this.drawNormalBullet(ctx, bx, by, b, zoom);
            });
        }

        this.secondaryBullets.forEach(b => {
            const bx = (b.x - camX + W / 2 / zoom) * zoom;
            const by = (b.y - camY + H / 2 / zoom) * zoom;
            const size = (b.size || 6);
            const grad = ctx.createRadialGradient(bx, by, 0, bx, by, size * zoom * 2);
            grad.addColorStop(0, b.color || '#f80');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(bx - size * zoom * 2, by - size * zoom * 2, size * zoom * 4, size * zoom * 4);
            ctx.fillStyle = b.color || '#f80';
            ctx.fillRect(bx - size * zoom / 2, by - size * zoom / 2, size * zoom, size * zoom);
            if (b.homing) {
                ctx.strokeStyle = '#ff8800';
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(bx, by, 12 * zoom, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            if (b.emp) {
                ctx.strokeStyle = '#00ccff';
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.arc(bx, by, 20 * zoom, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        });

        this.autocannonBullets.forEach(b => {
            const bx = (b.x - camX + W / 2 / zoom) * zoom;
            const by = (b.y - camY + H / 2 / zoom) * zoom;
            const size = (b.size || 5);
            
            if (b.isBattleship) {
                this.drawBattleshipBullet(ctx, bx, by, b, size, zoom);
                return;
            }
            
            this.drawAutoCannonBullet(ctx, bx, by, b, size, zoom);
        });
    },

    drawHeavyRailgunBullet(ctx, bx, by, b, zoom) {
        const glowSize = 120 * zoom * b.glowIntensity;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, glowSize);
        grad.addColorStop(0, 'rgba(255, 68, 255, 0.9)');
        grad.addColorStop(0.1, 'rgba(255, 100, 255, 0.6)');
        grad.addColorStop(0.3, 'rgba(200, 50, 255, 0.3)');
        grad.addColorStop(0.6, 'rgba(150, 0, 255, 0.1)');
        grad.addColorStop(1, 'rgba(100, 0, 200, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        const coreGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 30 * zoom);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGrad.addColorStop(0.3, 'rgba(255, 200, 255, 0.8)');
        coreGrad.addColorStop(0.7, 'rgba(255, 100, 255, 0.4)');
        coreGrad.addColorStop(1, 'rgba(255, 50, 255, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(bx, by, 30 * zoom, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowColor = '#ff44ff';
        ctx.shadowBlur = 40 * zoom;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx - 4 * zoom, by - 4 * zoom, 8 * zoom, 8 * zoom);
        ctx.shadowBlur = 0;
        
        if (b.glowTrail && b.glowTrail.length > 1) {
            for (let t = 0; t < b.glowTrail.length - 1; t++) {
                const trailAlpha = t / b.glowTrail.length * 0.5;
                const trailSize = (t / b.glowTrail.length) * 20 * zoom;
                const grad2 = ctx.createRadialGradient(
                    b.glowTrail[t].x * zoom, b.glowTrail[t].y * zoom, 0,
                    b.glowTrail[t].x * zoom, b.glowTrail[t].y * zoom, trailSize
                );
                grad2.addColorStop(0, `rgba(255, 68, 255, ${trailAlpha * 0.5})`);
                grad2.addColorStop(1, 'rgba(255, 68, 255, 0)');
                ctx.fillStyle = grad2;
                ctx.beginPath();
                ctx.arc(b.glowTrail[t].x * zoom, b.glowTrail[t].y * zoom, trailSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        b.glowTrail = b.glowTrail || [];
        b.glowTrail.push({ x: bx / zoom, y: by / zoom });
        if (b.glowTrail.length > 20) b.glowTrail.shift();
    },

    drawNormalBullet(ctx, bx, by, b, zoom) {
        if (b.trail && b.trailPoints.length > 1) {
            ctx.beginPath();
            ctx.moveTo(b.trailPoints[0].x * zoom, b.trailPoints[0].y * zoom);
            for (let i = 1; i < b.trailPoints.length; i++) {
                ctx.lineTo(b.trailPoints[i].x * zoom, b.trailPoints[i].y * zoom);
            }
            ctx.strokeStyle = b.color.replace(')', ',0.5)').replace('rgb', 'rgba');
            ctx.lineWidth = b.size * zoom * 0.5;
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(bx, by, b.size * zoom * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = b.color.replace(')', ',0.3)').replace('rgb', 'rgba');
        ctx.fill();
        ctx.fillStyle = b.color;
        ctx.fillRect(bx - b.size * zoom / 2, by - b.size * zoom / 2, b.size * zoom, b.size * zoom);
        b.trailPoints.push({ x: bx / zoom, y: by / zoom });
        if (b.trailPoints.length > 5) b.trailPoints.shift();
    },

    drawBattleshipBullet(ctx, bx, by, b, size, zoom) {
        const glowSize = 45 * zoom * (b.glowIntensity || 0.8);
        
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, glowSize);
        grad.addColorStop(0, 'rgba(255, 68, 204, 0.8)');
        grad.addColorStop(0.2, 'rgba(255, 100, 220, 0.5)');
        grad.addColorStop(0.5, 'rgba(200, 50, 255, 0.2)');
        grad.addColorStop(1, 'rgba(150, 0, 200, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        const midGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 20 * zoom);
        midGrad.addColorStop(0, 'rgba(255, 200, 255, 0.9)');
        midGrad.addColorStop(0.3, 'rgba(255, 150, 255, 0.6)');
        midGrad.addColorStop(0.7, 'rgba(255, 68, 204, 0.3)');
        midGrad.addColorStop(1, 'rgba(255, 68, 204, 0)');
        ctx.fillStyle = midGrad;
        ctx.beginPath();
        ctx.arc(bx, by, 20 * zoom, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowColor = '#ff44cc';
        ctx.shadowBlur = 25 * zoom;
        const coreGrad = ctx.createRadialGradient(bx, by, 0, bx, by, size * zoom * 0.8);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGrad.addColorStop(0.5, 'rgba(255, 200, 255, 0.8)');
        coreGrad.addColorStop(1, 'rgba(255, 68, 204, 0.4)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(bx, by, size * zoom * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10 * zoom;
        ctx.beginPath();
        ctx.arc(bx, by, size * zoom * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        if (b.trailPoints && b.trailPoints.length > 1) {
            for (let t = 0; t < b.trailPoints.length - 1; t++) {
                const trailAlpha = (t / b.trailPoints.length) * 0.4;
                const trailSize = (t / b.trailPoints.length) * 12 * zoom;
                const trailGrad = ctx.createRadialGradient(
                    b.trailPoints[t].x * zoom, b.trailPoints[t].y * zoom, 0,
                    b.trailPoints[t].x * zoom, b.trailPoints[t].y * zoom, trailSize
                );
                trailGrad.addColorStop(0, `rgba(255, 68, 204, ${trailAlpha * 0.5})`);
                trailGrad.addColorStop(1, 'rgba(255, 68, 204, 0)');
                ctx.fillStyle = trailGrad;
                ctx.beginPath();
                ctx.arc(b.trailPoints[t].x * zoom, b.trailPoints[t].y * zoom, trailSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        b.trailPoints = b.trailPoints || [];
        b.trailPoints.push({ x: bx / zoom, y: by / zoom });
        if (b.trailPoints.length > 15) b.trailPoints.shift();
    },

    drawAutoCannonBullet(ctx, bx, by, b, size, zoom) {
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, size * zoom * 2.5);
        grad.addColorStop(0, b.color || '#fa0');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(bx - size * zoom * 2.5, by - size * zoom * 2.5, size * zoom * 5, size * zoom * 5);
        ctx.fillStyle = b.color || '#fa0';
        ctx.shadowColor = b.color || '#fa0';
        ctx.shadowBlur = 10 * zoom;
        ctx.fillRect(bx - size * zoom / 2, by - size * zoom / 2, size * zoom, size * zoom);
        ctx.shadowBlur = 0;
        if (b.trail && b.trailPoints && b.trailPoints.length > 1) {
            ctx.beginPath();
            ctx.moveTo(b.trailPoints[0].x * zoom, b.trailPoints[0].y * zoom);
            for (let i = 1; i < b.trailPoints.length; i++) {
                ctx.lineTo(b.trailPoints[i].x * zoom, b.trailPoints[i].y * zoom);
            }
            ctx.strokeStyle = (b.color || '#fa0').replace(')', ',0.3)').replace('rgb', 'rgba');
            ctx.lineWidth = (b.size || 5) * zoom * 0.6;
            ctx.stroke();
        }
        b.trailPoints = b.trailPoints || [];
        b.trailPoints.push({ x: bx / zoom, y: by / zoom });
        if (b.trailPoints.length > 5) b.trailPoints.shift();
    },

    drawDronesWrapper(ctx, camX, camY, zoom) {
        this.drones.forEach(d => d.draw(ctx, camX, camY, zoom));
    }
};