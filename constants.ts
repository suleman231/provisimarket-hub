
import { Store, Category, User } from './types';

export const CATEGORIES: Category[] = [
  'Produce', 'Dairy', 'Grains', 'Canned', 'Snacks', 'Beverages', 'Household', 'Personal Care'
];

export const CURRENT_USER: User = {
  id: 'usr-8821',
  name: 'Maria Santos',
  role: 'Merchant',
  email: 'maria@sunnyside.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
};

export const MOCK_STORES: Store[] = [
  {
    id: 's1',
    name: "Sunnyside Grocers",
    ownerId: 'usr-8821',
    ownerName: "Maria Santos",
    address: "123 Market St, Downtown",
    location: { lat: 40.7128, lng: -74.0060 },
    phone: "555-0101",
    image: "https://picsum.photos/seed/store1/600/400",
    rating: 4.8,
    tags: ["Fresh", "Organic", "Local"],
    products: [
      {
        id: 'p1',
        name: "Farm Fresh Eggs",
        price: 4.50,
        unit: "Dozen",
        category: 'Dairy',
        description: "Organic brown eggs from free-range chickens.",
        image: "https://picsum.photos/seed/eggs/300/200",
        gallery: ["https://picsum.photos/seed/eggs-alt/300/200"],
        inStock: true,
        quantity: 50,
        rating: 4.9,
        ratingCount: 124
      },
      {
        id: 'p2',
        name: "Red Gala Apples",
        price: 3.99,
        unit: "kg",
        category: 'Produce',
        description: "Sweet and crunchy gala apples.",
        image: "https://picsum.photos/seed/apple/300/200",
        gallery: [],
        inStock: true,
        quantity: 120,
        rating: 4.7,
        ratingCount: 88
      }
    ]
  },
  {
    id: 's2',
    name: "Express Pantry",
    ownerId: 'usr-9942',
    ownerName: "John Chen",
    address: "456 Commerce Rd, Uptown",
    location: { lat: 40.7589, lng: -73.9851 },
    phone: "555-0202",
    image: "https://picsum.photos/seed/store2/600/400",
    rating: 4.5,
    tags: ["Quick", "Essential", "24/7"],
    products: [
      {
        id: 'p3',
        name: "Whole Wheat Bread",
        price: 2.80,
        unit: "Loaf",
        category: 'Grains',
        description: "Freshly baked daily whole wheat bread.",
        image: "https://picsum.photos/seed/bread/300/200",
        gallery: [],
        inStock: true,
        quantity: 15,
        rating: 4.2,
        ratingCount: 56
      },
      {
        id: 'p4',
        name: "Pasta Sauce",
        price: 1.50,
        unit: "Jar",
        category: 'Canned',
        description: "Classic Italian style tomato sauce.",
        image: "https://picsum.photos/seed/sauce/300/200",
        gallery: [],
        inStock: true,
        quantity: 45,
        rating: 4.5,
        ratingCount: 34
      }
    ]
  },
  {
    id: 's3',
    name: "The Corner Provisions",
    ownerId: 'usr-1105',
    ownerName: "Sarah Jenkins",
    address: "789 Willow Ln, Westside",
    location: { lat: 40.7306, lng: -73.9352 },
    phone: "555-0303",
    image: "https://picsum.photos/seed/store3/600/400",
    rating: 4.2,
    tags: ["Convenience", "Friendly", "Cheap"],
    products: [
      {
        id: 'p5',
        name: "Instant Coffee",
        price: 5.25,
        unit: "Tin",
        category: 'Beverages',
        description: "Rich and smooth morning pick-me-up.",
        image: "https://picsum.photos/seed/coffee/300/200",
        gallery: [],
        inStock: true,
        quantity: 30,
        rating: 4.0,
        ratingCount: 22
      }
    ]
  }
];
