<script setup lang="ts">
import { h, ref, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { ProductRecord } from '@/types/crud'

type SortDirection = false | 'asc' | 'desc'

type SortableColumn = {
  getIsSorted: () => SortDirection
  toggleSorting: (desc?: boolean) => void
}

defineProps<{
  rows: ProductRecord[]
  loading: boolean
  emptyMessage: string
}>()

const emit = defineEmits<{
  edit: [ProductRecord]
  delete: [string]
}>()

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

const brokenImageIds = ref<Record<string, boolean>>({})

function placeholderInitial(label: string): string {
  const trimmed = label.trim()
  if (!trimmed) {
    return '?'
  }

  return trimmed.charAt(0).toUpperCase()
}

function renderImagePlaceholder(label: string) {
  return h(
    'div',
    {
      class:
        'flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-black/5 text-[11px] font-semibold text-black/60',
      title: label,
    },
    placeholderInitial(label),
  )
}

function markImageAsBroken(id: string): void {
  if (brokenImageIds.value[id]) {
    return
  }

  brokenImageIds.value = {
    ...brokenImageIds.value,
    [id]: true,
  }
}

function renderCircleImage(id: string, url: string, alt: string) {
  const source = (url || '').trim()

  if (!source || brokenImageIds.value[id]) {
    return renderImagePlaceholder(alt)
  }

  return h('img', {
    src: source,
    alt,
    class: 'h-8 w-8 rounded-full border border-black/15 object-cover',
    loading: 'lazy',
    onError: () => markImageAsBroken(id),
  })
}

function renderSortableHeader(column: SortableColumn, label: string) {
  const sorted = column.getIsSorted()
  const icon =
    sorted === 'asc'
      ? 'i-lucide-arrow-up'
      : sorted === 'desc'
        ? 'i-lucide-arrow-down'
        : 'i-lucide-arrow-up-down'

  return h(UButton, {
    color: 'neutral',
    variant: 'ghost',
    label,
    trailingIcon: icon,
    class: '-mx-2',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
  })
}

function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '-'
  }

  return parsed.toLocaleString()
}

function formatPrice(value: string): string {
  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return '$0.00'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const columns: TableColumn<ProductRecord>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => renderSortableHeader(column, 'Name'),
  },
  {
    id: 'image',
    enableSorting: false,
    header: 'Image',
    meta: {
      class: {
        th: 'w-16',
        td: 'w-16',
      },
    },
    cell: ({ row }) => renderCircleImage(row.original.id, row.original.image, row.original.name),
  },
  {
    accessorKey: 'price',
    header: ({ column }) => renderSortableHeader(column, 'Price'),
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right',
      },
    },
    cell: ({ row }) => formatPrice(String(row.getValue('price'))),
  },
  {
    accessorKey: 'inStock',
    header: ({ column }) => renderSortableHeader(column, 'In Stock'),
    cell: ({ row }) =>
      h(
        UBadge,
        {
          color: 'neutral',
          variant: row.getValue('inStock') ? 'solid' : 'outline',
        },
        () => (row.getValue('inStock') ? 'Yes' : 'No'),
      ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => renderSortableHeader(column, 'Created'),
    cell: ({ row }) => formatDate(String(row.getValue('createdAt'))),
  },
  {
    id: 'actions',
    enableSorting: false,
    meta: {
      class: {
        td: 'text-right',
      },
    },
    cell: ({ row }) =>
      h('div', { class: 'flex items-center justify-end gap-2' }, [
        h(UButton, {
          icon: 'i-lucide-pencil',
          color: 'neutral',
          variant: 'ghost',
          square: true,
          size: 'xs',
          'aria-label': 'Edit product',
          onClick: () => emit('edit', row.original),
        }),
        h(UButton, {
          icon: 'i-lucide-trash-2',
          color: 'error',
          variant: 'ghost',
          square: true,
          size: 'xs',
          'aria-label': 'Delete product',
          onClick: () => emit('delete', row.original.id),
        }),
      ]),
  },
]
</script>

<template>
  <UTable
    :data="rows"
    :columns="columns"
    :get-row-id="(row: ProductRecord) => row.id"
    :loading="loading"
    sticky
    class="max-h-[64vh] bg-white"
  >
    <template #empty>
      <div class="px-4 py-10 text-center text-sm text-muted">{{ emptyMessage }}</div>
    </template>
  </UTable>
</template>
