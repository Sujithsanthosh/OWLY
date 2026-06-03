import { Response } from 'express';
import { sendValidationError } from './responses';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[^\d]/g, ''));
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain number' };
  }
  return { valid: true };
};

export const validateRequired = (fields: { [key: string]: any }): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${key} is required`);
    }
  }
  return { valid: errors.length === 0, errors };
};

export const validateSignupData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else {
    const passwordCheck = validatePassword(data.password);
    if (!passwordCheck.valid) {
      errors.push(passwordCheck.message || 'Invalid password');
    }
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  return { valid: errors.length === 0, errors };
};

export const validateLoginData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.email && !data.phone) {
    errors.push('Email or phone is required');
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return { valid: errors.length === 0, errors };
};

export const handleValidationError = (res: Response, errors: string[]) => {
  return sendValidationError(res, errors, 'Validation Error');
};
