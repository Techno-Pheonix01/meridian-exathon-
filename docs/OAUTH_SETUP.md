# Setting up Google and LinkedIn sign-in

Meridian's code is ready; you only need a Client ID and Secret from each provider. Start the server afterwards and it prints
`Google sign-in: configured` / `LinkedIn sign-in: configured`. Until then the matching icon on the login page is disabled.

Your app's public address is `APP_URL` in `server/.env` (dev: `http://localhost:5173`; production: your real domain, over https).

## Google
1. Go to https://console.cloud.google.com, create (or pick) a project.
2. **APIs & Services → OAuth consent screen**: choose *External*, fill in the app name and your email, save. While in "Testing" mode, add your own Google address under *Test users*.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**.
4. Under **Authorized redirect URIs** add `APP_URL/api/auth/oauth/google/callback`
   (dev example: `http://localhost:5173/api/auth/oauth/google/callback`).
5. Copy the Client ID and Client secret into `server/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. To let anyone (not just test users) sign in, publish the consent screen.

## LinkedIn
1. Go to https://www.linkedin.com/developers/apps and click **Create app** (it needs a LinkedIn Company Page to associate with).
2. **Products** tab: request **Sign In with LinkedIn using OpenID Connect** (usually approved instantly).
3. **Auth** tab: under **Authorized redirect URLs** add `APP_URL/api/auth/oauth/linkedin/callback`.
4. Copy the Client ID and Primary Client Secret into `server/.env` as `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`.

## Check it
Restart the server, open the login page, click the Google or LinkedIn icon, approve, and you should land on your dashboard.
If you see an error on the login page: `oauth_state` means the cookie was lost (use the same host you registered, e.g. localhost vs 127.0.0.1);
a redirect-URI error from the provider means the address in step 4 doesn't match `APP_URL` exactly.
