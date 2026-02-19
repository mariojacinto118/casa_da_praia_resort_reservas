
export interface Room {
  id: string;
  name: string;
  price: number;
  description: string;
  capacity: number;
  features: string[];
  image: string;
  available: boolean;
  quantity: number; // Campo adicionado para controle de inventário
}

export interface Activity {
  id: string;
  name: string;
  price: number;
  unit?: string;
  image?: string;
  description?: string;
}

export interface PaymentDetails {
  entity?: string;
  reference?: string;
  iban?: string;
  bankName?: string;
  swift?: string;
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
  // Adicionado 'completed' para suportar o fluxo do AdminBookings
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod?: string;
  paymentDetails?: PaymentDetails;
  receiptUrl?: string; 
  createdAt: string;
}

export interface TableReservation {
  id?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
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
  is_read?: boolean;
  created_at: string;
}

export type Language = 'pt' | 'en';

export interface Translation {
  [key: string]: {
    pt: string;
    en: string;
  };
}
