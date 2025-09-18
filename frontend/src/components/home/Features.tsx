'use client';

import { motion } from 'framer-motion';
import { Clock, Utensils, Music, Star, Truck, Wine } from 'lucide-react';

const features = [
  {
    icon: Utensils,
    title: 'Delicious Food',
    description: 'Award-winning menu with fresh, locally sourced ingredients',
  },
  {
    icon: Wine,
    title: 'Craft Cocktails',
    description: 'Expertly mixed drinks and extensive beer & wine selection',
  },
  {
    icon: Clock,
    title: 'Happy Hour',
    description: 'Daily specials from 4-7 PM with 50% off selected items',
  },
  {
    icon: Music,
    title: 'Live Entertainment',
    description: 'Live music every Friday and Saturday night',
  },
  {
    icon: Truck,
    title: 'Food Truck Service',
    description: 'Bring Kocky\'s to your event with our mobile kitchen',
  },
  {
    icon: Star,
    title: 'VIP Experience',
    description: 'Private dining and exclusive events for special occasions',
  },
];

export function Features() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Why Choose Kocky's?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            More than just a bar & grill - we're your destination for great times
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
