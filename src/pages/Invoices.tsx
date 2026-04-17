import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Calendar,
  User,
  Plane,
  Ship,
  Hash,
  CreditCard,
  Eye,
  Circle,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { Invoice } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingState";
import { cn } from "@/lib/utils";
import { useLanguage } from "../locales/LanguageContext";

export default function Invoices() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  const [sortBy, setSortBy] = React.useState("fdInvDate");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const totalPages = Math.ceil(total / pageSize) || 1;

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      search,
      sortBy,
      sortOrder,
    });

    fetch(`/api/invoices?${params}`)
      .then((res) => res.json())
      .then((res) => {
        setInvoices(res.data || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setInvoices([]);
        setTotal(0);
        setLoading(false);
      });
  }, [page, pageSize, search, sortBy, sortOrder]);

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronsUpDown className="inline h-3 w-3 ml-1 opacity-30" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="inline h-4 w-4 text-primary ml-1" />
    ) : (
      <ChevronDown className="inline h-4 w-4 text-primary ml-1" />
    );
  };

  const highlightText = (text: string | undefined | null) => {
    if (!text) return "-";
    const trimmedText = text.trim();
    if (!search.trim()) return trimmedText;

    const parts = trimmedText.split(new RegExp(`(${search.trim()})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === search.trim().toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded-sm">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4 pb-6 px-1">
      <div className="flex flex-col gap-0.5">
        <h1 className="display-sm text-on-surface">{t("invoices.title")}</h1>
        <p className="body-sm text-on-surface-variant italic">{t("invoices.subtitle")}</p>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={t("invoices.searchPlaceholder")}
          className="pl-11 h-9 text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-soft overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold tracking-[0.1em]">
                <th
                  onClick={() => handleSort("fdInvNo")}
                  className="px-4 py-3 text-left cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {t("invoices.table.ref")} <SortIcon field="fdInvNo" />
                </th>
                <th
                  onClick={() => handleSort("fdInvDate")}
                  className="px-4 py-3 text-left cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {t("invoices.table.date")} <SortIcon field="fdInvDate" />
                </th>
                <th className="px-4 py-3 text-left">{t("invoices.table.pool")}</th>
                <th
                  onClick={() => handleSort("fdCustName")}
                  className="px-4 py-3 text-left cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {t("invoices.table.account")} <SortIcon field="fdCustName" />
                </th>
                <th
                  onClick={() => handleSort("fdJumlah1")}
                  className="px-4 py-3 text-right cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {t("invoices.table.valuation")} <SortIcon field="fdJumlah1" />
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="px-4 py-3 text-left cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {t("common.status")} <SortIcon field="status" />
                </th>
                <th className="px-4 py-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y-0">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : invoices.length > 0 ? (
                invoices.map((inv, i) => (
                  <tr key={inv.fdInvNo || i} className="group transition-colors hover:bg-surface-container-low/40">
                    <td className="px-4 py-3">
                       <span className="font-mono text-[10px] font-semibold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md">
                          {inv.fdInvNo?.trim() || "-"}
                       </span>
                    </td>
                    <td className="px-4 py-3">
                       <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                          {inv.fdInvDate ? format(new Date(inv.fdInvDate), "dd MMM yyyy") : "-"}
                       </div>
                    </td>
                    <td className="px-4 py-3">
                      {inv.fdListType === 1 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-primary label-md font-bold uppercase tracking-tight">
                          <Plane className="h-3.5 w-3.5" /> AIR
                        </div>
                      ) : inv.fdListType === 2 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container label-md font-bold uppercase tracking-tight">
                          <Ship className="h-3.5 w-3.5" /> SEA
                        </div>
                      ) : (
                        <span className="text-on-surface-variant/30">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                       <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{highlightText(inv.CustomerName)}</span>
                          <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-tighter">Verified Client</span>
                       </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <div className="font-bold text-primary font-mono tracking-tighter">
                          Rp {inv.fdJumlah1?.toLocaleString("id-ID")}
                       </div>
                    </td>
                    <td className="px-4 py-3">
                        {(() => {
                           const status = (inv.Status as string)?.toString().trim().toUpperCase();
                           let colorClass = "text-on-surface-variant"; 
                           let Icon = Circle;
                           
                           if (status === "OK") {
                                colorClass = "text-success";
                                Icon = CheckCircle2;
                           } else if (status === "COD") {
                                colorClass = "text-primary";
                                Icon = CreditCard;
                           } else if (status === "WARNING" || status === "URGENT") {
                                colorClass = "text-warning";
                                Icon = AlertTriangle;
                           } else if (status === "BLOCKED") {
                                colorClass = "text-error";
                                Icon = XCircle;
                           }

                           return (
                             <div className={cn("inline-flex items-center gap-2 font-bold label-md uppercase tracking-tight", colorClass)}>
                               <Icon className="h-4 w-4" />
                               {inv.Status || "-"}
                             </div>
                           );
                        })()}
                     </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 shadow-none"
                        onClick={() => navigate(`/invoices/${inv.fdInvNo?.toString().trim()}`)}
                      >
                        {t("common.navigate")}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-on-surface-variant/50 body-sm italic">
                    {t("common.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 text-sm text-muted-foreground pt-2">
        <div className="flex items-center gap-2">
          <span>{t("common.showRows")} :</span>
          <select
            className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm cursor-pointer hover:bg-muted transition-colors outline-none"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 25, 50, 100].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium text-foreground">
            {startItem} - {endItem} {t("common.of")} {total}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
