import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import './Blogs.css';

export default function Blogs() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Helmet><title>Blogs | Alpha Premier</title></Helmet>
      <section className="blogs-hero">
        <h1>Blogs &amp; Updates</h1>
        <p>Latest news from Alpha Premier Group</p>
      </section>
      <section className="blogs-content" data-aos="fade-up">
        <div className="blog-card" data-aos="fade-up">
          <div className="blog-img">
            <img src="/assets/images/golden.png" alt="Blog placeholder" />
          </div>
          <div className="blog-body">
            <span className="blog-date">Coming Soon</span>
            <h3>Stay Tuned for Updates</h3>
            <p>We're working on exciting content. Check back soon for the latest news and insights from Alpha Premier Group.</p>
          </div>
        </div>
      </section>
    </>
  );
}
