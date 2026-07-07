// ===== ENEMY CLASS - WITH MULTIPLE TYPES =====

// Enemy type definitions
const ENEMY_TYPES = {
    // Basic enemies
    scout: {
        type: 'scout',
        label: 'Scout',
        size: 30,
        hp: 1.5,
        speed: 3.5,
        damage: 10,
        shootCooldown: 1800,
        color: '#33ff33',
        icon: '◆',
        score: 50,
        qubits: 5,
        xp: 3,
        bulletSize: 3,
        bulletSpeed: 8,
        bulletColor: '#33ff33',
        special: null
    },
    fighter: {
        type: 'fighter',
        label: 'Fighter',
        size: 35,
        hp: 2.5,
        speed: 3.0,
        damage: 15,
        shootCooldown: 1500,
        color: '#ffaa33',
        icon: '▲',
        score: 75,
        qubits: 8,
        xp: 5,
        bulletSize: 4,
        bulletSpeed: 9,
        bulletColor: '#ffaa33',
        special: null
    },
    tank: {
        type: 'tank',
        label: 'Tank',
        size: 45,
        hp: 6,
        speed: 1.8,
        damage: 20,
        shootCooldown: 2000,
        color: '#ff6633',
        icon: '■',
        score: 100,
        qubits: 12,
        xp: 8,
        bulletSize: 6,
        bulletSpeed: 7,
        bulletColor: '#ff6633',
        special: null
    },
    sniper: {
        type: 'sniper',
        label: 'Sniper',
        size: 28,
        hp: 1.8,
        speed: 2.0,
        damage: 35,
        shootCooldown: 3000,
        color: '#ff33ff',
        icon: '◈',
        score: 120,
        qubits: 15,
        xp: 10,
        bulletSize: 4,
        bulletSpeed: 15,
        bulletColor: '#ff33ff',
        special: 'sniper'
    },
    bomber: {
        type: 'bomber',
        label: 'Bomber',
        size: 40,
        hp: 3.5,
        speed: 2.2,
        damage: 25,
        shootCooldown: 2500,
        color: '#ff3333',
        icon: '●',
        score: 130,
        qubits: 18,
        xp: 12,
        bulletSize: 5,
        bulletSpeed: 5,
        bulletColor: '#ff3333',
        special: 'explosive'
    },
    swarm: {
        type: 'swarm',
        label: 'Swarm',
        size: 20,
        hp: 1,
        speed: 5.0,
        damage: 8,
        shootCooldown: 800,
        color: '#33ffff',
        icon: '✦',
        score: 40,
        qubits: 3,
        xp: 2,
        bulletSize: 2,
        bulletSpeed: 10,
        bulletColor: '#33ffff',
        special: 'swarm'
    },
    shield: {
        type: 'shield',
        label: 'Shielded',
        size: 40,
        hp: 4,
        speed: 1.5,
        damage: 12,
        shootCooldown: 1800,
        color: '#44aaff',
        icon: '◉',
        score: 110,
        qubits: 14,
        xp: 9,
        bulletSize: 4,
        bulletSpeed: 8,
        bulletColor: '#44aaff',
        special: 'shield'
    },
    // Elite enemies
    elite_scout: {
        type: 'elite_scout',
        label: 'Elite Scout',
        size: 35,
        hp: 4,
        speed: 4.5,
        damage: 18,
        shootCooldown: 1200,
        color: '#88ff88',
        icon: '◆',
        score: 150,
        qubits: 20,
        xp: 15,
        bulletSize: 4,
        bulletSpeed: 10,
        bulletColor: '#88ff88',
        special: null,
        isElite: true
    },
    elite_fighter: {
        type: 'elite_fighter',
        label: 'Elite Fighter',
        size: 40,
        hp: 5,
        speed: 3.8,
        damage: 25,
        shootCooldown: 1000,
        color: '#ffcc44',
        icon: '▲',
        score: 180,
        qubits: 25,
        xp: 18,
        bulletSize: 5,
        bulletSpeed: 11,
        bulletColor: '#ffcc44',
        special: null,
        isElite: true
    },
    elite_tank: {
        type: 'elite_tank',
        label: 'Elite Tank',
        size: 55,
        hp: 12,
        speed: 1.5,
        damage: 30,
        shootCooldown: 1500,
        color: '#ff8844',
        icon: '■',
        score: 200,
        qubits: 30,
        xp: 22,
        bulletSize: 7,
        bulletSpeed: 6,
        bulletColor: '#ff8844',
        special: null,
        isElite: true
    },
    // Boss enemies
    boss_standard: {
        type: 'boss_standard',
        label: 'Boss',
        size: 80,
        hp: 30,
        speed: 1.2,
        damage: 40,
        shootCooldown: 800,
        color: '#ff00ff',
        icon: '⬡',
        score: 500,
        qubits: 60,
        xp: 40,
        bulletSize: 6,
        bulletSpeed: 8,
        bulletColor: '#ff00ff',
        special: 'boss',
        isBoss: true
    },
    boss_heavy: {
        type: 'boss_heavy',
        label: 'Heavy Boss',
        size: 100,
        hp: 50,
        speed: 0.8,
        damage: 55,
        shootCooldown: 600,
        color: '#ff0044',
        icon: '⬡',
        score: 700,
        qubits: 80,
        xp: 55,
        bulletSize: 8,
        bulletSpeed: 6,
        bulletColor: '#ff0044',
        special: 'boss',
        isBoss: true
    },
    boss_ancient: {
        type: 'boss_ancient',
        label: 'Ancient Boss',
        size: 120,
        hp: 80,
        speed: 0.5,
        damage: 70,
        shootCooldown: 400,
        color: '#ff4400',
        icon: '⬡',
        score: 1000,
        qubits: 120,
        xp: 80,
        bulletSize: 10,
        bulletSpeed: 5,
        bulletColor: '#ff4400',
        special: 'boss',
        isBoss: true
    }
};

