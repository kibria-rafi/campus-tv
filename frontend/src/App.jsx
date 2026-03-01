import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import NewsDetails from './pages/NewsDetails';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AboutUs from './pages/AboutUs';

import Live from './pages/Live';
import VideoArchive from './pages/VideoArchive';
import Contact from './pages/Contact';
import New from './pages/New';
import SearchPage from './pages/SearchPage';
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin" />;
};

function App() {
  const [lang, setLang] = useState('bn');

  return (
    <Router>
      <div className="bg-background text-foreground min-h-screen font-sans flex flex-col">
        <Navbar
          lang={lang}
          setLang={setLang}
        />
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
        <Footer lang={lang} />
        <BottomNav lang={lang} />
      </div>
    </Router>
  );
}

export default App;
