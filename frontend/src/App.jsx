import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import NewsDetails from './pages/NewsDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';

import Live from './pages/Live'; // নতুন যোগ করা হয়েছে
import VideoArchive from './pages/VideoArchive';
// প্রোটেক্টেড রাউট ফাংশন
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" />;
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
          {/*
           * /live renders its own full-screen dark layout — no container
           * wrapper applied here so the page is truly immersive.
           */}
          <Route
            path="/live"
            element={<Live lang={lang} />}
          />

          {/* All other pages — wrapped in the standard centered container */}
          <Route
            path="*"
            element={
              <main className="container mx-auto px-4 py-6 grow">
                <Routes>
                  {/* সাধারণ রাউটসমূহ */}
                  <Route
                    path="/"
                    element={<Home lang={lang} />}
                  />
                  <Route
                    path="/video"
                    element={<VideoArchive lang={lang} />}
                  />
                  <Route
                    path="/news/:id"
                    element={<NewsDetails lang={lang} />}
                  />
                  <Route
                    path="/login"
                    element={<Login lang={lang} />}
                  />
                  <Route
                    path="/signup"
                    element={<Signup lang={lang} />}
                  />

                  {/* অ্যাডমিন ড্যাশবোর্ড রাউট - প্রোটেক্টেড */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard lang={lang} />
                      </ProtectedRoute>
                    }
                  />

                  {/* ভুল URL দিলে হোমপেজে রিডাইরেক্ট করবে */}
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
      </div>
    </Router>
  );
}

export default App;
