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
  Eye, 
  Hash, 
  User, 
  Briefcase, 
  Phone, 
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CreditCard,
  AlertCircle,
  AlertTriangle,
  Circle
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingState";
import { Customer } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "../locales/LanguageContext";

export default function Customers() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  const [sortBy, setSortBy] = React.useState("status");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  const totalPages = Math.ceil(total / pageSize) || 1;

  // Fetch data
  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      search,
      sortBy,
      sortOrder,
    });

    fetch(`/api/customers?${params}`)
      .then((res) => res.json())
      .then((res) => {
        setCustomers(res.data || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setCustomers([]);
        setTotal(0);
        setLoading(false);
      });
  }, [page, pageSize, search, sortBy, sortOrder]);

  // Reset page saat search berubah
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

  const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, total);

  // Helper function to highlight search text
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

  return (
    <div className="space-y-4 pb-6 px-1">
      <div className="flex flex-col gap-0.5">
        <h1 className="display-sm text-on-surface">{t("customers.title")}</h1>
        <p className="body-sm text-on-surface-variant italic">{t("customers.subtitle")}</p>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={t("customers.searchPlaceholder")}
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
                <th className="px-4 py-3 text-left">{t("customers.table.orgCode")}</th>
                <th
                  onClick={() => handleSort("fdCustName")}
                  className="px-4 py-3 text-left cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {t("customers.table.accountName")} <SortIcon field="fdCustName" />
                </th>
                <th
                  onClick={() => handleSort("fdContact")}
                  className="px-4 py-3 text-left cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {t("customers.table.activity")} <SortIcon field="fdContact" />
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
                  <td colSpan={5} className="py-20">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c, i) => (
                  <tr key={c.fdCustCode || i} className="group transition-colors hover:bg-surface-container-low/40">
                    <td className="px-4 py-3">
                       <span className="font-mono text-[10px] font-semibold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md">
                          {c.fdCustCode?.trim() || "-"}
                       </span>
                    </td>
                    <td className="px-4 py-3">
                       <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{highlightText(c.fdCustName)}</span>
                          <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-tighter">Verified Enterprise</span>
                       </div>
                    </td>
                    <td className="px-4 py-3">
                       <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                          {highlightText(c.fdContact)}
                       </div>
                    </td>
                    <td className="px-4 py-3">
                       {(() => {
                          const isDiscontinued = c.fdDiscontinued === 1;
                          
                          if (isDiscontinued) {
                            return (
                              <div className="flex items-center gap-2 text-error font-bold label-md uppercase tracking-tight">
                                <XCircle className="h-4 w-4" />
                                DISCONTINUED
                              </div>
                            );
                          }

                          const status = c.Status?.toString().trim().toUpperCase();
                          let colorClass = "text-on-surface-variant"; 
                          let Icon = AlertCircle;
                          
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
                            <div className={cn("flex items-center gap-2 font-bold label-md uppercase tracking-tight", colorClass)}>
                              <Icon className="h-4 w-4" />
                              {c.Status || "NO STATUS"}
                            </div>
                          );
                       })()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 shadow-none"
                        onClick={() => navigate(`/customers/${c.fdCustCode?.trim()}`)}
                      >
                        Navigate
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-on-surface-variant/50 body-sm italic">
                    No matching records documented in registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
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