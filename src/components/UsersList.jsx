import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import styles from './UsersList.module.css';
import blueCheckmark from '../assets/blue-checkmark.svg';

const UsersList = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();

  const isAdmin = user?.email === 'mohamedzameermpm123@gmail.com';

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) {
        setError('Access denied: Admins only');
        setLoading(false);
        return;
      }

      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  const handleToggleBlueTick = async (userId, currentStatus) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        isVerified: !currentStatus,
      });
      setUsers(users.map((u) =>
        u.id === userId ? { ...u, isVerified: !currentStatus } : u
      ));
    } catch (err) {
      console.error('Error toggling blue tick:', err);
      setError('Failed to update verification status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter((u) => u.id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  if (!isAdmin) {
    return <div className={styles.alert}>Access denied: Admins only</div>;
  }

  if (loading) {
    return <div className={styles.spinner}></div>;
  }

  if (error) {
    return <div className={styles.alert}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2>All Users</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Profile</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <img
                  src={u.photoURL || 'https://via.placeholder.com/40'}
                  alt={u.displayName || 'User'}
                  className={styles.profileImg}
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
                />
              </td>
              <td>
                {u.displayName || 'User'}
                {u.isVerified && (
                  <img
                    src={blueCheckmark}
                    alt="Verified"
                    className={styles.blueTick}
                    title="Verified User"
                  />
                )}
              </td>
              <td>{u.email || 'N/A'}</td>
              <td>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => handleToggleBlueTick(u.id, u.isVerified)}
                >
                  {u.isVerified ? 'Remove Blue Tick' : 'Add Blue Tick'}
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleDeleteUser(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;