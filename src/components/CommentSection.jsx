import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'; // Added getDoc
import blueCheckmark from '../assets/blue-checkmark.svg';
import styles from './CommentSection.module.css';

function CommentSection({ postId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [userData, setUserData] = useState({}); // Cache user data

  useEffect(() => {
    const commentsRef = collection(db, `posts/${postId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const commentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Comments fetched:', commentsData);

      // Fetch user data for all unique userIds in comments
      const userIds = [...new Set(commentsData.map((comment) => comment.userId).filter(id => id))]; // Filter out invalid IDs
      const usersPromises = userIds.map(async (userId) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          return { userId, data: userDoc.exists() ? userDoc.data() : {} };
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
          return { userId, data: {} };
        }
      });
      const usersData = await Promise.all(usersPromises);
      const usersMap = usersData.reduce((acc, { userId, data }) => ({
        ...acc,
        [userId]: data,
      }), {});
      setUserData(usersMap);
      setComments(commentsData);
    }, (err) => {
      console.error('Error fetching comments:', err.code, err.message);
      setError('Failed to load comments: ' + err.message);
    });
    return () => unsubscribe();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, `posts/${postId}/comments`), {
        text: newComment,
        userName: user?.displayName || 'Anonymous',
        userId: user?.uid || '',
        userEmail: user?.email || '',
        userPhoto: user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email?.charAt(0)?.toUpperCase() || 'A'}&background=random&size=128`,
        createdAt: new Date(),
      });
      console.log('Comment added');
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error.code, error.message);
      setError('Failed to add comment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditText(comment.text);
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editText.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    try {
      const commentRef = doc(db, `posts/${postId}/comments`, editingComment.id);
      await updateDoc(commentRef, {
        text: editText,
        updatedAt: new Date(),
      });
      console.log('Comment updated:', editingComment.id);
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error.code, error.message);
      setError('Failed to update comment: ' + error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteDoc(doc(db, `posts/${postId}/comments`, commentId));
        console.log('Comment deleted:', commentId);
      } catch (error) {
        console.error('Error deleting comment:', error.code, error.message);
        setError('Failed to delete comment: ' + error.message);
      }
    }
  };

  const commentList = useMemo(() => (
    comments.length === 0 ? (
      <p className={styles.textMuted}>No comments yet. Be the first to comment!</p>
    ) : (
      comments.map((comment) => (
        <div key={comment.id} className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.commentUser}>
              <img
                src={comment.userPhoto || 'https://via.placeholder.com/30'}
                alt={comment.userName || 'User'}
                className={styles.commentProfileImg}
                onError={(e) => {
                  console.log('Comment image failed:', comment.userPhoto);
                  e.target.src = 'https://via.placeholder.com/30';
                }}
              />
              <span className={styles.userName}>
                {comment.userName || 'User'}
                {(comment.userEmail === 'mohamedzameermpm123@gmail.com' || userData[comment.userId]?.isVerified) && (
                  <img
                    src={blueCheckmark}
                    alt={comment.userEmail === 'mohamedzameermpm123@gmail.com' ? 'Verified Admin' : 'Verified User'}
                    className={styles.blueTick}
                    title={comment.userEmail === 'mohamedzameermpm123@gmail.com' ? 'Verified Admin' : 'Verified User'}
                  />
                )}
                <small className={styles.textMuted}>
                  {' on '}
                  {comment.createdAt?.seconds
                    ? new Date(comment.createdAt.seconds * 1000).toLocaleString()
                    : 'Unknown date'}
                </small>
              </span>
            </div>
            {editingComment?.id === comment.id ? (
              <form onSubmit={handleUpdateComment}>
                <textarea
                  className={styles.formControl}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows="2"
                />
                <div className={styles.modalButtons}>
                  <button type="submit" className={styles.btnPrimary}>
                    Save
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setEditingComment(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className={styles.cardText}>{comment.text}</p>
                {user && user.uid === comment.userId && (
                  <div className={styles.commentActions}>
                    <button
                      className={styles.btnSecondary}
                      onClick={() => handleEditComment(comment)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.btnDanger}
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))
    )
  ), [comments, editingComment, editText, user, userData]);

  return (
    <div className={styles.commentSection}>
      <h4>Comments</h4>
      {error && <div className={styles.alert}>{error}</div>}
      {user ? (
        <form onSubmit={handleCommentSubmit} className={styles.form}>
          <textarea
            className={styles.formControl}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
            disabled={loading}
          />
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? (
              <>
                Posting Comment... <span className={styles.spinner}></span>
              </>
            ) : (
              'Post Comment'
            )}
          </button>
        </form>
      ) : (
        <p className={styles.textMuted}>Please sign in to comment.</p>
      )}
      {commentList}
    </div>
  );
}

export default CommentSection;