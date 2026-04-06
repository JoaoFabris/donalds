import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// ─── Handlers de eventos ────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  // Validar metadata
  if (!session.metadata?.orderId) {
    console.error("[Stripe Webhook] Missing orderId in metadata");
    return;
  }

  const orderId = Number(session.metadata.orderId);
  if (isNaN(orderId) || orderId <= 0) {
    console.error(
      "[Stripe Webhook] Invalid orderId:",
      session.metadata.orderId,
    );
    return;
  }

  // Buscar pedido
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, stripeSessionId: true },
  });

  if (!order) {
    console.error(`[Stripe Webhook] Order not found: ${orderId}`);
    return;
  }

  // Idempotência por session ID — evita reprocessar mesmo evento
  if (order.stripeSessionId === session.id) {
    console.log(
      `[Stripe Webhook] Order ${orderId} already processed for session ${session.id}`,
    );
    return;
  }

  // ✅ ATUALIZAR STATUS PARA IN_PREPARATION (pagamento confirmado)
  await db.order.update({
    where: { id: orderId },
    data: {
      status: "IN_PREPARATION",
      stripeSessionId: session.id,
    },
  });

  console.log(`[Stripe Webhook] Order ${orderId} updated to IN_PREPARATION`);
}

async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (!session.metadata?.orderId) return;

  const orderId = Number(session.metadata.orderId);
  if (isNaN(orderId) || orderId <= 0) return;

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true },
  });

  // Só cancelar se ainda estiver pendente
  if (!order || order.status !== "PENDING") return;

  await db.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  console.log(`[Stripe Webhook] Order ${orderId} cancelled (session expired)`);
}

// ─── Handler principal ───────────────────────────────────────────────────────

export const POST = async (request: Request) => {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const text = await request.text();
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_KEY!,
    );
  } catch (error) {
    // Assinatura inválida — não fazer retry
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error("[Stripe Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.error("[Stripe Webhook] Failed to construct event:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "checkout.session.expired":
        await handleCheckoutExpired(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Erro de negócio/DB — retorna 500 para o Stripe tentar novamente
    console.error(
      `[Stripe Webhook] Error handling event ${event.type}:`,
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};