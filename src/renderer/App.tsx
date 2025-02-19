import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { GoFileDirectory } from 'react-icons/go';
import { FaArrowRotateRight } from 'react-icons/fa6';
import { Image } from 'image-js';
import './App.css';

function View() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgPath, setImgPath] = useState<string | null>(null);
  const [imgDir, setImgDir] = useState<string | null>(null);
  const [leftImg, setLeftImg] = useState<string | null>(null);
  const [rightImg, setRightImg] = useState<string | null>(null);

  const splitImg = async (path: string) => {
    const org = await Image.load(path);
    const left = org.crop({
      x: 0,
      y: 0,
      width: org.width / 2,
      height: org.height,
    });
    setLeftImg(left.toDataURL());

    const right = org.crop({
      x: org.width / 2,
      y: 0,
      width: org.width / 2,
      height: org.height,
    });
    setRightImg(right.toDataURL());
  };

  const setNewImg = async (newPath: string) => {
    const imgBuffer = await window.electron.ipcRenderer.getImg(newPath);
    const blob = new Blob([imgBuffer], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    setImgPath(newPath);
    setImgUrl(url);
    splitImg(url);
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

  const nextRight = async (event: FormEvent<HTMLButtonElement>) => {
    if (!imgPath) return;
    const newImg = await window.electron.ipcRenderer.getNextImgPath(imgPath, 1);
    setNewImg(newImg);
  };

  const nextLeft = async (event: FormEvent<HTMLButtonElement>) => {
    if (!imgPath) return;
    const newImgPath = await window.electron.ipcRenderer.getNextImgPath(imgPath, -1);
    setNewImg(newImgPath);
  };

  return (
    <div className="app-container">
      <div className="menu-bar">
        <label className="menu-item">
          <GoFileDirectory />
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoSelected}
            style={{ display: 'none' }}
          />
        </label>
        <p className="menu-text">{imgDir}</p>
      </div>

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
            <div className="g-photo-wrapper">
              <div className="g-photo-item">
                <img
                  src={leftImg || undefined}
                  alt="Left"
                  className="g-large-photo"
                />
              </div>
              <button type="button" className="g-button">
                <FaArrowRotateRight />
              </button>
            </div>
            <div className="g-photo-wrapper">
              <div className="g-photo-item">
                <img
                  src={rightImg || undefined}
                  alt="Right"
                  className="g-large-photo"
                />
              </div>
              <button type="button" className="g-button">
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
