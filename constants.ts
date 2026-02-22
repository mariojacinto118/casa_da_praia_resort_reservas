
import { Room, Activity, Translation } from './types';
import { getStorageUrl } from './supabase';

export const RESORT_INFO = {
  name: "Casa da Praia",
  phone: "+244 929 729 931",
  email: "reservas@casadapraia.ao",
  checkIn: "14:00",
  checkOut: "12:00",
  poolHours: "09:00 - 18:00",
};

// --- LISTA DE ADMINISTRADORES ---
// Adicione aqui os emails que devem ter acesso ao painel.
// Separe por vírgulas e use aspas.
export const ADMIN_EMAILS = [
  'marioantoniojacinto02@gmail.com',
  // 'sócio@casadapraia.ao', 
  // 'gerente@gmail.com'
];

// Imagens configuradas para o bucket 'resort_assets'
export const INITIAL_ROOMS: Room[] = [
  {
    id: 'std',
    name: 'Suíte Standard',
    price: 72350,
    description: 'Conforto e elegância para casais ou viajantes individuais. Quarto acolhedor com acabamentos de luxo.',
    capacity: 2,
    features: ['Wi-Fi', 'Ar Condicionado', 'TV Cabo', 'Frigobar'],
    image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/standrd.jpg",
    available: true,
    quantity: 5,
  },
  {
    id: 'dlx',
    name: 'Suíte Deluxe',
    price: 110500,
    description: 'Mais espaço e vistas privilegiadas para o mar. Perfeito para quem aprecia o nascer do sol.',
    capacity: 2,
    features: ['Vista Mar', 'King Size Bed', 'Room Service', 'Varanda'],
    image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/deluxe.jpg",
    available: true,
    quantity: 6,
  },
  {
    id: 'dlxp',
    name: 'Suíte Deluxe Premium',
    price: 135000,
    description: 'O equilíbrio perfeito entre luxo e comodidade, com acabamentos premium e localização privilegiada.',
    capacity: 2,
    features: ['Varanda Privada', 'Banheira', 'Amenities Premium', 'Vista Panorâmica'],
    image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/deluxe-premiu.jpg",
    available: true,
    quantity: 7,
  },
  {
    id: 'chalet',
    name: 'Chalé com Piscina',
    price: 195000,
    description: 'Privacidade total com sua própria piscina particular. Ideal para momentos românticos.',
    capacity: 4,
    features: ['Piscina Privada', 'Área Externa', 'Cozinha Compacta', 'Rede de Descanso'],
    image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/piscina-privativa.jpg",
    available: true,
    quantity: 5,
  },
  {
    id: 'master',
    name: 'Suíte Master com Jango',
    price: 242500,
    description: 'Espaço exclusivo para relaxar com estilo. Inclui um Jango privativo para suas refeições.',
    capacity: 4,
    features: ['Jango Privativo', 'Vista Panorâmica', 'Decoração Exclusiva', 'Jacuzzi'],
    image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/master-com-jango.jpg",
    available: true,
    quantity: 3,
  },
  {
    id: 'duplex',
    name: 'Duplex',
    price: 235500,
    description: 'Ideal para famílias que buscam conforto em dois andares. Espaço amplo e bem distribuído.',
    capacity: 6,
    features: ['Dois Andares', 'Sala de Estar', 'Múltiplos Banheiros', 'Varanda Dupla'],
    image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/duplex.jpg",
    available: true,
    quantity: 4,
  },
  {
    id: 'duplex_prem',
    name: 'Duplex Premium c/ Jango',
    price: 350000,
    description: 'A experiência suprema da Casa da Praia. Todo o luxo e espaço que você pode imaginar.',
    capacity: 8,
    features: ['Jango Exclusivo', 'Área VIP', 'Serviço de Mordomo', 'Acesso Direto à Praia'],
    image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/duplex-premium-com-jango.jpg",
    available: true,
    quantity: 4,
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'pool_adult', name: 'Piscina (Adulto +10)', price: 10000, image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/piscina.jpg", description: 'Refresque-se em nossa piscina infinita.' },
  { id: 'pool_child', name: 'Piscina (2-9 anos)', price: 7000, image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/piscina.jpg", description: 'Área segura e divertida para os pequenos.' },
  { id: 'horse', name: 'Passeio à Cavalo', price: 10000, image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/passeio-a-cavalo.jpg", description: 'Passeio relaxante pela orla da praia.' },
  { id: 'boat', name: 'Passeio de Barco', price: 15000, image: getStorageUrl('activities/boat.jpg'), description: 'Explore a costa e aprecie a vista do mar.' },
  { id: 'lounge', name: 'Espreguiçadeira', price: 5000, image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/Espreg.jpg", description: 'Conforto para tomar sol.' },
  { id: 'towel', name: 'Toalha', price: 3000, image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/toalha.jpg", description: 'Aluguel de toalha de praia.' },
  { id: 'snooker', name: 'Snooker (1h)', price: 5000, image: getStorageUrl('activities/snooker.jpg'), description: 'Divirta-se com amigos no nosso salão de jogos.' },
  { id: 'playground', name: 'Parque Infantil', price: 0, image: "https://bkyfosvqceaivtoinemw.supabase.co/storage/v1/object/public/resort_assets/suites/parque-infantil.jpg", description: 'Diversão garantida para as crianças (Gratuito).' },
];

export const EXTRA_MATTRESS = {
  child: 35000, // 5-10
  adult: 45000, // 11+
};

export const TRANSLATIONS: Translation = {
  heroTitle: { pt: "Bem-vindo ao Paraíso", en: "Welcome to Paradise" },
  heroSubtitle: { pt: "Luxo, conforto e natureza em harmonia perfeita.", en: "Luxury, comfort and nature in perfect harmony." },
  bookNow: { pt: "Reservar Agora", en: "Book Now" },
  explore: { pt: "Explorar", en: "Explore" },
  about: { pt: "Sobre", en: "About" },
  accommodations: { pt: "Acomodações", en: "Accommodations" },
  attractions: { pt: "Atrações", en: "Attractions" },
  restaurant: { pt: "Restaurante", en: "Restaurant" },
  contact: { pt: "Contactos", en: "Contact" },
  home: { pt: "Início", en: "Home" },
  gallery: { pt: "Galeria", en: "Gallery" },
  policy: { pt: "Política de Cancelamento", en: "Cancellation Policy" },
  admin: { pt: "Administração", en: "Admin" },
  successTitle: { pt: "Reserva Solicitada!", en: "Booking Requested!" },
  successMsg: { pt: "Entraremos em contacto em breve para confirmar.", en: "We will contact you shortly to confirm." },
  myBookings: { pt: "Minhas Reservas", en: "My Bookings" },
};
