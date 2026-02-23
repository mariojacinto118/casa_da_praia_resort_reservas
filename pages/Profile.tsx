
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar, MessageCircle, Upload, FileText, Check, Loader2, Paperclip, Eye, X, ExternalLink } from 'lucide-react';
import { useData } from '../context/DataContext';
import { supabase, getStorageUrl } from '../supabase';
import SmartImage from '../components/SmartImageComp';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { bookings, rooms, activities, refreshBookings } = useData();
  const navigate = useNavigate();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, bookingId: string) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert("O arquivo é muito grande. Máximo 5MB.");
          return;
      }

      setUploadingId(bookingId);
      try {
          // 1. Upload to Supabase Storage
          const fileExt = file.name.split('.').pop();
          const fileName = `${bookingId}_${Date.now()}.${fileExt}`;
          const filePath = `receipts/${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('resort_assets')
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          // 2. Get Public URL
          const { data: { publicUrl } } = supabase.storage
              .from('resort_assets')
              .getPublicUrl(filePath);

          // 3. Update Booking Table
          const { error: dbError } = await supabase
              .from('reservas')
              .update({ receipt_url: publicUrl })
              .eq('id', bookingId);

          if (dbError) throw dbError;

          alert("Comprovativo enviado com sucesso! A reserva será analisada.");
          
          // Atualiza a lista de reservas instantaneamente
          await refreshBookings();

      } catch (error: any) {
          console.error("Erro no upload:", error);
          alert("Erro ao enviar comprovativo: " + error.message);
      } finally {
          setUploadingId(null);
      }
  };

  const handleViewReceipt = (url: string) => {
    // Se for PDF, abre em nova aba. Se for imagem, abre no modal.
    if (url.toLowerCase().includes('.pdf')) {
        window.open(url, '_blank');
    } else {
        setPreviewImage(url);
    }
  };

  const userBookings = bookings.filter(b => b.email === user?.email);

  if (!user) {
      navigate('/login');
      return null;
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-stone-50 relative">
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
                 <div className="space-y-6">
                    {userBookings.map((booking) => {
                       const room = rooms.find(r => r.id === booking.roomId);
                       const isConfirmed = booking.status === 'confirmed';
                       const hasReceipt = !!booking.receiptUrl;
                       
                       return (
                          <div key={booking.id} className="border border-gray-100 rounded-lg p-6 hover:shadow-md transition-all bg-gray-50/50">
                             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                 {/* Imagem e Info */}
                                 <div className="flex items-start space-x-4">
                                     <SmartImage src={room?.image} alt={room?.name} className="w-20 h-20 object-cover rounded hidden sm:block" />
                                     <div>
                                         <h3 className="font-bold text-primary text-lg">{room?.name || 'Acomodação'}</h3>
                                         <div className="text-sm text-gray-500 space-y-1 mt-1">
                                             <p>ID: #{booking.id.slice(-6)}</p>
                                             <p>Check-in: {booking.checkIn}</p>
                                             <p>Check-out: {booking.checkOut}</p>
                                         </div>
                                     </div>
                                 </div>
                                 
                                 {/* Status e Preço */}
                                 <div className="text-right flex flex-col items-end">
                                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                                         isConfirmed ? 'bg-green-100 text-green-800' : 
                                         booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                         'bg-yellow-100 text-yellow-800'
                                     }`}>
                                         {booking.status === 'pending' ? 'Pendente' : 
                                          booking.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                                     </span>
                                     <p className="font-serif text-xl font-bold text-primary">{booking.totalAmount.toLocaleString()} Kz</p>
                                 </div>
                             </div>

                             {/* Área de Ação (Upload/Status) */}
                             <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                                 <div className="text-xs text-gray-500 flex items-center">
                                     {hasReceipt ? (
                                         <span className="text-green-600 flex items-center font-bold">
                                             <Check className="w-4 h-4 mr-1" /> Comprovativo Enviado
                                         </span>
                                     ) : (
                                         booking.status === 'pending' && <span className="text-orange-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Aguardando comprovativo</span>
                                     )}
                                     {booking.receiptUrl && (
                                         <button 
                                            onClick={() => handleViewReceipt(booking.receiptUrl!)}
                                            className="ml-3 text-blue-600 hover:text-blue-800 underline flex items-center transition-colors"
                                         >
                                             <Eye className="w-3 h-3 mr-1" /> Ver anexo
                                         </button>
                                     )}
                                 </div>

                                 {booking.status === 'pending' && (
                                     <div className="flex gap-3">
                                         {/* Upload Button */}
                                         <label className={`
                                            flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors cursor-pointer text-sm
                                            ${uploadingId === booking.id ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}
                                         `}>
                                            {uploadingId === booking.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Paperclip className="w-4 h-4" />
                                            )}
                                            <span>{hasReceipt ? 'Reenviar Comprovativo' : 'Anexar Comprovativo'}</span>
                                            <input 
                                                type="file" 
                                                accept="image/*,.pdf" 
                                                className="hidden" 
                                                onChange={(e) => handleFileUpload(e, booking.id)}
                                                disabled={uploadingId === booking.id}
                                            />
                                         </label>
                                     </div>
                                 )}
                             </div>
                          </div>
                       )
                    })}
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* MODAL DE VISUALIZAÇÃO DE IMAGEM */}
      {previewImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
                <div className="relative max-w-4xl w-full max-h-[90vh] bg-transparent flex flex-col items-center" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end w-full mb-2 space-x-2">
                        <a 
                            href={previewImage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                            title="Abrir original em nova aba"
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

// Ícone auxiliar
const AlertTriangle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

export default Profile;
