import React, { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaSun, FaMoon } from 'react-icons/fa';
import styles from './Login.module.css';
import me from '../assets/me.png'; // Adjust the path to your image

function Login() {
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const navigate = useNavigate();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope('profile email');

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in user:', {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      });
      navigate('/home');
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Failed to sign in: ' + err.message);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles['dark-mode'] : ''}`}>
      
      <img src={me} alt="Mohamed Zameer" className={styles.mee} />
      <h1 className={styles.welcomeText}>
        <span className={styles.typewriterr}>
          Hi👋,<span className={styles.backname}>I'm Mohamed Zameer</span>.Welcome to My Blog
        </span>
      </h1>
      <p className={styles.description}>
        I'm a BE Computer Science and Engineering graduate with a strong passion for web development. I enjoy building responsive, user-focused websites using modern technologies and constantly strive to improve my skills and create impactful digital experiences.
      </p>
      {error && <div className={styles.alert}>{error}</div>}
      <button className={styles.googleButton} onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
      <footer className={styles.footer}>
        <div className={styles.copyright}>© 2025 Zameer. All rights reserved.</div>
        <div className={styles.socialLinks}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <FaGithub className={styles.socialIcon} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className={styles.socialIcon} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter className={styles.socialIcon} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram className={styles.socialIcon} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Login;