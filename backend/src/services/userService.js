import userRepository from '../data/userRepository.js';

export const userService = {
  getUsers: async () => {
    return await userRepository.getAllUsers();
  },
  getUserById: async (id) => {
    const user = await userRepository.getUserById(id);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return user;
  },
};
