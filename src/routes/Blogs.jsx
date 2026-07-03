import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import AOS from 'aos';
import './Blogs.css';

const fallback = [
  { category: 'Real Estate', date: 'OCTOBER 24, 2023', title: 'The Future of Commercial Real Estate in 2024', excerpt: 'Discover the emerging trends that are shaping the commercial property market, from sustainable office designs to smart warehouses.', img: '/assets/images/blogs-featured-img.png' },
  { category: 'Investment', date: 'OCTOBER 15, 2023', title: 'Why Logistics Warehouses are the Best Investment', excerpt: 'With the boom of e-commerce, industrial spaces are becoming the most sought-after assets for serious real estate investors.', img: '/assets/images/blogs-recent-img.png' },
  { category: 'Lifestyle', date: 'SEPTEMBER 30, 2023', title: 'Maximizing Productivity in Your Virtual Office', excerpt: 'Learn how to leverage virtual office services to boost your business image and output without the traditional overhead costs.', img: '/assets/images/blogs-recent-img.png' },
];

export default function Blogs() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    supabase.from('blog_posts').select('*').eq('status', 'published').order('published_at', { ascending: false })
      .then(({ data }) => {
        if (data?.length) {
          setPosts(data.map(p => ({
            category: p.category || 'Blog',
            date: new Date(p.published_at || p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase(),
            title: p.title,
            excerpt: p.excerpt || '',
            img: p.cover_image || '/assets/images/blogs-recent-img.png',
          })));
        }
      });
  }, []);

  const display = posts || fallback;

  return (
    <>
      <Helmet><title>Blogs | Alpha Premier</title></Helmet>
      <section className="blog-hero">
        <p className="blog-eyebrow">Insights &amp; Updates</p>
        <h1>LATEST NEWS FROM ALPHA PREMIER GROUP</h1>
      </section>
      <section className="blog-list" data-aos="fade-up">
        {display.map((post, i) => (
          <article key={i} className="blog-card" data-aos="fade-up" data-aos-delay={i * 100}>
            <div className="blog-img">
              <img src={post.img} alt={post.title} />
            </div>
            <div className="blog-body">
              <span className="blog-category">{post.category}</span>
              <span className="blog-date">{post.date}</span>
              <h3 className="blog-title">{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
              <a href="#" className="blog-readmore">READ MORE</a>
            </div>
          </article>
        ))}
      </section>
      <section className="inquire-section" data-aos="fade-up">
        <h2>Stay Connected</h2>
        <Link to="/contact" className="inquire-cta-btn">Inquire Now!</Link>
      </section>
    </>
  );
}
