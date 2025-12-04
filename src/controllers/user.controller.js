const userService = require('../services/user.service');

class UserController {
  /**
   * Get user profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's account page (all parties)
   */
  async getAccountPage(req, res, next) {
    try {
      const accountData = await userService.getAccountPage(req.user.id);
      res.json({
        success: true,
        data: accountData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   */
  async getStats(req, res, next) {
    try {
      const stats = await userService.getUserStats(req.user.id);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

