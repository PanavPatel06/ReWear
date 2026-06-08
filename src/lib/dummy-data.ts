import type { Item } from './types';

// This is dummy data for demonstration. 
// To add your own images, you can replace the placeholder URLs below
// with direct links to your own images hosted online.
// For example, you could upload images to a service like Imgur or Cloudinary
// and paste the links here.

export const dummyItems: Item[] = [
  // {
  //   id: '1',
  //   title: 'Vintage Denim Jacket',
  //   category: 'Outerwear',
  //   condition: 'Good',
  //   brand: "Levi's",
  //   // Replace this with your image URL
  //   images: ['https://drive.google.com/file/d/1BoSXqQi5xpnzX-cEvvupuxHSBvHmaKu4/view?usp=drive_link'],
  //   uploaderName: 'Jane Doe',
  //   points: 1500,
  //   originalPrice: 3000,
  //   valuationStatus: 'auto',
  //   description: "A classic vintage denim jacket from the 90s. Perfectly worn in, with a timeless style that never fades. Features button-front closure, two chest pockets, and adjustable waist tabs."
  // },
  {
    id: '1',
    title: 'Floral Summer Dress',
    category: 'Dresses',
    condition: 'Like new',
    brand: 'Zara',
    // Replace this with your image URL
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1887'],
    uploaderId: 'dummy-1',
    uploaderName: 'Sarah Smith',
    points: 1200,
    originalPrice: 2500,
    valuationStatus: 'auto',
    description: "A beautiful floral print summer dress, perfect for warm weather. Lightweight fabric with a flattering A-line silhouette. Worn only once.",
    createdAt: new Date(),
    status: 'available'
  },
  // {
  //   id: '3',
  //   title: 'Leather Ankle Boots',
  //   category: 'Shoes',
  //   condition: 'Good',
  //   brand: 'Dr. Martens',
  //    // Replace this with your image URL
  //   images: ['https://drive.google.com/file/d/19z17MVjKQdpQR2orYBRr61KeJ9iZtz6Z/view?usp=drive_link'],
  //   uploaderName: 'Mike Johnson',
  //   points: 2500,
  //   description: "Classic leather ankle boots with a sturdy sole. Some minor scuffs but in great overall condition with plenty of life left."
  // },
  {
    id: '2',
    title: 'Striped Cotton T-Shirt',
    category: 'Tops',
    condition: 'New with tags',
    brand: 'Uniqlo',
    // Replace this with your image URL
    images: ['https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?q=80&w=1887'],
    uploaderId: 'dummy-2',
    uploaderName: 'Emily Chen',
    points: 500,
    originalPrice: 1000,
    valuationStatus: 'manual',
    description: "A brand new, unworn striped t-shirt made from 100% soft cotton. A versatile wardrobe staple.",
    createdAt: new Date(),
    status: 'available'
  },
  // {
  //   id: '5',
  //   title: 'High-Waisted Skinny Jeans',
  //   category: 'Bottoms',
  //   condition: 'Good',
  //   brand: 'Topshop',
  //   // Replace this with your image URL
  //   images: ['https://drive.google.com/file/d/1BoSXqQi5xpnzX-cEvvupuxHSBvHmaKu4/view?usp=drive_link'],
  //   uploaderName: 'Jane Doe',
  //   points: 900,
  //   description: "Comfortable and stylish high-waisted skinny jeans in a dark wash. Minimal signs of wear."
  // },
  {
    id: '3',
    title: 'Silk Scarf',
    category: 'Accessories',
    condition: 'Like new',
    brand: 'Hermès',
    // Replace this with your image URL
    images: ['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1935'],
    uploaderId: 'dummy-3',
    uploaderName: 'Olivia Davis',
    points: 5000,
    originalPrice: 10000,
    valuationStatus: 'auto',
    description: "A luxurious 100% silk scarf with a vibrant, intricate pattern. Can be worn in multiple ways. In pristine condition.",
    createdAt: new Date(),
    status: 'available'
  },
];
