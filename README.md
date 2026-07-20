# Helpify

Helpify is a private student support app built with React and Firebase.
It includes:

- student, teacher, and admin accounts
- private student profiles
- progress charts
- study plans
- reminder tracking
- tutor matching suggestions
- role-based dashboards

## Privacy model

- Student data is private to the signed-in account and school code
- Students only see their own records
- Teachers and admins only see records for their school code
- Firestore security rules block direct access to other schools' records

## Important note

This is a strong prototype, but in production you should move teacher/admin role assignment to Firebase custom claims or an admin-managed onboarding flow.
That prevents users from changing their own role value in the database.

## Setup

1. Create a Firebase project
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Add environment variables in a `.env` file:

```bash
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Install dependencies and run:

```bash
npm install
npm run dev
```

## How the app works

### Student view
- edit private student data
- see progress charts
- get recommended tasks
- build reminders
- see tutor suggestions

### Teacher/admin view
- view the school roster
- check who is at risk
- review progress charts
- track reminders
- inspect student support plans

## GitHub setup

This project is ready to upload to a free GitHub repository.

- upload the whole `helpify-react-app` folder
- keep `node_modules`, `.env`, and `dist` out of GitHub
- GitHub Actions will build the app on pushes to `main`

See `GITHUB_SETUP.md` for the exact repo structure and git commands.

## Free deploy options

### Firebase Hosting
This project is already set up for Firebase Hosting.

- build output goes to `dist`
- SPA routing rewrites to `index.html`
- run `npm run build` then `firebase deploy`

See `FREE_DEPLOY.md` for the full upload steps.

### Vercel
You can also deploy the same app on Vercel for free.

- build command: `npm run build`
- output directory: `dist`

## Next upgrades

- custom Firebase claims for roles
- messaging between teachers and students
- notification delivery
- analytics by class or grade
- tutor request workflow
