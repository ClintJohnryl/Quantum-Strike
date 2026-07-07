// ===== STORE FUNCTIONS =====

function renderStore() {
    renderShips();
    renderWeapons();
    renderSecondaryWeapons();
    renderAutocannons();
    renderDrones();
    renderAttachments();
    renderAccessories();
    GUI.updateQubits();
    GUI.updateLevel();
}

function renderShips() {
    const grid = document.getElementById('store-grid');
    grid.innerHTML = '';
    const owned = GameData.getOwnedShips();
    const selected = GameData.getSelectedShip();
    SHIPS.forEach(ship => {
        const card = document.createElement('div');
        card.className = 'ship-card' + (selected === ship.id ? ' selected' : '');
        const preview = document.createElement('canvas');
        preview.width = 80;
        preview.height = 80;
        preview.className = 'ship-preview';
        ship.preview(preview.getContext('2d'), 80);
        card.appendChild(preview);
        const name = document.createElement('div');
        name.style.cssText = 'color: #00ffff; font-weight: 600; margin: 8px 0;';
        name.textContent = ship.name;
        card.appendChild(name);
        const classTag = document.createElement('div');
        const classData = SHIP_CLASSES[ship.classType || 'light'];
        classTag.className = `ship-class-tag class-${ship.classType || 'light'}`;
        classTag.textContent = `${classData.icon} ${classData.label}`;
        card.appendChild(classTag);
        const rarity = document.createElement('div');
        rarity.className = `rarity-text rarity-${ship.rarity || 'common'}`;
        rarity.textContent = RARITIES[ship.rarity || 'common'].label;
        card.appendChild(rarity);
        const stats = document.createElement('div');
        stats.style.cssText = 'color: #80c0ff; font-size: 11px; margin: 5px 0;';
        stats.innerHTML = `HP: ${ship.stats.hp} | Spd: ${ship.stats.speed}<br>Dmg: ${ship.stats.damage}`;
        card.appendChild(stats);
        if (ship.classType === 'carrier') {
            const carrierTag = document.createElement('div');
            carrierTag.style.cssText = 'color: #00ffcc; font-size: 10px; margin-top: 3px;';
            carrierTag.textContent = '🚁 Launches drones | 2x Auto-Cannons';
            card.appendChild(carrierTag);
        }
        if (owned.includes(ship.id)) {
            const btn = document.createElement('button');
            btn.className = 'gui-button' + (selected === ship.id ? ' equipped' : '');
            btn.textContent = selected === ship.id ? '✓ Equipped' : 'Equip';
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 12px; padding: 6px;';
            btn.onclick = () => { GameData.setSelectedShip(ship.id);
                renderShips(); };
            card.appendChild(btn);
        } else {
            const btn = document.createElement('button');
            btn.className = 'gui-button';
            btn.textContent = `Buy - ${ship.price} Q`;
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 12px; padding: 6px;';
            btn.onclick = () => {
                if (GameData.buyShip(ship.id)) { renderShips();
                    GUI.updateQubits(); }
            };
            card.appendChild(btn);
        }
        grid.appendChild(card);
    });
}

