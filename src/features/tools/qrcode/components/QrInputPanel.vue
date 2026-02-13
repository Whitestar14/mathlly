<template>
  <div class="h-full flex flex-col gap-3 min-h-0">
    
    <!-- Top Bar: Type Selector & Actions -->
    <div class="flex items-center justify-between gap-2 shrink-0">
       <SelectBar
          :model-value="content.type"
          :options="typeOptions"
          class="w-44"
          placeholder="Content Type"
          @update:model-value="updateType"
       />
       <div class="flex items-center gap-1">
          <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
          <input ref="bgInput" type="file" accept="image/*" class="hidden" @change="handleBgUpload" />
          
          <BaseButton 
             v-tippy="options.logo ? 'Remove Logo' : 'Add Logo'"
             :variant="options.logo ? 'destructive' : 'ghost'" 
             size="icon" 
             class="size-8 transition-colors"
             :class="options.logo ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive' : ''"
             @click="options.logo ? emit('update:options', { ...options, logo: null }) : logoInput?.click()"
          >
             <X v-if="options.logo" class="size-4" />
             <Image v-else class="size-4" />
          </BaseButton>

           <BaseButton 
             v-tippy="options.backgroundImage ? 'Remove Background' : 'Add Background'"
             :variant="options.backgroundImage ? 'destructive' : 'ghost'" 
             size="icon" 
             class="size-8 transition-colors"
             :class="options.backgroundImage ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive' : ''"
             @click="options.backgroundImage ? emit('update:options', { ...options, backgroundImage: null }) : bgInput?.click()"
          >
             <X v-if="options.backgroundImage" class="size-4" />
             <Wallpaper v-else class="size-4" />
          </BaseButton>

          <div class="w-px h-4 bg-border mx-1"></div>
          <BaseButton v-if="!autoGenerate" v-tippy="'Generate'" variant="secondary" size="icon" class="size-8" @click="$emit('generate')">
             <Play class="size-3.5" />
          </BaseButton>
          <BaseButton v-tippy="'Clear'" variant="ghost" size="icon" class="size-8 text-muted-foreground hover:text-destructive" @click="$emit('clear')">
             <Trash2 class="size-4" />
          </BaseButton>
       </div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4">
      
      <!-- Dynamic Inputs based on Type -->
      <div class="space-y-4 p-1">
        
        <!-- TEXT MODE -->
        <BaseEditor 
          v-if="content.type === 'text'" 
          v-model="content.text" 
          class="min-h-[180px]" 
          placeholder="Enter text content..." 
          :show-line-numbers="false"
          :stats="''"
        />

        <!-- URL / PDF MODE -->
        <div v-if="content.type === 'url' || content.type === 'pdf'" class="space-y-2">
           <BaseLabel>{{ content.type === 'pdf' ? 'PDF File URL' : 'Website URL' }}</BaseLabel>
           <BaseInput v-model="content.url" placeholder="https://example.com/file.pdf" :icon="LinkIcon" />
           <p v-if="content.type === 'pdf'" class="text-xs text-muted-foreground">Note: QR codes link to the PDF file location.</p>
        </div>
        
        <!-- APP STORE MODE -->
        <div v-if="content.type === 'app'" class="space-y-3 border border-border bg-card/50 rounded-lg p-4">
           <div class="space-y-1.5">
              <BaseLabel>Platform</BaseLabel>
               <SelectBar
                 v-model="content.app.platform"
                 :options="[
                   { value: 'ios', label: 'Apple App Store' },
                   { value: 'android', label: 'Google Play Store' },
                   { value: 'universal', label: 'Universal / Other URL' }
                 ]"
               />
           </div>
           <div class="space-y-1.5">
              <BaseLabel>
                 {{ content.app.platform === 'ios' ? 'Apple ID (e.g. 123456789)' : 
                    content.app.platform === 'android' ? 'Package Name (e.g. com.example.app)' : 'App URL' }}
              </BaseLabel>
              <BaseInput v-model="content.app.appId" :placeholder="content.app.platform === 'ios' ? '123456789' : 'com.example.app'" />
           </div>
        </div>

        <!-- WIFI MODE -->
        <div v-if="content.type === 'wifi'" class="space-y-3 border border-border bg-card/50 rounded-lg p-4">
           <div class="space-y-1.5">
              <BaseLabel>Network Name (SSID)</BaseLabel>
              <BaseInput v-model="content.wifi.ssid" placeholder="MyWiFi" :icon="Wifi" />
           </div>
           <div class="space-y-1.5">
              <BaseLabel>Password</BaseLabel>
              <BaseInput v-model="content.wifi.password" type="password" placeholder="Password" :icon="Lock" />
           </div>
           <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                 <BaseLabel>Encryption</BaseLabel>
                 <SelectBar 
                    v-model="content.wifi.encryption"
                    :options="[{value: 'WPA/WPA2', label: 'WPA/WPA2'}, {value: 'WEP', label: 'WEP'}, {value: 'None', label: 'None'}]"
                 />
              </div>
              <div class="flex items-center gap-2 pt-6">
                 <input type="checkbox" v-model="content.wifi.hidden" id="hidden-wifi" class="rounded border-border text-primary focus:ring-primary/20" />
                 <label for="hidden-wifi" class="text-sm font-medium">Hidden Network</label>
              </div>
           </div>
        </div>

        <!-- EMAIL MODE -->
        <div v-if="content.type === 'email'" class="space-y-3 border border-border bg-card/50 rounded-lg p-4">
           <div class="space-y-1.5">
              <BaseLabel>Recipient</BaseLabel>
              <BaseInput v-model="content.email.to" placeholder="user@example.com" :icon="Mail" />
           </div>
           <div class="space-y-1.5">
              <BaseLabel>Subject</BaseLabel>
              <BaseInput v-model="content.email.subject" placeholder="Hello..." />
           </div>
           <div class="space-y-1.5">
              <BaseLabel>Message Body</BaseLabel>
              <textarea 
                v-model="content.email.body" 
                class="w-full min-h-[100px] p-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm resize-none"
                placeholder="Type your message here..."
              ></textarea>
           </div>
        </div>

        <!-- TWITTER MODE -->
         <div v-if="content.type === 'twitter'" class="space-y-3 border border-border bg-card/50 rounded-lg p-4">
           <div class="space-y-1.5">
              <BaseLabel>Tweet Text</BaseLabel>
              <textarea 
                v-model="content.twitter.text" 
                class="w-full min-h-[80px] p-3 rounded-md border border-border bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm resize-none"
                placeholder="Check out this tool!"
                maxlength="280"
              ></textarea>
              <p class="text-xs text-right text-muted-foreground">{{ content.twitter.text.length }}/280</p>
           </div>
           <div class="space-y-1.5">
              <BaseLabel>URL (Optional)</BaseLabel>
              <BaseInput v-model="content.twitter.url" placeholder="https://..." />
           </div>
           <div class="grid grid-cols-2 gap-4">
               <div class="space-y-1.5">
                  <BaseLabel>Hashtags</BaseLabel>
                  <BaseInput v-model="content.twitter.hashtags" placeholder="tech,code" />
               </div>
               <div class="space-y-1.5">
                  <BaseLabel>Via (@username)</BaseLabel>
                  <BaseInput v-model="content.twitter.via" placeholder="prism" />
               </div>
           </div>
        </div>

        <!-- CRYPTO MODE -->
        <div v-if="content.type === 'crypto'" class="space-y-3 border border-border bg-card/50 rounded-lg p-4">
           <div class="space-y-1.5">
              <BaseLabel>Currency</BaseLabel>
               <SelectBar
                 v-model="content.crypto.currency"
                 :options="[
                   { value: 'bitcoin', label: 'Bitcoin (BTC)' },
                   { value: 'ethereum', label: 'Ethereum (ETH)' },
                   { value: 'solana', label: 'Solana (SOL)' }
                 ]"
               />
           </div>
           <div class="space-y-1.5">
              <BaseLabel>Wallet Address</BaseLabel>
              <BaseInput v-model="content.crypto.address" placeholder="Address" :icon="Wallet" />
           </div>
           <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                 <BaseLabel>Amount</BaseLabel>
                 <BaseInput v-model="content.crypto.amount" placeholder="0.00" type="number" />
              </div>
              <div class="space-y-1.5">
                 <BaseLabel>Label (Optional)</BaseLabel>
                 <BaseInput v-model="content.crypto.label" placeholder="Donation" />
              </div>
           </div>
        </div>

      </div>

      <!-- Settings Accordion -->
      <BaseAccordion default-value="appearance" class="shrink-0">
         <AccordionItem id="appearance" title="Appearance">
             <div class="space-y-4 pt-2">
                 <!-- Shape & Frame -->
                 <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                       <BaseLabel>Data Style</BaseLabel>
                       <SelectBar
                         :model-value="options.style"
                         :options="[
                           { value: 'square', label: 'Square' },
                           { value: 'dots', label: 'Dots' },
                           { value: 'rounded', label: 'Rounded' }
                         ]"
                         @update:model-value="updateOption('style', $event)"
                       />
                    </div>
                     <div class="space-y-1.5">
                       <BaseLabel>Eye Style</BaseLabel>
                       <SelectBar
                         :model-value="options.eyeStyle"
                         :options="[
                           { value: 'square', label: 'Square' },
                           { value: 'circle', label: 'Circle' },
                           { value: 'rounded', label: 'Rounded' }
                         ]"
                         @update:model-value="updateOption('eyeStyle', $event)"
                       />
                    </div>
                 </div>

                 <!-- Frame Options -->
                 <div class="grid grid-cols-2 gap-4 items-start">
                    <div class="space-y-1.5">
                       <BaseLabel>Frame</BaseLabel>
                       <SelectBar
                         :model-value="options.frame"
                         :options="[
                           { value: 'none', label: 'None' },
                           { value: 'bottom-text', label: 'Label Frame' }
                         ]"
                         @update:model-value="updateOption('frame', $event)"
                       />
                    </div>
                    <div v-if="options.frame === 'bottom-text'" class="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                      <BaseLabel>Label Text</BaseLabel>
                      <BaseInput :model-value="options.frameText" @update:model-value="updateOption('frameText', $event)" placeholder="SCAN ME" />
                   </div>
                 </div>

                 <!-- Colors -->
                  <div class="grid grid-cols-3 gap-3">
                     <div class="space-y-1.5">
                        <BaseLabel>Data</BaseLabel>
                        <div class="flex gap-2">
                          <div class="size-8 rounded border border-border shrink-0 shadow-sm" :style="{ backgroundColor: options.color.dark }"></div>
                          <BaseColorPicker :model-value="hexToRgba(options.color.dark)" @update:model-value="(c) => updateColor('dark', rgbaToHex(c))" />
                        </div>
                     </div>
                     <div class="space-y-1.5">
                        <BaseLabel>Eyes</BaseLabel>
                        <div class="flex gap-2">
                          <div class="size-8 rounded border border-border shrink-0 shadow-sm" :style="{ backgroundColor: options.color.eye || options.color.dark }"></div>
                          <BaseColorPicker 
                             :model-value="hexToRgba(options.color.eye || options.color.dark)" 
                             @update:model-value="(c) => emit('update:options', { ...options, color: { ...options.color, eye: rgbaToHex(c) } })" 
                          />
                        </div>
                     </div>
                     <div class="space-y-1.5">
                        <BaseLabel>Bg</BaseLabel>
                        <div class="flex gap-2">
                          <div class="size-8 rounded border border-border shrink-0 shadow-sm" :style="{ backgroundColor: options.color.light }"></div>
                          <BaseColorPicker :model-value="hexToRgba(options.color.light)" @update:model-value="(c) => updateColor('light', rgbaToHex(c))" />
                        </div>
                     </div>
                  </div>
                  
                  <!-- Size Override -->
                  <div class="space-y-1.5 border-t border-border py-4 px-1">
                     <div class="flex justify-between items-center mb-1">
                         <BaseLabel>Pixel Size (Override)</BaseLabel>
                         <span class="text-xs text-muted-foreground">{{ options.pixelSize ? options.pixelSize + 'px' : 'Auto' }}</span>
                     </div>
                     <BaseSlider :model-value="[options.pixelSize || 0]" :min="0" :max="2000" :step="50" @update:model-value="(v: number[]) => updateOption('pixelSize', v[0] === 0 ? null : v[0])" />
                  </div>
             </div>
         </AccordionItem>

         <AccordionItem id="advanced" title="Advanced Config">
            <div class="space-y-4 pt-2 px-1">
              <div class="space-y-4">
                <div class="space-y-1.5">
                  <BaseLabel>Error Correction</BaseLabel>
                  <SelectBar
                    :model-value="options.errorCorrectionLevel"
                    :options="[
                      { label: 'Low (7%)', value: 'L' },
                      { label: 'Medium (15%)', value: 'M' },
                      { label: 'Quartile (25%)', value: 'Q' },
                      { label: 'High (30%)', value: 'H' }
                    ]"
                    @update:model-value="updateOption('errorCorrectionLevel', $event)"
                  />
                  <p class="text-xs text-muted-foreground mt-1">Higher levels allow more damage but reduce data density.</p>
                </div>
                
                <div class="space-y-1.5">
                   <div class="flex justify-between">
                     <BaseLabel>Quiet Zone (Margin)</BaseLabel>
                     <span class="text-xs text-muted-foreground">{{ options.margin }} modules</span>
                   </div>
                   <BaseSlider :model-value="[options.margin]" :min="0" :max="10" :step="1" @update:model-value="(v: number[]) => updateOption('margin', v[0])" />
                </div>
              </div>
            </div>
         </AccordionItem>
      </BaseAccordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Play, Trash2, Link as LinkIcon, Wifi, Lock, Mail, Image, Wallet, X, Wallpaper } from 'lucide-vue-next'
