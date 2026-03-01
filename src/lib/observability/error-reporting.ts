type ErrorContext = {
  scope: string
  userId?: string
  metadata?: Record<string, unknown>
}

export function reportError(error: unknown, context: ErrorContext) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  const stack = error instanceof Error ? error.stack : undefined

  console.error(
    JSON.stringify({
      level: 'error',
      message,
      stack,
      scope: context.scope,
      userId: context.userId,
      metadata: context.metadata,
      timestamp: new Date().toISOString(),
    })
  )
}

export function reportOperationalEvent(
  message: string,
  metadata?: Record<string, unknown>
) {
  console.info(
    JSON.stringify({
      level: 'info',
      message,
      metadata,
      timestamp: new Date().toISOString(),
    })
  )
}
