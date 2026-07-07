// ===== MAIN ENTRY POINT =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Quantum Strike - Ultimate Edition');
    console.log('Modular version loaded successfully!');
    console.log(`Welcome, ${getUsername()}!`);
    console.log('Created by Clint Johnryl Henon Dagno');

    // Load username
    const usernameInput = document.getElementById('username-input');
    if (usernameInput) {
        usernameInput.value = getUsername();
        usernameInput.addEventListener('change', function() {
            setUsername(this.value || 'Guest');
            document.getElementById('hud-username').textContent = `${getUsername()}`;
            document.getElementById('menu-username-display').textContent = getUsername();
            
            if (typeof window.multiplayer !== 'undefined' && window.multiplayer && window.multiplayer.isConnected()) {
                if (window.multiplayer.client) {
                    window.multiplayer.client.updateName(getUsername());
                }
            }
            
            if (typeof window.updateMenuRank === 'function') {
                window.updateMenuRank();
            }
        });
    }

    document.getElementById('menu-username-display').textContent = getUsername();

    // Load keybinds
    loadKeybinds();

    // Update UI
    GUI.updateQubits();
    GUI.updateLevel();
    
    if (typeof window.updateMenuRank === 'function') {
        window.updateMenuRank();
    } else {
        setTimeout(() => {
            if (typeof window.updateMenuRank === 'function') {
                window.updateMenuRank();
            }
        }, 100);
    }

    // === PRELOAD HEAVY RAILGUN WAV SOUND ===
    if (typeof Audio !== 'undefined' && Audio) {
        Audio.loadSound('assets/audio/heavy_railgun.wav')
            .then(buffer => {
                Audio._heavyRailgunBuffer = buffer;
                console.log('Heavy railgun sound loaded successfully (17 seconds WAV)');
            })
            .catch(() => {
                console.log('Failed to load Heavy Railgun sound - will try on fire');
            });
    }

    // Set up drone command buttons
    document.querySelectorAll('.drone-command-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cmd = this.dataset.cmd;
            if (Game && Game.setDroneCommand) {
                Game.setDroneCommand(cmd);
            }
            document.querySelectorAll('.drone-command-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.cmd === cmd);
            });
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // F key - Launch drones
        if (e.key === 'f' || e.key === 'F') {
            if (Game && Game.player && Game.player.launchDrones) {
                Game.player.launchDrones();
            }
        }
        // R key - Toggle auto-cannons
        if (e.key === 'r' || e.key === 'R') {
            if (Game && Game.player && Game.player.toggleAuto) {
                Game.player.toggleAuto();
            }
        }
        // ESC key - Show pause/exit menu
        if (e.key === 'Escape') {
            e.preventDefault();
            GUI.showPauseMenu();
        }
        // M key - Multiplayer menu
        if (e.key === 'm' || e.key === 'M') {
            if (GUI.showMultiplayerMenu) {
                GUI.showMultiplayerMenu();
            }
        }
        // C key - Credits
        if (e.key === 'c' || e.key === 'C') {
            if (GUI.showCredits) {
                GUI.showCredits();
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        resizeCanvas();
    });

    // Make objects globally accessible
    window.Game = Game;
    window.GUI = GUI;
    window.GameData = GameData;
    window.getRank = getRank;
    window.getRankProgress = getRankProgress;
    window.updateMenuRank = updateMenuRank;

    console.log('All systems ready!');
    console.log('Controls:');
    console.log('  W / Up Arrow    - Thrust Forward');
    console.log('  S / Down Arrow  - Reverse');
    console.log('  A               - Rotate Left');
    console.log('  D               - Rotate Right');
    console.log('  Left Arrow      - Strafe Left');
    console.log('  Right Arrow     - Strafe Right');
    console.log('  Space           - Primary Fire');
    console.log('  Q               - Secondary Fire');
    console.log('  E               - Ability (Dash)');
    console.log('  F               - Launch Drones (Carrier only)');
    console.log('  R               - Toggle Auto-Cannons');
    console.log('  M               - LAN Multiplayer Menu');
    console.log('  C               - Credits');
    console.log('  ESC             - Pause/Exit Menu');
    console.log(`Current Rank: ${getRank(GameData.getXP()).title}`);
    console.log('Heavy Railgun: Press Space once - auto-fires after 10 seconds with 17-second sound!');
});