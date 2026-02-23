import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const SmartImage: React.FC<SmartImageProps> = ({ 
  src, 
  alt, 
  fallbackSrc = 'https://picsum.photos/800/600?grayscale&blur=2', 
  className, 
  ...props 
}) => {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
    setError(true);
    setImgSrc(fallbackSrc);
  };

  if (error) {
    return (
      <div className={`relative bg-gray-100 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <img 
            src={fallbackSrc} 
            alt="Fallback" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
        />
        <div className="relative z-10 flex flex-col items-center text-gray-500 p-4 text-center">
            <ImageOff className="w-8 h-8 mb-2 opacity-70" />
            <span className="text-[10px] uppercase tracking-widest">Imagem indisponível</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      {...props}
    />
  );
};

export default SmartImage;
