
export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: Category;
  description: string;
  image: string;
  gallery: string[];
  inStock: boolean;
  quantity?: number;
  rating: number;
  ratingCount: number;
}

export type Category = 'Dairy' | 'Produce' | 'Grains' | 'Canned' | 'Snacks' | 'Household' | 'Beverages' | 'Personal Care';

export interface User {
  id: string;
  name: string;
  role: 'Customer' | 'Merchant';
  email: string;
  avatar: string;
}

export interface Store {
  id: string;
  name: string;
  ownerId: string; // Changed from owner name to ownerId
  ownerName: string; // Keep name for display
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  phone: string;
  image: string;
  rating: number;
  products: Product[];
  tags: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
