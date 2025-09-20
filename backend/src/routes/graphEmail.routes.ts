import { Router } from "express";
import querystring from "querystring";

const router = Router();

// Microsoft OAuth login
router.get("/oauth/login", (req, res) => {
  const params = querystring.stringify({
    client_id: process.env.AZURE_CLIENT_ID,
    response_type: "code",
    redirect_uri: `${process.env.BASE_URL}/api/graph-email/oauth/callback`,
    response_mode: "query",
    scope: "openid profile offline_access https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.ReadWrite",
    prompt: "consent"
  });

  res.redirect(
    `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize?${params}`
  );
});

// OAuth callback
router.get("/oauth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "No code received" });

  // Exchange code for tokens (pseudo — implement with axios/fetch)
  // const tokenResponse = await axios.post(`https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`, {...})

  return res.json({ success: true, message: "OAuth success!", code });
});

export default router;

