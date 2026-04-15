import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, User, Phone, Mail, MapPin } from "lucide-react";
import { Customer } from "@/types";
import { Badge } from "@/components/ui/badge";

export default function Customers() {
  const [search, setSearch] = React.useState("");
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.Name.toLowerCase().includes(search.toLowerCase()) ||
    c.Email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm">Lihat data pelanggan Anda.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau email..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Memuat data...</div>
        ) : filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <Card key={customer.Id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-none">{customer.Name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{customer.Email || "No Email"}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">ID: {customer.Id}</Badge>
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{customer.Phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{customer.Address || "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg border border-dashed">
            <p className="text-muted-foreground">Tidak ada customer ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
