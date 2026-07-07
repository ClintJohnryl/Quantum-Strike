// ===== GAME INITIALIZATION =====

const GameInit = {
    generateAsteroids() {
        this.asteroids = [];
        const count = Math.floor((mapWidth * mapHeight) / 50000);
        for (let i = 0; i < count; i++) {
            this.asteroids.push(new Asteroid(Math.random() * mapWidth, Math.random() * mapHeight, Math.random() * 40 + 20));
        }
    },

    generateEnemies(mode) {
        this.enemies = [];
        const diff = GameData.getDifficulty();
        const diffMult = diff === 'easy' ? 0.7 : 
                        diff === 'hard' ? 1.8 : 
                        diff === 'insane' ? 3.0 : 
                        diff === 'nightmare' ? 4.5 : 1;
        
        const basicTypes = ['scout', 'fighter', 'tank', 'sniper', 'bomber', 'swarm', 'shield'];
        const eliteTypes = ['elite_scout', 'elite_fighter', 'elite_tank'];
        const bossTypes = ['boss_standard', 'boss_heavy', 'boss_ancient'];
        
        let count = 0;
        let typePool = [];
        
        switch(mode) {
            case 'explore':
                count = Math.floor(10 * diffMult);
                typePool = basicTypes;
                break;
            case 'survival':
                count = Math.floor(20 * diffMult);
                typePool = [...basicTypes, ...eliteTypes];
                break;
            case 'horde':
                count = Math.floor(40 * diffMult);
                typePool = [...basicTypes, ...basicTypes, ...eliteTypes];
                break;
            case 'boss':
                count = Math.floor(8 * diffMult);
                typePool = [...basicTypes, ...eliteTypes];
                break;
            default:
                count = Math.floor(10 * diffMult);
                typePool = basicTypes;
        }
        
        for (let i = 0; i < count; i++) {
            let type = typePool[Math.floor(Math.random() * typePool.length)];
            if (Math.random() < 0.1 && mode !== 'boss') {
                type = eliteTypes[Math.floor(Math.random() * eliteTypes.length)];
            }
            this.enemies.push(new AIEnemy(
                Math.random() * mapWidth,
                Math.random() * mapHeight,
                type
            ));
        }
        
        if (mode === 'boss') {
            for (let i = 0; i < Math.min(3, 1 + Math.floor(diffMult)); i++) {
                const bossType = bossTypes[i % bossTypes.length];
                this.enemies.push(new AIEnemy(
                    mapWidth * (0.2 + i * 0.3),
                    mapHeight * (0.3 + Math.random() * 0.4),
                    bossType
                ));
            }
        }
        
        if (mode === 'horde') {
            for (let i = 0; i < Math.min(5, 2 + Math.floor(diffMult)); i++) {
                const eliteType = eliteTypes[i % eliteTypes.length];
                this.enemies.push(new AIEnemy(
                    mapWidth * (0.1 + Math.random() * 0.8),
                    mapHeight * (0.1 + Math.random() * 0.8),
                    eliteType
                ));
            }
        }
    },

    // REMOVED: generatePowerUps - completely removed

    spawnEnemy() {
        const maxEnemies = this.mode === 'horde' ? 60 : 35;
        if (this.enemies.filter(e => e.alive).length < maxEnemies) {
            const a = Math.random() * Math.PI * 2;
            const d = 800 + Math.random() * 400;
            
            let type;
            const roll = Math.random();
            if (roll < 0.05 && this.mode === 'horde') {
                type = 'elite_scout';
            } else if (roll < 0.02 && this.mode !== 'explore') {
                type = 'elite_fighter';
            } else if (roll < 0.01 && this.mode === 'boss') {
                type = 'boss_standard';
            } else if (roll < 0.08) {
                type = 'shield';
            } else if (roll < 0.15) {
                type = 'bomber';
            } else if (roll < 0.22) {
                type = 'sniper';
            } else if (roll < 0.30) {
                type = 'swarm';
            } else if (roll < 0.45) {
                type = 'tank';
            } else if (roll < 0.65) {
                type = 'fighter';
            } else {
                type = 'scout';
            }
            
            this.enemies.push(new AIEnemy(
                Math.max(50, Math.min(mapWidth - 50, this.player.x + Math.cos(a) * d)),
                Math.max(50, Math.min(mapHeight - 50, this.player.y + Math.sin(a) * d)),
                type
            ));
        }
    }
};