export interface Customer {
  fdCustCode: string;
  fdCustName: string;
  fdContact?: string;
  fdHP?: string;
  fdAddr1?: string;
  fdAddr2?: string;
  fdAlamatPengiriman?: string;
  fdTelp?: string;
  fdEmail?: string;
  fdCityName?: string;
  fdGroupName?: string;
  fdNote?: string;
  fdKeterangan?: string;
  fdEmpName?: string;
  fdSalesNM?: string;
  fdDiscontinued?: number;
  fdStatus?: number;
  fdBroker?: number;
  fdNotifUtama?: number;
  Status?: string;
  
  // Delivery details
  fdNamaPengiriman?: string;
  fdHpPengiriman?: string;
  fdKotaPengiriman?: string;
  fdKetPengiriman?: string;
  fdEks?: string;

  // Billing details
  fdBillTo?: string;
  fdPic?: string;
  fdBillAddr1?: string;
  fdBillCityName?: string;
  fdKeteranganPenagihan?: string;
  fdNotifPenagihan?: number;
  fdKodePenagih?: string;
  
  // existing
  fdHpPenagihan?: string;
  fdEmailPenagihan?: string;
  fdLoad?: string;
  fdUpdate?: string;
  fdCreated?: string;
  fdFinCode?: string;
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
  fdListType?: number;
}

export interface Invoice {
  fdInvNo: string;
  fdInvDate: string;
  fdCustCode: string;
  CustomerName?: string;
  fdJumlah1: number;
  fdListType: number;
}
