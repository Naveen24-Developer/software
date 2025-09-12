export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  referredBy?: string;
  aadhar?: string;
};

export type Product = {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  rate_unit: 'day' | 'hour' | 'month';
  imageUrl: string;
  imageHint: string;
};

export type Order = {
  id: string;
  customerName: string;
  deliveryDate: string;
  returnDate: string;
  totalAmount: number;
  status: 'Active' | 'Returned' | 'Cancelled';
};

export type Vehicle = {
  id: string;
  number: string;
};
