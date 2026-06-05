import { useCallback, useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api.js";

const VALID_TRANSITIONS = {
  OPEN: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  REJECTED: [],
};

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const CATEGORIES = ["Waste", "Water", "Road", "Electricity", "Sanitation", "Other"];

function statusSlug(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/_/g, "-");
}

function StatusCell({ complaint, onUpdate, disabled }) {
  const allowed = VALID_TRANSITIONS[complaint.status] || [];

  if (allowed.length === 0) {
    return <span className="text-xs text-white/40">Terminal</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {allowed.map((next) => (
        <button
          key={next}
          type="button"
          className="btn py-1 px-2.5 text-xs"
          disabled={disabled}
          onClick={() => onUpdate(complaint._id, next)}
        >
          {next.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}>
              <div className="skeleton h-4 w-full max-w-[140px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dense, setDense] = useState(true);
  const [selected, setSelected] = useState(() => new Set());
  const [batchBusy, setBatchBusy] = useState(false);

  const navigate = useNavigate();

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.get("/api/complaints/analytics");
      setAnalytics(res.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error("Could not load analytics.");
      }
    } finally {
      setLoadingAnalytics(false);
    }
  }, [navigate]);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoadingComplaints(true);
      const q = new URLSearchParams();
      if (statusFilter) q.set("status", statusFilter);
      if (categoryFilter) q.set("category", categoryFilter);
      const qs = q.toString();
      const res = await api.get(`/api/complaints${qs ? `?${qs}` : ""}`);
      setComplaints(res.data.data || []);
      setSelected(new Set());
    } catch (error) {
      console.error(error);
      toast.error("Could not load complaints.");
    } finally {
      setLoadingComplaints(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAnalytics();
  }, [navigate, fetchAnalytics]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchComplaints();
  }, [fetchComplaints]);

  const handleUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put("/api/complaints/status", { id, status: newStatus });
      setComplaints((prev) => prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c)));
      fetchAnalytics();
      toast.success("Status updated.");
    } catch (error) {
      const msg = error.response?.data?.message || "Update failed";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    if (!complaints.length) return;
    const allSelected = complaints.every((c) => selected.has(c._id));
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(complaints.map((c) => c._id)));
    }
  };

  const batchContext = useMemo(() => {
    const rows = complaints.filter((c) => selected.has(c._id));
    if (rows.length === 0) return { ok: false, reason: "none" };
    const statuses = new Set(rows.map((r) => r.status));
    if (statuses.size !== 1) return { ok: false, reason: "mixed" };
    const current = rows[0].status;
    const allowedNext = VALID_TRANSITIONS[current] || [];
    return { ok: true, current, allowedNext, count: rows.length, ids: rows.map((r) => r._id) };
  }, [complaints, selected]);

  const runBatch = async (newStatus) => {
    if (!batchContext.ok) return;
    setBatchBusy(true);
    try {
      const res = await api.put("/api/complaints/status/batch", {
        ids: batchContext.ids,
        status: newStatus,
      });
      const { ok = 0, failed = 0 } = res.data.summary || {};
      if (failed) {
        toast.message(`Updated ${ok}, failed ${failed}`, { description: "See server logs for details." });
      } else {
        toast.success(`Updated ${ok} complaint(s).`);
      }
      await fetchComplaints();
      await fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Batch update failed.");
    } finally {
      setBatchBusy(false);
    }
  };

  if (loadingAnalytics && !analytics) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-inner">
            <div className="skeleton mb-3 h-9 w-64" />
            <div className="skeleton h-4 w-full max-w-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const totalPending = analytics.byStatus?.find((s) => s._id === "IN_PROGRESS")?.count || 0;
  const totalResolved = analytics.byStatus?.find((s) => s._id === "RESOLVED")?.count || 0;
  const allVisibleSelected =
    complaints.length > 0 && complaints.every((c) => selected.has(c._id));

  return (
    <div className="container">
      <header className="row">
        <div>
          <h1 className="h1">Municipal dashboard</h1>
          <p className="subhead">
            Overview of complaints, categories, and current resolution status.
          </p>
        </div>
        <div className="spacer" />
        <button
          type="button"
          className="btn"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ height: 16 }} />

      <div className="grid-2">
        <section className="card">
          <div className="card-inner">
            <div className="row">
              <div>
                <div className="label">Total complaints</div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  {analytics.totalComplaints}
                </div>
              </div>
              <div className="spacer" />
              <div style={{ textAlign: "right" }}>
                <div className="label">Pending</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{totalPending}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="label">Resolved</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{totalResolved}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-inner">
            <div className="row" style={{ marginBottom: 10 }}>
              <div className="form-title" style={{ margin: 0 }}>
                Complaints by category
              </div>
              <div className="spacer" />
              <div className="helper" style={{ marginTop: 0 }}>
                Distribution snapshot
              </div>
            </div>
            <div style={{ height: 240 }}>
              <Pie
                data={{
                  labels: analytics.byCategory.map((item) => item._id),
                  datasets: [
                    {
                      data: analytics.byCategory.map((item) => item.count),
                      backgroundColor: [
                        "rgba(96,165,250,0.8)",
                        "rgba(37,99,235,0.8)",
                        "rgba(251,113,133,0.75)",
                        "rgba(52,211,153,0.75)",
                        "rgba(250,204,21,0.75)",
                        "rgba(251,146,60,0.75)",
                      ],
                      borderColor: "rgba(255,255,255,0.18)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { labels: { color: "rgba(255,255,255,0.75)" } } },
                }}
              />
            </div>
          </div>
        </section>
      </div>

      <div style={{ height: 16 }} />

      <section className="card">
        <div className="card-inner">
          <div className="row" style={{ marginBottom: 12, alignItems: "flex-end" }}>
            <div>
              <div className="form-title" style={{ margin: 0 }}>
                All complaints
              </div>
              <div className="helper" style={{ marginTop: 6 }}>
                {loadingComplaints ? "Loading…" : `${complaints.length} in current view`}
              </div>
            </div>
            <div className="spacer" />
            <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <input
                type="checkbox"
                checked={dense}
                onChange={(e) => setDense(e.target.checked)}
              />
              Compact rows
            </label>
            <button type="button" className="btn" onClick={() => void fetchComplaints()} disabled={loadingComplaints}>
              Refresh
            </button>
          </div>

          <div className="mb-3 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="field !mt-0 min-w-[140px]">
              <label className="label" htmlFor="flt-status">
                Status
              </label>
              <select
                id="flt-status"
                className="control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field !mt-0 min-w-[140px]">
              <label className="label" htmlFor="flt-cat">
                Category
              </label>
              <select
                id="flt-cat"
                className="control"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn mt-6 sm:mt-0"
              onClick={() => {
                setStatusFilter("");
                setCategoryFilter("");
              }}
            >
              Clear filters
            </button>
          </div>

          {selected.size > 0 ? (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-400/25 bg-indigo-500/10 px-3 py-2 text-sm">
              <span className="font-semibold text-white/90">{selected.size} selected</span>
              {!batchContext.ok && batchContext.reason === "mixed" ? (
                <span className="text-xs text-amber-200/90">
                  Batch actions need rows sharing the same status. Narrow your selection.
                </span>
              ) : null}
              {batchContext.ok && batchContext.allowedNext.length === 0 ? (
                <span className="text-xs text-white/50">No transitions available for this status.</span>
              ) : null}
              {batchContext.ok &&
                batchContext.allowedNext.map((next) => (
                  <button
                    key={next}
                    type="button"
                    className="btn primary py-1 px-2.5 text-xs"
                    disabled={batchBusy}
                    onClick={() => void runBatch(next)}
                  >
                    Set all → {next.replace(/_/g, " ")}
                  </button>
                ))}
            </div>
          ) : null}

          <div className="table-wrap">
            <table className={dense ? "table-dense" : ""}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      disabled={!complaints.length || loadingComplaints}
                      aria-label="Select all visible"
                    />
                  </th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingComplaints ? (
                  <TableSkeleton />
                ) : (
                  complaints.map((c) => (
                    <tr key={c._id} style={{ opacity: updatingId === c._id ? 0.5 : 1 }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(c._id)}
                          onChange={() => toggleRow(c._id)}
                          aria-label={`Select complaint ${c._id}`}
                        />
                      </td>
                      <td style={{ minWidth: dense ? 220 : 280 }}>{c.descriptionText}</td>
                      <td>{c.userCategory}</td>
                      <td>
                        <span className={`pill ${String(c.priorityLevel || "").toLowerCase()}`}>
                          {c.priorityLevel}
                        </span>
                      </td>
                      <td>
                        <span className={`pill-status pill-status-${statusSlug(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <StatusCell
                          complaint={c}
                          onUpdate={handleUpdate}
                          disabled={!!updatingId || batchBusy}
                        />
                      </td>
                    </tr>
                  ))
                )}
                {!loadingComplaints && complaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-[var(--muted)]">
                      No complaints in this view.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
