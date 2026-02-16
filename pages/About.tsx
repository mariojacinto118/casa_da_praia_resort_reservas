import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
           <img src="https://picsum.photos/id/201/1920/800" alt="About Hero" className="w-full h-full object-cover grayscale opacity-80" />
           <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="font-serif text-6xl md:text-8xl text-white tracking-tight">Nossa Essência</h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
           
           <motion.div 
             initial={{ opacity: 0, y: 50 }} 
             animate={{ opacity: 1, y: 0 }} 
             transition={{ duration: 0.8 }}
             className="relative"
           >
              <div className="aspect-[3/4] overflow-hidden">
                 <img src="https://picsum.photos/id/48/800/1000" alt="Architecture" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 shadow-xl max-w-xs hidden md:block">
                  <p className="font-serif text-2xl text-primary leading-snug">
                      "A simplicidade é o último grau de sofisticação."
                  </p>
                  <p className="text-xs uppercase tracking-widest mt-4 text-secondary">— Leonardo da Vinci</p>
              </div>
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0, y: 50 }} 
             animate={{ opacity: 1, y: 0 }} 
             transition={{ duration: 0.8, delay: 0.2 }}
             className="pt-10"
           >
              <span className="text-secondary text-xs font-bold tracking-[0.3em] uppercase mb-6 block">Sobre Nós</span>
              <h2 className="font-serif text-5xl text-primary mb-10 leading-tight">
                Um refúgio desenhado para a alma.
              </h2>
              <div className="space-y-8 text-gray-500 font-light text-lg leading-relaxed text-justify">
                <p>
                  A <strong>Casa da Praia Resort</strong> não foi construída apenas para hospedar, mas para acolher. 
                  Nascemos do desejo de oferecer a Angola um padrão de hospitalidade que valoriza o silêncio, o espaço e a privacidade acima de tudo.
                </p>
                <p>
                  Localizados na privilegiada Praia dos Ramiros, onde o rio encontra o mar, nossa arquitetura respeita a paisagem. 
                  Usamos madeiras locais, pedras naturais e uma paleta de cores que reflete a areia e a vegetação circundante.
                </p>
                <p>
                  Aqui, o luxo não é dourado e brilhante. É a sensação de pés descalços na areia morna, é o serviço que antecipa o seu desejo, é o tempo que parece parar quando você observa o pôr do sol da sua varanda privativa.
                </p>
              </div>

              <div className="mt-16 grid grid-cols-2 gap-12 border-t border-gray-200 pt-12">
                 <div>
                    <span className="block text-5xl font-serif text-primary mb-2">50+</span>
                    <span className="text-xs uppercase tracking-widest text-gray-500">Suítes Privativas</span>
                 </div>
                 <div>
                    <span className="block text-5xl font-serif text-primary mb-2">24h</span>
                    <span className="text-xs uppercase tracking-widest text-gray-500">Concierge Service</span>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;