function renderWeapons() {
    const grid = document.getElementById('weapon-grid');
    grid.innerHTML = '';
    const owned = GameData.getOwnedWeapons();
    const equipped = GameData.getEquippedWeapon();
    const selectedShip = GameData.getSelectedShip();
    const shipData = SHIPS.find(s => s.id === selectedShip);
    const isCarrier = shipData && shipData.classType === 'carrier';

    Object.values(WEAPONS).forEach(weapon => {
        const card = document.createElement('div');
        card.className = 'weapon-card' + (equipped === weapon.id ? ' equipped' : '');
        if (isCarrier) {
            const disabledMsg = document.createElement('div');
            disabledMsg.style.cssText = 'color: #ff4444; font-size: 10px; margin: 3px 0;';
            disabledMsg.textContent = '🚫 Carriers have no primary weapon';
            card.appendChild(disabledMsg);
        }
        const icon = document.createElement('div');
        icon.style.cssText = `font-size: 32px; color: ${isCarrier ? '#666' : weapon.color};`;
        icon.textContent = weapon.explosive ? '💥' : weapon.piercing ? '⚡' : '🔫';
        card.appendChild(icon);
        const name = document.createElement('div');
        name.style.cssText = `color: ${isCarrier ? '#666' : weapon.color}; font-weight: 600; margin: 5px 0;`;
        name.textContent = weapon.name;
        card.appendChild(name);
        const slotTag = document.createElement('div');
        slotTag.className = 'weapon-slot-tag slot-primary';
        slotTag.textContent = '⚡ Primary';
        card.appendChild(slotTag);
        const rarity = document.createElement('div');
        rarity.className = `rarity-text rarity-${weapon.rarity || 'common'}`;
        rarity.textContent = RARITIES[weapon.rarity || 'common'].label;
        card.appendChild(rarity);
        const stats = document.createElement('div');
        stats.style.cssText = 'color: #aaa; font-size: 10px; margin: 3px 0;';
        stats.innerHTML = `DMG: ${weapon.damage} | RPM: ${Math.round(60000 / weapon.fireRate)}`;
        card.appendChild(stats);
        if (owned.includes(weapon.id) && !isCarrier) {
            const btn = document.createElement('button');
            btn.className = 'gui-button' + (equipped === weapon.id ? ' equipped' : '');
            btn.textContent = equipped === weapon.id ? '✓ Equipped' : 'Equip';
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => { GameData.setEquippedWeapon(weapon.id);
                renderWeapons(); };
            card.appendChild(btn);
        } else if (!isCarrier) {
            const btn = document.createElement('button');
            btn.className = 'gui-button';
            btn.textContent = `Buy - ${weapon.price} Q`;
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => {
                if (GameData.buyWeapon(weapon.id)) { renderWeapons();
                    GUI.updateQubits(); }
            };
            card.appendChild(btn);
        }
        grid.appendChild(card);
    });
}

function renderSecondaryWeapons() {
    const grid = document.getElementById('secondary-grid');
    grid.innerHTML = '';
    const owned = GameData.getOwnedSecondary();
    const equipped = GameData.getEquippedSecondary();
    Object.values(SECONDARY_WEAPONS).forEach(weapon => {
        const card = document.createElement('div');
        card.className = 'weapon-card' + (equipped === weapon.id ? ' equipped' : '');
        const icon = document.createElement('div');
        icon.style.cssText = `font-size: 32px; color: ${weapon.color};`;
        icon.textContent = weapon.icon || '💥';
        card.appendChild(icon);
        const name = document.createElement('div');
        name.style.cssText = `color: ${weapon.color}; font-weight: 600; margin: 5px 0;`;
        name.textContent = weapon.name;
        card.appendChild(name);
        const slotTag = document.createElement('div');
        slotTag.className = 'weapon-slot-tag slot-secondary';
        slotTag.textContent = '💥 Secondary';
        card.appendChild(slotTag);
        const rarity = document.createElement('div');
        rarity.className = `rarity-text rarity-${weapon.rarity || 'common'}`;
        rarity.textContent = RARITIES[weapon.rarity || 'common'].label;
        card.appendChild(rarity);
        const stats = document.createElement('div');
        stats.style.cssText = 'color: #aaa; font-size: 10px; margin: 3px 0;';
        stats.innerHTML = `DMG: ${weapon.damage} | CD: ${(weapon.fireRate / 1000).toFixed(1)}s`;
        card.appendChild(stats);
        if (owned.includes(weapon.id)) {
            const btn = document.createElement('button');
            btn.className = 'gui-button' + (equipped === weapon.id ? ' equipped' : '');
            btn.textContent = equipped === weapon.id ? '✓ Equipped' : 'Equip';
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => { GameData.setEquippedSecondary(weapon.id);
                renderSecondaryWeapons(); };
            card.appendChild(btn);
        } else {
            const btn = document.createElement('button');
            btn.className = 'gui-button';
            btn.textContent = `Buy - ${weapon.price} Q`;
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => {
                if (GameData.buySecondary(weapon.id)) { renderSecondaryWeapons();
                    GUI.updateQubits(); }
            };
            card.appendChild(btn);
        }
        grid.appendChild(card);
    });
}

