const { z } = require('zod');

// Sanitize string for safe display (XSS: escape HTML entities)
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email')
  .max(255);

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character');

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
});

function validateRegister(body) {
  return registerSchema.safeParse(body);
}

function validateLogin(body) {
  return loginSchema.safeParse(body);
}

module.exports = {
  escapeHtml,
  validateRegister,
  validateLogin,
  passwordSchema,
};
