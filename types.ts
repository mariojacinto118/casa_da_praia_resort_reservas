
export interface Room {
  id: string;
  name: string;
  price: number;
  description: string;
  capacity: number;
  features: string[];
  image: string;
  available: boolean;
}

export interface Activity {
  id: string;
  name: string;
  price: number;
  unit?: string;
  image?: string;
  description?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  roomId: string;
  activities: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentMethod: 'multicaixa' | 'card' | 'transfer';
  createdAt: string;
}

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  message: string;
  created_at?: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  sender: 'user' | 'admin';
  message: string;
  created_at: string;
}

export type Language = 'pt' | 'en';

export interface Translation {
  [key: string]: {
    pt: string;
    en: string;
  };
}