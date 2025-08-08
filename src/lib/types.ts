export interface User {
  uid: string;
  shop_owner_name: string;
  mobile_number: string;
  email_address: string;
  shop_name: string;
  shop_address: string;
  code_balance: number;
}

export interface Customer {
  id: string;
  full_name: string;
  mobile_number: string;
  email_address: string;
  phone_model: string;
  imei_1: string;
  imei_2: string;
  uid: string;
  status: "Active" | "Locked" | "Completed" | "Pending" | "Unlocked" | "Removed";
}

export interface EmiDetails {
  id: string;
  customerId: string;
  product_name: string;
  price: number;
  processing_fee: number;
  down_payment: number;
  total_emi: number;
  number_of_emi: number;
  emi_monthly_amount: number;
  nid_front: string; // URL
  nid_back: string; // URL
  live_photo: string; // URL
  created_time: Date;
}
