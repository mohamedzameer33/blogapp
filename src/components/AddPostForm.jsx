import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Compressor from 'compressorjs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

function AddPostForm({ user, theme }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debug theme prop
  useEffect(() => {
    console.log('AddPostForm theme prop:', theme);
  }, [theme]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Image size exceeds 5MB limit');
        return;
      }
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 800,
        maxHeight: 800,
        success(compressedFile) {
          setImage(compressedFile);
        },
        error(err) {
          setError('Failed to compress image: ' + err.message);
        },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    if (!user || user.email !== 'mohamedzameermpm123@gmail.com') {
      setError('Only the admin can create posts');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageUrl = '';
      if (image) {
        const storageRef = ref(storage, `posts/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
        console.log('Image uploaded:', imageUrl);
      }

      const postData = {
        title,
        content: DOMPurify.sanitize(content),
        userName: user.displayName || 'Mohamed Zameer',
        userEmail: user.email || 'mohamedzameermpm123@gmail.com',
        userPhoto: user.photoURL || 'https://via.placeholder.com/30',
        createdAt: new Date(),
        imageUrl,
      };
      const docRef = await addDoc(collection(db, 'posts'), postData);
      console.log('Post created:', docRef.id);
      setTitle('');
      setContent('');
      setImage(null);
      navigate(`/post/${docRef.id}`);
    } catch (err) {
      console.error('Error creating post:', err.code, err.message);
      setError('Failed to create post: ' + err.message);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className={`add-post-container ${theme}`}>
      <div className="card">
        <div className="card-body">
          <h2>Create New Post</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {user && user.email === 'mohamedzameermpm123@gmail.com' ? (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post Title"
                disabled={loading}
              />
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                className="form-control quill-editor"
                placeholder="Post Content"
                readOnly={loading}
              />
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
              <button type="submit" className="btn btn-primary create-btn" disabled={loading}>
                {loading ? 'Creating Post...' : 'Create Post'}
              </button>
            </form>
          ) : (
            <p className="text-muted">Only the admin can create posts.</p>
          )}
        </div>
      </div>

      <style jsx>{`
        :root {
       
          --text-color: #333;
          --title-color:#1A75FF;
          --alert-bg: #f8d7da;
          --alert-text: #721c24;
          --btn-bg: #007bff;
          --btn-text: #fff;
          --input-bg: #fff;
          --input-border: rgba(0, 0, 0, 0.2);
        }

        .dark {
    
          --text-color: #000000;
          --title-color: #e0e0e0;
          --alert-bg: #721c24;
          --alert-text: #f8d7da;
          --btn-bg: #00bcd4;
          --btn-text: #000;
          --input-bg: #4a4a4a; /* Grey background for dark mode */
          --input-border: rgba(255, 255, 255, 0.2);
        }

        .add-post-container {
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

        h2 {
          font-size: 1.75rem;
          color: var(--title-color);
          margin-bottom: 16px;
          text-align: center;
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

        .create-btn {
          background-color: var(--btn-bg);
          color: var(--btn-text);
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.95rem;
          transition: opacity 0.3s;
          cursor: pointer;
          width: 100%;
          max-width: 200px;
        }

      .create-btn:hover {
          opacity: 0.9;
        }

        .alert-danger {
          background-color: var(--alert-bg);
          color: var(--alert-text);
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 16px;
          width: 100%;
          font-size: 0.9rem;
        }

        .text-muted {
          color: var(--text-color);
          opacity: 0.7;
          font-size: 0.9rem;
          text-align: center;
        }

        @media (max-width: 600px) {
          .add-post-container {
            padding: 12px;
          }

          h2 {
            font-size: 1.5rem;
          }

          .card {
            padding: 8px;
          }

          .card-body {
            padding: 12px;
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

          .btn-primary {
            padding: 6px 12px;
            font-size: 0.85rem;
            max-width: 100%;
          }

          .alert-danger {
            font-size: 0.85rem;
          }

          .text-muted {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 400px) {
          h2 {
            font-size: 1.3rem;
          }

          .btn-primary {
            padding: 5px 10px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}

export default AddPostForm;