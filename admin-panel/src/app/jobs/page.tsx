'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase, Eye, Download, Trash2, Search, Filter, 
  Calendar, User, Mail, Phone, FileText, CheckCircle, 
  Clock, UserCheck, XCircle, MessageSquare, Edit3,
  Upload, Image as ImageIcon, Settings, Save, Edit
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { API_URL } from '@/config/api';
const API_BASE_URL = API_URL;

interface JobApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface JobPageSettings {
  id: string;
  heroImage?: string;
  heroTitle: string;
  heroSubtitle: string;
  introText: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  REVIEWING: 'bg-blue-100 text-blue-800',
  INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-800',
  INTERVIEWED: 'bg-indigo-100 text-indigo-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  PENDING: 'Pending',
  REVIEWING: 'Reviewing',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  INTERVIEWED: 'Interviewed',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn'
};

const positionLabels = {
  SERVER: 'Server',
  BARTENDER: 'Bartender',
  COOK: 'Cook',
  HOST: 'Host',
  OTHER: 'Other'
};

export default function JobApplicationsPage() {
  const [activeTab, setActiveTab] = useState('settings');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    notes: ''
  });
  
  // Page settings state
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [settingsData, setSettingsData] = useState<JobPageSettings | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch job page settings
  const { data: pageSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['job-page-settings'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/jobs/settings`);
      if (!response.ok) throw new Error('Failed to fetch page settings');
      return response.json();
    },
    retry: 1,
  });

  // Fetch job applications
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['job-applications', statusFilter, positionFilter],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token');

      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (positionFilter !== 'ALL') params.append('position', positionFilter);

      const response = await fetch(`${API_BASE_URL}/jobs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch job applications');
      return response.json();
    },
    retry: 1,
  });

  // Update page settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<JobPageSettings>) => {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token');

      const response = await fetch(`${API_BASE_URL}/jobs/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to update page settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-page-settings'] });
      toast.success('Page settings updated successfully');
      setIsEditingSettings(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update page settings');
    },
  });

  // Upload hero image mutation
  const uploadHeroImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token');

      const formData = new FormData();
      formData.append('heroImage', file);

      const response = await fetch(`${API_BASE_URL}/jobs/settings/hero-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload hero image');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-page-settings'] });
      toast.success('Hero image uploaded successfully');
      setHeroImageFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload hero image');
    },
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token');

      const response = await fetch(`${API_BASE_URL}/jobs/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to update application status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application status updated successfully');
      setShowStatusModal(false);
      setSelectedApplication(null);
      setStatusData({ status: '', notes: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update application status');
    },
  });

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token');

      const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete application');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete application');
    },
  });

  useEffect(() => {
    if (pageSettings?.data) {
      setSettingsData(pageSettings.data);
    }
  }, [pageSettings]);

  const applications = applicationsData?.data?.applications || [];
  const settings = pageSettings?.data;

  // Filter applications by search query
  const filteredApplications = applications.filter((app: JobApplication) =>
    app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSettingsSave = () => {
    if (settingsData) {
      updateSettingsMutation.mutate({
        heroTitle: settingsData.heroTitle,
        heroSubtitle: settingsData.heroSubtitle,
        introText: settingsData.introText,
        isActive: settingsData.isActive
      });
    }
  };

  const handleHeroImageUpload = () => {
    if (heroImageFile) {
      uploadHeroImageMutation.mutate(heroImageFile);
    }
  };

  const handleStatusUpdate = (application: JobApplication) => {
    setSelectedApplication(application);
    setStatusData({
      status: application.status,
      notes: application.notes || ''
    });
    setShowStatusModal(true);
  };

  const handleDownloadResume = async (application: JobApplication) => {
    if (!application.resumeUrl) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/jobs/${application.id}/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${application.fullName}_resume.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Resume downloaded successfully');
      } else {
        toast.error('Failed to download resume');
      }
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'REVIEWING': return <Eye className="w-4 h-4" />;
      case 'INTERVIEW_SCHEDULED': return <Calendar className="w-4 h-4" />;
      case 'INTERVIEWED': return <UserCheck className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      case 'WITHDRAWN': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (settingsLoading || applicationsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
        <p className="text-gray-600">Manage job page content and view applications</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Page Settings
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Applications ({applications.length})
          </TabsTrigger>
        </TabsList>

        {/* Page Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Jobs Page Content</CardTitle>
                  <CardDescription>
                    Manage the hero section content for the jobs page
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {isEditingSettings ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingSettings(false);
                          if (settings) setSettingsData(settings);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSettingsSave}
                        disabled={updateSettingsMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditingSettings(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Content
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Image Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Hero Image</label>
                <div className="space-y-4">
                  {settings?.heroImage && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`http://72.167.227.205:5001${settings.heroImage}`}
                        alt="Hero Image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="hero-image-upload"
                    />
                    <label
                      htmlFor="hero-image-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Choose Image
                    </label>
                    
                    {heroImageFile && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{heroImageFile.name}</span>
                        <Button
                          size="sm"
                          onClick={handleHeroImageUpload}
                          disabled={uploadHeroImageMutation.isPending}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          {uploadHeroImageMutation.isPending ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hero Title</label>
                  <Input
                    value={settingsData?.heroTitle || ''}
                    onChange={(e) => setSettingsData(prev => prev ? {...prev, heroTitle: e.target.value} : null)}
                    disabled={!isEditingSettings}
                    placeholder="Join Our Team"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hero Subtitle</label>
                  <Input
                    value={settingsData?.heroSubtitle || ''}
                    onChange={(e) => setSettingsData(prev => prev ? {...prev, heroSubtitle: e.target.value} : null)}
                    disabled={!isEditingSettings}
                    placeholder="Be part of the Kocky's family - where great food meets great people"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Intro Text</label>
                  <Textarea
                    value={settingsData?.introText || ''}
                    onChange={(e) => setSettingsData(prev => prev ? {...prev, introText: e.target.value} : null)}
                    disabled={!isEditingSettings}
                    placeholder="We're always looking for passionate individuals to join our team"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settingsData?.isActive || false}
                      onChange={(e) => setSettingsData(prev => prev ? {...prev, isActive: e.target.checked} : null)}
                      disabled={!isEditingSettings}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Page is Active</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Pending</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {applications.filter((app: JobApplication) => app.status === 'PENDING').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Reviewing</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {applications.filter((app: JobApplication) => app.status === 'REVIEWING').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Accepted</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {applications.filter((app: JobApplication) => app.status === 'ACCEPTED').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Briefcase className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Total</div>
                    <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search applications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWING">Reviewing</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="INTERVIEWED">Interviewed</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>

                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ALL">All Positions</option>
                  <option value="SERVER">Server</option>
                  <option value="BARTENDER">Bartender</option>
                  <option value="COOK">Cook</option>
                  <option value="HOST">Host</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms.' : 'No job applications have been submitted yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application: JobApplication) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{application.fullName}</div>
                              <div className="text-sm text-gray-500">{application.email}</div>
                              <div className="text-sm text-gray-500">{application.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {positionLabels[application.position as keyof typeof positionLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(application.status)}
                              <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                                {statusLabels[application.status as keyof typeof statusLabels]}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(application.createdAt), 'h:mm a')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {application.resumeUrl ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadResume(application)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-500">No resume</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(application)}
                              >
                                <Edit3 className="w-4 h-4 mr-1" />
                                Status
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(application.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Update Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Update the status and add notes for {selectedApplication?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={statusData.status}
                onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
              >
                <option value="PENDING">Pending</option>
                <option value="REVIEWING">Reviewing</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="INTERVIEWED">Interviewed</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={statusData.notes}
                onChange={(e) => setStatusData({ ...statusData, notes: e.target.value })}
                placeholder="Add any notes about this application..."
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedApplication) {
                    updateStatusMutation.mutate({
                      id: selectedApplication.id,
                      data: {
                        status: statusData.status,
                        notes: statusData.notes,
                        reviewedBy: 'Admin'
                      }
                    });
                  }
                }}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}