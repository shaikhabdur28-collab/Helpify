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

```bash
npm install
npm run dev
```

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

If you want a live site on GitHub Pages, build the app and publish the `dist` folder.

## Next upgrades

- add real cloud login later if you want shared access across devices
- add export/import backups
- add class and grade analytics
- add messaging between students and teachers
