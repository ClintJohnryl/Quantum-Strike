// ===== PLAYER MOVEMENT - Einsteinian Mechanics =====

const PlayerMovement = {
    updateMovement() {
        if (!this.alive) return;
        
        // === ROTATION - Angular Momentum ===
        const angularAccel = 0.04 * this.agility;
        
        if (this.rotatingLeft) {
            this.angularVelocity -= angularAccel;
        }
        if (this.rotatingRight) {
            this.angularVelocity += angularAccel;
        }
        
        this.angularVelocity *= 0.92;
        this.angularVelocity = Math.max(-this.maxAngularVelocity, Math.min(this.maxAngularVelocity, this.angularVelocity));
        this.angle += this.angularVelocity;
        
        // === RELATIVISTIC PHYSICS ===
        const c = 10; // Speed of light (game units per frame)
        
        // === WEIGHT-BASED SPEED LIMITS ===
        // Different ship classes have different max speeds (as % of light speed)
        const shipWeight = this.shipData.stats.weight || 1000;
        let maxSpeedPercent = 1.0; // Default 100% of light speed
        
        // Assign speed limits based on weight
        if (shipWeight < 1000) {
            // Light ships (Scout, Fighter) - Can reach up to 90-100% light speed
            maxSpeedPercent = 0.90 + (1000 - shipWeight) / 10000; // 0.90 - 0.98
        } else if (shipWeight < 2000) {
            // Medium ships (Gunship, Cruiser) - Can reach 65-80% light speed
            maxSpeedPercent = 0.65 + (2000 - shipWeight) / 10000; // 0.65 - 0.80
        } else if (shipWeight < 4000) {
            // Heavy ships (Tanks) - Can reach 50-60% light speed
            maxSpeedPercent = 0.50 + (4000 - shipWeight) / 20000; // 0.50 - 0.60
        } else if (shipWeight < 6000) {
            // Super Heavy (Battleship, Carrier) - Can reach 35-45% light speed
            maxSpeedPercent = 0.35 + (6000 - shipWeight) / 30000; // 0.35 - 0.45
        } else {
            // Ultra Heavy - Can reach 25-35% light speed
            maxSpeedPercent = 0.25 + (8000 - Math.min(shipWeight, 8000)) / 40000;
        }
        
        // Clamp to reasonable values
        maxSpeedPercent = Math.max(0.20, Math.min(0.98, maxSpeedPercent));
        
        // Calculate max speed for this ship
        const shipMaxSpeed = c * maxSpeedPercent;
        
        // Get current speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        // Calculate Lorentz factor (gamma)
        let gamma = 1;
        const effectiveMaxSpeed = Math.min(c * 0.99, shipMaxSpeed);
        if (currentSpeed < effectiveMaxSpeed) {
            const vOverC = currentSpeed / c;
            gamma = 1 / Math.sqrt(1 - vOverC * vOverC);
        }
        
        // === RELATIVISTIC MASS INCREASE ===
        const restMass = shipWeight;
        const relativisticMass = restMass * gamma;
        
        // === THRUST WITH WEIGHT-BASED LIMITS ===
        const baseThrust = 0.25 * this.baseSpeed * this.speedBoost;
        
        // Thrust effectiveness decreases as you approach your ship's max speed
        const speedRatio = currentSpeed / shipMaxSpeed;
        const thrustFactor = Math.max(0.05, 1 - speedRatio * speedRatio * 0.8);
        
        // Forward thrust
        if (this.thrusting) {
            const accelX = Math.cos(this.angle) * baseThrust * thrustFactor;
            const accelY = Math.sin(this.angle) * baseThrust * thrustFactor;
            
            // Apply acceleration with relativistic mass consideration
            this.vx += accelX / (gamma * 0.5 + 0.5);
            this.vy += accelY / (gamma * 0.5 + 0.5);
            this.trail.push({ x: this.x, y: this.y, alpha: 1, size: 3, color: '#0ff' });
        }
        
        // Reverse thrust
        if (this.reversing) {
            const accelX = -Math.cos(this.angle) * baseThrust * 0.5 * thrustFactor;
            const accelY = -Math.sin(this.angle) * baseThrust * 0.5 * thrustFactor;
            this.vx += accelX / (gamma * 0.5 + 0.5);
            this.vy += accelY / (gamma * 0.5 + 0.5);
            this.trail.push({ x: this.x + this.size, y: this.y, alpha: 1, size: 3, color: '#f80' });
        }

        // Strafe Left/Right
        if (this.strafingLeft) {
            const accelX = Math.sin(this.angle) * baseThrust * 0.6 * thrustFactor;
            const accelY = -Math.cos(this.angle) * baseThrust * 0.6 * thrustFactor;
            this.vx += accelX / (gamma * 0.5 + 0.5);
            this.vy += accelY / (gamma * 0.5 + 0.5);
            this.trail.push({ x: this.x, y: this.y, alpha: 0.5, size: 2, color: '#0ff' });
        }
        if (this.strafingRight) {
            const accelX = -Math.sin(this.angle) * baseThrust * 0.6 * thrustFactor;
            const accelY = Math.cos(this.angle) * baseThrust * 0.6 * thrustFactor;
            this.vx += accelX / (gamma * 0.5 + 0.5);
            this.vy += accelY / (gamma * 0.5 + 0.5);
            this.trail.push({ x: this.x, y: this.y, alpha: 0.5, size: 2, color: '#0ff' });
        }

        // === ENFORCE SHIP-SPECIFIC SPEED LIMIT ===
        const newSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (newSpeed > shipMaxSpeed * 0.99) {
            const ratio = (shipMaxSpeed * 0.99) / newSpeed;
            this.vx *= ratio;
            this.vy *= ratio;
        }

        // === RELATIVISTIC DRAG ===
        // Drag increases as you approach your ship's max speed
        if (currentSpeed > 0.01) {
            const dragCoefficient = 0.001 * (1 + (currentSpeed / shipMaxSpeed) * 3);
            this.vx -= this.vx * dragCoefficient;
            this.vy -= this.vy * dragCoefficient;
        }

        // === STORE RELATIVISTIC PROPERTIES ===
        if (currentSpeed > 0.1) {
            const contraction = 1 / gamma;
            this._lengthContraction = contraction;
            this._gamma = gamma;
            this._relativisticMass = relativisticMass;
            this._maxSpeedPercent = maxSpeedPercent;
            this._shipMaxSpeed = shipMaxSpeed;
        } else {
            this._lengthContraction = 1;
            this._gamma = 1;
            this._relativisticMass = restMass;
            this._maxSpeedPercent = maxSpeedPercent;
            this._shipMaxSpeed = shipMaxSpeed;
        }

        // === UPDATE POSITION ===
        this.x += this.vx;
        this.y += this.vy;
        this.x = Math.max(0, Math.min(mapWidth - this.size, this.x));
        this.y = Math.max(0, Math.min(mapHeight - this.size, this.y));

        // Trail decay
        this.trail.forEach(t => t.alpha -= 0.05);
        this.trail = this.trail.filter(t => t.alpha > 0);
    }
};