/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import sharp from 'sharp';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath, imgBufferToString, getImgBase64, getImgInDir } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let divider = 70;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('setDivider', async (_event, newDivider: number) => {
  divider = newDivider;
});

ipcMain.handle('getImg', async (_event, imgPath: string): Promise<string> => {
  return getImgBase64(imgPath);
});

ipcMain.handle(
  'splitImg',
  async (_event, imgPath: string): Promise<{ left: string; right: string }> => {
    const org = sharp(imgPath);
    const metadata = await org.metadata();
    const { width = 0, height = 0 } = metadata;
    const halfWidth = Math.floor(width / 2 - divider / 2);

    const [leftBuffer, rightBuffer] = await Promise.all([
      org
        .clone()
        .extract({ left: 0, top: 0, width: halfWidth, height })
        .toBuffer(),
      org
        .clone()
        .extract({ left: width - halfWidth, top: 0, width: halfWidth, height })
        .toBuffer(),
    ]);

    return {
      left: imgBufferToString(leftBuffer),
      right: imgBufferToString(rightBuffer),
    };
  },
);

ipcMain.handle(
  'getNextImgPath',
  async (_event, imgPath: string, direction: -1 | 1): Promise<string> => {
    return new Promise((resolve, reject) => {
      const dir = imgPath.match(/(.*)[/]/);
      if (!dir || dir.length < 2) {
        reject(new Error('Cannot find directory'));
        return;
      }
      getImgInDir(dir[1])
        .then((images) => {
          const ind = images.findIndex((ig) => ig === imgPath);
          if (ind === -1) {
            reject(new Error('Cannot find image'));
          }
          const newInd = (images.length + ind + direction) % images.length;
          resolve(images[newInd]);
        })
        .catch(reject);
    });
  },
);

ipcMain.handle(
  'rotateImg',
  async (_event, imgBase64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = Buffer.from(imgBase64.split(',')[1], 'base64');
      sharp(img)
        .rotate(90)
        .toBuffer()
        .then((rotated) => {
          resolve(imgBufferToString(rotated));
        })
        .catch(reject);
    });
  },
);

ipcMain.handle('openFileDialog', async () => {
  return new Promise((resolve, reject) => {
    if (!mainWindow) {
      reject(new Error('No main window'));
      return;
    }
    dialog
      .showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] },
        ],
      })
      .then((result) => {
        if (result.filePaths.length === 0) {
          resolve(null);
          return;
        }
        resolve(result.filePaths[0]);
      })
      .catch(reject);
  });
});

ipcMain.handle('openSaveDialog', async () => {
  return new Promise((resolve, reject) => {
    if (!mainWindow) {
      reject();
      return;
    }
    dialog
      .showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
      })
      .then((result) => {
        resolve(result.filePaths[0]);
      })
      .catch(reject);
  });
});

ipcMain.handle(
  'saveSplitImgs',
  async (
    _event,
    imgs: string[],
    dir: string,
    fn: string,
    ext: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      resolve(
        imgs.forEach((img, i) => {
          const fpath = path.join(dir, `${fn}_${i}.${ext}`);
          const data = img.replace(/^data:image\/\w+;base64,/, '');
          const imgBuffer = Buffer.from(data, 'base64');
          return fs.writeFile(fpath, imgBuffer, reject);
        }),
      );
    });
  },
);

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
