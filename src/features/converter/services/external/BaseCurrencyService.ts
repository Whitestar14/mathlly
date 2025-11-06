import { CacheManager } from '@shared/utils/cache/CacheManager'
import type { ExternalConverterService, ExchangeRates } from '../../types/converter'

export class BaseCurrencyService implements ExternalConverterService {
  private apiBaseUrl = 'https://api.exchangerate.host'
  private cache = CacheManager.getCache<ExchangeRates>('currency-rates', 50)
  private cacheTTL = 3600000
  private lastFetchTime = new Map<string, number>()
  private isOffline = false

  private async fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url)
        if (response.status === 429) {
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
            continue
          }
          throw new Error('Rate limit exceeded')
        }
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        return await response.json()
      } catch (error) {
        if (i === retries - 1) throw error
      }
    }
  }

  async fetchRates(baseCurrency: string): Promise<ExchangeRates> {
    const cacheKey = `rates:${baseCurrency}`
    const cached = this.cache.get(cacheKey)
    const now = Date.now()
    if (cached && (now - cached.timestamp) < this.cacheTTL) {
      return cached
    }

    try {
      const data = await this.fetchWithRetry(`${this.apiBaseUrl}/latest?base=${baseCurrency}`)
      const rates: ExchangeRates = {
        base: data.base,
        date: data.date,
        rates: data.rates,
        timestamp: now
      }
      this.cache.set(cacheKey, rates)
      this.lastFetchTime.set(baseCurrency, now)
      this.isOffline = false
      return rates
    } catch (error) {
      this.isOffline = true
      if (cached) {
        return cached // use stale cache
      }
      throw error
    }
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

  async isOnline(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${this.apiBaseUrl}/latest?base=USD`, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (response.ok) {
        this.isOffline = false
        return true
      }
      return false
    } catch {
      this.isOffline = true
      return false
    }
  }

  getLastUpdate(): number | null {
    let latest: number | null = null
    for (const time of this.lastFetchTime.values()) {
      if (latest === null || time > latest) latest = time
    }
    return latest
  }
}