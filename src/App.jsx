import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import NewsDetails from './pages/NewsDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [lang, setLang] = useState('bn');

  return (
    <Router>
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar lang={lang} setLang={setLang} />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home lang={lang} />} />
            <Route path="/news/:id" element={<NewsDetails lang={lang} />} />
            <Route path="/login" element={<Login lang={lang} />} />
            <Route path="/signup" element={<Signup lang={lang} />} />
          </Routes>
        </main>
        <Footer lang={lang} />
      </div>
    </Router>
  );
}

export default App;