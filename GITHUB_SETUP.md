# Helpify GitHub setup

This project is ready for a free GitHub repo.

## Recommended repo structure

```text
helpify-react-app/
├─ src/
│  ├─ App.jsx
│  ├─ firebase.js
│  ├─ main.jsx
│  └─ styles.css
├─ .github/
│  └─ workflows/
│     └─ build.yml
├─ firebase.json
├─ firestore.rules
├─ .gitignore
├─ .firebaserc.example
├─ package.json
├─ vite.config.js
├─ README.md
└─ FREE_DEPLOY.md
```

## What to upload to GitHub

Upload the whole `helpify-react-app` folder.
Do not upload:

- `node_modules`
- `.env`
- `dist`

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

## Important

GitHub is best for storing and sharing the code.
For the live app, use Firebase Hosting or Vercel.

If you want a free public live site, Firebase Hosting is the best fit because Helpify already uses Firebase Auth and Firestore.
