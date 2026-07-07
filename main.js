const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#000000',
        icon: path.join(__dirname, 'assets/icons/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true
        },
        show: true,
        frame: true
    });

    mainWindow.loadFile('index.html');

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Create menu
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Game',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => { mainWindow.webContents.send('new-game'); }
                },
                {
                    label: 'Full Screen',
                    accelerator: 'F11',
                    click: () => { mainWindow.setFullScreen(!mainWindow.isFullScreen()); }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => { app.quit(); }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => { mainWindow.reload(); }
                },
                {
                    label: 'Toggle Dev Tools',
                    accelerator: 'F12',
                    click: () => { mainWindow.webContents.toggleDevTools(); }
                }
            ]
        },
        {
            label: 'Game',
            submenu: [
                {
                    label: 'Multiplayer Menu',
                    accelerator: 'CmdOrCtrl+M',
                    click: () => { mainWindow.webContents.send('open-multiplayer'); }
                },
                {
                    label: 'Store',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => { mainWindow.webContents.send('open-store'); }
                },
                { type: 'separator' },
                {
                    label: 'Reset Progress',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'warning',
                            title: 'Reset Progress',
                            message: 'Are you sure you want to reset all progress?',
                            buttons: ['Cancel', 'Reset'],
                            defaultId: 0,
                            cancelId: 0
                        }).then(result => {
                            if (result.response === 1) {
                                mainWindow.webContents.send('reset-progress');
                            }
                        });
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Controls',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Controls',
                            message: `🎮 Quantum Strike Controls\n\nWASD - Move\nSpace - Primary Fire\nQ - Secondary Fire\nE - Ability (Dash)\nF - Launch Drones\nR - Toggle Auto-Cannons\nM - Multiplayer Menu\nESC - Pause/Exit Menu\n\nGood luck, Commander!`,
                            buttons: ['OK']
                        });
                    }
                },
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Quantum Strike',
                            message: `⚛ QUANTUM STRIKE\nUltimate Space Combat Simulator\n\nVersion: 1.0.1\n\nCreated by: Clint Johnryl Henon Dagno\n\nA fast-paced space combat game with\nship customization, LAN multiplayer,\nand epic boss battles!`,
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// ===== IPC HANDLERS =====
// Handle quit app from renderer
ipcMain.on('quit-app', () => {
    app.quit();
});

// Handle save data (optional)
ipcMain.handle('save-data', (event, key, data) => {
    try {
        // Simple save implementation
        const fs = require('fs');
        const savePath = path.join(app.getPath('userData'), 'save-data.json');
        let saveData = {};
        if (fs.existsSync(savePath)) {
            saveData = JSON.parse(fs.readFileSync(savePath, 'utf8'));
        }
        saveData[key] = data;
        fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2));
        return { success: true };
    } catch (error) {
        console.error('Save error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-data', (event, key) => {
    try {
        const fs = require('fs');
        const savePath = path.join(app.getPath('userData'), 'save-data.json');
        if (fs.existsSync(savePath)) {
            const saveData = JSON.parse(fs.readFileSync(savePath, 'utf8'));
            return { success: true, data: saveData[key] || null };
        }
        return { success: true, data: null };
    } catch (error) {
        console.error('Load error:', error);
        return { success: false, error: error.message };
    }
});

// Handle before-quit to save data
app.on('before-quit', () => {
    console.log('Saving game data before exit...');
});

// App lifecycle events
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

console.log('🚀 Quantum Strike Desktop App');
console.log(`📁 Save data location: ${app.getPath('userData')}`);
console.log(`📦 Packaged: ${app.isPackaged}`);