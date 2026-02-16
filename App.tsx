import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Accommodations from './pages/Accommodations';
import Attractions from './pages/Attractions';
import Restaurant from './pages/Restaurant';
import Booking from './pages/Booking';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Policy from './pages/Policy';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { MessageCircle, MessageSquare } from 'lucide-react';
import AdminBookings from './pages/AdminBookings';

const FloatingButtons = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-4 items-end">
      {/* Live Chat Simulation */}
      {chatOpen && (
        <div className="bg-white rounded-lg shadow-xl w-72 mb-4 overflow-hidden border border-gray-200 animate-fade-in">
           <div className="bg-primary text-white p-4 flex justify-between items-center">
              <span className="font-bold">Chat Online</span>
              <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200">x</button>
           </div>
           <div className="p-4 h-64 overflow-y-auto bg-gray-50 text-sm">
              <div className="bg-gray-200 p-2 rounded-lg rounded-tl-none mb-2 inline-block max-w-[80%]">
                 Olá! Como posso ajudar na sua reserva?
              </div>
           </div>
           <div className="p-2 border-t">
              <input type="text" placeholder="Digite sua mensagem..." className="w-full border rounded p-2 text-sm focus:outline-none focus:border-primary" />
           </div>
        </div>
      )}
      
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 flex items-center justify-center w-14 h-14"
        title="Chat Ao Vivo"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <a
        href="https://wa.me/244929729931"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 flex items-center justify-center w-14 h-14"
        title="WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
      </a>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/accommodations" element={<Accommodations />} />
                  <Route path="/attractions" element={<Attractions />} />
                  <Route path="/restaurant" element={<Restaurant />} />
                  <Route path="/booking" element={<Booking />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/policy" element={<Policy />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                   <Route path="/admin/reservas" element={<AdminBookings />} />
                </Routes>
              </main>
              <Footer />
              <FloatingButtons />
            </div>
          </Router>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;