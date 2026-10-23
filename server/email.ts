import "server-only";

type EmailMessage = { to: string; subject: string; html: string };

export async function sendTransactionalEmail(message: EmailMessage) {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { delivered: false, reason: "not-configured" } as const;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [message.to], subject: message.subject, html: message.html }),
    });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
    return { delivered: true } as const;
  } catch (error) {
    console.error("Transactional email delivery failed", error instanceof Error ? error.message : "Unknown provider error");
    return { delivered: false, reason: "provider-error" } as const;
  }
}
