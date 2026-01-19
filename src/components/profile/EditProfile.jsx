import React, { useState, useRef } from 'react';
// import { User, Palette, Download, RotateCcw, Upload, Grid3x3 } from 'lucide-react';
import "./EditProfile.css";

const CharacterCreator = () => {
  const [activeMainTab, setActiveMainTab] = useState('gallery');
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [character, setCharacter] = useState({
    gender: 'man',
    hairColor: 'brown'
  });

  const characterRef = useRef(null);
  const fileInputRef = useRef(null);

  const galleryImages = [
    { id: 1, name: 'Karakter 1', src: '/assets/gallery/character1.png' },
    { id: 2, name: 'Karakter 2', src: '/assets/gallery/character2.png' },
    { id: 3, name: 'Karakter 3', src: '/assets/gallery/character3.png' },
    { id: 4, name: 'Karakter 4', src: '/assets/gallery/character4.png' },
    { id: 5, name: 'Karakter 5', src: '/assets/gallery/character5.png' },
    { id: 6, name: 'Karakter 6', src: '/assets/gallery/character6.png' },
    { id: 7, name: 'Karakter 7', src: '/assets/gallery/character7.png' },
    { id: 8, name: 'Karakter 8', src: '/assets/gallery/character8.png' },
  ];

  const hairColors = {
    man: [
      { id: 'brown', name: 'Qəhvəyi', color: '#8B4513' },
      { id: 'black', name: 'Qara', color: '#1a1a1a' },
      { id: 'red', name: 'Qırmızı', color: '#DC143C' },
      { id: 'blue', name: 'Göy', color: '#4169E1' }
    ],
    woman: [
      { id: 'pink', name: 'Çəhrayı', color: '#FF69B4' },
      { id: 'red', name: 'Qırmızı', color: '#DC143C' },
      { id: 'blue', name: 'Göy', color: '#4169E1' }
    ]
  };

  const mainTabs = [
    { id: 'gallery', name: 'Qaleriya', icon: "Grid3x3" },
    { id: 'creator', name: 'Dizayn', icon: "Palette" }
  ];

  const handleTabClick = (id) => {
    if (id === 'creator') {
      setSelectedGalleryImage(null);
    }
    setActiveMainTab(id);
  };

  const updateGender = (gender) => {
    const defaultColor = gender === 'man' ? 'brown' : 'pink';
    setCharacter({ gender, hairColor: defaultColor });
  };

  const updateHairColor = (color) => {
    setCharacter(prev => ({ ...prev, hairColor: color }));
  };

  const resetCharacter = () => {
    setCharacter({ gender: 'man', hairColor: 'brown' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setSelectedGalleryImage(event.target.result);
        setActiveMainTab('gallery');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getCreatorImagePath = () => {
    const genderPrefix = character.gender;
    const hairColorCapitalized = character.hairColor.charAt(0).toUpperCase() + character.hairColor.slice(1);
    return `/assets/characters/${genderPrefix}${hairColorCapitalized}Hair.png`;
  };

  const exportImage = (imageSource) => {
    const link = document.createElement('a');
    link.download = `profile_${Date.now()}.png`;
    link.href = imageSource;
    link.click();
  };

  const getCurrentImage = () => {
    if (activeMainTab === 'gallery') return selectedGalleryImage;
    if (activeMainTab === 'creator') return getCreatorImagePath();
    return null;
  };

  const currentHairColors = hairColors[character.gender];
  const currentImage = getCurrentImage();

  return (
    <div className="app">
      <div className="container">
        {/* <header className="header">
          <div className="title-wrapper">
            <svg className="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
            </svg>
            <h1 className="title">Profil Şəkli Seç</h1>
          </div>
          <p className="subtitle">Qaleriyadan seç, dizayn et və ya yüklə</p>
        </header> */}

        <div className="main-tabs-container">
          <div className="main-tabs">
            {mainTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`main-tab ${activeMainTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <Icon className="main-tab-icon" />
                  <span className="main-tab-text">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="main-grid">
          {/* Preview Section */}
          <div className="preview-card">
            <div className="preview-box">
              <div className="preview-bg"></div>
              {currentImage ? (
                <div className="character-wrapper" ref={characterRef}>
                  <img
                    src={currentImage}
                    alt="Profile"
                    className="character-img"
                    onError={(e) => {
                      console.error('Image load error');
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="empty-state">
                  {/* <User className="empty-state-icon" /> */}
                  <p className="empty-state-text">Profil şəkli seçilməyib</p>
                </div>
              )}
            </div>
            
            <div className="preview-footer">
              <div className="char-info">
                <span className="info-label">Status: </span>
                <span className="info-value">
                  {currentImage ? 'Seçilib' : 'Boş'}
                </span>
              </div>
              <div className="action-btns">
                {currentImage && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => exportImage(currentImage)}
                  >
                    {/* <Download size={16} /> */}
                    Yüklə
                  </button>
                )}
              </div>
            </div>

            <div className="info-box">
              💡 Profil şəklini seçin və "Yüklə" düyməsi ilə PNG formatında saxlayın
            </div>
          </div>

          {/* Controls Section */}
          <div className="controls-card">
            {activeMainTab === 'gallery' && (
              <div className="gallery-grid">
                {galleryImages.map(img => (
                  <div
                    key={img.id}
                    className={`gallery-item ${selectedGalleryImage === img.src ? 'active' : ''}`}
                    onClick={() => setSelectedGalleryImage(selectedGalleryImage === img.src ? null : img.src)}
                  >
                    <img src={img.src} alt={img.name} className="gallery-img" />
                    <div className="gallery-name">{img.name}</div>
                  </div>
                ))}

                {/* Upload card appended to gallery */}
                <div
                  className={`gallery-item upload-card ${selectedGalleryImage && selectedGalleryImage.startsWith('data:') ? 'active' : ''}`}
                  onClick={triggerFileInput}
                >
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded" className="gallery-img" />
                  ) : (
                    <div className="upload-placeholder">+</div>
                  )}
                  <div className="gallery-name">Yüklə şəkilinizi</div>
                </div>

                {/* Hidden file input used by upload card */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="file-input"
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {activeMainTab === 'creator' && (
              <>
                <div className="control-section">
                  <div className="section-header">
                    {/* <User className="section-icon" /> */}
                    <h3 className="section-title">Cinsiyyət</h3>
                  </div>
                  <div className="gender-grid">
                    <button
                      className={`choice-btn ${character.gender === 'man' ? 'active' : ''}`}
                      onClick={() => updateGender('man')}
                    >
                      👨 Kişi
                    </button>
                    <button
                      className={`choice-btn ${character.gender === 'woman' ? 'active' : ''}`}
                      onClick={() => updateGender('woman')}
                    >
                      👩 Qadın
                    </button>
                  </div>
                </div>

                <div className="control-section">
                  <div className="section-header">
                    {/* <Palette className="section-icon" /> */}
                    <h3 className="section-title">Saç Rəngi</h3>
                  </div>
                  <div className="color-grid">
                    {currentHairColors.map(color => (
                      <div
                        key={color.id}
                        className="color-item"
                        onClick={() => updateHairColor(color.id)}
                      >
                        <div
                          className={`color-box ${character.hairColor === color.id ? 'active' : ''}`}
                          style={{ backgroundColor: color.color }}
                        ></div>
                        <div className="color-name">{color.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* upload tab merged into gallery as an upload card */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreator;