const { app, BrowserWindow, session } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { PythonShell } = require('python-shell');
const { exec } = require('child_process');

let mainWindow;
let torProcess;

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

/**
 * Reads the TOR configuration from the torrc file.
 * 
 * @returns {object} - An object containing the TOR configuration.
 */
function readTorConfig() {
    const torrcPath = path.join(__dirname, 'torrc');
    if (!fs.existsSync(torrcPath)) {
        throw new Error(`torrc file not found at path: ${torrcPath}`);
    }

    const torrcContent = fs.readFileSync(torrcPath, 'utf-8');
    const config = {};

    torrcContent.split('\n').forEach(line => {
        const [key, value] = line.split(' ');
        if (key && value) {
            config[key.trim()] = value.trim();
        }
    });

    return config;
}

/**
 * Starts the Tor process with specified configuration options.
 * The process logs output to the console.
 */
 function startTor() {
    try {
        const config = readTorConfig();

        console.log(config);

        torProcess = spawn('tor', [
            '-f', path.join(__dirname, 'torrc'),
            '--ControlPort', config.ControlPort || '9051',
            '--HashedControlPassword', config.HashedControlPassword || '',
            '--SocksPort', config.SocksPort || '9050',
            '--CookieAuthentication', config.CookieAuthentication || '1'
        ]);

        torProcess.stdout.on('data', (data) => {
            console.log(`Tor stdout: ${data}`);
        });

        torProcess.stderr.on('data', (data) => {
            console.error(`Tor stderr: ${data}`);
        });

        torProcess.on('close', (code) => {
            console.log(`Tor process exited with code ${code}`);
        });

    } catch (error) {
        console.error(`Failed to start Tor: ${error.message}`);
    }
}

/**
 * Stops the Tor process if it is running.
 */
function stopTor() {
    if (torProcess) {
        torProcess.kill();
    }
}

/**
 * Changes the Tor circuit by running a Python script.
 * 
 * @returns {Promise<string>} - Resolves with the new IP address if successful, otherwise rejects with an error.
 */
function changeTorCircuit() {
    return new Promise((resolve, reject) => {
        console.log("[MAIN.js] - Attempting to change Tor circuit");
        mainWindow.webContents.send('tor-circuit-changed');

        PythonShell.run('change_circuit.py', { pythonPath: path.join(__dirname, 'venv/bin/python') }, (err, result) => {
            if (err) {
                console.error('[MAIN.js] - Error changing Tor circuit:', err);
                reject(err);
            } else {
                console.log('[MAIN.js] - Changed Tor circuit:', result);
            }
        });

        console.log("[MAIN.js] - Tor circuit change command executed");
        mainWindow.webContents.send('tor-circuit-changed');
    });
}

function createWindow() {
    const iconPath = path.join(__dirname, 'imgs', 'anonymous.icns');

    // Check if the icon exists
    if (!fs.existsSync(iconPath)) {
        console.error("No icon found: ", iconPath);
        return;
    } else {
        console.log("Icon found");
    }

    // Initialize the window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true
        },
        icon: iconPath // Set the window icon
    });

    // Manipulate response headers
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        if (details.responseHeaders['x-frame-options']) {
            delete details.responseHeaders['x-frame-options'];
        }
        if (details.responseHeaders['content-security-policy']) {
            delete details.responseHeaders['content-security-policy'];
        }
        callback({ cancel: false, responseHeaders: details.responseHeaders });
    });

    mainWindow.loadFile('index.html');

    mainWindow.webContents.session.setProxy({
        proxyRules: 'socks5://127.0.0.1:9050'
    }, () => {
        mainWindow.loadURL('https://www.seznam.cz?output=embed');
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    startTor();
    createWindow();

    setInterval(() => {
        changeTorCircuit().then(() => {
            console.log('[MAIN.js] - Tor circuit changed successfully');
        }).catch((err) => {
            console.error('[MAIN.js] - Error changing Tor circuit:', err);
        });
    }, 1 * 10 * 1000);  // Change Tor circuit every 10 seconds
});

app.on('window-all-closed', function () {
    stopTor();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});


// const { app, BrowserWindow, session } = require('electron');
// const fs = require('fs');
// const path = require('path');
// const { spawn } = require('child_process');
// const { PythonShell } = require('python-shell');
// const { exec } = require('child_process');
// const { ipcRenderer } = require('electron');

// let mainWindow;
// let torProcess;

// app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

// /**
//  * Reads the TOR configuration from the torrc file.
//  * 
//  * @returns {object} - An object containing the TOR configuration.
//  */
//  function readTorConfig() {
//     const torrcPath = path.join(__dirname, 'torrc');
//     if (!fs.existsSync(torrcPath)) {
//         throw new Error(`torrc file not found at path: ${torrcPath}`);
//     }

