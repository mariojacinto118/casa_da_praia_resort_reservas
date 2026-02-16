import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { bookings, rooms } = useData();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Filter bookings for this user (simple client-side filter for now)
  const userBookings = bookings.filter(b => b.email === user?.email);

  if (!user) {
      navigate('/login');
      return null;
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
           {/* Header */}
           <div className="bg-primary p-8 flex justify-between items-center text-white">
              <div className="flex items-center space-x-4">
                 <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-2xl font-serif text-primary">
                    {user.user_metadata.full_name ? user.user_metadata.full_name[0].toUpperCase() : user.email?.[0].toUpperCase()}
                 </div>
                 <div>
                    <h1 className="font-serif text-2xl">{user.user_metadata.full_name || 'Hóspede'}</h1>
                    <p className="text-white/70 text-sm">{user.email}</p>
                 </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
           </div>

           {/* Content */}
           <div className="p-8">
              <h2 className="font-serif text-2xl text-primary mb-6 flex items-center">
                 <Calendar className="w-6 h-6 mr-2 text-secondary" />
                 Minhas Reservas
              </h2>

              {userBookings.length === 0 ? (
                 <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 mb-4">Ainda não tem reservas efetuadas.</p>
                    <button 
                       onClick={() => navigate('/booking')}
                       className="text-secondary font-bold hover:underline uppercase tracking-wider text-xs"
                    >
                       Fazer minha primeira reserva
                    </button>
                 </div>
              ) : (
                 <div className="space-y-4">
                    {userBookings.map((booking) => {
                       const room = rooms.find(r => r.id === booking.roomId);
                       return (
                          <div key={booking.id} className="border border-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center bg-gray-50/50">
                             <div className="flex items-center space-x-4 mb-4 md:mb-0 w-full md:w-auto">
                                <img src={room?.image} alt={room?.name} className="w-20 h-20 object-cover rounded hidden sm:block" />
                                <div>
                                   <h3 className="font-bold text-primary">{room?.name}</h3>
                                   <p className="text-sm text-gray-500">Check-in: {booking.checkIn}</p>
                                   <p className="text-sm text-gray-500">Check-out: {booking.checkOut}</p>
                                </div>
                             </div>
                             <div className="text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 flex flex-row md:flex-col justify-between items-center md:items-end">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                   {booking.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                                </span>
                                <p className="font-serif text-xl font-bold text-primary mt-2">{booking.totalAmount.toLocaleString()} Kz</p>
                             </div>
                          </div>
                       )
                    })}
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;