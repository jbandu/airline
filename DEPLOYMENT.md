# GitHub Pages Deployment Guide

This document explains how to deploy the AirFlow Airline Workflow Management application to GitHub Pages.

## Configuration

The application is configured for GitHub Pages deployment with the following settings:

### Vite Configuration (`vite.config.ts`)

- **Base Path**: `/airline/` - Matches the GitHub repository name
- **Output Directory**: `dist` - Standard build output
- **Asset Directory**: `assets` - All static assets are placed here
- **Code Splitting**: Vendor chunks are separated for better caching:
  - `react-vendor`: React, React DOM, React Router
  - `d3-vendor`: D3 visualization library
  - `ui-vendor`: Lucide React icons, ReactFlow

### Router Configuration (`src/App.tsx`)

- **BrowserRouter basename**: `/airline` - Ensures proper routing on GitHub Pages

## Automatic Deployment

The repository is configured with GitHub Actions for automatic deployment.

### Workflow File: `.github/workflows/deploy.yml`

The workflow:
1. Triggers on pushes to `main` or `master` branch
2. Can also be triggered manually via workflow_dispatch
3. Installs dependencies and builds the project
4. Creates a `.nojekyll` file to prevent Jekyll processing
5. Deploys to GitHub Pages

### GitHub Repository Settings

To enable GitHub Pages deployment, configure the following in your repository:

1. Go to **Settings** → **Pages**
2. Under **Source**, select:
   - Source: **GitHub Actions**
3. Save the settings

The workflow will automatically deploy on the next push to the main/master branch.

## Manual Deployment

If you prefer to deploy manually:

### 1. Build the project

```bash
npm run build
```

### 2. Create .nojekyll file

```bash
touch dist/.nojekyll
```

### 3. Deploy to GitHub Pages

You can use `gh-pages` package:

```bash
# Install gh-pages
npm install -g gh-pages

# Deploy
gh-pages -d dist
```

Or push the `dist` folder to the `gh-pages` branch manually.

## Local Preview

To preview the production build locally:

```bash
npm run build
npm run preview
```

The preview server will start at `http://localhost:4173/airline/`

## Troubleshooting

### Assets not loading

- Ensure the `base` path in `vite.config.ts` matches your repository name
- Verify the `basename` prop in `BrowserRouter` matches the base path
- Check that GitHub Pages is configured to use GitHub Actions as the source

### 404 errors on page refresh

This is expected behavior for SPAs on GitHub Pages. The GitHub Actions workflow handles this by serving `index.html` for all routes.

### Routing issues

- Ensure all internal links use React Router's `Link` or `useNavigate`
- Don't use `<a href>` for internal navigation
- All routes should be relative to the basename

## Environment Variables

For production deployment with environment-specific configurations:

1. Create a `.env.production` file
2. Add your production environment variables
3. Use `import.meta.env.VITE_*` to access them in your code

Example:

```env
VITE_API_URL=https://api.example.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Build Optimization

The current build configuration includes:

- **Code splitting**: Separate vendor chunks for better caching
- **Tree shaking**: Removes unused code
- **Minification**: Reduces bundle size
- **Asset optimization**: Images and other assets are optimized

### Build Output

Typical build output:
- `index.html`: Main HTML file (~0.77 KB)
- `assets/index-*.css`: Stylesheet (~48 KB)
- `assets/react-vendor-*.js`: React libraries (~175 KB)
- `assets/d3-vendor-*.js`: D3 library (~116 KB)
- `assets/ui-vendor-*.js`: UI libraries (~127 KB)
- `assets/index-*.js`: Application code (~813 KB)

## Deployment URL

After deployment, your application will be available at:

```
https://[username].github.io/airline/
```

Replace `[username]` with your GitHub username or organization name.

## Notes

- The `.nojekyll` file prevents GitHub Pages from processing the site with Jekyll
- All asset paths are automatically prefixed with `/airline/` during build
- Source maps are disabled in production for security and performance
- The build process includes chunk size optimization to improve loading times
