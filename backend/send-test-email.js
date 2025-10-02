import { sendEmail } from "./dist/utils/email.js";

(async () => {
  console.log("🧪 Testing email service...");
  
  const success = await sendEmail({
    to: "test@example.com",
    subject: "Test Email",
    template: "welcome",
    data: { name: "Test User" },
    inquiryType: "contact",
  });

  console.log("Email send result:", success);
  
  if (success) {
    console.log("✅ Email service is working correctly!");
  } else {
    console.log("❌ Email service failed - check configuration");
  }
})();