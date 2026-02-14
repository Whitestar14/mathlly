import * as Sentry from '@sentry/vue'
import { type App, watch } from 'vue'
import { useSettingsStore } from '@stores/settings'

/**
 * Telemetry Service
 * Handles error reporting and crash analytics.
 * Respects user privacy settings strictly.
 */
export class TelemetryService {
  private static instance: TelemetryService
  private isInitialized = false
  private app: App | null = null

  private readonly dsn = import.meta.env.VITE_SENTRY_DSN || ''

  static getInstance(): TelemetryService {
    if (!this.instance) {
      this.instance = new TelemetryService()
    }
    return this.instance
  }

  /**
   * Initializes the telemetry service.
   */
  init(app: App) {
    this.app = app
    const settings = useSettingsStore()

    // 1. Initial check
    if (settings.privacy.crashReportingEnabled) {
      this.startSentry()
    }

    // 2. Watch for changes in settings
    watch(
      () => settings.privacy.crashReportingEnabled,
      enabled => {
        if (enabled) {
          this.startSentry()
        } else {
          this.stopSentry()
        }
      }
    )
  }

  private startSentry() {
    if (this.isInitialized || !this.app || !this.dsn) return

    // Allow forcing Sentry in dev for testing purposes
    const forceEnable = import.meta.env.VITE_ENABLE_SENTRY === 'true'

    // Only run in production to save quota and noise, unless forced
    if (import.meta.env.DEV && !forceEnable) {
      console.log('[Telemetry] Crash reporting enabled (Mock Mode for Dev)')
      this.isInitialized = true
      return
    }

    try {
      Sentry.init({
        app: this.app,
        dsn: this.dsn,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration()
        ],
        // Performance Monitoring
        tracesSampleRate: 0.2, // Capture 20% of transactions for performance
        // Session Replay
        replaysSessionSampleRate: 0.0, // Don't record normal sessions
        replaysOnErrorSampleRate: 1.0, // Record session when an error occurs

        beforeSend(event) {
          // Filter out specific errors if needed
          return event
        }
      })
      this.isInitialized = true
      console.log(`[Telemetry] Sentry initialized${import.meta.env.DEV ? ' (Forced Dev Mode)' : ''}`)
    } catch(e) {
      console.error('[Telemetry] Failed to initialize Sentry', e)
    }
  }

  private stopSentry() {
    if (!this.isInitialized) return

    const client = Sentry.getClient()
    if (client) {
      client.close().then(() => {
        this.isInitialized = false
        console.log('[Telemetry] Sentry stopped')
      })
    }
  }

  /**
   * Manually log an error if needed (e.g. from try/catch blocks)
   */
  logError(error: unknown) {
    if (!this.isInitialized) return

    const forceEnable = import.meta.env.VITE_ENABLE_SENTRY === 'true'

    if (import.meta.env.DEV && !forceEnable) {
      console.error('[Telemetry Mock] Error logged:', error)
      return
    }

    Sentry.captureException(error)
  }
}
