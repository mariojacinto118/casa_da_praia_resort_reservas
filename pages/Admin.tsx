
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Mail, Calendar, Bed, LogIn, MessageSquare, Send, User, Check, X, FileText, ChevronLeft, ChevronRight, Phone, CreditCard, Trash2, Plus, Eye, ExternalLink, Download, Search, Filter, TrendingUp, Users, DollarSign, Clock, Utensils, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChatMessage, Booking } from '../types';
import { supabase } from '../supabase';
import { ADMIN_EMAILS, SUPER_ADMIN_EMAILS } from '../constants';

const Admin: React.FC = () => {
  const { bookings, rooms, updateRoom, contactMessages, fetchMessages, sendChatMessage, updateBookingStatus, addBooking, tableReservations, fetchTableReservations, updateTableReservationStatus, refreshBookings } = useData();
  const { user } = useAuth();
  
  // Verificação de Admin e Super Admin
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);
  const isSuperAdmin = user && user.email && SUPER_ADMIN_EMAILS.includes(user.email);

  // Tabs & Navigation com Persistência na URL
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') as 'bookings' | 'calendar' | 'rooms' | 'messages' | 'livechat' | 'restaurant' | null;
  const activeTab = activeTabParam || 'bookings';

  const setActiveTab = (tab: string) => {
      setSearchParams({ tab });
  };
  
  
  // Filtros Avançados
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Estados Operacionais
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados do Chat
  const [allChatMessages, setAllChatMessages] = useState<ChatMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [adminInputText, setAdminInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Estados do Calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manualBooking, setManualBooking] = useState({
      roomId: '',
      roomName: '',
      checkIn: '',
      checkOut: '',
      customerName: '',
      phone: '',
      email: '',
      notes: ''
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Carregar dados conforme a aba
  useEffect(() => {
    if (activeTab === 'messages' && user) fetchMessages();
    if (activeTab === 'restaurant' && user) fetchTableReservations();
    if (activeTab === 'bookings' && user) refreshBookings(); // Garante atualização ao entrar na aba
    if (activeTab === 'livechat' && user) {
        fetchLiveChats();
        const channel = supabase
            .channel('chat_room_admin')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'live_chat' }, 
                (payload) => {
                    const newMsg = payload.new as ChatMessage;
                    setAllChatMessages(prev => {
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }
  }, [activeTab, user]);

  useEffect(() => {
      if (activeTab === 'livechat' && selectedSessionId) {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [allChatMessages, selectedSessionId, activeTab]);

  const fetchLiveChats = async () => {
      const { data } = await supabase.from('live_chat').select('*').order('created_at', { ascending: true });
      if (data) setAllChatMessages(data);
  };

  const handleManualRefresh = async () => {
      setIsRefreshing(true);
      if (activeTab === 'bookings' || activeTab === 'calendar') await refreshBookings();
      if (activeTab === 'restaurant') await fetchTableReservations();
      if (activeTab === 'messages') await fetchMessages();
      setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAdminSendChat = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminInputText.trim() || !selectedSessionId) return;
      const text = adminInputText;
      setAdminInputText(''); 
      const newMsg = await sendChatMessage(text, true, selectedSessionId);
      if (newMsg) {
          setAllChatMessages(prev => [...prev, newMsg]);
      } else {
          setAdminInputText(text);
          alert("Erro ao enviar.");
      }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
      setProcessingId(id);
      try {
          await updateBookingStatus(id, newStatus as Booking['status']);
          if (showViewModal) setShowViewModal(false);
      } catch (error) {
          alert("Erro ao atualizar status");
      } finally {
          setProcessingId(null);
      }
  };

  const handleTableStatusUpdate = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
      setProcessingId(id);
      try {
          await updateTableReservationStatus(id, newStatus);
      } catch (error) {
          alert("Erro ao atualizar status da mesa");
      } finally {
          setProcessingId(null);
      }
  };

  const handlePriceChange = (roomId: string, newPrice: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) updateRoom({ ...room, price: Number(newPrice) });
  };
  
  const handleQuantityChange = (roomId: string, newQty: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) updateRoom({ ...room, quantity: Number(newQty) });
  };

  const handleViewReceipt = (url: string) => {
    if (url.toLowerCase().includes('.pdf')) window.open(url, '_blank');
    else setPreviewImage(url);
  };

  const handleDownloadReceipt = async (url: string, customerName: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const isPdf = url.toLowerCase().includes('.pdf');
        const ext = isPdf ? 'pdf' : 'jpg';
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `Comprovativo_${customerName.replace(/\s+/g, '_')}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
        window.open(url, '_blank');
    }
  };

  // --- Lógica do Calendário ---
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const changeMonth = (offset: number) => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + offset)));

  const isBooked = (roomId: string, day: number) => {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0, 0); 
      return bookings.find(b => {
          if (b.roomId !== roomId || b.status === 'cancelled') return false;
          const checkIn = new Date(b.checkIn); checkIn.setHours(0,0,0,0);
          const checkOut = new Date(b.checkOut); checkOut.setHours(0,0,0,0); 
          const current = new Date(targetDate); current.setHours(0,0,0,0);
          return current >= checkIn && current < checkOut;
      });
  };

  const handleCellClick = (room: typeof rooms[0], day: number, existingBooking?: Booking) => {
      if (existingBooking) {
          setSelectedBooking(existingBooking);
          setShowViewModal(true);
      } else {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0);
          const checkInStr = date.toISOString().split('T')[0];
          const nextDay = new Date(date); nextDay.setDate(date.getDate() + 1);
          const checkOutStr = nextDay.toISOString().split('T')[0];
          setManualBooking({
              roomId: room.id, roomName: room.name, checkIn: checkInStr, checkOut: checkOutStr,
              customerName: '', phone: '', email: '', notes: ''
          });
          setShowCreateModal(true);
      }
  };

  const submitManualBooking = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await addBooking({
              customerName: manualBooking.customerName || 'Bloqueio Admin',
              email: manualBooking.email || 'admin@sistema.local',
              phone: manualBooking.phone || '000000000',
              checkIn: manualBooking.checkIn,
              checkOut: manualBooking.checkOut,
              guests: { adults: 1, children: 0 }, 
              roomId: manualBooking.roomId,
              activities: [],
              totalAmount: 0, status: 'confirmed', paymentMethod: 'manual'
          });
          setShowCreateModal(false);
          alert('Criado com sucesso!');
      } catch (err: any) {
          alert('Erro: ' + err.message);
      }
  };

  const groupedSessions = useMemo(() => {
      const sessions: Record<string, ChatMessage[]> = {};
      allChatMessages.forEach(msg => {
          if (!sessions[msg.session_id]) sessions[msg.session_id] = [];
          sessions[msg.session_id].push(msg);
      });
      return Object.entries(sessions).sort(([, msgsA], [, msgsB]) => {
          return new Date(msgsB[msgsB.length - 1].created_at).getTime() - new Date(msgsA[msgsA.length - 1].created_at).getTime();
      });
  }, [allChatMessages]);

  // --- CÁLCULO DE RECEITA TOTAL ---
  const totalRevenue = useMemo(() => {
      return bookings
          .filter(b => b.status === 'confirmed' || b.status === 'completed')
          .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  }, [bookings]);

  // --- FILTRAGEM AVANÇADA DE RESERVAS ---
  const filteredBookings = useMemo(() => {
      return bookings.filter(b => {
          // Filtro de Status
          const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
          
          // Filtro de Texto (Nome, Email, ID)
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = 
              b.customerName.toLowerCase().includes(searchLower) ||
              b.email.toLowerCase().includes(searchLower) ||
              b.phone.includes(searchTerm) ||
              b.id.toLowerCase().includes(searchLower);

          // Filtro de Data (Intervalo)
          let matchesDate = true;
          if (dateStart) {
              matchesDate = matchesDate && new Date(b.checkIn) >= new Date(dateStart);
          }
          if (dateEnd) {
              matchesDate = matchesDate && new Date(b.checkIn) <= new Date(dateEnd);
          }

          return matchesStatus && matchesSearch && matchesDate;
      }).sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
  }, [bookings, statusFilter, searchTerm, dateStart, dateEnd]);

  // Verificação de Admin
  if (!isAdmin) {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-8 rounded shadow text-center border-t-4 border-red-500">
                 <h2 className="text-2xl font-serif font-bold text-primary mb-2">Acesso Restrito</h2>
                 <Link to="/" className="text-secondary hover:underline">Voltar ao Início</Link>
             </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-gray-800 font-sans">
      {/* HEADER FIXO */}
      <header className="bg-primary text-white pt-24 pb-8 px-6 shadow-lg">
        <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Painel de Controle</h1>
                    <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Sistema Operacional • {new Date().toLocaleDateString('pt-AO')}
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-0 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <div className="px-4 border-r border-white/20">
                        <span className="block text-xs uppercase tracking-wider text-white/60">Total Vendas</span>
                        <span className="text-xl font-bold text-emerald-400">
                            {totalRevenue.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                        </span>
                    </div>
                    <div className="px-4 border-r border-white/20">
                        <span className="block text-xs uppercase tracking-wider text-white/60">Reservas Hoje</span>
                        <span className="text-xl font-bold">{bookings.filter(b => b.checkIn === new Date().toISOString().split('T')[0]).length}</span>
                    </div>
                     <div className="px-4 border-r border-white/20">
                        <span className="block text-xs uppercase tracking-wider text-white/60">Ocupação</span>
                        <span className="text-xl font-bold">
                            {Math.round((bookings.filter(b => {
                                const today = new Date();
                                return new Date(b.checkIn) <= today && new Date(b.checkOut) > today && b.status !== 'cancelled';
                            }).length / (rooms.reduce((acc, r) => acc + (r.quantity || 0), 0) || 1)) * 100)}%
                        </span>
                    </div>
                    <div className="px-4">
                        <span className="block text-xs uppercase tracking-wider text-white/60">Pendentes</span>
                        <span className="text-xl font-bold text-yellow-400">{bookings.filter(b => b.status === 'pending').length}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 mt-8 overflow-x-auto no-scrollbar">
                 {[
                    { id: 'bookings', label: 'Gestão de Reservas', icon: Calendar },
                    { id: 'calendar', label: 'Mapa de Ocupação', icon: Bed },
                    // Mostra aba de quartos apenas para Super Admin
                    ...(isSuperAdmin ? [{ id: 'rooms', label: 'Config. Quartos', icon: FileText }] : []),
                    { id: 'restaurant', label: 'Restaurante', icon: Utensils },
                    { id: 'messages', label: 'Mensagens', icon: Mail },
                    { id: 'livechat', label: 'Chat Ao Vivo', icon: MessageSquare },
                 ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            flex items-center space-x-2 px-6 py-3 rounded-t-lg transition-all text-sm font-medium whitespace-nowrap
                            ${activeTab === tab.id 
                                ? 'bg-stone-50 text-primary border-t-2 border-secondary' 
                                : 'text-white/60 hover:text-white hover:bg-white/5'}
                        `}
                     >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                     </button>
                 ))}
            </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-8">
        
        {/* --- BOOKINGS TAB --- */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
             {/* Filtros e Barra de Ação */}
             <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1 ml-1">Buscar</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Nome, Email ou ID..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1 ml-1">De</label>
                        <input 
                            type="date" 
                            value={dateStart}
                            onChange={e => setDateStart(e.target.value)}
                            className="w-full px-3 py-2 border border-stone-200 rounded focus:border-primary outline-none text-stone-600"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1 ml-1">Até</label>
                        <input 
                            type="date" 
                            value={dateEnd}
                            onChange={e => setDateEnd(e.target.value)}
                            className="w-full px-3 py-2 border border-stone-200 rounded focus:border-primary outline-none text-stone-600"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                         {['all', 'pending', 'confirmed', 'cancelled'].map(st => (
                             <button 
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-4 py-2 rounded text-sm capitalize font-medium transition-colors border ${
                                    statusFilter === st 
                                    ? (st === 'all' ? 'bg-primary text-white border-primary' : st === 'pending' ? 'bg-yellow-500 text-white border-yellow-500' : st === 'confirmed' ? 'bg-green-600 text-white border-green-600' : 'bg-red-500 text-white border-red-500')
                                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                                }`}
                             >
                                 {st === 'all' ? 'Todos' : st === 'pending' ? 'Pendentes' : st === 'confirmed' ? 'Confirmados' : 'Cancelados'}
                             </button>
                         ))}
                    </div>

                    <button 
                        onClick={() => handleManualRefresh()}
                        className={`p-2 text-secondary hover:text-primary transition-colors border border-gray-200 rounded ${isRefreshing ? 'animate-spin' : ''}`}
                        title="Atualizar Dados"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>

                    <button 
                        onClick={() => {setSearchTerm(''); setDateStart(''); setDateEnd(''); setStatusFilter('all')}}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                        title="Limpar Filtros"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
             </div>

             {/* Tabela de Resultados */}
             <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-stone-50 border-b border-stone-200 text-xs uppercase text-stone-500 font-bold tracking-wider">
                                <th className="p-4">Hóspede</th>
                                <th className="p-4">Quarto & Detalhes</th>
                                <th className="p-4">Data & Valor</th>
                                <th className="p-4">Comprovativo</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-stone-400">
                                        Nenhuma reserva encontrada com os filtros atuais.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map(booking => {
                                    const room = rooms.find(r => r.id === booking.roomId);
                                    return (
                                        <tr key={booking.id} className="hover:bg-stone-50/50 transition-colors group">
                                            <td className="p-4 align-top">
                                                <div className="font-bold text-primary">{booking.customerName}</div>
                                                <div className="text-xs text-stone-500">{booking.email}</div>
                                                <div className="text-xs font-mono text-stone-400 mt-1">{booking.phone}</div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <span className="text-sm font-medium text-stone-700 block">{room?.name || booking.roomId}</span>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-600 flex items-center">
                                                        <User className="w-3 h-3 mr-1" /> {booking.guests.adults + booking.guests.children}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="text-sm text-stone-700">
                                                    {new Date(booking.checkIn).toLocaleDateString()} <span className="text-stone-300">→</span> {new Date(booking.checkOut).toLocaleDateString()}
                                                </div>
                                                <div className="font-bold text-secondary text-sm mt-1">
                                                    {booking.totalAmount.toLocaleString()} Kz
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                 {booking.receiptUrl ? (
                                                     <div className="flex items-center gap-2">
                                                         {booking.receiptUrl.includes('.pdf') ? (
                                                             <button onClick={() => handleViewReceipt(booking.receiptUrl!)} className="flex items-center text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded hover:bg-red-100">
                                                                 <FileText className="w-4 h-4 mr-1" /> PDF
                                                             </button>
                                                         ) : (
                                                             <img 
                                                                 src={booking.receiptUrl} 
                                                                 onClick={() => handleViewReceipt(booking.receiptUrl!)}
                                                                 className="w-10 h-10 object-cover rounded border border-stone-200 cursor-zoom-in hover:scale-110 transition-transform" 
                                                                 alt="Recibo"
                                                             />
                                                         )}
                                                         <button onClick={() => handleDownloadReceipt(booking.receiptUrl!, booking.customerName)} className="text-stone-400 hover:text-primary"><Download className="w-4 h-4" /></button>
                                                     </div>
                                                 ) : <span className="text-xs text-stone-400 italic">Pendente</span>}
                                            </td>
                                            <td className="p-4 align-top">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                      'bg-red-100 text-red-800'}`}>
                                                    {booking.status === 'pending' ? 'Pendente' : booking.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-top text-right">
                                                <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setSelectedBooking(booking); setShowViewModal(true); }} className="p-1.5 text-stone-500 hover:bg-stone-100 rounded" title="Ver Detalhes"><Eye className="w-4 h-4" /></button>
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(booking.id, 'confirmed')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Aprovar"><Check className="w-4 h-4" /></button>
                                                            <button onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Rejeitar"><X className="w-4 h-4" /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-stone-50 p-4 border-t border-stone-200 text-xs text-stone-500 flex justify-between">
                    <span>Mostrando {filteredBookings.length} reservas</span>
                    <span>Ordenado por data (mais recente)</span>
                </div>
             </div>
          </div>
        )}

        {/* --- RESTAURANT TAB --- */}
        {activeTab === 'restaurant' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-primary">Reservas de Mesa</h2>
                        <p className="text-stone-500 text-sm">Gerencie os pedidos do restaurante</p>
                    </div>
                    <button onClick={() => fetchTableReservations()} className="text-secondary hover:underline text-sm font-bold uppercase flex items-center gap-1">
                        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} /> Atualizar
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-200 text-xs uppercase text-stone-500 font-bold tracking-wider">
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Data & Hora</th>
                                    <th className="p-4">Pessoas</th>
                                    <th className="p-4">Observações</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {tableReservations.length === 0 ? (
                                    <tr><td colSpan={6} className="p-12 text-center text-stone-400">Nenhuma reserva de mesa encontrada.</td></tr>
                                ) : (
                                    tableReservations.map(res => (
                                        <tr key={res.id} className="hover:bg-stone-50/50">
                                            <td className="p-4">
                                                <div className="font-bold text-primary">{res.name}</div>
                                                <div className="text-xs text-stone-500">{res.phone}</div>
                                                <div className="text-xs text-stone-400">{res.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-stone-800">{new Date(res.date).toLocaleDateString()}</div>
                                                <div className="text-sm text-secondary font-bold">{res.time}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center text-stone-600">
                                                    <Users className="w-4 h-4 mr-2" /> {res.guests}
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs truncate text-stone-500 italic text-sm">
                                                {res.specialRequests || '-'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${res.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                                    res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                    'bg-red-100 text-red-800'}`}>
                                                    {res.status === 'pending' ? 'Pendente' : res.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {res.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleTableStatusUpdate(res.id!, 'confirmed')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Confirmar"><Check className="w-5 h-5" /></button>
                                                        <button onClick={() => handleTableStatusUpdate(res.id!, 'cancelled')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Cancelar"><X className="w-5 h-5" /></button>
                                                    </div>
                                                )}
                                                {res.status === 'confirmed' && (
                                                    <button onClick={() => handleTableStatusUpdate(res.id!, 'cancelled')} className="text-xs text-red-400 hover:underline">Cancelar</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* --- CALENDAR TAB --- */}
        {activeTab === 'calendar' && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-stone-100 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-serif text-primary">
                        {currentDate.toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex space-x-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-stone-100 rounded border border-stone-200"><ChevronLeft className="w-5 h-5 text-stone-600" /></button>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-stone-100 rounded border border-stone-200"><ChevronRight className="w-5 h-5 text-stone-600" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4">
                    <table className="min-w-[800px] w-full border-collapse text-xs">
                        <thead>
                            <tr>
                                <th className="p-3 bg-stone-50 text-left border-b border-r border-stone-200 font-bold text-stone-600 sticky left-0 z-10 w-48">Acomodação</th>
                                {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1).map(day => (
                                    <th key={day} className="p-1 min-w-[32px] text-center border-b border-stone-200 bg-stone-50 text-stone-500 font-normal">
                                        {day}
                                        <div className="text-[9px] uppercase opacity-50">
                                            {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString('pt-AO', { weekday: 'narrow' })}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.id} className="border-b border-stone-100">
                                    <td className="p-3 font-medium text-stone-700 bg-white sticky left-0 z-10 border-r border-stone-200 truncate">
                                        {room.name}
                                        <span className="block text-[10px] text-stone-400 font-normal mt-0.5">Qtd: {room.quantity}</span>
                                    </td>
                                    {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1).map(day => {
                                        const booking = isBooked(room.id, day);
                                        return (
                                            <td 
                                                key={day} 
                                                onClick={() => handleCellClick(room, day, booking)}
                                                className={`p-1 text-center cursor-pointer border-r border-stone-50 transition-all ${
                                                    booking 
                                                        ? booking.status === 'confirmed' 
                                                            ? 'bg-primary text-white hover:bg-primary/90' 
                                                            : 'bg-yellow-400 text-white hover:bg-yellow-500'
                                                        : 'hover:bg-blue-50'
                                                }`}
                                                title={booking ? `${booking.customerName} (${booking.status})` : 'Livre'}
                                            >
                                                {booking && <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto shadow-sm"></div>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex gap-4 text-xs text-stone-500">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-primary rounded"></span> Ocupado (Confirmado)</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded"></span> Ocupado (Pendente)</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 border border-stone-200 rounded"></span> Livre (Clique para reservar)</div>
                </div>
            </div>
        )}

        {/* --- ROOMS TAB --- */}
        {activeTab === 'rooms' && (
          isSuperAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {rooms.map(room => (
              <div key={room.id} className="bg-white p-5 rounded-lg shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                 <div className="flex items-start gap-4 mb-4">
                    <img src={room.image} alt={room.name} className="w-16 h-16 object-cover rounded bg-stone-200" />
                    <div>
                       <h3 className="font-bold text-primary font-serif">{room.name}</h3>
                       <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded mt-1 inline-block">ID: {room.id}</span>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Preço Base (Kz)</label>
                      <div className="relative">
                          <span className="absolute left-3 top-2 text-stone-400 text-xs">Kz</span>
                          <input 
                            type="number" 
                            value={room.price} 
                            onChange={(e) => handlePriceChange(room.id, e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-stone-200 rounded focus:border-primary outline-none font-medium"
                          />
                      </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Qtd. Total</label>
                            <input 
                                type="number" 
                                value={room.quantity || 0} 
                                onChange={(e) => handleQuantityChange(room.id, e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded focus:border-primary outline-none"
                            />
                        </div>
                        <div className="flex-1">
                             <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Status</label>
                             <select 
                                value={room.available ? 'yes' : 'no'} 
                                onChange={(e) => updateRoom({...room, available: e.target.value === 'yes'})}
                                className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded focus:border-primary outline-none bg-white"
                             >
                                <option value="yes">Ativo</option>
                                <option value="no">Inativo</option>
                             </select>
                        </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-stone-100">
                <div className="text-red-500 mb-4 font-bold text-xl">Acesso Negado</div>
                <p className="text-stone-500">Você não tem permissão para editar configurações de quartos.</p>
            </div>
          )
        )}

        {/* --- MESSAGES TAB --- */}
        {activeTab === 'messages' && (
            <div className="bg-white rounded-lg shadow-sm border border-stone-100 animate-fade-in">
                <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h3 className="font-bold text-primary">Caixa de Entrada</h3>
                    <button onClick={() => fetchMessages()} className="text-xs text-secondary hover:underline uppercase tracking-wider font-bold">Atualizar</button>
                </div>
                <ul className="divide-y divide-stone-100">
                    {contactMessages.map((msg, idx) => (
                        <li key={msg.id || idx} className="p-6 hover:bg-stone-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-serif font-bold text-lg">
                                        {msg.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="font-bold text-stone-800 block">{msg.name}</span>
                                        <span className="text-xs text-stone-500">{msg.email}</span>
                                    </div>
                                </div>
                                {msg.created_at && <span className="text-xs text-stone-400">{new Date(msg.created_at).toLocaleDateString()}</span>}
                            </div>
                            <p className="ml-13 mt-2 text-stone-600 text-sm leading-relaxed pl-13">{msg.message}</p>
                        </li>
                    ))}
                    {contactMessages.length === 0 && <li className="p-12 text-center text-stone-400 italic">Nenhuma mensagem recebida.</li>}
                </ul>
            </div>
        )}

        {/* --- LIVE CHAT TAB --- */}
        {activeTab === 'livechat' && (
             <div className="bg-white shadow-sm border border-stone-100 rounded-lg overflow-hidden animate-fade-in h-[600px] flex">
                 <div className="w-1/3 border-r border-stone-100 overflow-y-auto bg-stone-50">
                    <div className="p-4 bg-white border-b border-stone-100 sticky top-0"><h3 className="font-bold text-primary font-serif">Conversas Ativas</h3></div>
                    <ul>
                        {groupedSessions.map(([sessionId, msgs]) => {
                            const lastMsg = msgs[msgs.length - 1];
                            return (
                                <li key={sessionId} onClick={() => setSelectedSessionId(sessionId)} className={`p-4 border-b border-stone-100 cursor-pointer hover:bg-white transition-colors ${selectedSessionId === sessionId ? 'bg-white border-l-4 border-l-secondary' : ''}`}>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center"><User className="w-5 h-5 text-stone-500" /></div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-center"><span className="font-bold text-sm text-stone-800">Visitante {sessionId.substring(0,4)}</span><span className="text-[10px] text-stone-400">{new Date(lastMsg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                                            <p className="text-xs text-stone-500 truncate mt-1">{lastMsg.message}</p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                 </div>
                 <div className="w-2/3 flex flex-col bg-white">
                     {selectedSessionId ? (
                         <>
                             <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                                 <h3 className="font-bold text-stone-700">Chat ID: <span className="font-mono text-stone-500">{selectedSessionId}</span></h3>
                             </div>
                             <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
                                 {allChatMessages.filter(m => m.session_id === selectedSessionId).map((msg) => (
                                     <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                         <div className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${msg.sender === 'admin' ? 'bg-primary text-white rounded-tr-none' : 'bg-stone-100 text-stone-800 rounded-tl-none'}`}>
                                             <p>{msg.message}</p>
                                             <p className={`text-[10px] mt-1 text-right ${msg.sender === 'admin' ? 'text-white/60' : 'text-stone-400'}`}>{new Date(msg.created_at).toLocaleTimeString()}</p>
                                         </div>
                                     </div>
                                 ))}
                                 <div ref={chatEndRef} />
                             </div>
                             <form onSubmit={handleAdminSendChat} className="p-4 border-t border-stone-100 bg-stone-50 flex space-x-2">
                                 <input type="text" placeholder="Escreva sua resposta..." className="flex-1 border border-stone-200 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none" value={adminInputText} onChange={(e) => setAdminInputText(e.target.value)} />
                                 <button type="submit" disabled={!adminInputText.trim()} className="bg-primary text-white p-2.5 rounded-lg hover:bg-primary/90"><Send className="w-5 h-5" /></button>
                             </form>
                         </>
                     ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-stone-300">
                             <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                             <p>Selecione uma conversa para iniciar o atendimento.</p>
                         </div>
                     )}
                 </div>
             </div>
        )}
      </main>

      {/* --- MODAL NOVA RESERVA MANUAL --- */}
      {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-scale-in">
                  <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                      <h3 className="text-xl font-serif font-bold text-primary">Nova Reserva Manual</h3>
                      <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-red-500"><X /></button>
                  </div>
                  <form onSubmit={submitManualBooking} className="space-y-4">
                      <div className="bg-stone-50 p-3 rounded border border-stone-200 mb-4">
                          <span className="block text-[10px] font-bold uppercase text-stone-400">Quarto Selecionado</span>
                          <span className="text-primary font-bold">{manualBooking.roomName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-stone-500 mb-1">Check-in</label>
                              <input type="date" required value={manualBooking.checkIn} onChange={e => setManualBooking({...manualBooking, checkIn: e.target.value})} className="w-full border border-stone-200 p-2 rounded focus:border-primary outline-none" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-stone-500 mb-1">Check-out</label>
                              <input type="date" required value={manualBooking.checkOut} onChange={e => setManualBooking({...manualBooking, checkOut: e.target.value})} className="w-full border border-stone-200 p-2 rounded focus:border-primary outline-none" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-stone-500 mb-1">Nome Cliente / Motivo Bloqueio</label>
                          <input type="text" placeholder="Ex: João Silva ou Manutenção" value={manualBooking.customerName} onChange={e => setManualBooking({...manualBooking, customerName: e.target.value})} className="w-full border border-stone-200 p-2 rounded focus:border-primary outline-none" />
                      </div>
                      <div>
                           <label className="block text-xs font-bold text-stone-500 mb-1">Telefone (Opcional)</label>
                           <input type="text" value={manualBooking.phone} onChange={e => setManualBooking({...manualBooking, phone: e.target.value})} className="w-full border border-stone-200 p-2 rounded focus:border-primary outline-none" />
                      </div>
                      
                      <div className="flex justify-end gap-3 mt-8">
                          <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2 text-stone-600 hover:bg-stone-100 rounded text-sm font-bold">Cancelar</button>
                          <button type="submit" className="px-6 py-2 bg-primary text-white rounded text-sm font-bold uppercase tracking-wider hover:bg-primary/90">Confirmar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* --- MODAL DETALHES RESERVA --- */}
      {showViewModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-0 animate-scale-in overflow-hidden">
                  <div className="bg-primary p-6 text-white flex justify-between items-start">
                      <div>
                          <h3 className="font-serif text-2xl font-bold">{selectedBooking.customerName}</h3>
                          <p className="text-white/60 text-sm">Reserva #{selectedBooking.id.slice(-6).toUpperCase()}</p>
                      </div>
                      <button onClick={() => setShowViewModal(false)} className="text-white/60 hover:text-white"><X /></button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-stone-50 p-3 rounded">
                              <span className="block text-xs text-stone-400 font-bold uppercase">Check-in</span>
                              <span className="font-bold text-stone-700">{new Date(selectedBooking.checkIn).toLocaleDateString()}</span>
                          </div>
                          <div className="bg-stone-50 p-3 rounded">
                              <span className="block text-xs text-stone-400 font-bold uppercase">Check-out</span>
                              <span className="font-bold text-stone-700">{new Date(selectedBooking.checkOut).toLocaleDateString()}</span>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <div className="flex items-center text-stone-600">
                              <Phone className="w-4 h-4 mr-3 text-stone-400" />
                              <span>{selectedBooking.phone}</span>
                          </div>
                          <div className="flex items-center text-stone-600">
                              <Mail className="w-4 h-4 mr-3 text-stone-400" />
                              <span>{selectedBooking.email}</span>
                          </div>
                          <div className="flex items-center text-stone-600">
                              <Bed className="w-4 h-4 mr-3 text-stone-400" />
                              <span>Quarto ID: {selectedBooking.roomId}</span>
                          </div>
                          <div className="flex items-center text-stone-600 border-t pt-3 mt-3">
                              <CreditCard className="w-4 h-4 mr-3 text-stone-400" />
                              <span className="font-bold text-lg text-primary">{selectedBooking.totalAmount.toLocaleString()} Kz</span>
                              <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-700' : selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                  {selectedBooking.status}
                              </span>
                          </div>
                      </div>

                      {selectedBooking.receiptUrl && (
                          <div className="bg-stone-50 p-4 rounded border border-stone-200 flex items-center justify-between">
                              <div className="flex items-center text-sm font-bold text-stone-700">
                                  <FileText className="w-5 h-5 mr-2 text-stone-400" />
                                  Comprovativo de Pagamento
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => handleViewReceipt(selectedBooking.receiptUrl!)} className="text-xs bg-white border border-stone-200 px-3 py-1 rounded hover:bg-stone-100">Visualizar</button>
                                  <button onClick={() => handleDownloadReceipt(selectedBooking.receiptUrl!, selectedBooking.customerName)} className="text-stone-400 hover:text-primary"><Download className="w-4 h-4" /></button>
                              </div>
                          </div>
                      )}

                      {/* Ações */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
                        {selectedBooking.status === 'pending' && (
                            <>
                                <button onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded text-sm font-bold uppercase tracking-wider">Aprovar Reserva</button>
                                <button onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded text-sm font-bold uppercase tracking-wider">Rejeitar</button>
                            </>
                        )}
                        {selectedBooking.status === 'confirmed' && (
                             <button onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')} className="col-span-2 border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded text-sm font-bold uppercase tracking-wider flex items-center justify-center">
                                 <Trash2 className="w-4 h-4 mr-2" /> Cancelar Reserva
                             </button>
                        )}
                         {selectedBooking.status === 'cancelled' && (
                             <button onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')} className="col-span-2 border border-stone-200 text-stone-600 hover:bg-stone-50 py-3 rounded text-sm font-bold uppercase tracking-wider">
                                 Reativar Reserva
                             </button>
                        )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL PREVIEW IMAGEM */}
      {previewImage && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewImage(null)}>
              <div className="relative max-w-5xl max-h-screen" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300"><X className="w-8 h-8" /></button>
                  <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] rounded shadow-2xl" />
              </div>
          </div>
      )}
    </div>
  );
};

export default Admin;
