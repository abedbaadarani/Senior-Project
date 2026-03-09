import { userService } from '../services/userService.js';
import { successResponse } from '../utils/responseHelper.js';

export const userController = {
  getAllUsers: async (req, res, next) => {
    try {
      const users = await userService.getUsers();
      return successResponse(res, users);
    } catch (error) {
      next(error);
    }
  },
  getUserById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await userService.getUserById(id);
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  },
};
