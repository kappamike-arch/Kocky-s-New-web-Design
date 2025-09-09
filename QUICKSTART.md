# Quick Start Guide - Kocky's Bar & Grill

## 🚀 One-Command Setup (Recommended)

If you have Docker installed, simply run:

```bash
./setup.sh
```

This will automatically:
- Install all dependencies
- Set up PostgreSQL database
- Run migrations
- Seed initial data
- Configure environment files

## 📋 Manual Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Database Setup

#### Option A: Using Docker (Easiest)
```bash
# From root directory
docker-compose up -d postgres

# Wait for PostgreSQL to start, then run migrations
cd backend
npx prisma generate
npx prisma migrate dev
npm run seed
```

#### Option B: Local PostgreSQL
1. Install PostgreSQL 14+
2. Create a database named `kockys_db`
3. Update `backend/.env` with your database credentials

### 3. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp env.example .env
# Edit .env with your credentials
```

Key variables to update:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A secure random string
- `SENDGRID_API_KEY` - For email sending (optional for dev)

#### Frontend (.env.local)
```bash
cd frontend
cp env.local.example .env.local
# Edit .env.local with your settings
```

Key variables to update:
- `NEXTAUTH_SECRET` - A secure random string
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For payments (optional for dev)

### 4. Start Development Servers

```bash
# From root directory
npm run dev
```

This starts both frontend and backend servers concurrently.

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api
- **Database UI** (if using Docker): http://localhost:8025

## 🔑 Default Credentials

### Admin Account
- Email: `admin@kockysbar.com`
- Password: `AdminPassword123!`

### Staff Account
- Email: `staff@kockysbar.com`
- Password: `StaffPassword123!`

### Customer Account
- Email: `customer@example.com`
- Password: `CustomerPassword123!`

## 🎯 First Steps

1. **Visit the Homepage**: http://localhost:3000
   - Explore the landing page
   - Check out the menu
   - View happy hour specials

2. **Try Customer Features**:
   - Make a reservation
   - Browse the menu
   - Sign up for newsletter
   - Create an account

3. **Access Admin Panel**: http://localhost:3000/admin
   - Login with admin credentials
   - View dashboard statistics
   - Manage reservations and orders
   - Update menu items

4. **Test API Endpoints**: http://localhost:5000/api
   - View available endpoints
   - Test with tools like Postman or curl

## 🧪 Test Features

### Reservation System
1. Go to `/reservations`
2. Select date, time, and party size
3. Fill in contact details
4. Receive confirmation email (check MailHog if using Docker)

### Food Truck Booking
1. Navigate to `/services/food-truck`
2. Fill out the booking form
3. Submit request for review

### Mobile Bar Service
1. Visit `/services/mobile-bar`
2. Select a package
3. Submit booking request

### Online Ordering
1. Browse menu at `/menu`
2. Add items to cart
3. Proceed to checkout
4. Complete order (test mode)

## 🛠 Development Tools

### Database Management
```bash
# View database in browser
cd backend
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate new migration
npx prisma migrate dev --name your-migration-name
```

### Email Testing
If using Docker, MailHog is available at http://localhost:8025
All emails in development are captured here instead of being sent.

## 📚 Project Structure

```
├── frontend/          # Next.js 14 app
│   ├── src/app/      # App Router pages
│   ├── src/components/  # React components
│   └── src/lib/      # Utilities & API
├── backend/          # Express.js API
│   ├── src/routes/   # API endpoints
│   ├── src/controllers/  # Business logic
│   └── prisma/       # Database schema
└── docker-compose.yml  # Local services
```

## 🚨 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9
```

### Database Connection Error
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in backend/.env
3. Run `npx prisma generate` in backend directory

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🆘 Need Help?

1. Check the main README.md for detailed documentation
2. Review API endpoints at http://localhost:5000/api
3. Check logs in `backend/logs/` directory
4. Email: dev@kockysbar.com

## 🎉 Ready to Build!

You now have a fully functional restaurant management system with:
- ✅ Modern, responsive UI
- ✅ Secure authentication
- ✅ Complete booking system
- ✅ Online ordering
- ✅ Admin dashboard
- ✅ Email notifications
- ✅ Payment integration ready

Start customizing and building your features!
