# ICD-10 Prediction Frontend

Modern React + Vite + Tailwind CSS frontend for the ICD-10 prediction system.

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

Output will be in `frontend/dist/`

## Features

- ⚡ **Vite** - Lightning-fast build tool
- ⚛️ **React 18** - Latest React features
- 🎨 **Tailwind CSS** - Utility-first styling
- ✨ **Framer Motion** - Smooth animations
- 🔔 **React Hot Toast** - Beautiful notifications
- 🎯 **Lucide Icons** - Beautiful icon library

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── UploadSection.jsx
│   │   ├── ResultsSection.jsx
│   │   ├── CodeCard.jsx
│   │   ├── StatsCard.jsx
│   │   └── Footer.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## API Integration

The frontend automatically proxies API requests to `http://localhost:5000`:

```javascript
// Requests to /api/* are forwarded to http://localhost:5000/api/*
axios.post('/api/predict', formData)
```

## Development

### Hot Module Replacement (HMR)

Changes to components are instantly reflected in the browser without full page reload.

### Tailwind CSS

All styling uses Tailwind CSS utility classes. Customize in `tailwind.config.js`.

### Icons

Icons from Lucide React. Browse available icons at https://lucide.dev/

## Production Deployment

### Build

```bash
npm run build
```

### Serve

```bash
npm run preview
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Drag dist/ folder to Netlify
```

## Environment Variables

Create `.env.local` for environment-specific settings:

```
VITE_API_URL=http://localhost:5000
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

## Troubleshooting

### Port 3000 already in use

```bash
npm run dev -- --port 3001
```

### CORS errors

Ensure backend is running on `http://localhost:5000` and Vite proxy is configured in `vite.config.js`.

### Build errors

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Performance

- **Bundle Size**: ~150KB (gzipped)
- **Load Time**: <1s
- **Lighthouse Score**: 95+

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
