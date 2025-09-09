import NextAuth from 'next-auth';

const handler = NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [],
  secret: 'kockys-nextauth-secret-key-2025-production-secure',
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST };