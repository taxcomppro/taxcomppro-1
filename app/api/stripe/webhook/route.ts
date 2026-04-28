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
  const sig  = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, tier, type, toolkitId, membershipTier, membershipMonths } = session.metadata ?? {};

    // ── Toolkit one-time purchase ──────────────────────────
    if (type === "toolkit" && userId && toolkitId) {
      const mTier  = (membershipTier ?? "MARKETPLACE") as SubscriptionTier;
      const months = Number(membershipMonths ?? 2);

      await prisma.toolkitPurchase.create({
        data: { userId, toolkitId, stripeSessionId: session.id, membershipGranted: true, membershipTier: mTier, membershipMonths: months },
      });

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
      const tierOrder: SubscriptionTier[] = ["FREE","VIP","MARKETPLACE","MARKETPLACE_PLUS"];
      if (tierOrder.indexOf(mTier) > tierOrder.indexOf(user?.tier ?? "FREE")) {
        await prisma.user.update({ where: { id: userId }, data: { tier: mTier } });
      }

      await prisma.notification.create({
        data: { userId, type: "SYSTEM", title: "🎉 Toolkit Purchase Complete!", message: `Your download is ready and you've received ${months} months of ${mTier} membership.` },
      });
    }

    // ── Bundle one-time purchase ───────────────────────────
    if (type === "bundle" && userId) {
      const { bundleId } = session.metadata ?? {};
      const mTier  = (membershipTier ?? "MARKETPLACE_PLUS") as SubscriptionTier;
      const months = Number(membershipMonths ?? 3);

      // Record as a special toolkit purchase with id "bundle:{bundleId}"
      await prisma.toolkitPurchase.create({
        data: { userId, toolkitId: `bundle:${bundleId ?? "unknown"}`, stripeSessionId: session.id, membershipGranted: true, membershipTier: mTier, membershipMonths: months },
      });

      // Always upgrade to MARKETPLACE_PLUS for bundle
      await prisma.user.update({ where: { id: userId }, data: { tier: mTier } });

      await prisma.notification.create({
        data: { userId, type: "SYSTEM", title: "🎉 Bundle Purchase Complete!", message: `Welcome to ${mTier}! You've received ${months} months of premium membership and all included toolkits.` },
      });
    }

    // ── Subscription upgrade ──────────────────────────────
    if (type !== "toolkit" && userId && tier) {
      const t = tier as SubscriptionTier;
      await prisma.user.update({ where: { id: userId }, data: { tier: t } });
      await prisma.subscription.upsert({
        where:  { userId },
        create: { userId, plan: t, stripeCustomerId: session.customer as string, stripeSubscriptionId: session.subscription as string, status: "active" },
        update: { plan: t, stripeSubscriptionId: session.subscription as string, status: "active" },
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
    const sub     = event.data.object as Stripe.Subscription;
    const priceId = sub.items.data[0]?.price.id;
    const t       = PRICE_TO_TIER[priceId] ?? "FREE";
    const existing = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: sub.id } });
    if (existing) {
      await prisma.user.update({ where: { id: existing.userId }, data: { tier: t } });
      await prisma.subscription.update({ where: { id: existing.id }, data: { plan: t, status: sub.status } });
    }
  }

  return NextResponse.json({ received: true });
}
