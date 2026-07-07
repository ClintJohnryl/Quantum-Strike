// ===== ADMIN PANEL - UNLOCK EVERYTHING =====

// Admin commands - type in browser console or use the UI panel
const Admin = {
    // Unlock all ships
    unlockAllShips() {
        const allShipIds = SHIPS.map(s => s.id);
        localStorage.setItem('ownedShips', JSON.stringify(allShipIds));
        // Select the last ship (usually the most expensive)
        GameData.setSelectedShip(allShipIds[allShipIds.length - 1]);
        console.log('✅ All ships unlocked!');
        this.refreshUI();
        return allShipIds;
    },

    // Unlock all primary weapons
    unlockAllWeapons() {
        const allWeaponIds = Object.keys(WEAPONS);
        localStorage.setItem('ownedWeapons', JSON.stringify(allWeaponIds));
        GameData.setEquippedWeapon(allWeaponIds[allWeaponIds.length - 1]);
        console.log('✅ All primary weapons unlocked!');
        this.refreshUI();
        return allWeaponIds;
    },

    // Unlock all secondary weapons
    unlockAllSecondary() {
        const allSecondaryIds = Object.keys(SECONDARY_WEAPONS);
        localStorage.setItem('ownedSecondary', JSON.stringify(allSecondaryIds));
        GameData.setEquippedSecondary(allSecondaryIds[allSecondaryIds.length - 1]);
        console.log('✅ All secondary weapons unlocked!');
        this.refreshUI();
        return allSecondaryIds;
    },

    // Unlock all auto-cannons
    unlockAllAutocannons() {
        const allAutoIds = Object.keys(AUTOCANNONS);
        localStorage.setItem('ownedAutocannons', JSON.stringify(allAutoIds));
        GameData.setEquippedAutocannon(allAutoIds[allAutoIds.length - 1]);
        console.log('✅ All auto-cannons unlocked!');
        this.refreshUI();
        return allAutoIds;
    },

    // Unlock all drone bays
    unlockAllDrones() {
        const allDroneIds = Object.keys(DRONE_BAYS);
        localStorage.setItem('ownedDrones', JSON.stringify(allDroneIds));
        GameData.setEquippedDroneBay(allDroneIds[allDroneIds.length - 1]);
        console.log('✅ All drone bays unlocked!');
        this.refreshUI();
        return allDroneIds;
    },

    // Unlock all attachments
    unlockAllAttachments() {
        const allAttachmentIds = Object.keys(ATTACHMENTS);
        localStorage.setItem('ownedAttachments', JSON.stringify(allAttachmentIds));
        localStorage.setItem('equippedAttachments', JSON.stringify(allAttachmentIds));
        console.log('✅ All attachments unlocked!');
        this.refreshUI();
        return allAttachmentIds;
    },

    // Unlock all accessories
    unlockAllAccessories() {
        const allAccessoryIds = Object.keys(ACCESSORIES);
        localStorage.setItem('ownedAccessories', JSON.stringify(allAccessoryIds));
        localStorage.setItem('equippedAccessories', JSON.stringify(allAccessoryIds));
        console.log('✅ All accessories unlocked!');
        this.refreshUI();
        return allAccessoryIds;
    },

    // Give unlimited qubits
    giveQubits(amount = 99999) {
        GameData.setQubits(amount);
        console.log(`✅ ${amount} qubits added!`);
        this.refreshUI();
        return amount;
    },

    // Set max level
    setMaxLevel() {
        GameData.setLevel(100);
        GameData.setXP(999999);
        console.log('✅ Max level achieved!');
        this.refreshUI();
    },

    // Unlock EVERYTHING at once
    unlockAll() {
        console.log('🚀 Unlocking everything...');
        this.unlockAllShips();
        this.unlockAllWeapons();
        this.unlockAllSecondary();
        this.unlockAllAutocannons();
        this.unlockAllDrones();
        this.unlockAllAttachments();
        this.unlockAllAccessories();
        this.giveQubits(99999);
        this.setMaxLevel();
        console.log('🎉 EVERYTHING UNLOCKED!');
        this.refreshUI();
        // Show success message
        this.showNotification('🎉 Everything Unlocked!', '#00ffcc');
        return 'All unlocked!';
    },

    // Reset everything (clear all progress)
    resetAll() {
        if (confirm('⚠️ Are you sure you want to reset ALL progress?')) {
            localStorage.clear();
            location.reload();
        }
    },

    // Add XP
    addXP(amount = 1000) {
        GameData.addXP(amount);
        console.log(`✅ ${amount} XP added!`);
        this.refreshUI();
        return amount;
    },

    // Add kills to current session (for testing)
    addKills(amount = 100) {
        if (Game.player) {
            Game.player.kills += amount;
            Game.player.score += amount * 100;
            console.log(`✅ ${amount} kills added!`);
            this.refreshUI();
        } else {
            console.warn('⚠️ Start a game first!');
        }
        return amount;
    },

    // Spawn enemies (for testing)
    spawnEnemies(count = 10) {
        if (Game.player) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 300 + Math.random() * 400;
                const types = ['scout', 'fighter', 'tank', 'sniper', 'bomber', 'swarm', 'shield'];
                const type = types[Math.floor(Math.random() * types.length)];
                Game.enemies.push(new AIEnemy(
                    Game.player.x + Math.cos(angle) * distance,
                    Game.player.y + Math.sin(angle) * distance,
                    type
                ));
            }
            console.log(`✅ ${count} enemies spawned!`);
        } else {
            console.warn('⚠️ Start a game first!');
        }
        return count;
    },

    // Spawn a boss
    spawnBoss() {
        if (Game.player) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 400 + Math.random() * 300;
            const bossTypes = ['boss_standard', 'boss_heavy', 'boss_ancient'];
            const type = bossTypes[Math.floor(Math.random() * bossTypes.length)];
            Game.enemies.push(new AIEnemy(
                Game.player.x + Math.cos(angle) * distance,
                Game.player.y + Math.sin(angle) * distance,
                type
            ));
            console.log(`✅ Boss spawned (${type})!`);
            this.showNotification('👾 Boss Spawned!', '#ff0044');
        } else {
            console.warn('⚠️ Start a game first!');
        }
    },

    // Heal player
    healPlayer() {
        if (Game.player) {
            Game.player.hp = Game.player.maxHp;
            Game.player.shieldActive = true;
            Game.player.shieldTimer = 300;
            console.log('✅ Player fully healed!');
            this.showNotification('💚 Full Heal!', '#00ff44');
        } else {
            console.warn('⚠️ Start a game first!');
        }
    },

    // Toggle god mode
    toggleGodMode() {
        if (Game.player) {
            Game.player.invincible = !Game.player.invincible;
            const status = Game.player.invincible ? 'ON' : 'OFF';
            console.log(`✅ God mode ${status}!`);
            this.showNotification(`🛡️ God Mode ${status}`, '#ffaa00');
        } else {
            console.warn('⚠️ Start a game first!');
        }
    },

    // Refresh UI
    refreshUI() {
        if (GUI) {
            GUI.updateQubits();
            GUI.updateLevel();
            if (typeof updateMenuRank === 'function') {
                updateMenuRank();
            }
            if (document.getElementById('game-hud').style.display !== 'none') {
                // If in game, update HUD
                if (Game.player) {
                    GUI.updateHUD(Game.player, Game.enemies);
                }
            }
        }
    },

    // Show notification
    showNotification(message, color = '#00ffcc') {
        // Remove existing notification
        const existing = document.getElementById('admin-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.id = 'admin-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${color};
            border-radius: 16px;
            padding: 30px 50px;
            color: ${color};
            font-family: 'Orbitron', 'Segoe UI', sans-serif;
            font-size: 28px;
            font-weight: bold;
            z-index: 9999;
            text-align: center;
            text-shadow: 0 0 30px ${color};
            box-shadow: 0 0 60px rgba(0, 0, 0, 0.8);
            pointer-events: none;
            animation: adminFadeIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'adminFadeOut 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 1500);
    },

    // Show admin panel UI
    showPanel() {
        const panel = document.getElementById('admin-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            return;
        }
        
        const panelHTML = `
            <div id="admin-panel" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 10, 20, 0.95);
                border: 2px solid #ffaa00;
                border-radius: 16px;
                padding: 25px;
                z-index: 10000;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                color: #e0f0ff;
                font-family: 'Segoe UI', Arial, sans-serif;
                box-shadow: 0 0 60px rgba(255, 170, 0, 0.3);
            ">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;border-bottom:1px solid rgba(255,170,0,0.3);padding-bottom:10px;">
                    <h2 style="color:#ffaa00;font-family:'Orbitron',sans-serif;">🔧 ADMIN PANEL</h2>
                    <button onclick="document.getElementById('admin-panel').style.display='none'" style="background:rgba(255,0,0,0.3);border:1px solid #ff4444;border-radius:8px;color:#ff4444;padding:5px 15px;cursor:pointer;font-weight:bold;">✕ Close</button>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <button onclick="Admin.unlockAll()" style="background:linear-gradient(135deg,#ffaa00,#ff8800);border:none;border-radius:8px;color:#000;padding:10px;cursor:pointer;font-weight:bold;font-size:14px;">🌟 Unlock All</button>
                    <button onclick="Admin.resetAll()" style="background:rgba(255,0,0,0.3);border:1px solid #ff4444;border-radius:8px;color:#ff4444;padding:10px;cursor:pointer;font-weight:bold;font-size:14px;">🗑️ Reset All</button>
                    
                    <button onclick="Admin.unlockAllShips()" style="background:rgba(0,200,255,0.2);border:1px solid #00ccff;border-radius:8px;color:#00ccff;padding:8px;cursor:pointer;">🚀 Ships</button>
                    <button onclick="Admin.unlockAllWeapons()" style="background:rgba(0,200,255,0.2);border:1px solid #00ccff;border-radius:8px;color:#00ccff;padding:8px;cursor:pointer;">🔫 Weapons</button>
                    <button onclick="Admin.unlockAllSecondary()" style="background:rgba(0,200,255,0.2);border:1px solid #00ccff;border-radius:8px;color:#00ccff;padding:8px;cursor:pointer;">💥 Secondary</button>
                    <button onclick="Admin.unlockAllAutocannons()" style="background:rgba(0,200,255,0.2);border:1px solid #00ccff;border-radius:8px;color:#00ccff;padding:8px;cursor:pointer;">⚙️ Auto-Cannons</button>
                    <button onclick="Admin.unlockAllDrones()" style="background:rgba(0,200,255,0.2);border:1px solid #00ccff;border-radius:8px;color:#00ccff;padding:8px;cursor:pointer;">🚁 Drones</button>
                    <button onclick="Admin.unlockAllAttachments()" style="background:rgba(0,200,255,0.2);border:1px solid #00ccff;border-radius:8px;color:#00ccff;padding:8px;cursor:pointer;">🔧 Attachments</button>
                    <button onclick="Admin.unlockAllAccessories()" style="background:rgba(0,200,255,0.2);border:1px solid #00ccff;border-radius:8px;color:#00ccff;padding:8px;cursor:pointer;">✨ Accessories</button>
                </div>
                
                <div style="margin-top:12px;border-top:1px solid rgba(255,170,0,0.2);padding-top:12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                        <button onclick="Admin.giveQubits(99999)" style="background:rgba(255,170,0,0.2);border:1px solid #ffaa00;border-radius:8px;color:#ffaa00;padding:8px;cursor:pointer;">💰 99k Qubits</button>
                        <button onclick="Admin.setMaxLevel()" style="background:rgba(255,170,0,0.2);border:1px solid #ffaa00;border-radius:8px;color:#ffaa00;padding:8px;cursor:pointer;">⬆️ Max Level</button>
                        <button onclick="Admin.addXP(5000)" style="background:rgba(255,170,0,0.2);border:1px solid #ffaa00;border-radius:8px;color:#ffaa00;padding:8px;cursor:pointer;">⭐ +5000 XP</button>
                    </div>
                </div>
                
                <div style="margin-top:12px;border-top:1px solid rgba(255,170,0,0.2);padding-top:12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                        <button onclick="Admin.healPlayer()" style="background:rgba(0,255,68,0.2);border:1px solid #00ff44;border-radius:8px;color:#00ff44;padding:8px;cursor:pointer;">💚 Heal</button>
                        <button onclick="Admin.toggleGodMode()" style="background:rgba(255,170,0,0.2);border:1px solid #ffaa00;border-radius:8px;color:#ffaa00;padding:8px;cursor:pointer;">🛡️ God Mode</button>
                        <button onclick="Admin.addKills(50)" style="background:rgba(255,68,0,0.2);border:1px solid #ff4400;border-radius:8px;color:#ff4400;padding:8px;cursor:pointer;">💀 +50 Kills</button>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;">
                        <button onclick="Admin.spawnEnemies(10)" style="background:rgba(255,0,0,0.2);border:1px solid #ff0000;border-radius:8px;color:#ff4444;padding:8px;cursor:pointer;">👾 Spawn 10</button>
                        <button onclick="Admin.spawnBoss()" style="background:rgba(255,0,255,0.2);border:1px solid #ff00ff;border-radius:8px;color:#ff44ff;padding:8px;cursor:pointer;">👾 Spawn Boss</button>
                    </div>
                </div>
                
                <div style="margin-top:12px;border-top:1px solid rgba(255,170,0,0.2);padding-top:12px;font-size:12px;color:#666;">
                    <span style="color:#ffaa00;">💡 Admin Panel</span> - Use these buttons to unlock everything and test the game. 
                    <span style="color:#888;">Press Ctrl+Shift+A to toggle this panel.</span>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', panelHTML);
        
        // Add keydown listener for closing panel with Escape
        const closePanel = (e) => {
            if (e.key === 'Escape') {
                const panel = document.getElementById('admin-panel');
                if (panel) panel.style.display = 'none';
                document.removeEventListener('keydown', closePanel);
            }
        };
        document.addEventListener('keydown', closePanel);
    },

    // Toggle admin panel with keyboard shortcut
    togglePanel() {
        const panel = document.getElementById('admin-panel');
        if (panel && panel.style.display !== 'none') {
            panel.style.display = 'none';
        } else {
            this.showPanel();
        }
    }
};

// Add admin panel styles
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    #admin-panel button:hover {
        transform: scale(1.02);
        transition: all 0.2s ease;
        box-shadow: 0 0 20px rgba(255, 170, 0, 0.2);
    }
    #admin-panel button:active {
        transform: scale(0.98);
    }
    @keyframes adminFadeIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes adminFadeOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
    }
    #admin-panel::-webkit-scrollbar {
        width: 6px;
    }
    #admin-panel::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.3);
        border-radius: 3px;
    }
    #admin-panel::-webkit-scrollbar-thumb {
        background: #ffaa00;
        border-radius: 3px;
    }
`;
document.head.appendChild(adminStyles);

// Keyboard shortcut: Ctrl+Shift+A to toggle admin panel
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        Admin.togglePanel();
    }
});

