'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, RotateCcw, DollarSign } from 'lucide-react';
import { instantQuotesAPI, InstantQuotePackage } from '@/lib/api/instant-quotes';

// Configurable constants - easily editable by admins/devs
const HOURLY_SERVICE_RATE = 100; // $100/hour - editable
const MIN_HOURS = 2; // Minimum hours - editable

interface InstantQuoteFormProps {
  serviceType: 'Mobile Bar' | 'Food Truck';
}

interface FormData {
  guests: number;
  package: string;
  hours: number;
}

interface ValidationErrors {
  guests?: string;
  hours?: string;
  package?: string;
}

interface QuoteResult {
  totalCost: number;
  ratePerPerson: number;
}

export function InstantQuoteForm({ serviceType }: InstantQuoteFormProps) {
  const [packages, setPackages] = useState<InstantQuotePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    guests: 0,
    package: '',
    hours: 0,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  // Load packages from API
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const serviceKey = serviceType === 'Mobile Bar' ? 'mobile-bar' : 'food-truck';
        const fetchedPackages = await instantQuotesAPI.getPackages(serviceKey);
        setPackages(fetchedPackages);
        
        // Set default package if available
        if (fetchedPackages.length > 0) {
          setFormData(prev => ({ ...prev, package: fetchedPackages[0].id }));
        }
      } catch (error) {
        console.error('Failed to load packages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [serviceType]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.guests || formData.guests <= 0) {
      newErrors.guests = 'Number of guests must be greater than 0';
    }

    if (!formData.hours || formData.hours < MIN_HOURS) {
      newErrors.hours = `Hours of service must be at least ${MIN_HOURS} hours`;
    }

    if (!formData.package) {
      newErrors.package = 'Please select a package';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateForm()) {
      return;
    }

    const selectedPackage = packages.find(pkg => pkg.id === formData.package);
    if (!selectedPackage) {
      return;
    }

    // New formula: Total Cost = (Number of Guests × Package Rate per Person) + (Hours × Hourly Service Rate)
    const packageCost = formData.guests * selectedPackage.rate;
    const hourlyCost = formData.hours * HOURLY_SERVICE_RATE;
    const totalCost = packageCost + hourlyCost;
    
    // Rate per Person = Total Cost ÷ Number of Guests
    const ratePerPerson = totalCost / formData.guests;
    
    setQuoteResult({
      totalCost,
      ratePerPerson
    });
    setIsCalculated(true);
  };

  const handleReset = () => {
    setFormData({
      guests: 0,
      package: packages.length > 0 ? packages[0].id : '',
      hours: 0,
    });
    setErrors({});
    setQuoteResult(null);
    setIsCalculated(false);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-12 px-4"
    >
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              <Calculator className="w-6 h-6 text-red-500" />
              Instant {serviceType} Quote
            </CardTitle>
            <CardDescription className="text-gray-400">
              Get an instant estimate for your {serviceType.toLowerCase()} service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Number of Guests */}
              <div className="space-y-2">
                <Label htmlFor="guests" className="text-gray-300">
                  Number of Guests *
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  value={formData.guests || ''}
                  onChange={(e) => handleInputChange('guests', parseInt(e.target.value) || 0)}
                  className="bg-gray-700 border-gray-600 text-white focus:border-red-600"
                  placeholder="Enter number of guests"
                />
                {errors.guests && (
                  <p className="text-red-400 text-sm">{errors.guests}</p>
                )}
              </div>

              {/* Package Selection */}
              <div className="space-y-2">
                <Label htmlFor="package" className="text-gray-300">
                  Package Selection *
                </Label>
                <select
                  id="package"
                  value={formData.package}
                  onChange={(e) => handleInputChange('package', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-red-600 focus:outline-none"
                  disabled={loading}
                >
                  {loading ? (
                    <option>Loading packages...</option>
                  ) : packages.length === 0 ? (
                    <option>No packages available</option>
                  ) : (
                    packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - ${pkg.rate}/guest
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Hours of Service */}
              <div className="space-y-2">
                <Label htmlFor="hours" className="text-gray-300">
                  Hours of Service * (Min: {MIN_HOURS}h)
                </Label>
                <Input
                  id="hours"
                  type="number"
                  min={MIN_HOURS}
                  value={formData.hours || ''}
                  onChange={(e) => handleInputChange('hours', parseInt(e.target.value) || 0)}
                  className="bg-gray-700 border-gray-600 text-white focus:border-red-600"
                  placeholder={`Enter hours (minimum ${MIN_HOURS})`}
                />
                {errors.hours && (
                  <p className="text-red-400 text-sm">{errors.hours}</p>
                )}
              </div>

              {/* Hourly Service Rate Display */}
              <div className="space-y-2">
                <Label className="text-gray-300">
                  Hourly Service Rate
                </Label>
                <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                  <span className="text-red-500 font-bold">
                    ${HOURLY_SERVICE_RATE}/hour
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleCalculate}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Quote
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                size="lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Quote Result */}
            {isCalculated && quoteResult !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-lg border border-red-500"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-6 h-6 text-white" />
                    <h3 className="text-2xl font-bold text-white">Estimated Quote</h3>
                  </div>
                  <p className="text-4xl font-bold text-white mb-2">
                    ${quoteResult.totalCost.toLocaleString()}
                  </p>
                  <p className="text-xl text-red-100 mb-2">
                    Rate per Person: ${quoteResult.ratePerPerson.toFixed(2)}/person
                  </p>
                  <p className="text-red-100 text-sm mb-4">
                    This is an estimate and subject to change depending on final details.
                  </p>
                  <div className="mt-4 text-xs text-red-200 bg-red-800 bg-opacity-50 p-3 rounded">
                    <p className="font-semibold mb-1">Calculation Breakdown:</p>
                    <p>Package Cost: {formData.guests} guests × ${packages.find(pkg => pkg.id === formData.package)?.rate || 0}/guest = ${(formData.guests * (packages.find(pkg => pkg.id === formData.package)?.rate || 0)).toLocaleString()}</p>
                    <p>Service Cost: {formData.hours} hours × ${HOURLY_SERVICE_RATE}/hour = ${(formData.hours * HOURLY_SERVICE_RATE).toLocaleString()}</p>
                    <p className="font-semibold mt-1">Total: ${quoteResult.totalCost.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
