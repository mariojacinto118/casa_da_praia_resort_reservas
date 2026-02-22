import React from 'react';
import { Room } from '../types';
import { User, Maximize } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  return (
    <div className="group block bg-white border border-gray-100 h-full flex flex-col hover:shadow-xl transition-all duration-500 ease-out">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img 
          src={room.image} 
          alt={room.name} 
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = 'https://picsum.photos/800/600?grayscale&blur=2'; // Fallback image
            console.warn(`Failed to load image for room: ${room.name} (${room.image})`);
          }}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
        
        {/* Price Tag Overlay */}
        <div className="absolute bottom-0 left-0 bg-white px-4 py-2">
           <span className="font-serif text-lg font-bold text-primary">{room.price.toLocaleString('pt-AO')} Kz</span>
           <span className="text-[10px] uppercase tracking-wider text-gray-500 ml-2">/ noite</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 md:p-8 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
           <h3 className="font-serif text-2xl text-primary font-medium group-hover:text-secondary transition-colors">{room.name}</h3>
        </div>
        
        <p className="text-gray-500 font-light text-sm leading-relaxed mb-6 flex-grow">{room.description}</p>
        
        <div className="flex items-center space-x-6 text-xs text-gray-400 uppercase tracking-widest mb-8 border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-secondary" />
            <span>Até {room.capacity} Pessoas</span>
          </div>
          <div className="flex items-center space-x-2">
            <Maximize className="w-4 h-4 text-secondary" />
            <span>Luxo & Conforto</span>
          </div>
        </div>

        <Link 
          to={`/booking?room=${room.id}`} 
          className="w-full inline-block text-center border border-primary text-primary hover:bg-primary hover:text-white py-3 transition-all duration-300 uppercase text-xs tracking-[0.2em]"
        >
          Reservar Estadia
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;