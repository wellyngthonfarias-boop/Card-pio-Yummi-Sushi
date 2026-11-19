export type ServiceMode = {
  id: "presencial" | "delivery";
  title: string;
  description: string;
};

export type Restaurant = {
  name: string;
  description: string;
  serviceModes: readonly ServiceMode[];
};
