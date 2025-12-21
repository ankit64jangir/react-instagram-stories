import { ComponentType } from 'react';

export type StoryItemType = 'image' | 'video' | 'text' | 'component' | 'pdp';

export interface StoryItemMetadata {
  [key: string]: any;
}

export interface StoryItemControls {
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  setDuration: (ms: number) => void;
}

export interface BaseStoryItem {
  id: string;
  type: StoryItemType;
  duration?: number; // milliseconds
  metadata?: StoryItemMetadata;
  alt?: string;
  caption?: string;
}

export interface ImageStoryItem extends BaseStoryItem {
  type: 'image';
  src: string;
  duration?: number; // default 5000ms
}

export interface VideoStoryItem extends BaseStoryItem {
  type: 'video';
  src: string;
  duration?: number; // auto-detected from video
}

export interface TextStoryItem extends BaseStoryItem {
  type: 'text';
  text: string;
  backgroundColor?: string;
  textColor?: string;
  duration?: number; // default 5000ms
}

export interface ComponentStoryItem extends BaseStoryItem {
  type: 'component';
  component: ComponentType<StoryItemControls>;
  duration?: number;
}

export interface VehicleData {
  availabilityStatus: string;
  basic_warranty_period: {
    unit: string;
    value: number;
  };
  brand: string;
  buy_back: {
    year_1: {
      unit: string;
    };
    year_2: {
      unit: string;
    };
  };
  c2c: {
    friday_slots: string[];
    inspection_report_path: string;
    inspection_type: string;
    kyc_type: string;
    monday_slots: string[];
    no_of_challans: number;
    pincode: number;
    saturday_slots: string[];
    seller_id: number;
    seller_kyc_status: string;
    seller_name: string;
    sunday_slots: string[];
    test_ride_address: string;
    test_ride_map_link: string;
    test_ride_place_name?: string;
    thursday_slots: string[];
    total_challan_amount: number;
    tuesday_slots: string[];
    vehicle_kyc_status: string;
    wednesday_slots: string[];
    zoho_buy_lead_id: string;
  };
  city: string;
  colour: string;
  createdOn: string;
  drivexAssured: boolean;
  geo_location: number[];
  geolocation: string;
  golden_mmv_id: number;
  id: string;
  imagePaths: string[];
  inventory_category: string;
  inventory_type: string;
  is_eligible_for_buy_back: boolean;
  is_eligible_for_extended_warranty: boolean;
  keyHighlights: {
    engineCapacity: {
      displayValue: string;
      unit: string;
      value: number;
    };
    fuelTankCapacity: {
      displayValue: string;
      unit: string;
      value: number;
    };
    maxPower: {
      displayValue: string;
      unit: string;
      value: string;
    };
    topSpeed: {
      displayValue: string;
      unit: string;
      value?: number;
    };
  };
  kmDriven: {
    displayValue: string;
    unit: string;
    value: number;
  };
  locality: string;
  make_model: string;
  manufactureYear: number;
  modelName: string;
  objectID: string;
  overview: {
    kmDriven: {
      displayValue: string;
      unit: string;
      value: number;
    };
    makeYear: {
      displayValue: number;
      unit: string;
      value: number;
    };
    ownership: {
      displayValue: string;
      unit: string;
      value: number;
    };
    rcStatus: {
      displayValue: string;
      unit: string;
    };
    registrationYear: {
      displayValue: number;
      unit: string;
      value: number;
    };
    rto: {
      displayValue: string;
      unit: string;
      value: string;
    };
  };
  ownerShip: number;
  popularity: number;
  price: {
    displayValue: string;
    unit: string;
    value: number;
  };
  retail_inventory_id: number;
  vehicleId: number;
  vehicleName: string;
  vehicleType: string;
}

export interface PDPStoryItem extends BaseStoryItem {
  type: 'pdp';
  vehicleId: number;
  vehicleData: VehicleData;
  duration?: number; // default 5000ms
}

export type StoryItem = ImageStoryItem | VideoStoryItem | TextStoryItem | ComponentStoryItem | PDPStoryItem;

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  stories: StoryItem[];
  hasUnreadStories?: boolean;
}

export interface StoriesData {
  users: User[];
}

export interface ViewerState {
  isOpen: boolean;
  currentUserIndex: number;
  currentStoryIndex: number;
}

export interface GestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
}
