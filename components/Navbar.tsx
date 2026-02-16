import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  // Base navigation links
  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('accommodations'), path: '/accommodations' },
    { name: t('attractions'), path: '/attractions' },
    { name: t('restaurant'), path: '/restaurant' },
    { name: t('contact'), path: '/contact' },
  ];

  // Add "My Bookings" link if user is logged in
  if (user) {
    navLinks.push({ name: t('myBookings'), path: '/profile' });
  }

  const isHome = location.pathname === '/';
  
  const headerClass = scrolled || !isHome
    ? 'bg-primary/95 backdrop-blur-md shadow-md py-3'
    : 'bg-gradient-to-b from-black/50 to-transparent py-6';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${headerClass}`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="group">
              <span className={`font-serif text-2xl md:text-3xl font-bold tracking-[0.15em] transition-colors duration-300 ${scrolled || !isHome ? 'text-white' : 'text-white'}`}>
                CASA<span className="text-secondary font-light mx-1">DA</span>PRAIA
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-xs font-medium tracking-[0.2em] hover:text-secondary uppercase transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-0 after:h-[1px] after:bg-secondary after:transition-all hover:after:w-full ${
                  link.path === '/profile' ? 'text-secondary font-bold' : 'text-white/90'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="w-[1px] h-4 bg-white/20 mx-4"></div>

            <button 
              onClick={toggleLang}
              className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase text-xs tracking-widest">{language}</span>
            </button>
            
            {user ? (
               <Link 
                 to="/profile"
                 className="flex items-center space-x-2 text-white/90 hover:text-secondary transition-colors"
                 title="Ver perfil"
               >
                 <User className="w-4 h-4" />
                 <span className="uppercase text-xs tracking-widest">{user.user_metadata.full_name?.split(' ')[0] || 'Conta'}</span>
               </Link>
            ) : (
               <Link 
                 to="/login"
                 className="text-white/90 hover:text-secondary uppercase text-xs tracking-widest transition-colors"
               >
                 Entrar
               </Link>
            )}

            <Link
              to="/booking"
              className="ml-6 border border-secondary text-secondary hover:bg-secondary hover:text-white px-6 py-2 transition-all duration-300 uppercase text-xs tracking-[0.2em]"
            >
              {t('bookNow')}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="xl:hidden flex items-center space-x-6">
             <button onClick={toggleLang} className="text-white">
                <span className="uppercase text-xs font-bold tracking-widest">{language}</span>
             </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-secondary transition-colors focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-8 h-8" strokeWidth={1} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-primary transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} xl:hidden flex flex-col justify-center items-center space-y-8`}>
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
          
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`font-serif text-3xl transition-colors ${link.path === '/profile' ? 'text-secondary font-bold' : 'text-white hover:text-secondary'}`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex space-x-8 pt-4">
             {user ? (
                <Link to="/profile" onClick={() => setIsOpen(false)} className="text-white text-lg uppercase tracking-widest hover:text-secondary flex items-center gap-2">
                   <User className="w-5 h-5" /> Minha Conta
                </Link>
             ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-white text-lg uppercase tracking-widest hover:text-secondary">Entrar</Link>
             )}
          </div>

          <Link
            to="/booking"
            onClick={() => setIsOpen(false)}
            className="mt-8 border border-white/30 text-white px-8 py-3 uppercase tracking-widest hover:border-secondary hover:text-secondary transition-colors"
          >
            {t('bookNow')}
          </Link>
      </div>
    </nav>
  );
};

export default Navbar;