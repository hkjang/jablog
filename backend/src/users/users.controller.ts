import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * Get all users with optional role filter
   */
  @Get()
  async getUsers(@Query('role') role?: UserRole) {
    return this.usersService.getUsers(role);
  }

  /**
   * POST /users
   * Create new user
   */
  @Post()
  async createUser(
    @Body() data: {
      email: string;
      password: string;
      name: string;
      role?: UserRole;
      avatar?: string;
    },
  ) {
    return this.usersService.createUser(data);
  }

  /**
   * GET /users/:id
   * Get user by ID
   */
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUser(id);
  }

  /**
   * PUT /users/:id
   * Update user profile
   */
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: {
      email?: string;
      name?: string;
      role?: UserRole;
      avatar?: string;
      isActive?: boolean;
    },
  ) {
    return this.usersService.updateUser(id, data);
  }

  /**
   * DELETE /users/:id
   * Soft delete user (sets isActive=false)
   */
  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  /**
   * PUT /users/:id/password
   * Change user password
   */
  @Put(':id/password')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(id, data.currentPassword, data.newPassword);
  }

  /**
   * GET /users/:id/settings
   * Get user settings
   */
  @Get(':id/settings')
  async getUserSettings(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserSettings(id);
  }

  /**
   * PUT /users/:id/settings
   * Update user settings
   */
  @Put(':id/settings')
  async updateUserSettings(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.usersService.updateUserSettings(id, data);
  }

  /**
   * DELETE /users/:id/settings
   * Reset user settings to defaults
   */
  @Delete(':id/settings')
  async resetUserSettings(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.resetUserSettings(id);
  }

  /**
   * GET /users/:id/menus
   * Get menus based on user role
   */
  @Get(':id/menus')
  async getUserMenus(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.getUser(id);
    if (!user) {
      return [];
    }
    return this.usersService.getMenusByRole(user.role);
  }

  /**
   * GET /users/:id/productivity
   * Get user productivity stats
   */
  @Get(':id/productivity')
  async getProductivityStats(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getProductivityStats(id);
  }
}
