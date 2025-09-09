import { createAuth } from '@keystone-6/auth';
import { statelessSessions } from '@keystone-6/core/session';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'id name email role',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password', 'role'],
    itemData: {
      role: 'ADMIN',
    },
  },
});

const sessionSecret = process.env.SESSION_SECRET || 'your-session-secret-min-32-characters-long-please';
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret,
});

export { withAuth, session };
