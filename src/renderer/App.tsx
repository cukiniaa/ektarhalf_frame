import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import { GoFileDirectory } from 'react-icons/go';
import { FaArrowRotateRight } from 'react-icons/fa6';
import './App.css';

function View() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgPath, setImgPath] = useState<string | null>(null);
  const [imgDir, setImgDir] = useState<string | null>(null);
  const [leftImg, setLeftImg] = useState<string | null>(null);
  const [rightImg, setRightImg] = useState<string | null>(null);

  const splitImg = async (path: string) => {
    const { left, right } = await window.electron.ipcRenderer.splitImg(path);
    setLeftImg(left);
    setRightImg(right);
  };

  const setNewImg = async (newPath: string) => {
    const imgBase64 = await window.electron.ipcRenderer.getImg(newPath);
    setImgPath(newPath);
    setImgUrl(imgBase64);
    splitImg(newPath);
  };

  const handlePhotoSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { files } = event.target;
    if (!files || !files.length) return;
    setNewImg(files[0].path);
    const dir = files[0].path.match(/(.*)[/\\]/);
    setImgDir(dir ? dir[1] : null);
  };

  const saveToSelectedDir = async () => {
    const dir = await window.electron.ipcRenderer.openSaveDialog();
    if (!leftImg || !rightImg || !imgDir || !imgPath) return;
    const match = imgPath.match(/.*[/\\](.*)[.](jpe?g|png)/);
    if (!match) return;
    const [, fn, ext] = match;
    if (!fn || !ext) return;
    window.electron.ipcRenderer.saveSplitImgs(leftImg, rightImg, dir, fn, ext);
  };

  const nextRight = async () => {
    if (!imgPath) return;
    const newImg = await window.electron.ipcRenderer.getNextImgPath(imgPath, 1);
    setNewImg(newImg);
  };

  const nextLeft = async () => {
    if (!imgPath) return;
    const newImgPath = await window.electron.ipcRenderer.getNextImgPath(
      imgPath,
      -1,
    );
    setNewImg(newImgPath);
  };

  const rotateImg = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    const stateMap = {
      'left-img': { img: leftImg, setFunc: setLeftImg },
      'right-img': { img: rightImg, setFunc: setRightImg },
    };
    const state = event.currentTarget.id as keyof typeof stateMap;
    const { img, setFunc } = stateMap[state] || [];
    if (!img || !setFunc) return;

    setFunc(await window.electron.ipcRenderer.rotateImg(img));
  };

  return (
    <div className="app-container">
      <div className="menu-bar">
        <label className="menu-item" htmlFor="file-input">
          <GoFileDirectory />
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoSelected}
            style={{ display: 'none' }}
          />
        </label>
        <p className="menu-text">{imgDir}</p>
        {imgUrl ? (
          <label className="menu-item menu-right" htmlFor="dir-input">
            Save
            <input
              id="dir-input"
              type="file"
              accept="image/*"
              onClick={saveToSelectedDir}
              style={{ display: 'none' }}
            />
          </label>
        ) : null}
      </div>

      {imgUrl ? (
        <div className="main-content">
          <div className="g-container-small-photo">
            <img src={imgUrl || undefined} alt="Main" className="g-top-photo" />
          </div>
          <div className="g-container">
            <button
              type="button"
              className="side-button left-button"
              onClick={nextLeft}
            >
              ←
            </button>
            <div className="g-photo-grid">
              <div className="g-half-frame">
                <div className="g-photo-item">
                  <img
                    src={leftImg || undefined}
                    alt="Left"
                    className="g-large-photo"
                  />
                </div>
                <button
                  type="button"
                  className="g-button"
                  id="left-img"
                  onClick={rotateImg}
                >
                  <FaArrowRotateRight />
                </button>
              </div>
              <div className="g-half-frame">
                <div className="g-photo-item">
                  <img
                    src={rightImg || undefined}
                    alt="Right"
                    className="g-large-photo"
                  />
                </div>
                <button
                  type="button"
                  className="g-button"
                  id="right-img"
                  onClick={rotateImg}
                >
                  <FaArrowRotateRight />
                </button>
              </div>
            </div>
            <button
              type="button"
              className="side-button right-button"
              onClick={nextRight}
            >
              →
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-content menu-text">
          <p> Choose directory to start</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<View />} />
      </Routes>
    </Router>
  );
}
