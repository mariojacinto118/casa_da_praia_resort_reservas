import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext'; // Assumindo que você tem um AuthContext
import { Booking } from '../types';

const AdminBookings = () => {
    const { bookings, updateBookingStatus, loading } = useData();
    const { user } = useAuth();
    const [filter, setFilter] = useState<string>('all');

    // Verificar se é admin (você precisa definir seu critério)
    const isAdmin = user?.email === 'marioantoniojacinto02@gmail.com'; // ou outro critério

    if (!isAdmin) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                <p>Você não tem permissão para acessar esta página.</p>
            </div>
        );
    }

    const filteredBookings = filter === 'all' 
        ? bookings 
        : bookings.filter(b => b.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'confirmed': return 'Confirmado';
            case 'cancelled': return 'Cancelado';
            case 'completed': return 'Concluído';
            default: return status;
        }
    };

    const formatGuests = (guests: { adults: number; children: number }) => {
        return `${guests.adults} adulto(s), ${guests.children} criança(s)`;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: 'AOA',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return <div className="text-center p-8">Carregando...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Administração de Reservas</h1>
            
            {/* Filtros */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
                >
                    Pendentes
                </button>
                <button
                    onClick={() => setFilter('confirmed')}
                    className={`px-4 py-2 rounded ${filter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                >
                    Confirmadas
                </button>
                <button
                    onClick={() => setFilter('cancelled')}
                    className={`px-4 py-2 rounded ${filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                >
                    Canceladas
                </button>
            </div>

            {/* Lista de Reservas */}
            <div className="grid gap-4">
                {filteredBookings.map((booking: Booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Informações do Cliente */}
                            <div>
                                <h3 className="font-bold">{booking.customerName}</h3>
                                <p className="text-sm text-gray-600">{booking.email}</p>
                                <p className="text-sm text-gray-600">{booking.phone}</p>
                            </div>

                            {/* Detalhes da Reserva */}
                            <div>
                                <p><span className="font-semibold">Check-in:</span> {new Date(booking.checkIn).toLocaleDateString('pt-AO')}</p>
                                <p><span className="font-semibold">Check-out:</span> {new Date(booking.checkOut).toLocaleDateString('pt-AO')}</p>
                                <p><span className="font-semibold">Hóspedes:</span> {formatGuests(booking.guests)}</p>
                                <p><span className="font-semibold">Quarto:</span> {booking.roomId}</p>
                                <p><span className="font-semibold">Total:</span> {formatCurrency(booking.totalAmount)}</p>
                            </div>

                            {/* Status e Ações */}
                            <div className="flex flex-col items-end justify-between">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                                    {getStatusText(booking.status)}
                                </span>
                                
                                <div className="flex gap-2 mt-4">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Confirmar
                                            </button>
                                            <button
                                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Rejeitar
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'confirmed' && (
                                        <button
                                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Concluir
                                        </button>
                                    )}
                                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                        <button
                                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Atividades Extras */}
                        {booking.activities && booking.activities.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="font-semibold">Atividades extras:</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {booking.activities.map((activity, index) => (
                                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                                            {activity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredBookings.length === 0 && (
                <p className="text-center text-gray-500 py-8">Nenhuma reserva encontrada.</p>
            )}
        </div>
    );
};

export default AdminBookings;