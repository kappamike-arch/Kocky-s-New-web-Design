import { Router } from 'express';
import axios from 'axios';

const router = Router();

// ⬇️ Replace with your real values
const CLIENT_ID = "46b54378-7023-4746-845f-514f2fc40f8a";
const TENANT_ID = "8eb62d31-a2c3-4af1-a6ac-da1ed966dd14";
const CLIENT_SECRET = "2je8Q~mXwctPuMo4qxsinNmvlajkFQOZEinkWby.";
const REDIRECT_URI = "https://staging.kockys.com/api/graph-email/oauth/callback";

// ✅ Step 1: Login route - redirects to Microsoft consent page
router.get("/oauth/login", (req, res) => {
  const authUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_mode=query` +
    `&scope=offline_access%20openid%20profile%20https://graph.microsoft.com/User.Read%20https://graph.microsoft.com/Mail.Send%20https://graph.microsoft.com/Mail.ReadWrite` +
    `&prompt=consent`;

  res.redirect(authUrl);
});

// ✅ Step 2: Callback route - Microsoft redirects here with ?code=
router.get("/oauth/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send("Missing ?code in callback");
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // Store tokens (for now, just show them in response - replace with DB storage)
    const tokens = tokenResponse.data;

    // 👇 You MUST save refresh_token + access_token securely for reuse
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);

    res.send("✅ Microsoft Graph OAuth completed! Tokens saved on server.");
  } catch (err: any) {
    console.error("OAuth Callback Error:", err.response?.data || err.message);
    res.status(500).send("OAuth callback failed. Check server logs.");
  }
});

export default router;

