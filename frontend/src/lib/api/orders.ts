import { api } from './client';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customer?: any;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  customerId?: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  notes?: string;
  paymentMethod?: string;
}

export interface UpdateOrderData {
  status?: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  notes?: string;
}

export const orders = {
  // Get all orders
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get single order
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Create new order
  create: async (data: CreateOrderData) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Update order
  update: async (id: string, data: UpdateOrderData) => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },

  // Update order status
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancel: async (id: string, reason?: string) => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Get order statistics
  getStatistics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/orders/statistics?${params}`);
    return response.data;
  },
};

