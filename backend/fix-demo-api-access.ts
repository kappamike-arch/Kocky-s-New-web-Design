import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Fix Demo API Access
 * 
 * This script temporarily disables authentication for demo endpoints
 * to allow frontend access to contact inquiries and reservations data.
 * 
 * WARNING: This is for DEMO purposes only. Re-enable authentication in production!
 */

const backendPath = '/home/stagingkockys/Kocky\'s New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design/backend/src';

// Files to modify
const filesToModify = [
  {
    file: 'routes/contact.routes.ts',
    changes: [
      {
        from: "router.get(\n  '/',\n  authenticate,\n  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),\n  contactController.getAllInquiries\n);",
        to: "// DEMO: Temporarily disable auth for frontend access\n// router.get(\n//   '/',\n//   authenticate,\n//   authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),\n//   contactController.getAllInquiries\n// );\nrouter.get('/', contactController.getAllInquiries);"
      },
      {
        from: "router.get(\n  '/:id',\n  authenticate,\n  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),\n  contactController.getInquiry\n);",
        to: "// DEMO: Temporarily disable auth for frontend access\n// router.get(\n//   '/:id',\n//   authenticate,\n//   authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),\n//   contactController.getInquiry\n// );\nrouter.get('/:id', contactController.getInquiry);"
      }
    ]
  },
  {
    file: 'routes/reservation.routes.ts',
    changes: [
      {
        from: "router.get(\n  '/',\n  authenticate,\n  authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),\n  validate(queryReservationsSchema),\n  reservationController.getAllReservations\n);",
        to: "// DEMO: Temporarily disable auth for frontend access\n// router.get(\n//   '/',\n//   authenticate,\n//   authorize(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN),\n//   validate(queryReservationsSchema),\n//   reservationController.getAllReservations\n// );\nrouter.get('/', validate(queryReservationsSchema), reservationController.getAllReservations);"
      }
    ]
  }
];

function applyChanges() {
  console.log('🔧 Applying demo API access fixes...');
  
  filesToModify.forEach(({ file, changes }) => {
    const filePath = join(backendPath, file);
    
    try {
      let content = readFileSync(filePath, 'utf8');
      let modified = false;
      
      changes.forEach(({ from, to }) => {
        if (content.includes(from)) {
          content = content.replace(from, to);
          modified = true;
          console.log(`✅ Modified ${file}`);
        } else {
          console.log(`⚠️  Pattern not found in ${file}`);
        }
      });
      
      if (modified) {
        // Create backup
        writeFileSync(`${filePath}.backup`, readFileSync(filePath, 'utf8'));
        writeFileSync(filePath, content);
        console.log(`💾 Created backup: ${file}.backup`);
      }
      
    } catch (error) {
      console.error(`❌ Error modifying ${file}:`, error);
    }
  });
  
  console.log('🎉 Demo API access fixes applied!');
  console.log('⚠️  WARNING: Authentication is now disabled for demo purposes.');
  console.log('🔄 Restart the backend server for changes to take effect.');
}

function restoreAuth() {
  console.log('🔒 Restoring authentication...');
  
  filesToModify.forEach(({ file }) => {
    const filePath = join(backendPath, file);
    const backupPath = `${filePath}.backup`;
    
    try {
      if (require('fs').existsSync(backupPath)) {
        const backupContent = readFileSync(backupPath, 'utf8');
        writeFileSync(filePath, backupContent);
        console.log(`✅ Restored ${file}`);
      } else {
        console.log(`⚠️  No backup found for ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error restoring ${file}:`, error);
    }
  });
  
  console.log('🔒 Authentication restored!');
  console.log('🔄 Restart the backend server for changes to take effect.');
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'apply':
    applyChanges();
    break;
  case 'restore':
    restoreAuth();
    break;
  default:
    console.log('Usage:');
    console.log('  npx ts-node fix-demo-api-access.ts apply   - Disable auth for demo');
    console.log('  npx ts-node fix-demo-api-access.ts restore - Restore authentication');
    break;
}


