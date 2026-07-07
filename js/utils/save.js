// ===== SAVE/LOCALSTORAGE MANAGEMENT =====
// Updated to support both browser localStorage and Electron file-based storage

const GameData = {
    getQubits() {
        return parseInt(this.get('qubits') || '100');
    },
    setQubits(q) {
        this.set('qubits', q);
        if (GUI && GUI.updateQubits) GUI.updateQubits();
    },
    addQubits(q) {
        this.setQubits(this.getQubits() + q);
    },
    getLevel() {
        return parseInt(this.get('playerLevel') || '1');
    },
    setLevel(l) {
        this.set('playerLevel', l);
        if (GUI && GUI.updateLevel) GUI.updateLevel();
    },
    getXP() {
        return parseInt(this.get('playerXP') || '0');
    },
    setXP(x) {
        this.set('playerXP', x);
        if (GUI && GUI.updateLevel) GUI.updateLevel();
    },
    addXP(x) {
        let xp = this.getXP() + x;
        let level = this.getLevel();
        let needed = this.getXPNeeded();
        while (xp >= needed) {
            xp -= needed;
            level++;
            needed = this.getXPNeeded(level);
        }
        this.setXP(xp);
        this.setLevel(level);
    },
    getXPNeeded(level) {
        return Math.floor(100 * Math.pow(1.5, (level || this.getLevel()) - 1));
    },
    getOwnedShips() {
        try {
            const data = this.get('ownedShips');
            return data ? JSON.parse(data) : ['default', 'scout'];
        } catch {
            return ['default', 'scout'];
        }
    },
    getSelectedShip() {
        return this.get('selectedShip') || 'default';
    },
    setSelectedShip(id) {
        this.set('selectedShip', id);
    },
    getOwnedWeapons() {
        try {
            const data = this.get('ownedWeapons');
            return data ? JSON.parse(data) : ['laser'];
        } catch {
            return ['laser'];
        }
    },
    getEquippedWeapon() {
        return this.get('equippedWeapon') || 'laser';
    },
    setEquippedWeapon(id) {
        this.set('equippedWeapon', id);
    },
    getOwnedSecondary() {
        try {
            const data = this.get('ownedSecondary');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },
    getEquippedSecondary() {
        return this.get('equippedSecondary') || null;
    },
    setEquippedSecondary(id) {
        this.set('equippedSecondary', id);
    },
    getOwnedAutocannons() {
        try {
            const data = this.get('ownedAutocannons');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },
    getEquippedAutocannon() {
        return this.get('equippedAutocannon') || null;
    },
    setEquippedAutocannon(id) {
        this.set('equippedAutocannon', id);
    },
    getOwnedDrones() {
        try {
            const data = this.get('ownedDrones');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },
    getEquippedDroneBay() {
        return this.get('equippedDroneBay') || null;
    },
    setEquippedDroneBay(id) {
        this.set('equippedDroneBay', id);
    },
    getOwnedAttachments() {
        try {
            const data = this.get('ownedAttachments');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },
    getEquippedAttachments() {
        try {
            const data = this.get('equippedAttachments');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },
    getOwnedAccessories() {
        try {
            const data = this.get('ownedAccessories');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },
    getEquippedAccessories() {
        try {
            const data = this.get('equippedAccessories');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },
    getUpgradeLevel(shipId) {
        try {
            const data = this.get('upgrades');
            return data ? JSON.parse(data)[shipId] || 0 : 0;
        } catch {
            return 0;
        }
    },
    getDifficulty() {
        return this.get('difficulty') || 'medium';
    },
    setDifficulty(d) {
        this.set('difficulty', d);
    },

    // Universal get/set methods
    get(key) {
        // Try Electron storage first (desktop)
        if (window.electron && window.electron.loadData) {
            // Async, but we'll use sync fallback for now
            // For sync usage, we'll keep using localStorage as fallback
        }
        // Fallback to localStorage
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch {}
        // Also try Electron storage
        if (window.electron && window.electron.saveData) {
            window.electron.saveData(key, value);
        }
    },
    
    // Get all data as object
    getAllData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        return data;
    },
    
    // Export save data
    exportSave() {
        return JSON.stringify(this.getAllData(), null, 2);
    },
    
    // Import save data
    importSave(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            for (const [key, value] of Object.entries(data)) {
                localStorage.setItem(key, value);
                if (window.electron && window.electron.saveData) {
                    window.electron.saveData(key, value);
                }
            }
            return true;
        } catch {
            return false;
        }
    }
};

// Reset progress
function resetProgress() {
    if (confirm('Reset all progress? This will delete all your ships, weapons, attachments, and qubits!')) {
        localStorage.clear();
        if (window.electron && window.electron.saveData) {
            // Clear electron storage
            const keys = ['qubits', 'playerLevel', 'playerXP', 'ownedShips', 'selectedShip',
                'ownedWeapons', 'equippedWeapon', 'ownedSecondary', 'equippedSecondary',
                'ownedAutocannons', 'equippedAutocannon', 'ownedDrones', 'equippedDroneBay',
                'ownedAttachments', 'equippedAttachments', 'ownedAccessories', 'equippedAccessories',
                'upgrades', 'difficulty', 'keybinds', 'username'];
            keys.forEach(key => {
                window.electron.saveData(key, null);
            });
        }
        location.reload();
    }
}