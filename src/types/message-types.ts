export enum ChatWidgetMessageType {
  AGENT_MESSAGE = 'CHAT_WIDGET_AGENT_MESSAGE',
  SEND_MESSAGE = 'CHAT_WIDGET_SEND_MESSAGE',
}

export enum PusherEventType {
  AGENT_MESSAGE = 'agent.message',
}

export interface MediaImage {
  bigUrl: string;
  mediumUrl: string;
  smallUrl: string;
  type: "MediaImage";
}

export interface CancellationPolicy {
  notRefundable: boolean;
  withoutChargeBeforeHours: number | null;
}

export interface MealPlan {
  name: string;
  type: string;
}

export interface Price {
  amount: number;
  amountIncludesTaxes: boolean;
  currencyCode: string;
  taxesPercent: number;
}

export interface Allocation {
  adults: number;
  children: number[];
}

export interface Offer {
  id: string | null;
  name: string | null;
  descriptionHTML: string;
  hasFlexiblePolicy: boolean;
  hoursBeforeUrgencyMessage: number;
  bookableRoomsRanges: unknown[];
  isLoyaltyClubOffer: boolean;
  availableQuantity: number;
  roomTypeAvailableQuantity: number;
  price: Price;
  basePrice: Price;
  cancellationPolicy: CancellationPolicy;
  mealPlan: MealPlan;
}

export interface RoomOptionDetail {
  signature: string;
  allocation: Allocation;
  offer: Offer;
}

export interface RoomOption {
  id: string;
  name: string;
  description: string;
  adultsCapacity: number;
  childrenCapacity: number;
  cribsCapacity: number;
  medias: MediaImage[];
  options: RoomOptionDetail[];
}