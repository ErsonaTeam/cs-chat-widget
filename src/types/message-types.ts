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
  __typename: "MediaImage";
}

export interface RoomOption {
  id: string;
  name: string;
  description: string;
  adultsCapacity: number;
  childrenCapacity: number;
  cribsCapacity: number;
  medias: MediaImage[];
  bestPrice: string;
  currencyCode: string;
}