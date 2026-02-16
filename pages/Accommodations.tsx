import React from 'react';
import { useData } from '../context/DataContext';
import RoomCard from '../components/RoomCard';
import { motion } from 'framer-motion';

const Accommodations: React.FC = () => {
  const { rooms } = useData();

  return (
    <div className="pt-20 min-h-screen bg-light">
      <div className="bg-primary text-white py-16 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <img src="https://picsum.photos/id/20/1920/600" alt="Header" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Nossas Acomodações</h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-200">
            Cada suíte foi desenhada para proporcionar o máximo de conforto, luxo e privacidade durante a sua estadia.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RoomCard room={room} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Accommodations;