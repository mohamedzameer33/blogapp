import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';

function Navbar({ user, toggleDarkMode, darkMode }) {
  const navigate = useNavigate();
  const ADMIN_EMAIL = 'mohamedzameermpm123@gmail.com'; // Your admin email

  // Debug: Log user email to console
  console.log('Current user:', user ? user.email : 'No user');

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light dark-mode:bg-dark">
      <div className="container">
        <a className="navbar-brand" href="/">Zameer's Blog</a>
        <div className="navbar-nav ms-auto">
          {user && (
            <>
              <span className="nav-item nav-link">Hello, {user.displayName}</span>
              {user.email === ADMIN_EMAIL ? (
                <Link to="/add-post" className="nav-item nav-link">Add Post</Link>
              ) : (
                <span className="nav-item nav-link text-muted">Not Admin</span>
              )}
              <button className="btn26-btn btn-outline-primary me-2" onClick={toggleDarkMode}>
                {darkMode ? 'Normal Mode' : 'Dark Mode'}
              </button>
              <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;