import React, { useState, useRef, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider, useData } from './context/DataContext';
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
import { MessageCircle, MessageSquare, Send } from 'lucide-react';
import AdminBookings from './pages/AdminBookings';

const FloatingButtons = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const { chatMessages, sendChatMessage } = useData();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (chatOpen) {
        scrollToBottom();
    }
  }, [chatMessages, chatOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    
    const text = inputText;
    setInputText(''); // Clear immediately for UX
    await sendChatMessage(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-4 items-end">
      {/* Live Chat Window */}
      {chatOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 md:w-96 mb-4 overflow-hidden border border-gray-200 animate-fade-in flex flex-col max-h-[500px]">
           <div className="bg-primary text-white p-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                 <span className="font-bold">Chat Online</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200 p-1">✕</button>
           </div>
           
           <div className="p-4 flex-grow overflow-y-auto bg-gray-50 text-sm space-y-3 h-80">
              {chatMessages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-lg ${
                          msg.sender === 'user' 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-gray-200 text-gray-800 rounded-tl-none'
                      }`}>
                          {msg.message}
                          <span className="block text-[10px] opacity-70 mt-1 text-right">
                              {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                          </span>
                      </div>
                  </div>
              ))}
              <div ref={messagesEndRef} />
           </div>
           
           <div className="p-3 border-t bg-white">
              <form onSubmit={handleSend} className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    placeholder="Digite sua mensagem..." 
                    className="flex-grow border border-gray-300 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    disabled={!inputText.trim()}
                    className="bg-primary text-white p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                     <Send className="w-4 h-4" />
                  </button>
              </form>
           </div>
        </div>
      )}
      
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 flex items-center justify-center w-14 h-14"
        title="Chat Ao Vivo"
      >
        <MessageSquare className="w-6 h-6" />
        {/* Notification badge simulation if needed */}
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