function renderAutocannons() {
    const grid = document.getElementById('autocannon-grid');
    grid.innerHTML = '';
    const owned = GameData.getOwnedAutocannons();
    const equipped = GameData.getEquippedAutocannon();
    const selectedShip = GameData.getSelectedShip();
    const shipData = SHIPS.find(s => s.id === selectedShip);
    const shipClass = shipData ? shipData.classType : 'light';

    Object.values(AUTOCANNONS).forEach(weapon => {
        const canEquip = weapon.requiredClass === shipClass ||
            (shipClass === 'carrier' && weapon.requiredClass === 'carrier') ||
            (shipClass === 'superheavy' && weapon.requiredClass === 'superheavy');
        const card = document.createElement('div');
        card.className = 'weapon-card' + (equipped === weapon.id ? ' equipped' : '');
        const icon = document.createElement('div');
        icon.style.cssText = `font-size: 32px; color: ${canEquip ? weapon.color : '#666'};`;
        icon.textContent = '🎯';
        card.appendChild(icon);
        const name = document.createElement('div');
        name.style.cssText = `color: ${canEquip ? weapon.color : '#666'}; font-weight: 600; margin: 5px 0;`;
        name.textContent = weapon.name;
        card.appendChild(name);
        const slotTag = document.createElement('div');
        slotTag.className = 'weapon-slot-tag slot-autocannon';
        slotTag.textContent = '⚙️ Auto-Cannon (Auto-Aim)';
        card.appendChild(slotTag);
        const reqTag = document.createElement('div');
        reqTag.style.cssText = `font-size: 9px; color: ${canEquip ? '#ffcc00' : '#ff4444'}; margin: 2px 0;`;
        const classReq = weapon.requiredClass === 'superheavy' ? '🏛️ Super Heavy' :
            weapon.requiredClass === 'carrier' ? '🚁 Carrier' :
            weapon.requiredClass === 'heavy' ? '🛡️ Heavy' : '⚖️ Medium';
        reqTag.textContent = `Requires: ${classReq} ${canEquip ? '✅' : '❌'}`;
        card.appendChild(reqTag);
        const rarity = document.createElement('div');
        rarity.className = `rarity-text rarity-${weapon.rarity || 'common'}`;
        rarity.textContent = RARITIES[weapon.rarity || 'common'].label;
        card.appendChild(rarity);
        const stats = document.createElement('div');
        stats.style.cssText = 'color: #aaa; font-size: 10px; margin: 3px 0;';
        stats.innerHTML = `DMG: ${weapon.damage} | RPM: ${Math.round(60000 / weapon.fireRate)}<br>Range: ${weapon.range}`;
        card.appendChild(stats);
        if (owned.includes(weapon.id) && canEquip) {
            const btn = document.createElement('button');
            btn.className = 'gui-button' + (equipped === weapon.id ? ' equipped' : '');
            btn.textContent = equipped === weapon.id ? '✓ Equipped' : 'Equip';
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => { GameData.setEquippedAutocannon(weapon.id);
                renderAutocannons(); };
            card.appendChild(btn);
        } else if (!owned.includes(weapon.id) && canEquip) {
            const btn = document.createElement('button');
            btn.className = 'gui-button';
            btn.textContent = `Buy - ${weapon.price} Q`;
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => {
                if (GameData.buyAutocannon(weapon.id)) { renderAutocannons();
                    GUI.updateQubits(); }
            };
            card.appendChild(btn);
        } else {
            const disabledBtn = document.createElement('button');
            disabledBtn.className = 'gui-button';
            disabledBtn.textContent = '🔒 Locked';
            disabledBtn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px; opacity: 0.5; cursor: not-allowed;';
            card.appendChild(disabledBtn);
        }
        grid.appendChild(card);
    });
}

