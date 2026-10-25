# Meridian
Prereq: Node 18+, MongoDB running locally.
```
cd server && cp .env.example .env && npm i && npm run seed && npm start      # API :5000
cd client && npm i && npm run dev                    # UI  :5173
```
Demo logins (password `demo123`): employee@ / manager@ / finance@ / admin@company.com

Optional: fill Cloudinary / SMTP values in server/.env for cloud receipts and email notifications; otherwise local uploads + in-app only.

## Google & LinkedIn sign-in
Set in `server/.env` (see `.env.example`): `APP_URL`, `GOOGLE_CLIENT_ID/SECRET`, `LINKEDIN_CLIENT_ID/SECRET`.
Register these redirect URLs with each provider (replace the origin in production):
- `http://localhost:5173/api/auth/oauth/google/callback`
- `http://localhost:5173/api/auth/oauth/linkedin/callback`
LinkedIn: add the product "Sign In with LinkedIn using OpenID Connect". Anyone with a Google or LinkedIn account can sign in; first sign-in creates an employee account automatically.
Set `OAUTH_AUTO_CREATE=false` to require admin-created accounts, or `OAUTH_ALLOWED_DOMAIN=yourcompany.com` to limit sign-up to one domain.
New users have no manager: an admin assigns one under Users, otherwise their travel requests have no approver.

Full Google/LinkedIn setup walkthrough: docs/OAUTH_SETUP.md

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
- Or set `SIGNUP_ROLE_CHOICE=true` in `server/.env` (testing only) to get a Role dropdown on the sign-up form, then restart the server.
(`npm run seed` also creates the demo accounts, but it first wipes users, policies and travel requests.)
