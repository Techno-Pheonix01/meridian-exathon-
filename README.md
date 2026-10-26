# Meridian
Prereq: Node 18+, and a MongoDB (local, or a free MongoDB Atlas cluster).
```
cd server && cp .env.example .env     # then open .env and fill MONGO_URI and JWT_SECRET
npm i && npm start                    # API on :5000
cd client && npm i && npm run dev     # UI on :5173 (Vite forwards /api to :5000)
```
Sign-in is email + password only. Create an account on the Sign Up page.

## Deploying (Render + Vercel + MongoDB Atlas)
- Every backend route starts with `/api` (e.g. `POST /api/auth/register`). The frontend adds `/api` itself, so on Vercel set
  `VITE_API_URL` to the bare Render address, e.g. `https://meridian-5g9v.onrender.com` (no trailing slash, no `/api`).
- Render: Root Directory `server`, Build `npm install`, Start `npm start`. Environment: see `server/.env.example`.
- Vercel: Root Directory `client`, Framework Vite, Build `npm run build`, Output `dist`. `client/vercel.json` already handles page refreshes.
- Open `https://<your-render-url>/` in a browser: it should show `{"app":"Meridian API","status":"running","database":"connected"}`.

## Demo accounts
Set `SEED_DEMO_USERS=true` on the server to create employee@ / manager@ / finance@ / admin@company.com (password `demo123`) on startup.
These are sample accounts for demonstrations only. Or run `cd server && npm run demo-users` against your database.

Optional: fill Cloudinary / SMTP values in server/.env for cloud receipts and email notifications; otherwise local uploads + in-app only.

## Bill / receipt verification
- **On submit (automatic):** file type is checked from the file contents (real PDF/JPG/PNG only); bill amount, bill date and GSTIN format are compared with the claim; the same vendor + invoice number, or the same receipt file, used in any other claim is flagged ("Duplicate Bill", "Receipt Already Used"); same category/amount/date by the same employee is flagged "Possible Duplicate".
- **Reviewers:** managers (manager stage) and finance (finance stage) mark every item Verified or Rejected. Rejections need a reason; flagged duplicates need a note to be verified.
- **Approval:** a claim can't be approved until every item is verified or rejected. The approved amount is the sum of verified items, and payment always uses that amount.

## Proof requirements
- **Required documents per category** (admin: Policies). Employees attach several files per item, each labelled (Invoice, Boarding pass, Stay record, ...). Submission is blocked until every required document is attached. Items above a category's "extra proof" amount also need a "Supporting document".
- **No-receipt declaration** for small items, up to a per-category limit (0 = not allowed). Flagged "Missing Receipt Declared"; a reviewer must add a note to verify it.
- **Employee declaration** is required to submit a claim; the name and time are stored on the claim.
- **Request more proof:** reviewers mark items "Needs proof" (with a note) and click "Send back to employee". The claim shows as "Proof Requested"; the employee uploads documents and it returns to the same reviewer (manager or finance). Approval is blocked while any item needs proof. Every step is in the approval history.

## Seeing the other roles (manager / finance / admin)
Accounts made on the Sign Up page are employees. To view the other roles:
- `cd server && npm run demo-users` creates (or repairs) manager@, finance@, admin@ and employee@company.com (password `demo123`). It deletes nothing.
- `npm run set-role -- you@example.com manager` turns an existing account into a manager, finance or admin user (roles: employee, manager, finance, admin). Run it with no arguments to list all accounts.
- Or, on your own computer only, set `SIGNUP_ROLE_CHOICE=true` in `server/.env` (and not NODE_ENV=production) to get a Role dropdown on the sign-up form.
(`npm run seed` also creates the demo accounts, but it first wipes users, policies and travel requests.)
