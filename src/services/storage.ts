export const tokenStore = {
  get: () => typeof localStorage === 'undefined' ? memoryToken : localStorage.getItem('campus_exchange_profile'),
  set: (value: string) => { memoryToken = value; if (typeof localStorage !== 'undefined') localStorage.setItem('campus_exchange_profile', value) },
  clear: () => { memoryToken = null; if (typeof localStorage !== 'undefined') localStorage.removeItem('campus_exchange_profile') }
}
let memoryToken: string | null = null
export function idOf(value: { id?: string; _id?: string }): string { return value.id ?? value._id ?? '' }
