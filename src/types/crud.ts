export type TabKey = 'users' | 'products'

export type CrudMode = 'create' | 'edit'

export type UserRecord = {
  createdAt: string
  name: string
  avatar: string
  dob: string
  active: boolean
  id: string
}

export type ProductRecord = {
  createdAt: string
  name: string
  price: string
  image: string
  inStock: boolean
  id: string
}

export type UserFormState = {
  name: string
  avatar: string
  dob: string
  active: boolean
}

export type ProductFormState = {
  name: string
  price: string
  image: string
  inStock: boolean
}
