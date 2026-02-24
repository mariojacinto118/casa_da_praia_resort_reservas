
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
  'mariojacinto110@gmail.com',
  // 'sócio@casadapraia.ao', 
  // 'gerente@gmail.com'
];

// --- SUPER ADMINISTRADORES ---
// Apenas estes emails podem editar configurações críticas (ex: Quartos)
export const SUPER_ADMIN_EMAILS = [
  'marioantoniojacinto02@gmail.com'
];

// Imagens configuradas com Unsplash para garantir carregamento
export const INITIAL_ROOMS: Room[] = [
  {
    id: 'std',
    name: 'Suíte Standard',
    price: 72350,
    description: 'Conforto e elegância para casais ou viajantes individuais. Quarto acolhedor com acabamentos de luxo.',
    capacity: 2,
    features: ['Wi-Fi', 'Ar Condicionado', 'TV Cabo', 'Frigobar'],
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    available: true,
    quantity: 4,
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'pool_adult', name: 'Piscina (Adulto +10)', price: 10000, image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80", description: 'Refresque-se em nossa piscina infinita.' },
  { id: 'pool_child', name: 'Piscina (2-9 anos)', price: 7000, image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80", description: 'Área segura e divertida para os pequenos.' },
  { id: 'horse', name: 'Passeio à Cavalo', price: 10000, image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80", description: 'Passeio relaxante pela orla da praia.' },
  { id: 'boat', name: 'Passeio de Barco', price: 15000, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", description: 'Explore a costa e aprecie a vista do mar.' },
  { id: 'lounge', name: 'Espreguiçadeira', price: 5000, image: "https://images.unsplash.com/photo-1533630762319-752e52d3f5a2?auto=format&fit=crop&w=800&q=80", description: 'Conforto para tomar sol.' },
  { id: 'towel', name: 'Toalha', price: 3000, image: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80", description: 'Aluguel de toalha de praia.' },
  { id: 'snooker', name: 'Snooker (1h)', price: 5000, image: "https://images.unsplash.com/photo-1572293427923-2343916966d5?auto=format&fit=crop&w=800&q=80", description: 'Divirta-se com amigos no nosso salão de jogos.' },
  { id: 'playground', name: 'Parque Infantil', price: 0, image: "https://images.unsplash.com/photo-1558280417-ea782f829e93?auto=format&fit=crop&w=800&q=80", description: 'Diversão garantida para as crianças (Gratuito).' },
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