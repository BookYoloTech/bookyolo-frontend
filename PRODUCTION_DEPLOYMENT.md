# Production Deployment Guide

## Vercel Deployment

This frontend is configured for automatic deployment to Vercel.

### Prerequisites

1. GitHub repository: `https://github.com/BookYoloTech/bookyolo-frontend.git`
2. Vercel account connected to GitHub
3. Backend API running at: `https://bookyolo-backend.vercel.app`

### Environment Variables

If needed, set these in Vercel dashboard (Settings → Environment Variables):

- `VITE_API_BASE` (optional): Override API base URL. Defaults to:
  - `http://localhost:8000` for local development
  - `https://bookyolo-backend.vercel.app` for production

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Production ready: Optimized performance and removed debug logs"
   git push origin master
   ```

2. **Vercel Auto-Deploy:**
   - Vercel will automatically detect the push
   - Build command: `npm run build`
   - Output directory: `dist`
   - Framework: Vite

3. **Verify Deployment:**
   - Check Vercel dashboard for build status
   - Visit deployed URL
   - Test all features (scan, compare, account)

### Build Optimizations

- ✅ Console.logs removed in production builds
- ✅ Code minification with Terser
- ✅ Code splitting (vendor, stripe chunks)
- ✅ Environment-based API configuration
- ✅ Optimized loading (parallel fetching, caching)

### Production Checklist

- [x] `.env` files in `.gitignore`
- [x] Debug logs removed in production builds
- [x] API configuration auto-detects environment
- [x] Build optimizations enabled
- [x] Vercel configuration ready
- [x] Error handling in place
- [x] Performance optimizations applied

### Troubleshooting

**Build fails:**
- Check Node.js version (should be 18+)
- Verify all dependencies in `package.json`
- Check Vercel build logs

**API errors:**
- Verify backend is deployed and accessible
- Check `VITE_API_BASE` environment variable if custom URL needed
- Verify CORS settings on backend

**Performance issues:**
- Check Vercel analytics
- Verify build output size
- Check network tab for slow API calls

