
import React, { useEffect, useState } from 'react';
import { supabase, getStorageUrl } from '../supabase';

const Gallery: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      // Busca a lista de arquivos na pasta 'gallery' do bucket 'resort_assets'
      const { data, error } = await supabase
        .storage
        .from('resort_assets')
        .list('gallery', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        throw error;
      }

      if (data) {
        // Filtra para garantir que são imagens e não pastas (placeholders)
        const imageUrls = data
          .filter(item => item.name !== '.emptyFolderPlaceholder')
          .map(item => getStorageUrl(`gallery/${item.name}`));
        
        setImages(imageUrls);
      }
    } catch (error) {
      console.error('Erro ao carregar galeria:', error);
      // Fallback para imagens de exemplo se houver erro ou pasta vazia
      setImages([
         "https://picsum.photos/id/11/800/600",
         "https://picsum.photos/id/12/800/600",
         "https://picsum.photos/id/13/800/600",
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-primary mb-8 text-center">Galeria de Fotos</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
           Explore os cantos do nosso paraíso. Da piscina refrescante aos quartos aconchegantes.
        </p>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((src, idx) => (
                <div key={idx} className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg shadow-md group bg-gray-100">
                <img 
                    src={src} 
                    alt={`Gallery ${idx}`} 
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        // Fallback visual caso a imagem não carregue
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/800/600?grayscale';
                    }} 
                />
                </div>
            ))}
            {images.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-12">
                    Nenhuma imagem encontrada na galeria.
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
