import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, Activity, Booking, ContactMessage } from '../types';
import { INITIAL_ROOMS, INITIAL_ACTIVITIES } from '../constants';
import { supabase } from '../supabase';

interface DataContextType {
    rooms: Room[];
    activities: Activity[];
    bookings: Booking[];
    contactMessages: ContactMessage[]; // Novo estado
    addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
    updateRoom: (room: Room) => void;
    updateActivity: (activity: Activity) => void;
    loading: boolean;
    error: string | null;
    updateBookingStatus: (bookingId: string, newStatus: string) => Promise<void>;
    sendMessage: (message: ContactMessage) => Promise<void>;
    fetchMessages: () => Promise<void>; // Nova função
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
    const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]); // Estado para mensagens
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // Buscar reservas do Supabase
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('reservas')
                .select('*')
                .order('check_in', { ascending: true });

            if (error) throw error;

            // Mapear do formato do banco para o formato da aplicação
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
            // Não definir erro global para não bloquear a UI caso o backend não esteja configurado
            // setError('Falha ao carregar reservas');
        } finally {
            setLoading(false);
        }
    };

    // Buscar mensagens de contacto (Apenas admin consegue ler devido ao RLS)
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
            // Não lançamos erro aqui para não quebrar a UI de quem não é admin
        } finally {
            setLoading(false);
        }
    };

    // Adicionar nova reserva ao Supabase
    const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
        setLoading(true);
        setError(null);
        try {
            // Pegar o usuário atual (pode ser null se for convidado)
            const { data: { user } } = await supabase.auth.getUser();
            
            // Converter para o formato do banco de dados
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

            console.log(`Status da reserva ${bookingId} atualizado para ${newStatus}`);
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
            
            console.log("Mensagem enviada com sucesso para o Supabase.");
            
        } catch (err: any) {
            console.error('Erro ao enviar mensagem:', err);
            setError('Falha ao enviar mensagem: ' + (err.message || 'Erro desconhecido'));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <DataContext.Provider value={{
            rooms,
            activities,
            bookings,
            contactMessages,
            addBooking,
            updateRoom,
            updateActivity,
            loading,
            error,
            updateBookingStatus,
            sendMessage,
            fetchMessages
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