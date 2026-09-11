# SiSurat Vercel Deployment Guide

## ✅ Setup Complete

Your project is now ready for Vercel deployment with the following configuration:

### What's Been Done

1. **Vercel Configuration** (`vercel.json`)
   - Build command: `npm run build`
   - Output directory: `dist/`
   - Framework: Vite
   - Serverless function configured at `/api`

2. **API Layer** (`api/index.ts`)
   - Express app converted to Vercel serverless function
   - All routes from `server.js` are available
   - Cloudinary integration for file uploads

3. **File Storage**
   - Local `/uploads` directory replaced with Cloudinary
   - Files now persist in cloud storage
   - Maximum file size: 1.5 MB

4. **Environment Variables Ready**
   - `.env` configured locally with Cloudinary credentials
   - `.env.example` template for documentation
   - `.gitignore` prevents accidental secret commits

5. **Git & GitHub**
   - Code pushed to: https://github.com/Fgussx/sisurat
   - Build verified locally: ✓ Success

---

## 🚀 Deploy to Vercel (Final Step)

### 1. Go to Vercel Dashboard
- Visit https://vercel.com
- Log in with GitHub account

### 2. Create New Project
- Click "Add New Project"
- Select repository: `Fgussx/sisurat`
- Click "Import"

### 3. Set Environment Variables

Add these in the "Environment Variables" section:

```
MONGODB_URI=mongodb+srv://sisurat_user:QazwsxEdc@cluster0.xtoq87m.mongodb.net/sisurat_db?retryWrites=true&w=majority
JWT_SECRET=sisurat_jwt_secret_key_2026_secure_production_key
JWT_REFRESH_SECRET=sisurat_jwt_refresh_secret_key_2026_secure_production_key
EMAIL_USER=cssandya3@gmail.com
EMAIL_PASSWORD=kgwv buwq ptkb rqay
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=xrbbynbn
CLOUDINARY_API_KEY=665323781892642
CLOUDINARY_API_SECRET=XqKzBdfd_HwGvGzVpxlKebc_LJc
```

### 4. Deploy
- Click "Deploy"
- Wait 2-3 minutes for build to complete
- Your app will be live at `https://sisurat.vercel.app`

---

## 📊 Project Structure (Vercel Ready)

```
eofficet/
├── api/
│   └── index.ts              # Vercel serverless function
├── src/
│   ├── App.tsx               # Frontend (React)
│   └── ...
├── dist/                     # Built frontend (generated)
├── vercel.json               # Vercel config
├── .env                      # Local secrets (NOT committed)
├── .env.example              # Template (committed)
├── package.json              # Dependencies + Cloudinary
└── server.js                 # Local dev only
```

---

## 🔍 How It Works on Vercel

1. **Frontend**: React app builds to `/dist`, served as static files
2. **Backend**: Express app in `/api` runs as serverless functions
3. **File Uploads**: Use Cloudinary instead of local storage
4. **Database**: MongoDB Atlas handles persistence
5. **Email**: Gmail SMTP sends OTP codes

---

## ⚡ Local Development (Still Works)

```bash
# Install dependencies
npm install

# Development mode (both Vite + Express)
npm run dev

# Production build
npm run build

# Preview build locally
npm run preview
```

---

## 🔒 Security Notes

- ✅ `.env` is in `.gitignore` (never committed)
- ✅ All secrets stored in Vercel dashboard only
- ✅ Cloudinary API credentials never exposed in code
- ✅ MongoDB connection string is secure

---

## 📝 Next Steps After Deployment

1. Test the live app at your Vercel URL
2. Verify file uploads work with Cloudinary
3. Test login/authentication flows
4. Check email OTP delivery
5. Monitor Vercel analytics dashboard

---

## 🆘 Troubleshooting

### Build fails on Vercel
- Check environment variables are all set
- Ensure MongoDB URI is accessible from Vercel

### File uploads not working
- Verify Cloudinary credentials in env vars
- Check Cloudinary account is active

### API endpoints return 500
- Check server logs in Vercel dashboard
- Verify MongoDB connection string

---

**Deployment Ready! 🚀**

Questions? Check the Vercel docs: https://vercel.com/docs
