import React, { useState } from "react";
import "./AuthForms.css";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";



const Login = () => {
    const { login } = useAppContext();
    const [formData, setFormData] = useState({
        userNameOrEmail: "",
        password: "",
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await login(formData);
        if (!result.success) {
            setError(result.error || "Login failed");
        }
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
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to continue</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="userNameOrEmail">Username or Email</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
                                    fill="currentColor" />
                            </svg>
                            <input
                                type="text"
                                id="userNameOrEmail"
                                name="userNameOrEmail"
                                value={formData.userNameOrEmail}
                                onChange={handleChange}
                                placeholder="Enter your username or email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z"
                                    fill="currentColor" />
                            </svg>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="auth-submit">
                        Login
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Register Here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
