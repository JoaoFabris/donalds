"use client";

import { OrderStatus, Prisma } from "@prisma/client";
import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/helpers/format-currency";

interface OrderListProps {
  orders: Array<
    Prisma.OrderGetPayload<{
      include: {
        restaurant: {
          select: {
            name: true;
            avatarImageUrl: true;
          };
        };
        orderProducts: {
          include: {
            product: true;
          };
        };
      };
    }>
  >;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; bgColor: string }> =
  {
    PENDING: {
      label: "Pendente",
      bgColor: "bg-yellow-200 text-yellow-700",
    },
    IN_PREPARATION: {
      label: "Em preparo",
      bgColor: "bg-blue-200 text-blue-700",
    },
    READY_FOR_PICKUP: {
      label: "Pronto para retirada",
      bgColor: "bg-purple-200 text-purple-700",
    },
    COMPLETED: {
      label: "Finalizado",
      bgColor: "bg-green-500 text-white",
    },
    CANCELLED: {
      label: "Cancelado",
      bgColor: "bg-red-200 text-red-700",
    },
  };

const getStatusLabel = (status: OrderStatus): string => {
  return STATUS_CONFIG[status]?.label || "Desconhecido";
};

const getStatusColor = (status: OrderStatus): string => {
  return STATUS_CONFIG[status]?.bgColor || "bg-gray-200 text-gray-700";
};

const OrderList = ({ orders }: OrderListProps) => {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();


  const handleBackClick = () => {
    router.push(`/${slug}/menu`);
  };

  return (
    <div className="space-y-6 p-6">
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full"
        onClick={handleBackClick}
      >
        <ChevronLeftIcon />
      </Button>
      <div className="flex items-center gap-3">
        <ScrollTextIcon />
        <h2 className="text-lg font-semibold">Meus Pedidos</h2>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum pedido encontrado</p>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="space-y-4 p-5">
              <div
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                  order.status,
                )}`}
              >
                {getStatusLabel(order.status)}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative h-5 w-5">
                  <Image
                    src={order.restaurant.avatarImageUrl}
                    alt={order.restaurant.name}
                    className="rounded-sm"
                    fill
                  />
                </div>
                <p className="text-sm font-semibold">{order.restaurant.name}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                {order.orderProducts.map((orderProduct) => (
                  <div key={orderProduct.id} className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-xs font-semibold text-white">
                      {orderProduct.quantity}
                    </div>
                    <p className="text-sm">{orderProduct.product.name}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default OrderList;