import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { GoFileDirectory } from 'react-icons/go';
import './App.css';

function View() {
  const [image, setImage] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageDir, setImageDir] = useState<string | null>(null);

  const handlePhotoSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || !files.length) return;
    setImage(URL.createObjectURL(files[0]));
    setImagePath(files[0].path);
    const dir = files[0].path.match(/(.*)[\/\\]/);
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
        <button className="menu-item">{imageDir}</button>
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
