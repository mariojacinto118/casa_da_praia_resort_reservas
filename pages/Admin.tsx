import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Mail, Calendar, Bed, LogIn, MessageSquare, Send, User, Check, X, FileText, ChevronLeft, ChevronRight, Phone, CreditCard, Trash2, Plus, Eye, ExternalLink, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatMessage, Booking } from '../types';
import { supabase } from '../supabase';
import { ADMIN_EMAILS } from '../constants';

const Admin: React.FC = () => {
  const { bookings, rooms, updateRoom, contactMessages, fetchMessages, sendChatMessage, updateBookingStatus, addBooking } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'rooms' | 'messages' | 'livechat'>('bookings');
  const [filter, setFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- Estados do Chat ---
  const [allChatMessages, setAllChatMessages] = useState<ChatMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [adminInputText, setAdminInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Estados do Calendário ---
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // --- Estados do Modal de Criação (Manual) ---
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

  // --- Estados do Modal de Visualização (Detalhes) ---
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Carregar dados conforme a aba
  useEffect(() => {
    if (activeTab === 'messages' && user) {
        fetchMessages();
    }
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

        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, [activeTab, user]);

  useEffect(() => {
      if (activeTab === 'livechat' && selectedSessionId) {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [allChatMessages, selectedSessionId, activeTab]);

  const fetchLiveChats = async () => {
      const { data, error } = await supabase
          .from('live_chat')
          .select('*')
          .order('created_at', { ascending: true });
      
      if (data) {
          setAllChatMessages(data);
      }
  };

  const handleAdminSendChat = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminInputText.trim() || !selectedSessionId) return;

      const text = adminInputText;
      setAdminInputText(''); 
      const newMsg = await sendChatMessage(text, true, selectedSessionId);
      
      if (newMsg) {
          setAllChatMessages(prev => {
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
          });
      } else {
          setAdminInputText(text);
          alert("Não foi possível enviar a mensagem.");
      }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
      setProcessingId(id);
      try {
          await updateBookingStatus(id, newStatus as Booking['status']);
          // Se estivermos no modal de visualização, fechar após sucesso
          if (showViewModal) setShowViewModal(false);
      } catch (error) {
          alert("Erro ao atualizar status");
      } finally {
          setProcessingId(null);
      }
  };

  const handlePriceChange = (roomId: string, newPrice: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      updateRoom({ ...room, price: Number(newPrice) });
    }
  };
  
  const handleQuantityChange = (roomId: string, newQty: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
        updateRoom({ ...room, quantity: Number(newQty) });
    }
  };

  const handleViewReceipt = (url: string) => {
    if (url.toLowerCase().includes('.pdf')) {
        window.open(url, '_blank');
    } else {
        setPreviewImage(url);
    }
  };

  const handleDownloadReceipt = async (url: string, customerName: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Determinar extensão
        const isPdf = url.toLowerCase().includes('.pdf');
        const ext = isPdf ? 'pdf' : 'jpg';
        
        // Criar link temporário
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `Comprovativo_${customerName.replace(/\s+/g, '_')}.${ext}`;
        document.body.appendChild(link);
        link.click();
        
        // Limpar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
        console.error('Erro ao baixar:', err);
        // Fallback: abre em nova aba
        window.open(url, '_blank');
    }
  };

  // --- Lógica do Calendário ---
  const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const changeMonth = (offset: number) => {
      const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
      setCurrentDate(new Date(newDate));
  };

  const isBooked = (roomId: string, day: number) => {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      targetDate.setHours(12, 0, 0, 0); 

      return bookings.find(b => {
          if (b.roomId !== roomId || b.status === 'cancelled') return false;
          
          const checkIn = new Date(b.checkIn);
          checkIn.setHours(0,0,0,0);
          
          const checkOut = new Date(b.checkOut);
          checkOut.setHours(0,0,0,0); 

          const current = new Date(targetDate);
          current.setHours(0,0,0,0);

          return current >= checkIn && current < checkOut;
      });
  };

  // Abre o modal adequado (Criar ou Visualizar) ao clicar na célula
  const handleCellClick = (room: typeof rooms[0], day: number, existingBooking?: Booking) => {
      if (existingBooking) {
          setSelectedBooking(existingBooking);
          setShowViewModal(true);
      } else {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const date = new Date(year, month, day, 12, 0, 0);
          const checkInStr = date.toISOString().split('T')[0];
          
          const nextDay = new Date(date);
          nextDay.setDate(date.getDate() + 1);
          const checkOutStr = nextDay.toISOString().split('T')[0];

          setManualBooking({
              roomId: room.id,
              roomName: room.name,
              checkIn: checkInStr,
              checkOut: checkOutStr,
              customerName: '',
              phone: '',
              email: '',
              notes: ''
          });
          setShowCreateModal(true);
      }
  };

  const submitManualBooking = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await addBooking({
              customerName: manualBooking.customerName || 'Bloqueio Administrativo',
              email: manualBooking.email || 'admin@sistema.local',
              phone: manualBooking.phone || '000000000',
              checkIn: manualBooking.checkIn,
              checkOut: manualBooking.checkOut,
              guests: { adults: 1, children: 0 }, 
              roomId: manualBooking.roomId,
              activities: [],
              totalAmount: 0, 
              status: 'confirmed', 
              paymentMethod: 'manual'
          });
          setShowCreateModal(false);
          alert('Reserva/Bloqueio criado com sucesso!');
      } catch (err: any) {
          alert('Erro ao criar reserva: ' + err.message);
      }
  };

  const groupedSessions = React.useMemo(() => {
      const sessions: Record<string, ChatMessage[]> = {};
      allChatMessages.forEach(msg => {
          if (!sessions[msg.session_id]) sessions[msg.session_id] = [];
          sessions[msg.session_id].push(msg);
      });
      return Object.entries(sessions).sort(([, msgsA], [, msgsB]) => {
          const lastA = new Date(msgsA[msgsA.length - 1].created_at).getTime();
          const lastB = new Date(msgsB[msgsB.length - 1].created_at).getTime();
          return lastB - lastA;
      });
  }, [allChatMessages]);

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  // Agrupamento por mês
  const bookingsByMonth = useMemo<Record<string, Booking[]>>(() => {
    const groups: Record<string, Booking[]> = {};
    
    // Ordenar por data mais recente primeiro
    const sorted = [...filteredBookings].sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

    sorted.forEach(booking => {
        const date = new Date(booking.checkIn);
        // Formato: "Março 2024"
        const key = date.toLocaleString('pt-AO', { month: 'long', year: 'numeric' });
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1); // Capitalizar

        if (!groups[formattedKey]) groups[formattedKey] = [];
        groups[formattedKey].push(booking);
    });

    return groups;
  }, [filteredBookings]);

  // Verificação de segurança: Checa se o email está na lista de admins
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return (
        <div className="pt-32 pb-20 min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
             <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                     <LogIn className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
                 <p className="text-gray-600 mb-6">Esta área é exclusiva para a administração do resort.</p>
                 <Link to="/" className="inline-block w-full bg-primary text-white py-3 rounded font-bold uppercase hover:bg-primary/90 transition-colors">
                     Voltar ao Início
                 </Link>
             </div>
        </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-100 relative">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
           <div>
              <h1 className="text-3xl font-bold text-primary">Painel Administrativo</h1>
              <p className="text-sm text-gray-500">Bem-vindo, {user.user_metadata?.full_name || user.email}</p>
           </div>
           
           <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm overflow-x-auto max-w-full">
             <button onClick={() => setActiveTab('bookings')} className={`flex items-center space-x-2 px-4 py-2 rounded transition-all whitespace-nowrap ${activeTab === 'bookings' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
               <Calendar className="w-4 h-4" /> <span className="text-sm font-medium">Reservas</span>
             </button>
             <button onClick={() => setActiveTab('calendar')} className={`flex items-center space-x-2 px-4 py-2 rounded transition-all whitespace-nowrap ${activeTab === 'calendar' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
               <Calendar className="w-4 h-4" /> <span className="text-sm font-medium">Mapa Ocupação</span>
             </button>
             <button onClick={() => setActiveTab('rooms')} className={`flex items-center space-x-2 px-4 py-2 rounded transition-all whitespace-nowrap ${activeTab === 'rooms' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
               <Bed className="w-4 h-4" /> <span className="text-sm font-medium">Quartos</span>
             </button>
             <button onClick={() => setActiveTab('messages')} className={`flex items-center space-x-2 px-4 py-2 rounded transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
               <Mail className="w-4 h-4" /> <span className="text-sm font-medium">Inbox</span>
             </button>
             <button onClick={() => setActiveTab('livechat')} className={`flex items-center space-x-2 px-4 py-2 rounded transition-all whitespace-nowrap ${activeTab === 'livechat' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
               <MessageSquare className="w-4 h-4" /> <span className="text-sm font-medium">Chat Ao Vivo</span>
             </button>
           </div>
        </div>
        
        {/* Stats */}
        {activeTab === 'bookings' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
                <div className="bg-white p-6 rounded shadow border-l-4 border-primary">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Reservas</h3>
                    <p className="text-3xl font-bold mt-2">{bookings.length}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Faturamento (Est.)</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                    {bookings.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString('pt-AO')} Kz
                    </p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Quartos Total</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{rooms.length}</p>
                </div>
            </div>
        )}

        {/* --- BOOKINGS TAB --- */}
        {activeTab === 'bookings' && (
          <div className="space-y-8 animate-fade-in">
             <div className="flex gap-2 bg-white p-4 rounded shadow-sm overflow-x-auto">
                {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap capitalize transition-colors ${
                            filter === status 
                            ? (status === 'all' ? 'bg-primary text-white' : status === 'pending' ? 'bg-yellow-500 text-white' : status === 'confirmed' ? 'bg-green-600 text-white' : 'bg-red-600 text-white')
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {status === 'all' ? 'Todas' : status}
                    </button>
                ))}
             </div>

             {/* Iterar sobre os grupos de meses */}
             {Object.keys(bookingsByMonth).length === 0 ? (
                 <div className="bg-white p-12 rounded shadow text-center text-gray-500">
                     Nenhuma reserva encontrada para este filtro.
                 </div>
             ) : (
                 (Object.entries(bookingsByMonth) as [string, Booking[]][]).map(([month, monthlyBookings]) => (
                     <div key={month} className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                         <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                             <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                 <Calendar className="w-5 h-5 mr-2 text-primary" />
                                 {month}
                             </h3>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hóspede</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datas / Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprovativo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {monthlyBookings.map((booking) => {
                                    const room = rooms.find(r => r.id === booking.roomId);
                                    const isProcessing = processingId === booking.id;
                                    return (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{booking.customerName}</div>
                                        <div className="text-xs text-gray-500">{booking.email}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <span>{booking.phone}</span>
                                            <a href={`https://wa.me/${booking.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600">
                                                <MessageSquare className="w-3 h-3" />
                                            </a>
                                        </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {room?.name}
                                        <div className="text-xs text-gray-400">
                                            {booking.guests.adults} Ad, {booking.guests.children} Cr
                                        </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{booking.checkIn} a {booking.checkOut}</div>
                                        <div className="text-sm font-bold text-secondary">
                                            {booking.totalAmount.toLocaleString()} Kz
                                        </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {booking.receiptUrl ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="relative group w-12 h-12">
                                                        {booking.receiptUrl.toLowerCase().includes('.pdf') ? (
                                                            <div 
                                                                onClick={() => handleViewReceipt(booking.receiptUrl!)}
                                                                className="w-full h-full bg-red-50 border border-red-100 flex flex-col items-center justify-center rounded cursor-pointer hover:bg-red-100"
                                                                title="Visualizar PDF"
                                                            >
                                                                <FileText className="w-5 h-5 text-red-500" />
                                                            </div>
                                                        ) : (
                                                            <img 
                                                                src={booking.receiptUrl} 
                                                                alt="Comprovativo" 
                                                                onClick={() => handleViewReceipt(booking.receiptUrl!)}
                                                                className="w-full h-full object-cover rounded border border-gray-200 cursor-zoom-in hover:shadow-lg transition-all"
                                                                title="Visualizar Imagem"
                                                            />
                                                        )}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDownloadReceipt(booking.receiptUrl!, booking.customerName)}
                                                        className="p-2 bg-gray-100 hover:bg-primary hover:text-white rounded-full transition-colors"
                                                        title="Descarregar Comprovativo"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : <span className="text-gray-400 text-xs italic">Não anexado</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'}`}>
                                            {booking.status === 'pending' ? 'Pendente' : booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {isProcessing ? (
                                                <span className="text-xs text-gray-500">Processando...</span>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(booking.id, 'confirmed')} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Aprovar"><Check className="w-4 h-4" /></button>
                                                            <button onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Rejeitar"><X className="w-4 h-4" /></button>
                                                        </>
                                                    )}
                                                    {booking.status === 'confirmed' && (
                                                        <button onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="text-red-500 hover:text-red-700 text-xs underline">Cancelar</button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                            </table>
                         </div>
                     </div>
                 ))
             )}
          </div>
        )}

        {/* --- CALENDAR TAB --- */}
        {activeTab === 'calendar' && (
            <div className="bg-white p-6 rounded shadow animate-fade-in overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {currentDate.toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="text-xs text-gray-500 flex gap-2">
                             <div className="flex items-center gap-1"><span className="w-3 h-3 bg-white border rounded"></span> Livre (Criar)</div>
                             <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Confirmado</div>
                             <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded"></span> Pendente</div>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded border"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded border"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4">
                    <table className="min-w-full border-collapse border border-gray-200 text-xs">
                        <thead>
                            <tr>
                                <th className="border p-2 bg-gray-50 sticky left-0 z-10 w-48 text-left">Quarto / Dia</th>
                                {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1).map(day => (
                                    <th key={day} className="border p-1 w-10 text-center bg-gray-50 text-gray-500 font-normal">
                                        {day}
                                        <div className="text-[10px] uppercase">
                                            {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString('pt-AO', { weekday: 'narrow' })}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.id}>
                                    <td className="border p-2 font-bold text-gray-700 sticky left-0 bg-white z-10 border-r-2 truncate">
                                        {room.name}
                                        <span className="block text-[10px] text-gray-400 font-normal">Qtd: {room.quantity}</span>
                                    </td>
                                    {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1).map(day => {
                                        const booking = isBooked(room.id, day);
                                        return (
                                            <td 
                                                key={day} 
                                                onClick={() => handleCellClick(room, day, booking)}
                                                className={`border p-1 text-center transition-colors cursor-pointer ${
                                                    booking 
                                                        ? booking.status === 'confirmed' ? 'bg-green-500 text-white hover:opacity-80' : 'bg-yellow-400 text-white hover:opacity-80'
                                                        : 'bg-white hover:bg-blue-100'
                                                }`}
                                                title={booking ? `${booking.customerName} (${booking.status})` : 'Clique para adicionar reserva'}
                                            >
                                                {booking ? <span className="block w-2 h-2 bg-white rounded-full mx-auto"></span> : <span className="text-gray-200 text-[8px]">+</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- ROOMS TAB --- */}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 gap-6 animate-fade-in">
            {rooms.map(room => (
              <div key={room.id} className="bg-white p-6 rounded shadow flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="flex items-center space-x-4">
                    <img src={room.image} alt={room.name} className="w-20 h-20 object-cover rounded" />
                    <div>
                       <h3 className="font-bold text-lg text-primary">{room.name}</h3>
                       <p className="text-xs text-gray-500">ID: {room.id}</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-4 flex-wrap">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Preço (Kz)</label>
                      <input 
                        type="number" 
                        value={room.price} 
                        onChange={(e) => handlePriceChange(room.id, e.target.value)}
                        className="border border-gray-300 rounded p-2 w-28 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 font-bold">Quantidade (Estoque)</label>
                      <input 
                        type="number" 
                        value={room.quantity || 0} 
                        onChange={(e) => handleQuantityChange(room.id, e.target.value)}
                        className="border border-gray-300 rounded p-2 w-20 text-center font-bold text-primary"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Disponível?</label>
                      <select 
                         value={room.available ? 'yes' : 'no'} 
                         onChange={(e) => updateRoom({...room, available: e.target.value === 'yes'})}
                         className="border border-gray-300 rounded p-2 text-sm"
                      >
                         <option value="yes">Sim</option>
                         <option value="no">Não</option>
                      </select>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MESSAGES TAB --- */}
        {activeTab === 'messages' && (
            <div className="bg-white shadow rounded-lg overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700">Caixa de Entrada</h3>
                    <button onClick={() => fetchMessages()} className="text-sm text-primary hover:underline">Atualizar</button>
                </div>
                <ul className="divide-y divide-gray-200">
                    {contactMessages.map((msg, idx) => (
                        <li key={msg.id || idx} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">{msg.name.charAt(0).toUpperCase()}</div>
                                    <div><span className="font-bold text-gray-900 block">{msg.name}</span><span className="text-xs text-gray-500">{msg.email}</span></div>
                                </div>
                                {msg.created_at && <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>}
                            </div>
                            <div className="ml-10 bg-gray-50 p-3 rounded text-gray-700 text-sm border border-gray-100">{msg.message}</div>
                        </li>
                    ))}
                    {contactMessages.length === 0 && <li className="p-8 text-center text-gray-500">Nenhuma mensagem.</li>}
                </ul>
            </div>
        )}

        {/* --- LIVE CHAT TAB --- */}
        {activeTab === 'livechat' && (
             <div className="bg-white shadow rounded-lg overflow-hidden animate-fade-in h-[600px] flex">
                 <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
                    <div className="p-4 bg-white border-b sticky top-0"><h3 className="font-bold text-gray-700">Conversas</h3></div>
                    <ul>
                        {groupedSessions.map(([sessionId, msgs]) => {
                            const lastMsg = msgs[msgs.length - 1];
                            return (
                                <li key={sessionId} onClick={() => setSelectedSessionId(sessionId)} className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${selectedSessionId === sessionId ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center"><User className="w-6 h-6 text-white" /></div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-center"><span className="font-bold text-sm text-gray-800">Visitante {sessionId.substring(0,4)}</span><span className="text-[10px] text-gray-400">{new Date(lastMsg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                                            <p className="text-xs text-gray-500 truncate">{lastMsg.message}</p>
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
                             <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-800">Chat {selectedSessionId}</h3></div>
                             <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                                 {allChatMessages.filter(m => m.session_id === selectedSessionId).map((msg) => (
                                     <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                         <div className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${msg.sender === 'admin' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>
                                             <p>{msg.message}</p>
                                             <p className={`text-[10px] mt-1 text-right ${msg.sender === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleTimeString()}</p>
                                         </div>
                                     </div>
                                 ))}
                                 <div ref={chatEndRef} />
                             </div>
                             <form onSubmit={handleAdminSendChat} className="p-4 border-t bg-white flex space-x-2">
                                 <input type="text" placeholder="Responder..." className="flex-1 border border-gray-300 rounded-lg px-4 py-2" value={adminInputText} onChange={(e) => setAdminInputText(e.target.value)} />
                                 <button type="submit" disabled={!adminInputText.trim()} className="bg-primary text-white p-2 rounded-lg"><Send className="w-5 h-5" /></button>
                             </form>
                         </>
                     ) : (
                         <div className="flex-1 flex items-center justify-center text-gray-400"><p>Selecione uma conversa.</p></div>
                     )}
                 </div>
             </div>
        )}
      </div>

      {/* --- MODAL NOVA RESERVA MANUAL --- */}
      {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">Nova Reserva Manual</h3>
                      <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-red-500"><X /></button>
                  </div>
                  <form onSubmit={submitManualBooking} className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Quarto</label>
                          <input type="text" value={manualBooking.roomName} disabled className="w-full bg-gray-100 border p-2 rounded text-gray-600" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Check-in</label>
                              <input 
                                type="date" 
                                required 
                                value={manualBooking.checkIn} 
                                onChange={e => setManualBooking({...manualBooking, checkIn: e.target.value})} 
                                className="w-full border p-2 rounded" 
                              />
                          </div>
                          <div>
                              <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Check-out</label>
                              <input 
                                type="date" 
                                required 
                                value={manualBooking.checkOut} 
                                onChange={e => setManualBooking({...manualBooking, checkOut: e.target.value})} 
                                className="w-full border p-2 rounded" 
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Nome do Cliente / Bloqueio</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Bloqueio Manutenção ou Nome" 
                            value={manualBooking.customerName} 
                            onChange={e => setManualBooking({...manualBooking, customerName: e.target.value})} 
                            className="w-full border p-2 rounded focus:ring-1 focus:ring-primary" 
                          />
                      </div>
                      <div>
                           <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Telefone</label>
                           <input 
                            type="text" 
                            placeholder="Ex: 923..." 
                            value={manualBooking.phone} 
                            onChange={e => setManualBooking({...manualBooking, phone: e.target.value})} 
                            className="w-full border p-2 rounded" 
                           />
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-6">
                          <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                          <button type="submit" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90">Criar Reserva</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* --- MODAL DETALHES RESERVA --- */}
      {showViewModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in relative">
                  <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
                  
                  <div className="mb-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                            selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                      }`}>
                          {selectedBooking.status === 'pending' ? 'Pendente' : selectedBooking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-800">{selectedBooking.customerName}</h3>
                      <p className="text-gray-500 text-sm">Reserva #{selectedBooking.id.slice(-6)}</p>
                  </div>

                  <div className="space-y-4 border-t border-b py-4 mb-6">
                      <div className="flex items-center space-x-3 text-gray-600">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span>{selectedBooking.phone}</span>
                          <a href={`https://wa.me/${selectedBooking.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600 text-xs font-bold uppercase ml-auto">
                              WhatsApp
                          </a>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span className="truncate">{selectedBooking.email}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <span>{new Date(selectedBooking.checkIn).toLocaleDateString()} - {new Date(selectedBooking.checkOut).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <span className="font-bold text-primary">{selectedBooking.totalAmount.toLocaleString()} Kz</span>
                      </div>
                      {selectedBooking.receiptUrl && (
                          <div className="flex items-center justify-between text-gray-600 pt-2 border-t border-dashed">
                              <div className="flex items-center">
                                  <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                  <button 
                                    onClick={() => handleViewReceipt(selectedBooking.receiptUrl!)}
                                    className="text-blue-600 underline font-medium hover:text-blue-800"
                                  >
                                      Visualizar
                                  </button>
                              </div>
                              <button 
                                onClick={() => handleDownloadReceipt(selectedBooking.receiptUrl!, selectedBooking.customerName)}
                                className="flex items-center text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-700"
                              >
                                  <Download className="w-3 h-3 mr-1" /> Baixar
                              </button>
                          </div>
                      )}
                  </div>

                  {/* Ações Rápidas */}
                  <div className="grid grid-cols-2 gap-3">
                      {selectedBooking.status === 'pending' && (
                          <>
                              <button 
                                  onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                                  className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-bold text-sm"
                              >
                                  <Check className="w-4 h-4" /> <span>Aprovar</span>
                              </button>
                              <button 
                                  onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                                  className="flex items-center justify-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded font-bold text-sm"
                              >
                                  <X className="w-4 h-4" /> <span>Rejeitar</span>
                              </button>
                          </>
                      )}
                      
                      {selectedBooking.status === 'confirmed' && (
                          <button 
                              onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                              className="col-span-2 flex items-center justify-center space-x-2 border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded font-bold text-sm"
                          >
                              <Trash2 className="w-4 h-4" /> <span>Cancelar Reserva</span>
                          </button>
                      )}

                      {selectedBooking.status === 'cancelled' && (
                          <button 
                              onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                              className="col-span-2 flex items-center justify-center space-x-2 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded font-bold text-sm"
                          >
                              <span>Reativar Reserva</span>
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* MODAL DE VISUALIZAÇÃO DE IMAGEM */}
      {previewImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
              <div className="relative max-w-4xl w-full max-h-[90vh] bg-transparent flex flex-col items-center" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-end w-full mb-2 space-x-2">
                      <a 
                          href={previewImage} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                          title="Abrir original"
                      >
                          <ExternalLink className="w-6 h-6" />
                      </a>
                      <button 
                          onClick={() => setPreviewImage(null)}
                          className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                      >
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  <img 
                      src={previewImage} 
                      alt="Comprovativo" 
                      className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/20" 
                  />
              </div>
          </div>
      )}

    </div>
  );
};

export default Admin;