class AIEnemy {
    constructor(x, y, type = 'scout') {
        // Get enemy type definition
        const def = ENEMY_TYPES[type] || ENEMY_TYPES.scout;
        
        this.x = x;
        this.y = y;
        this.type = type;
        this.def = def;
        this.size = def.size;
        this.isBoss = def.isBoss || false;
        this.isElite = def.isElite || false;
        this.alive = true;
        this.angle = Math.random() * Math.PI * 2;
        this.vx = 0;
        this.vy = 0;
        this.bullets = [];
        this.lastShot = 0;
        this.aiTimer = 0;
        this.patrolAngle = Math.random() * Math.PI * 2;
        this.slowTimer = 0;
        this.targetDrone = null;
        
        // Difficulty scaling
        const diff = GameData.getDifficulty();
        const diffMult = diff === 'easy' ? 0.7 :
            diff === 'hard' ? 1.8 :
            diff === 'insane' ? 3.0 :
            diff === 'nightmare' ? 4.5 : 1;
        
        // Stats from definition with difficulty scaling
        this.hp = def.hp * diffMult * (this.isBoss ? 1.5 : 1);
        this.maxHp = this.hp;
        this.speed = def.speed * diffMult;
        this.damage = def.damage * diffMult;
        this.shootCooldown = def.shootCooldown / (this.isBoss ? 0.7 : 1);
        this.color = def.color;
        this.bulletSize = def.bulletSize;
        this.bulletSpeed = def.bulletSpeed;
        this.bulletColor = def.bulletColor;
        this.special = def.special;
        this.scoreValue = def.score;
        this.qubitsValue = def.qubits;
        this.xpValue = def.xp;
        this.label = def.label;
        this.icon = def.icon;
        
        // Shield for shielded enemies
        this.hasShield = def.special === 'shield';
        this.shieldHp = this.hasShield ? this.hp * 0.4 : 0;
        this.maxShieldHp = this.shieldHp;
        this.shieldRegenTimer = 0;
        
        // Explosive enemies
        this.explosive = def.special === 'explosive';
        
        // Swarm enemies move in groups
        this.swarmGroup = def.special === 'swarm';
        this.swarmAngle = Math.random() * Math.PI * 2;
        
        // Boss phase
        this.bossPhase = 0;
        this.bossTimer = 0;
    }
    
