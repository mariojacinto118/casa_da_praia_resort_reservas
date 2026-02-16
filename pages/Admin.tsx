import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const Admin: React.FC = () => {
  const { bookings, rooms, updateRoom } = useData();
  const [activeTab, setActiveTab] = useState<'bookings' | 'rooms'>('bookings');
  const [filter, setFilter] = useState<string>('all');

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
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-primary">Painel Administrativo</h1>
           <div className="space-x-4">
             <button 
               onClick={() => setActiveTab('bookings')}
               className={`px-4 py-2 rounded ${activeTab === 'bookings' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
             >
               Reservas
             </button>
             <button 
               onClick={() => setActiveTab('rooms')}
               className={`px-4 py-2 rounded ${activeTab === 'rooms' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
             >
               Gerir Preços & Quartos
             </button>
           </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded shadow">
             <h3 className="text-gray-500 text-sm uppercase">Total Reservas</h3>
             <p className="text-3xl font-bold">{bookings.length}</p>
           </div>
           <div className="bg-white p-6 rounded shadow">
             <h3 className="text-gray-500 text-sm uppercase">Faturamento (Est.)</h3>
             <p className="text-3xl font-bold text-green-600">
               {bookings.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString('pt-AO')} Kz
             </p>
           </div>
           <div className="bg-white p-6 rounded shadow">
             <h3 className="text-gray-500 text-sm uppercase">Quartos Total</h3>
             <p className="text-3xl font-bold text-blue-600">{rooms.length}</p>
           </div>
        </div>

        {/* Content */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
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
          <div className="grid grid-cols-1 gap-6">
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
                      <label className="block text-xs text-gray-500">Preço (Kz)</label>
                      <input 
                        type="number" 
                        value={room.price} 
                        onChange={(e) => handlePriceChange(room.id, e.target.value)}
                        className="border border-gray-300 rounded p-2 w-32"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Disponível?</label>
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

      </div>
    </div>
  );
};

export default Admin;