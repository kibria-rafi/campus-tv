import { useState, useEffect, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { API_BASE } from './config/api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const NewsDetails = lazy(() => import('./pages/NewsDetails'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Live = lazy(() => import('./pages/Live'));
const VideoArchive = lazy(() => import('./pages/VideoArchive'));
const Contact = lazy(() => import('./pages/Contact'));
const New = lazy(() => import('./pages/New'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const CampusRadio = lazy(() => import('./pages/CampusRadio'));

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(() => {
    return localStorage.getItem('adminToken') ? null : false;
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    fetch(`${API_BASE}/api/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) {
          setIsValid(true);
        } else {
          localStorage.removeItem('adminToken');
          setIsValid(false);
        }
      })
      .catch(() => {
        setIsValid(false);
      });
  }, []);

  if (isValid === null) {
    return <div className="p-20 text-center font-bold text-foreground">Verifying secure session...</div>;
  }
  return isValid ? children : <Navigate to="/admin" />;
};

function App() {
  const [lang, setLang] = useState('bn');

  return (
    <Router>
      <ScrollToTop />
      <div className="bg-background text-foreground min-h-screen font-sans flex flex-col">
        <Navbar
          lang={lang}
          setLang={setLang}
        />
        <Suspense fallback={<div className="flex-1 flex justify-center items-center py-20 font-bold text-muted-foreground">Loading module...</div>}>
          <Routes>
            {/* /live uses its own full-screen layout — no container wrapper. */}
            <Route
              path="/live"
              element={<Live lang={lang} />}
            />

            {/* All other pages use the standard centered container */}
            <Route
              path="*"
              element={
                <main className="container mx-auto px-4 py-6 pb-20 md:pb-6 grow">
                  <Routes>
                    <Route
                      path="/"
                      element={<Home lang={lang} />}
                    />
                    <Route
                      path="/video"
                      element={<VideoArchive lang={lang} />}
                    />
                    <Route
                      path="/contact"
                      element={<Contact lang={lang} />}
                    />
                    <Route
                      path="/about"
                      element={<AboutUs lang={lang} />}
                    />
                    <Route
                      path="/news"
                      element={<New lang={lang} />}
                    />
                    <Route
                      path="/news/:id"
                      element={<NewsDetails lang={lang} />}
                    />

                    <Route
                      path="/search"
                      element={<SearchPage lang={lang} />}
                    />

                    <Route
                      path="/campus-radio"
                      element={<CampusRadio lang={lang} />}
                    />
                    <Route
                      path="/admin"
                      element={<Login lang={lang} />}
                    />

                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <AdminDashboard lang={lang} />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="*"
                      element={<Navigate to="/" />}
                    />
                  </Routes>
                </main>
              }
            />
          </Routes>
        </Suspense>
        <div className="pb-16 md:pb-0">
          <Footer lang={lang} />
        </div>
        <BottomNav lang={lang} />
      </div>
    </Router>
  );
}

export default App;
