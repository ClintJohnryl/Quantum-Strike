// ===== INPUT HANDLING =====

// Keybinds
const KEYBINDS = {
    primary: 'Space',
    secondary: 'KeyQ',
    autocannon: 'KeyR',
    drones: 'KeyF',
    thrust: 'KeyW',
    reverse: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    ability: 'KeyE'
};

function loadKeybinds() {
    try {
        const k = JSON.parse(localStorage.getItem('keybinds'));
        if (k) Object.assign(KEYBINDS, k);
    } catch (e) {}
    Object.keys(KEYBINDS).forEach(k => {
        const el = document.getElementById('kb-' + k);
        if (el) el.value = KEYBINDS[k];
    });
}

function saveKeybinds() {
    const k = {};
    ['primary', 'secondary', 'autocannon', 'drones', 'thrust', 'reverse', 'left', 'right', 'ability'].forEach(id => {
        const el = document.getElementById('kb-' + id);
        k[id] = el.value.trim() || KEYBINDS[id];
    });
    Object.assign(KEYBINDS, k);
    localStorage.setItem('keybinds', JSON.stringify(KEYBINDS));
    document.querySelectorAll('.keybind-row input').forEach(inp => {
        const status = inp.parentElement.querySelector('.key-status');
        if (status) status.textContent = '✓';
    });
}

document.querySelectorAll('.keybind-row input').forEach(inp => {
    inp.addEventListener('change', saveKeybinds);
    inp.addEventListener('focus', function() { this.select(); });
});

// Game input state - Desktop only
const GameInput = {
    keys: {}
};

window.addEventListener('keydown', e => {
    GameInput.keys[e.code] = true;
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', e => {
    GameInput.keys[e.code] = false;
});

// Mouse wheel zoom
canvas.addEventListener('wheel', e => {
    e.preventDefault();
    if (gameRunning) {
        camera.zoom = Math.max(0.3, Math.min(2, camera.zoom - e.deltaY * 0.001));
    }
});