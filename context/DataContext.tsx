
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, Activity, Booking, ContactMessage, ChatMessage } from './types';
import { INITIAL_ROOMS, INITIAL_ACTIVITIES } from '../constants';
import { supabase } from '../supabase';

interface DataContextType {
    rooms: Room[];
    activities: Activity[];
    bookings: Booking[];
    contactMessages: ContactMessage[];
    chatMessages: ChatMessage[]; 
    addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
    updateRoom: (room: Room) => Promise<void>;
    updateActivity: (activity: Activity) => void;
    loading: boolean;
    error: string | null;
    updateBookingStatus: (bookingId: string, newStatus: Booking['status']) => Promise<void>;
    sendMessage: (message: ContactMessage) => Promise<void>;
    fetchMessages: () => Promise<void>;
    sendChatMessage: (text: string, isAdmin?: boolean, targetSessionId?: string) => Promise<ChatMessage | null>;
    getAvailableQuantity: (roomId: string, checkIn: string, checkOut: string) => number;
    refreshBookings: () => Promise<void>;
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

    // Inicialização do Chat
    useEffect(() => {
        let sid = localStorage.getItem('chat_session_id');
        if (!sid) {
            sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('chat_session_id', sid);
        }
        setChatSessionId(sid);

        const fetchHistory = async () => {
            const { data } = await supabase
                .from('live_chat')
                .select('*')
                .eq('session_id', sid)
                .order('created_at', { ascending: true });
            
            if (data) {
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

        const channel = supabase
            .channel('chat_room_user')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'live_chat', filter: `session_id=eq.${sid}` }, 
                (payload) => {
                    const newMsg = payload.new as ChatMessage;
                    setChatMessages(prev => {
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

    useEffect(() => {
        fetchBookings();
        fetchRoomInventory(); // Buscar inventário real do Supabase
    }, []);

    // Carregar dados locais (Preço, Descrição) mas respeitar a quantidade do DB
    useEffect(() => {
        const savedRooms = localStorage.getItem('rooms');
        const savedActivities = localStorage.getItem('activities');
        
        if (savedRooms) {
            const parsedRooms = JSON.parse(savedRooms);
            setRooms(prevRooms => {
                // Mesclar o que veio do localStorage com o estado atual (que pode ter dados do Supabase)
                return parsedRooms.map((localRoom: Room) => {
                    const currentRoom = prevRooms.find(r => r.id === localRoom.id);
                    return {
                        ...localRoom,
                        // Se já temos dados do Supabase (currentRoom), usamos a quantidade dele.
                        // Caso contrário, usamos do localStorage como fallback.
                        quantity: currentRoom ? currentRoom.quantity : localRoom.quantity
                    };
                });
            });
        }
        if (savedActivities) setActivities(JSON.parse(savedActivities));
    }, []);

    useEffect(() => {
        localStorage.setItem('rooms', JSON.stringify(rooms));
    }, [rooms]);

    useEffect(() => {
        localStorage.setItem('activities', JSON.stringify(activities));
    }, [activities]);

    // Busca a quantidade real de quartos configurada no Supabase
    const fetchRoomInventory = async () => {
        try {
            const { data, error } = await supabase.from('rooms').select('id, quantity');
            
            if (error) {
                console.warn('Erro ao buscar inventário de quartos:', error.message);
                return;
            }

            if (data && data.length > 0) {
                setRooms(prevRooms => {
                    return prevRooms.map(room => {
                        const dbRoom = data.find((d: any) => d.id === room.id);
                        if (dbRoom) {
                            return { ...room, quantity: dbRoom.quantity };
                        }
                        return room;
                    });
                });
            }
        } catch (err) {
            console.error('Erro no fetchRoomInventory:', err);
        }
    };

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
                paymentDetails: item.payment_details || undefined,
                receiptUrl: item.receipt_url, // Atualizado para ler do banco
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
            
            if (!user) {
                throw new Error("Sessão expirada. Por favor, faça login novamente.");
            }
            
            const dbBooking = {
                user_id: user.id,
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
                payment_method: bookingData.paymentMethod || 'transfer',
            };

            const { data, error } = await supabase
                .from('reservas')
                .insert([dbBooking])
                .select();

            if (error) {
                console.error("Erro detalhado do Supabase:", error);
                throw new Error(error.message);
            }

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
                    paymentDetails: data[0].payment_details,
                    receiptUrl: data[0].receipt_url, // Atualizado para ler do banco
                    createdAt: data[0].created_at
                };
                
                setBookings(prev => [...prev, newBooking]);
            }
        } catch (err: any) {
            console.error('Erro ao adicionar reserva:', err);
            setError(err.message || 'Falha ao criar reserva');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateRoom = async (updatedRoom: Room) => {
        // 1. Atualiza estado local (para refletir na UI imediatamente)
        const newRooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
        setRooms(newRooms);

        // 2. Salva a quantidade no Supabase (Inventário Real)
        try {
            const { error } = await supabase
                .from('rooms')
                .upsert({ 
                    id: updatedRoom.id, 
                    quantity: updatedRoom.quantity,
                    name: updatedRoom.name // Mantém o nome sincronizado
                });
            
            if (error) {
                console.error("Erro ao salvar inventário no Supabase:", error);
                // Não revertemos o estado local para não travar a UI, mas logamos o erro
            }
        } catch (err) {
            console.error("Erro de conexão ao atualizar quarto:", err);
        }
    };

    const updateActivity = (updatedActivity: Activity) => {
        const newActivities = activities.map(a => a.id === updatedActivity.id ? updatedActivity : a);
        setActivities(newActivities);
    };

    const updateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
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
        } catch (err: any) {
            console.error('Erro ao atualizar status:', err);
            alert(`Erro ao atualizar status: ${err.message || 'Erro de permissão ou conexão'}. Verifique as Políticas RLS no Supabase.`);
            setError('Falha ao atualizar status da reserva');
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

    const sendChatMessage = async (text: string, isAdmin: boolean = false, targetSessionId?: string) => {
        try {
            const sessionToUse = targetSessionId || chatSessionId;
            const senderToUse = isAdmin ? 'admin' : 'user';

            const { data, error } = await supabase.from('live_chat').insert([{
                session_id: sessionToUse,
                sender: senderToUse,
                message: text
            }]).select();

            if (error) throw error;
            
            const sentMsg = data?.[0] as ChatMessage;

            if (!isAdmin && sentMsg) {
                setChatMessages(prev => {
                     if (prev.find(m => m.id === sentMsg.id)) return prev;
                     return [...prev, sentMsg];
                });
            }

            return sentMsg;
        } catch (err) {
            console.error('Erro ao enviar chat:', err);
            return null;
        }
    };

    // LÓGICA DE DISPONIBILIDADE (Inventário Real)
    const getAvailableQuantity = (roomId: string, checkIn: string, checkOut: string): number => {
        if (!checkIn || !checkOut) return -1;

        const targetRoom = rooms.find(r => r.id === roomId);
        if (!targetRoom) return 0;

        const requestStart = new Date(checkIn);
        const requestEnd = new Date(checkOut);
        
        if (requestStart >= requestEnd) return 0;

        const overlappingBookings = bookings.filter(b => {
            if (b.roomId !== roomId) return false;
            if (b.status === 'cancelled') return false; 

            const bookingStart = new Date(b.checkIn);
            const bookingEnd = new Date(b.checkOut);

            return (requestStart < bookingEnd) && (requestEnd > bookingStart);
        });

        const totalInventory = targetRoom.quantity || 0;
        const available = totalInventory - overlappingBookings.length;

        return Math.max(0, available);
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
            sendChatMessage,
            getAvailableQuantity,
            refreshBookings: fetchBookings
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
    return context;
};
