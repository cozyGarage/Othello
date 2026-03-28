import React from 'react';
import type { BlogPost } from '../../config/blogPosts';

interface BlogSectionProps {
  posts: BlogPost[];
  onRead?: (post: BlogPost) => void;
}

const toneLabel: Record<BlogPost['tone'], string> = {
  strategy: 'Insight',
  news: 'Engine Room',
  design: 'Design Notes',
};

export const BlogSection: React.FC<BlogSectionProps> = ({ posts, onRead }) => {
  return (
    <section className="blog-section" id="blog">
      <div className="section-header">
        <div>
          <h2>Fresh from the lab</h2>
          <p className="section-subtext">
            Short reads on strategy, engine tuning, and how we build the experience.
          </p>
        </div>
        <span className="meta-chip">New · Weekly drops</span>
      </div>

      <div className="blog-grid">
        {posts.map((post) => (
          <article key={post.id} className="blog-card">
            <div className="blog-meta">
              <span className="blog-pill">{post.category}</span>
              <span className="blog-pill">{post.readTime}</span>
              <span className="blog-pill">{toneLabel[post.tone]}</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.summary}</p>
            <button
              type="button"
              className="blog-cta"
              onClick={() => onRead?.(post)}
              aria-label={`Open blog post: ${post.title}`}
            >
              Open draft →
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
