<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { CrudMode, ProductFormState, TabKey, UserFormState } from '@/types/crud'

const props = defineProps<{
  tab: TabKey
  mode: CrudMode
  saving: boolean
}>()

const openModel = defineModel<boolean>('open', { required: true })
const userFormModel = defineModel<UserFormState>('userForm', { required: true })
const productFormModel = defineModel<ProductFormState>('productForm', { required: true })

const emit = defineEmits<{
  submit: []
}>()

const userErrors = reactive({
  name: '',
  avatar: '',
  dob: '',
})

const productErrors = reactive({
  name: '',
  price: '',
  image: '',
})

function clearErrors(): void {
  userErrors.name = ''
  userErrors.avatar = ''
  userErrors.dob = ''
  productErrors.name = ''
  productErrors.price = ''
  productErrors.image = ''
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validateUserForm(): boolean {
  clearErrors()

  if (!userFormModel.value.name.trim()) {
    userErrors.name = 'Name is required.'
  }

  if (!userFormModel.value.dob.trim()) {
    userErrors.dob = 'Date of birth is required.'
  } else if (Number.isNaN(new Date(userFormModel.value.dob).getTime())) {
    userErrors.dob = 'Date of birth is invalid.'
  }

  const avatar = userFormModel.value.avatar.trim()
  if (avatar && !isValidUrl(avatar)) {
    userErrors.avatar = 'Avatar URL must be a valid http(s) link.'
  }

  return !userErrors.name && !userErrors.avatar && !userErrors.dob
}

function validateProductForm(): boolean {
  clearErrors()

  if (!productFormModel.value.name.trim()) {
    productErrors.name = 'Name is required.'
  }

  const priceText = productFormModel.value.price.trim()
  if (!priceText) {
    productErrors.price = 'Price is required.'
  } else {
    const price = Number(priceText)
    if (Number.isNaN(price) || price < 0) {
      productErrors.price = 'Price must be a number greater than or equal to 0.'
    }
  }

  const image = productFormModel.value.image.trim()
  if (image && !isValidUrl(image)) {
    productErrors.image = 'Image URL must be a valid http(s) link.'
  }

  return !productErrors.name && !productErrors.price && !productErrors.image
}

function onSubmit(): void {
  const valid = props.tab === 'users' ? validateUserForm() : validateProductForm()
  if (!valid) {
    return
  }

  emit('submit')
}

watch(openModel, (isOpen) => {
  if (isOpen) {
    clearErrors()
  }
})

watch(
  () => props.tab,
  () => {
    clearErrors()
  },
)

const modalTitle = computed(() => {
  const modeLabel = props.mode === 'create' ? 'Add' : 'Edit'
  const entity = props.tab === 'users' ? 'User' : 'Product'
  return `${modeLabel} ${entity}`
})
</script>

<template>
  <UModal
    v-model:open="openModel"
    :title="modalTitle"
    :ui="{ footer: 'justify-end', overlay: 'z-[200]', content: 'z-[210]' }"
  >
    <template #body>
      <div v-if="tab === 'users'" class="space-y-4">
        <div class="space-y-1.5">
          <label class="block text-sm">Name</label>
          <UInput v-model="userFormModel.name" color="neutral" placeholder="Jane Doe" />
          <p v-if="userErrors.name" class="text-xs text-error">{{ userErrors.name }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm">Avatar URL</label>
          <UInput v-model="userFormModel.avatar" color="neutral" placeholder="https://..." />
          <p v-if="userErrors.avatar" class="text-xs text-error">{{ userErrors.avatar }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm">Date of Birth</label>
          <UInput v-model="userFormModel.dob" color="neutral" type="datetime-local" />
          <p v-if="userErrors.dob" class="text-xs text-error">{{ userErrors.dob }}</p>
        </div>

        <label class="flex items-center gap-2 text-sm">
          <UCheckbox v-model="userFormModel.active" />
          Active
        </label>
      </div>

      <div v-else class="space-y-4">
        <div class="space-y-1.5">
          <label class="block text-sm">Name</label>
          <UInput v-model="productFormModel.name" color="neutral" placeholder="Product name" />
          <p v-if="productErrors.name" class="text-xs text-error">{{ productErrors.name }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm">Price</label>
          <UInput v-model="productFormModel.price" color="neutral" placeholder="199.99" />
          <p v-if="productErrors.price" class="text-xs text-error">{{ productErrors.price }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm">Image URL</label>
          <UInput v-model="productFormModel.image" color="neutral" placeholder="https://..." />
          <p v-if="productErrors.image" class="text-xs text-error">{{ productErrors.image }}</p>
        </div>

        <label class="flex items-center gap-2 text-sm">
          <UCheckbox v-model="productFormModel.inStock" />
          In stock
        </label>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
      <UButton
        :label="mode === 'create' ? 'Create' : 'Save'"
        color="neutral"
        :loading="saving"
        @click="onSubmit"
      />
    </template>
  </UModal>
</template>
