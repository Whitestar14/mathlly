
<template>
  <div class="h-full bg-card border border-border rounded-2xl p-4 flex flex-col relative overflow-hidden group">
    <!-- Gradient Top Fade -->
    <div class="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-card to-transparent pointer-events-none z-10"></div>
    
    <div class="relative z-20 flex items-center justify-between mb-2 px-1">
      <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <LayoutGrid class="size-3" />
        Library
      </span>
      <div class="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground font-mono">
        {{ totalTools }}
      </div>
    </div>

    <div class="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar pt-2">
        <div class="grid grid-cols-1 gap-2">
            <template v-for="category in categories" :key="category.title">
                <!-- Category Label -->
                <div class="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mt-3 mb-1 px-1">
                    {{ category.title }}
                </div>

                <component
                :is="item.badge === 'soon' ? 'div' : 'RouterLink'"
                v-for="item in category.items"
                :key="item.id"
                :to="item.path"
                class="group/item flex items-center p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-muted/40 transition-all duration-200"
                :class="{ 'opacity-50 cursor-not-allowed': item.badge === 'soon' }"
                >
                <div class="p-2 rounded-md bg-muted group-hover/item:bg-background group-hover/item:text-primary transition-colors shadow-sm mr-3">
                    <component :is="item.icon" class="size-4" />
                </div>
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-foreground truncate">
                            {{ item.name }}
                        </span>
                        <span v-if="item.badge" :class="[
                            'text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider',
                            item.badge === 'new' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'
                        ]">
                            {{ item.badge }}
                        </span>
                    </div>
                </div>
                </component>
            </template>
        </div>
    </div>
    
    <!-- Bottom Fade -->
    <div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none z-10"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { LayoutGrid } from 'lucide-vue-next'
import { useHomeNavigation } from '../composables/useHomeNavigation'

const { categories } = useHomeNavigation()
const totalTools = computed(() => categories.value.reduce((acc, cat) => acc + cat.items.length, 0))
</script>
