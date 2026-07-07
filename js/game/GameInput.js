// ===== GAME INPUT HANDLING =====

const GameInputHandler = {
    handleInput() {
        if (!this.player) return;
        const k = GameInput.keys;
        
        // Thrust/Reverse (W/S or Up/Down)
        this.player.thrusting = k[KEYBINDS.thrust] || k['ArrowUp'];
        this.player.reversing = k[KEYBINDS.reverse] || k['ArrowDown'];
        
        // Rotation (A/D - rotate left/right)
        this.player.rotatingLeft = k[KEYBINDS.left];
        this.player.rotatingRight = k[KEYBINDS.right];
        
        // Strafe (Left/Right Arrow keys)
        this.player.strafingLeft = k['ArrowLeft'] && !k[KEYBINDS.left];
        this.player.strafingRight = k['ArrowRight'] && !k[KEYBINDS.right];
        
        // Weapons
        if (k[KEYBINDS.primary]) this.player.shoot();
        if (k[KEYBINDS.secondary]) this.player.shootSecondary();
        if (k[KEYBINDS.autocannon]) this.player.toggleAuto();
        if (k[KEYBINDS.drones]) this.player.launchDrones();
        if (k[KEYBINDS.ability]) this.player.useAbility();
    }
};