function renderDrones() {
    const grid = document.getElementById('drone-grid');
    grid.innerHTML = '';
    const owned = GameData.getOwnedDrones();
    const equipped = GameData.getEquippedDroneBay();
    const selectedShip = GameData.getSelectedShip();
    const shipData = SHIPS.find(s => s.id === selectedShip);
    const isCarrier = shipData && shipData.classType === 'carrier';

    if (!isCarrier) {
        const msg = document.createElement('div');
        msg.style.cssText = 'color: #ff4444; padding: 20px; text-align: center; grid-column: 1/-1;';
        msg.textContent = '🚁 Drone bays are only available for Carrier class ships!';
        grid.appendChild(msg);
        return;
    }

    Object.values(DRONE_BAYS).forEach(bay => {
        const card = document.createElement('div');
        card.className = 'weapon-card' + (equipped === bay.id ? ' equipped' : '');
        const icon = document.createElement('div');
        icon.style.cssText = `font-size: 32px; color: ${bay.color};`;
        icon.textContent = bay.icon || '🚁';
        card.appendChild(icon);
        const name = document.createElement('div');
        name.style.cssText = `color: ${bay.color}; font-weight: 600; margin: 5px 0;`;
        name.textContent = bay.name;
        card.appendChild(name);
        const slotTag = document.createElement('div');
        slotTag.className = 'weapon-slot-tag slot-carrier';
        slotTag.textContent = '🚁 Drone Bay';
        card.appendChild(slotTag);
        const rarity = document.createElement('div');
        rarity.className = `rarity-text rarity-${bay.rarity || 'common'}`;
        rarity.textContent = RARITIES[bay.rarity || 'common'].label;
        card.appendChild(rarity);
        const stats = document.createElement('div');
        stats.style.cssText = 'color: #aaa; font-size: 10px; margin: 3px 0;';
        stats.innerHTML = `Drones: ${bay.droneCount} | DMG: ${bay.droneDamage}<br>HP: ${bay.droneHp} | Speed: ${bay.droneSpeed}`;
        card.appendChild(stats);
        if (owned.includes(bay.id)) {
            const btn = document.createElement('button');
            btn.className = 'gui-button' + (equipped === bay.id ? ' equipped' : '');
            btn.textContent = equipped === bay.id ? '✓ Equipped' : 'Equip';
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => { GameData.setEquippedDroneBay(bay.id);
                renderDrones(); };
            card.appendChild(btn);
        } else {
            const btn = document.createElement('button');
            btn.className = 'gui-button';
            btn.textContent = `Buy - ${bay.price} Q`;
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => {
                if (GameData.buyDroneBay(bay.id)) { renderDrones();
                    GUI.updateQubits(); }
            };
            card.appendChild(btn);
        }
        grid.appendChild(card);
    });
}

