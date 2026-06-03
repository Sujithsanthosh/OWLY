import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  timestamp: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: any,
  message: string = 'Error',
  statusCode: number = 500
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: error instanceof Error ? error.message : error,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};

export const sendValidationError = (
  res: Response,
  errors: any,
  message: string = 'Validation Error'
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: errors,
    timestamp: new Date().toISOString(),
  };
  return res.status(400).json(response);
};
