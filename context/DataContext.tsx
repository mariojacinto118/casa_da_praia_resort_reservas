import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, Activity, Booking, ContactMessage } from '../types';
import { INITIAL_ROOMS, INITIAL_ACTIVITIES } from '../constants';
import { supabase } from '../supabase';

interface DataContextType {
    rooms: Room[];
    activities: Activity[];
    bookings: Booking[];
    addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
    updateRoom: (room: Room) => void;
    updateActivity: (activity: Activity) => void;
    loading: boolean;
    error: string | null;
    updateBookingStatus: (bookingId: string, newStatus: string) => Promise<void>;
    sendMessage: (message: ContactMessage) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
    const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
    const [bookings, setBookings] = useState<Booking[]>([]);
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
            setError('Falha ao carregar reservas');
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
            // user_id pode ser null se o banco permitir, caso contrário o Supabase retornará erro
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
                // Mapear de volta para o formato da aplicação
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

            // Atualizar estado local
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

    // Nova função para enviar mensagens
    const sendMessage = async (name: string, email: string, message: string) => {
    try {
      console.log('Enviando mensagem:', { name, email, message });
      
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado');
      }

      const { data, error } = await supabase
        .from('mensagens')
        .insert([
          {
            name,
            email,
            message,
            created_at: new Date().toISOString(),
            status: 'sent'
          }
        ])
        .select();

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      console.log('Mensagem salva:', data);

      // Atualizar estado local com a mensagem salva
      if (data && data[0]) {
        setMessages(prev => [...prev, data[0]]);
      } else {
        // Fallback para quando não retorna dados
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          name,
          email,
          message,
          created_at: new Date().toISOString(),
          status: 'sent'
        }]);
      }
      
      return { success: true, error: null };
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  };
  
  const [messages, setMessages] = useState<ContactMessage[]>([]);

   return (
    <DataContext.Provider value={{ 
        rooms, 
        activities, 
        bookings, 
        messages,        // ← ADICIONE ESTA LINHA
        addBooking, 
        updateRoom, 
        updateActivity, 
        loading, 
        error, 
        updateBookingStatus, 
        sendMessage      // a função sendMessage já está aqui
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
