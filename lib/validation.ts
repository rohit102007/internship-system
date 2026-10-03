export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^\+?\d{10,15}$/;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function validPhone(phone: unknown) {
  return typeof phone === 'string' && PHONE_PATTERN.test(phone.replace(/[\s-]/g, ''));
}

export function validGpa(value: unknown) {
  const gpa = Number(value);
  return Number.isFinite(gpa) && gpa >= 0 && gpa <= 4;
}

export function validFutureRange(startValue: unknown, endValue: unknown) {
  const start = new Date(String(startValue));
  const end = new Date(String(endValue));
  const now = new Date();
  return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start > now && end > now && start < end;
}
