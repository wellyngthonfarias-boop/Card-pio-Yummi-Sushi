export type DeliveryZone = {
  id: string;
  name: string;
  feeCents: number;
};

export type DeliveryAddress = {
  customerName?: string;
  street: string;
  number: string;
  complement: string;
  postalCode: string;
  zoneId: string;
};

export type ResolvedDelivery = {
  address: DeliveryAddress;
  neighborhood: string;
  feeCents: number;
};

export const emptyDeliveryAddress: DeliveryAddress = {
  street: "", number: "", complement: "", postalCode: "", zoneId: "",
};
