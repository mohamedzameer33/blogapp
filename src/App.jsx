import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { db } from './firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './App.css';
import Home from './components/Home';
import PostDetail from './components/PostDetail';
import Login from './components/Login';
import ProfileSettings from './components/ProfileSettings';
import UsersList from './components/UsersList';
import { FaSun, FaMoon } from 'react-icons/fa';
import blueCheckmark from '../src/assets/blue-checkmark.svg';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  // Map isDarkMode to theme prop for components
  const theme = useMemo(() => (isDarkMode ? 'dark' : 'light'), [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        let photoURL = userDoc.data()?.photoURL;
        if (!userDoc.exists() || !photoURL) {
          const firstLetter = currentUser.email.charAt(0).toUpperCase();
          photoURL = `https://ui-avatars.com/api/?name=${firstLetter}&background=random&size=128`;
          await setDoc(doc(db, 'users', currentUser.uid), {
            displayName: currentUser.displayName || 'Anonymous',
            photoURL,
            email: currentUser.email,
            isVerified: false,
          }, { merge: true });
        }
        setUser({ ...currentUser, photoURL, isVerified: userDoc.data()?.isVerified || false });
        console.log('User data:', { email: currentUser.email, displayName: currentUser.displayName, photoURL });
      } else {
        setUser(null);
      }
    }, (error) => {
      console.error('Auth error:', error);
    });
    return () => unsubscribe();
  }, [auth]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      console.log('Toggling theme to:', newMode ? 'dark' : 'light');
      document.body.classList.toggle('dark-mode', newMode);
      return newMode;
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileUpdate = async () => {
    const currentUser = auth.currentUser;
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    setUser({
      ...currentUser,
      photoURL: userDoc.data()?.photoURL || currentUser.photoURL,
      isVerified: userDoc.data()?.isVerified || false,
    });
  };

  const profileSection = useMemo(() => (
    user && (
      <div className="profile-section">
        <h2>Profile</h2>
        <img
          src={user.photoURL || 'https://via.placeholder.com/100'}
          alt={user.displayName || 'User'}
          className="profile-img-large"
          onError={(e) => {
            console.log('Large profile image failed:', user.photoURL);
            e.target.src = 'https://via.placeholder.com/100';
          }}
        />
        <p>
          Name: {(
            <>
              {user.displayName || 'User'}
              {user.isVerified && (
                <img src={blueCheckmark} alt="Verified" className="blue-tick5" title="Verified User" />
              )}
            </>
          )}
        </p>
        <p>Email: {user.email || 'N/A'}</p>
      </div>
    )
  ), [user]);

  return (
    <div className={`app ${theme}`}>
      <header className="header">
        <h1>Zameer's Blog</h1>
        <div className="btn-container">
          {user && (
            <div className="profile-mini">
              <img
                src={user.photoURL || 'https://via.placeholder.com/30'}
                alt={user.displayName || 'User'}
                className="profile-img"
                onError={(e) => {
                  console.log('Profile image failed:', user.photoURL);
                  e.target.src = 'https://via.placeholder.com/30';
                }}
              />
              <span className="usenam">
                {user.displayName || 'User'}
                {user.isVerified && (
                  <img src={blueCheckmark} alt="Verified" className="blue-tick5" title="Verified User" />
                )}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  console.log('Opening profile settings for:', user.email);
                  setShowProfileSettings(true);
                }}
              >
                Edit Profile
              </button>
              {user.email === 'mohamedzameermpm123@gmail.com' && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/users')}
                >
                  All Users
                </button>
              )}
            </div>
          )}
          <button
            className="btn btn-primary theme-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          {user ? (
            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <span></span>
          )}
        </div>
      </header>
      <div className="container">
        {profileSection}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home user={user} theme={theme} />} />
          <Route path="/post/:id" element={<PostDetail user={user} theme={theme} />} />
          <Route path="/users" element={<UsersList user={user} theme={theme} />} />
        </Routes>
        {showProfileSettings && (
          <ProfileSettings
            user={user}
            theme={theme}
            onClose={() => {
              console.log('Closing profile settings');
              setShowProfileSettings(false);
            }}
            onUpdate={handleProfileUpdate}
          />
        )}
      </div>

   
     
    </div>
  );
}

export default App;