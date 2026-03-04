export interface menuDataProps {
  menuData: { name: string; href: string }[];
}

export type TicketType = {
  name: string;
  description?: string;
  price: number;
  remaining: number;
  total: number;
  buyHref?: string;
  buttonLabel?: string;
};

export type EventCardProps = {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  dateTimeText: string;
  locationText: string;
  dressCode?: string;
  policies?: string[];
  ticketTypes: TicketType[];
};