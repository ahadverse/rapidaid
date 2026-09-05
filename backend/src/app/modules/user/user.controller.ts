import { Request, Response } from 'express';
import authUser from '../../utils/authUser';
import catchAsync from '../../utils/catchAsync';
import pickQuery from '../../utils/pickQuery';
import sendResponse from '../../utils/sendResponse';
import { userFilterableFields } from './user.constant';
import { TUserFilters } from './user.interface';
import { UserService } from './user.service';

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMe(authUser(req).userId);

  sendResponse(res, {
    statusCode: 200,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateMe(authUser(req).userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, [...userFilterableFields]) as TUserFilters;
  const options = pickQuery(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const { data, meta } = await UserService.getAllUsers(filters, options);

  sendResponse(res, {
    statusCode: 200,
    message: 'Users retrieved successfully',
    meta,
    data,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUserStatus(
    req.params.id,
    authUser(req).userId,
    req.body.status,
  );

  sendResponse(res, {
    statusCode: 200,
    message: 'User status updated successfully',
    data: result,
  });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.softDeleteUser(req.params.id, authUser(req).userId);

  sendResponse(res, {
    statusCode: 200,
    message: 'User deleted successfully',
    data: result,
  });
});

export const UserController = {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  updateUserStatus,
  softDeleteUser,
};
