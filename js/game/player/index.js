// ===== PLAYER - Main Class (Combines all modules) =====

class Player extends PlayerCore {
    constructor(x, y, shipData) {
        // Call the parent class constructor
        super(x, y, shipData);
    }
}

// Copy all methods from the mixin objects to the Player prototype
Object.assign(Player.prototype, PlayerMovement);
Object.assign(Player.prototype, PlayerStatus);
Object.assign(Player.prototype, PlayerCombat);
Object.assign(Player.prototype, PlayerDrones);
Object.assign(Player.prototype, PlayerBullets);
Object.assign(Player.prototype, PlayerDrawing);

// Add the main update method that calls all the others
Player.prototype.update = function() {
    this.updateStatus();
    this.updateMovement();
    this.updateDrones();
    this.updateBullets();
    this.updateAutocannon();
};

console.log('✅ Player class loaded successfully!');
console.log('📦 Player modules combined:');
console.log('  - PlayerCore (Base Class)');
console.log('  - PlayerMovement');
console.log('  - PlayerStatus');
console.log('  - PlayerCombat');
console.log('  - PlayerDrones');
console.log('  - PlayerBullets');
console.log('  - PlayerDrawing');