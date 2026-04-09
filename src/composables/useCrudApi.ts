import { ref } from 'vue'
import type { CrudMode, ProductRecord, TabKey, UserRecord } from '@/types/crud'

type UserSavePayload = Pick<UserRecord, 'name' | 'avatar' | 'dob' | 'active'>
type ProductSavePayload = Pick<ProductRecord, 'name' | 'price' | 'image' | 'inStock'>

const API_BASE = import.meta.env.VITE_API_BASE

function endpoint(tab: TabKey): string {
  return `${API_BASE}/${tab}`
}

export function useCrudApi() {
  const users = ref<UserRecord[]>([])
  const products = ref<ProductRecord[]>([])

  const usersLoading = ref(false)
  const productsLoading = ref(false)

  const usersLoadError = ref('')
  const productsLoadError = ref('')

  function setLoading(tab: TabKey, value: boolean): void {
    if (tab === 'users') {
      usersLoading.value = value
      return
    }

    productsLoading.value = value
  }

  async function fetchRecords(tab: TabKey): Promise<void> {
    setLoading(tab, true)

    if (tab === 'users') {
      usersLoadError.value = ''
    } else {
      productsLoadError.value = ''
    }

    try {
      const response = await fetch(endpoint(tab))
      if (!response.ok) {
        throw new Error(`Failed to load ${tab}`)
      }

      if (tab === 'users') {
        users.value = (await response.json()) as UserRecord[]
        return
      }

      products.value = (await response.json()) as ProductRecord[]
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed.'

      if (tab === 'users') {
        usersLoadError.value = message
      } else {
        productsLoadError.value = message
      }
    } finally {
      setLoading(tab, false)
    }
  }

  async function saveUser(
    mode: CrudMode,
    editingId: string | null,
    payload: UserSavePayload,
  ): Promise<UserRecord> {
    if (mode === 'edit' && !editingId) {
      throw new Error('Failed to save user.')
    }

    const response = await fetch(
      mode === 'create' ? endpoint('users') : `${endpoint('users')}/${editingId}`,
      {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to save user.')
    }

    const saved = (await response.json()) as UserRecord
    if (mode === 'create') {
      users.value = [saved, ...users.value]
    } else {
      users.value = users.value.map((user) => (user.id === saved.id ? saved : user))
    }

    return saved
  }

  async function saveProduct(
    mode: CrudMode,
    editingId: string | null,
    payload: ProductSavePayload,
  ): Promise<ProductRecord> {
    if (mode === 'edit' && !editingId) {
      throw new Error('Failed to save product.')
    }

    const response = await fetch(
      mode === 'create' ? endpoint('products') : `${endpoint('products')}/${editingId}`,
      {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to save product.')
    }

    const saved = (await response.json()) as ProductRecord
    if (mode === 'create') {
      products.value = [saved, ...products.value]
    } else {
      products.value = products.value.map((product) => (product.id === saved.id ? saved : product))
    }

    return saved
  }

  async function deleteRecord(tab: TabKey, id: string): Promise<void> {
    const response = await fetch(`${endpoint(tab)}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete ${tab.slice(0, -1)}.`)
    }

    if (tab === 'users') {
      users.value = users.value.filter((user) => user.id !== id)
      return
    }

    products.value = products.value.filter((product) => product.id !== id)
  }

  return {
    users,
    products,
    usersLoading,
    productsLoading,
    usersLoadError,
    productsLoadError,
    fetchRecords,
    saveUser,
    saveProduct,
    deleteRecord,
  }
}
