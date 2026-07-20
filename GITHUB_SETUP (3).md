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
4. GitHub Actions will build and deploy the website automatically

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

This project now includes a GitHub Pages deploy workflow.

To publish the website:

1. Push the repo to GitHub
2. Go to repo **Settings → Pages**
3. Set the source to **GitHub Actions**
4. Push to `main`
5. Wait for the workflow to deploy the site

## Gemini chatbot setup

If you want the AI chatbot to work on the website, paste your Gemini API key into the chatbot settings after the site loads.

For a production version, move the Gemini call to a backend later so the key stays private.

If you want a custom domain later, you can add it in GitHub Pages settings.
