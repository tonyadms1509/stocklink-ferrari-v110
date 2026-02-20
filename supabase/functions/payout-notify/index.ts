import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const payload = await req.json();
  const promoter = payload.record;

  if (promoter.payout_status === "paid") {
    const emailBody = {
      personalizations: [{ to: [{ email: promoter.email }] }],
      from: { email: "payouts@stocklinksa.co.za" },
      subject: "Your StockLink Commission Has Been Paid",
      content: [
        {
          type: "text/plain",
          value: `Hi ${promoter.name}, your commission of R${promoter.payout_amount} was paid on ${promoter.paid_at}.`,
        },
      ],
    };

    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailBody),
    });
  }

  return new Response("OK", { status: 200 });
});
