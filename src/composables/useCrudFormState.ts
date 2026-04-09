import { reactive, ref, type Ref } from 'vue'
import type {
  CrudMode,
  ProductFormState,
  ProductRecord,
  TabKey,
  UserFormState,
  UserRecord,
} from '@/types/crud'

type UseCrudFormStateOptions = {
  activeTab: Ref<TabKey>
}

type UserSavePayload = Pick<UserRecord, 'name' | 'avatar' | 'dob' | 'active'>
type ProductSavePayload = Pick<ProductRecord, 'name' | 'price' | 'image' | 'inStock'>

function nowInputValue(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function isoToInputValue(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return nowInputValue()
  }

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function inputToIso(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString()
  }

  return parsed.toISOString()
}

export function useCrudFormState({ activeTab }: UseCrudFormStateOptions) {
  const modalOpen = ref(false)
  const formMode = ref<CrudMode>('create')
  const formTab = ref<TabKey>('users')
  const editingId = ref<string | null>(null)
  const saving = ref(false)

  const userForm = reactive<UserFormState>({
    name: '',
    avatar: '',
    dob: nowInputValue(),
    active: true,
  })

  const productForm = reactive<ProductFormState>({
    name: '',
    price: '0.00',
    image: '',
    inStock: true,
  })

  function resetUserForm(): void {
    userForm.name = ''
    userForm.avatar = ''
    userForm.dob = nowInputValue()
    userForm.active = true
  }

  function resetProductForm(): void {
    productForm.name = ''
    productForm.price = '0.00'
    productForm.image = ''
    productForm.inStock = true
  }

  function openCreateModal(): void {
    formMode.value = 'create'
    formTab.value = activeTab.value
    editingId.value = null

    if (formTab.value === 'users') {
      resetUserForm()
    } else {
      resetProductForm()
    }

    modalOpen.value = true
  }

  function openEditModal(tab: 'users', record: UserRecord): void
  function openEditModal(tab: 'products', record: ProductRecord): void
  function openEditModal(tab: TabKey, record: UserRecord | ProductRecord): void {
    formMode.value = 'edit'
    formTab.value = tab
    editingId.value = record.id

    if (tab === 'users') {
      const typed = record as UserRecord
      userForm.name = typed.name
      userForm.avatar = typed.avatar
      userForm.dob = isoToInputValue(typed.dob)
      userForm.active = typed.active
    } else {
      const typed = record as ProductRecord
      productForm.name = typed.name
      productForm.price = typed.price
      productForm.image = typed.image
      productForm.inStock = typed.inStock
    }

    modalOpen.value = true
  }

  function openUserEditModal(record: UserRecord): void {
    openEditModal('users', record)
  }

  function openProductEditModal(record: ProductRecord): void {
    openEditModal('products', record)
  }

  function buildUserPayload(): UserSavePayload {
    return {
      name: userForm.name.trim(),
      avatar: userForm.avatar.trim(),
      dob: inputToIso(userForm.dob),
      active: userForm.active,
    }
  }

  function buildProductPayload(): ProductSavePayload {
    return {
      name: productForm.name.trim(),
      price: productForm.price.trim(),
      image: productForm.image.trim(),
      inStock: productForm.inStock,
    }
  }

  return {
    modalOpen,
    formMode,
    formTab,
    editingId,
    saving,
    userForm,
    productForm,
    openCreateModal,
    openUserEditModal,
    openProductEditModal,
    buildUserPayload,
    buildProductPayload,
  }
}
