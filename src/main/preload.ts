// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    getImg: (imgPath: string): Promise<string> => {
      return ipcRenderer.invoke('getImg', imgPath);
    },
    splitImg: (imgPath: string): Promise<{ left: string; right: string }> => {
      return ipcRenderer.invoke('splitImg', imgPath);
    },
    getNextImgPath: (imgPath: string, direction: -1 | 1): Promise<string> => {
      return ipcRenderer.invoke('getNextImgPath', imgPath, direction);
    },
    rotateImg: (imgBase64: string): Promise<string> => {
      return ipcRenderer.invoke('rotateImg', imgBase64);
    },
    openSaveDialog: (): Promise<string> => {
      return ipcRenderer.invoke('openSaveDialog');
    },
    openFileDialog: (): Promise<{ file: string; dir: string }> => {
      return ipcRenderer.invoke('openFileDialog');
    },
    saveSplitImgs: (
      left: string,
      right: string,
      imgPath: string,
      dest: string,
    ): Promise<string> => {
      return ipcRenderer.invoke('saveSplitImgs', [left, right], imgPath, dest);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
