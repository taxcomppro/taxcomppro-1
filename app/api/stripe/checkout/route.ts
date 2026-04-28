import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
  VIP:              process.env.STRIPE_VIP_PRICE_ID!,
  MARKETPLACE:      process.env.STRIPE_MARKETPLACE_PRICE_ID!,
  MARKETPLACE_PLUS: process.env.STRIPE_MARKETPLACE_PLUS_PRICE_ID!,
};

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tier } = await req.json();
  const priceId = PRICE_IDS[tier];
  if (!priceId) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Create or retrieve Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  // Read referral code from cookie
  const refCode = req.cookies.get("ref_code")?.value ?? null;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
    metadata: { userId: user.id, tier, ...(refCode ? { referralCode: refCode } : {}) },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
