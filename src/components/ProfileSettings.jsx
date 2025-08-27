import { useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { db } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

function ProfileSettings({ user, onClose, onUpdate }) {
  const [newName, setNewName] = useState(user.displayName || '');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const firstLetter = user.email.charAt(0).toUpperCase();
      const photoURL = `https://ui-avatars.com/api/?name=${firstLetter}&background=random&size=128`;

      console.log('Updating Firebase Auth profile:', { displayName: newName, photoURL });
      await updateProfile(auth.currentUser, {
        displayName: newName,
        photoURL,
      });

      console.log('Updating Firestore user document:', user.uid);
      await setDoc(doc(db, 'users', user.uid), {
        displayName: newName,
        photoURL,
        email: user.email,
      }, { merge: true });

      console.log('Profile updated successfully:', { displayName: newName, photoURL });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Profile update error:', error.code, error.message);
      setError(`Failed to update profile: ${error.code || 'unknown'} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter name"
            disabled={loading}
          />
          <p className="text-muted"></p>
          <div className="modal-buttons">
            <button type="submit" className="btn btn-primary" disabled={loading || !newName.trim()}>
              {loading ? (
                <>
                  Saving... <span className="spinner"></span>
                </>
              ) : (
                'Save Profile'
              )}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettings;