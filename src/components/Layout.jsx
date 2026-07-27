import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot';

export default function Layout() {
  const location = useLocation();
  const is88Prime = location.pathname.startsWith('/subsidiaries/88prime');

  return (
    <>
      {!is88Prime && <Header />}
      <main>
        <Outlet />
      </main>
      {!is88Prime && <Footer />}
      <Chatbot />
    </>
  );
}
