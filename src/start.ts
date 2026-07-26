import { createCsrfMiddleware, createStart } from '@tanstack/react-start'

import { authMiddleware } from './middlewares/auth'

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [csrfMiddleware, authMiddleware],
  }
})
