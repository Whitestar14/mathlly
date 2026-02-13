import type { Ref } from 'vue'

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
export type QrContentType = 'text' | 'url' | 'wifi' | 'email' | 'twitter' | 'crypto' | 'pdf' | 'app'
export type WifiEncryption = 'WPA/WPA2' | 'WEP' | 'None'
export type QrStyle = 'square' | 'dots' | 'rounded'
export type QrEyeStyle = 'square' | 'circle' | 'rounded'
export type QrFrame = 'none' | 'simple' | 'bottom-text'

export interface QrContentState {
  type: QrContentType
  text: string
  url: string
  wifi: {
    ssid: string
    password: string
    encryption: WifiEncryption
    hidden: boolean
  }
  email: {
    to: string
    subject: string
    body: string
  }
  twitter: {
    text: string
    url: string
    hashtags: string
    via: string
  }
  crypto: {
    currency: 'bitcoin' | 'ethereum' | 'solana'
    address: string
    amount: string
    label: string
  }
  pdf: {
    url: string
  }
  app: {
    platform: 'ios' | 'android' | 'universal'
    appId: string // Package name or Apple ID
  }
}

export interface QrOptions {
  errorCorrectionLevel: ErrorCorrectionLevel
  margin: number
  scale: number
  pixelSize?: number | null
  color: {
    dark: string
    light: string
    eye: string // Explicitly string, we handle default fallback in logic
  }
  backgroundImage?: string | null
  width: number
  logo?: string | null
  style: QrStyle
  eyeStyle: QrEyeStyle
  frame: QrFrame
  frameText: string
  frameColor: string
}

export interface QrCodeToolOptions {
  defaultErrorCorrection: ErrorCorrectionLevel
  defaultMargin: number
  defaultScale: number
  autoGenerate: boolean
  defaultDarkColor: string
  defaultLightColor: string
}
