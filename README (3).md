# Helpify

Helpify is a private student support app built with React and Vite.
It includes:

- student, teacher, and admin accounts
- private student profiles stored in the browser
- progress charts
- study plans
- reminder tracking
- tutor matching suggestions
- role-based dashboards

## Privacy model

- Data stays in the browser on the user’s device
- Students only see their own local records
- Teachers and admins only see records for the current school code in that browser
- No Firebase or backend is required

## Demo accounts

- student@helpify.app / student123
- teacher@helpify.app / teacher123
- admin@helpify.app / admin123

## Run locally

Create a `.env` file with your Gemini API key:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Then run:

```bash
npm install
npm run dev
```

## AI chatbot

Helpify includes a Gemini-powered chatbot on the website.

- enter your Gemini API key inside the chatbot settings
- it can answer questions about study plans, reminders, tutoring, and progress
- for a prototype, the key is stored in the browser on your device
- for a production app, move Gemini calls to a backend so the key stays private

## Upload to GitHub

Upload the whole `helpify-react-app` folder to a free GitHub repository.
Keep these out of GitHub:

- `node_modules`
- `dist`
- `.env` files if you add any later

See `GITHUB_SETUP.md` for the exact repository structure and git commands.

## Free hosting options

Because the app is now fully static, you can host it for free with:

- GitHub Pages
- Vercel
- Netlify

This project includes a GitHub Pages deploy workflow, so you can publish it directly from the repo.

## Next upgrades

- add real cloud login later if you want shared access across devices
- add export/import backups
- add class and grade analytics
- add messaging between students and teachers
