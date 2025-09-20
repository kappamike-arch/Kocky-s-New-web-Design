// routes/graphEmail.routes.ts
import { Router } from "express";
import axios from "axios";

const router = Router();

// Step 1: Login route
router.get("/oauth/login", (req, res) => {
  const authUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize?` +
    `client_id=${process.env.AZURE_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(process.env.AZURE_REDIRECT_URI)}` +
    `&response_mode=query` +
    `&scope=openid profile offline_access https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.ReadWrite` +
    `&prompt=consent`;

  res.redirect(authUrl);
});

// Step 2: Callback route
router.get("/oauth/callback", async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("Authorization code missing");
  }

  try {
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.AZURE_CLIENT_ID!,
        client_secret: process.env.AZURE_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.AZURE_REDIRECT_URI!,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // TODO: Save tokens in DB or session
    res.send("OAuth success! Tokens received.");
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth token exchange failed");
  }
});

export default router;
