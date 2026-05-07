import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SubscriptionTier } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  [process.env.STRIPE_VIP_PRICE_ID!]:              "VIP",
  [process.env.STRIPE_MARKETPLACE_PRICE_ID!]:      "MARKETPLACE",
  [process.env.STRIPE_MARKETPLACE_PLUS_PRICE_ID!]: "MARKETPLACE_PLUS",
};

// POST /api/stripe/verify-session
// Called on the success redirect to immediately update the DB regardless of webhook delivery
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await req.json() as { sessionId?: string };
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

  let stripeSession: Stripe.Checkout.Session;
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "subscription.items.data.price"],
    });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  // Security: only allow the session owner to verify
  const { userId, tier, type } = stripeSession.metadata ?? {};
  if (userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (stripeSession.payment_status !== "paid" && stripeSession.status !== "complete")
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });

  let resolvedTier: SubscriptionTier | null = null;

  // Subscription purchase — resolve tier from price ID
  if (stripeSession.mode === "subscription") {
    const sub = stripeSession.subscription as Stripe.Subscription | null;
    const priceId = sub?.items?.data?.[0]?.price?.id ?? "";
    resolvedTier = PRICE_TO_TIER[priceId] ?? (tier as SubscriptionTier) ?? null;

    if (resolvedTier) {
      await prisma.user.update({ where: { id: userId }, data: { tier: resolvedTier } });
      await prisma.subscription.upsert({
        where:  { userId },
        create: { userId, plan: resolvedTier, stripeCustomerId: stripeSession.customer as string, stripeSubscriptionId: sub?.id ?? "", status: "active" },
        update: { plan: resolvedTier, stripeSubscriptionId: sub?.id ?? "", status: "active" },
      });
      await prisma.notification.create({
        data: { userId, type: "SYSTEM", title: "🎉 Membership Upgraded!", message: `You are now on the ${resolvedTier} plan. Enjoy your new benefits!` },
      }).catch(() => {});
    }
  }

  // Toolkit / bundle one-time purchase — apply upgrade ourselves (idempotent fallback for webhook)
  if (type === "toolkit" || type === "bundle") {
    const { toolkitId, membershipTier, membershipMonths, bundleId } = stripeSession.metadata ?? {};
    const mTier  = (membershipTier ?? "MARKETPLACE") as SubscriptionTier;
    const months = Number(membershipMonths ?? 2);
    const tkId   = type === "toolkit" ? toolkitId : `bundle:${bundleId ?? "unknown"}`;

    if (tkId) {
      // Only create the purchase record if the webhook hasn't already done it
      const existing = await prisma.toolkitPurchase.findFirst({
        where: { stripeSessionId: stripeSession.id },
      });

      if (!existing) {
        await prisma.toolkitPurchase.create({
          data: {
            userId,
            toolkitId:        tkId,
            stripeSessionId:  stripeSession.id,
            membershipGranted: true,
            membershipTier:   mTier,
            membershipMonths: months,
          },
        });

        // Apply tier upgrade (never downgrade)
        const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
        const tierOrder: SubscriptionTier[] = ["FREE", "VIP", "MARKETPLACE", "MARKETPLACE_PLUS"];
        if (tierOrder.indexOf(mTier) > tierOrder.indexOf(currentUser?.tier ?? "FREE")) {
          await prisma.user.update({ where: { id: userId }, data: { tier: mTier } });
        }

        await prisma.notification.create({
          data: {
            userId, type: "SYSTEM",
            title:   "🎉 Toolkit Purchase Complete!",
            message: `Your download is ready and you've received ${months} months of ${mTier} membership.`,
          },
        }).catch(() => {});
      }
    }

    resolvedTier = (await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } }))?.tier ?? "FREE";
  }

  // Return the fresh tier so the client can update Redux
  const freshUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, role: true, name: true, email: true, image: true, bio: true, headline: true },
  });

  return NextResponse.json({ tier: freshUser?.tier ?? "FREE", user: freshUser });
}
