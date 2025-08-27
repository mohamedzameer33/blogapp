import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { FaShareAlt } from 'react-icons/fa';
import CommentSection from './CommentSection'; // Import your CommentSection component

function BlogPost({ theme, user }) { // Pass theme and user props
  const { id } = useParams(); // Get post ID from URL
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch post data from Firestore
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', id);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          setPost({ id: postSnap.id, ...postSnap.data() });
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err.code, err.message);
        setError('Failed to load post: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Handle sharing to X
  const handleShare = () => {
    if (!post) return;
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareText = encodeURIComponent(`${post.title} ${postUrl}`);
    const xShareUrl = `https://x.com/intent/tweet?text=${shareText}`;
    window.open(xShareUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <div className={`blog-post-container ${theme}`}>Loading...</div>;
  }

  if (error) {
    return (
      <div className={`blog-post-container ${theme}`}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`blog-post-container ${theme}`}>
        <div className="alert alert-danger">Post not found</div>
      </div>
    );
  }

  return (
    <div className={`blog-post-container ${theme}`}>
      <main className="post-content">
        <h1 className="post-title" onClick={handleShare} style={{ cursor: 'pointer' }}>
          {post.title}
          <FaShareAlt className="share-icon" title="Share on X" />
        </h1>
        <p className="post-date">
          {post.createdAt?.seconds
            ? new Date(post.createdAt.seconds * 1000).toLocaleString()
            : 'Unknown date'}
        </p>
        <div className="post-body">{post.content}</div>
        <CommentSection postId={post.id} user={user} />
      </main>

      <style jsx>{`
        /* Theme variables matching Login.jsx */
        :root {
          --bg-color: #f4f4f9;
          --text-color: #333;
          --title-color: #333;
          --date-color: #555;
          --share-icon: #007bff;
          --share-hover: #0056b3;
          --alert-bg: #f8d7da;
          --alert-text: #721c24;
        }

        .dark {
          --bg-color: #1a1a1a;
          --text-color: #e0e0e0;
          --title-color: #e0e0e0;
          --date-color: #bbb;
          --share-icon: #00bcd4;
          --share-hover: #008ba3;
          --alert-bg: #721c24;
          --alert-text: #f8d7da;
        }

        .blog-post-container {
          min-height: 100vh;
          background-color: var(--bg-color);
          color: var(--text-color);
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .post-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .post-title {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--title-color);
          display: flex;
          align-items: center;
          gap: 10px;
          transition: color 0.3s;
        }

        .post-title:hover {
          color: var(--share-icon);
        }

        .share-icon {
          font-size: 1.5rem;
          color: var(--share-icon);
          transition: color 0.3s;
        }

        .share-icon:hover {
          color: var(--share-hover);
        }

        .post-date {
          color: var(--date-color);
          font-size: 1rem;
          margin: 10px 0;
        }

        .post-body {
          line-height: 1.6;
          font-size: 1.1rem;
          margin-bottom: 20px;
        }

        .alert-danger {
          background-color: var(--alert-bg);
          color: var(--alert-text);
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .post-title {
            font-size: 1.8rem;
          }

          .share-icon {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default BlogPost;