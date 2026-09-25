import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, Trash2 } from "lucide-react";
import { api } from "../lib/api";
export default function History() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    api
      .get("/analyses")
      .then((r) => setItems(r.data.analyses || []))
      .catch(() => {});
  }, []);
  const del = async (id) => {
    if (!confirm("Delete this analysis?")) return;
    await api.delete(`/analyses/${id}`);
    setItems(items.filter((x) => x._id !== id));
  };
  const filtered = items.filter((x) =>
    `${x.jobTitle} ${x.fileName}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight">
        Analysis history
      </h1>
      <p className="mt-2 text-zinc-500">
        Review and manage your previous resume analyses.
      </p>
      <div className="relative mt-8 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
          size={17}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search analyses"
          className="w-full rounded-xl border border-white/10 bg-white/[.035] py-3 pl-10 pr-3 outline-none"
        />
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[.025]">
        {filtered.length ? (
          filtered.map((x) => (
            <div
              key={x._id}
              className="flex items-center justify-between border-b border-white/5 p-4 last:border-0"
            >
              <Link
                to={`/analysis/${x._id}`}
                className="flex min-w-0 items-center gap-3"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5">
                  <FileText size={17} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{x.jobTitle}</p>
                  <p className="truncate text-xs text-zinc-600">
                    {x.fileName} · {new Date(x.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-lime-300/10 px-3 py-1 text-xs text-lime-300">
                  {x.score}/100
                </span>
                <button
                  onClick={() => del(x._id)}
                  className="text-zinc-600 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-sm text-zinc-600">
            No analyses yet.{" "}
            <Link className="text-lime-300" to="/analyze">
              Analyze your first resume.
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
