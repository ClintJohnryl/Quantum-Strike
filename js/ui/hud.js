// ===== HUD UPDATE FUNCTIONS =====

function updateHUD(player, enemies) {
    if (!player) return;
    document.getElementById('player-hp').style.width = `${(player.hp / player.maxHp) * 100}%`;
    document.getElementById('player-shield').textContent = player.shieldActive ? 'ON' : 'OFF';
    document.getElementById('player-speed').textContent = `${Math.round(player.speedBoost * 100)}%`;

    // --- Primary Weapon with Cooldown ---
    const weapon = WEAPONS[player.equippedWeapon];
    const weaponName = player.shipClass === 'carrier' ? 'None (Carrier)' : (weapon ? weapon.name : 'Laser Cannon');
    document.getElementById('player-weapon').textContent = weaponName;
    
    const primaryCooldownEl = document.getElementById('primary-cooldown');
    if (primaryCooldownEl) {
        // Check if charging
        if (player._isCharging) {
            const chargePercent = Math.round(player._chargeProgress * 100);
            const chargeText = `CHARGING ${chargePercent}%`;
            primaryCooldownEl.textContent = chargeText;
            primaryCooldownEl.style.color = '#ffaa00';
        } else if (player._primaryCooldown > 10) {
            const cooldownSec = (player._primaryCooldown / 1000).toFixed(1);
            primaryCooldownEl.textContent = `⏳ ${cooldownSec}s`;
            primaryCooldownEl.style.color = '#ffaa00';
        } else {
            primaryCooldownEl.textContent = 'Ready';
            primaryCooldownEl.style.color = '#44ff44';
        }
    }

    // --- Secondary Weapon with Cooldown ---
    const sec = SECONDARY_WEAPONS[player.equippedSecondary];
    document.getElementById('player-secondary').textContent = sec ? sec.name : 'None';
    
    const secondaryCooldownEl = document.getElementById('secondary-cooldown');
    if (secondaryCooldownEl) {
        if (player._secondaryCooldown > 10 && sec) {
            const cooldownSec = (player._secondaryCooldown / 1000).toFixed(1);
            secondaryCooldownEl.textContent = `⏳ ${cooldownSec}s`;
            secondaryCooldownEl.style.color = '#ffaa00';
        } else if (sec) {
            secondaryCooldownEl.textContent = 'Ready';
            secondaryCooldownEl.style.color = '#44ff44';
        } else {
            secondaryCooldownEl.textContent = '-';
            secondaryCooldownEl.style.color = '#666';
        }
    }

    const auto = AUTOCANNONS[player.equippedAutocannon];
    document.getElementById('player-autocannon').textContent = auto ? auto.name : 'None';

    const droneBay = DRONE_BAYS[player.equippedDroneBay];
    const maxDrones = droneBay ? droneBay.droneCount : 0;
    const activeDrones = player.drones ? player.drones.filter(d => d.alive).length : 0;
    document.getElementById('drone-count').textContent = `${activeDrones}/${maxDrones}`;

    const attachments = player.equippedAttachments.map(id => ATTACHMENTS[id]?.name || id);
    document.getElementById('player-attachments').textContent = attachments.length > 0 ? attachments.join(', ') : 'None';
    
    document.getElementById('player-powerups').innerHTML = '';
    
    document.getElementById('enemy-count').textContent = enemies.filter(e => e.alive).length;
    document.getElementById('score-display').textContent = player.score;
    document.getElementById('kills-display').textContent = player.kills;
    document.getElementById('combo-display').textContent = `x${Math.max(1, player.combo || 1)}`;

    // --- Username and Rank ---
    const username = getUsername();
    const xp = GameData.getXP();
    const rank = getRank(xp);
    const rankProgress = getRankProgress(xp);
    
    const nameDisplay = document.getElementById('hud-username');
    const rankDisplay = document.getElementById('hud-rank');
    const rankProgressDisplay = document.getElementById('hud-rank-progress');
    
    if (nameDisplay) {
        nameDisplay.textContent = `${username}`;
    }
    
    if (rankDisplay) {
        rankDisplay.textContent = `${rank.title}`;
        rankDisplay.style.color = rank.color;
    }
    
    if (rankProgressDisplay && rankProgress.next) {
        const progress = Math.round(rankProgress.progress * 100);
        rankProgressDisplay.textContent = `Next: ${rankProgress.next.title} (${progress}%)`;
        rankProgressDisplay.style.color = rankProgress.next.color;
    } else if (rankProgressDisplay) {
        rankProgressDisplay.textContent = 'MAX RANK!';
        rankProgressDisplay.style.color = '#ffdd00';
    }

    GUI.updateLevel();
}

function updateAutoStatus(enabled) {
    const el = document.getElementById('auto-status');
    if (enabled) {
        el.textContent = 'ON';
        el.className = 'auto-status auto-on';
    } else {
        el.textContent = 'OFF';
        el.className = 'auto-status auto-off';
    }
}

function updateMenuRank() {
    const xp = GameData.getXP();
    const rank = getRank(xp);
    const rankProgress = getRankProgress(xp);
    
    const menuRankDisplay = document.getElementById('menu-rank');
    const menuRankProgress = document.getElementById('menu-rank-progress');
    const menuUsernameDisplay = document.getElementById('menu-username-display');
    
    if (menuUsernameDisplay) {
        menuUsernameDisplay.textContent = getUsername();
    }
    
    if (menuRankDisplay) {
        menuRankDisplay.textContent = `${rank.title}`;
        menuRankDisplay.style.color = rank.color;
    }
    
    if (menuRankProgress && rankProgress.next) {
        const progress = Math.round(rankProgress.progress * 100);
        menuRankProgress.textContent = `Next: ${rankProgress.next.title} (${progress}%)`;
        menuRankProgress.style.color = rankProgress.next.color;
    } else if (menuRankProgress) {
        menuRankProgress.textContent = 'MAX RANK!';
        menuRankProgress.style.color = '#ffdd00';
    }
}

window.updateMenuRank = updateMenuRank;