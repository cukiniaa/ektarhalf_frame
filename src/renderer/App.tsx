import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { GoFileDirectory } from 'react-icons/go';
import { FaArrowRotateRight } from 'react-icons/fa6';
import './App.css';

function View() {
  const [img, setImg] = useState<string | null>(null);
  const [imgPath, setImgPath] = useState<string | null>(null);
  const [imgDir, setImgDir] = useState<string | null>(null);
  const [imgInDir, setImgInDir] = useState<string[]>([]);

  const getImgInDir = async (dir: string) => {
    const imgs = await window.electron.ipcRenderer.getImgInDir(dir);
    setImgInDir(imgs);
  };

  const handlePhotoSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { files } = event.target;
    if (!files || !files.length) return;
    setImg(URL.createObjectURL(files[0]));
    setImgPath(files[0].path);
    const dir = files[0].path.match(/(.*)[/\\]/);
    setImgDir(dir ? dir[1] : null);
    getImgInDir(dir ? dir[1] : '');
  };

  const setNewImg = async (newImg: string) => {
    setImg(`file://${newImg}`);
    setImgPath(newImg);
  };

  const nextRight = async (event: FormEvent<HTMLButtonElement>) => {
    const find = imgInDir.findIndex((ig) => ig === imgPath);
    if (find === -1) return;
    const newInd = (find + 1) % imgInDir.length;
    setNewImg(imgInDir[newInd]);
  };

  const nextLeft = async (event: FormEvent<HTMLButtonElement>) => {
    const find = imgInDir.findIndex((ig) => ig === imgPath);
    if (find === -1) return;
    const newInd = (imgInDir.length + find - 1) % imgInDir.length;
    setNewImg(imgInDir[newInd]);
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
          <img src={img || undefined} alt="Main" className="g-top-photo" />
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
                  src={img || undefined}
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
                  src={img || undefined}
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
