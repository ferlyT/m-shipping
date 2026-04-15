import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Receipt, Calendar, User, DollarSign, AlertCircle } from "lucide-react";
import { Invoice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Invoices() {
  const [search, setSearch] = React.useState("");
  const [items, setItems] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredItems = items.filter((item) =>
    item.Number.toLowerCase().includes(search.toLowerCase()) ||
    item.CustomerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm">Lihat data tagihan dan pembayaran.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nomor invoice atau customer..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Memuat data...</div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card key={item.Id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-none">{item.Number}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        <span>{item.CustomerName}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={item.Status === 'Paid' ? 'default' : 'destructive'}
                    className="text-[10px]"
                  >
                    {item.Status === 'Paid' ? (
                      <DollarSign className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1" />
                    )}
                    {item.Status}
                  </Badge>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Tgl: {format(new Date(item.Date), "dd/MM/yy")}</span>
                    </div>
                    <div className="text-sm font-bold text-primary">
                      Rp {item.TotalAmount.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs">Bayar</Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg border border-dashed">
            <p className="text-muted-foreground">Tidak ada invoice ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
