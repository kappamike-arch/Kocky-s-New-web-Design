# Kocky's Admin Panel - Secure Management Portal

## 🔒 Security Notice

This is a **SEPARATE ADMIN APPLICATION** that runs on a different port for security purposes.

- **Admin Panel URL**: http://localhost:4000
- **Main Website URL**: http://localhost:3000 (No admin access here!)

## Why Separate?

1. **Security**: Admin panel is completely isolated from public website
2. **Access Control**: Can be deployed on internal network only
3. **Monitoring**: All admin actions can be logged separately
4. **Protection**: Reduces attack surface on main website

## 🚀 Quick Start

```bash
# Install dependencies
cd admin-panel
npm install

# Start admin server on port 4000
npm run dev
```

## 🔑 Login Credentials

### Super Admin
- Email: `admin@kockysbar.com`
- Password: `AdminPassword123!`

### Manager
- Email: `manager@kockysbar.com`  
- Password: `ManagerPassword123!`

## 📱 Features

- **Dashboard**: Real-time statistics and metrics
- **User Management**: Manage staff and customer accounts
- **Order Management**: Process and track orders
- **Reservation System**: Manage table bookings
- **Menu Editor**: Update food and drink items
- **Food Truck Bookings**: Manage mobile service requests
- **Analytics**: View business reports
- **Settings**: Configure system settings

## 🔐 Security Features

- Runs on separate port (4000)
- No connection to main website
- Session-based authentication
- Activity logging
- Secure credentials storage
- HTTPS ready for production

## 🚨 Production Deployment

For production:
1. Use HTTPS with SSL certificate
2. Deploy on internal network or VPN
3. Use environment variables for credentials
4. Enable firewall rules for port 4000
5. Set up monitoring and alerting
6. Use proper session management
7. Enable audit logging

## 📝 Notes

- Admin panel is completely independent of main site
- Can be deployed on different server
- All admin routes removed from main website
- Enhanced security through isolation
