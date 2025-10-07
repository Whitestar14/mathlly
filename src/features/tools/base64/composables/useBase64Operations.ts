import { ref, computed, type Ref } from "vue"
import type { Base64Options, TextStats, Base64ProcessingResult } from "../types/base64"

export function useBase64Operations(input: Ref<string>, options: Ref<Base64Options>) {
  const output = ref("")
  const isProcessing = ref(false)
  const validationError = ref("")
  const processState = ref<Base64ProcessingResult>({ success: true })
  const error = ref<unknown>(null)

  const inputStats = computed<TextStats>(() => ({
    characters: input.value.length,
    bytes: new Blob([input.value]).size,
    lines: input.value.split("\n").length,
  }))

  const outputStats = computed<TextStats>(() => ({
    characters: output.value.length,
    bytes: new Blob([output.value]).size,
    lines: output.value.split("\n").length,
  }))

  const isValidBase64 = (raw: string): boolean => {
    if (!raw.trim()) return true
    try {
      let s = raw.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/")
      if (options.value.outputFormat !== "url-safe" && s.length % 4 !== 0) return false
      atob(s)
      return true
    } catch {
      return false
    }
  }

  const encodeToBase64 = async (text: string): Promise<string> => {
    const processed = options.value.preserveWhitespace ? text : text.trim()
    const bytes = new TextEncoder().encode(processed)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    let encoded = btoa(binary)
    if (options.value.outputFormat === "url-safe") {
      encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    } else if (options.value.outputFormat === "mime") {
      const chunks = encoded.match(new RegExp(`.{1,${options.value.lineLength}}`, "g")) || []
      encoded = chunks.join("\n")
    }
    return encoded
  }

  const decodeFromBase64 = async (base64: string): Promise<string> => {
    let s = base64.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/")
    while (s.length % 4 !== 0) s += "="
    const bin = atob(s)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  }

  const processInput = async (tab: "encode" | "decode"): Promise<Base64ProcessingResult> => {
    isProcessing.value = true
    validationError.value = ""
    error.value = null
    try {
      if (!input.value.trim()) {
        output.value = ""
        processState.value = { success: true }
        return processState.value
      }
      if (tab === "encode") {
        output.value = await encodeToBase64(input.value)
      } else {
        if (!isValidBase64(input.value)) {
          output.value = ""
          processState.value = { success: false, error: "Invalid Base64 format" }
          return processState.value
        }
        output.value = await decodeFromBase64(input.value)
      }
      processState.value = { success: true, output: output.value }
      return processState.value
    } catch (e) {
      output.value = ""
      error.value = e
      processState.value = { success: false, error: e instanceof Error ? e.message : "Processing failed" }
      return processState.value
    } finally {
      isProcessing.value = false
    }
  }

  return {
    output,
    isProcessing,
    validationError,
    inputStats,
    outputStats,
    processInput,
    processState,
    error,
  }
}