import { BaseEditor, BaseButton, BaseAccordion, AccordionItem, SelectBar, BaseSlider, BaseLabel, BaseInput, BaseColorPicker } from '@components/ui'
import { type QrOptions, type QrContentState, type QrContentType } from '../types'
import { hexToHsva, hsvaToRgba, rgbaToHex, type RGBA } from '@color/lib/color'
import { useToast } from '@composables/ui/useToast'

const props = defineProps<{
  content: QrContentState
  options: QrOptions
  autoGenerate: boolean
}>()

const emit = defineEmits<{
  (e: 'update:content', val: QrContentState): void
  (e: 'update:options', val: QrOptions): void
  (e: 'generate'): void
  (e: 'clear'): void
}>()

const { toast } = useToast()
const logoInput = ref<HTMLInputElement | null>(null)
const bgInput = ref<HTMLInputElement | null>(null)

const typeOptions = [
  { value: 'text', label: 'Plain Text' },
  { value: 'url', label: 'Website URL' },
  { value: 'app', label: 'App Store' },
  { value: 'wifi', label: 'Wi-Fi Network' },
  { value: 'email', label: 'Email' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'pdf', label: 'PDF URL' }
]

const updateType = (type: QrContentType) => {
  emit('update:content', { ...props.content, type })
}

const updateOption = (key: keyof QrOptions, value: any) => {
  emit('update:options', { ...props.options, [key]: value })
}

const updateColor = (key: 'dark' | 'light', value: string) => {
  emit('update:options', { 
    ...props.options, 
    color: { ...props.options.color, [key]: value } 
  })
}

const handleLogoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    emit('update:options', { ...props.options, logo: result })
    toast({ title: 'Logo Added', description: 'Error correction set to High', type: 'success' })
  }
  reader.readAsDataURL(file)
}

const handleBgUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    emit('update:options', { ...props.options, backgroundImage: result })
    toast({ title: 'Background Added', description: 'Background image set', type: 'success' })
  }
  reader.readAsDataURL(file)
}

const hexToRgba = (hex: string): RGBA => {
  const hsva = hexToHsva(hex)
  return hsva ? hsvaToRgba(hsva) : { r: 0, g: 0, b: 0, a: 1 }
}
</script>
