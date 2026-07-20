# Helpify GitHub setup

This project is now fully static and does not require Firebase.

## Recommended repo structure

```text
helpify-react-app/
├─ src/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ .github/
│  └─ workflows/
│     └─ build.yml
├─ .gitignore
├─ package.json
├─ vite.config.js
├─ README.md
└─ GITHUB_SETUP.md
```

## What to upload to GitHub

Upload the whole `helpify-react-app` folder.
Do not upload:

- `node_modules`
- `dist`
- `.env` files

## Free GitHub workflow

1. Create a new GitHub repository
2. Upload this project folder
3. Push to `main`
4. GitHub Actions will run the build workflow automatically

## Git commands

```bash
git init
git add .
git commit -m "Initial Helpify app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Free live hosting on GitHub Pages

If you want a free live site from the same repo:

1. Run `npm install`
2. Run `npm run build`
3. Turn on GitHub Pages in the repo settings
4. Set the Pages source to the `dist` folder from your publishing workflow or use a deploy action

If you want, I can add a GitHub Pages deploy workflow next.
