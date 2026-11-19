import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null, listingType: string): string {
  if (listingType === 'free' || price === null) return 'Free'
  if (listingType === 'exchange') return 'Exchange'
  return `₹${price.toLocaleString('en-IN')}`
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 30) return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '…'
}

export const CATEGORIES = [
  'Books & Notes',
  'Electronics',
  'Lab Equipment',
  'Calculators',
  'Drawing Instruments',
  'Project Components',
  'Sports Equipment',
  'Hostel Essentials',
  'Clothing',
  'Bicycles',
  'Software & Licenses',
  'Other',
] as const

export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'] as const

export const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'PhD'] as const

export const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Architecture',
  'Business Administration',
  'Economics',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Other',
] as const


