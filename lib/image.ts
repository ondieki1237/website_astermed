export function resolveImageSrc(src?: string) {
  if (!src) return '/placeholder.svg'
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  // if backend-stored path like /uploads/..., prefix with API base
  if (src.startsWith('/uploads')) {
    const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'https://astermed.codewithseth.co.ke'
    return `${base}${src}`
  }
  return src
}