// Also add a small admin button in the corner
const adminToggleBtn = document.createElement('div');
adminToggleBtn.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    z-index: 9999;
    background: rgba(255, 170, 0, 0.2);
    border: 1px solid rgba(255, 170, 0, 0.3);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    color: #ffaa00;
    font-weight: bold;
    font-family: 'Orbitron', sans-serif;
    transition: all 0.3s ease;
    user-select: none;
`;
adminToggleBtn.textContent = '⚙';
adminToggleBtn.title = 'Admin Panel (Ctrl+Shift+A)';
adminToggleBtn.onclick = () => Admin.togglePanel();
adminToggleBtn.onmouseenter = () => {
    adminToggleBtn.style.background = 'rgba(255, 170, 0, 0.4)';
    adminToggleBtn.style.transform = 'scale(1.1)';
};
adminToggleBtn.onmouseleave = () => {
    adminToggleBtn.style.background = 'rgba(255, 170, 0, 0.2)';
    adminToggleBtn.style.transform = 'scale(1)';
};

// Only add the button if not on mobile
if (!isMobileDevice()) {
    document.body.appendChild(adminToggleBtn);
}

console.log('🔧 Admin Panel loaded!');
console.log('📖 Commands:');
console.log('  Admin.unlockAll() - Unlock everything');
console.log('  Admin.showPanel() - Show admin UI');
console.log('  Admin.giveQubits(99999) - Add qubits');
console.log('  Admin.spawnBoss() - Spawn a boss');
console.log('  Admin.toggleGodMode() - Toggle invincibility');
console.log('  Admin.healPlayer() - Full heal');
console.log('  Admin.resetAll() - Reset all progress');
console.log('  Press Ctrl+Shift+A to toggle admin panel');