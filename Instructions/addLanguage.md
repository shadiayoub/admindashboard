Here's a concise markdown guide for adding new languages to your setup:

```markdown
# Adding New Languages

## 1. Add New Locale
1. Edit `lib/i18n/config.ts`:
```typescript
export const locales = ['en', 'ar', 'fa', 'tr', 'new'] as const // Add new language code
export const defaultLocale = 'en'
```

## 2. Create Translation File
Add JSON file at `lib/i18n/dictionaries/new.json`:
```json
{
  "common": {
    "welcome": "Translation here",
    "other_key": "More translations..."
  }
}
```

## 3. Update Middleware (Optional)
If using RTL support, update direction check in `app/[locale]/layout.tsx`:
```typescript
const isRTL = ['ar', 'fa', 'new'].includes(locale) // Add RTL languages
```

## 4. Add Language Switcher Option
Update your `LanguageSwitcher` component:
```typescript
const localeLabels = {
  // ... existing
  new: 'Language Name'
}
```

## Verification Steps
1. Test `/new` route loads
2. Verify translations appear
3. Check RTL behavior (if applicable)
4. Test cookie persistence

> **Note**: For complete translations, use Cursor IDE's i18n tools or run `pnpm i18n:extract` to auto-generate keys.
```

Key files touched:
- `lib/i18n/config.ts`
- `lib/i18n/dictionaries/new.json`
- `components/LanguageSwitcher.tsx` (optional)
- `app/[locale]/layout.tsx` (RTL only)

This maintains all existing functionality while adding support for new languages. The middleware will automatically handle the new locale.