import { AppLayout } from "@/components/AppLayout";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, addWeeks, addDays } from "date-fns";
import { NewRosterDialog } from "@/components/roster/NewRosterDialog";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 14 }, (_, i) => i + 6);

export default function Roster() {
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const [rosterForm, setRosterForm] = useState<RosterForm | null>(null);

  const currentWeekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );

  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ["roster-timesheets", weekOffset],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timesheets")
        .select("*, staff:staff_id(first_name, last_name), client:client_id(first_name, last_name)")
        .gte("shift_date", format(currentWeekStart, "yyyy-MM-dd"))
        .lte("shift_date", format(currentWeekEnd, "yyyy-MM-dd"))
        .order("start_time");
      if (error) throw error;
      return data;
    },
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("id, first_name, last_name")
        .eq("status", "active")
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: clientList = [] } = useQuery({
    queryKey: ["client-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, first_name, last_name")
        .eq("status", "active")
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (form: RosterForm) => {
      const shiftDate = form.date;
      const startTime = `${shiftDate}T${form.startHour}:00`;
      const endTime = `${shiftDate}T${form.endHour}:00`;
      const { error } = await supabase.from("timesheets").insert({
        staff_id: form.staffId,
        client_id: form.clientId || null,
        shift_date: shiftDate,
        start_time: startTime,
        end_time: endTime,
        notes: form.notes || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Roster entry created!");
      queryClient.invalidateQueries({ queryKey: ["roster-timesheets"] });
      setRosterForm(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCellClick = (dayIndex: number, hour: number) => {
    const date = format(weekDates[dayIndex], "yyyy-MM-dd");
    setRosterForm(emptyForm(date, hour));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterForm?.staffId) {
      toast.error("Please select a staff member");
      return;
    }
    mutation.mutate(rosterForm);
  };

  // Map timesheets to grid positions
  const shiftsByCell = useMemo(() => {
    const map: Record<string, typeof timesheets> = {};
    timesheets.forEach((t) => {
      const dayIdx = weekDates.findIndex(
        (d) => format(d, "yyyy-MM-dd") === t.shift_date
      );
      if (dayIdx < 0) return;
      const startHour = t.start_time ? new Date(t.start_time).getHours() : null;
      if (startHour === null) return;
      const key = `${dayIdx}-${startHour}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [timesheets, weekDates]);

  return (
    <AppLayout title="Roster">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset((w) => w - 1)} className="h-8 w-8 rounded-lg border bg-card flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-foreground">
              {format(currentWeekStart, "MMM d")} – {format(currentWeekEnd, "MMM d, yyyy")}
            </span>
            <button onClick={() => setWeekOffset((w) => w + 1)} className="h-8 w-8 rounded-lg border bg-card flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-xs text-primary hover:underline font-medium ml-2">Today</button>
            )}
          </div>
          <button
            onClick={() => setRosterForm(emptyForm(format(new Date(), "yyyy-MM-dd"), new Date().getHours()))}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> New Roster
          </button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b">
                  <div className="px-3 py-2 text-xs text-muted-foreground font-medium">Time</div>
                  {daysOfWeek.map((d, i) => (
                    <div key={d} className="px-3 py-2 text-center">
                      <span className="text-xs text-muted-foreground font-medium">{d}</span>
                      <span className="block text-[10px] text-muted-foreground/60">{format(weekDates[i], "d MMM")}</span>
                    </div>
                  ))}
                </div>
                {/* Grid */}
                <div className="relative">
                  {hours.map((h) => (
                    <div key={h} className="grid grid-cols-8 border-b last:border-0">
                      <div className="px-3 py-3 text-[10px] text-muted-foreground">{`${h}:00`}</div>
                      {daysOfWeek.map((_, di) => {
                        const key = `${di}-${h}`;
                        const shifts = shiftsByCell[key] || [];
                        return (
                          <div
                            key={di}
                            onClick={() => handleCellClick(di, h)}
                            className="px-1 py-1 relative min-h-[48px] cursor-pointer hover:bg-primary/5 transition-colors border-l"
                          >
                            {shifts.map((s: any) => (
                              <div
                                key={s.id}
                                className="rounded-md bg-primary/10 border border-primary/20 px-1.5 py-1 mb-0.5 text-[10px] leading-tight"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="font-semibold text-primary truncate">
                                  {s.staff?.first_name} {s.staff?.last_name?.[0]}.
                                </p>
                                {s.client && (
                                  <p className="text-muted-foreground truncate">
                                    → {s.client.first_name} {s.client.last_name?.[0]}.
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* New Roster Dialog */}
      {rosterForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRosterForm(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-card shadow-xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold text-card-foreground">New Roster Entry</h2>
              <button onClick={() => setRosterForm(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={rosterForm.date}
                  onChange={(e) => setRosterForm({ ...rosterForm, date: e.target.value })}
                  className="w-full h-9 rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Time</label>
                  <input
                    type="time"
                    value={rosterForm.startHour}
                    onChange={(e) => setRosterForm({ ...rosterForm, startHour: e.target.value })}
                    className="w-full h-9 rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Time</label>
                  <input
                    type="time"
                    value={rosterForm.endHour}
                    onChange={(e) => setRosterForm({ ...rosterForm, endHour: e.target.value })}
                    className="w-full h-9 rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Staff */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Staff Member *</label>
                <select
                  value={rosterForm.staffId}
                  onChange={(e) => setRosterForm({ ...rosterForm, staffId: e.target.value })}
                  className="w-full h-9 rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select staff...</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                  ))}
                </select>
              </div>

              {/* Client */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Client</label>
                <select
                  value={rosterForm.clientId}
                  onChange={(e) => setRosterForm({ ...rosterForm, clientId: e.target.value })}
                  className="w-full h-9 rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select client (optional)...</option>
                  {clientList.map((c) => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
                <textarea
                  value={rosterForm.notes}
                  onChange={(e) => setRosterForm({ ...rosterForm, notes: e.target.value })}
                  placeholder="Any shift notes..."
                  rows={2}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setRosterForm(null)} className="h-9 px-4 rounded-lg border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={mutation.isPending} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Roster
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
}
