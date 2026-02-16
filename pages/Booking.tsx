import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { EXTRA_MATTRESS } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, CreditCard, Lock } from 'lucide-react';
import { Booking as BookingType } from '../types';

const Booking: React.FC = () => {
  const { t } = useLanguage();
  const { rooms, activities, addBooking } = useData();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedRoomId = searchParams.get('room');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    roomId: preSelectedRoomId || '',
    activities: [] as string[],
    extraMattressChild: 0,
    extraMattressAdult: 0,
    paymentMethod: 'transfer',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Pre-fill user data if logged in
  useEffect(() => {
      if (user) {
          setFormData(prev => ({
              ...prev,
              email: user.email || '',
              name: user.user_metadata?.full_name || ''
          }));
      }
  }, [user]);

  const selectedRoom = rooms.find(r => r.id === formData.roomId);
  
  const getDays = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const calculateTotal = () => {
    const days = getDays();
    let total = 0;
    if (selectedRoom) {
      total += selectedRoom.price * days;
    }
    formData.activities.forEach(actId => {
      const activity = activities.find(a => a.id === actId);
      if (activity) total += activity.price;
    });
    total += (formData.extraMattressChild * EXTRA_MATTRESS.child * days);
    total += (formData.extraMattressAdult * EXTRA_MATTRESS.adult * days);
    return total;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleActivityToggle = (id: string) => {
    setFormData(prev => {
      const exists = prev.activities.includes(id);
      if (exists) return { ...prev, activities: prev.activities.filter(a => a !== id) };
      return { ...prev, activities: [...prev.activities, id] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newBooking: BookingType = {
      id: Date.now().toString(),
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: {
        adults: Number(formData.adults),
        children: Number(formData.children)
      },
      roomId: formData.roomId,
      activities: formData.activities,
      totalAmount: calculateTotal(),
      status: 'pending',
      paymentMethod: formData.paymentMethod as 'multicaixa' | 'card' | 'transfer',
      createdAt: new Date().toISOString(),
    };
    
    try {
      await addBooking(newBooking);
      setSuccess(true);
    } catch (error: any) {
      console.error("Booking error:", error);
      alert("Ocorreu um erro ao processar sua reserva. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading State for Auth
  if (authLoading) {
    return (
        <div className="min-h-screen pt-24 flex items-center justify-center bg-light">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  // 2. Block access if not logged in
  if (!user) {
    return (
        <div className="min-h-screen pt-24 pb-20 bg-light flex flex-col items-center justify-center px-4">
            <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-md w-full border-t-4 border-secondary animate-fade-in">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                    <Lock className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-3xl font-bold text-primary mb-4">Acesso Reservado</h2>
                <p className="text-gray-500 mb-8 font-light leading-relaxed">
                    Para garantir a segurança e a gestão da sua reserva na <strong>Casa da Praia</strong>, é necessário iniciar sessão.
                </p>
                <div className="space-y-4">
                    <Link 
                        to="/login" 
                        state={{ from: location.pathname + location.search }}
                        className="flex items-center justify-center w-full bg-primary text-white py-4 rounded-sm uppercase tracking-[0.2em] text-xs font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        <span>Entrar na minha conta</span>
                    </Link>
                    <Link 
                        to="/register" 
                        state={{ from: location.pathname + location.search }}
                        className="flex items-center justify-center w-full border border-primary text-primary py-4 rounded-sm uppercase tracking-[0.2em] text-xs font-bold hover:bg-primary hover:text-white transition-all"
                    >
                        Criar nova conta
                    </Link>
                </div>
                <p className="mt-6 text-xs text-gray-400">
                    Ainda não tem conta? O registo leva menos de 1 minuto.
                </p>
            </div>
        </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pt-24 bg-light flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-primary mb-2">{t('successTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('successMsg')}</p>
          <div className="bg-gray-50 p-4 rounded text-left mb-6 text-sm text-gray-700">
             <p><strong>Referência:</strong> #{Date.now().toString().slice(-6)}</p>
             <p><strong>Total:</strong> {calculateTotal().toLocaleString('pt-AO')} Kz</p>
             <p className="mt-2 text-xs text-gray-500">* Por favor, verifique seu email para instruções de pagamento.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-primary text-white py-3 rounded-sm font-bold uppercase hover:bg-secondary hover:text-primary transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-primary mb-8 text-center">Faça sua Reserva</h1>
        
        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`h-1 w-12 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-md">
              
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-bold border-b pb-2 mb-4">Datas e Acomodação</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                      <input 
                        type="date" 
                        name="checkIn"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                      <input 
                        type="date" 
                        name="checkOut"
                        required
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Adultos</label>
                       <select name="adults" value={formData.adults} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                         {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Crianças</label>
                       <select name="children" value={formData.children} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                         {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                       </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Escolha a Suite</label>
                    <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                      {rooms.map(room => (
                        <div 
                          key={room.id}
                          onClick={() => setFormData({...formData, roomId: room.id})}
                          className={`border rounded-lg p-4 cursor-pointer flex justify-between items-center transition-all ${formData.roomId === room.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-gray-400'}`}
                        >
                          <div className="flex items-center space-x-4">
                             <img src={room.image} alt={room.name} className="w-16 h-16 object-cover rounded" />
                             <div>
                               <h3 className="font-bold text-gray-900">{room.name}</h3>
                               <p className="text-sm text-gray-500">{room.capacity} Pessoas • {room.features[0]}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="font-bold text-primary">{room.price.toLocaleString('pt-AO')} Kz</p>
                             <p className="text-xs text-gray-500">/ noite</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button 
                      type="button"
                      disabled={!formData.checkIn || !formData.checkOut || !formData.roomId}
                      onClick={() => setStep(2)}
                      className="bg-primary text-white px-6 py-2 rounded-sm font-bold uppercase disabled:opacity-50 hover:bg-primary/90"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                   <h2 className="text-xl font-bold border-b pb-2 mb-4">Detalhes e Extras</h2>
                   
                   <div>
                     <h3 className="font-semibold mb-3">Atividades e Serviços Adicionais</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {activities.map(act => (
                         <label key={act.id} className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                           <input 
                             type="checkbox" 
                             checked={formData.activities.includes(act.id)}
                             onChange={() => handleActivityToggle(act.id)}
                             className="rounded text-primary focus:ring-primary h-4 w-4"
                           />
                           <div className="flex-1">
                             <span className="block text-sm font-medium">{act.name}</span>
                             <span className="block text-xs text-gray-500">
                               {act.price === 0 ? 'Gratuito' : `${act.price.toLocaleString('pt-AO')} Kz`}
                             </span>
                           </div>
                         </label>
                       ))}
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Colchão Extra (Criança)</label>
                        <select 
                          name="extraMattressChild" 
                          value={formData.extraMattressChild}
                          onChange={(e) => setFormData({...formData, extraMattressChild: Number(e.target.value)})} 
                          className="w-full border border-gray-300 rounded-md p-2"
                        >
                          {[0,1,2].map(n => <option key={n} value={n}>{n} ({ (n * EXTRA_MATTRESS.child).toLocaleString() } Kz)</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Colchão Extra (Adulto)</label>
                        <select 
                           name="extraMattressAdult" 
                           value={formData.extraMattressAdult}
                           onChange={(e) => setFormData({...formData, extraMattressAdult: Number(e.target.value)})}
                           className="w-full border border-gray-300 rounded-md p-2"
                        >
                          {[0,1,2].map(n => <option key={n} value={n}>{n} ({ (n * EXTRA_MATTRESS.adult).toLocaleString() } Kz)</option>)}
                        </select>
                      </div>
                   </div>

                   <div>
                      <h3 className="font-semibold mb-3 mt-4">Dados do Hóspede</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <input 
                          type="text" 
                          name="name" 
                          placeholder="Nome Completo" 
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md p-2"
                          required 
                        />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                              type="email" 
                              name="email" 
                              placeholder="Email" 
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 rounded-md p-2"
                              required 
                              disabled={!!user} // Disable editing if auto-filled from login
                            />
                            <input 
                              type="tel" 
                              name="phone" 
                              placeholder="Telefone / WhatsApp" 
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 rounded-md p-2"
                              required 
                            />
                         </div>
                      </div>
                   </div>

                   <div className="flex justify-between pt-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-600 hover:text-primary font-medium"
                    >
                      Voltar
                    </button>
                    <button 
                      type="button"
                      disabled={!formData.name || !formData.email || !formData.phone}
                      onClick={() => setStep(3)}
                      className="bg-primary text-white px-6 py-2 rounded-sm font-bold uppercase disabled:opacity-50 hover:bg-primary/90"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-bold border-b pb-2 mb-4">Pagamento</h2>
                  <div className="space-y-3">
                     <label className="flex items-center space-x-3 p-4 border rounded cursor-pointer hover:bg-gray-50">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="transfer" 
                          checked={formData.paymentMethod === 'transfer'}
                          onChange={handleInputChange}
                          className="text-primary focus:ring-primary h-5 w-5"
                        />
                        <div className="flex items-center space-x-4 w-full">
                          <CreditCard className="w-6 h-6 text-gray-500" />
                          <div>
                            <span className="block font-bold">Transferência Bancária / Depósito</span>
                            <span className="block text-xs text-gray-500">Envie o comprovativo após a reserva.</span>
                          </div>
                        </div>
                     </label>
                     <label className="flex items-center space-x-3 p-4 border rounded cursor-pointer hover:bg-gray-50">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="multicaixa" 
                          checked={formData.paymentMethod === 'multicaixa'}
                          onChange={handleInputChange}
                          className="text-primary focus:ring-primary h-5 w-5"
                        />
                        <div className="flex items-center space-x-4 w-full">
                          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">MC</div>
                          <div>
                            <span className="block font-bold">Pagamento por Referência (Multicaixa)</span>
                            <span className="block text-xs text-gray-500">Pague em qualquer ATM ou Internet Banking.</span>
                          </div>
                        </div>
                     </label>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800">
                    <p><strong>Atenção:</strong> A reserva só será confirmada após a validação do pagamento de 50% do valor total.</p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setStep(2)}
                      className="text-gray-600 hover:text-primary font-medium"
                      disabled={loading}
                    >
                      Voltar
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="bg-secondary text-primary px-8 py-3 rounded-sm font-bold uppercase hover:bg-yellow-500 transition-colors flex items-center space-x-2"
                    >
                      {loading ? <span>Processando...</span> : <span>Confirmar Reserva</span>}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24 border-t-4 border-secondary">
              <h3 className="font-serif text-xl font-bold text-primary mb-4">Resumo</h3>
              {selectedRoom ? (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{formData.checkIn || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{formData.checkOut || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Noites:</span>
                    <span className="font-medium">{getDays()}</span>
                  </div>
                  <div className="py-2">
                    <p className="font-bold text-gray-900">{selectedRoom.name}</p>
                    <p className="text-xs text-gray-500">{selectedRoom.price.toLocaleString()} Kz x {getDays()} noites</p>
                  </div>
                  {formData.activities.length > 0 && (
                     <div className="border-t pt-2">
                       <p className="font-bold text-gray-900 text-xs mb-1">Extras:</p>
                       {formData.activities.map(id => {
                         const act = activities.find(a => a.id === id);
                         return act ? (
                           <div key={id} className="flex justify-between text-xs text-gray-600">
                              <span>{act.name}</span>
                              <span>{act.price === 0 ? 'Gratuito' : act.price.toLocaleString()}</span>
                           </div>
                         ) : null;
                       })}
                     </div>
                  )}
                   {(formData.extraMattressChild > 0 || formData.extraMattressAdult > 0) && (
                      <div className="border-t pt-2 text-xs text-gray-600">
                        {formData.extraMattressChild > 0 && (
                          <div className="flex justify-between">
                            <span>Colchão (Criança) x{formData.extraMattressChild}</span>
                            <span>{(formData.extraMattressChild * EXTRA_MATTRESS.child * getDays()).toLocaleString()}</span>
                          </div>
                        )}
                        {formData.extraMattressAdult > 0 && (
                          <div className="flex justify-between">
                            <span>Colchão (Adulto) x{formData.extraMattressAdult}</span>
                            <span>{(formData.extraMattressAdult * EXTRA_MATTRESS.adult * getDays()).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                   )}
                  <div className="border-t border-gray-300 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-primary">Total:</span>
                      <span className="font-bold text-2xl text-secondary">{calculateTotal().toLocaleString('pt-AO')} Kz</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Selecione uma acomodação para ver o resumo.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;