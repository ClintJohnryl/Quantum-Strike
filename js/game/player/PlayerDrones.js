// ===== PLAYER DRONES =====

const PlayerDrones = {
    launchDrones() {
        if (!this.isCarrier || !this.droneBayData) return;
        if (this.droneCooldown > 0) return;
        const activeDrones = this.drones.filter(d => d.alive).length;
        if (activeDrones >= this.maxDrones) return;
        
        const bayData = this.droneBayData;
        const drone = new Drone(
            this.x + (Math.random() - 0.5) * 60,
            this.y + (Math.random() - 0.5) * 60,
            this,
            bayData,
            this.drones.length
        );
        drone.command = this.droneCommand;
        this.drones.push(drone);
        this.droneCooldown = 20;
        spawnExplosion(drone.x, drone.y, '#00ffcc', 8);
    },

    setDroneCommand(cmd) {
        this.droneCommand = cmd;
        this.drones.forEach(d => d.command = cmd);
        document.querySelectorAll('.drone-command-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.cmd === cmd);
        });
    },

    updateDrones() {
        this.drones.forEach(d => d.update(this));
        this.drones = this.drones.filter(d => d.alive);
    }
};