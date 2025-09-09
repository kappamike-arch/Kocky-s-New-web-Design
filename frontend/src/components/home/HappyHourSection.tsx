'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Beer, Wine, Martini } from 'lucide-react';

export function HappyHourSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-orange-500 to-red-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Happy Hour Every Day!</h2>
          <div className="flex items-center justify-center space-x-2 text-2xl mb-8">
            <Clock className="h-8 w-8" />
            <span>Monday - Friday: 4:00 PM - 7:00 PM</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
          >
            <Beer className="h-12 w-12 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">$2 Off Draft Beers</h3>
            <p className="text-white/90">All domestic and imported draft beers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
          >
            <Wine className="h-12 w-12 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">$3 Off House Wines</h3>
            <p className="text-white/90">Red, white, and rosé selections</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
          >
            <Martini className="h-12 w-12 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">$5 Well Drinks</h3>
            <p className="text-white/90">All well cocktails and mixed drinks</p>
          </motion.div>
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white hover:bg-white/20" asChild>
            <Link href="/happy-hour">See All Happy Hour Specials</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
