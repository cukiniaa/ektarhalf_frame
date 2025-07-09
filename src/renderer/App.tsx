import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import { GoFileDirectory } from 'react-icons/go';
import { FaArrowRotateRight } from 'react-icons/fa6';
import { PiCursorClickThin } from 'react-icons/pi';
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

  const selectPhoto = async () => {
    const { file, dir } = await window.electron.ipcRenderer.openFileDialog();
    if (!file || !dir) {
      return;
    }
    setNewImg(file);
    setImgDir(dir);
  };

  const saveToSelectedDir = async () => {
    const dest = await window.electron.ipcRenderer.openSaveDialog();
    if (!dest || !leftImg || !rightImg || !imgPath) {
      return;
    }
    window.electron.ipcRenderer.saveSplitImgs(leftImg, rightImg, imgPath, dest);
  };

  const nextRight = async () => {
    if (!imgPath) {
      return;
    }
    const newImg = await window.electron.ipcRenderer.getNextImgPath(imgPath, 1);
    setNewImg(newImg);
  };

  const nextLeft = async () => {
    if (!imgPath) {
      return;
    }
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
    if (!img || !setFunc) {
      return;
    }

    setFunc(await window.electron.ipcRenderer.rotateImg(img));
  };

  return (
    <div className="app-container">
      <div className="menu-bar">
        <button
          type="button"
          title="Choose a photo"
          className="menu-item"
          onClick={selectPhoto}
        >
          <GoFileDirectory />
        </button>
        <p className="menu-text">{imgDir}</p>
        {imgUrl ? (
          <button
            type="button"
            title="Save"
            className="menu-item menu-right"
            onClick={saveToSelectedDir}
          >
            Save
          </button>
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
                  title="Rotate"
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
                  title="Rotate"
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
        <button
          type="button"
          className="empty-content-button"
          onClick={selectPhoto}
        >
          <PiCursorClickThin />
          <p>Choose directory to start</p>
        </button>
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
