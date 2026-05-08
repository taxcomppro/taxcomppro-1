import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToolkit } from "@/lib/toolkits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toolkitId } = await req.json() as { toolkitId: string };
  const toolkit = getToolkit(toolkitId);
  if (!toolkit) return NextResponse.json({ error: "Invalid toolkit" }, { status: 400 });

  // Check if user already purchased this toolkit
  const existing = await prisma.toolkitPurchase.findFirst({
    where: { userId: session.user.id, toolkitId },
  });
  if (existing) return NextResponse.json({ error: "Already purchased", alreadyOwned: true }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Create or retrieve Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name ?? "" });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    // Save card for future VIP trial billing only if this toolkit includes membership
    ...(toolkit.membershipMonths > 0 ? {
      payment_intent_data: {
        setup_future_usage: "off_session" as const,
        metadata: { userId: user.id, source: "toolkit_purchase" },
      },
    } : {}),
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: Math.round(toolkit.price * 100),
        product_data: {
          name: toolkit.name,
          description: `Includes ${toolkit.membershipMonths} months FREE VIP membership, then $39.99/month`,
          images: [],
        },
      },
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/toolkits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/toolkits`,
    metadata: {
      userId:           user.id,
      toolkitId,
      membershipTier:   toolkit.membershipMonths > 0 ? "VIP" : "",
      membershipMonths: String(toolkit.membershipMonths),
      type:             "toolkit",
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
