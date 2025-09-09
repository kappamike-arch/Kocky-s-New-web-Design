'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Briefcase, Users, Clock, Award, Upload, CheckCircle, 
  FileText, Mail, Phone, User, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://72.167.227.205:5001/api';

interface JobPageSettings {
  id: string;
  heroImage?: string;
  heroTitle: string;
  heroSubtitle: string;
  introText: string;
  isActive: boolean;
}

export default function JobsPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    coverLetter: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch job page settings
  const { data: pageSettings } = useQuery({
    queryKey: ['job-page-settings'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/jobs/settings`);
      if (!response.ok) throw new Error('Failed to fetch page settings');
      return response.json();
    },
    retry: 1,
  });

  const settings = pageSettings?.data;

  const positions = [
    { value: 'SERVER', label: 'Server' },
    { value: 'BARTENDER', label: 'Bartender' },
    { value: 'COOK', label: 'Cook' },
    { value: 'HOST', label: 'Host' },
    { value: 'OTHER', label: 'Other' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.position) {
      newErrors.position = 'Please select a position';
    }
    
    if (resumeFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resumeFile.type)) {
        newErrors.resume = 'Resume must be a PDF, DOC, or DOCX file';
      } else if (resumeFile.size > 5 * 1024 * 1024) {
        newErrors.resume = 'Resume file must be less than 5MB';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      // Clear any previous resume error
      if (errors.resume) {
        setErrors({ ...errors, resume: '' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('position', formData.position);
      if (formData.coverLetter) {
        submitData.append('coverLetter', formData.coverLetter);
      }
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      const response = await fetch(`${API_BASE_URL}/jobs/apply`, {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Users,
      title: 'Team Environment',
      description: 'Work with a supportive and friendly team'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Work-life balance with flexible hours'
    },
    {
      icon: Award,
      title: 'Growth Opportunities',
      description: 'Advance your career with training and development'
    },
    {
      icon: Briefcase,
      title: 'Competitive Pay',
      description: 'Fair wages with tips and performance bonuses'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-10" />
          {settings?.heroImage ? (
            <Image
              src={`http://72.167.227.205:5001${settings.heroImage}`}
              alt="Join our team"
              fill
              className="object-cover"
            />
          ) : (
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600"
              alt="Restaurant team"
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="relative z-20 text-center text-white max-w-4xl px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            {settings?.heroTitle || 'Join Our Team'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl mb-6"
          >
            {settings?.heroSubtitle || "Be part of the Kocky's family - where great food meets great people"}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-200"
          >
            {settings?.introText || "We're always looking for passionate individuals to join our team"}
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Benefits Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why Work With Us?</h2>
            <p className="text-lg text-muted-foreground">
              Discover the benefits of being part of the Kocky's team
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow text-center">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {submitted ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center p-12">
                  <div className="mx-auto mb-4 h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for your interest in joining our team. We'll review your application and contact you within 1-2 weeks if your qualifications match our needs.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        phone: '',
                        position: '',
                        coverLetter: ''
                      });
                      setResumeFile(null);
                      setErrors({});
                    }}
                  >
                    Submit Another Application
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Apply Now</CardTitle>
                  <CardDescription>
                    Fill out the form below to join the Kocky's team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="pl-10"
                            placeholder="Enter your full name"
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="pl-10"
                              placeholder="your@email.com"
                            />
                          </div>
                          {errors.email && (
                            <p className="text-sm text-red-500 mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="pl-10"
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-sm text-red-500 mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="position">Position Applying For *</Label>
                        <select
                          id="position"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                        >
                          <option value="">Select a position</option>
                          {positions.map(pos => (
                            <option key={pos.value} value={pos.value}>
                              {pos.label}
                            </option>
                          ))}
                        </select>
                        {errors.position && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.position}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div>
                      <Label htmlFor="resume">Upload Resume (PDF, DOC, DOCX - Max 5MB)</Label>
                      <div className="mt-2">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PDF, DOC, or DOCX (MAX. 5MB)</p>
                          </div>
                          <input
                            id="resume"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </label>
                        {resumeFile && (
                          <div className="mt-2 flex items-center text-sm text-green-600">
                            <FileText className="h-4 w-4 mr-1" />
                            {resumeFile.name}
                          </div>
                        )}
                        {errors.resume && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.resume}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                      <textarea
                        id="coverLetter"
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background min-h-[120px] mt-2"
                        placeholder="Tell us why you'd be a great fit for our team..."
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? (
                        'Submitting Application...'
                      ) : (
                        <>
                          <Briefcase className="mr-2 h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Job Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Available Positions */}
            <Card>
              <CardHeader>
                <CardTitle>Available Positions</CardTitle>
                <CardDescription>
                  We're currently hiring for the following positions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {positions.map((position) => (
                  <div key={position.value} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{position.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {position.value === 'SERVER' && 'Provide excellent customer service and take orders'}
                        {position.value === 'BARTENDER' && 'Mix drinks and serve beverages to customers'}
                        {position.value === 'COOK' && 'Prepare delicious food in our kitchen'}
                        {position.value === 'HOST' && 'Welcome guests and manage reservations'}
                        {position.value === 'OTHER' && 'Various positions available - tell us your interests!'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">Now Hiring</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* What We Offer */}
            <Card>
              <CardHeader>
                <CardTitle>What We Offer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Competitive hourly wages plus tips</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Flexible scheduling to fit your lifestyle</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Employee meal discounts</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Training and development opportunities</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Fun, supportive work environment</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Opportunities for advancement</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Questions?</CardTitle>
                <CardDescription>
                  Contact us if you have any questions about working with us
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">(555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">careers@kockysbar.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
