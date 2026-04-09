<script setup lang="ts">
import CrudToolbar from '@/components/crud/CrudToolbar.vue'
import UsersTable from '@/components/crud/UsersTable.vue'
import ProductsTable from '@/components/crud/ProductsTable.vue'
import RecordFormModal from '@/components/crud/RecordFormModal.vue'
import { useCrudManager } from '@/composables/useCrudManager'

const toaster = {
  position: 'top-right' as const,
  ui: {
    viewport: 'z-[300]',
  },
}

const {
  tabItems,
  activeTab,
  search,
  usersLoading,
  productsLoading,
  activeLoading,
  activeLoadError,
  filteredUsers,
  filteredProducts,
  usersEmptyMessage,
  productsEmptyMessage,
  activeRowsCount,
  modalOpen,
  formMode,
  formTab,
  saving,
  userForm,
  productForm,
  refreshCurrentTab,
  openCreateModal,
  openUserEditModal,
  openProductEditModal,
  confirmDeleteUserRow,
  confirmDeleteProductRow,
  submitForm,
} = useCrudManager()
</script>

<template>
  <UApp :toaster="toaster">
    <div class="min-h-screen bg-white text-black">
      <main class="mx-auto max-w-7xl p-4 md:p-6">
        <section class="rounded-lg border border-black/15 bg-white">
          <CrudToolbar
            v-model:active-tab="activeTab"
            v-model:search="search"
            :tabs="tabItems"
            :active-loading="activeLoading"
            @refresh="refreshCurrentTab"
            @add="openCreateModal"
          />

          <div v-if="activeLoadError" class="border-b border-error/20 bg-error/10 px-4 py-3">
            <div class="text-sm text-error">
              <span>Failed to load data: {{ activeLoadError }}</span>
            </div>
          </div>

          <UsersTable
            v-if="activeTab === 'users'"
            :rows="filteredUsers"
            :loading="usersLoading"
            :empty-message="usersEmptyMessage"
            @edit="openUserEditModal"
            @delete="confirmDeleteUserRow"
          />

          <ProductsTable
            v-else
            :rows="filteredProducts"
            :loading="productsLoading"
            :empty-message="productsEmptyMessage"
            @edit="openProductEditModal"
            @delete="confirmDeleteProductRow"
          />

          <div class="border-t border-black/15 px-4 py-3 text-sm text-muted">
            Showing {{ activeRowsCount }} row(s).
          </div>
        </section>
      </main>

      <RecordFormModal
        v-model:open="modalOpen"
        v-model:user-form="userForm"
        v-model:product-form="productForm"
        :tab="formTab"
        :mode="formMode"
        :saving="saving"
        @submit="submitForm"
      />
    </div>
  </UApp>
</template>
