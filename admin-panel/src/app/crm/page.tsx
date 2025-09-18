'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { crmAPI } from '@/lib/api/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Plus,
  MessageSquare,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CRMDashboard() {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    serviceType: '',
    priority: '',
    search: ''
  });
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    fetchDashboardData();
    fetchInquiries();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      const response = await crmAPI.getStats();
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await crmAPI.getAllInquiries(filters);
      setInquiries(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await crmAPI.exportInquiries('csv');
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inquiries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Inquiries exported successfully');
    } catch (error) {
      toast.error('Failed to export inquiries');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      NEW: { color: 'bg-blue-500', icon: AlertCircle },
      CONTACTED: { color: 'bg-yellow-500', icon: MessageSquare },
      QUOTED: { color: 'bg-purple-500', icon: DollarSign },
      NEGOTIATING: { color: 'bg-orange-500', icon: Clock },
      WON: { color: 'bg-green-500', icon: CheckCircle },
      LOST: { color: 'bg-red-500', icon: AlertCircle },
      ARCHIVED: { color: 'bg-gray-500', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.NEW;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getServiceBadge = (service: string) => {
    const colors: any = {
      FOOD_TRUCK: 'bg-orange-100 text-orange-800',
      MOBILE_BAR: 'bg-purple-100 text-purple-800',
      CATERING: 'bg-green-100 text-green-800',
      RESERVATION: 'bg-blue-100 text-blue-800',
      GENERAL: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[service] || colors.GENERAL}>{service.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: any = {
      URGENT: 'bg-red-100 text-red-800 border-red-300',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
      NORMAL: 'bg-blue-100 text-blue-800 border-blue-300',
      LOW: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return <Badge variant="outline" className={colors[priority] || colors.NORMAL}>{priority}</Badge>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CRM Dashboard</h1>
        <p className="text-muted-foreground">Manage customer inquiries and quotes</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalInquiries}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Users className="h-4 w-4 mr-1" />
                <span>{stats.overview.newInquiries} new</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Quoted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.quotedInquiries}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>{stats.overview.totalQuotes} total quotes</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Won Deals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.wonInquiries}</div>
              <div className="flex items-center text-sm text-green-600 mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{stats.overview.conversionRate}% conversion</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Quote Acceptance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.quoteAcceptanceRate}%</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>{stats.overview.acceptedQuotes} accepted</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Inquiries</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, phone..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="QUOTED">Quoted</SelectItem>
                <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                <SelectItem value="WON">Won</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.serviceType} onValueChange={(value) => setFilters({ ...filters, serviceType: value })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Services</SelectItem>
                <SelectItem value="FOOD_TRUCK">Food Truck</SelectItem>
                <SelectItem value="MOBILE_BAR">Mobile Bar</SelectItem>
                <SelectItem value="CATERING">Catering</SelectItem>
                <SelectItem value="RESERVATION">Reservation</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inquiries Table */}
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading inquiries...
                    </TableCell>
                  </TableRow>
                ) : inquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No inquiries found
                    </TableCell>
                  </TableRow>
                ) : (
                  inquiries.map((inquiry: any) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inquiry.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Mail className="h-3 w-3" />
                            {inquiry.email}
                          </div>
                          {inquiry.phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Phone className="h-3 w-3" />
                              {inquiry.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getServiceBadge(inquiry.serviceType)}</TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell>{getPriorityBadge(inquiry.priority)}</TableCell>
                      <TableCell>
                        {inquiry.eventDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(inquiry.eventDate), 'MMM dd, yyyy')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(inquiry.createdAt), 'h:mm a')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/crm/inquiries/${inquiry.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/crm/inquiries/${inquiry.id}/quote`}>
                            <Button variant="outline" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
