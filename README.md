
# DissertAI Writing Assistant

This is a minimal working starter for your Grammarly-like AI writing assistant using React, TipTap, Zustand, and Supabase.

## 📦 Installation

```bash
npm install
# or
pnpm install
# or
yarn install
```

## 🧪 Development

```bash
npm run dev
# or
pnpm run dev
# or
yarn dev
```

## 🏗️ Building for Production

```bash
npm run build
# or
pnpm run build
# or
yarn build
```

## 🚀 Deployment

After building, the `dist` folder contains the production-ready files that can be deployed to any static hosting service like:

- **Vercel**: Connect your GitHub repo and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Upload the `dist` contents to your gh-pages branch
- **AWS S3**: Upload the `dist` contents to an S3 bucket configured for static hosting

### Preview Production Build Locally

```bash
npm run preview
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
- **Sapling Grammar Checker** - AI-powered, precise error detection
- Real-time grammar, spelling, and punctuation checking
- Visual error highlighting with one-click fixes
- Zustand store
- Tab-based AI tool switching
- Edge function callers for all tools

## ✅ Next Steps

- Build tool results UI
- Add autosave
- Store tool results to Supabase

## 📝 Sapling Grammar Integration

The app now includes Sapling, a powerful AI-powered grammar checker that provides:

- **Real-time Error Detection** - Automatically detects grammar, spelling, and punctuation errors via API
- **Smart Suggestions** - AI-powered contextual corrections with one-click fixes
- **Visual Feedback** - Color-coded error highlighting in the editor
- **Comprehensive Analysis** - Detailed error explanations and suggestions
- **Cloud-based Processing** - Leverages Sapling's advanced AI models

See `sapling_INTEGRATION.md` for detailed documentation and `src/components/SaplingTest.tsx` for usage examples.

