
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, Shield, LogIn, LogOut, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAILS } from '../constants';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquear scroll do body quando menu estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleLang = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  // Base navigation links
  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('about'), path: '/about' },
    { name: t('accommodations'), path: '/accommodations' },
    { name: t('attractions'), path: '/attractions' },
    { name: t('restaurant'), path: '/restaurant' },
    { name: t('gallery'), path: '/gallery' },
    { name: t('contact'), path: '/contact' },
  ];

  // Verifica se o email do usuário está na lista de administradores
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  const isHome = location.pathname === '/';
  
  // Lógica restaurada: Transparente na home (topo), Verde no scroll ou outras páginas
  const headerClass = scrolled || !isHome || isOpen
    ? 'bg-primary shadow-md py-3'
    : 'bg-gradient-to-b from-black/50 to-transparent py-6';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${headerClass}`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center z-50">
            <Link to="/" className="group" onClick={() => setIsOpen(false)}>
              <span className={`font-serif text-2xl md:text-3xl font-bold tracking-[0.15em] transition-colors duration-300 text-white`}>
                CASA<span className="text-secondary font-light mx-1">DA</span>PRAIA
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-xs font-medium tracking-[0.2em] hover:text-secondary uppercase transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-0 after:h-[1px] after:bg-secondary after:transition-all hover:after:w-full ${
                  location.pathname === link.path ? 'text-secondary font-bold' : 'text-white/90'
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
               <div className="flex items-center space-x-6">
                   {/* Minhas Reservas Link */}
                   <Link 
                     to="/profile"
                     className={`flex items-center space-x-1 text-white/90 hover:text-secondary transition-colors ${location.pathname === '/profile' ? 'text-secondary' : ''}`}
                     title="Minhas Reservas"
                   >
                     <Calendar className="w-4 h-4" />
                     <span className="uppercase text-xs tracking-widest">Minhas Reservas</span>
                   </Link>

                   {/* User Name */}
                   <Link 
                     to="/profile"
                     className={`flex items-center space-x-2 text-white/90 hover:text-secondary transition-colors ${location.pathname === '/profile' ? 'text-secondary' : ''}`}
                     title="Minha Conta"
                   >
                     <User className="w-4 h-4" />
                     <span className="uppercase text-xs tracking-widest">{user.user_metadata.full_name?.split(' ')[0] || 'Conta'}</span>
                   </Link>
                   
                   {/* Logout Button */}
                   <button 
                     onClick={handleLogout}
                     className="text-white/70 hover:text-red-400 transition-colors"
                     title="Terminar Sessão"
                   >
                     <LogOut className="w-4 h-4" />
                   </button>

                   {isAdmin && (
                       <Link 
                         to="/admin"
                         className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition-colors border border-white/20"
                         title="Painel Administrativo"
                       >
                         <Shield className="w-3 h-3 text-secondary" />
                         <span className="uppercase text-[10px] tracking-widest font-bold">Admin</span>
                       </Link>
                   )}
               </div>
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
              className="ml-4 border border-secondary text-secondary hover:bg-secondary hover:text-white px-6 py-2 transition-all duration-300 uppercase text-xs tracking-[0.2em]"
            >
              {t('bookNow')}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="xl:hidden flex items-center space-x-4 z-50">
            {/* Lang toggle on header for quick access */}
             <button onClick={toggleLang} className="text-white px-2">
                <span className="uppercase text-xs font-bold tracking-widest">{language}</span>
             </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-secondary transition-colors focus:outline-none p-2"
              aria-label={isOpen ? "Fechar Menu" : "Abrir Menu"}
            >
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" strokeWidth={1} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-primary transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } xl:hidden flex flex-col pt-24 pb-8 px-6 h-screen overflow-y-auto`}
      >
          {/* Menu Items */}
          <div className="flex flex-col space-y-2 mb-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-2xl font-serif tracking-wide py-3 border-b border-white/5 transition-all duration-300 ${
                  location.pathname === link.path 
                    ? 'text-secondary pl-4 border-l-2 border-l-secondary border-b-transparent bg-white/5' 
                    : 'text-white hover:text-secondary hover:pl-2'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Footer Actions (Sticky bottom if space allows, otherwise scrolls) */}
          <div className="mt-auto space-y-6 pb-6">
              
              {/* Auth Links */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                  {user ? (
                      <>
                        <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                            Conta: {user.user_metadata.full_name?.split(' ')[0]}
                        </div>
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 text-white hover:text-secondary transition-colors py-2">
                            <User className="w-5 h-5 text-secondary" />
                            <span className="uppercase text-sm tracking-widest">Minha Conta</span>
                        </Link>
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 text-white hover:text-secondary transition-colors py-2">
                            <Calendar className="w-5 h-5 text-secondary" />
                            <span className="uppercase text-sm tracking-widest">Minhas Reservas</span>
                        </Link>
                        {isAdmin && (
                             <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 text-white hover:text-secondary transition-colors py-2">
                                <Shield className="w-5 h-5 text-secondary" />
                                <span className="uppercase text-sm tracking-widest">Admin</span>
                            </Link>
                        )}
                        <button onClick={handleLogout} className="flex items-center space-x-3 text-red-300 hover:text-red-400 transition-colors py-2 w-full text-left">
                            <LogOut className="w-5 h-5" />
                            <span className="uppercase text-sm tracking-widest">Sair</span>
                        </button>
                      </>
                  ) : (
                      <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 text-white hover:text-secondary transition-colors py-2">
                          <LogIn className="w-5 h-5 text-secondary" />
                          <span className="uppercase text-sm tracking-widest">Entrar / Criar Conta</span>
                      </Link>
                  )}
              </div>

              {/* Call to Action */}
              <Link
                to="/booking"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-secondary text-primary hover:bg-white hover:text-primary py-4 text-center font-bold uppercase text-xs tracking-[0.25em] transition-all rounded-sm shadow-lg"
              >
                {t('bookNow')}
              </Link>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
