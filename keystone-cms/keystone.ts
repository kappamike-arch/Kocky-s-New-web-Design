import { config } from '@keystone-6/core';
import { lists } from './schema';
import { withAuth, session } from './auth';
import { DatabaseConfig } from '@keystone-6/core/types';
import dotenv from 'dotenv';

dotenv.config({ path: '../nestjs-backend/.env' });

const databaseConfig: DatabaseConfig = {
  provider: 'postgresql',
  url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kockysbar',
  enableLogging: true,
  idField: { kind: 'uuid' },
};

export default withAuth(
  config({
    db: databaseConfig,
    lists,
    session,
    server: {
      cors: { 
        origin: ['http://72.167.227.205:3003/', 'http://localhost:3000'],
        credentials: true 
      },
      port: 4000,
    },
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
      publicPages: ['/'],
    },
    storage: {
      // Store images and files locally for development
      local_images: {
        kind: 'local',
        type: 'image',
        generateUrl: (path) => `http://localhost:4000/images${path}`,
        serverRoute: {
          path: '/images',
        },
        storagePath: 'public/images',
      },
      local_files: {
        kind: 'local',
        type: 'file',
        generateUrl: (path) => `http://localhost:4000/files${path}`,
        serverRoute: {
          path: '/files',
        },
        storagePath: 'public/files',
      },
    },
  })
);
