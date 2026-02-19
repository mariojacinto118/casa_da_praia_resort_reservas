import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Wind, Waves, Utensils } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import RoomCard from '../components/RoomCard';
import { getStorageUrl } from '../supabase';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { rooms } = useData();
  const featuredRooms = rooms.slice(0, 3);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Lista de imagens para o Slider do Hero
  const heroImages = [
    "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/site/IMG_5914%20(1).jpg"
  ];

  // Rotação automática do slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Troca a cada 5 segundos

    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-light">
      {/* Hero Section - Slider Style */}
      <section className="relative h-screen w-full overflow-hidden">
        
        {/* Background Images Slider */}
        {heroImages.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={img}
              alt={`Casa da Praia Resort View ${index + 1}`}
              className="w-full h-full object-cover transform scale-105 animate-ken-burns" // Pequeno zoom effect
            />
          </div>
        ))}

        {/* Sophisticated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10"></div>
        
        {/* Hero Content */}
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-5xl"
          >
            <p className="text-secondary font-sans text-xs md:text-sm tracking-[0.4em] uppercase mb-6 drop-shadow-md">
              Praia dos Ramiros, Luanda
            </p>
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-white mb-8 leading-none tracking-tight drop-shadow-lg">
              {t('heroTitle')}
            </h1>
            <p className="font-sans font-light text-white/90 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed drop-shadow-md">
              {t('heroSubtitle')}
            </p>
            
            <Link
              to="/booking"
              className="group inline-flex items-center space-x-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-10 py-4 hover:bg-white hover:text-primary transition-all duration-500 uppercase text-sm tracking-[0.25em]"
            >
              <span>{t('bookNow')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
        
        {/* Slider Navigation Dots */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce text-white/50">
           <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Introduction / Philosophy */}
      <section className="py-32 px-6 bg-light">
        <div className="max-w-4xl mx-auto text-center">
           <span className="text-secondary text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Nossa Filosofia</span>
           <h2 className="font-serif text-4xl md:text-5xl text-primary mb-8 leading-tight">
             "Onde o tempo desacelera e a natureza dita o ritmo."
           </h2>
           <p className="text-gray-500 font-light text-lg leading-loose mx-auto max-w-2xl">
             Situado nas margens serenas da Praia dos Ramiros, o Casa da Praia não é apenas um resort, é um santuário. 
             Combinamos a arquitetura moderna com materiais naturais para criar uma atmosfera de luxo despretensioso.
           </p>
           <div className="mt-12">
             <div className="w-24 h-1 mx-auto bg-secondary/30"></div>
           </div>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
            {/* Item 1 */}
            <div className="bg-white p-16 text-center group hover:bg-primary hover:text-white transition-colors duration-500">
              <Wind className="w-8 h-8 mx-auto mb-6 text-secondary" strokeWidth={1} />
              <h3 className="font-serif text-2xl mb-4">Bem-estar & Spa</h3>
              <p className="font-light text-sm text-gray-500 group-hover:text-white/80 leading-relaxed">
                Massagens relaxantes com vista para o mar e tratamentos exclusivos.
              </p>
            </div>
            {/* Item 2 */}
            <div className="bg-white p-16 text-center group hover:bg-primary hover:text-white transition-colors duration-500">
              <Waves className="w-8 h-8 mx-auto mb-6 text-secondary" strokeWidth={1} />
              <h3 className="font-serif text-2xl mb-4">Praia Privativa</h3>
              <p className="font-light text-sm text-gray-500 group-hover:text-white/80 leading-relaxed">
                Acesso direto a quilômetros de areia dourada e águas mornas.
              </p>
            </div>
            {/* Item 3 */}
            <div className="bg-white p-16 text-center group hover:bg-primary hover:text-white transition-colors duration-500">
              <Utensils className="w-8 h-8 mx-auto mb-6 text-secondary" strokeWidth={1} />
              <h3 className="font-serif text-2xl mb-4">Alta Gastronomia</h3>
              <p className="font-light text-sm text-gray-500 group-hover:text-white/80 leading-relaxed">
                Uma fusão de sabores locais e técnicas internacionais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms with refined Layout */}
      <section className="py-32 bg-light">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-xl">
              <span className="text-secondary text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Acomodações</span>
              <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight">
                Suítes & Chalés Exclusivos
              </h2>
            </div>
            <Link to="/accommodations" className="hidden md:flex items-center space-x-2 text-primary text-xs font-bold tracking-[0.2em] uppercase hover:text-secondary transition-colors border-b border-primary hover:border-secondary pb-1">
              <span>Ver todas as opções</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/accommodations" className="inline-block border border-primary text-primary px-8 py-3 text-xs uppercase tracking-widest">
              Ver Todas
            </Link>
          </div>
        </div>
      </section>

      {/* Image Strip / Atmosphere - Now using Supabase URLs */}
      <section className="grid grid-cols-2 md:grid-cols-4 h-64 md:h-96 w-full">
         <div className="relative group overflow-hidden">
            <img 
                src={getStorageUrl('site/mood-1.jpg')} 
                onError={(e) => (e.target as HTMLImageElement).src = "https://picsum.photos/id/10/800/800"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="Mood 1"
            />
         </div>
         <div className="relative group overflow-hidden">
            <img 
                src={getStorageUrl('site/mood-2.jpg')} 
                onError={(e) => (e.target as HTMLImageElement).src = "https://picsum.photos/id/11/800/800"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="Mood 2"
            />
         </div>
         <div className="relative group overflow-hidden">
            <img 
                src={getStorageUrl('site/mood-3.jpg')} 
                onError={(e) => (e.target as HTMLImageElement).src = "https://picsum.photos/id/12/800/800"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="Mood 3"
            />
         </div>
         <div className="relative group overflow-hidden">
            <img 
                src={getStorageUrl('site/mood-4.jpg')} 
                onError={(e) => (e.target as HTMLImageElement).src = "https://picsum.photos/id/13/800/800"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="Mood 4"
            />
         </div>
      </section>

      {/* Testimonial - Minimal */}
      <section className="py-32 bg-primary text-white text-center px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-8">
             {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-secondary mx-1" fill="#C5A059" />)}
          </div>
          <h2 className="font-serif text-3xl md:text-5xl italic leading-tight mb-10 opacity-90">
            "Uma experiência transcendente. O silêncio, o serviço e a beleza natural criam uma harmonia perfeita."
          </h2>
          <div className="uppercase text-xs tracking-[0.3em] text-secondary">
             Sofia M., Luanda
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
