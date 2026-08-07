import { z } from 'zod'

export type LoginMethod = 'phone' | 'email'

/** Payload sent to the login API / server fn. */
export const loginPayloadSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginSchema = z.infer<typeof loginPayloadSchema>

/** Form-level validation — only the active method field is required. */
export function createLoginSchema(method: LoginMethod) {
  return z
    .object({
      email: z.string(),
      phone: z.string(),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    })
    .superRefine((data, ctx) => {
      if (method === 'email') {
        const email = data.email.trim()
        if (!email) {
          ctx.addIssue({
            code: 'custom',
            message: 'Email is required',
            path: ['email'],
          })
          return
        }
        if (!z.string().email().safeParse(email).success) {
          ctx.addIssue({
            code: 'custom',
            message: 'Invalid email address',
            path: ['email'],
          })
        }
        return
      }

      const phone = data.phone.trim().replace(/\D/g, '')
      if (phone.length < 10) {
        ctx.addIssue({
          code: 'custom',
          message: 'Phone number must be at least 10 digits',
          path: ['phone'],
        })
      }
    })
}

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character')

const localPhoneSchema = z
  .string()
  .regex(/^\d{9}$/, 'Phone number must be exactly 9 digits')

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z.string().min(1, 'Username is required'),
    countryCode: z.string().min(1, 'Country code is required'),
    phone: localPhoneSchema,
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(6, 'Enter the 6-digit code')
      .regex(/^\d{6}$/, 'OTP must be 6 digits'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const verifySchema = z.object({
  otp: z
    .string()
    .length(6, 'Enter the 6-digit code')
    .regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export type RegisterSchema = z.infer<typeof registerSchema>

export const ARTICLE_EXCERPT_MAX_CHARS = 500

export const articleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z
    .string()
    .trim()
    .min(1, 'Excerpt is required')
    .max(
      ARTICLE_EXCERPT_MAX_CHARS,
      `Excerpt must be ${ARTICLE_EXCERPT_MAX_CHARS} characters or fewer`,
    ),
  accessType: z.string().min(1, 'Access type is required'),
  featuredImage: z
    .string()
    .nullable()
    .refine((value) => Boolean(value?.trim()), {
      message: 'Featured image is required',
    }),
  categoryId: z.string().min(1, 'Category is required'),
  keywords: z.string().trim().min(1, 'Keywords are required'),
  /** Edit-only — optional on create */
  slug: z.string().optional(),
  authorId: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export type ArticleFormValues = z.infer<typeof articleFormSchema>

export function getArticleFormSchema(mode: 'create' | 'edit') {
  if (mode === 'create') {
    return articleFormSchema
  }

  return articleFormSchema.extend({
    slug: z
      .string()
      .min(1, 'Slug is required')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Use lowercase letters, numbers, and hyphens',
      ),
    authorId: z.string().min(1, 'Author is required'),
    status: z.enum(['draft', 'published']),
  })
}

/** @deprecated Use ArticleFormValues */
export type ArticleSchema = ArticleFormValues

export type CreateArticlePayload = {
  id?: string
  title: string
  excerpt: string
  content: string
  access_type: string
  featured_image: string
  category_id: number
  keywords: string
}

export function toCreateArticlePayload(
  values: ArticleFormValues,
  content: string,
): CreateArticlePayload {
  return {
    title: values.title.trim(),
    excerpt: values.excerpt.trim(),
    content,
    access_type: values.accessType,
    featured_image: values.featuredImage ?? '',
    category_id: Number(values.categoryId),
    keywords: values.keywords.trim(),
  }
}

export function toUpdateArticlePayload(
  values: ArticleFormValues,
  content: string,
  id: string,
): CreateArticlePayload {
  return {
    id,
    title: values.title.trim(),
    excerpt: values.excerpt.trim(),
    content,
    access_type: values.accessType,
    featured_image: values.featuredImage ?? '',
    category_id: Number(values.categoryId),
    keywords: values.keywords.trim(),
  }
}

export type RequestPasswordMethod = 'phone' | 'email'

export function requestPasswordSchema(method: RequestPasswordMethod) {
  return z
    .object({
      phone: z.string(),
      email: z.string(),
    })
    .superRefine((data, ctx) => {
      if (method === 'phone') {
        const phone = data.phone.trim()
        if (phone.length < 10) {
          ctx.addIssue({
            code: 'custom',
            message: 'Phone number must be at least 10 digits',
            path: ['phone'],
          })
        }
        return
      }

      const email = data.email.trim()
      if (!email) {
        ctx.addIssue({
          code: 'custom',
          message: 'Email is required',
          path: ['email'],
        })
        return
      }

      const emailResult = z
        .string()
        .email('Invalid email address')
        .safeParse(email)
      if (!emailResult.success) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid email address',
          path: ['email'],
        })
      }
    })
}

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
})

export type CreateCategorySchema = z.infer<typeof createCategorySchema>
