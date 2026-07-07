// ===== PLAYER DRAWING =====

const PlayerDrawing = {
    drawNametag(ctx, sx, sy, zoom) {
        const username = this.nametag.username;
        const rank = this.nametag.rank;
        
        const text = `${username} - ${rank.title}`;
        ctx.font = 'bold 14px Orbitron, Segoe UI, sans-serif';
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const padding = 14;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = 34;
        const boxX = (sx + this.size / 2) * zoom - boxWidth / 2;
        const boxY = (sy - 30) * zoom - boxHeight;
        
        const glowGrad = ctx.createRadialGradient(
            (sx + this.size / 2) * zoom, (sy - 30) * zoom - boxHeight / 2, 0,
            (sx + this.size / 2) * zoom, (sy - 30) * zoom - boxHeight / 2, boxWidth * 0.8
        );
        glowGrad.addColorStop(0, rank.color + '20');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc((sx + this.size / 2) * zoom, (sy - 30) * zoom - boxHeight / 2, boxWidth * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(0, 10, 20, 0.85)';
        ctx.shadowColor = rank.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = rank.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = rank.color;
        ctx.font = 'bold 14px Orbitron, Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = rank.color;
        ctx.shadowBlur = 10;
        ctx.fillText(text, (sx + this.size / 2) * zoom, (sy - 30) * zoom - boxHeight / 2 + 2);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = rank.color;
        ctx.globalAlpha = 0.6;
        ctx.font = '10px Orbitron, Segoe UI, sans-serif';
        ctx.fillText(rank.title, (sx + this.size / 2) * zoom, (sy - 30) * zoom - boxHeight / 2 + 18);
        ctx.globalAlpha = 1;
    },

    draw(ctx, camX, camY, zoom) {
        if (!this.alive) return;
        
        // Apply recoil shake to camera
        let shakeX = 0;
        let shakeY = 0;
        if (this.recoilShake > 0) {
            shakeX = (Math.random() - 0.5) * this.recoilShake * 2;
            shakeY = (Math.random() - 0.5) * this.recoilShake * 2;
        }
        
        const sx = this.x - camX + W / 2 / zoom + shakeX / zoom;
        const sy = this.y - camY + H / 2 / zoom + shakeY / zoom;
        if (sx < -100 || sx > W / zoom + 100 || sy < -100 || sy > H / zoom + 100) return;

        // === RELATIVISTIC TIME DILATION GLOW ===
        // Ship glows more at high speeds (Cherenkov-like effect)
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const speedRatio = Math.min(1, currentSpeed / this._speedOfLight);
        const glowIntensity = speedRatio * 0.5;
        
        if (glowIntensity > 0.1) {
            // Blue shift effect - ship glows blue at high speeds
            const blueShift = ctx.createRadialGradient(
                (sx + this.size / 2) * zoom, (sy + this.size / 2) * zoom, 0,
                (sx + this.size / 2) * zoom, (sy + this.size / 2) * zoom, this.size * zoom * 2
            );
            blueShift.addColorStop(0, `rgba(68, 136, 255, ${glowIntensity * 0.3})`);
            blueShift.addColorStop(0.5, `rgba(68, 136, 255, ${glowIntensity * 0.15})`);
            blueShift.addColorStop(1, 'rgba(68, 136, 255, 0)');
            ctx.fillStyle = blueShift;
            ctx.beginPath();
            ctx.arc((sx + this.size / 2) * zoom, (sy + this.size / 2) * zoom, this.size * zoom * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        this.drawNametag(ctx, sx, sy, zoom);
        this.drawAccessories(ctx, sx, sy, zoom);
        this.drawTrail(ctx, camX, camY, zoom);
        this.drawShip(ctx, sx, sy, zoom);
        this.drawBullets(ctx, camX, camY, zoom);
        this.drawDronesWrapper(ctx, camX, camY, zoom);
        this.drawHPBar(ctx, sx, sy, zoom);
        
        // === RELATIVISTIC SPEED INDICATOR ===
        if (currentSpeed > 0.5) {
            const speedPercent = Math.round((currentSpeed / this._shipMaxSpeed) * 100);
            const maxPercent = Math.round(this._maxSpeedPercent * 100);
            
            // Color based on how close to max speed
            let color = '#44ff44'; // Green - safe speed
            if (speedPercent > 80) color = '#ffaa00'; // Yellow - high speed
            if (speedPercent > 95) color = '#ff4444'; // Red - near limit
            
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.7;
            ctx.font = '10px Orbitron, Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            // Show speed and class info
            const classLabel = SHIP_CLASSES[this.shipClass]?.label || 'Ship';
            ctx.fillText(
                `${classLabel}: ${speedPercent}% of ${maxPercent}% c`, 
                (sx + this.size / 2) * zoom, 
                (sy + this.size + 5) * zoom
            );
            ctx.globalAlpha = 1;
        }
    },

    drawAccessories(ctx, sx, sy, zoom) {
        this.equippedAccessories.forEach(id => {
            const acc = ACCESSORIES[id];
            if (acc && acc.draw) {
                ctx.save();
                ctx.translate(sx * zoom, sy * zoom);
                ctx.scale(zoom, zoom);
                ctx.translate(this.size / 2, this.size / 2);
                acc.draw(ctx, this, this.size);
                ctx.restore();
            }
        });
    },

    drawTrail(ctx, camX, camY, zoom) {
        this.trail.forEach(t => {
            const tx = t.x - camX + W / 2 / zoom;
            const ty = t.y - camY + H / 2 / zoom;
            ctx.fillStyle = t.color.replace(')', `,${t.alpha * 0.5})`).replace('rgb', 'rgba');
            ctx.fillRect(tx * zoom, ty * zoom, t.size * zoom, t.size * zoom);
        });
    },

    drawShip(ctx, sx, sy, zoom) {
        ctx.save();
        ctx.translate(sx * zoom, sy * zoom);
        ctx.scale(zoom, zoom);
        ctx.translate(this.size / 2, this.size / 2);
        ctx.rotate(this.angle);

        this.equippedAttachments.forEach(id => {
            const att = ATTACHMENTS[id];
            if (att && att.draw) att.draw(ctx, this, this.size);
        });

        // === RELATIVISTIC LENGTH CONTRACTION ===
        // Ship contracts in direction of motion
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        let scaleX = 1;
        let scaleY = 1;
        
        if (currentSpeed > 0.1) {
            const contraction = this._lengthContraction || 1;
            // Contract along direction of motion
            const angle = Math.atan2(this.vy, this.vx);
            // Apply contraction in direction of motion
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            // We'll let the ship rendering handle the visual contraction
            // by modifying the draw scale
        }

        if (this.shipData && this.shipData.draw) {
            this.shipData.draw.call(this, ctx, this.size);
        } else {
            ctx.beginPath();
            ctx.moveTo(this.size / 2, 0);
            ctx.lineTo(-this.size / 2, -this.size / 3);
            ctx.lineTo(-this.size / 3, 0);
            ctx.lineTo(-this.size / 2, this.size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        const classInfo = SHIP_CLASSES[this.shipClass] || SHIP_CLASSES.light;
        ctx.strokeStyle = classInfo.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (this.isCarrier) {
            ctx.fillStyle = '#00ffcc';
            ctx.globalAlpha = 0.3;
            for (let i = -1; i <= 1; i += 2) {
                ctx.fillRect(-this.size / 3, i * this.size / 5 - 1, this.size / 5, 2);
            }
            ctx.globalAlpha = 1;
        }

        if (this.hasStealth) {
            ctx.fillStyle = 'rgba(136,68,255,0.15)';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.shieldActive) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2 + 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (this.abilityActive) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2 + 15, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (this.autoEnabled && this.getAutocannonData()) {
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Strafe indicators
        if (this.strafingLeft || this.strafingRight) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.font = `${this.size / 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (this.strafingLeft) {
                ctx.fillText('◄', -this.size / 1.5, 0);
            }
            if (this.strafingRight) {
                ctx.fillText('►', this.size / 1.5, 0);
            }
        }

        if (this.thrusting) {
            ctx.beginPath();
            ctx.moveTo(-this.size / 2, 0);
            ctx.lineTo(-this.size / 2 - 15, -8);
            ctx.lineTo(-this.size / 2 - 15, 8);
            ctx.closePath();
            const grad = ctx.createLinearGradient(-this.size / 2, 0, -this.size / 2 - 15, 0);
            grad.addColorStop(0, '#ffaa00');
            grad.addColorStop(1, 'rgba(255,100,0,0)');
            ctx.fillStyle = grad;
            ctx.fill();
        }
        if (this.reversing) {
            ctx.beginPath();
            ctx.moveTo(this.size / 2, 0);
            ctx.lineTo(this.size / 2 + 10, -6);
            ctx.lineTo(this.size / 2 + 10, 6);
            ctx.closePath();
            const grad = ctx.createLinearGradient(this.size / 2, 0, this.size / 2 + 10, 0);
            grad.addColorStop(0, '#ff6600');
            grad.addColorStop(1, 'rgba(255,100,0,0)');
            ctx.fillStyle = grad;
            ctx.fill();
        }
        ctx.restore();
    },

    drawHPBar(ctx, sx, sy, zoom) {
        const barWidth = 40 * zoom;
        const barHeight = 4 * zoom;
        const barX = (sx + this.size / 2) * zoom - barWidth / 2;
        const barY = (sy - 15) * zoom;
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight);
    }
};