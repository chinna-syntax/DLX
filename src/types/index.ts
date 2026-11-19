// ─── User & Auth ───────────────────────────────────────────────────────────
export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Postgraduate' | 'PhD'
export type Department =
  | 'Computer Science'
  | 'Electrical Engineering'
  | 'Mechanical Engineering'
  | 'Civil Engineering'
  | 'Chemical Engineering'
  | 'Architecture'
  | 'Business Administration'
  | 'Economics'
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Other'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  department: Department
  academicYear: AcademicYear
  university: string
  hostelBlock?: string
  phone?: string
  bio?: string
  joinedAt: string
  isVerified: boolean
  listingsCount: number
  rating: number
  ratingCount: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ─── Listings ───────────────────────────────────────────────────────────────
export type ListingCategory =
  | 'Books & Notes'
  | 'Electronics'
  | 'Lab Equipment'
  | 'Calculators'
  | 'Drawing Instruments'
  | 'Project Components'
  | 'Sports Equipment'
  | 'Hostel Essentials'
  | 'Clothing'
  | 'Bicycles'
  | 'Software & Licenses'
  | 'Other'

export type ItemCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor'

export type ListingType = 'sell' | 'free' | 'exchange'

export type ListingStatus = 'AVAILABLE' | 'RESERVED' | 'EXCHANGED'

export interface ListingImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

export interface Listing {
  id: string
  title: string
  description: string
  price: number | null
  listingType: ListingType
  category: ListingCategory
  condition: ItemCondition
  status: ListingStatus
  images: ListingImage[]
  seller: User
  tags: string[]
  location?: string
  viewCount: number
  savedCount: number
  createdAt: string
  updatedAt: string
  exchangeFor?: string
}

export interface ListingPreview {
  id: string
  title: string
  price: number | null
  listingType: ListingType
  category: ListingCategory
  condition: ItemCondition
  status: ListingStatus
  primaryImage?: string
  seller: {
    id: string
    name: string
    academicYear: AcademicYear
    avatar?: string
  }
  savedCount: number
  createdAt: string
  isSaved?: boolean
}

// ─── Chat & Inbox ───────────────────────────────────────────────────────────
export interface Message {
  id: string
  conversationId: string
  senderId: string
  text?: string
  createdAt?: string
  read?: boolean
  /** Compatibility aliases for existing UI adapters. */
  content?: string
  sentAt?: string
  isRead?: boolean
  attachments?: string[]
}

export interface Conversation {
  id: string
  buyerId?: string
  sellerId?: string
  listingId?: string
  participants?: User[]
  listing?: ListingPreview
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

// ─── Filters & Search ───────────────────────────────────────────────────────
export interface ListingFilters {
  category?: ListingCategory
  condition?: ItemCondition
  listingType?: ListingType
  priceMin?: number
  priceMax?: number
  department?: Department
  academicYear?: AcademicYear
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
}

export interface SearchParams extends ListingFilters {
  query?: string
  availability?: 'Available' | 'Reserved'
  page?: number
  limit?: number
}

// ─── Service Responses ──────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ApiError {
  message: string
  code?: string
  field?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

// ─── Forms ──────────────────────────────────────────────────────────────────
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  department: Department
  academicYear: AcademicYear
  university: string
  hostelBlock?: string
  phone?: string
}

export interface CreateListingFormData {
  title: string
  description: string
  price?: number
  listingType: ListingType
  category: ListingCategory
  condition: ItemCondition
  tags: string[]
  location?: string
  exchangeFor?: string
  images: File[]
}

export interface EditProfileFormData {
  name: string
  bio?: string
  phone?: string
  hostelBlock?: string
  department: Department
  academicYear: AcademicYear
}


