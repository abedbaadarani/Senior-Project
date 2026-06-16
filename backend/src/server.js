import 'dotenv/config';
import { envConfig } from './config/env.js';
import app from './app.js';
import userRepository from './data/userRepository.js';
import bcrypt from 'bcrypt';

const PORT = envConfig.PORT || 5050;

const startServer = async () => {
  try {
    const headAdminEmail = process.env.HEAD_ADMIN_EMAIL || 'admin@admin.liu.edu.lb';
    
    // Seed Head Admin if not exists in Supabase
    const existing = await userRepository.findByEmail(headAdminEmail);
    if (!existing) {
      console.log('Seeding HEAD_ADMIN user...');
      const headAdminPassword = process.env.HEAD_ADMIN_PASSWORD || 'LIU2026';
      const passwordHash = await bcrypt.hash(headAdminPassword, 10);
      await userRepository.createUser({
        name: 'System Head Admin',
        email: headAdminEmail,
        passwordHash,
        role: 'HEAD_ADMIN'
      });
      console.log('HEAD_ADMIN seeded successfully!');
    }
  } catch (err) {
    console.error('Failed to initialize or connect to database:', err);
  }
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${envConfig.NODE_ENV || 'development'} mode.`);
  });
};

startServer();
