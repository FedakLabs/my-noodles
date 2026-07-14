---
name: find-component
description: 'Locate the React component or page that renders a specific screen by tracing visible UI text through i18n keys and Next.js routes. Use when working from a screenshot, UI text description, or route path and you need to find the source file responsible for that view.'
---

# Find Component

Locate the source file for a screen by reverse-tracing visible text through translation keys (i.e **next-intl** messages, or react-i18next), then up to **`components/`** and **`screens/`**.

## When to Use

- Screenshot or description but unknown source file
- URL path known (`/uk/catalog`, `/uk/product/…`) but not which screen
- Grep for component names didn't find a match

## Workflow

### Step 1: Extract visible text

Pick **unique** strings: page titles, CTAs, empty states, validation messages. Prefer Ukrainian copy that won't appear elsewhere.

### Step 2: Find the i18n key

Search locale message files

```bash
grep -r "Показати" apps/web/
```

Note the **namespace** and key (e.g. `catalog.showResults`).

### Step 3: Find the consumer

```bash
grep -r "showResults" apps/web/src/
```

Look first for internationalization library that is used in a project, then on conventions that used in application for defining translation keys (i.e for next-intl `useTranslations('catalog')` + `t('showResults')` or `t('catalog.showResults')`).

### Step 4: Trace to page level

If hit is in `components/`, grep who imports it from `screens/` or `app/`.

### Step 5: Report

```text
Component found:
  Screen:    **/screens/catalog/index.tsx
  Component: CatalogScreen (or child: FilterSheet)
  i18n:      catalog.showResults

  Traced via: "Показати N товарів" → messages/uk/catalog.json → FilterSheet
```

## Alternative approaches

**Route-first:** Open `app/[locale]/<path>/page.tsx` and follow imports to `screens/`.

**URL path:** Map `/uk/product/[slug]` → `app/[locale]/product/[slug]/page.tsx`.

**Hardcoded text:** If not in messages (should be rare), grep source:

```bash
grep -r "exact text" apps/web/src/
```

## Tips

- Search static parts of interpolated strings (`{{count}}` in JSON → grep the key, not the number)
- Shared components: trace **callers** in `screens/` or sibling `components/`
- Multiple matches: cross-check a second unique string from the same screen
