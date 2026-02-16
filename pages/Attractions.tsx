import React from 'react';
import { useData } from '../context/DataContext';

const Attractions: React.FC = () => {
  const { activities } = useData();

  return (
    <div className="pt-20 min-h-screen bg-light">
      <div className="bg-primary text-white py-16 mb-12 text-center">
        <h1 className="font-serif text-5xl font-bold">Atrações e Lazer</h1>
        <p className="mt-4 text-xl opacity-90">Diversão e relaxamento para todas as idades.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
               <div className="h-64 overflow-hidden">
                 <img 
                   src={activity.image || 'https://picsum.photos/400/300'} 
                   alt={activity.name} 
                   className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                 />
               </div>
               <div className="p-6">
                 <h3 className="font-serif text-2xl font-bold text-primary mb-2">{activity.name}</h3>
                 <p className="text-gray-600 mb-4 h-12">{activity.description}</p>
                 <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-gray-500 text-sm">Preço por pessoa/hora</span>
                    <span className="text-xl font-bold text-secondary">
                      {activity.price === 0 ? 'Gratuito' : `${activity.price.toLocaleString('pt-AO')} Kz`}
                    </span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Attractions;