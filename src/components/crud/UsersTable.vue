<script setup lang="ts">
import { h, ref, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { UserRecord } from '@/types/crud'

type SortDirection = false | 'asc' | 'desc'

type SortableColumn = {
  getIsSorted: () => SortDirection
  toggleSorting: (desc?: boolean) => void
}

defineProps<{
  rows: UserRecord[]
  loading: boolean
  emptyMessage: string
}>()

const emit = defineEmits<{
  edit: [UserRecord]
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

const columns: TableColumn<UserRecord>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => renderSortableHeader(column, 'Name'),
  },
  {
    id: 'avatar',
    enableSorting: false,
    header: 'Avatar',
    meta: {
      class: {
        th: 'w-16',
        td: 'w-16',
      },
    },
    cell: ({ row }) => renderCircleImage(row.original.id, row.original.avatar, row.original.name),
  },
  {
    accessorKey: 'dob',
    header: ({ column }) => renderSortableHeader(column, 'Date of Birth'),
    cell: ({ row }) => formatDate(String(row.getValue('dob'))),
  },
  {
    accessorKey: 'active',
    header: ({ column }) => renderSortableHeader(column, 'Active'),
    cell: ({ row }) =>
      h(
        UBadge,
        {
          color: 'neutral',
          variant: row.getValue('active') ? 'solid' : 'outline',
        },
        () => (row.getValue('active') ? 'Yes' : 'No'),
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
          'aria-label': 'Edit user',
          onClick: () => emit('edit', row.original),
        }),
        h(UButton, {
          icon: 'i-lucide-trash-2',
          color: 'error',
          variant: 'ghost',
          square: true,
          size: 'xs',
          'aria-label': 'Delete user',
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
    :get-row-id="(row: UserRecord) => row.id"
    :loading="loading"
    sticky
    class="max-h-[64vh] bg-white"
  >
    <template #empty>
      <div class="px-4 py-10 text-center text-sm text-muted">{{ emptyMessage }}</div>
    </template>
  </UTable>
</template>
