import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, Activity, Booking, ContactMessage } from '../types';
import { INITIAL_ROOMS, INITIAL_ACTIVITIES } from '../constants';
import { supabase } from '../supabase';

interface ChatMessage {
    id: number;
    session_id: string;
    sender: 'admin' | 'user';
    message: string;
    created_at: string;
}

interface DataContextType {
    rooms: Room[];
    activities: Activity[];
    bookings: Booking[];
    contactMessages: ContactMessage[];
    chatMessages: ChatMessage[]; // Mensagens do chat (usuário atual)
    addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
    updateRoom: (room: Room) => void;
    updateActivity: (activity: Activity) => void;
    loading: boolean;
    error: string | null;
    updateBookingStatus: (bookingId: string, newStatus: string) => Promise<void>;
    sendMessage: (message: ContactMessage) => Promise<void>;
    fetchMessages: () => Promise<void>;
    sendChatMessage: (text: string, isAdmin?: boolean, targetSessionId?: string) => Promise<void>; // Atualizado
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
    const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    
    // Chat States
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatSessionId, setChatSessionId] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inicialização do Chat (Sessão e Realtime - Lado do Cliente)
    useEffect(() => {
        // 1. Identificar ou criar ID da sessão do usuário
        let sid = localStorage.getItem('chat_session_id');
        if (!sid) {
            sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('chat_session_id', sid);
        }
        setChatSessionId(sid);

        // 2. Carregar histórico inicial (apenas para este usuário)
        const fetchHistory = async () => {
            const { data } = await supabase
                .from('live_chat')
                .select('*')
                .eq('session_id', sid)
                .order('created_at', { ascending: true });
            
            if (data) {
                // Se não houver mensagens, adicionar boas-vindas localmente
                if (data.length === 0) {
                    setChatMessages([{
                        id: 0,
                        session_id: sid!,
                        sender: 'admin',
                        message: 'Olá! Bem-vindo à Casa da Praia. Como podemos ajudar na sua reserva hoje?',
                        created_at: new Date().toISOString()
                    }]);
                } else {
                    setChatMessages(data);
                }
            }
        };
        fetchHistory();

        // 3. Inscrever para atualizações em tempo real (Apenas mensagens desta sessão)
        const channel = supabase
            .channel('chat_room_user')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'live_chat', filter: `session_id=eq.${sid}` }, 
                (payload) => {
                    const newMsg = payload.new as ChatMessage;
                    setChatMessages(prev => {
                        // Evitar duplicatas
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Carregar reservas do Supabase ao iniciar
    useEffect(() => {
        fetchBookings();
    }, []);

    // Carregar rooms e activities do localStorage
    useEffect(() => {
        const savedRooms = localStorage.getItem('rooms');
        const savedActivities = localStorage.getItem('activities');

        if (savedRooms) setRooms(JSON.parse(savedRooms));
        if (savedActivities) setActivities(JSON.parse(savedActivities));
    }, []);

    // Salvar rooms e activities no localStorage
    useEffect(() => {
        localStorage.setItem('rooms', JSON.stringify(rooms));
    }, [rooms]);

    useEffect(() => {
        localStorage.setItem('activities', JSON.stringify(activities));
    }, [activities]);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('reservas')
                .select('*')
                .order('check_in', { ascending: true });

            if (error) throw error;

            const mappedBookings: Booking[] = data.map(item => ({
                id: item.id.toString(),
                customerName: item.customer_name,
                email: item.email,
                phone: item.phone,
                checkIn: item.check_in,
                checkOut: item.check_out,
                guests: item.guests,
                roomId: item.room_id,
                activities: item.activities || [],
                totalAmount: item.total_amount,
                status: item.status,
                paymentMethod: item.payment_method,
                createdAt: item.created_at
            }));

            setBookings(mappedBookings);
        } catch (err) {
            console.error('Erro ao buscar reservas:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            if (data) {
                setContactMessages(data);
            }
        } catch (err) {
            console.error('Erro ao buscar mensagens:', err);
        } finally {
            setLoading(false);
        }
    };

    const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const dbBooking = {
                user_id: user?.id || null,
                customer_name: bookingData.customerName,
                email: bookingData.email,
                phone: bookingData.phone,
                check_in: bookingData.checkIn,
                check_out: bookingData.checkOut,
                guests: bookingData.guests,
                room_id: bookingData.roomId,
                activities: bookingData.activities,
                total_amount: bookingData.totalAmount,
                status: bookingData.status || 'pending',
                payment_method: bookingData.paymentMethod
            };

            const { data, error } = await supabase
                .from('reservas')
                .insert([dbBooking])
                .select();

            if (error) throw error;

            if (data && data[0]) {
                const newBooking: Booking = {
                    id: data[0].id.toString(),
                    customerName: data[0].customer_name,
                    email: data[0].email,
                    phone: data[0].phone,
                    checkIn: data[0].check_in,
                    checkOut: data[0].check_out,
                    guests: data[0].guests,
                    roomId: data[0].room_id,
                    activities: data[0].activities || [],
                    totalAmount: data[0].total_amount,
                    status: data[0].status,
                    paymentMethod: data[0].payment_method,
                    createdAt: data[0].created_at
                };
                
                setBookings(prev => [...prev, newBooking]);
            }
        } catch (err) {
            console.error('Erro ao adicionar reserva:', err);
            setError('Falha ao criar reserva');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateRoom = (updatedRoom: Room) => {
        const newRooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
        setRooms(newRooms);
    };

    const updateActivity = (updatedActivity: Activity) => {
        const newActivities = activities.map(a => a.id === updatedActivity.id ? updatedActivity : a);
        setActivities(newActivities);
    };

    const updateBookingStatus = async (bookingId: string, newStatus: string) => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('reservas')
                .update({ status: newStatus })
                .eq('id', bookingId);

            if (error) throw error;

            setBookings(prev => 
                prev.map(booking => 
                    booking.id === bookingId 
                        ? { ...booking, status: newStatus } 
                        : booking
                )
            );
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            setError('Falha ao atualizar status da reserva');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (message: ContactMessage) => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    name: message.name,
                    email: message.email,
                    message: message.message
                }]);

            if (error) throw error;
        } catch (err: any) {
            console.error('Erro ao enviar mensagem:', err);
            setError('Falha ao enviar mensagem: ' + (err.message || 'Erro desconhecido'));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Função atualizada para suportar envio pelo Admin
    const sendChatMessage = async (text: string, isAdmin: boolean = false, targetSessionId?: string) => {
        try {
            const sessionToUse = targetSessionId || chatSessionId;
            const senderToUse = isAdmin ? 'admin' : 'user';

            await supabase.from('live_chat').insert([{
                session_id: sessionToUse,
                sender: senderToUse,
                message: text
            }]);
        } catch (err) {
            console.error('Erro ao enviar chat:', err);
        }
    };

    return (
        <DataContext.Provider value={{
            rooms,
            activities,
            bookings,
            contactMessages,
            chatMessages,
            addBooking,
            updateRoom,
            updateActivity,
            loading,
            error,
            updateBookingStatus,
            sendMessage,
            fetchMessages,
            sendChatMessage
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;}