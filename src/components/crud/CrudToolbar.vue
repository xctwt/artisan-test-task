<script setup lang="ts">
import { computed } from 'vue'
import type { TabsItem } from '@nuxt/ui'
import type { TabKey } from '@/types/crud'

const props = defineProps<{
  activeTab: TabKey
  tabs: TabsItem[]
  search: string
  activeLoading: boolean
}>()

const emit = defineEmits<{
  'update:activeTab': [TabKey]
  'update:search': [string]
  refresh: []
  add: []
}>()

const activeTabModel = computed({
  get: () => props.activeTab,
  set: (value: TabKey) => emit('update:activeTab', value),
})

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 border-b border-black/15 p-4">
    <UTabs
      v-model="activeTabModel"
      :items="tabs"
      :content="false"
      color="neutral"
      variant="link"
      class="w-full md:w-auto"
    />
  </div>

  <div class="flex flex-wrap items-center gap-2 border-b border-black/15 p-4">
    <UInput
      v-model="searchModel"
      placeholder="Search by name"
      color="neutral"
      class="w-full md:max-w-sm"
    />

    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-refresh-cw"
      square
      aria-label="Refresh"
      :loading="activeLoading"
      @click="emit('refresh')"
    />

    <UButton
      label="+"
      color="neutral"
      variant="solid"
      class="ml-auto h-9 w-9 justify-center text-lg font-bold"
      @click="emit('add')"
    />
  </div>
</template>