function renderAttachments() {
    const grid = document.getElementById('attachment-grid');
    grid.innerHTML = '';
    const owned = GameData.getOwnedAttachments();
    const equipped = GameData.getEquippedAttachments();
    Object.values(ATTACHMENTS).forEach(attachment => {
        const card = document.createElement('div');
        card.className = 'attachment-card' + (equipped.includes(attachment.id) ? ' equipped' : '');
        const preview = document.createElement('div');
        preview.className = 'attachment-preview';
        preview.textContent = attachment.icon;
        card.appendChild(preview);
        const name = document.createElement('div');
        name.style.cssText = `color: ${attachment.color}; font-weight: 600; margin: 5px 0;`;
        name.textContent = attachment.name;
        card.appendChild(name);
        const rarity = document.createElement('div');
        rarity.className = `rarity-text rarity-${attachment.rarity || 'common'}`;
        rarity.textContent = RARITIES[attachment.rarity || 'common'].label;
        card.appendChild(rarity);
        const type = document.createElement('div');
        type.style.cssText = 'color: #80c0ff; font-size: 10px; text-transform: uppercase;';
        type.textContent = attachment.type;
        card.appendChild(type);
        const stats = document.createElement('div');
        stats.style.cssText = 'color: #aaa; font-size: 10px; margin: 3px 0;';
        const statText = [];
        if (attachment.stats.speed) statText.push(`Spd: ${attachment.stats.speed > 1 ? '+' + ((attachment.stats.speed - 1) * 100).toFixed(0) + '%' : ((attachment.stats.speed - 1) * 100).toFixed(0) + '%'}`);
        if (attachment.stats.hp) statText.push(`HP: ${attachment.stats.hp > 0 ? '+' + attachment.stats.hp : attachment.stats.hp}`);
        if (attachment.stats.damage) statText.push(`Dmg: +${(attachment.stats.damage * 100).toFixed(0)}%`);
        if (attachment.stats.agility) statText.push(`Agi: ${attachment.stats.agility > 1 ? '+' + ((attachment.stats.agility - 1) * 100).toFixed(0) + '%' : ((attachment.stats.agility - 1) * 100).toFixed(0) + '%'}`);
        if (attachment.stats.shield_regen) statText.push('Shield Regen');
        if (attachment.stats.auto_aim) statText.push('Auto-Aim');
        if (attachment.stats.lifesteal) statText.push('Lifesteal');
        if (attachment.stats.thorns) statText.push('Thorns');
        stats.textContent = statText.join(' | ');
        card.appendChild(stats);
        if (owned.includes(attachment.id)) {
            const btn = document.createElement('button');
            btn.className = 'gui-button' + (equipped.includes(attachment.id) ? ' equipped' : '');
            btn.textContent = equipped.includes(attachment.id) ? '✓ Equipped' : 'Equip';
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => {
                GameData.toggleAttachment(attachment.id);
                renderAttachments();
            };
            card.appendChild(btn);
        } else {
            const btn = document.createElement('button');
            btn.className = 'gui-button';
            btn.textContent = `Buy - ${attachment.price} Q`;
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => {
                if (GameData.buyAttachment(attachment.id)) { renderAttachments();
                    GUI.updateQubits(); }
            };
            card.appendChild(btn);
        }
        grid.appendChild(card);
    });
}

function renderAccessories() {
    const grid = document.getElementById('accessory-grid');
    grid.innerHTML = '';
    const owned = GameData.getOwnedAccessories();
    const equipped = GameData.getEquippedAccessories();
    Object.values(ACCESSORIES).forEach(accessory => {
        const card = document.createElement('div');
        card.className = 'accessory-card' + (equipped.includes(accessory.id) ? ' equipped' : '');
        const preview = document.createElement('div');
        preview.className = 'attachment-preview';
        preview.textContent = accessory.icon;
        card.appendChild(preview);
        const name = document.createElement('div');
        name.style.cssText = `color: ${accessory.color}; font-weight: 600; margin: 5px 0;`;
        name.textContent = accessory.name;
        card.appendChild(name);
        const rarity = document.createElement('div');
        rarity.className = `rarity-text rarity-${accessory.rarity || 'common'}`;
        rarity.textContent = RARITIES[accessory.rarity || 'common'].label;
        card.appendChild(rarity);
        const desc = document.createElement('div');
        desc.style.cssText = 'color: #80c0ff; font-size: 10px; margin: 3px 0;';
        desc.textContent = accessory.description;
        card.appendChild(desc);
        if (owned.includes(accessory.id)) {
            const btn = document.createElement('button');
            btn.className = 'gui-button' + (equipped.includes(accessory.id) ? ' equipped' : '');
            btn.textContent = equipped.includes(accessory.id) ? '✓ Equipped' : 'Equip';
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => {
                GameData.toggleAccessory(accessory.id);
                renderAccessories();
            };
            card.appendChild(btn);
        } else {
            const btn = document.createElement('button');
            btn.className = 'gui-button';
            btn.textContent = `Buy - ${accessory.price} Q`;
            btn.style.cssText = 'width: 100%; margin-top: 5px; font-size: 11px; padding: 5px;';
            btn.onclick = () => {
                if (GameData.buyAccessory(accessory.id)) { renderAccessories();
                    GUI.updateQubits(); }
            };
            card.appendChild(btn);
        }
        grid.appendChild(card);
    });
}

