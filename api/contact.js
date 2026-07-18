import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { name = "", email = "", message = "" } = req.body ?? {};

  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ success: false, message: "Please fill in all fields." });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid email address." });
  }

  if (!resend) {
    return res.status(503).json({ success: false, message: "Email service is not configured yet. Set RESEND_API_KEY in Vercel." });
  }

  try {
    await resend.emails.send({
      from: "Sam Portfolio Mail <onboarding@resend.dev>",
      to: "cosamarra30@gmail.com",
      subject: `New Portfolio Inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Resend error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unable to send the message right now.";
    return res.status(500).json({ success: false, message: errorMessage });
  }
}
