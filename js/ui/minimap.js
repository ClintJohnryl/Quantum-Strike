// ===== MINIMAP FUNCTIONS =====

function updateMinimap(player, enemies, powerups, asteroids) {
    const mc = document.getElementById('minimap-canvas');
    const mctx = mc.getContext('2d');
    const size = mc.width;
    mctx.clearRect(0, 0, size, size);
    mctx.fillStyle = 'rgba(0,10,20,0.8)';
    mctx.beginPath();
    mctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    mctx.fill();
    const sx = size / mapWidth;
    const sy = size / mapHeight;
    mctx.strokeStyle = 'rgba(0,200,255,0.1)';
    mctx.lineWidth = 0.5;
    for (let i = 0; i < mapWidth; i += 500) {
        mctx.beginPath();
        mctx.moveTo(i * sx, 0);
        mctx.lineTo(i * sx, size);
        mctx.stroke();
        mctx.beginPath();
        mctx.moveTo(0, i * sy);
        mctx.lineTo(size, i * sy);
        mctx.stroke();
    }
    mctx.fillStyle = '#666';
    asteroids.forEach(a => a.alive && mctx.fillRect(a.x * sx - 1, a.y * sy - 1, 2, 2));
    enemies.forEach(e => {
        if (e.alive) {
            mctx.fillStyle = e.isBoss ? '#f0f' : e.isElite ? '#ff0' : '#f00';
            const s = e.isBoss ? 5 : e.isElite ? 4 : 3;
            mctx.fillRect(e.x * sx - s / 2, e.y * sy - s / 2, s, s);
        }
    });
    if (player.drones) {
        player.drones.forEach(d => {
            if (d.alive) {
                mctx.fillStyle = '#0ff';
                mctx.fillRect(d.x * sx - 2, d.y * sy - 2, 4, 4);
            }
        });
    }
    mctx.fillStyle = '#ff0';
    powerups.forEach(p => {
        mctx.beginPath();
        mctx.arc(p.x * sx, p.y * sy, 2, 0, Math.PI * 2);
        mctx.fill();
    });
    mctx.fillStyle = '#0ff';
    mctx.beginPath();
    mctx.arc(player.x * sx, player.y * sy, 4, 0, Math.PI * 2);
    mctx.fill();
    mctx.strokeStyle = 'rgba(0,255,255,0.4)';
    mctx.lineWidth = 1;
    mctx.strokeRect(
        camera.x * sx - (W / 2 / camera.zoom) * sx,
        camera.y * sy - (H / 2 / camera.zoom) * sy,
        (W / camera.zoom) * sx,
        (H / camera.zoom) * sy
    );
}