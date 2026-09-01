import { z } from 'zod'

import {
  ID_DOCUMENT_TYPES,
  parseIdDocumentType,
  type Player,
  type TeamPlayer,
} from '#/lib/types'

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

export const editFixtureEventSchema = z.object({
  teamId: z.string().trim().min(1, 'Team is required'),
  metricId: z.string().trim().min(1, 'Event is required'),
  metricDetailId: z.string().trim(),
  metricSubDetailId: z.string().trim(),
  playerId: z.string().trim(),
  subplayerId: z.string().trim(),
  moment: z.string().trim().min(1, 'Match half is required'),
  quarter: z.string().trim().min(1, 'Match quarter is required'),
  minute: z
    .union([z.string(), z.number()])
    .transform((v) => String(v).trim())
    .pipe(
      z
        .string()
        .min(1, 'Minute is required')
        .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, {
          message: 'Minute must be a number',
        }),
    ),
  second: z
    .union([z.string(), z.number()])
    .transform((v) => String(v).trim())
    .pipe(
      z
        .string()
        .min(1, 'Second is required')
        .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, {
          message: 'Second must be a number',
        }),
    ),
})

export type EditFixtureEventSchema = z.infer<typeof editFixtureEventSchema>

export const createFixtureEventSchema = editFixtureEventSchema
export type CreateFixtureEventSchema = EditFixtureEventSchema

export const swapFixturePlayersSchema = z
  .object({
    teamId: z.string().trim().min(1, 'Team is required'),
    wrongPlayerId: z.string().trim().min(1, 'Player is required'),
    rightPlayerId: z.string().trim().min(1, 'Player is required'),
  })
  .refine((value) => value.wrongPlayerId !== value.rightPlayerId, {
    message: 'Select two different players',
    path: ['rightPlayerId'],
  })

export type SwapFixturePlayersSchema = z.infer<typeof swapFixturePlayersSchema>

export const createPlayerSchema = z.object({
  fname: z.string().trim().min(1, 'First name is required'),
  oname: z.string().trim().min(1, 'Other name is required'),
  sname: z.string().trim(),
  playerdob: z.string().trim().min(1, 'Date of birth is required'),
  position: z.string().trim().min(1, 'Position is required'),
  countrycode: z.string().trim().min(1, 'Country is required'),
  jersey: z.string().trim().min(1, 'Jersey is required'),
  contract: z.string().trim().min(1, 'Signed date is required'),
  phone: z.string().trim(),
  idno: z.string().trim(),
  email: z.string().trim(),
  password: z.string(),
  id_document_type: z.enum(ID_DOCUMENT_TYPES).or(z.literal('')),
  fifa_id: z.string().trim(),
  preferred_foot: z.string().trim(),
})

export type CreatePlayerSchema = z.infer<typeof createPlayerSchema>

export const updatePlayerSchema = z.object({
  fname: z.string().trim().min(1, 'First name is required'),
  oname: z.string().trim(),
  sname: z.string().trim().min(1, 'Surname is required'),
  playerdob: z.string().trim(),
  position: z.string().trim().min(1, 'Position is required'),
  phone: z.string().trim(),
  country: z.string().trim(),
  jersey: z.string().trim(),
  contract: z.string().trim(),
  email: z.string().trim(),
  id_document_type: z.enum(ID_DOCUMENT_TYPES).or(z.literal('')),
  id_no: z.string().trim(),
  fifa_id: z.string().trim(),
  preferred_foot: z.string().trim(),
})

export type UpdatePlayerSchema = z.infer<typeof updatePlayerSchema>

export function toDateInputValue(value: string | null | undefined) {
  if (!value?.trim()) return ''
  const trimmed = value.trim()
  const iso = trimmed.match(/^(\d{4}-\d{2}-\d{2})/)
  if (iso?.[1]) return iso[1]

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return ''

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (value?.trim()) return value.trim()
  }
  return ''
}

export function playerToFormValues(
  player: Player,
  entry?: Pick<TeamPlayer, 'current_jersey_no' | 'signed_date'>,
): UpdatePlayerSchema {
  const nameParts = splitPlayerName(player.name ?? '')

  return {
    fname: nameParts.fname,
    oname: nameParts.oname,
    sname: nameParts.sname,
    playerdob: toDateInputValue(player.dob),
    position: firstNonEmpty(player.current_position),
    phone: '',
    country: player.country ? String(player.country) : '',
    jersey: String(entry?.current_jersey_no ?? ''),
    contract: toDateInputValue(entry?.signed_date),
    email: '',
    id_document_type: parseIdDocumentType(player.id_document_type),
    id_no: firstNonEmpty(player.id_no),
    fifa_id: firstNonEmpty(player.fifa_id),
    preferred_foot: firstNonEmpty(player.preferred_foot),
  }
}

/** "Charles Momanyi Saramu" → fname / oname / sname */
export function splitPlayerName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return { fname: '', oname: '', sname: '' }
  }
  if (parts.length === 1) {
    return { fname: parts[0] ?? '', oname: '', sname: '' }
  }
  if (parts.length === 2) {
    return {
      fname: parts[0] ?? '',
      oname: '',
      sname: parts[1] ?? '',
    }
  }

  return {
    fname: parts[0] ?? '',
    oname: parts.slice(1, -1).join(' '),
    sname: parts[parts.length - 1] ?? '',
  }
}
