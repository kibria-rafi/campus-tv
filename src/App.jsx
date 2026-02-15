import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Ticker from './components/Ticker';
import Home from './pages/Home';
import NewsDetails from './pages/NewsDetails';

function App() {
  const [lang, setLang] = useState('bn'); // ডিফল্ট ভাষা বাংলা

  return (
    <Router>
      <div className="bg-gray-50 min-h-screen font-sans">
        {/* Navbar-এ lang এবং setLang পাঠিয়ে দিচ্ছি */}
        <Navbar lang={lang} setLang={setLang} />
<Ticker lang={lang} />
        
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home lang={lang} />} />
            <Route path="/news/:id" element={<NewsDetails lang={lang} />} />
          </Routes>
        </main>
        
        <Footer lang={lang} />
      </div>
    </Router>
  );
}

export default App;