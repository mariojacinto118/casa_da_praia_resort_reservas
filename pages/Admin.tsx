import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Mail, Calendar, Bed, LogIn, MessageSquare, Send, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatMessage } from '../types';
import { supabase } from '../supabase';

const Admin: React.FC = () => {
  const { bookings, rooms, updateRoom, contactMessages, fetchMessages, sendChatMessage } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'rooms' | 'messages' | 'livechat'>('bookings');
  const [filter, setFilter] = useState<string>('all');

  // --- Estados do Chat ---
  const [allChatMessages, setAllChatMessages] = useState<ChatMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [adminInputText, setAdminInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Carregar dados conforme a aba
  useEffect(() => {
    if (activeTab === 'messages' && user) {
        fetchMessages();
    }
    if (activeTab === 'livechat' && user) {
        fetchLiveChats();
        // Inscrever no Realtime global (todas as sessões)
        const channel = supabase
            .channel('chat_room_admin')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'live_chat' }, 
                (payload) => {
                    const newMsg = payload.new as ChatMessage;
                    setAllChatMessages(prev => [...prev, newMsg]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, [activeTab, user]);

  // Scroll para baixo quando nova mensagem chega no chat aberto
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

  // Agrupar mensagens por Sessão
  const groupedSessions = React.useMemo(() => {
      const sessions: Record<string, ChatMessage[]> = {};
      allChatMessages.forEach(msg => {
          if (!sessions[msg.session_id]) {
              sessions[msg.session_id] = [];
          }
          sessions[msg.session_id].push(msg);
      });
      // Ordenar sessões pela mensagem mais recente
      return Object.entries(sessions).sort(([, msgsA], [, msgsB]) => {
          const lastA = new Date(msgsA[msgsA.length - 1].created_at).getTime();
          const lastB = new Date(msgsB[msgsB.length - 1].created_at).getTime();
          return lastB - lastA;
      });
  }, [allChatMessages]);

  const handleAdminSendChat = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminInputText.trim() || !selectedSessionId) return;

      await sendChatMessage(adminInputText, true, selectedSessionId);
      setAdminInputText('');
  };

  // Proteção simples: Se não estiver logado, pede login
  if (!user) {
    return (
        <div className="pt-32 pb-20 min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
             <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                     <LogIn className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
                 <p className="text-gray-600 mb-6">Você precisa estar autenticado como administrador para acessar este painel.</p>
                 <Link to="/login" className="inline-block w-full bg-primary text-white py-3 rounded font-bold uppercase hover:bg-primary/90 transition-colors">
                     Fazer Login
                 </Link>
             </div>
        </div>
    );
  }

  // Simple state for editable prices to simulate form behavior
  const handlePriceChange = (roomId: string, newPrice: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      updateRoom({ ...room, price: Number(newPrice) });
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
           <div>
              <h1 className="text-3xl font-bold text-primary">Painel Administrativo</h1>
              <p className="text-sm text-gray-500">Bem-vindo, {user.user_metadata?.full_name || user.email}</p>
           </div>
           
           <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm overflow-x-auto">
             <button 
               onClick={() => setActiveTab('bookings')}
               className={`flex items-center space-x-2 px-4 py-2 rounded transition-all whitespace-nowrap ${activeTab === 'bookings' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <Calendar className="w-4 h-4" />
               <span className="text-sm font-medium">Reservas</span>
             </button>
             <button 
               onClick={() => setActiveTab('rooms')}
               className={`flex items-center space-x-2 px-4 py-2 rounded transition-all whitespace-nowrap ${activeTab === 'rooms' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <Bed className="w-4 h-4" />
               <span className="text-sm font-medium">Quartos</span>
             </button>
             <button 
               onClick={() => setActiveTab('messages')}
               className={`flex items-center space-x-2 px-4 py-2 rounded transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <Mail className="w-4 h-4" />
               <span className="text-sm font-medium">Inbox</span>
             </button>
             <button 
               onClick={() => setActiveTab('livechat')}
               className={`flex items-center space-x-2 px-4 py-2 rounded transition-all whitespace-nowrap ${activeTab === 'livechat' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <MessageSquare className="w-4 h-4" />
               <span className="text-sm font-medium">Chat Ao Vivo</span>
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

        {/* Content */}
        {activeTab === 'bookings' && (
          <div className="space-y-4 animate-fade-in">
             {/* Filter Menu */}
             <div className="flex gap-2 bg-white p-4 rounded shadow-sm overflow-x-auto">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Pendentes
                </button>
                <button
                    onClick={() => setFilter('confirmed')}
                    className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${filter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Confirmadas
                </button>
                <button
                    onClick={() => setFilter('cancelled')}
                    className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Canceladas
                </button>
             </div>

             <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hóspede</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in / Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          {filter === 'all' ? 'Nenhuma reserva encontrada.' : `Nenhuma reserva com status "${filter}".`}
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => {
                        const room = rooms.find(r => r.id === booking.roomId);
                        return (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                              <div className="text-sm text-gray-500">{booking.email}</div>
                              <div className="text-xs text-gray-400">{booking.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {room?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {booking.checkIn} <br/> {booking.checkOut}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              {booking.totalAmount.toLocaleString()} Kz
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {booking.status === 'pending' ? 'Pendente' : 
                                 booking.status === 'confirmed' ? 'Confirmada' : 
                                 booking.status === 'cancelled' ? 'Cancelada' : booking.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 gap-6 animate-fade-in">
            {rooms.map(room => (
              <div key={room.id} className="bg-white p-6 rounded shadow flex flex-col md:flex-row justify-between items-center">
                 <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <img src={room.image} alt={room.name} className="w-20 h-20 object-cover rounded" />
                    <div>
                       <h3 className="font-bold text-lg text-primary">{room.name}</h3>
                       <p className="text-xs text-gray-500">{room.id}</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Preço (Kz)</label>
                      <input 
                        type="number" 
                        value={room.price} 
                        onChange={(e) => handlePriceChange(room.id, e.target.value)}
                        className="border border-gray-300 rounded p-2 w-32"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Disponível?</label>
                      <select 
                         value={room.available ? 'yes' : 'no'} 
                         onChange={(e) => updateRoom({...room, available: e.target.value === 'yes'})}
                         className="border border-gray-300 rounded p-2"
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

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
            <div className="bg-white shadow rounded-lg overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700">Caixa de Entrada</h3>
                    <button onClick={() => fetchMessages()} className="text-sm text-primary hover:underline">
                        Atualizar
                    </button>
                </div>
                <ul className="divide-y divide-gray-200">
                    {contactMessages.length === 0 ? (
                        <li className="p-8 text-center text-gray-500">
                            Nenhuma mensagem recebida ainda.
                        </li>
                    ) : (
                        contactMessages.map((msg, idx) => (
                            <li key={msg.id || idx} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">
                                            {msg.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 block">{msg.name}</span>
                                            <span className="text-xs text-gray-500">{msg.email}</span>
                                        </div>
                                    </div>
                                    {msg.created_at && (
                                        <span className="text-xs text-gray-400">
                                            {new Date(msg.created_at).toLocaleDateString('pt-AO')} às {new Date(msg.created_at).toLocaleTimeString('pt-AO', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    )}
                                </div>
                                <div className="ml-10 bg-gray-50 p-3 rounded text-gray-700 text-sm border border-gray-100">
                                    {msg.message}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        )}

        {/* LIVE CHAT TAB */}
        {activeTab === 'livechat' && (
             <div className="bg-white shadow rounded-lg overflow-hidden animate-fade-in h-[600px] flex">
                 {/* Sidebar Lista de Sessões */}
                 <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
                    <div className="p-4 bg-white border-b sticky top-0">
                        <h3 className="font-bold text-gray-700">Conversas Ativas</h3>
                    </div>
                    <ul>
                        {groupedSessions.length === 0 && (
                            <li className="p-4 text-sm text-gray-500 text-center">Nenhuma conversa iniciada.</li>
                        )}
                        {groupedSessions.map(([sessionId, msgs]) => {
                            const lastMsg = msgs[msgs.length - 1];
                            const isSelected = selectedSessionId === sessionId;
                            return (
                                <li 
                                    key={sessionId} 
                                    onClick={() => setSelectedSessionId(sessionId)}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-sm text-gray-800">Visitante {sessionId.substring(0,6)}...</span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(lastMsg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{lastMsg.message}</p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                 </div>

                 {/* Chat Window */}
                 <div className="w-2/3 flex flex-col bg-white">
                     {selectedSessionId ? (
                         <>
                             {/* Header */}
                             <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                 <div>
                                     <h3 className="font-bold text-gray-800">Chat com Visitante</h3>
                                     <span className="text-xs text-gray-500">ID: {selectedSessionId}</span>
                                 </div>
                             </div>

                             {/* Messages */}
                             <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                                 {allChatMessages.filter(m => m.session_id === selectedSessionId).map((msg) => (
                                     <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                         <div className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${
                                             msg.sender === 'admin' 
                                                ? 'bg-primary text-white rounded-tr-none' 
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                         }`}>
                                             <p>{msg.message}</p>
                                             <p className={`text-[10px] mt-1 text-right ${msg.sender === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>
                                                 {new Date(msg.created_at).toLocaleTimeString()}
                                             </p>
                                         </div>
                                     </div>
                                 ))}
                                 <div ref={chatEndRef} />
                             </div>

                             {/* Input */}
                             <form onSubmit={handleAdminSendChat} className="p-4 border-t bg-white flex space-x-2">
                                 <input 
                                     type="text" 
                                     placeholder="Escreva sua resposta..." 
                                     className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                     value={adminInputText}
                                     onChange={(e) => setAdminInputText(e.target.value)}
                                 />
                                 <button 
                                     type="submit" 
                                     disabled={!adminInputText.trim()}
                                     className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                 >
                                     <Send className="w-5 h-5" />
                                 </button>
                             </form>
                         </>
                     ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                             <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                             <p>Selecione uma conversa ao lado para responder.</p>
                         </div>
                     )}
                 </div>
             </div>
        )}

      </div>
    </div>
  );
};
