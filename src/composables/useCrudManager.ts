import { computed, onMounted, ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import type { TabsItem } from '@nuxt/ui'
import type { TabKey } from '@/types/crud'
import { useCrudApi } from '@/composables/useCrudApi'
import { useCrudFilters } from '@/composables/useCrudFilters'
import { useCrudFormState } from '@/composables/useCrudFormState'

export function useCrudManager() {
  const toast = useToast()

  const tabItems: TabsItem[] = [
    { label: 'Users', value: 'users' },
    { label: 'Products', value: 'products' },
  ]

  const activeTab = ref<TabKey>('users')
  const search = ref('')

  const api = useCrudApi()
  const filters = useCrudFilters({
    search,
    users: api.users,
    products: api.products,
    activeTab,
  })
  const formState = useCrudFormState({ activeTab })

  const activeLoading = computed(() => {
    return activeTab.value === 'users' ? api.usersLoading.value : api.productsLoading.value
  })

  const activeLoadError = computed(() => {
    return activeTab.value === 'users' ? api.usersLoadError.value : api.productsLoadError.value
  })

  function entityLabel(tab: TabKey): string {
    return tab === 'users' ? 'User' : 'Product'
  }

  function notifySuccess(title: string): void {
    toast.add({
      title,
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
  }

  function notifyError(title: string): void {
    toast.add({
      title,
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }

  function toErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback
  }

  async function submitForm(): Promise<void> {
    formState.saving.value = true

    try {
      if (formState.formTab.value === 'users') {
        await api.saveUser(
          formState.formMode.value,
          formState.editingId.value,
          formState.buildUserPayload(),
        )

        notifySuccess(formState.formMode.value === 'create' ? 'User created.' : 'User updated.')
      } else {
        await api.saveProduct(
          formState.formMode.value,
          formState.editingId.value,
          formState.buildProductPayload(),
        )

        notifySuccess(
          formState.formMode.value === 'create' ? 'Product created.' : 'Product updated.',
        )
      }

      formState.modalOpen.value = false
    } catch (error) {
      notifyError(toErrorMessage(error, 'Save failed.'))
    } finally {
      formState.saving.value = false
    }
  }

  function confirmDeleteRow(tab: TabKey, id: string): void {
    if (!window.confirm('Delete this row?')) {
      return
    }

    void (async () => {
      try {
        await api.deleteRecord(tab, id)
        notifySuccess(`${entityLabel(tab)} deleted.`)
      } catch (error) {
        notifyError(toErrorMessage(error, 'Delete failed.'))
      }
    })()
  }

  function confirmDeleteUserRow(id: string): void {
    confirmDeleteRow('users', id)
  }

  function confirmDeleteProductRow(id: string): void {
    confirmDeleteRow('products', id)
  }

  function refreshCurrentTab(): void {
    void (async () => {
      await api.fetchRecords(activeTab.value)

      if (activeLoadError.value) {
        notifyError(activeLoadError.value)
      } else if (activeTab.value === 'users') {
        notifySuccess('Users refreshed.')
      } else {
        notifySuccess('Products refreshed.')
      }
    })()
  }

  onMounted(() => {
    void Promise.all([api.fetchRecords('users'), api.fetchRecords('products')])
  })

  return {
    tabItems,
    activeTab,
    search,
    usersLoading: api.usersLoading,
    productsLoading: api.productsLoading,
    activeLoading,
    activeLoadError,
    filteredUsers: filters.filteredUsers,
    filteredProducts: filters.filteredProducts,
    usersEmptyMessage: filters.usersEmptyMessage,
    productsEmptyMessage: filters.productsEmptyMessage,
    activeRowsCount: filters.activeRowsCount,
    modalOpen: formState.modalOpen,
    formMode: formState.formMode,
    formTab: formState.formTab,
    saving: formState.saving,
    userForm: formState.userForm,
    productForm: formState.productForm,
    refreshCurrentTab,
    openCreateModal: formState.openCreateModal,
    openUserEditModal: formState.openUserEditModal,
    openProductEditModal: formState.openProductEditModal,
    confirmDeleteUserRow,
    confirmDeleteProductRow,
    submitForm,
  }
}