// Buy functions
GameData.buyShip = function(id) {
    const ship = SHIPS.find(s => s.id === id);
    if (!ship) return false;
    const owned = this.getOwnedShips();
    if (owned.includes(id)) return false;
    if (this.getQubits() >= ship.price) {
        this.setQubits(this.getQubits() - ship.price);
        owned.push(id);
        localStorage.setItem('ownedShips', JSON.stringify(owned));
        this.setSelectedShip(id);
        return true;
    }
    return false;
};

GameData.buyWeapon = function(id) {
    const weapon = WEAPONS[id];
    if (!weapon) return false;
    const owned = this.getOwnedWeapons();
    if (owned.includes(id)) return false;
    if (this.getQubits() >= weapon.price) {
        this.setQubits(this.getQubits() - weapon.price);
        owned.push(id);
        localStorage.setItem('ownedWeapons', JSON.stringify(owned));
        this.setEquippedWeapon(id);
        return true;
    }
    return false;
};

GameData.buySecondary = function(id) {
    const weapon = SECONDARY_WEAPONS[id];
    if (!weapon) return false;
    const owned = this.getOwnedSecondary();
    if (owned.includes(id)) return false;
    if (this.getQubits() >= weapon.price) {
        this.setQubits(this.getQubits() - weapon.price);
        owned.push(id);
        localStorage.setItem('ownedSecondary', JSON.stringify(owned));
        this.setEquippedSecondary(id);
        return true;
    }
    return false;
};

GameData.buyAutocannon = function(id) {
    const weapon = AUTOCANNONS[id];
    if (!weapon) return false;
    const owned = this.getOwnedAutocannons();
    if (owned.includes(id)) return false;
    if (this.getQubits() >= weapon.price) {
        this.setQubits(this.getQubits() - weapon.price);
        owned.push(id);
        localStorage.setItem('ownedAutocannons', JSON.stringify(owned));
        this.setEquippedAutocannon(id);
        return true;
    }
    return false;
};

GameData.buyDroneBay = function(id) {
    const bay = DRONE_BAYS[id];
    if (!bay) return false;
    const owned = this.getOwnedDrones();
    if (owned.includes(id)) return false;
    if (this.getQubits() >= bay.price) {
        this.setQubits(this.getQubits() - bay.price);
        owned.push(id);
        localStorage.setItem('ownedDrones', JSON.stringify(owned));
        this.setEquippedDroneBay(id);
        return true;
    }
    return false;
};

GameData.buyAttachment = function(id) {
    const attachment = ATTACHMENTS[id];
    if (!attachment) return false;
    const owned = this.getOwnedAttachments();
    if (owned.includes(id)) return false;
    if (this.getQubits() >= attachment.price) {
        this.setQubits(this.getQubits() - attachment.price);
        owned.push(id);
        localStorage.setItem('ownedAttachments', JSON.stringify(owned));
        const equipped = this.getEquippedAttachments();
        equipped.push(id);
        localStorage.setItem('equippedAttachments', JSON.stringify(equipped));
        return true;
    }
    return false;
};

GameData.buyAccessory = function(id) {
    const accessory = ACCESSORIES[id];
    if (!accessory) return false;
    const owned = this.getOwnedAccessories();
    if (owned.includes(id)) return false;
    if (this.getQubits() >= accessory.price) {
        this.setQubits(this.getQubits() - accessory.price);
        owned.push(id);
        localStorage.setItem('ownedAccessories', JSON.stringify(owned));
        const equipped = this.getEquippedAccessories();
        equipped.push(id);
        localStorage.setItem('equippedAccessories', JSON.stringify(equipped));
        return true;
    }
    return false;
};

GameData.toggleAttachment = function(id) {
    const equipped = this.getEquippedAttachments();
    const idx = equipped.indexOf(id);
    if (idx >= 0) equipped.splice(idx, 1);
    else equipped.push(id);
    localStorage.setItem('equippedAttachments', JSON.stringify(equipped));
};

GameData.toggleAccessory = function(id) {
    const equipped = this.getEquippedAccessories();
    const idx = equipped.indexOf(id);
    if (idx >= 0) equipped.splice(idx, 1);
    else equipped.push(id);
    localStorage.setItem('equippedAccessories', JSON.stringify(equipped));
};