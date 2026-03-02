import { env } from '@/lib/env'

type ErrorContext = {
  scope: string
  userId?: string
  metadata?: Record<string, unknown>
}

const SENSITIVE_KEYS = new Set([
    'password',
    'token',
    'secret',
    'apikey',
    'api_key',
    'ssn',
    'auth',
    'credentials',
    'authorization',
    'cookie',
    'session',
])

function redactSensitiveData(obj: unknown, seen = new WeakSet()): unknown {
    if (obj === null || obj === undefined) return obj
    if (typeof obj !== 'object') return obj

    // Handle circular references
    if (seen.has(obj as object)) return '[Circular]'
    seen.add(obj as object)

    if (Array.isArray(obj)) {
        return obj.map(item => redactSensitiveData(item, seen))
    }

    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase()
        const isSensitive =
      SENSITIVE_KEYS.has(lowerKey) ||
      lowerKey.includes('secret') ||
      lowerKey.includes('token') ||
      // Password variants: pass, pwd, passwd, passphrase, passwordHash, etc.
      lowerKey.includes('pass') ||
      lowerKey.includes('pwd')

        if (isSensitive) {
            result[key] = '[REDACTED]'
        } else {
            result[key] = redactSensitiveData(value, seen)
        }
    }
    return result
}

function safeStringify(obj: unknown): string {
    try {
        return JSON.stringify(obj)
    } catch {
        return '[Serialization failed]'
    }
}

function emitConsole(level: 'error' | 'info', payload: Record<string, unknown>) {
    const serialized = safeStringify(payload)
    if (level === 'error') {
        console.error(serialized)
        return
    }

    console.info(serialized)
}

function emitWebhook(level: 'error' | 'info', payload: Record<string, unknown>) {
    if (!env.observabilityWebhookUrl) {
        return
    }

    void fetch(env.observabilityWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: safeStringify({
            ...payload,
            level,
            environment: env.appEnvironment,
            source: 'recruitme',
        }),
    }).catch(() => undefined)
}

export function reportError(error: unknown, context: ErrorContext) {
    try {
        const message = error instanceof Error ? error.message : 'Unknown error'
        const stack = error instanceof Error ? error.stack : undefined
        const sanitizedMetadata = redactSensitiveData(context.metadata)
        const timestamp = new Date().toISOString()

        // Full payload for local logging (includes stack for debugging)
        const consolePayload = {
            level: 'error',
            message,
            stack,
            scope: context.scope,
            userId: context.userId,
            metadata: sanitizedMetadata,
            timestamp,
            environment: env.appEnvironment,
        }

        // Redacted payload for external webhook (no stack to avoid leaking internals)
        const webhookPayload = {
            level: 'error',
            message,
            scope: context.scope,
            userId: context.userId,
            metadata: sanitizedMetadata,
            timestamp,
            environment: env.appEnvironment,
        }

        emitConsole('error', consolePayload)
        emitWebhook('error', webhookPayload)
    } catch {
    // Last resort: never throw from logging
        console.error('Error reporting failed')
    }
}

export function reportOperationalEvent(
    message: string,
    metadata?: Record<string, unknown>,
) {
    try {
        const sanitizedPayload = {
            level: 'info',
            message,
            metadata: redactSensitiveData(metadata),
            timestamp: new Date().toISOString(),
            environment: env.appEnvironment,
        }

        emitConsole('info', sanitizedPayload)
        emitWebhook('info', sanitizedPayload)
    } catch {
    // Last resort: never throw from logging
        console.info('Operational event reporting failed')
    }
}
