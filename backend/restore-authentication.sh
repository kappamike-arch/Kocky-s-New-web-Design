#!/bin/bash

# Restore Authentication for Production
# This script restores the authentication middleware that was temporarily disabled for demo purposes

echo "🔒 Restoring authentication for production..."

cd "$(dirname "$0")"

# Files that were modified
CONTACT_ROUTES="src/routes/contact.routes.ts"
RESERVATION_ROUTES="src/routes/reservation.routes.ts"

# Restore contact routes
if [ -f "$CONTACT_ROUTES" ]; then
    echo "Restoring authentication in $CONTACT_ROUTES..."
    
    # Restore the GET / route
    sed -i 's|// DEMO: Temporarily disable auth for frontend access|// Protected routes - Admin/Staff|g' "$CONTACT_ROUTES"
    sed -i 's|// router.get(|router.get(|g' "$CONTACT_ROUTES"
    sed -i 's|//   '\''/'\'',|  '\''/'\'',|g' "$CONTACT_ROUTES"
    sed -i 's|//   authenticate,|  authenticate,|g' "$CONTACT_ROUTES"
    sed -i 's|//   authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),|  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),|g' "$CONTACT_ROUTES"
    sed -i 's|//   contactController.getAllInquiries|  contactController.getAllInquiries|g' "$CONTACT_ROUTES"
    sed -i 's|// );|);|g' "$CONTACT_ROUTES"
    sed -i 's|router.get('\''/'\'', contactController.getAllInquiries);|// router.get('\''/'\'', contactController.getAllInquiries);|g' "$CONTACT_ROUTES"
    
    # Restore the GET /:id route
    sed -i 's|// DEMO: Temporarily disable auth for frontend access|// Protected routes - Admin/Staff|g' "$CONTACT_ROUTES"
    sed -i 's|// router.get(|router.get(|g' "$CONTACT_ROUTES"
    sed -i 's|//   '\''/:id'\'',|  '\''/:id'\'',|g' "$CONTACT_ROUTES"
    sed -i 's|//   authenticate,|  authenticate,|g' "$CONTACT_ROUTES"
    sed -i 's|//   authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),|  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),|g' "$CONTACT_ROUTES"
    sed -i 's|//   contactController.getInquiry|  contactController.getInquiry|g' "$CONTACT_ROUTES"
    sed -i 's|// );|);|g' "$CONTACT_ROUTES"
    sed -i 's|router.get('\''/:id'\'', contactController.getInquiry);|// router.get('\''/:id'\'', contactController.getInquiry);|g' "$CONTACT_ROUTES"
    
    echo "✅ Contact routes authentication restored"
else
    echo "❌ Contact routes file not found"
fi

# Restore reservation routes
if [ -f "$RESERVATION_ROUTES" ]; then
    echo "Restoring authentication in $RESERVATION_ROUTES..."
    
    # Restore the GET / route
    sed -i 's|// DEMO: Temporarily disable auth for frontend access|// Protected routes - Admin/Staff|g' "$RESERVATION_ROUTES"
    sed -i 's|// router.get(|router.get(|g' "$RESERVATION_ROUTES"
    sed -i 's|//   '\''/'\'',|  '\''/'\'',|g' "$RESERVATION_ROUTES"
    sed -i 's|//   authenticate,|  authenticate,|g' "$RESERVATION_ROUTES"
    sed -i 's|//   authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),|  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),|g' "$RESERVATION_ROUTES"
    sed -i 's|//   validate(queryReservationsSchema),|  validate(queryReservationsSchema),|g' "$RESERVATION_ROUTES"
    sed -i 's|//   reservationController.getAllReservations|  reservationController.getAllReservations|g' "$RESERVATION_ROUTES"
    sed -i 's|// );|);|g' "$RESERVATION_ROUTES"
    sed -i 's|router.get('\''/'\'', validate(queryReservationsSchema), reservationController.getAllReservations);|// router.get('\''/'\'', validate(queryReservationsSchema), reservationController.getAllReservations);|g' "$RESERVATION_ROUTES"
    
    echo "✅ Reservation routes authentication restored"
else
    echo "❌ Reservation routes file not found"
fi

echo ""
echo "🔒 Authentication restored for production!"
echo "⚠️  Remember to:"
echo "   1. Rebuild the server: npm run build"
echo "   2. Restart the server: npm start"
echo "   3. Test that authentication is working"
echo ""
echo "📝 Note: This restores the original authentication middleware."
echo "   Frontend will need proper authentication tokens to access these endpoints."
