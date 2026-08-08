import React, { useState, useEffect } from 'react';
import { PostCard } from '../../components/PostCard/PostCard.jsx';
import { getFeed, normalizePost } from '../../api/postApi';

const Service = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getFeed({ page: 1, limit: 20 });
        if (res && Array.isArray(res.posts)) {
          setPosts(res.posts.map(normalizePost));
        }
      } catch (err) {
        console.warn(err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-6">Services</h1>
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id || post._id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Service;
