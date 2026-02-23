
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { EXTRA_MATTRESS } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Lock, Calendar as CalendarIcon, CreditCard, Copy, AlertCircle, ArrowRight, AlertTriangle, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Booking as BookingType } from '../types';
import SmartImage from '../components/SmartImageComp';

const BANK_ACCOUNTS = [
    { bank: "BFA", iban: "AO06.0006.0000.0127.2474.3013.6" },
    { bank: "BAI", iban: "AO06.0040.0000.3072.5958.1013.8" },
    { bank: "SOL", iban: "AO06.0044.0000.0004.0385.1010.3" }
];

const BENEFICIARY = "NDALA KYOZA - Empreendimentos, Lda";

const Booking: React.FC = () => {
  const { t } = useLanguage();
  const { rooms, activities, bookings, addBooking, getAvailableQuantity } = useData();
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
  });
  
  const [loading, setLoading] = useState(false);
  const [copiedIban, setCopiedIban] = useState<string | null>(null);

  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
  }, []);

  // Pre-fill user data if logged in
  useEffect(() => {
      if (user) {
          setFormData(prev => ({
              ...prev,
              email: user.email || '',
              name: user.user_metadata?.full_name || '',
              phone: user.user_metadata?.phone || prev.phone
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

  const copyToClipboard = (iban: string) => {
      navigator.clipboard.writeText(iban);
      setCopiedIban(iban);
      setTimeout(() => setCopiedIban(null), 2000);
  };

  // --- CALENDAR LOGIC START ---
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.setMonth(viewDate.getMonth() + offset));
    setViewDate(new Date(newDate));
  };

  const getDayStatus = (day: number) => {
    const targetDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    targetDate.setHours(12, 0, 0, 0); 
    const today = new Date();
    today.setHours(0,0,0,0);
    if (targetDate < today) return { status: 'past', available: 0 };

    let totalCapacity = 0;
    let totalBooked = 0;

    const roomsToCheck = formData.roomId 
        ? rooms.filter(r => r.id === formData.roomId) 
        : rooms;

    roomsToCheck.forEach(room => {
        totalCapacity += (room.quantity || 0);
        const roomBookings = bookings.filter(b => 
            b.roomId === room.id && 
            b.status !== 'cancelled' &&
            new Date(b.checkIn) <= targetDate && 
            new Date(b.checkOut) > targetDate
        );
        totalBooked += roomBookings.length;
    });

    const available = totalCapacity - totalBooked;

    if (available <= 0) return { status: 'full', available: 0 };
    if (available <= 2) return { status: 'low', available };
    return { status: 'open', available };
  };

  const handleDateClick = (day: number, status: string) => {
    if (status === 'full' || status === 'past') return;

    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = selectedDate.toISOString().split('T')[0];

    if (!formData.checkIn || (formData.checkIn && formData.checkOut)) {
        setFormData(prev => ({ ...prev, checkIn: dateStr, checkOut: '' }));
    } else if (formData.checkIn && !formData.checkOut) {
        if (new Date(dateStr) > new Date(formData.checkIn)) {
             setFormData(prev => ({ ...prev, checkOut: dateStr }));
        } else {
             setFormData(prev => ({ ...prev, checkIn: dateStr, checkOut: '' }));
        }
    }
  };

  const isSelected = (day: number) => {
      const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const str = current.toISOString().split('T')[0];
      
      if (formData.checkIn === str) return 'start';
      if (formData.checkOut === str) return 'end';
      
      if (formData.checkIn && formData.checkOut) {
          if (current > new Date(formData.checkIn) && current < new Date(formData.checkOut)) return 'middle';
      }
      return null;
  };
  // --- CALENDAR LOGIC END ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    const availableQty = getAvailableQuantity(formData.roomId, formData.checkIn, formData.checkOut);
    if (availableQty !== -1 && availableQty <= 0) {
          alert("Desculpe, este quarto acabou de ser reservado para estas datas.");
          return;
    }

    setLoading(true);
    try {
        const total = calculateTotal();
        const newBooking: Omit<BookingType, 'id' | 'createdAt'> = {
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
            totalAmount: total,
            status: 'pending', // Sempre pendente até o upload
            paymentMethod: 'transfer',
        };
        
        await addBooking(newBooking);

        // Redireciona para o perfil com mensagem de sucesso
        navigate('/profile?new=true');

    } catch (error: any) {
        console.error("Booking error:", error);
        alert("Erro ao criar reserva: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  if (authLoading) {
    return (
        <div className="min-h-screen pt-24 flex items-center justify-center bg-light">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

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
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-primary mb-8 text-center">Faça sua Reserva</h1>
        
        {/* Stepper */}
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
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-md relative">
              
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-bold border-b pb-2 mb-4 flex justify-between items-center">
                      <span>Datas e Acomodação</span>
                  </h2>

                  {/* --- CALENDÁRIO VISUAL --- */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                          <button type="button" onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-200 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                          <span className="font-bold text-lg capitalize">{viewDate.toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' })}</span>
                          <button type="button" onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-200 rounded-full"><ChevronRight className="w-5 h-5" /></button>
                      </div>
                      
                      <div className="mb-2 flex gap-4 text-xs justify-center flex-wrap">
                          <div className="flex items-center"><div className="w-3 h-3 bg-white border mr-1 rounded"></div> Disponível</div>
                          <div className="flex items-center"><div className="w-3 h-3 bg-orange-100 border border-orange-200 mr-1 rounded"></div> Poucas Vagas</div>
                          <div className="flex items-center"><div className="w-3 h-3 bg-red-100 mr-1 rounded"></div> Esgotado</div>
                          <div className="flex items-center"><div className="w-3 h-3 bg-primary mr-1 rounded"></div> Sua Seleção</div>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>)}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: getFirstDayOfMonth(viewDate) }).map((_, i) => <div key={`empty-${i}`} />)}
                          
                          {Array.from({ length: getDaysInMonth(viewDate) }).map((_, i) => {
                              const day = i + 1;
                              const { status, available } = getDayStatus(day);
                              const selection = isSelected(day);
                              
                              let bgClass = "bg-white hover:bg-gray-100 cursor-pointer";
                              if (status === 'full') bgClass = "bg-red-50 text-red-300 cursor-not-allowed";
                              if (status === 'past') bgClass = "bg-gray-100 text-gray-300 cursor-not-allowed";
                              if (status === 'low') bgClass = "bg-orange-50 hover:bg-orange-100 cursor-pointer text-orange-800 font-medium";

                              if (selection === 'start') bgClass = "bg-primary text-white rounded-l-full hover:bg-primary";
                              if (selection === 'end') bgClass = "bg-primary text-white rounded-r-full hover:bg-primary";
                              if (selection === 'middle') bgClass = "bg-primary/20 text-primary hover:bg-primary/30";

                              return (
                                  <div 
                                    key={day} 
                                    onClick={() => handleDateClick(day, status)}
                                    className={`h-10 flex flex-col items-center justify-center text-sm rounded-sm transition-colors relative group ${bgClass}`}
                                  >
                                      <span>{day}</span>
                                      {status !== 'past' && status !== 'full' && !selection && (
                                          <span className="text-[9px] leading-none opacity-0 group-hover:opacity-100 absolute -bottom-4 bg-black text-white px-1 rounded z-10 whitespace-nowrap">
                                              {available} livres
                                          </span>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                      <p className="text-xs text-center mt-3 text-gray-500 italic">
                          {formData.roomId ? `Mostrando disponibilidade para: ${rooms.find(r => r.id === formData.roomId)?.name}` : 'Mostrando disponibilidade geral. Selecione um quarto abaixo para filtrar.'}
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                      <div className="relative">
                          <input 
                            type="date" 
                            name="checkIn"
                            required
                            readOnly
                            value={formData.checkIn}
                            className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 cursor-not-allowed"
                          />
                          <CalendarIcon className="absolute right-2 top-2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                       <div className="relative">
                          <input 
                            type="date" 
                            name="checkOut"
                            required
                            readOnly
                            value={formData.checkOut}
                            className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 cursor-not-allowed"
                          />
                          <CalendarIcon className="absolute right-2 top-2 w-5 h-5 text-gray-400" />
                      </div>
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
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Escolha a Suite</label>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-1">
                      {rooms.map(room => {
                        let availableQty = 0;
                        let isSoldOut = false;
                        
                        if (formData.checkIn && formData.checkOut) {
                            availableQty = getAvailableQuantity(room.id, formData.checkIn, formData.checkOut);
                            isSoldOut = availableQty <= 0;
                        }

                        const datesSelected = !!formData.checkIn && !!formData.checkOut;
                        const disabled = (datesSelected && isSoldOut) || !room.available;

                        return (
                          <div 
                            key={room.id}
                            onClick={() => {
                                if(!disabled) {
                                    setFormData({...formData, roomId: room.id});
                                }
                            }}
                            className={`
                                border rounded-lg p-4 flex justify-between items-center transition-all relative overflow-hidden group
                                ${disabled ? 'opacity-60 bg-gray-100 cursor-not-allowed grayscale' : 'cursor-pointer hover:border-primary'}
                                ${formData.roomId === room.id && !disabled ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}
                            `}
                          >
                            {/* Overlay de Esgotado */}
                            {disabled && datesSelected && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                                    <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest transform -rotate-12 shadow-lg">
                                        Esgotado nas Datas
                                    </span>
                                </div>
                            )}

                            {/* Conteúdo do Card */}
                            <div className="flex items-center space-x-4">
                               <SmartImage 
                                 src={room.image} 
                                 alt={room.name} 
                                 className="w-16 h-16 object-cover rounded"
                               />
                               <div>
                                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                     {room.name}
                                     {formData.roomId === room.id && <CheckCircle className="w-4 h-4 text-primary" />}
                                 </h3>
                                 <p className="text-sm text-gray-500 mb-1">{room.capacity} Pessoas • {room.features[0]}</p>
                                 
                                 {datesSelected && !disabled && availableQty <= 3 && (
                                     <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full flex items-center w-fit animate-pulse">
                                         Restam apenas {availableQty}!
                                     </span>
                                 )}
                                 {!datesSelected && <span className="text-xs text-blue-500">Selecione datas para ver disponibilidade</span>}
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="font-bold text-primary">{room.price.toLocaleString('pt-AO')} Kz</p>
                               <p className="text-xs text-gray-500">/ noite</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex flex-col-reverse gap-4 md:flex-row md:justify-end pt-4">
                    <button 
                      type="button"
                      disabled={!formData.checkIn || !formData.checkOut || !formData.roomId}
                      onClick={() => setStep(2)}
                      className="w-full md:w-auto bg-primary text-white px-6 py-2 rounded-sm font-bold uppercase disabled:opacity-50 hover:bg-primary/90"
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
                              disabled={!!user} 
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

                   <div className="flex flex-col-reverse gap-4 md:flex-row md:justify-between pt-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full md:w-auto text-gray-600 hover:text-primary font-medium py-2"
                    >
                      Voltar
                    </button>
                    <button 
                      type="button"
                      disabled={!formData.name || !formData.email || !formData.phone}
                      onClick={() => setStep(3)}
                      className="w-full md:w-auto bg-primary text-white px-6 py-2 rounded-sm font-bold uppercase disabled:opacity-50 hover:bg-primary/90"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-bold border-b pb-2 mb-4">Pagamento & Confirmação</h2>
                  
                  {/* DADOS BANCÁRIOS APENAS */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 animate-fade-in shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-6 h-6 text-primary" />
                            <h3 className="text-xl font-bold font-serif text-gray-800">Transferência Bancária</h3>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-6">
                            Para confirmar a sua reserva, por favor efetue a transferência de <strong>50% do valor</strong> para a conta abaixo e anexe o comprovativo.
                        </p>

                        <div className="bg-white p-4 rounded border border-gray-200 mb-6">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Beneficiário</p>
                            <p className="font-bold text-gray-800 mb-4">{BENEFICIARY}</p>
                            
                            <div className="space-y-4">
                                {BANK_ACCOUNTS.map((account, index) => (
                                    <div key={index} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{account.bank}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm md:text-base tracking-wider text-primary font-bold break-all">{account.iban}</span>
                                            <button 
                                                type="button"
                                                onClick={() => copyToClipboard(account.iban)}
                                                className="text-gray-400 hover:text-primary transition-colors flex-shrink-0 ml-2"
                                                title="Copiar IBAN"
                                            >
                                                {copiedIban === account.iban ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded text-blue-800 text-sm">
                            <Upload className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold block mb-1">Passo Importante:</span>
                                Após clicar em "Finalizar Pedido", você será redirecionado para suas reservas. 
                                Lá, utilize o botão <strong>"Anexar Comprovativo"</strong> para enviar a foto ou PDF da transferência.
                                <br/>
                                <span className="text-xs mt-1 block opacity-80">* Sua reserva ficará pendente até o envio do anexo.</span>
                            </div>
                        </div>
                  </div>

                  <div className="flex flex-col-reverse gap-4 md:flex-row md:justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setStep(2)}
                      className="w-full md:w-auto text-gray-600 hover:text-primary font-medium py-2"
                      disabled={loading}
                    >
                      Voltar
                    </button>
                    
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full md:w-auto px-8 py-3 rounded-sm font-bold uppercase transition-colors flex items-center justify-center space-x-2 bg-secondary hover:bg-yellow-500 text-primary"
                    >
                      {loading ? <span>Processando...</span> : <span>Finalizar Pedido</span>}
                      {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
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
