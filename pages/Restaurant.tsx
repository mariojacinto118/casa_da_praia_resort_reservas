
import React, { useState } from 'react';
import { Utensils, Wine, Clock, Calendar, Users, X, CheckCircle, ChevronRight, ArrowRight, MessageSquare, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';

// Dados do Menu (Simulado, mas com estrutura profissional)
const MENU_CATEGORIES = [
    { id: 'starters', name: 'Entradas' },
    { id: 'mains', name: 'Pratos Principais' },
    { id: 'desserts', name: 'Sobremesas' },
    { id: 'drinks', name: 'Bebidas & Cocktails' },
];

const MENU_ITEMS: Record<string, {name: string, price: string, desc: string}[]> = {
    starters: [
        { name: 'Carpaccio de Polvo', price: '9.000 Kz', desc: 'Finas fatias de polvo, azeite virgem, limão e pimenta rosa.' },
        { name: 'Camarão ao Alho', price: '12.000 Kz', desc: 'Camarões tigre salteados em alho, malagueta e coentros.' },
        { name: 'Salada Casa da Praia', price: '6.500 Kz', desc: 'Mix de folhas, manga, abacate e vinagrete de maracujá.' },
    ],
    mains: [
        { name: 'Lagosta Grelhada da Barra', price: '35.000 Kz', desc: 'Arroz de coco, legumes salteados, manteiga de ervas.' },
        { name: 'Mufete Tradicional', price: '18.000 Kz', desc: 'Peixe fresco do dia, feijão de óleo de palma, banana pão, farofa.' },
        { name: 'Bife do Lombo', price: '22.000 Kz', desc: 'Molho de natas e pimenta, batatas rústicas, espargos.' },
        { name: 'Risoto de Cogumelos', price: '16.000 Kz', desc: 'Arroz arbóreo, mix de cogumelos selvagens e queijo parmesão.' },
    ],
    desserts: [
        { name: 'Mousse de Múcua', price: '4.500 Kz', desc: 'Creme leve e aerado da fruta sagrada de Angola.' },
        { name: 'Petit Gâteau', price: '5.500 Kz', desc: 'Bolo de chocolate quente com bola de gelado de baunilha.' },
    ],
    drinks: [
        { name: 'Caipirinha Premium', price: '4.000 Kz', desc: 'Cachaça envelhecida, açúcar mascavo, limão ou maracujá.' },
        { name: 'Vinhos (Garrafa)', price: 'A partir de 15.000 Kz', desc: 'Seleção especial de vinhos Portugueses e Sul-Africanos.' },
        { name: 'Sucos Naturais', price: '2.500 Kz', desc: 'Frutas da época: Múcua, Goiaba, Maracujá.' },
    ]
};

const Restaurant: React.FC = () => {
  const { addTableReservation } = useData();
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('mains');

  // Form State
  const [formData, setFormData] = useState({
      name: '', email: '', phone: '', date: '', time: '', guests: 2, specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await addTableReservation({
              ...formData,
              status: 'pending'
          });
          setSuccess(true);
          setTimeout(() => {
              setSuccess(false);
              setShowReservationModal(false);
              setFormData({ name: '', email: '', phone: '', date: '', time: '', guests: 2, specialRequests: '' });
          }, 3000);
      } catch (error) {
          alert('Erro ao realizar reserva. Tente novamente.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="pt-20 min-h-screen bg-stone-50">
       {/* Hero */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img src="https://picsum.photos/id/431/1920/1200" alt="Restaurant" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="text-center text-white px-4 border-2 border-white/20 p-12 backdrop-blur-sm animate-fade-in">
              <span className="block text-xs font-bold tracking-[0.4em] uppercase mb-4 text-secondary">Gastronomia</span>
              <h1 className="font-serif text-5xl md:text-7xl mb-4">Sabores da Terra</h1>
              <p className="font-light text-lg tracking-wide opacity-90 mb-8">Uma viagem culinária à beira-mar</p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={() => setShowReservationModal(true)}
                    className="bg-secondary text-primary hover:bg-white px-8 py-3 uppercase tracking-widest text-xs font-bold transition-all w-full md:w-auto"
                  >
                    Reservar Mesa
                  </button>
                  
                  <a 
                    href="https://drive.google.com/file/d/1cyeUjdXo3MEl0r1iAiWqvEzgXgYYdIA1/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-white text-white hover:bg-white hover:text-primary px-8 py-3 uppercase tracking-widest text-xs font-bold transition-all flex items-center justify-center space-x-2 w-full md:w-auto"
                  >
                    <Utensils className="w-4 h-4 mr-2" />
                    <span>Menu Comida</span>
                  </a>

                  <a 
                    href="https://drive.google.com/file/d/1d-TbVjdVCsIenHC5n4uQ4PYBAEVYG0km/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-white text-white hover:bg-white hover:text-primary px-8 py-3 uppercase tracking-widest text-xs font-bold transition-all flex items-center justify-center space-x-2 w-full md:w-auto"
                  >
                    <Wine className="w-4 h-4 mr-2" />
                    <span>Menu Bebidas</span>
                  </a>
              </div>
              
              <div className="mt-6">
                <button 
                    onClick={() => setShowMenuModal(true)}
                    className="text-white/70 hover:text-white text-xs underline uppercase tracking-wider"
                >
                    Ver Menu Digital (Interativo)
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="max-w-5xl mx-auto px-6 py-32">
         <div className="text-center mb-24">
            <h2 className="font-serif text-4xl text-primary mb-6">Menu de Degustação</h2>
            <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
              Ingredientes locais frescos, capturados diariamente no nosso mar e colhidos nas fazendas vizinhas, preparados com sofisticação internacional.
            </p>
            <div className="w-px h-16 bg-secondary mx-auto mt-10"></div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Pratos Destaque */}
            <div>
               <div className="flex items-center mb-10">
                  <span className="text-secondary text-4xl mr-4 font-serif italic">01.</span>
                  <h3 className="font-serif text-3xl text-primary">Favoritos do Chef</h3>
               </div>
               
               <div className="space-y-10">
                  {MENU_ITEMS.mains.slice(0, 3).map((item, idx) => (
                      <div className="group cursor-pointer" key={idx}>
                         <div className="flex justify-between items-baseline mb-2">
                            <h4 className="font-serif text-xl text-gray-800 group-hover:text-secondary transition-colors">{item.name}</h4>
                            <span className="font-sans text-sm font-bold text-primary">{item.price}</span>
                         </div>
                         <p className="text-gray-400 font-light text-sm italic">{item.desc}</p>
                      </div>
                  ))}
               </div>
            </div>

            {/* Bebidas Destaque */}
            <div>
               <div className="flex items-center mb-10">
                  <span className="text-secondary text-4xl mr-4 font-serif italic">02.</span>
                  <h3 className="font-serif text-3xl text-primary">Bar & Cocktails</h3>
               </div>
               
               <div className="space-y-10">
                  {MENU_ITEMS.drinks.map((item, idx) => (
                      <div className="group cursor-pointer" key={idx}>
                         <div className="flex justify-between items-baseline mb-2">
                            <h4 className="font-serif text-xl text-gray-800 group-hover:text-secondary transition-colors">{item.name}</h4>
                            <span className="font-sans text-sm font-bold text-primary">{item.price}</span>
                         </div>
                         <p className="text-gray-400 font-light text-sm italic">{item.desc}</p>
                      </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* --- MODAL DE RESERVA --- */}
      {showReservationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden relative">
                  <button onClick={() => setShowReservationModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-primary z-10"><X /></button>
                  
                  {success ? (
                      <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                          <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
                          <h3 className="text-2xl font-serif font-bold text-primary mb-2">Reserva Solicitada!</h3>
                          <p className="text-gray-500 text-sm">Recebemos o seu pedido. Entraremos em contacto em breve para confirmar a disponibilidade da mesa.</p>
                      </div>
                  ) : (
                      <>
                        <div className="bg-primary p-6 text-white text-center">
                            <h3 className="font-serif text-2xl mb-1">Reservar Mesa</h3>
                            <p className="text-white/60 text-xs uppercase tracking-widest">Garanta seu lugar ao sol</p>
                        </div>
                        <form onSubmit={handleReserveSubmit} className="p-6 space-y-4">
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Seus Dados</label>
                                <input type="text" name="name" required placeholder="Nome Completo" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-200 p-3 rounded text-sm focus:border-secondary outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="email" name="email" required placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-200 p-3 rounded text-sm focus:border-secondary outline-none" />
                                    <input type="tel" name="phone" required placeholder="Telefone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-200 p-3 rounded text-sm focus:border-secondary outline-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Detalhes da Reserva</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full border border-gray-200 pl-10 pr-3 py-3 rounded text-sm focus:border-secondary outline-none" />
                                    </div>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input type="time" name="time" required value={formData.time} onChange={handleInputChange} className="w-full border border-gray-200 pl-10 pr-3 py-3 rounded text-sm focus:border-secondary outline-none" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <select name="guests" value={formData.guests} onChange={handleInputChange} className="w-full border border-gray-200 pl-10 pr-3 py-3 rounded text-sm focus:border-secondary outline-none bg-white">
                                        {[1,2,3,4,5,6,7,8,9,10,12,15].map(num => (
                                            <option key={num} value={num}>{num} Pessoas</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <textarea 
                                        name="specialRequests" 
                                        placeholder="Observações especiais (Aniversário, Alergias...)" 
                                        value={formData.specialRequests} 
                                        onChange={handleInputChange} 
                                        rows={2}
                                        className="w-full border border-gray-200 pl-10 pr-3 py-3 rounded text-sm focus:border-secondary outline-none" 
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-secondary text-primary font-bold uppercase tracking-widest text-xs py-4 hover:bg-yellow-500 transition-colors">
                                {loading ? 'Enviando...' : 'Confirmar Reserva'}
                            </button>
                        </form>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* --- MODAL DO MENU DIGITAL --- */}
      {showMenuModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/95 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
              <div className="max-w-4xl w-full bg-white min-h-[80vh] rounded-lg overflow-hidden shadow-2xl flex flex-col">
                  {/* Header do Menu */}
                  <div className="bg-white p-6 md:p-8 flex justify-between items-center border-b border-gray-100 sticky top-0 z-10">
                      <div>
                          <h2 className="font-serif text-3xl text-primary">Menu Digital</h2>
                          <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Casa da Praia Resort</p>
                      </div>
                      <button onClick={() => setShowMenuModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <X className="w-6 h-6 text-gray-500" />
                      </button>
                  </div>

                  {/* Tabs de Categoria */}
                  <div className="flex overflow-x-auto bg-stone-50 border-b border-gray-200 px-6 no-scrollbar">
                      {MENU_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                whitespace-nowrap px-6 py-5 text-sm font-bold uppercase tracking-widest transition-all border-b-2
                                ${activeCategory === cat.id ? 'border-secondary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}
                            `}
                          >
                              {cat.name}
                          </button>
                      ))}
                  </div>

                  {/* Conteúdo do Menu */}
                  <div className="p-6 md:p-10 flex-grow bg-white overflow-y-auto">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 animate-fade-in">
                           {MENU_ITEMS[activeCategory]?.map((item, idx) => (
                               <div key={idx} className="flex flex-col border-b border-gray-100 pb-6 last:border-0">
                                   <div className="flex justify-between items-baseline mb-2">
                                       <h3 className="font-serif text-xl text-gray-800">{item.name}</h3>
                                       <span className="font-sans text-sm font-bold text-secondary whitespace-nowrap ml-4">{item.price}</span>
                                   </div>
                                   <p className="text-gray-500 font-light text-sm italic leading-relaxed">{item.desc}</p>
                               </div>
                           ))}
                       </div>
                  </div>

                  {/* Footer do Menu */}
                  <div className="p-6 bg-stone-50 border-t border-gray-200 text-center">
                      <p className="text-gray-400 text-xs">Todos os preços incluem IVA. Se tiver alergias alimentares, por favor informe o nosso staff.</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Restaurant;
