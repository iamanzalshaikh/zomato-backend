const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;

export const isValidEmail = (email: string): boolean =>
  EMAIL_REGEX.test(email.trim().toLowerCase());

export const isValidPhone = (phone: string): boolean =>
  PHONE_REGEX.test(phone.trim());

export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

export const normalizePhone = (phone: string): string => phone.trim();
