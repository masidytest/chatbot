# Translations Quick Reference Guide

## 🌍 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Active |
| Spanish | `es` | ✅ Active |
| French | `fr` | ✅ Active |
| German | `de` | ✅ Active |
| Arabic | `ar` | ✅ Active (RTL) |
| Italian | `it` | ✅ Active (NEW) |

---

## 📝 Using Translations in Components

### Basic Usage
```typescript
import { useTranslation } from '@/lib/i18n/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t("chat.newChat")}</h1>;
  // Output: "New chat" (EN), "Nuevo chat" (ES), etc.
}
```

### With Fallback Value
```typescript
const text = t("chat.newChat", "Default Text");
// Returns translation or "Default Text" if not found
```

### Language Management
```typescript
const { t, language, setLanguage, languages } = useTranslation();

// Get current language
console.log(language); // "en", "es", "fr", etc.

// Change language
setLanguage("it"); // Switch to Italian

// Get all available languages
console.log(languages); // ["en", "es", "fr", "de", "ar", "it"]
```

---

## 🔑 Available Translation Keys

### Chat Section
```
chat.newChat        → "New chat"
chat.deleteAll      → "Delete all"
chat.imageStudio    → "Image Studio"
chat.upgrade        → "Upgrade"
chat.searchChats    → "Search chats..."
chat.noChats        → "No chats yet"
chat.chatHistory    → "Chat history"
```

### Common Section
```
common.language     → "Language"
common.search       → "Search"
common.loading      → "Loading"
common.error        → "Error"
```

---

## 🎯 Where Translations Are Used

| Component | File | Keys Used |
|-----------|------|-----------|
| **App Sidebar** | `components/chat/app-sidebar.tsx` | `chat.newChat`, `chat.deleteAll`, `chat.imageStudio`, `chat.upgrade` |
| **Sidebar History** | `components/chat/sidebar-history.tsx` | `chat.chatHistory`, `chat.noChats`, `common.search` |
| **Multimodal Input** | `components/chat/multimodal-input.tsx` | `common.search` |
| **Language Selector** | `components/language-selector.tsx` | UI Component |

---

## ✨ Features

### 🔄 Automatic Language Detection
```typescript
// Browser language is detected on first load
// English fallback if language not supported
```

### 💾 Persistent Preferences
```typescript
// User's language choice is saved to localStorage
// Survives page refresh
```

### 🔤 RTL Support
```typescript
// Arabic (ar) automatically enables RTL layout
// document.documentElement.dir = "rtl"
```

### 🚀 Type-Safe
```typescript
type Language = "en" | "es" | "fr" | "de" | "ar" | "it";
// Full TypeScript support
```

---

## 📋 Adding New Translations

### Step 1: Add Key to JSON
```json
// lib/i18n/translations.json
{
  "en": { "section": { "key": "English text" } },
  "es": { "section": { "key": "Texto en español" } },
  // ... repeat for all 6 languages
}
```

### Step 2: Use in Component
```typescript
const text = t("section.key");
```

### Step 3: Done!
Automatically available in all 6 languages.

---

## 🛠️ Common Patterns

### Conditional Text
```typescript
{user ? t("chat.deleteAll") : t("common.loading")}
```

### Dynamic Keys
```typescript
const keyPath = `chat.${action}`;
const text = t(keyPath, "Default");
```

### Arrays of Translations
```typescript
const items = ["chat.newChat", "chat.deleteAll", "chat.upgrade"];
items.map(key => t(key));
```

---

## 🌐 Language Display Names

```typescript
const names = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
  it: "Italiano"
};
```

---

## ⚙️ Configuration Files

### Translation Definitions
- **File:** `lib/i18n/translations.json`
- **Format:** JSON with nested keys
- **Structure:** `{ language: { section: { key: "text" } } }`

### Hook Implementation
- **File:** `lib/i18n/useTranslation.ts`
- **Exports:** `useTranslation()` hook, `Language` type
- **Features:** State management, localStorage, RTL support

### UI Component
- **File:** `components/language-selector.tsx`
- **Renders:** Dropdown with 6 language options
- **Function:** Users can switch languages from UI

---

## 🔍 Troubleshooting

### Translation Not Showing?
1. Check key exists in all language objects
2. Use fallback: `t("key", "fallback text")`
3. Verify component has `useTranslation()` hook

### Language Not Persisting?
1. Check localStorage is enabled
2. Browser privacy settings may block localStorage
3. Clear browser cache and try again

### RTL Not Working?
1. Only Arabic (ar) has RTL enabled
2. Verify `document.documentElement.dir = "rtl"`
3. CSS might need RTL-specific styling

### Build Errors?
1. Ensure all languages have all keys
2. JSON must be valid syntax
3. Check imports are correct

---

## 📊 Translation Statistics

- **Total Keys:** 11
- **Total Languages:** 6
- **Total Entries:** 66
- **Coverage:** 100%
- **Deployed:** ✅ Yes
- **Production Ready:** ✅ Yes

---

## 🚀 Deployment

The translation system is fully integrated and production-ready:

✅ All 6 languages working  
✅ Components properly integrated  
✅ Build passes without errors  
✅ TypeScript types correct  
✅ No performance impact  
✅ Ready for immediate deployment  

---

## 📚 Documentation

- `TRANSLATION_AUDIT.md` - Detailed audit report
- `TRANSLATIONS_IMPLEMENTATION.md` - Implementation details
- `TRANSLATIONS_SUMMARY.txt` - Visual summary
- `TRANSLATION_CHECKLIST.md` - Completion checklist

---

## 💡 Pro Tips

1. **Use fallback values:** `t("key", "English text")` provides safety net
2. **Group related translations:** Use dot notation like `chat.*, common.*`
3. **Test each language:** Switch through dropdown to verify all text
4. **Consider RTL:** If adding RTL languages, test layout
5. **Keep keys short:** Use `chat.newChat` instead of `chat_new_chat`

---

**Created:** June 9, 2026  
**Status:** Production Ready ✅  
**Last Updated:** Complete

