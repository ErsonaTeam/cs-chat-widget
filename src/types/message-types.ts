export enum ChatWidgetMessageType {
  AGENT_MESSAGE = 'CHAT_WIDGET_AGENT_MESSAGE',
  SEND_MESSAGE = 'CHAT_WIDGET_SEND_MESSAGE',
  RESET_CHAT = 'CHAT_WIDGET_RESET_CHAT',
}

/**
 * Form IDs that can be sent from the backend.
 * Each ID maps to a hardcoded form component in the widget.
 *
 * Used both as `formId` in incoming render messages and as `formType`
 * in outgoing submission payloads — must stay in sync with the backend
 * `FattalFormId` enum in embeddings-encoder.
 */
export enum WidgetFormId {
  CONTACT_INFO = 'contact_info',
  FATTAL_ID_COLLECT = 'fattal_id_collect',
  FATTAL_OTP_VERIFY = 'fattal_otp_verify',
  FATTAL_CANCELLATION_CONFIRM = 'fattal_cancellation_confirm',
  FATTAL_CONTACT_UPDATE = 'fattal_contact_update',
  GUESTY_GUEST_DETAILS = 'guesty_guest_details',
}

/**
 * Gallery image for Fattal display
 */
export interface FattalGalleryImage {
  url: string;
  description: string | null;
}

/**
 * Room feature for Fattal display
 */
export interface FattalRoomFeature {
  name: string;
  iconUrl: string | null;
}

/**
 * Package price option for Fattal display
 */
export interface FattalPackagePrice {
  hostingBase: string;
  totalBasePrice: number | null;
  totalPrice: number;
  clubTotalPrice: number | null;
  currency: string;
  availableRooms: number;
}

/**
 * Room package for Fattal display
 */
export interface FattalRoomPackage {
  packageId: number;
  packageName: string;
  policyName: string | null;
  freeCancelDate: string | null;
  prices: FattalPackagePrice[];
}

/**
 * Fattal Hotel data for display in carousel
 */
export interface FattalHotel {
  hotelId: string;
  hotelName: string;
  city: string | null;
  shortDescription: string | null;
  minPrice: number | null;
  currency: string;
  imageUrl: string;
  gallery?: FattalGalleryImage[];
  tags?: string[];
  benefits?: string[];
}

/**
 * Fattal Room data for display in carousel
 */
export interface FattalRoom {
  roomCode: string;
  name: string;
  description: string | null;
  size: string | null;
  minPrice: number | null;
  currency: string;
  imageUrl: string;
  gallery?: FattalGalleryImage[];
  features?: FattalRoomFeature[];
  composition?: string | null;
  packages?: FattalRoomPackage[];
}

/**
 * Listing data for display in carousel (Hostaway listings)
 */
export interface WidgetListing {
  listingMapId: string;
  name: string;
  city: string;
  personCapacity: number;
  bedroomsNumber: number;
  bathroomsNumber: number;
  averageNightlyPrice: number;
  totalPrice: number;
  currency: string;
  averageReviewRating: number | null;
  description: string;
  imageUrl: string;
  gallery?: FattalGalleryImage[];
}

/**
 * Single image inside a gallery payload.
 */
export interface WidgetGalleryImage {
  url: string;
  description: string | null;
}

/**
 * Gallery payload sent from the agent for inline display in a chat bubble.
 * Opens a fullscreen lightbox on tap.
 */
export interface WidgetGallery {
  type: 'gallery';
  hotelId: string;
  hotelName: string;
  roomTypeId?: string;
  roomName?: string;
  images: WidgetGalleryImage[];
}