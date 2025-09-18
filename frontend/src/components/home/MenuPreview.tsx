'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const menuItems = [
  {
    name: 'Kocky\'s Signature Burger',
    price: 16.99,
    description: 'Double patty with bacon, cheese, and our special sauce',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    category: 'Entrees',
  },
  {
    name: 'BBQ Ribs',
    price: 24.99,
    description: 'Full rack with homemade BBQ sauce and coleslaw',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
    category: 'Entrees',
  },
  {
    name: 'Buffalo Wings',
    price: 12.99,
    description: 'Classic wings with blue cheese dressing',
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500',
    category: 'Appetizers',
  },
  {
    name: 'Craft Cocktail',
    price: 10.99,
    description: 'Our signature mix with premium spirits',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500',
    category: 'Drinks',
  },
];

export function MenuPreview() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Featured Menu Items</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular dishes and drinks
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {item.category}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
              <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
              <p className="text-2xl font-bold text-primary">${item.price}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="gradient" asChild>
            <Link href="/menu">
              View Full Menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
