import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FaShareAlt } from 'react-icons/fa';
import CommentSection from './CommentSection';
import blueCheckmark from '../assets/blue-checkmark.svg';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

function PostDetail({ user, theme }) {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', id);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          setPost({ id: postSnap.id, ...postSnap.data() });
          setEditTitle(postSnap.data().title || '');
          setEditContent(postSnap.data().content || '');
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post.');
      }
    };
    fetchPost();
  }, [id]);

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editTitle || !editContent) {
      setError('Title and content are required');
      return;
    }
    try {
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, {
        title: editTitle,
        content: DOMPurify.sanitize(editContent),
        updatedAt: new Date(),
      });
      console.log('Post updated:', id);
      setPost({ ...post, title: editTitle, content: editContent });
      setEditing(false);
    } catch (error) {
      console.error('Error updating post:', error.code, error.message);
      setError('Failed to update post: ' + error.message);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'posts', id));
        console.log('Post deleted:', id);
        navigate('/');
      } catch (error) {
        console.error('Error deleting post:', error.code, error.message);
        setError('Failed to delete post: ' + error.message);
      }
    }
  };

  const handleShare = () => {
    if (!post) return;
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareText = encodeURIComponent(`${post.title} ${postUrl}`);
    const xShareUrl = `https://x.com/intent/tweet?text=${shareText}`;
    window.open(xShareUrl, '_blank', 'noopener,noreferrer');
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  if (error) {
    return (
      <div className={`post-detail-container ${theme}`}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!post) {
    return <div className={`post-detail-container ${theme}`}>Loading...</div>;
  }

  return (
    <div className={`post-detail-container ${theme}`}>
      <div className="card">
        <div className="card-body">
          <div className="comment-user">
            <img
              src={post.userPhoto || 'https://via.placeholder.com/30'}
              alt={post.userName || 'User'}
              className="comment-profile-img"
              onError={(e) => {
                console.log('Post image failed:', post.userPhoto);
                e.target.src = 'https://via.placeholder.com/30';
              }}
            />
            <span className="user-name">
              {post.userName || 'Anonymous'}
              {post.userEmail === 'mohamedzameermpm123@gmail.com' && (
                <img
                  src={blueCheckmark}
                  alt="Verified Admin"
                  className="blue-tick"
                  title="Verified Admin"
                />
              )}
            </span>
          </div>
          {editing ? (
            <form onSubmit={handleUpdatePost}>
              <input
                type="text"
                className="form-control"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Post Title"
              />
              <ReactQuill
                theme="snow"
                value={editContent}
                onChange={setEditContent}
                modules={modules}
                className="form-control quill-editor"
                placeholder="Post Content"
              />
              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h5
                className="post-title"
                onClick={handleShare}
                style={{ cursor: 'pointer' }}
              >
                {post.title || 'Untitled'}
                <FaShareAlt className="share-icon" title="Share on X" />
              </h5>
              <div
                className="post-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.content || ''),
                }}
              />
              {user && user.email === 'mohamedzameermpm123@gmail.com' && (
                <div className="post-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDeletePost}
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <CommentSection postId={id} user={user} />

      <style jsx>{`
        :root {
          --share-icon: #007bff;
          --share-hover: #0056b3;
          --alert-bg: #f8d7da;
          --alert-text: #721c24;
          --btn-bg: #007bff;
          --btn-text: #fff;
          --secondary-btn-bg: #6c757d;
          --danger-btn-bg: #dc3545;
          --input-bg: #fff;
          --input-border: rgba(0, 0, 0, 0.2);
        }

        .dark {
         
          --text-color: #e0e0e0;
          --title-color: #e0e0e0;
          --share-icon: #00bcd4;
          --share-hover: #008ba3;
          --alert-bg: #721c24;
          --alert-text: #f8d7da;
          --btn-bg: #00bcd4;
          --btn-text: #FFF;
          --secondary-btn-bg: #4b5e6b;
          --danger-btn-bg: #a71d2a;
          --input-bg: #4a4a4a; /* Grey background for dark mode */
          --input-border: rgba(255, 255, 255, 0.2);
        }

        .post-detail-container {
          min-height: 100vh;
          background-color: var(--bg-color);
          color: var(--text-color);
          padding: 16px;
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
        }

        .card {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background-color: var(--bg-color);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          overflow: hidden;
        }

        .card-body {
          padding: 16px;
        }

        .comment-user {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .comment-profile-img {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name {
          font-weight: 600;
          color: var(--text-color);
          font-size: 1rem;
        }

        .blue-tick {
          width: 18px;
          height: 18px;
          vertical-align: middle;
          margin-left: 4px;
        }

        .post-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--title-color);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          transition: color 0.3s;
          flex-wrap: wrap;
        }

        .post-title:hover {
          color: var(--share-icon);
        }

        .share-icon {
          font-size: 1.25rem;
          color: var(--share-icon);
          transition: color 0.3s;
        }

        .share-icon:hover {
          color: var(--share-hover);
        }

        .post-content {
          word-wrap: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }

        .post-content img {
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 12px 0;
        }

        .form-control {
          margin-bottom: 12px;
          background-color: var(--input-bg);
          color: var(--text-color);
          border: 1px solid var(--input-border);
          border-radius: 4px;
          width: 100%;
          box-sizing: border-box;
          font-size: 1rem;
        }

        .quill-editor {
          margin-bottom: 12px;
          width: 100%;
        }

        .quill-editor .ql-container {
          background-color: var(--input-bg);
          color: var(--text-color);
          border: 1px solid var(--input-border);
          border-radius: 0 0 4px 4px;
          min-height: 150px;
          font-size: 1rem;
        }

        .quill-editor .ql-toolbar {
          background-color: var(--input-bg);
          border: 1px solid var(--input-border);
          border-bottom: none;
          border-radius: 4px 4px 0 0;
        }

        .dark .quill-editor .ql-toolbar {
          border-bottom: 1px solid var(--input-border);
        }

        .modal-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-primary {
          background-color: var(--btn-bg);
          color: var(--btn-text);
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.95rem;
          transition: opacity 0.3s;
          cursor: pointer;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background-color: var(--secondary-btn-bg);
          color: var(--btn-text);
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.95rem;
          transition: opacity 0.3s;
          cursor: pointer;
        }

        .btn-secondary:hover {
          opacity: 0.9;
        }

        .btn-danger {
          background-color: var(--danger-btn-bg);
          color: var(--btn-text);
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.95rem;
          transition: opacity 0.3s;
          cursor: pointer;
        }

        .btn-danger:hover {
          opacity: 0.9;
        }

        .post-actions {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .alert-danger {
          background-color: var(--alert-bg);
          color: var(--alert-text);
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 16px;
          width: 100%;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          font-size: 0.9rem;
        }

        @media (max-width: 600px) {
          .post-detail-container {
            padding: 12px;
          }

          .post-title {
            font-size: 1.5rem;
          }

          .share-icon {
            font-size: 1.1rem;
          }

          .card {
            padding: 8px;
          }

          .card-body {
            padding: 12px;
          }

          .comment-user {
            gap: 6px;
          }

          .comment-profile-img {
            width: 24px;
            height: 24px;
          }

          .user-name {
            font-size: 0.9rem;
          }

          .blue-tick {
            width: 16px;
            height: 16px;
          }

          .form-control {
            font-size: 0.9rem;
          }

          .quill-editor .ql-container {
            min-height: 120px;
            font-size: 0.9rem;
          }

          .quill-editor .ql-toolbar .ql-picker-label,
          .quill-editor .ql-toolbar button {
            font-size: 0.8rem;
            padding: 4px;
          }

          .btn-primary,
          .btn-secondary,
          .btn-danger {
            padding: 6px 12px;
            font-size: 0.85rem;
          }

          .post-actions {
            gap: 6px;
          }

          .alert-danger {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 400px) {
          .post-title {
            font-size: 1.3rem;
          }

          .share-icon {
            font-size: 1rem;
          }

          .btn-primary,
          .btn-secondary,
          .btn-danger {
            padding: 5px 10px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}

export default PostDetail;