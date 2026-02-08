import React, { useState } from "react";
import "./AuthForms.css";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import EditProfile from "../profile/EditProfile";
const Register = () => {
  const { register, saveProfileSelection, t } = useAppContext();
  const [formData, setFormData] = useState({
    username: "",
    image: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwords_not_match'));
      return;
    }

    const result = await register({
      username: formData.username,
      image: formData.image,
      name: formData.name,
      surname: formData.surname,
      password: formData.password,
      email: formData.email,
      isMale: true,
    });

    if (!result.success) {
      setError(result.error || t('registration_failed'));
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setFormData(prev => ({ ...prev, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileModalSave = ({ profileNo, imageSrc }) => {
    // set image data (could be data-uri or URL)
    setFormData(prev => ({ ...prev, image: imageSrc }));
    // save selection in context (non-blocking)
    if (saveProfileSelection) saveProfileSelection(profileNo, imageSrc);
    setShowEditProfile(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{t('create_account')}</h2>
          <p>{t('join_excited')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('name')}</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18ZM6 10H8V12H6V10ZM6 14H8V16H6V14ZM18 14H10V16H18V14ZM18 10H10V12H18V10Z"
                  fill="currentColor" />
              </svg>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="username">{t('username_label')}</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                  fill="currentColor" />
              </svg>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>



          <div className="form-group">
            <label htmlFor="surname">{t('surname')}</label>
            <div className="input-wrapper">

              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
                  fill="currentColor" />
              </svg>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('email_label')}</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
                  fill="currentColor" />
              </svg>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group image-group">
            <label htmlFor="image">{t('profile_photo')}</label>
            <div className="image-preview-row">
              <div className="preview-box-small">
                {formData.image ? (
                  <img src={formData.image} alt="preview" className="preview-img-small" />
                ) : (
                  <div className="preview-placeholder">{t('no_image')}</div>
                )}
              </div>

              <div className="image-actions">
                <input type="file" accept="image/*" id="imageFile" style={{display:'none'}} onChange={handleFileInput} />
                {/* <button type="button" className="btn" onClick={() => document.getElementById('imageFile').click()}>{t('upload')}</button> */}
                <button type="button" className="btn" onClick={() => setShowEditProfile(true)}>{t('edit_profile_pic')}</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z"
                  fill="currentColor" />
              </svg>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('confirm_password')}</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z"
                  fill="currentColor" />
              </svg>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* {error && <p className="error-message">{error}</p>} */}

          <button type="submit" className="auth-submit">
            {t('create_account_btn')}
          </button>
        </form>

        <p className="auth-switch">
          {t('already_have_account')} <Link to="/login">{t('login_here')}</Link>
        </p>
      </div>
      {showEditProfile && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <EditProfile onSave={handleProfileModalSave} onCancel={() => setShowEditProfile(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
