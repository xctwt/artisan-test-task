import { computed, type Ref } from 'vue'
import type { ProductRecord, TabKey, UserRecord } from '@/types/crud'

type UseCrudFiltersOptions = {
  search: Ref<string>
  users: Ref<UserRecord[]>
  products: Ref<ProductRecord[]>
  activeTab: Ref<TabKey>
}

export function useCrudFilters({ search, users, products, activeTab }: UseCrudFiltersOptions) {
  const filteredUsers = computed(() => {
    const query = search.value.trim().toLowerCase()
    if (!query) {
      return users.value
    }

    return users.value.filter((user) => user.name.toLowerCase().includes(query))
  })

  const filteredProducts = computed(() => {
    const query = search.value.trim().toLowerCase()
    if (!query) {
      return products.value
    }

    return products.value.filter((product) => product.name.toLowerCase().includes(query))
  })

  const hasSearchQuery = computed(() => search.value.trim().length > 0)

  const usersEmptyMessage = computed(() => {
    return hasSearchQuery.value ? 'No users match your search.' : 'No users yet.'
  })

  const productsEmptyMessage = computed(() => {
    return hasSearchQuery.value ? 'No products match your search.' : 'No products yet.'
  })

  const activeRowsCount = computed(() => {
    return activeTab.value === 'users' ? filteredUsers.value.length : filteredProducts.value.length
  })

  return {
    filteredUsers,
    filteredProducts,
    usersEmptyMessage,
    productsEmptyMessage,
    activeRowsCount,
  }
}
