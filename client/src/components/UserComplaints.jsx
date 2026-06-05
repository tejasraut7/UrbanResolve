import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api.js";

function statusSlug(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/_/g, "-");
}

function StatusTimeline({ history }) {
  const items = [...(history || [])].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  if (!items.length) {
    return <p className="helper !mt-2">No status changes recorded yet.</p>;
  }
  return (
    <ol className="relative mt-3 border-l border-white/10 pl-4 text-left text-sm">
      {items.map((h, i) => (
        <li key={`${h.status}-${i}`} className="mb-3 last:mb-0">
          <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-indigo-400" />
          <div className="font-semibold text-white/90">{h.status}</div>
          <div className="text-xs text-[var(--muted-2)]">
            {h.timestamp ? new Date(h.timestamp).toLocaleString() : ""}
          </div>
        </li>
      ))}
    </ol>
  );
}

function TableSkeleton({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {[1, 2, 3, 4].map((c) => (
            <td key={c} className="align-middle">
              <div className="skeleton h-4 w-full max-w-[220px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function UserComplaints({ refresh }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/complaints");
        if (!cancelled) setComplaints(res.data.data || []);
      } catch {
        if (!cancelled) {
          setComplaints([]);
          toast.error("Could not load complaints. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h2 className="form-title" style={{ margin: 0 }}>
          My complaints
        </h2>
        <div className="spacer" />
        <div className="helper" style={{ marginTop: 0 }}>
          {loading ? "Loading…" : `${complaints.length} total`}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : (
              complaints.map((c) => (
                <tr key={c._id}>
                  <td style={{ minWidth: 220 }}>
                    <details className="group">
                      <summary className="cursor-pointer list-none text-left [&::-webkit-details-marker]:hidden">
                        <span className="text-white/90 underline decoration-white/20 decoration-1 underline-offset-2 group-open:no-underline">
                          {c.descriptionText?.slice(0, 80)}
                          {c.descriptionText?.length > 80 ? "…" : ""}
                        </span>
                      </summary>
                      <p className="mt-2 text-sm text-[var(--muted)]">{c.descriptionText}</p>
                      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Status timeline
                        </div>
                        <StatusTimeline history={c.statusHistory} />
                      </div>
                    </details>
                  </td>
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
                </tr>
              ))
            )}
            {!loading && complaints.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-[var(--muted)]">
                  No complaints yet. Submit one on the left to get started.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
