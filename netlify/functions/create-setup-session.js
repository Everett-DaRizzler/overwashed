const Stripe = require("stripe");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Stripe is not configured" })
    };
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { name, email, phone, notes } = JSON.parse(event.body || "{}");

    if (!name || !email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Name and email are required" })
      };
    }

    const siteUrl = process.env.URL || "http://localhost:8888";

    const customer = await stripe.customers.create({
      name,
      email,
      phone,
      metadata: {
        source: "Pope Pressure Washing website",
        notes: notes || ""
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: customer.id,
      payment_method_types: ["card"],
      success_url: `${siteUrl}/payment-method-saved.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment-method-canceled.html`,
      metadata: {
        source: "website_recurring_billing_setup"
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unable to create Stripe checkout session" })
    };
  }
};
