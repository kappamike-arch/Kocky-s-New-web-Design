const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateToken() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@kockys.com' }
    });
    
    if (!user) {
      console.error('User not found');
      return;
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'change-me-now',
      { expiresIn: '24h' }
    );
    
    console.log('JWT Token generated:');
    console.log(token);
    console.log('');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('User Role:', user.role);
    
  } catch (error) {
    console.error('Error generating token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateToken();


