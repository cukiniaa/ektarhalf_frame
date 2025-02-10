import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { GoFileDirectory } from 'react-icons/go';
import { FaArrowRotateRight } from 'react-icons/fa6';
import './App.css';

function View() {
  const [image, setImage] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageDir, setImageDir] = useState<string | null>(null);

  const handlePhotoSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { files } = event.target;
    if (!files || !files.length) return;
    setImage(URL.createObjectURL(files[0]));
    setImagePath(files[0].path);
    const dir = files[0].path.match(/(.*)[/\\]/);
    setImageDir(dir ? dir[1] : null);
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
        <p className="menu-text">{imageDir}</p>
      </div>

      <div className="main-content">
        <div className="g-container-small-photo">
          <img src={image || undefined} alt="Main" className="g-top-photo" />
        </div>
        <div className="g-container">
          <button type="button" className="side-button left-button">
            ←
          </button>
          <div className="g-photo-grid">
            <div className="g-photo-wrapper">
              <div className="g-photo-item">
                <img
                  src={image || undefined}
                  alt="Left"
                  className="g-large-photo"
                />
                <button type="button" className="g-button">
                  <FaArrowRotateRight />
                </button>
              </div>
            </div>
            <div className="g-photo-wrapper">
              <div className="g-photo-item">
                <img
                  src={image || undefined}
                  alt="Right"
                  className="g-large-photo"
                />
                <button type="button" className="g-button">
                  <FaArrowRotateRight />
                </button>
              </div>
            </div>
          </div>
          <button type="button" className="side-button right-button">
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
