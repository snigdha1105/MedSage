import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/LoginForm.css";

const API_BASE_URL = "http://localhost:5000/api";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!email || !password || !confirmPassword || !fullName || !age || !gender) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullName,
          age: parseInt(age),
          gender: gender,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account created successfully! Redirecting...");
        // Store token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("email", data.email);
        localStorage.setItem("full_name", data.full_name);

        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        toast.error(data.error || "Signup failed");
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!email || !password) {
      toast.error("Please enter email and password");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Login successful! Redirecting...");
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("email", data.email);
        localStorage.setItem("full_name", data.full_name);

        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (isSignUp) {
      handleSignUp(e);
    } else {
      handleLogin(e);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer 
        position="top-right" 
        autoClose={4000} 
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Left Section - Form */}
      <div className="login-form-section">
        <div className="form-card">
          <h1 className="form-title">{isSignUp ? "Join MedSage" : "Sign In to MedSage"}</h1>
          <p className="form-subtitle">
            {isSignUp
              ? "Start your personalized health journey today"
              : "Your Personal AI Doctor"}
          </p>

          <form onSubmit={handleSubmit} className="form-group">
            {/* Full Name Field (Sign Up only) */}
            {isSignUp && (
              <div className="form-field">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Age Field (Sign Up only) */}
            {isSignUp && (
              <div className="form-field">
                <label htmlFor="age" className="form-label">Age</label>
                <div className="input-wrapper">
                  <span className="input-icon">🎂</span>
                  <input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="form-input"
                    min="13"
                    max="150"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {/* Gender Field (Sign Up only) */}
            {isSignUp && (
              <div className="form-field">
                <label htmlFor="gender" className="form-label">Gender</label>
                <div className="input-wrapper">
                  <span className="input-icon">⚧️</span>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="form-input"
                    required={isSignUp}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="form-field">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "�" : "👁️"}
                </button>
              </div>
              {isSignUp && (
                <p className="password-hint">Must be at least 8 characters long</p>
              )}
            </div>

            {/* Confirm Password Field (Sign Up only) */}
            {isSignUp && (
              <div className="form-field">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {/* Terms and Conditions (Sign Up only) */}
            {isSignUp && (
              <div className="form-field checkbox-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="link">Terms of Service</a> and{" "}
                    <a href="#" className="link">Privacy Policy</a>
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Loading..." : (isSignUp ? "Create Account" : "Sign In")}
            </button>

            {/* Toggle Sign Up / Sign In */}
            <p className="toggle-text">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                className="toggle-link"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setFullName("");
                  setAge("");
                  setGender("male");
                  setAgreedToTerms(false);
                }}
              >
                {isSignUp ? "Sign in here" : "Sign up here"}
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Right Section - Features (visible on larger screens) */}
      <div className="login-features-section">
        <h2 className="features-title">What you'll get with MedSage:</h2>
        <ul className="features-list">
          <li className="feature-item">
            <span className="feature-icon">✅</span>
            <span>AI-powered health insights</span>
          </li>
          <li className="feature-item">
            <span className="feature-icon">✅</span>
            <span>Personalized care recommendations</span>
          </li>
          <li className="feature-item">
            <span className="feature-icon">✅</span>
            <span>Smart symptom checker</span>
          </li>
          <li className="feature-item">
            <span className="feature-icon">✅</span>
            <span>Health progress tracking</span>
          </li>
          <li className="feature-item">
            <span className="feature-icon">✅</span>
            <span>Expert community access</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LoginForm;
