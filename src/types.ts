export interface Client {
  id: string;
  restaurant_name: string;
  logo: string;
  cover_image: string;
  phone: string;
  address: string;
  slug: string;
  theme: 'light' | 'dark' | 'emerald' | 'rose' | 'amber';
  created_at: string;
}

export interface Category {
  id: string;
  client_id: string;
  name: string;
  sort_order: number;
}

export interface Product {
  id: string;
  client_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string;
  status: 'active' | 'passive';
  created_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  qr_code: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'client';
  created_at: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}