//     const torrcContent = fs.readFileSync(torrcPath, 'utf-8');
//     const config = {};

//     torrcContent.split('\n').forEach(line => {
//         const [key, value] = line.split(' ');
//         if (key && value) {
//             config[key.trim()] = value.trim();
//         }
//     });

//     return config;
// }

// /**
//  * Starts the Tor process with specified configuration options.
//  * The process is configured to use control port 9051 and SOCKS port 9050.
//  * The process logs output to the console.
//  */
//  function startTor() {
//     try {
//         const config = readTorConfig();

//         torProcess = spawn('tor', [
//             '--ControlPort', config.ControlPort || '9051',
//             '--HashedControlPassword', config.HashedControlPassword || '',
//             '--SocksPort', config.SocksPort || '9050',
//             '--CookieAuthentication', config.CookieAuthentication || '1'
//         ]);

//         torProcess.stdout.on('data', (data) => {
//             console.log(`Tor stdout: ${data}`);
//         });

//         torProcess.stderr.on('data', (data) => {
//             console.error(`Tor stderr: ${data}`);
//         });

//         torProcess.on('close', (code) => {
//             console.log(`Tor process exited with code ${code}`);
//         });

//     } catch (error) {
//         console.error(`Failed to start Tor: ${error.message}`);
//     }
// }

// /**
//  * Stops the Tor process if it is running.
//  */
// function stopTor() {
//     if (torProcess) {
//         torProcess.kill();
//     }
// }

// /**
//  * Changes the Tor circuit by running a Python script.
//  * The function also executes a curl command to verify the new IP address.
//  * 
//  * @returns {Promise<string>} - Resolves with the new IP address if successful, otherwise rejects with an error.
//  */
// function changeTorCircuit() {
//     return new Promise((resolve, reject) => {
//         console.log("[MAIN.js] - Attempting to change Tor circuit");
//         mainWindow.webContents.send('tor-circuit-changed');

//         PythonShell.run('change_circuit.py', { pythonPath: path.join(__dirname, 'venv/bin/python') }, (err, result) => {
//             if (err) {
//                 console.error('[MAIN.js] - Error changing Tor circuit:', err);
//                 reject(err);
//             } else {
//                 console.log('[MAIN.js] - Changed Tor circuit xxx:', result);

//                 // exec('curl --socks5-hostname 127.0.0.1:9050 https://api.ipify.org', (error, stdout, stderr) => {
//                 //     if (error) {
//                 //         console.error(`curl error: ${error.message}`);
//                 //         reject(error);
//                 //         return;
//                 //     }
//                 //     if (stderr) {
//                 //         console.error(`curl stderr: ${stderr}`);
//                 //         reject(new Error(stderr));
//                 //         return;
//                 //     }
//                 //     console.log(`curl stdout: ${stdout}`);
//                 //     resolve(stdout);
//                 // });

//             }
//         });
//         console.log("[MAIN.js] - Tor circuit change command executed");
        
//         // diplay notification
//         mainWindow.webContents.send('tor-circuit-changed');
//     });
// }

// function createWindow() {
//     const iconPath = path.join(__dirname, 'imgs', 'anonymous.icns');

//     // Check it the icon exist log error otherwise
//     if (!fs.existsSync(iconPath)) {
//         console.error("No icon found: ", iconPath);
//         return;
//     } else {
//         console.log("icon found");
//     }

//     // Init
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false,
//             webSecurity: false,
//             allowRunningInsecureContent: true
//         },

//         icon: iconPath // Set the window icon
//     });

//     // Manipulate response headers
//     session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
//         if (details.responseHeaders['x-frame-options']) {
//             delete details.responseHeaders['x-frame-options'];
//         }
//         if (details.responseHeaders['content-security-policy']) {
//             delete details.responseHeaders['content-security-policy'];
//         }
        
//         callback({ cancel: false, responseHeaders: details.responseHeaders });
//     });

//     mainWindow.loadFile('index.html');

//     mainWindow.webContents.session.setProxy({
//         proxyRules: 'socks5://127.0.0.1:9050'
//     }, () => {
//         mainWindow.loadURL('https://www.seznam.cz?output=embed');
//     });

//     mainWindow.on('closed', function () {
//         mainWindow = null;
//     });
// }


// app.on('ready', () => {
//     startTor();
//     createWindow();

//     setInterval(() => {
//         changeTorCircuit().then(() => {
//             console.log('[MAIN.js] - Tor circuit changed successfully');
//         }).catch((err) => {
//             console.error('[MAIN.js] - Error changing Tor circuit:', err);
//         });
//     }, 1 * 10 * 1000);  // each 10 seconds change tor circuit
// });

// app.on('window-all-closed', function () {
//     stopTor();
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });

// app.on('activate', function () {
//     if (mainWindow === null) {
//         createWindow();
//     }
// });
