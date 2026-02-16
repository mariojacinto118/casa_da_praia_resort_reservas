import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';

const AdminBookings = () => {
    const { bookings, updateBookingStatus, loading } = useData();
    const { user } = useAuth();
    const [filter, setFilter] = useState<string>('all');

    // Verificar se é admin (você precisa definir seu critério)
    const isAdmin = user?.email === 'marioantoniojacinto02@gmail.com'; // ou outro critério

    if (!isAdmin) {
        return (
            <div className="container mx-auto p-4 pt-24">
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
        return <div className="text-center p-8 pt-24">Carregando...</div>;
    }

    return (
        <div className="container mx-auto p-4 pt-24 pb-20">
            <h1 className="text-3xl font-bold mb-6 text-primary">Administração de Reservas</h1>
            
            {/* Filtros */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded whitespace-nowrap ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded whitespace-nowrap ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    Pendentes
                </button>
                <button
                    onClick={() => setFilter('confirmed')}
                    className={`px-4 py-2 rounded whitespace-nowrap ${filter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    Confirmadas
                </button>
                <button
                    onClick={() => setFilter('cancelled')}
                    className={`px-4 py-2 rounded whitespace-nowrap ${filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    Canceladas
                </button>
            </div>

            {/* Lista de Reservas */}
            <div className="grid gap-4">
                {filteredBookings.map((booking: Booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 shadow-md bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Informações do Cliente */}
                            <div>
                                <h3 className="font-bold text-lg">{booking.customerName}</h3>
                                <p className="text-sm text-gray-600">{booking.email}</p>
                                <p className="text-sm text-gray-600">{booking.phone}</p>
                            </div>

                            {/* Detalhes da Reserva */}
                            <div className="text-sm">
                                <p><span className="font-semibold">Check-in:</span> {booking.checkIn}</p>
                                <p><span className="font-semibold">Check-out:</span> {booking.checkOut}</p>
                                <p><span className="font-semibold">Hóspedes:</span> {formatGuests(booking.guests)}</p>
                                <p><span className="font-semibold">Total:</span> <span className="text-primary font-bold">{formatCurrency(booking.totalAmount)}</span></p>
                            </div>

                            {/* Status e Ações */}
                            <div className="flex flex-col items-end justify-between">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                    {getStatusText(booking.status)}
                                </span>
                                
                                <div className="flex gap-2 mt-4 flex-wrap justify-end">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                            >
                                                Confirmar
                                            </button>
                                            <button
                                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                            >
                                                Rejeitar
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'confirmed' && (
                                        <button
                                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                        >
                                            Concluir
                                        </button>
                                    )}
                                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                        <button
                                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Atividades Extras */}
                        {booking.activities && booking.activities.length > 0 && (
                            <div className="mt-4 pt-4 border-t text-sm">
                                <p className="font-semibold text-gray-600">Atividades extras:</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {booking.activities.map((activity, index) => (
                                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
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
                <div className="text-center py-12 bg-white rounded shadow">
                    <p className="text-gray-500">Nenhuma reserva encontrada com este filtro.</p>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;