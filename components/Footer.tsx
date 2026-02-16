import React from 'react';
import { MapPin, Phone, Mail, Instagram, Facebook, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RESORT_INFO } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white pt-24 pb-12 border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-20">
            {/* Brand - Big */}
            <div className="mb-12 md:mb-0">
                <h3 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-6">CASA DA PRAIA</h3>
                <p className="text-white/60 font-light max-w-md text-lg">
                    Luxo silencioso na Praia dos Ramiros. <br/>
                    O seu refúgio particular em Angola.
                </p>
            </div>
            
            {/* Newsletter or Action */}
            <div className="flex flex-col items-start">
                 <Link to="/booking" className="group flex items-center text-2xl font-serif hover:text-secondary transition-colors">
                    <span>Reserve sua estadia</span>
                    <ArrowUpRight className="ml-2 w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                 </Link>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-white/10 pt-16">
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Endereço</h4>
            <div className="flex items-start space-x-3 text-white/70 font-light">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>Angola, Luanda<br/>Praia dos Ramiros Km 32</span>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Contacto</h4>
            <div className="space-y-2 text-white/70 font-light">
                <p className="flex items-center space-x-3">
                    <Phone className="w-4 h-4" />
                    <span>{RESORT_INFO.phone}</span>
                </p>
                <p className="flex items-center space-x-3">
                    <Mail className="w-4 h-4" />
                    <span>{RESORT_INFO.email}</span>
                </p>
            </div>
          </div>

          <div className="space-y-6">
             <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Social</h4>
             <div className="flex space-x-6">
                <a href="#" className="hover:text-secondary transition-colors" aria-label="Instagram"><Instagram strokeWidth={1.5} /></a>
                <a href="#" className="hover:text-secondary transition-colors" aria-label="Facebook"><Facebook strokeWidth={1.5} /></a>
                <a href="#" className="hover:text-secondary transition-colors" aria-label="TikTok">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
             </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Links</h4>
            <ul className="space-y-2 text-white/70 font-light text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">Sobre Nós</Link></li>
                <li><Link to="/policy" className="hover:text-white transition-colors">Política de Cancelamento</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors">Área Restrita</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col md:flex-row justify-between items-center text-white/30 text-xs font-light tracking-wider">
          <p>&copy; {new Date().getFullYear()} Casa da Praia Resort.</p>
          <p className="mt-2 md:mt-0">Designed for Excellence.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;