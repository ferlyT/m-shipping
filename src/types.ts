export interface Customer {
  Id: number;
  Name: string;
  Email?: string;
  Phone?: string;
  Address?: string;
  CreatedAt: string;
}

export interface SuratJalan {
  Id: number;
  Number: string;
  CustomerId: number;
  CustomerName?: string;
  Date: string;
  Status: string;
  Notes?: string;
  CreatedAt: string;
}

export interface Invoice {
  Id: number;
  Number: string;
  CustomerId: number;
  CustomerName?: string;
  SuratJalanId?: number;
  Date: string;
  DueDate?: string;
  TotalAmount: number;
  Status: string;
  CreatedAt: string;
}
