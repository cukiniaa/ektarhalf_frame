/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import fs from 'fs';

export const resolveHtmlPath = (htmlFileName: string) => {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
};

export const imgBufferToString = (img: Buffer): string => {
  const str = Buffer.from(img).toString('base64');
  return `data:image/jpeg;base64,${str}`;
};

export const getImgBase64 = async (imgPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = fs.readFileSync(imgPath);
      resolve(imgBufferToString(img));
    } catch (err) {
      reject(err);
    }
  });
};

export const getImgInDir = async (dir: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      }
      const images = files
        .filter((file) => /\.(png|jpe?g)$/.test(file))
        .map((file) => path.join(dir, file));
      resolve(images);
    });
  });
};
