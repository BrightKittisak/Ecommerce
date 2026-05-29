import { z } from 'zod'

const UserName = z
  .string()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(50, { message: 'Name must be 50 characters or fewer' })

const Email = z
  .string()
  .min(1, 'Email is required')
  .email('Email is invalid')

const StrongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be 100 characters or fewer')
  .refine((value) => /[a-z]/.test(value), {
    message: 'Password must include at least one lowercase letter',
  })
  .refine((value) => /[A-Z]/.test(value), {
    message: 'Password must include at least one uppercase letter',
  })
  .refine((value) => /\d/.test(value), {
    message: 'Password must include at least one number',
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: 'Password must include at least one special character',
  })

const ExistingPassword = z
  .string()
  .min(1, 'Password is required')
  .max(100, 'Password must be 100 characters or fewer')

export const UserSignInSchema = z.object({
  email: Email,
  password: ExistingPassword,
})

export const UserSignUpSchema = z
  .object({
    name: UserName,
    email: Email,
    password: StrongPassword,
    confirmPassword: StrongPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
