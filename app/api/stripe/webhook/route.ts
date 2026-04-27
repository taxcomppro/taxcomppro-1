import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import type { SubscriptionTier } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  [process.env.STRIPE_VIP_PRICE_ID!]:              "VIP",
  [process.env.STRIPE_MARKETPLACE_PRICE_ID!]:      "MARKETPLACE",
  [process.env.STRIPE_MARKETPLACE_PLUS_PRICE_ID!]: "MARKETPLACE_PLUS",
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier as SubscriptionTier;
    if (userId && tier) {
      await prisma.user.update({ where: { id: userId }, data: { tier } });
      await prisma.subscription.upsert({
        where: { userId },
        create: { userId, plan: tier, stripeCustomerId: session.customer as string, stripeSubscriptionId: session.subscription as string, status: "active" },
        update: { plan: tier, stripeSubscriptionId: session.subscription as string, status: "active" },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const existingSub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: sub.id } });
    if (existingSub) {
      await prisma.user.update({ where: { id: existingSub.userId }, data: { tier: "FREE" } });
      await prisma.subscription.update({ where: { id: existingSub.id }, data: { status: "canceled", plan: "FREE" } });
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const priceId = sub.items.data[0]?.price.id;
    const tier = PRICE_TO_TIER[priceId] ?? "FREE";
    const existingSub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: sub.id } });
    if (existingSub) {
      await prisma.user.update({ where: { id: existingSub.userId }, data: { tier } });
      await prisma.subscription.update({ where: { id: existingSub.id }, data: { plan: tier, status: sub.status } });
    }
  }

  return NextResponse.json({ received: true });
}
