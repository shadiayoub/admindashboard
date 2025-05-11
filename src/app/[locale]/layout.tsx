// src/app/[locale]/layout.tsx (final version - no cookies)
export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</> // Pure pass-through
}
