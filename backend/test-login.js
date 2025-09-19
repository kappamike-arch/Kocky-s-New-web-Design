const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    // Get the admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@kockys.com' }
    });

    if (!user) {
      console.log('Admin user not found');
      return;
    }

    console.log('Admin user found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Test password comparison
    const password = 'admin123';
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('Password comparison result:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Password is correct!');
    } else {
      console.log('❌ Password is incorrect');
      
      // Let's hash the password again and compare
      const newHash = await bcrypt.hash(password, 10);
      console.log('Original hash:', user.password);
      console.log('New hash:', newHash);
      console.log('New hash comparison:', await bcrypt.compare(password, newHash));
    }

  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();



