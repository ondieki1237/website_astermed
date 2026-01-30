export function getApiBase(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL as string) || 'https://astermed.codewithseth.co.ke'
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `https://${raw}`
}
