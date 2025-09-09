# Kocky's Bar & Grill - Admin CMS Panel

## 🎯 Overview
This is your content management system for managing your restaurant's website. No coding required!

## 🚀 Getting Started

### First Time Setup
1. Make sure PostgreSQL database is running
2. Copy `.env.example` to `.env` and update database settings
3. Run setup commands:
```bash
npm install
npm run dev
```
4. Open browser at `http://localhost:4000`
5. Create your first admin account

## 📱 Admin Panel Features

### 🍽️ Menu Management
- **Add Menu Items**: Upload photos, set prices, add descriptions
- **Categories**: Organize by Appetizers, Entrees, Desserts, etc.
- **Special Flags**: Mark items as vegetarian, gluten-free, spicy
- **Featured Items**: Highlight daily specials
- **Availability**: Easily toggle items on/off

### 🎨 Theme Customization
- **Color Picker**: Change your brand colors instantly
- **Multiple Themes**: Create seasonal themes (Summer, Winter, etc.)
- **Font Selection**: Choose from professional fonts
- **Logo Upload**: Update your logo anytime

### 📄 Page Management
- **Visual Editor**: Edit pages with rich text formatting
- **Backgrounds**: Upload images or videos for page backgrounds
- **SEO Settings**: Optimize page titles and descriptions
- **Publishing**: Schedule pages to go live

### 📧 Email Marketing
- **Subscriber List**: View all newsletter subscribers
- **CSV Import**: Bulk upload email lists
- **Segmentation**: Tag subscribers for targeted campaigns
- **Status Tracking**: See who's active, unsubscribed, or bounced

### 💬 Customer Inquiries
- **View All Inquiries**: See food truck, catering, event requests
- **Status Management**: Track new, in-progress, quoted inquiries
- **Priority Levels**: Focus on urgent requests
- **Staff Assignment**: Assign inquiries to team members

### 📊 Analytics Dashboard (Read-Only)
- **Visitor Stats**: See daily/weekly/monthly traffic
- **Popular Pages**: Know what customers are viewing
- **Revenue Tracking**: Monitor sales performance
- **Device Breakdown**: Desktop vs mobile usage

### 💰 Quote Templates
- **Professional Templates**: Pre-designed quote layouts
- **Rich Text Editing**: Format quotes beautifully
- **Logo Integration**: Your branding on every quote
- **Dynamic Variables**: Auto-fill customer names, dates, amounts

### 👥 Customer Management
- **Customer Database**: Track all customer information
- **VIP Marking**: Identify your best customers
- **Order History**: See total spent and last order
- **Internal Notes**: Keep private notes about customers

## 📋 How to Use Each Section

### Adding a Menu Item
1. Click "Menu Items" in sidebar
2. Click "Create Menu Item" button
3. Fill in:
   - Name (required)
   - Price (required)
   - Category (required)
   - Description
   - Upload photo
4. Toggle options like vegetarian, gluten-free
5. Click "Create Menu Item"

### Changing Website Colors
1. Go to "Theme Settings"
2. Find active theme or create new one
3. Click on color fields to open color picker
4. Select your colors:
   - Primary: Main brand color
   - Secondary: Supporting color
   - Accent: Highlight color
5. Save changes

### Managing Pages
1. Navigate to "Pages"
2. Edit existing or create new
3. Use visual editor to:
   - Add text
   - Insert images
   - Create buttons
   - Add menu showcases
4. Set background (color/image/video)
5. Publish or schedule

### Handling Inquiries
1. Check "Inquiries" daily
2. New inquiries appear at top
3. Click to view details
4. Update status as you progress
5. Add internal notes for team
6. Assign to staff member

## 🔐 Security & Access

### User Roles
- **Admin**: Full access to everything
- **Staff**: Can manage content but not delete
- **Customer**: Limited access (for future features)

### Best Practices
- Change passwords regularly
- Don't share login credentials
- Log out when done
- Back up data regularly

## 🆘 Troubleshooting

### Can't Upload Images?
- Check file size (max 10MB)
- Use JPG, PNG, or WebP formats
- Ensure good internet connection

### Changes Not Showing on Website?
- Clear browser cache
- Check if item/page is published
- Verify "isActive" or "isAvailable" is checked

### Forgot Password?
- Contact your system administrator
- They can reset from the Users section

## 📞 Support Contacts

For technical issues:
- Developer: [Your contact]
- Emergency: [Phone number]

## 🎉 Tips for Success

1. **Update Menu Regularly**: Keep prices and availability current
2. **Respond Quickly**: Check inquiries at least twice daily
3. **Use High-Quality Photos**: They make items more appealing
4. **Test on Mobile**: Preview how changes look on phones
5. **Keep SEO Updated**: Good descriptions help Google find you
6. **Tag Customers**: Use tags for email campaigns
7. **Monitor Analytics**: Learn what works

## 🔄 Daily Tasks Checklist

- [ ] Check new inquiries
- [ ] Update menu availability
- [ ] Review analytics dashboard
- [ ] Respond to urgent requests
- [ ] Update featured items

## 🗓️ Weekly Tasks

- [ ] Review and update menu photos
- [ ] Check email subscriber growth
- [ ] Update page content if needed
- [ ] Review customer feedback
- [ ] Plan upcoming promotions

---

**Remember**: This CMS directly controls your live website. Always double-check before publishing changes!

**Happy Managing! 🎊**
