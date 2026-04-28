import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBundle } from "@/lib/toolkits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bundleId } = await req.json() as { bundleId: string };
  const bundle = getBundle(bundleId);
  if (!bundle) return NextResponse.json({ error: "Invalid bundle" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: Math.round(bundle.price * 100),
        product_data: {
          name: bundle.name,
          description: `${bundle.tagline} — ${bundle.membershipMonths} months ${bundle.membershipTier} membership included`,
        },
      },
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/toolkits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/toolkits`,
    metadata: {
      userId:           user.id,
      bundleId,
      membershipTier:   bundle.membershipTier,
      membershipMonths: String(bundle.membershipMonths),
      type:             "bundle",
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
