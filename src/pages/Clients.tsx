import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Plus, Search, MoreHorizontal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddClientDialog } from "@/components/AddClientDialog";

const TABS = [
  { key: "all", label: "All Clients" },
  { key: "ndis", label: "NDIS" },
  { key: "aged_care", label: "Aged Care" },
  { key: "other", label: "Other" },
];

function getFundingCategory(fundingType: string | null): string {
  if (!fundingType) return "other";
  if (fundingType === "ndis") return "ndis";
  if (["home_care", "aged_care", "chsp", "hvp"].includes(fundingType)) return "aged_care";
  return "other";
}

export default function Clients() {
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const { data: clientsData = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    let list = clientsData;
    if (activeTab !== "all") {
      list = list.filter((c) => getFundingCategory(c.funding_type) === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.first_name.toLowerCase().includes(q) ||
          c.last_name.toLowerCase().includes(q) ||
          (c.ndis_number && c.ndis_number.toLowerCase().includes(q))
      );
    }
    return list;
  }, [clientsData, activeTab, search]);

  const counts = useMemo(() => {
    const c = { all: clientsData.length, ndis: 0, aged_care: 0, other: 0 };
    clientsData.forEach((cl) => {
      const cat = getFundingCategory(cl.funding_type);
      c[cat as keyof typeof c]++;
    });
    return c;
  }, [clientsData]);

  return (
    <AppLayout title="Client Management">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 rounded-lg bg-secondary/50 p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-60">
                {counts[tab.key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search clients..."
            />
          </div>
          <button onClick={() => setShowAdd(true)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Add Client
          </button>
        </div>

        <AddClientDialog open={showAdd} onClose={() => setShowAdd(false)} />

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-card p-12 shadow-card border border-border/50 text-center">
            <p className="text-muted-foreground text-sm">
              {clientsData.length === 0
                ? 'No clients yet. Click "Add Client" to get started.'
                : "No clients match your filters."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c, i) => {
              const category = getFundingCategory(c.funding_type);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl bg-card p-5 shadow-card border border-border/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-card-foreground">{c.first_name} {c.last_name}</h3>
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${
                          category === "ndis"
                            ? "bg-primary/10 text-primary"
                            : category === "aged_care"
                            ? "bg-accent/50 text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {category === "ndis" ? "NDIS" : category === "aged_care" ? "Aged Care" : "Other"}
                        </span>
                      </div>
                      {(c as any).preferred_name && <p className="text-xs text-muted-foreground mt-0.5">"{(c as any).preferred_name}"</p>}
                      {c.ndis_number && <p className="text-xs text-muted-foreground mt-0.5">NDIS: {c.ndis_number}</p>}
                    </div>
                    <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-card-foreground font-medium capitalize">{c.status}</span></div>
                    {c.funding_type && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Funding</span>
                        <span className="text-card-foreground font-medium capitalize">{c.funding_type.replace("_", " ")}</span>
                      </div>
                    )}
                    {c.phone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-card-foreground font-medium">{c.phone}</span></div>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
