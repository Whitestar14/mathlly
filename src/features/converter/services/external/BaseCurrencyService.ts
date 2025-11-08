import { CacheManager } from '@shared/utils/cache/CacheManager'
import type { ExternalConverterService, ExchangeRates } from '../../types/converter'
import { createFetch } from '@vueuse/core'

export class BaseCurrencyService implements ExternalConverterService {
  private cache = CacheManager.getCache<ExchangeRates>('currency-rates', 50)
  private cacheTTL = 3600000
  private lastFetchTime = new Map<string, number>()

  async fetchRates(baseCurrency: string): Promise<ExchangeRates> {
    const cacheKey = `rates:${baseCurrency}`
    const cached = this.cache.get(cacheKey)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < this.cacheTTL) {
      return cached
    }

    try {
      const { data, error } = await createFetch({
        baseUrl: 'https://open.er-api.com/v6',
        options: {
          timeout: 10000,
          onFetchError: ctx => {
            if (ctx.error?.name === 'AbortError') {
              ctx.error = new Error('Request timed out. Please check your internet connection and try again, or reload the page.')
            } else if (ctx.error?.message.includes('Failed to fetch') || ctx.error?.message.includes('NetworkError')) {
              ctx.error = new Error('Unable to connect to exchange rate service. Please check your internet connection and reload the page if the problem persists.')
            } else if (ctx.response?.status === 429) {
              ctx.error = new Error('Exchange rate service is temporarily unavailable due to rate limiting. Please try again later.')
            } else if (ctx.response && ctx.response.status >= 500) {
              ctx.error = new Error('Exchange rate service is temporarily unavailable. Please try again later or reload the page.')
            } else if (ctx.response && !ctx.response.ok) {
              ctx.error = new Error(`Unable to fetch exchange rates (HTTP ${ctx.response.status}). Please check your connection and try again.`)
            }
            return ctx
          }
        }
      })(`/latest/${baseCurrency}`).get().json()

      if (error.value) {
        throw error.value
      }

      if (!data.value || !data.value.rates || typeof data.value.rates !== 'object') {
        throw new Error('Invalid response from exchange rate service. Please try again later.')
      }

      const rates: ExchangeRates = {
        base: data.value.base || baseCurrency,
        date: data.value.date || new Date().toISOString().split('T')[0],
        rates: data.value.rates,
        timestamp: now
      }

      this.cache.set(cacheKey, rates)
      this.lastFetchTime.set(baseCurrency, now)

      return rates
    } catch(error) {
      if (cached) {
        console.warn('Using stale exchange rates due to network error:', error)
        return cached
      }

      throw error
    }
  }

  async refreshRates(baseCurrency: string): Promise<void> {
    const cacheKey = `rates:${baseCurrency}`
    this.cache.delete(cacheKey)
    this.lastFetchTime.delete(baseCurrency)
    await this.fetchRates(baseCurrency)
  }

  async convert(value: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return value

    const cachedRate = this.getCachedRate(fromCurrency, toCurrency)
    if (cachedRate !== null) {
      return value * cachedRate
    }

    const rates = await this.fetchRates(fromCurrency)
    const rate = rates.rates[toCurrency]

    if (!rate) {
      throw new Error(`Invalid currency: ${toCurrency}`)
    }

    return value * rate
  }

  getCachedRate(fromCurrency: string, toCurrency: string): number | null {
    const cacheKey = `rates:${fromCurrency}`
    const cached = this.cache.get(cacheKey)

    if (!cached) return null

    const now = Date.now()
    if ((now - cached.timestamp) > this.cacheTTL) return null

    return cached.rates[toCurrency] || null
  }

  getLastUpdate(): number | null {
    let latest: number | null = null

    for (const time of this.lastFetchTime.values()) {
      if (latest === null || time > latest) latest = time
    }

    return latest
  }

  getCacheStats(): { size: number; lastUpdate: number | null } {
    return {
      size: this.cache.size,
      lastUpdate: this.getLastUpdate()
    }
  }
}
