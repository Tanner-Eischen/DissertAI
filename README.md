
# Word-Wise Writing Assistant (Starter)

This is a minimal working starter for your Grammarly-like AI writing assistant using React, TipTap, Zustand, and Supabase.

## 📦 Installation

```bash
pnpm install
```

## 🧪 Development

```bash
pnpm run dev
```

## 🔧 Setup

1. Create a Supabase project.
2. Add a `documents` table with: `id, owner, title, content, created_at, updated_at`.
3. Deploy the following Edge Functions:
   - `check-text`
   - `argument-mapper`
   - `citation-annotator`
   - `optimize-thesis`
   - `virtual-reviewer`
   - `abstract-synthesizer`
4. Add your keys to `.env` (see `.env.example`).

## 🔑 Environment (.env)

```
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🧠 What's included

- RichEditor with TipTap + highlight support
- Zustand store
- Tab-based AI tool switching
- Edge function callers for all tools

## ✅ Next Steps

- Build tool results UI
- Add autosave
- Store tool results to Supabase