    update(player) {
        if (!this.alive) return;
        if (this.slowTimer > 0) this.slowTimer--;
        const speedMult = this.slowTimer > 0 ? 0.5 : 1;
        this.aiTimer--;
        this.bossTimer++;
        
        // Shield regeneration
        if (this.hasShield && this.shieldHp < this.maxShieldHp) {
            this.shieldRegenTimer++;
            if (this.shieldRegenTimer > 180) {
                this.shieldHp = Math.min(this.maxShieldHp, this.shieldHp + 1);
                this.shieldRegenTimer = 0;
            }
        }
        
        // Asteroid collision with Newtonian physics and kinetic energy damage
        for (const a of Game.asteroids) {
            if (a.alive) {
                const dx = (this.x + this.size / 2) - a.x;
                const dy = (this.y + this.size / 2) - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < a.size + this.size / 2) {
                    // Enemy mass (proportional to size)
                    const enemyMass = this.size * this.size / 4;
                    const asteroidMass = a.mass || (a.size * a.size / 4);
                    
                    // Get velocities
                    const enemyVx = this.vx;
                    const enemyVy = this.vy;
                    const asteroidVx = a.vx;
                    const asteroidVy = a.vy;
                    
                    // Collision normal
                    const nx = dx / dist;
                    const ny = dy / dist;
                    
                    // Relative velocity
                    const relativeVn = (enemyVx - asteroidVx) * nx + (enemyVy - asteroidVy) * ny;
                    
                    if (relativeVn < 0) {
                        // === CALCULATE KINETIC ENERGY DAMAGE FOR ENEMY ===
                        const impactVelocity = Math.abs(relativeVn);
                        const kineticEnergy = 0.5 * enemyMass * impactVelocity * impactVelocity / 100000;
                        
                        // Calculate damage to enemy
                        const asteroidSizeMultiplier = 0.3 + (a.size / 80);
                        let damage = kineticEnergy * 1.5 * asteroidSizeMultiplier;
                        damage = Math.max(0.5, Math.min(8, damage));
                        
                        // Apply damage to enemy
                        this.hp -= damage;
                        
                        // Physics response
                        const restitution = 0.2;
                        const impulse = -(1 + restitution) * relativeVn / (1/enemyMass + 1/asteroidMass);
                        
                        // Apply impulse
                        this.vx += (impulse * nx) / enemyMass;
                        this.vy += (impulse * ny) / enemyMass;
                        a.vx -= (impulse * nx) / asteroidMass;
                        a.vy -= (impulse * ny) / asteroidMass;
                        
                        // Visual feedback
                        spawnExplosion(a.x, a.y, '#ff8800', Math.min(15, 5 + Math.floor(kineticEnergy)));
                        
                        // Check if enemy died from collision
                        if (this.hp <= 0) {
                            this.alive = false;
                            spawnExplosion(this.x + this.size / 2, this.y + this.size / 2, this.color, this.isBoss ? 40 : 20);
                            // Add score if player is nearby
                            if (Game.player) {
                                const bonus = this.isBoss ? 100 : this.isElite ? 50 : 25;
                                Game.player.score += bonus;
                                Game.player.kills++;
                                GameData.addQubits(this.isBoss ? 25 : this.isElite ? 15 : 5);
                                GameData.addXP(this.isBoss ? 20 : this.isElite ? 10 : 3);
                            }
                        }
                    }
                    break;
                }
            }
        }
        
