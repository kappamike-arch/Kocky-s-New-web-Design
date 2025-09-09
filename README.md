# Kocky's Bar & Grill - Full Stack Web Application

A modern, full-stack web application for Kocky's Bar & Grill built with Next.js 14, Express.js, PostgreSQL, and Prisma.

## 🚀 Features

### Customer Features
- **Table Reservations**: Book tables online with date/time selection
- **Food Truck Booking**: Request food truck services for events
- **Mobile Bar Service**: Book mobile bar packages for events
- **Online Ordering**: Order food for pickup or delivery
- **Menu Browsing**: View food and drink menus with categories
- **Happy Hour Info**: Check daily happy hour specials
- **Newsletter Signup**: Subscribe with Mailchimp/Brevo integration
- **User Authentication**: Secure login with NextAuth.js

### Admin Features
- **CRM Dashboard**: Manage all customer inquiries and bookings
- **Order Management**: Track and update order statuses
- **Menu Management**: Add, edit, and remove menu items
- **User Management**: Manage customer and staff accounts
- **Analytics Dashboard**: View revenue, reservations, and order reports
- **Email Notifications**: Automated confirmation and notification emails

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn/UI**: Modern React components
- **Framer Motion**: Smooth animations
- **NextAuth.js**: Authentication
- **React Query**: Data fetching and caching

### Backend
- **Express.js**: Node.js web framework
- **PostgreSQL**: Relational database
- **Prisma ORM**: Type-safe database client
- **JWT**: Token-based authentication
- **SendGrid/Nodemailer**: Email services
- **Stripe**: Payment processing
- **Zod**: Schema validation

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kockys-new-web-design
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Backend Configuration**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your database and API credentials
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   npm run seed  # Seed initial data
   ```

5. **Frontend Configuration**
   ```bash
   cd frontend
   cp env.local.example .env.local
   # Edit .env.local with your API URLs and keys
   ```

6. **Run Development Servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🏗 Project Structure

```
kockys-new-web-design/
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and API client
│   │   └── hooks/        # Custom React hooks
│   └── public/           # Static assets
├── backend/               # Express.js backend API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── validations/  # Zod schemas
│   │   └── utils/        # Helper functions
│   └── prisma/           # Database schema and migrations
└── package.json          # Root package configuration
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/kockys_db
JWT_SECRET=your-secret-key
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=your-stripe-key
MAILCHIMP_API_KEY=your-mailchimp-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
```

## 📱 API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/forgot-password` - Password reset

### Reservations
- GET `/api/reservations` - List reservations
- POST `/api/reservations` - Create reservation
- GET `/api/reservations/:id` - Get reservation details

### Menu
- GET `/api/menu` - Get menu items
- GET `/api/menu/categories` - Get categories
- GET `/api/menu/happy-hour` - Get happy hour specials

### Orders
- POST `/api/orders` - Create order
- GET `/api/orders/:id` - Get order details
- PUT `/api/orders/:id/status` - Update order status

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy with automatic builds

### Backend (Render/Fly.io)
1. Create PostgreSQL database
2. Deploy Express app
3. Configure environment variables
4. Run database migrations

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📝 License

This project is proprietary software for Kocky's Bar & Grill.

## 🤝 Contributing

Please contact the development team for contribution guidelines.

## 📞 Support

For support, email: dev@kockysbar.com
