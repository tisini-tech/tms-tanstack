import { useSession } from '@tanstack/react-start/server'
import type { Module } from './types'

type SessionData = {
  user: {
    id: number
    name: string
    email: string
    phone: string
  }
  accessToken: string
  refreshToken: string
  role: string
  modules: Module[]
  /** Email or E.164 phone awaiting OTP verification after register. */
  pendingVerification?: string
}

export function useAppSession() {
  return useSession<SessionData>({
    name: 'app-session',
    password: process.env.SESSION_SECRET!,
    maxAge: 60 * 60 * 24, // 1 day
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
    sessionHeader: 'x-app-session',
    generateId: () => crypto.randomUUID(),
  })
}
