import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'bootstrap/dist/css/bootstrap.min.css';

function AddPost({ user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();
  const ADMIN_EMAIL = 'mohamedzameermpm123@gmail.com';

  console.log('AddPost user:', user ? user.email : 'No user'); // Debug user

  if (user.email !== ADMIN_EMAIL) {
    return <div className="container mt-5"><h3>Access Denied: Admins Only</h3></div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset error state

    try {
      console.log('Starting post submission...'); // Debug
      let imageUrl = '';

      // Handle image upload if provided
      if (image) {
        console.log('Uploading image:', image.name); // Debug
        const imageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
        console.log('Image uploaded, URL:', imageUrl); // Debug
      } else {
        console.log('No image provided, using default'); // Debug
        imageUrl = 'https://via.placeholder.com/300'; // Fallback image
      }

      // Add post to Firestore
      console.log('Adding post to Firestore...'); // Debug
      await addDoc(collection(db, 'posts'), {
        title,
        content,
        imageUrl,
        createdAt: new Date(),
      });
      console.log('Post added successfully'); // Debug

      alert('Post added successfully!');
      setTitle('');
      setContent('');
      setImage(null);
      navigate('/');
    } catch (error) {
      console.error('Error adding post:', error.code, error.message); // Debug
      setError(`Failed to add post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Add New Blog Post</h2>
      {error && <div className="alert alert-danger">{error}</div>} {/* Show errors */}
      <form onSubmit={handleSubmit} className="add-post-form">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5"
            required
            disabled={loading}
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Upload Image (Optional)</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
            disabled={loading}
          />
          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="img-fluid mt-3"
              style={{ maxWidth: '200px' }}
            />
          )}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding Post...' : 'Add Post'}
        </button>
      </form>
    </div>
  );
}

export default AddPost;