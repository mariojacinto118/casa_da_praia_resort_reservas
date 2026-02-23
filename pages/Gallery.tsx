
import React, { useState } from 'react';
import SmartImage from '@/components/SmartImageComp';

const GALLERY_IMAGES = [
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/galeria-02.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/Galeria12.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/Galeria%2012.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/Galeria08.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/Galeria11.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/GALERIA09.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/galeria.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/galeria01.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/Galeria010.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/galeria03.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/Galeria04.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/galeria05.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/galeria06.jpg",
  "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/receipts/Imagens%20Galeria/galeria07.jpg"
];

const Gallery: React.FC = () => {
  const [images] = useState<string[]>(GALLERY_IMAGES);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-primary mb-8 text-center">Galeria de Fotos</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
           Explore os cantos do nosso paraíso. Da piscina refrescante aos quartos aconchegantes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((src, idx) => (
            <div key={idx} className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg shadow-md group bg-gray-100">
            <SmartImage 
                src={src} 
                alt={`Gallery ${idx}`} 
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
            />
            </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;

