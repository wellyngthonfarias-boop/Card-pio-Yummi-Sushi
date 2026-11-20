export type DeliveryZone = {
  id: string;
  name: string;
  feeCents: number;
};

export type DeliveryAddress = {
  street: string;
  number: string;
  postalCode: string;
  zoneId: string;
};

export type ResolvedDelivery = {
  address: DeliveryAddress;
  neighborhood: string;
  feeCents: number;
};

export const emptyDeliveryAddress: DeliveryAddress = {
  street: "", number: "", postalCode: "", zoneId: "",
};
