import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type { Country } from '#/lib/types'
import { useAppSession } from '#/lib/session'
import { formatApiError, formatE164Phone } from '#/lib/utils'
import type {
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from '#/lib/schemas'

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: LoginSchema) => data)
  .handler(async ({ data }) => {
    const url = process.env.API_URL
    if (!url) {
      throw new Error('API_URL is not set')
    }

    const res = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_or_phone_number: data.identifier,
        password: data.password,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(`Login Failed: ${error.detail || 'Failed to login'}`)
    }

    const user = await res.json()

    const session = await useAppSession()
    await session.update({
      accessToken: user.access_token,
      refreshToken: user.refresh_token,
      user: {
        id: user.id,
        name: user.first_name + ' ' + user.last_name,
        email: user.email,
        phone: user.phone_number,
      },
    })

    return { success: true }
  })

// get access token
export const getAccessTokenFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    return session.data.accessToken
  },
)

// get user
export const getUserFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession()

  if (!session.data.user) {
    throw redirect({ to: '/login' })
  }

  return session.data.user
})

// logout
export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession()
  await session.clear()
  return { success: true }
})

export const registerFn = createServerFn({ method: 'POST' })
  .validator((data: RegisterSchema) => data)
  .handler(async ({ data }) => {
    const url = process.env.API_URL
    if (!url) {
      throw new Error('API_URL is not set')
    }

    const res = await fetch(`${url}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: formatE164Phone(data.countryCode, data.phone),
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        sir_name: '',
        username: data.username,
        password: data.password,
      }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      console.log(error)
      throw new Error(formatApiError(error, 'Failed to register'))
    }

    const pendingVerification = data.email.trim()
      ? data.email.trim()
      : formatE164Phone(data.countryCode, data.phone)

    const session = await useAppSession()
    await session.update({
      pendingVerification,
    })

    return (await res.json()) as { message?: string }
  })

export const verifyFn = createServerFn({ method: 'POST' })
  .validator((data: { otp: string }) => data)
  .handler(async ({ data }) => {
    const url = process.env.API_URL
    if (!url) {
      throw new Error('API_URL is not set')
    }

    const session = await useAppSession()
    const pendingVerification = session.data.pendingVerification?.trim()

    if (!pendingVerification) {
      throw new Error('No pending verification. Please register again.')
    }

    const res = await fetch(`${url}/auth/verify-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_or_phone_number: pendingVerification,
        otp_code: data.otp,
      }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(formatApiError(error, 'Failed to verify'))
    }

    const user = await res.json()

    await session.update({
      accessToken: user.access_token,
      refreshToken: user.refresh_token,
      pendingVerification: '',
      user: {
        id: user.id,
        name: user.first_name + ' ' + user.last_name,
        email: user.email,
        phone: user.phone_number,
      },
    })

    return { success: true }
  })

export const resendOTPFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const url = process.env.API_URL
    if (!url) {
      throw new Error('API_URL is not set')
    }

    const session = await useAppSession()
    const pendingVerification = session.data.pendingVerification?.trim()

    if (!pendingVerification) {
      throw new Error('No pending verification. Please register again.')
    }

    const res = await fetch(`${url}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_or_phone_number: pendingVerification,
        purpose: 'account_verify',
      }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(formatApiError(error, 'Failed to resend OTP'))
    }

    return (await res.json()) as { message?: string }
  },
)

export const requestOtpFn = createServerFn({ method: 'POST' })
  .validator((data: { identifier: string }) => data)
  .handler(async ({ data }) => {
    const url = process.env.API_URL
    if (!url) {
      throw new Error('API_URL is not set')
    }

    const res = await fetch(`${url}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_or_phone_number: data.identifier,
        purpose: 'password_reset',
      }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(formatApiError(error, 'Failed to request OTP'))
    }

    const session = await useAppSession()
    await session.update({
      pendingVerification: data.identifier,
    })

    return (await res.json()) as { message?: string }
  })

export const resetPasswordFn = createServerFn({ method: 'POST' })
  .validator((data: ResetPasswordSchema) => data)
  .handler(async ({ data }) => {
    const url = process.env.API_URL
    if (!url) {
      throw new Error('API_URL is not set')
    }

    const session = await useAppSession()
    const pendingVerification = session.data.pendingVerification?.trim()
    if (!pendingVerification) {
      throw new Error('No pending verification. Please request OTP again.')
    }

    const res = await fetch(`${url}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_or_phone_number: pendingVerification,
        otp_code: data.otp,
        password: data.newPassword,
      }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(formatApiError(error, 'Failed to reset password'))
    }

    return (await res.json()) as { message?: string }
  })

export const getCountriesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const countries = await apiService.get<Country[]>('/countries', true)

    return countries
  },
)
