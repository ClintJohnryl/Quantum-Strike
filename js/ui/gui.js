// ===== MAIN GUI CONTROLLER =====

const GUI = {
    elements: {
        mainMenu: document.getElementById('main-menu'),
        storePanel: document.getElementById('store-panel'),
        gameHud: document.getElementById('game-hud'),
        minimapContainer: document.getElementById('minimap-container'),
        qubitsDisplay: document.getElementById('qubits-display'),
        storeQubits: document.getElementById('store-qubits'),
        storeLevel: document.getElementById('store-level'),
        menuLevel: document.getElementById('menu-level'),
    },

    show(el) { if (el) el.style.display = ''; },
    hide(el) { if (el) el.style.display = 'none'; },

    updateQubits() {
        const q = GameData.getQubits();
        this.elements.qubitsDisplay.textContent = `${q} Q`;
        this.elements.storeQubits.textContent = `${q} Q`;
        document.getElementById('hud-qubits').textContent = q;
    },

    updateLevel() {
        const level = GameData.getLevel();
        const xp = GameData.getXP();
        const xpNeeded = GameData.getXPNeeded();
        this.elements.menuLevel.textContent = `Level ${level}`;
        this.elements.storeLevel.textContent = level;
        document.getElementById('player-level').textContent = level;
        const xpBar = document.getElementById('player-xp');
        if (xpBar) {
            xpBar.style.width = `${(xp / xpNeeded) * 100}%`;
        }
        if (typeof window.updateMenuRank === 'function') {
            window.updateMenuRank();
        }
    },

    openStore() {
        this.hide(this.elements.mainMenu);
        this.show(this.elements.storePanel);
        renderStore();
    },

    closeStore() {
        this.hide(this.elements.storePanel);
        this.show(this.elements.mainMenu);
    },

    quickPlay() {
        const difficulty = document.getElementById('difficulty-select').value;
        const mapSize = document.getElementById('mapsize-select').value;
        GameData.setDifficulty(difficulty);
        switch (mapSize) {
            case 'small':
                mapWidth = 2000;
                mapHeight = 2000;
                break;
            case 'medium':
                mapWidth = 4000;
                mapHeight = 4000;
                break;
            case 'large':
                mapWidth = 8000;
                mapHeight = 8000;
                break;
            case 'huge':
                mapWidth = 12000;
                mapHeight = 12000;
                break;
        }
        this.startGame('explore');
    },

    startGame(mode) {
        this.hide(this.elements.mainMenu);
        this.hide(this.elements.storePanel);
        this.show(this.elements.gameHud);
        this.show(this.elements.minimapContainer);
        gameMode = mode;
        Game.start(mode);
    },

    updateHUD(player, enemies) {
        updateHUD(player, enemies);
    },

    updateAutoStatus(enabled) {
        updateAutoStatus(enabled);
    },

    updateMinimap(player, enemies, powerups, asteroids) {
        updateMinimap(player, enemies, powerups, asteroids);
    },

    // ===== UPGRADE MENU =====
    showUpgradeMenu() {
        const existing = document.getElementById('upgrade-menu');
        if (existing) {
            existing.remove();
            return;
        }
        
        const selectedShip = GameData.getSelectedShip();
        const shipData = SHIPS.find(s => s.id === selectedShip);
        if (!shipData) {
            this.showNotification('⚠️ No ship selected!', '#ff4444');
            return;
        }
        
        const upgrades = UpgradeManager.getShipUpgrades(selectedShip);
        const totalLevel = UpgradeManager.getTotalLevel(selectedShip);
        const qubits = GameData.getQubits();
        
        let upgradeHTML = '';
        for (const [key, data] of Object.entries(upgrades)) {
            const isMaxed = data.isMaxed;
            const costDisplay = isMaxed ? 'MAX' : `${data.cost} Q`;
            const progress = (data.level / data.maxLevel) * 100;
            
            let bonusText = '';
            if (data.level > 0) {
                const bonusValue = data.bonus;
                if (data.stat === 'hp') {
                    bonusText = `+${Math.round(bonusValue)} HP`;
                } else {
                    bonusText = `+${(bonusValue * 100).toFixed(1)}%`;
                }
            }
            
            upgradeHTML += `
                <div style="
                    background: rgba(0, 20, 40, 0.6);
                    border: 1px solid ${isMaxed ? 'rgba(0,255,200,0.3)' : 'rgba(0,200,255,0.2)'};
                    border-radius: 10px;
                    padding: 12px 15px;
                    margin-bottom: 10px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-size: 20px; margin-right: 8px;">${data.icon}</span>
                            <span style="color: #00ffff; font-weight: 600;">${data.name}</span>
                            <span style="color: #80c0ff; font-size: 11px; margin-left: 8px;">Level ${data.level}/${data.maxLevel}</span>
                        </div>
                        <div>
                            <button onclick="GUI.applyUpgrade('${key}')" style="
                                background: ${isMaxed ? 'rgba(0,255,200,0.1)' : 'linear-gradient(135deg, rgba(0,200,255,0.2), rgba(0,255,200,0.1))'};
                                border: 1px solid ${isMaxed ? 'rgba(0,255,200,0.2)' : 'rgba(0,200,255,0.3)'};
                                border-radius: 6px;
                                color: ${isMaxed ? '#666' : '#c0f0ff'};
                                padding: 6px 14px;
                                cursor: ${isMaxed ? 'default' : 'pointer'};
                                font-size: 12px;
                                font-weight: 600;
                                font-family: 'Orbitron', 'Segoe UI', sans-serif;
                                letter-spacing: 0.5px;
                            " ${isMaxed ? 'disabled' : ''}>
                                ${isMaxed ? '✅ MAX' : `⬆ ${costDisplay}`}
                            </button>
                        </div>
                    </div>
                    <div style="color: #80c0ff; font-size: 11px; margin: 4px 0;">${data.description}</div>
                    <div style="
                        width: 100%;
                        height: 4px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 2px;
                        overflow: hidden;
                        margin-top: 4px;
                    ">
                        <div style="
                            width: ${progress}%;
                            height: 100%;
                            background: linear-gradient(90deg, #4488ff, #00ffcc);
                            border-radius: 2px;
                        "></div>
                    </div>
                    ${data.level > 0 ? `<div style="color: #44ff44; font-size: 10px; margin-top: 3px;">Bonus: ${bonusText}</div>` : '<div style="color: #666; font-size: 10px; margin-top: 3px;">No upgrades yet</div>'}
                </div>
            `;
        }
        
        const htmlContent = `
            <div id="upgrade-menu" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(5px);
            ">
                <div style="
                    background: linear-gradient(135deg, rgba(10, 15, 25, 0.95), rgba(20, 30, 50, 0.9));
                    border: 2px solid rgba(0, 200, 255, 0.2);
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 550px;
                    width: 95%;
                    max-height: 85vh;
                    overflow-y: auto;
                    box-shadow: 0 0 60px rgba(0, 150, 255, 0.15);
                    position: relative;
                    animation: adminFadeIn 0.3s ease-out;
                ">
                    <div style="position: sticky; top: 0; background: rgba(10,15,25,0.95); z-index: 1; padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px solid rgba(0,200,255,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="gui-title" style="font-size: 20px;">⬆️ Ship Upgrades</div>
                            <button onclick="document.getElementById('upgrade-menu').remove()" style="
                                background: none;
                                border: none;
                                color: #80c0ff;
                                font-size: 24px;
                                cursor: pointer;
                            " onmouseover="this.style.color='#ff4444'" onmouseout="this.style.color='#80c0ff'">✕</button>
                        </div>
                        <div style="color: #80c0ff; font-size: 13px; margin-top: 5px;">
                            🚀 ${shipData.name} | Total Upgrade Level: ${totalLevel}/25
                        </div>
                        <div style="color: #ffaa00; font-size: 12px; margin-top: 3px;">
                            💰 ${qubits} Qubits available
                        </div>
                        <div style="color: #666; font-size: 10px; margin-top: 3px;">
                            Each upgrade gives a small stat bonus. Max level: 5 per category.
                        </div>
                    </div>
                    
                    <div style="max-height: 55vh; overflow-y: auto; padding-right: 5px;">
                        ${upgradeHTML}
                    </div>
                    
                    <div style="position: sticky; bottom: 0; background: rgba(10,15,25,0.95); padding-top: 15px; margin-top: 15px; border-top: 1px solid rgba(0,200,255,0.1);">
                        <button onclick="document.getElementById('upgrade-menu').remove()" style="
                            width: 100%;
                            background: linear-gradient(135deg, rgba(0, 200, 255, 0.15), rgba(0, 255, 200, 0.05));
                            border: 1px solid rgba(0, 200, 255, 0.2);
                            border-radius: 8px;
                            color: #80c0ff;
                            padding: 10px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            font-family: 'Orbitron', 'Segoe UI', sans-serif;
                            letter-spacing: 1px;
                        " onmouseover="this.style.background='linear-gradient(135deg, rgba(0,200,255,0.25), rgba(0,255,200,0.1))'" onmouseout="this.style.background='linear-gradient(135deg, rgba(0,200,255,0.15), rgba(0,255,200,0.05))'">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', htmlContent);
    },
    
    applyUpgrade(category) {
        const selectedShip = GameData.getSelectedShip();
        const result = UpgradeManager.applyUpgrade(selectedShip, category);
        
        if (result.success) {
            this.showNotification(`✅ ${result.message}`, '#44ff44');
            if (typeof Audio !== 'undefined' && Audio) {
                Audio.playPowerup(0.2);
            }
            this.showUpgradeMenu();
            if (Game && Game.player) {
                GUI.updateHUD(Game.player, Game.enemies);
            }
        } else {
            this.showNotification(`❌ ${result.message}`, '#ff4444');
        }
    },

    // ===== CREDITS =====
    showCredits() {
        const existing = document.getElementById('credits-modal');
        if (existing) {
            existing.remove();
            return;
        }
        
        const htmlContent = `
            <div id="credits-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.85);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
            ">
                <div style="
                    background: linear-gradient(135deg, rgba(10, 15, 25, 0.95), rgba(20, 30, 50, 0.9));
                    border: 2px solid rgba(0, 200, 255, 0.3);
                    border-radius: 20px;
                    padding: 40px 50px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 0 60px rgba(0, 150, 255, 0.2);
                    position: relative;
                    animation: adminFadeIn 0.3s ease-out;
                ">
                    <div style="position: absolute; top: 10px; right: 20px;">
                        <button onclick="document.getElementById('credits-modal').remove()" style="
                            background: none;
                            border: none;
                            color: #80c0ff;
                            font-size: 24px;
                            cursor: pointer;
                        " onmouseover="this.style.color='#ff4444'" onmouseout="this.style.color='#80c0ff'">✕</button>
                    </div>
                    
                    <div class="gui-title" style="font-size: 28px; margin-bottom: 20px;">QUANTUM STRIKE</div>
                    <div style="color: #80c0ff; font-size: 14px; margin-bottom: 30px;">Ultimate Space Combat Simulator</div>
                    
                    <div style="border-top: 1px solid rgba(0, 200, 255, 0.2); padding-top: 20px; margin-bottom: 20px;">
                        <div style="color: #00ffff; font-size: 16px; font-weight: 600; margin-bottom: 15px;">CREATOR</div>
                        <div style="color: #ffaa00; font-size: 22px; font-weight: 700; text-shadow: 0 0 20px rgba(255, 170, 0, 0.3);">
                            Clint Johnryl Henon Dagno
                        </div>
                        <div style="color: #80c0ff; font-size: 13px; margin-top: 5px;">Game Developer & Designer</div>
                    </div>
                    
                    <div style="border-top: 1px solid rgba(0, 200, 255, 0.1); padding-top: 15px;">
                        <div style="color: #4488ff; font-size: 13px;">Version 1.0.0</div>
                        <div style="color: #666; font-size: 11px; margin-top: 5px;">© 2024 Quantum Strike. All rights reserved.</div>
                        <div style="color: #444; font-size: 9px; margin-top: 3px;">
                            Heavy Railgun sound by FairhavenCollection (Freesound.org)
                        </div>
                    </div>
                    
                    <button onclick="document.getElementById('credits-modal').remove()" style="
                        margin-top: 20px;
                        background: linear-gradient(135deg, rgba(0, 200, 255, 0.2), rgba(0, 255, 200, 0.1));
                        border: 1px solid rgba(0, 200, 255, 0.3);
                        border-radius: 8px;
                        color: #c0f0ff;
                        padding: 10px 30px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    " onmouseover="this.style.background='linear-gradient(135deg, rgba(0,200,255,0.4), rgba(0,255,200,0.2))'" onmouseout="this.style.background='linear-gradient(135deg, rgba(0,200,255,0.2), rgba(0,255,200,0.1))'">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', htmlContent);
    },

    // ===== MULTIPLAYER MENU (FIXED - No gui-panel class) =====
    showMultiplayerMenu() {
        const existing = document.getElementById('multiplayer-menu-container');
        if (existing) {
            existing.remove();
            return;
        }
        
        // Completely inline styles - no gui-panel class
        const htmlContent = `
            <div id="multiplayer-menu-container" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.7);
                z-index: 100;
                display: flex;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(5px);
            ">
                <div id="multiplayer-menu" style="
                    background: linear-gradient(135deg, rgba(10, 15, 25, 0.95), rgba(20, 30, 50, 0.9));
                    border: 1px solid rgba(0, 200, 255, 0.2);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0, 150, 255, 0.1);
                    color: #e0f0ff;
                    font-size: 14px;
                    padding: 30px;
                    width: 400px;
                    max-width: 90vw;
                    position: relative;
                    animation: adminFadeIn 0.3s ease-out;
                ">
                    <div class="gui-title" style="font-size:20px;margin-bottom:15px;">🌐 LAN Multiplayer</div>
                    <div style="margin-bottom:15px;">
                        <span class="gui-label">Server Address</span>
                        <input id="server-host-input" class="gui-input" value="localhost" placeholder="Server IP or hostname">
                    </div>
                    <div style="margin-bottom:15px;">
                        <span class="gui-label">Port</span>
                        <input id="server-port-input" class="gui-input" value="8081" placeholder="Port">
                    </div>
                    <div style="margin-bottom:10px;">
                        <button class="gui-button primary" onclick="GUI.connectToServer()" style="width:100%;">🔗 Connect</button>
                    </div>
                    <div style="margin-bottom:10px;">
                        <button class="gui-button" onclick="GUI.hostServer()" style="width:100%;">🖥️ Host Game</button>
                    </div>
                    <div id="multiplayer-status" style="color:#80c0ff;font-size:12px;text-align:center;margin-top:10px;">
                        Status: Disconnected
                    </div>
                    <div style="margin-top:15px;display:flex;gap:10px;">
                        <button class="gui-button" onclick="document.getElementById('multiplayer-menu-container').remove()" style="width:100%;">✕ Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', htmlContent);
    },

    // ===== PAUSE MENU =====
    showPauseMenu() {
        const existing = document.getElementById('pause-menu');
        if (existing) {
            existing.remove();
            if (gameRunning) {
                document.getElementById('game-hud').style.display = '';
                this.hidePauseOverlay();
            }
            return;
        }
        
        if (gameRunning) {
            this.showPauseOverlay();
        }
        
        const isInGame = document.getElementById('game-hud').style.display !== 'none';
        
        const htmlContent = `
            <div id="pause-menu" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.75);
                z-index: 9998;
                display: flex;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(5px);
            ">
                <div style="
                    background: linear-gradient(135deg, rgba(10, 15, 25, 0.95), rgba(20, 30, 50, 0.9));
                    border: 2px solid rgba(0, 200, 255, 0.3);
                    border-radius: 20px;
                    padding: 40px 50px;
                    max-width: 450px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 0 60px rgba(0, 150, 255, 0.2);
                    position: relative;
                    animation: adminFadeIn 0.3s ease-out;
                ">
                    <div class="gui-title" style="font-size: 24px; margin-bottom: 10px;">⏸️ PAUSED</div>
                    <div style="color: #80c0ff; font-size: 14px; margin-bottom: 25px;">
                        ${isInGame ? 'Game is currently paused' : 'Main Menu'}
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${isInGame ? `
                            <button onclick="GUI.resumeGame()" style="
                                background: linear-gradient(135deg, rgba(0, 255, 200, 0.2), rgba(0, 200, 255, 0.1));
                                border: 1px solid rgba(0, 255, 200, 0.4);
                                border-radius: 10px;
                                color: #00ffcc;
                                padding: 12px 20px;
                                cursor: pointer;
                                font-size: 16px;
                                font-weight: 600;
                                font-family: 'Orbitron', 'Segoe UI', sans-serif;
                                letter-spacing: 1px;
                            " onmouseover="this.style.background='linear-gradient(135deg, rgba(0,255,200,0.3), rgba(0,200,255,0.2))'" onmouseout="this.style.background='linear-gradient(135deg, rgba(0,255,200,0.2), rgba(0,200,255,0.1))'">
                                ▶️ Resume Game
                            </button>
                        ` : `
                            <button onclick="GUI.startGame('explore')" style="
                                background: linear-gradient(135deg, rgba(0, 255, 200, 0.2), rgba(0, 200, 255, 0.1));
                                border: 1px solid rgba(0, 255, 200, 0.4);
                                border-radius: 10px;
                                color: #00ffcc;
                                padding: 12px 20px;
                                cursor: pointer;
                                font-size: 16px;
                                font-weight: 600;
                                font-family: 'Orbitron', 'Segoe UI', sans-serif;
                                letter-spacing: 1px;
                            " onmouseover="this.style.background='linear-gradient(135deg, rgba(0,255,200,0.3), rgba(0,200,255,0.2))'" onmouseout="this.style.background='linear-gradient(135deg, rgba(0,255,200,0.2), rgba(0,200,255,0.1))'">
                                🚀 Quick Play
                            </button>
                        `}
                        
                        <button onclick="GUI.resumeGame()" style="
                            background: rgba(0, 200, 255, 0.1);
                            border: 1px solid rgba(0, 200, 255, 0.2);
                            border-radius: 10px;
                            color: #80c0ff;
                            padding: 12px 20px;
                            cursor: pointer;
                            font-size: 15px;
                            font-weight: 600;
                            font-family: 'Orbitron', 'Segoe UI', sans-serif;
                            letter-spacing: 1px;
                        " onmouseover="this.style.background='rgba(0,200,255,0.2)'" onmouseout="this.style.background='rgba(0,200,255,0.1)'">
                            ❌ Cancel
                        </button>
                        
                        <hr style="border-color: rgba(0,200,255,0.1); margin: 5px 0;">
                        
                        <button onclick="GUI.confirmExit()" style="
                            background: rgba(255, 0, 0, 0.15);
                            border: 1px solid rgba(255, 0, 0, 0.3);
                            border-radius: 10px;
                            color: #ff4444;
                            padding: 12px 20px;
                            cursor: pointer;
                            font-size: 15px;
                            font-weight: 600;
                            font-family: 'Orbitron', 'Segoe UI', sans-serif;
                            letter-spacing: 1px;
                        " onmouseover="this.style.background='rgba(255,0,0,0.25)'" onmouseout="this.style.background='rgba(255,0,0,0.15)'">
                            ⚠️ Exit Game
                        </button>
                    </div>
                    
                    <div style="color: #444; font-size: 10px; margin-top: 15px;">
                        ${isInGame ? 'Press ESC again to resume' : 'Press ESC to close'}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', htmlContent);
        
        if (isInGame && gameRunning) {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    },
    
    resumeGame() {
        const menu = document.getElementById('pause-menu');
        if (menu) menu.remove();
        
        this.hidePauseOverlay();
        
        if (gameRunning && Game && Game.loop) {
            if (!animationId) {
                Game.loop();
            }
        }
        
        document.getElementById('game-hud').style.display = '';
    },
    
    showPauseOverlay() {
        const overlay = document.getElementById('pause-overlay');
        if (!overlay) {
            const div = document.createElement('div');
            div.id = 'pause-overlay';
            div.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.3);
                z-index: 9997;
                pointer-events: none;
            `;
            document.body.appendChild(div);
        }
    },
    
    hidePauseOverlay() {
        const overlay = document.getElementById('pause-overlay');
        if (overlay) overlay.remove();
    },
    
    confirmExit() {
        const menu = document.getElementById('pause-menu');
        if (menu) menu.remove();
        
        this.hidePauseOverlay();
        
        const htmlContent = `
            <div id="exit-confirm" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
            ">
                <div style="
                    background: linear-gradient(135deg, rgba(10, 15, 25, 0.95), rgba(20, 30, 50, 0.9));
                    border: 2px solid rgba(255, 0, 0, 0.3);
                    border-radius: 20px;
                    padding: 35px 45px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 0 60px rgba(255, 0, 0, 0.15);
                    animation: adminFadeIn 0.3s ease-out;
                ">
                    <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                    <div style="color: #ff4444; font-size: 20px; font-weight: 700; font-family: 'Orbitron', 'Segoe UI', sans-serif; margin-bottom: 10px;">
                        Exit Game?
                    </div>
                    <div style="color: #80c0ff; font-size: 14px; margin-bottom: 25px;">
                        Are you sure you want to exit Quantum Strike?
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="document.getElementById('exit-confirm').remove(); GUI.resumeGame();" style="
                            background: rgba(0, 200, 255, 0.15);
                            border: 1px solid rgba(0, 200, 255, 0.3);
                            border-radius: 10px;
                            color: #80c0ff;
                            padding: 10px 25px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            font-family: 'Orbitron', 'Segoe UI', sans-serif;
                        " onmouseover="this.style.background='rgba(0,200,255,0.25)'" onmouseout="this.style.background='rgba(0,200,255,0.15)'">
                            Cancel
                        </button>
                        <button onclick="GUI.exitGame()" style="
                            background: rgba(255, 0, 0, 0.25);
                            border: 1px solid rgba(255, 0, 0, 0.4);
                            border-radius: 10px;
                            color: #ff4444;
                            padding: 10px 25px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            font-family: 'Orbitron', 'Segoe UI', sans-serif;
                        " onmouseover="this.style.background='rgba(255,0,0,0.35)'" onmouseout="this.style.background='rgba(255,0,0,0.25)'">
                            Yes, Exit
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', htmlContent);
    },
    
    exitGame() {
        gameRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        document.getElementById('exit-confirm')?.remove();
        document.getElementById('pause-menu')?.remove();
        document.getElementById('pause-overlay')?.remove();
        
        if (window.electron && window.electron.send) {
            window.electron.send('quit-app');
            return;
        }
        
        if (confirm('Exit to main menu?')) {
            location.reload();
        }
    },

    connectToServer() {
        const host = document.getElementById('server-host-input').value || 'localhost';
        const port = parseInt(document.getElementById('server-port-input').value) || 8081;
        const status = document.getElementById('multiplayer-status');
        
        status.textContent = 'Connecting...';
        status.style.color = '#ffaa00';
        
        if (typeof window.multiplayer === 'undefined') {
            status.textContent = '❌ Multiplayer not loaded. Refresh and try again.';
            status.style.color = '#ff4444';
            return;
        }
        
        window.multiplayer.init(host, port)
            .then(() => {
                status.textContent = '✅ Connected!';
                status.style.color = '#44ff44';
                
                const username = getUsername();
                if (window.multiplayer.client) {
                    window.multiplayer.client.updateName(username);
                }
                
                this.showNotification('🌐 Connected to LAN server!', '#44ff44');
                
                setTimeout(() => {
                    const container = document.getElementById('multiplayer-menu-container');
                    if (container) container.remove();
                }, 1000);
            })
            .catch((e) => {
                status.textContent = '❌ Connection failed: ' + (e.message || 'Server not found');
                status.style.color = '#ff4444';
            });
    },

    hostServer() {
        const status = document.getElementById('multiplayer-status');
        status.textContent = 'Starting server...';
        status.style.color = '#ffaa00';
        
        if (typeof window.multiplayer === 'undefined') {
            status.textContent = '❌ Multiplayer not loaded. Refresh and try again.';
            status.style.color = '#ff4444';
            return;
        }
        
        window.multiplayer.init('localhost', 8081)
            .then(() => {
                window.multiplayer.isHost = true;
                if (typeof window.stateSync !== 'undefined') {
                    window.stateSync.init(true);
                }
                status.textContent = '✅ Server hosted!';
                status.style.color = '#44ff44';
                
                this.showNotification('🖥️ Hosting game server!', '#ffaa00');
                
                setTimeout(() => {
                    const container = document.getElementById('multiplayer-menu-container');
                    if (container) container.remove();
                }, 1000);
            })
            .catch(() => {
                status.textContent = '❌ Could not start server. Make sure server.js is running.';
                status.style.color = '#ff4444';
            });
    },

    updateMultiplayerStatus() {
        const statusEl = document.getElementById('multiplayer-status-display');
        if (statusEl && typeof window.multiplayer !== 'undefined' && window.multiplayer) {
            const connected = window.multiplayer.isConnected();
            const count = window.multiplayer.getPlayerCount ? window.multiplayer.getPlayerCount() : 0;
            statusEl.textContent = connected ? `🌐 ${count} players online` : '🌐 Offline';
            statusEl.style.color = connected ? '#44ff44' : '#888888';
        }
    },

    showNotification(message, color = '#00ffcc') {
        const existing = document.getElementById('gui-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.id = 'gui-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${color};
            border-radius: 12px;
            padding: 15px 30px;
            color: ${color};
            font-family: 'Orbitron', 'Segoe UI', sans-serif;
            font-size: 16px;
            font-weight: bold;
            z-index: 9999;
            text-align: center;
            text-shadow: 0 0 20px ${color};
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
            pointer-events: none;
            animation: adminFadeIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'adminFadeOut 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 2500);
    }
};