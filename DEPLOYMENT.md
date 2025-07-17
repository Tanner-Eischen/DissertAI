# Deployment Guide

## Prerequisites

1. **Environment Variables**: Copy `.env.example` to `.env` and fill in your actual values:
   ```bash
   cp .env.example .env
   ```

2. **Supabase Setup**: 
   - Create a Supabase project
   - Create a `documents` table with columns: `id`, `owner`, `title`, `content`, `created_at`, `updated_at`
   - Deploy the required Edge Functions (see main README)

## Build for Production

```bash
npm run build
```

This creates a `dist` folder with production-ready files.

## Deployment Options

### 1. Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### 2. Netlify

1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Or connect via Git for automatic deployments
4. Add environment variables in Netlify dashboard

### 3. GitHub Pages

1. Build the project: `npm run build`
2. Push the `dist` contents to your `gh-pages` branch
3. Enable GitHub Pages in repository settings

### 4. AWS S3 + CloudFront

1. Build the project: `npm run build`
2. Upload `dist` contents to S3 bucket
3. Configure bucket for static website hosting
4. Set up CloudFront distribution (optional)

## Environment Variables for Production

Make sure to set these in your deployment platform:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_SUPABASE_FUNCTIONS_URL`: Your Supabase Edge Functions URL
- `VITE_OPENAI_API_KEY`: Your OpenAI API key (for AI tools)
- `VITE_SAPLING_PUBLIC_KEY`: Sapling public API key (optional)
- `VITE_SAPLING_PRIVATE_KEY`: Sapling private API key (optional)

## Testing Production Build Locally

```bash
npm run preview
```

This serves the production build locally for testing.

## Troubleshooting

- **Build fails**: Run `npm run type-check` to check for TypeScript errors
- **Environment variables not working**: Ensure they start with `VITE_`
- **Supabase connection issues**: Verify your URL and keys in the environment variables