        // Find targets - prefer player, then drones
        let target = player;
        let targetIsDrone = false;
        let distToPlayer = player ? Math.sqrt((player.x - this.x) ** 2 + (player.y - this.y) ** 2) : Infinity;
        
        // Bosses target drones more aggressively
        if (this.isBoss && player && player.drones && player.drones.length > 0) {
            let closestDrone = null;
            let closestDist = Infinity;
            for (const d of player.drones) {
                if (!d.alive) continue;
                const dDist = Math.sqrt((d.x - this.x) ** 2 + (d.y - this.y) ** 2);
                if (dDist < closestDist) {
                    closestDist = dDist;
                    closestDrone = d;
                }
            }
            if (closestDrone && closestDist < distToPlayer * 0.8) {
                target = closestDrone;
                targetIsDrone = true;
                distToPlayer = closestDist;
            }
        } else if (player && player.drones) {
            // Regular enemies target drones if closer
            let closestDrone = null;
            let closestDist = Infinity;
            for (const d of player.drones) {
                if (!d.alive) continue;
                const dDist = Math.sqrt((d.x - this.x) ** 2 + (d.y - this.y) ** 2);
                if (dDist < closestDist) {
                    closestDist = dDist;
                    closestDrone = d;
                }
            }
            if (closestDrone && closestDist < distToPlayer * 0.5 && closestDist < 400) {
                target = closestDrone;
                targetIsDrone = true;
                distToPlayer = closestDist;
            }
        }
        
        const dx = target ? target.x - this.x : 0;
        const dy = target ? target.y - this.y : 0;
        const dist = target ? Math.sqrt(dx * dx + dy * dy) : 1000;
        const targetAngle = target ? Math.atan2(dy, dx) : 0;
        
        // Movement behavior based on type
        this.updateMovement(target, targetAngle, dist, dx, dy, speedMult);
        
        // Apply velocity
        this.vx *= 0.98;
        this.vy *= 0.98;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpeed = this.speed * speedMult * (this.isBoss ? 0.8 : 1);
        if (speed > maxSpeed) {
            this.vx *= maxSpeed / speed;
            this.vy *= maxSpeed / speed;
        }
        this.x += this.vx;
        this.y += this.vy;
        this.x = Math.max(0, Math.min(mapWidth - this.size, this.x));
        this.y = Math.max(0, Math.min(mapHeight - this.size, this.y));
        
        // Shooting
        this.handleShooting(target, dist, dx, dy, targetAngle, player);
        
