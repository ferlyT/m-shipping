import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Printer,
  Calendar,
  FileText,
  User,
  MapPin,
  CreditCard,
  Truck,
  Briefcase,
  Sun,
  Moon,
  Phone,
  Hash,
  Package,
  ShieldCheck
} from "lucide-react";
import { format } from "date-fns";
import { formatRupiahShort } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingState";
import { useLanguage } from "../locales/LanguageContext";

export default function InvoiceDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch Header
    fetch(`/api/invoices/${id}`)
      .then((res) => res.json())
      .then((data) => setInvoice(data))
      .catch((err) => console.error(err));

    // Fetch Items
    fetch(`/api/invoices/${id}/items`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!invoice) return <div className="p-8 text-center text-error">{t("common.noData")}</div>;

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/invoices")}
          className="w-fit gap-2 -ml-2 text-on-surface-variant hover:text-primary transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="label-md uppercase tracking-wider">{t("invoices.detail.hub")}</span>
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 rounded-[12px] bg-white" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            {t("invoices.detail.print")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Main Info */}
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-none shadow-soft overflow-hidden bg-surface-container-lowest">
            <CardHeader className="bg-surface-container-low/50 pb-8 pt-8">
              <div className="flex items-center justify-between flex-wrap gap-6 px-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="display-sm text-on-surface">{invoice.fdInvNo?.toString().trim()}</h1>
                  </div>
                  <p className="body-sm text-on-surface-variant font-medium ml-12 italic">
                    {t("invoices.detail.authorized")}
                  </p>
                </div>
                <div className="bg-white rounded-[16px] px-6 py-4 text-right shadow-soft border border-surface-container-low">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant/50 tracking-widest mb-1">{t("invoices.detail.issuance")}</p>
                  <p className="title-md text-on-surface font-bold">
                    {invoice.fdInvDate ? format(new Date(invoice.fdInvDate), "dd MMM yyyy") : t("common.pending")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-10 px-10 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                <InfoItem icon={User} label={t("invoices.detail.debtor")} value={invoice.CustomerName} />
                <div className="flex gap-10">
                   <InfoItem icon={Briefcase} label={t("invoices.detail.secondary")} value={invoice.fdSalesNM} />
                   <div className="space-y-2">
                      <p className="label-md font-bold uppercase tracking-wider text-on-surface-variant/60 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {t("common.status")}
                      </p>
                      {(() => {
                        const status = invoice.Status?.toString().trim().toUpperCase();
                        let colorClass = "text-on-surface-variant"; 
                        let dotClass = "bg-on-surface-variant/40";
                        
                        if (status === "OK") {
                          colorClass = "text-success";
                          dotClass = "bg-success";
                        } else if (status === "COD") {
                          colorClass = "text-primary";
                          dotClass = "bg-primary";
                        } else if (status === "WARNING" || status === "URGENT") {
                          colorClass = "text-warning";
                          dotClass = "bg-warning";
                        } else if (status === "BLOCKED") {
                          colorClass = "text-error";
                          dotClass = "bg-error";
                        }

                        return (
                          <div className={cn("inline-flex items-center gap-2 label-md font-bold uppercase tracking-tight", colorClass)}>
                            <span className={cn("w-2 h-2 rounded-full", dotClass)} />
                            {invoice.Status || t("common.noStatus")}
                          </div>
                        );
                      })()}
                   </div>
                </div>
                <InfoItem icon={MapPin} label={t("customers.detail.address")} value={invoice.fdAddr1} span={2} />
                <div className="grid grid-cols-2 gap-8 col-span-2 pt-4 border-t border-surface-container-low">
                  <InfoItem icon={Phone} label={t("invoices.detail.contact")} value={invoice.fdTelp || "-"} />
                  <InfoItem icon={CreditCard} label={t("invoices.detail.terms")} value={t("invoices.detail.creditTerms").replace("{days}", (invoice.fdPayTerm || 0).toString())} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items Table */}
          <Card className="border-none shadow-soft overflow-hidden bg-surface-container-lowest">
            <CardHeader className="bg-surface-container-low/30 pt-6 pb-6">
                <CardTitle className="label-md font-bold uppercase tracking-widest flex items-center gap-2 text-on-surface-variant">
                    <Package className="h-4 w-4 text-primary" />
                    {t("invoices.detail.ledger")}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-low/50 text-on-surface-variant uppercase text-[10px] font-bold tracking-widest">
                      <th className="px-8 py-4 text-left">{t("invoices.detail.sku")}</th>
                      <th className="px-8 py-4 text-left">{t("invoices.detail.desc")}</th>
                      <th className="px-8 py-4 text-center">{t("invoices.detail.unit")}</th>
                      <th className="px-8 py-4 text-right">{t("invoices.detail.qty")}</th>
                      <th className="px-8 py-4 text-right">{t("invoices.detail.rate")}</th>
                      <th className="px-8 py-4 text-right">{t("invoices.detail.allocation")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-0">
                    {items.length > 0 ? items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-8 py-6 font-mono text-[11px] font-bold text-on-surface-variant bg-surface-container-low/30">{item.fdItemCode?.toString().trim() || "-"}</td>
                        <td className="px-8 py-6 font-bold text-on-surface">{item.fdItemName}</td>
                        <td className="px-8 py-6 text-center">
                            <span className="bg-surface-container-high px-3 py-1 rounded-full label-md font-bold uppercase">
                                {item.fdSatuan?.toString().trim() || "-"}
                            </span>
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-on-surface">{item.fdQty}</td>
                        <td className="px-8 py-6 text-right font-mono text-on-surface-variant">{item.fdItemPrice?.toLocaleString('id-ID')}</td>
                        <td className="px-8 py-6 text-right font-bold text-primary font-mono">{item.fdTotal?.toLocaleString('id-ID')}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-on-surface-variant/50 body-sm italic">
                            {t("common.noData")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Logistical Metadata */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-soft bg-surface-container-lowest overflow-hidden">
            <CardHeader className="bg-surface-container-low/50 pt-6 pb-6 px-8">
              <CardTitle className="label-md font-bold uppercase tracking-widest flex items-center gap-2 text-on-surface-variant">
                {t("customers.detail.finRegistry")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <InfoItem label={t("invoices.detail.branch")} value={invoice.fdBranchCode || "-"} />
                <DetailBadge label={t("suratJalan.table.mode")} value={invoice.fdTypeListType === 1 ? "AIR" : "SEA"} />
              </div>
              
              <div className="space-y-6 pt-6 border-t border-surface-container-low">
                 <InfoItem label={t("suratJalan.table.marking")} value={invoice.fdMarkingCode?.toString().trim()} />
                 <InfoItem label={t("invoices.detail.personnel")} value={invoice.fdCreatedBy} />
              </div>

              <div className="pt-8 border-t border-surface-container-low">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant/50 tracking-widest mb-4">{t("invoices.detail.valuation")}</p>
                <div className="display-sm text-primary font-black tracking-tighter">
                  <span className="text-xl font-bold opacity-50 mr-2">IDR</span>
                  {invoice.fdJumlah1?.toLocaleString('id-ID')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft bg-surface-container-lowest">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Truck className="h-6 w-6" />
                <span className="label-md font-bold uppercase tracking-widest">{t("invoices.detail.analysis")}</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant/60">{t("invoices.detail.commodity")}</span>
                  <span className="label-md font-bold text-on-surface">{invoice.fdComodityName}</span>
                </div>
                <div className="bg-surface-container-low/30 p-4 rounded-[12px] space-y-2">
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant/60">{t("invoices.detail.notes")}</p>
                    <p className="body-sm text-on-surface italic">{invoice.fdDescr || (t("common.noData"))}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft bg-primary text-white p-8">
             <div className="space-y-4">
                <ShieldCheck className="h-6 w-6 opacity-70" />
                <p className="label-md font-bold uppercase tracking-widest opacity-80">{t("invoices.detail.audit")}</p>
                <p className="body-sm leading-relaxed">{t("invoices.detail.auditDesc")}</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailBadge({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">{label}</p>
      <span className="inline-flex bg-surface-container-high px-3 py-1 rounded-full label-md font-bold text-on-surface">
        {value}
      </span>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, span = 1 }: { icon?: any, label: string, value: any, span?: number }) {
  const spanClass = span === 3 ? "col-span-3" : span === 2 ? "col-span-2" : "col-span-1";
  return (
    <div className={`space-y-1.5 ${spanClass}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="text-sm font-medium text-foreground break-words">{value || "-"}</p>
    </div>
  );
}
