// ===== GAME CORE - Properties and State =====

class GameCore {
    constructor() {
        this.player = null;
        this.enemies = [];
        this.asteroids = [];
        this.powerups = [];
        this.mines = [];
        this.droneBullets = [];
        this.isRunning = false;
        this.mode = 'explore';
        this.animationId = null;
    }

    setDroneCommand(cmd) {
        if (this.player) {
            this.player.setDroneCommand(cmd);
        }
    }
}