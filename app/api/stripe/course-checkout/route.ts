import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await req.json() as { slug: string };
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { slug, status: "PUBLISHED" } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  if (course.isFree || course.price <= 0)
    return NextResponse.json({ error: "Course is free — enroll directly" }, { status: 400 });

  // Already enrolled?
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });
  if (existing) return NextResponse.json({ error: "Already enrolled", alreadyEnrolled: true }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Create / retrieve Stripe customer
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
        unit_amount: Math.round(course.price * 100),
        product_data: {
          name: course.title,
          description: `Full access to "${course.title}"`,
          images: course.thumbnail ? [course.thumbnail] : [],
        },
      },
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${slug}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/courses/${slug}`,
    metadata: {
      type:     "course",
      userId:   user.id,
      courseId: course.id,
      slug,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