        // Update bullets
        this.bullets.forEach(b => { b.x += b.dx * this.bulletSpeed; b.y += b.dy * this.bulletSpeed; b.life--; });
        this.bullets = this.bullets.filter(b => b.life > 0);
    }
    
    updateMovement(target, targetAngle, dist, dx, dy, speedMult) {
        // Different movement patterns based on enemy type
        const type = this.type;
        
        if (this.isBoss) {
            // Boss: phases
            this.bossPhase = Math.floor(this.bossTimer / 300) % 3;
            
            if (this.bossPhase === 0) {
                // Phase 1: Chase
                if (dist < 300) {
                    this.vx -= (dx / dist) * 0.15 * speedMult;
                    this.vy -= (dy / dist) * 0.15 * speedMult;
                    this.angle = targetAngle;
                } else if (dist < 600) {
                    const sa = targetAngle + Math.PI / 2;
                    this.vx += Math.cos(sa) * 0.1 * speedMult;
                    this.vy += Math.sin(sa) * 0.1 * speedMult;
                    this.angle = targetAngle;
                } else {
                    this.vx += (dx / dist) * 0.2 * speedMult;
                    this.vy += (dy / dist) * 0.2 * speedMult;
                    this.angle = targetAngle;
                }
                if (Math.random() < 0.01 && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + 0.5);
            } else if (this.bossPhase === 1) {
                // Phase 2: Aggressive
                const sa = targetAngle + Math.PI / 2 * (Math.sin(this.bossTimer * 0.01) > 0 ? 1 : -1);
                this.vx += Math.cos(sa) * 0.2 * speedMult;
                this.vy += Math.sin(sa) * 0.2 * speedMult;
                this.angle = targetAngle;
                if (Math.random() < 0.02) {
                    Game.mines.push({
                        x: this.x + this.size / 2,
                        y: this.y + this.size / 2,
                        timer: 120,
                        armed: false,
                        size: 20,
                        owner: 'enemy',
                        damage: this.damage * 0.6
                    });
                }
            } else {
                // Phase 3: Retreat and shoot
                const retreatAngle = targetAngle + Math.PI;
                this.vx += Math.cos(retreatAngle) * 0.15 * speedMult;
                this.vy += Math.sin(retreatAngle) * 0.15 * speedMult;
                this.angle = targetAngle;
                // Spawn more mines
                if (Math.random() < 0.03) {
                    for (let i = 0; i < 3; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist2 = 80 + Math.random() * 50;
                        Game.mines.push({
                            x: this.x + this.size / 2 + Math.cos(angle) * dist2,
                            y: this.y + this.size / 2 + Math.sin(angle) * dist2,
                            timer: 90 + Math.random() * 60,
                            armed: false,
                            size: 15,
                            owner: 'enemy',
                            damage: this.damage * 0.4
                        });
                    }
                }
            }
        } else if (this.isElite) {
            // Elite: More aggressive, strafing
            if (dist < 400) {
                const oa = targetAngle + Math.PI / 2 * (Math.sin(this.aiTimer * 0.05) > 0 ? 1 : -1);
                this.vx += Math.cos(oa) * 0.2 * speedMult;
                this.vy += Math.sin(oa) * 0.2 * speedMult;
                this.angle = targetAngle;
            } else if (dist < 700) {
                this.vx += (dx / dist) * 0.2 * speedMult;
                this.vy += (dy / dist) * 0.2 * speedMult;
                this.angle = targetAngle;
            } else {
                if (this.aiTimer <= 0) {
                    this.aiTimer = 100 + Math.random() * 100;
                    this.patrolAngle = Math.random() * Math.PI * 2;
                }
                this.vx += Math.cos(this.patrolAngle) * 0.08 * speedMult;
                this.vy += Math.sin(this.patrolAngle) * 0.08 * speedMult;
                this.angle = this.patrolAngle;
            }
        } else if (this.swarmGroup) {
            // Swarm: Fast, erratic movement
            this.swarmAngle += (Math.random() - 0.5) * 0.3;
            if (dist < 300) {
                this.vx += (dx / dist) * 0.3 * speedMult + Math.cos(this.swarmAngle) * 0.2;
                this.vy += (dy / dist) * 0.3 * speedMult + Math.sin(this.swarmAngle) * 0.2;
                this.angle = targetAngle + Math.sin(this.swarmAngle) * 0.3;
            } else {
                this.vx += Math.cos(this.swarmAngle) * 0.2 * speedMult;
                this.vy += Math.sin(this.swarmAngle) * 0.2 * speedMult;
                this.angle += 0.05;
            }
        } else if (this.special === 'sniper') {
            // Sniper: Keep distance, move slowly
            if (dist < 500) {
                const oa = targetAngle + Math.PI;
                this.vx += Math.cos(oa) * 0.1 * speedMult;
                this.vy += Math.sin(oa) * 0.1 * speedMult;
                this.angle = targetAngle;
            } else if (dist < 800) {
                this.vx += (dx / dist) * 0.05 * speedMult;
                this.vy += (dy / dist) * 0.05 * speedMult;
                this.angle = targetAngle;
            } else {
                if (this.aiTimer <= 0) {
                    this.aiTimer = 200 + Math.random() * 100;
                    this.patrolAngle = Math.random() * Math.PI * 2;
                }
                this.vx += Math.cos(this.patrolAngle) * 0.05 * speedMult;
                this.vy += Math.sin(this.patrolAngle) * 0.05 * speedMult;
                this.angle = this.patrolAngle;
            }
        } else if (this.special === 'explosive') {
            // Bomber: Chase aggressively, explode on death
            if (dist < 200) {
                const oa = targetAngle + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
                this.vx += Math.cos(oa) * 0.2 * speedMult;
                this.vy += Math.sin(oa) * 0.2 * speedMult;
                this.angle = targetAngle;
            } else if (dist < 500) {
                this.vx += (dx / dist) * 0.25 * speedMult;
                this.vy += (dy / dist) * 0.25 * speedMult;
                this.angle = targetAngle;
            } else {
                if (this.aiTimer <= 0) {
                    this.aiTimer = 80 + Math.random() * 80;
                    this.patrolAngle = Math.random() * Math.PI * 2;
                }
                this.vx += Math.cos(this.patrolAngle) * 0.1 * speedMult;
                this.vy += Math.sin(this.patrolAngle) * 0.1 * speedMult;
                this.angle = this.patrolAngle;
            }
        } else {
            // Default: Basic chase
            if (dist < 300) {
                const oa = targetAngle + Math.PI / 2;
                this.vx += Math.cos(oa) * 0.08 * speedMult;
                this.vy += Math.sin(oa) * 0.08 * speedMult;
                this.angle = targetAngle;
            } else if (dist < 500) {
                this.vx += (dx / dist) * 0.12 * speedMult;
                this.vy += (dy / dist) * 0.12 * speedMult;
                this.angle = targetAngle;
            } else {
                if (this.aiTimer <= 0) {
                    this.aiTimer = 120 + Math.random() * 120;
                    this.patrolAngle = Math.random() * Math.PI * 2;
                }
                this.vx += Math.cos(this.patrolAngle) * 0.05 * speedMult;
                this.vy += Math.sin(this.patrolAngle) * 0.05 * speedMult;
                this.angle = this.patrolAngle;
            }
        }
    }
    
    handleShooting(target, dist, dx, dy, targetAngle, player) {
        if (!target) return;
        
        const now = Date.now();
        const shootCooldown = this.shootCooldown / (this.isBoss ? 0.5 : this.isElite ? 0.7 : 1);
        
        if (now - this.lastShot > shootCooldown && dist < (this.isBoss ? 900 : 700)) {
            this.lastShot = now;
            
            if (this.isBoss) {
                // Boss: Multiple shots
                const count = this.bossPhase === 2 ? 8 : 5;
                const spread = this.bossPhase === 2 ? 0.6 : 0.3;
                for (let i = 0; i < count; i++) {
                    const angleOffset = (i / count) * Math.PI * 2 - Math.PI;
                    const angle = targetAngle + angleOffset * spread + (Math.random() - 0.5) * 0.1;
                    this.bullets.push({
                        x: this.x + this.size / 2,
                        y: this.y + this.size / 2,
                        dx: Math.cos(angle),
                        dy: Math.sin(angle),
                        damage: this.damage * 0.6,
                        life: 100,
                        color: this.bulletColor,
                        size: this.bulletSize * 0.8,
                        targetIsDrone: false
                    });
                }
            } else if (this.isElite) {
                // Elite: Spread shot
                const count = 3;
                for (let i = 0; i < count; i++) {
                    const angle = targetAngle + (i - 1) * 0.2 + (Math.random() - 0.5) * 0.1;
                    this.bullets.push({
                        x: this.x + this.size / 2,
                        y: this.y + this.size / 2,
                        dx: Math.cos(angle),
                        dy: Math.sin(angle),
                        damage: this.damage * 0.7,
                        life: 80,
                        color: this.bulletColor,
                        size: this.bulletSize * 0.9,
                        targetIsDrone: Math.random() < 0.3
                    });
                }
            } else if (this.special === 'sniper') {
                // Sniper: Single high damage shot
                this.bullets.push({
                    x: this.x + this.size / 2,
                    y: this.y + this.size / 2,
                    dx: dx / dist,
                    dy: dy / dist,
                    damage: this.damage * 1.5,
                    life: 150,
                    color: this.bulletColor,
                    size: this.bulletSize * 1.5,
                    targetIsDrone: false,
                    trail: true
                });
            } else if (this.special === 'swarm') {
                // Swarm: Rapid fire
                const count = 2;
                for (let i = 0; i < count; i++) {
                    const angle = targetAngle + (Math.random() - 0.5) * 0.3;
                    this.bullets.push({
                        x: this.x + this.size / 2,
                        y: this.y + this.size / 2,
                        dx: Math.cos(angle),
                        dy: Math.sin(angle),
                        damage: this.damage * 0.5,
                        life: 60,
                        color: this.bulletColor,
                        size: this.bulletSize * 0.7,
                        targetIsDrone: Math.random() < 0.5
                    });
                }
            } else {
                // Default: Single shot
                this.bullets.push({
                    x: this.x + this.size / 2,
                    y: this.y + this.size / 2,
                    dx: dx / dist,
                    dy: dy / dist,
                    damage: this.damage,
                    life: 70,
                    color: this.bulletColor,
                    size: this.bulletSize,
                    targetIsDrone: Math.random() < 0.2
                });
            }
        }
    }
    
    takeDamage(amount) {
        // Shield absorbs damage first
        if (this.hasShield && this.shieldHp > 0) {
            const absorbed = Math.min(this.shieldHp, amount * 0.6);
            this.shieldHp -= absorbed;
            amount -= absorbed;
            if (amount <= 0) return;
        }
        
        this.hp -= amount;
        
        // Explosive enemies explode on death
        if (this.hp <= 0 && this.explosive) {
            this.alive = false;
            spawnExplosion(this.x + this.size / 2, this.y + this.size / 2, '#ff4400', 50);
            // Damage nearby enemies
            for (const e of Game.enemies) {
                if (e !== this && e.alive) {
                    const d = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                    if (d < 150) {
                        e.takeDamage(this.damage * 0.5);
                    }
                }
            }
            // Damage nearby drones
            if (Game.player && Game.player.drones) {
                for (const d of Game.player.drones) {
                    if (d.alive) {
                        const dDist = Math.sqrt((d.x - this.x) ** 2 + (d.y - this.y) ** 2);
                        if (dDist < 150) {
                            d.takeDamage(this.damage * 0.3);
                        }
                    }
                }
            }
        } else if (this.hp <= 0) {
            this.alive = false;
            spawnExplosion(this.x + this.size / 2, this.y + this.size / 2, this.color, this.isBoss ? 50 : this.isElite ? 30 : 20);
        }
    }
    
    draw(ctx, camX, camY, zoom) {
        if (!this.alive) return;
        const sx = this.x - camX + W / 2 / zoom;
        const sy = this.y - camY + H / 2 / zoom;
        if (sx < -100 || sx > W / zoom + 100 || sy < -100 || sy > H / zoom + 100) return;
        
        ctx.save();
        ctx.translate(sx * zoom, sy * zoom);
        ctx.scale(zoom, zoom);
        ctx.translate(this.size / 2, this.size / 2);
        ctx.rotate(this.angle);
        
        // Draw shield if applicable
        if (this.hasShield && this.shieldHp > 0) {
            const shieldRatio = this.shieldHp / this.maxShieldHp;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2 + 8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(68, 170, 255, ${0.3 + shieldRatio * 0.5})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            // Shield glow
            const grad = ctx.createRadialGradient(0, 0, this.size / 2, 0, 0, this.size / 2 + 15);
            grad.addColorStop(0, 'rgba(68, 170, 255, 0)');
            grad.addColorStop(1, `rgba(68, 170, 255, ${0.1 * shieldRatio})`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2 + 15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw enemy body
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.isBoss ? 30 : this.isElite ? 20 : 10;
        
        if (this.isBoss) {
            // Boss: Hexagon with details
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
                const r = this.size / 2;
                i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Inner pattern
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a) * this.size / 3, Math.sin(a) * this.size / 3);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
            
            // Boss eye
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff0044';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 8, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (this.isElite) {
            // Elite: Diamond with glow
            ctx.beginPath();
            ctx.moveTo(this.size / 2, 0);
            ctx.lineTo(0, -this.size / 2);
            ctx.lineTo(-this.size / 2, 0);
            ctx.lineTo(0, this.size / 2);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Inner ring
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            
        } else if (this.swarmGroup) {
            // Swarm: Small triangles
            ctx.beginPath();
            ctx.moveTo(this.size / 2, 0);
            ctx.lineTo(-this.size / 2, -this.size / 2);
            ctx.lineTo(-this.size / 2, this.size / 2);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            
        } else if (this.special === 'sniper') {
            // Sniper: Thin, elongated
            ctx.beginPath();
            ctx.moveTo(this.size / 2, 0);
            ctx.lineTo(-this.size / 2, -this.size / 4);
            ctx.lineTo(-this.size / 2, this.size / 4);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            // Sniper scope
            ctx.fillStyle = '#ff33ff';
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(this.size / 4, 0, this.size / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            
        } else if (this.special === 'explosive') {
            // Bomber: Circular with pulsing glow
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Pulsing glow
            const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.3;
            ctx.fillStyle = `rgba(255, 68, 0, ${pulse})`;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2.5, 0, Math.PI * 2);
            ctx.fill();
            
        } else {
            // Default: Triangle
            ctx.beginPath();
            ctx.moveTo(this.size / 2, 0);
            ctx.lineTo(-this.size / 2, -this.size / 3);
            ctx.lineTo(-this.size / 2, this.size / 3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
        
        // Draw bullets
        this.bullets.forEach(b => {
            const bx = (b.x - camX + W / 2 / zoom) * zoom;
            const by = (b.y - camY + H / 2 / zoom) * zoom;
            const size = (b.size || 4) * zoom;
            
            if (b.trail) {
                ctx.shadowColor = b.color;
                ctx.shadowBlur = 20 * zoom;
            }
            ctx.fillStyle = b.color;
            ctx.fillRect(bx - size / 2, by - size / 2, size, size);
            ctx.shadowBlur = 0;
        });
        
        // HP Bar
        if (this.maxHp > 1) {
            const bw = this.size * zoom;
            const bh = (this.isBoss ? 5 : 3) * zoom;
            const bx2 = (sx + this.size / 2) * zoom - bw / 2;
            const by2 = (sy - 10) * zoom;
            
            // Background
            ctx.fillStyle = 'rgba(255,0,0,0.5)';
            ctx.fillRect(bx2, by2, bw, bh);
            
            // HP
            const hpRatio = this.hp / this.maxHp;
            ctx.fillStyle = this.isBoss ? '#ff00ff' : this.isElite ? '#ffaa00' : '#ff0';
            ctx.fillRect(bx2, by2, bw * hpRatio, bh);
            
            // Shield bar
            if (this.hasShield && this.shieldHp > 0) {
                const shieldRatio = this.shieldHp / this.maxShieldHp;
                ctx.fillStyle = 'rgba(68, 170, 255, 0.8)';
                ctx.fillRect(bx2, by2 - bh - 2, bw * shieldRatio, bh * 0.6);
            }
            
            // Enemy type label (shortened for performance)
            if (this.isBoss || this.isElite) {
                ctx.fillStyle = this.color;
                ctx.font = 'bold 10px Orbitron, Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(this.label, (sx + this.size / 2) * zoom, by2 - 2);
            }
        }
    }
}