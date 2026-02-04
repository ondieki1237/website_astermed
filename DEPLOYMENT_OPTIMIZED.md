# Production Deployment Guide - AsterMed

## ✅ Optimizations Applied

### Frontend Optimizations
1. **Static Export**: Configured for shared hosting
2. **Bundle Optimization**: 
   - SWC minification enabled
   - Console logs removed in production (except errors/warnings)
   - Source maps disabled for smaller bundles
3. **Image Optimization**: AVIF and WebP format support
4. **Compression**: Gzip compression enabled
5. **Security**: Helmet headers, no x-powered-by header
6. **Performance**: React strict mode, font optimization

### Backend Optimizations
1. **CORS**: Added `https://www.astermedsupplies.co.ke`
2. **Compression**: Response compression with gzip
3. **Security**: Helmet middleware for security headers
4. **Caching**: Static files cached for 30 days
5. **Body Parsing**: 10MB limit for uploads

### Server Optimizations (.htaccess)
1. **Gzip Compression**: HTML, CSS, JS, fonts, images
2. **Browser Caching**: 
   - Images: 1 year
   - CSS/JS: 1 month
   - HTML: No cache (always fresh)
3. **Security Headers**: XSS protection, frame options, MIME sniffing prevention
4. **SPA Routing**: Proper rewrites for single-page app

## 📦 Build & Deploy Steps

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Build Frontend
```bash
cd ..
npm run build
```

This creates the `out/` folder with optimized static files.

### 3. Deploy to HostAfrica

#### Upload Frontend:
1. Upload all contents of `out/` folder to `public_html/`
2. Ensure `.htaccess` file is uploaded (hidden file)
3. Set file permissions: 644 for files, 755 for directories

#### Backend is Already Running:
- Backend at: `https://astermed.codewithseth.co.ke`
- Just restart the server to apply new optimizations:
```bash
pm2 restart astermed-server
```

### 4. Update DNS (if needed)
Ensure both domains point to your hosting:
- `astermedsupplies.co.ke` → Your hosting IP
- `www.astermedsupplies.co.ke` → Your hosting IP

## 🔧 Environment Variables

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://astermed.codewithseth.co.ke
NODE_ENV=production
```

### Backend (.env)
```
CORS_ORIGIN=http://localhost:3000,https://website-astermed.vercel.app,https://astermedsupplies.co.ke,https://www.astermedsupplies.co.ke
```

## ⚡ Performance Checklist

- [x] Static export enabled
- [x] Bundle minified and optimized
- [x] Compression enabled (frontend & backend)
- [x] Browser caching configured
- [x] Security headers added
- [x] CORS properly configured
- [x] Console logs removed in production
- [x] Source maps disabled
- [x] Image optimization enabled
- [x] Static assets cached (30 days)

## 🚀 Post-Deployment

### Test Performance:
1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
2. **GTmetrix**: https://gtmetrix.com/
3. **WebPageTest**: https://www.webpagetest.org/

### Monitor:
- Check browser console for errors
- Verify API calls work from both domains
- Test quote request emails
- Confirm all pages load correctly

### Expected Improvements:
- **Load Time**: 30-50% faster with compression
- **Bundle Size**: 20-40% smaller with optimization
- **Caching**: 90%+ reduction in repeat visit load times
- **Security**: A+ rating on security headers

## 📝 Maintenance

### Update Frontend:
```bash
npm run build
# Upload new out/ folder contents
```

### Update Backend:
```bash
cd server
git pull
npm install
pm2 restart astermed-server
```

## 🛠️ Troubleshooting

### If 404 errors on routes:
- Verify `.htaccess` is uploaded
- Check mod_rewrite is enabled on server

### If CORS errors:
- Verify domain in `CORS_ORIGIN` in server/.env
- Restart backend server

### If images not loading:
- Check image paths use relative URLs
- Verify uploads directory has correct permissions

## 📊 Performance Metrics Target

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **PageSpeed Score**: > 90

---

**Deployment Date**: February 2026
**Optimized by**: GitHub Copilot
**Status**: ✅ Production Ready
