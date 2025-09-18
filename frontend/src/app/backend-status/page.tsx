'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Database, 
  Activity, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Code,
  Terminal
} from 'lucide-react';

const API_URL = 'https://staging.kockys.com';

export default function BackendStatusPage() {
  const [status, setStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkBackendStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check health endpoint
      const healthResponse = await fetch(`${API_URL}/health`);
      const healthData = await healthResponse.json();
      setStatus(healthData);

      // Get dashboard stats
      const statsResponse = await fetch(`${API_URL}/api/admin/dashboard`);
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (err) {
      setError('Backend server is not responding. Make sure it\'s running on port 5001.');
      console.error('Backend connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const endpoints = [
    { path: '/api', description: 'API Root', method: 'GET' },
    { path: '/health', description: 'Health Check', method: 'GET' },
    { path: '/api/admin/dashboard', description: 'Admin Dashboard Stats', method: 'GET' },
    { path: '/api/reservations', description: 'Reservations', method: 'GET/POST' },
    { path: '/api/menu', description: 'Menu Items', method: 'GET' },
    { path: '/api/orders', description: 'Orders', method: 'GET/POST' },
    { path: '/api/newsletter/subscribe', description: 'Newsletter Subscribe', method: 'POST' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Backend Server Status</h1>
        <p className="text-muted-foreground">Monitor and test your backend API endpoints</p>
      </div>

      {/* Connection Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Server className="mr-2 h-5 w-5" />
              Backend Connection
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={checkBackendStatus}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Checking backend status...</span>
            </div>
          ) : error ? (
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Server Status:</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {status?.status || 'Connected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API URL:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">{API_URL}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Environment:</span>
                <span className="text-sm">{status?.environment || 'development'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Check:</span>
                <span className="text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.stats?.revenue?.total?.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +${stats.stats?.revenue?.today?.toFixed(2)} today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats?.orders?.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.stats?.orders?.today} today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats?.reservations?.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.stats?.reservations?.today} today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats?.users?.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.stats?.newsletter?.subscribers} subscribers
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="mr-2 h-5 w-5" />
            Available API Endpoints
          </CardTitle>
          <CardDescription>Click on any endpoint to test it in your browser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {endpoints.map((endpoint) => (
              <div key={endpoint.path} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{endpoint.method}</Badge>
                  <div>
                    <a 
                      href={`${API_URL}${endpoint.path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {endpoint.path}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">{endpoint.description}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => window.open(`${API_URL}${endpoint.path}`, '_blank')}
                >
                  <Terminal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center">
              <Terminal className="mr-2 h-4 w-4" />
              Test with cURL
            </h4>
            <code className="text-xs block p-3 bg-background rounded border">
              curl {API_URL}/api
            </code>
          </div>

          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> The backend is currently running with mock data. 
              To connect to a real database, you'll need to set up PostgreSQL and run Prisma migrations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
