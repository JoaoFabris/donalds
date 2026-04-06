"use server";

import { ConsumptionMethod } from "@prisma/client";
import { headers } from "next/headers";
import Stripe from "stripe";

import { removeCpfPunctuation } from "@/helpers/cpf";

import { CartProduct } from "../contexts/cart";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

export const createStripeCheckout = async ({
  orderId,
  slug,
  consumptionMethod,
  products,
  customerCpf,
}: {
  orderId: number;
  slug: string;
  consumptionMethod: ConsumptionMethod;
  products: CartProduct[];
  customerCpf: string;
}) => {
  const origin = (await headers()).get("origin");
  if (!origin) {
    throw new Error("Could not determine request origin");
  }

  const cpf = removeCpfPunctuation(customerCpf);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "boleto"],
    mode: "payment",
    success_url: `${origin}/${slug}/orders?cpf=${cpf}`,
    cancel_url: `${origin}/${slug}/menu?consumptionMethod=${consumptionMethod}`,
    metadata: {
      orderId,
    },
    line_items: products.map((product) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: product.name,
          images: [product.imageUrl],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity,
    })),
  });

  return { sessionId: session.id };
};