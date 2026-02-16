import React from 'react';
import { Utensils, Coffee, Wine } from 'lucide-react';

const Restaurant: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen bg-stone-50">
       {/* Hero */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img src="https://picsum.photos/id/431/1920/1200" alt="Restaurant" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="text-center text-white px-4 border-2 border-white/20 p-12 backdrop-blur-sm">
              <span className="block text-xs font-bold tracking-[0.4em] uppercase mb-4 text-secondary">Gastronomia</span>
              <h1 className="font-serif text-5xl md:text-7xl mb-4">Sabores da Terra</h1>
              <p className="font-light text-lg tracking-wide opacity-90">Uma viagem culinária à beira-mar</p>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-32">
         <div className="text-center mb-24">
            <h2 className="font-serif text-4xl text-primary mb-6">Menu de Degustação</h2>
            <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
              Ingredientes locais frescos, capturados diariamente no nosso mar e colhidos nas fazendas vizinhas, preparados com sofisticação internacional.
            </p>
            <div className="w-px h-16 bg-secondary mx-auto mt-10"></div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Pratos Principais */}
            <div>
               <div className="flex items-center mb-10">
                  <span className="text-secondary text-4xl mr-4 font-serif italic">01.</span>
                  <h3 className="font-serif text-3xl text-primary">Pratos Principais</h3>
               </div>
               
               <div className="space-y-10">
                  <div className="group">
                     <div className="flex justify-between items-baseline mb-2">
                        <h4 className="font-serif text-xl text-gray-800 group-hover:text-secondary transition-colors">Lagosta Grelhada da Barra</h4>
                        <span className="font-sans text-sm font-bold text-primary">35.000 Kz</span>
                     </div>
                     <p className="text-gray-400 font-light text-sm italic">Arroz de coco, legumes salteados, manteiga de ervas.</p>
                  </div>

                  <div className="group">
                     <div className="flex justify-between items-baseline mb-2">
                        <h4 className="font-serif text-xl text-gray-800 group-hover:text-secondary transition-colors">Mufete Tradicional</h4>
                        <span className="font-sans text-sm font-bold text-primary">18.000 Kz</span>
                     </div>
                     <p className="text-gray-400 font-light text-sm italic">Peixe fresco do dia, feijão de óleo de palma, banana pão, farofa.</p>
                  </div>

                  <div className="group">
                     <div className="flex justify-between items-baseline mb-2">
                        <h4 className="font-serif text-xl text-gray-800 group-hover:text-secondary transition-colors">Bife do Lombo</h4>
                        <span className="font-sans text-sm font-bold text-primary">22.000 Kz</span>
                     </div>
                     <p className="text-gray-400 font-light text-sm italic">Molho de natas e pimenta, batatas rústicas, espargos.</p>
                  </div>
               </div>
            </div>

            {/* Bebidas */}
            <div>
               <div className="flex items-center mb-10">
                  <span className="text-secondary text-4xl mr-4 font-serif italic">02.</span>
                  <h3 className="font-serif text-3xl text-primary">Vinhos & Cocktails</h3>
               </div>
               
               <div className="space-y-10">
                  <div className="group">
                     <div className="flex justify-between items-baseline mb-2">
                        <h4 className="font-serif text-xl text-gray-800 group-hover:text-secondary transition-colors">Caipirinha Premium</h4>
                        <span className="font-sans text-sm font-bold text-primary">4.000 Kz</span>
                     </div>
                     <p className="text-gray-400 font-light text-sm italic">Cachaça envelhecida, açúcar mascavo, limão ou maracujá.</p>
                  </div>

                  <div className="group">
                     <div className="flex justify-between items-baseline mb-2">
                        <h4 className="font-serif text-xl text-gray-800 group-hover:text-secondary transition-colors">Seleção de Vinhos</h4>
                        <span className="font-sans text-sm font-bold text-primary">--</span>
                     </div>
                     <p className="text-gray-400 font-light text-sm italic">Consulte nossa carta de vinhos internacionais (Portugal, África do Sul, Chile).</p>
                  </div>

                  <div className="group">
                     <div className="flex justify-between items-baseline mb-2">
                        <h4 className="font-serif text-xl text-gray-800 group-hover:text-secondary transition-colors">Sucos Tropicais</h4>
                        <span className="font-sans text-sm font-bold text-primary">2.500 Kz</span>
                     </div>
                     <p className="text-gray-400 font-light text-sm italic">Frutas da época: Múcua, Goiaba, Maracujá.</p>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="mt-24 text-center">
             <button className="border border-primary text-primary px-10 py-4 uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all text-xs">
                 Reservar Mesa
             </button>
         </div>
      </div>
    </div>
  );
};

export default Restaurant;