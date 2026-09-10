"use client";

import { useState } from "react";
import { Download, Search, Filter, Eye, X, CheckCircle2 } from "lucide-react";

interface RegistrationItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  selectedEvents: string[];
  createdAt: string;
  status: string;
  startupRoulette?: any;
  theWarRoom?: any;
  theBoardroom?: any;
  entrePrenormie?: any;
  bayArea?: any;
}

export default function RegistrationsTable({
  registrations,
}: {
  registrations: RegistrationItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<RegistrationItem | null>(null);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEvent =
      eventFilter === "all" || reg.selectedEvents?.includes(eventFilter);

    return matchesSearch && matchesEvent;
  });

  const exportCSV = () => {
    const headers = ["ID", "Full Name", "Email", "Phone", "Tracks", "Created At", "Status"];
    const rows = filteredRegistrations.map((r) => [
      r.id,
      `"${r.fullName}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.selectedEvents.join(", ")}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`,
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cabinet_valley_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email, or pass ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
            />
          </div>

          {/* Event Filter */}
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold uppercase bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet"
          >
            <option value="all">ALL TRACKS</option>
            <option value="startup-roulette">Startup Roulette</option>
            <option value="bay-area">Bay Area Stalls</option>
            <option value="the-war-room">The War Room</option>
            <option value="the-boardroom">The Boardroom</option>
            <option value="entre-prenormie">Entre-Prenormie</option>
            <option value="bulls-and-bears">Bulls & Bears</option>
          </select>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-violet text-white text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT CSV ({filteredRegistrations.length})</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 font-bold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="py-3.5 px-4">Pass ID</th>
                <th className="py-3.5 px-4">Participant</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Registered Tracks</th>
                <th className="py-3.5 px-4">Registered At</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400 font-semibold uppercase">
                    No registrations found matching criteria
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-violet">{reg.id}</td>
                    <td className="py-3.5 px-4 font-bold text-brand-ink">{reg.fullName}</td>
                    <td className="py-3.5 px-4 text-zinc-600">
                      <div>{reg.email}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{reg.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {reg.selectedEvents?.map((slug) => (
                          <span
                            key={slug}
                            className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase tracking-wide text-zinc-700"
                          >
                            {slug}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(reg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-surface hover:bg-brand-ink hover:text-white text-zinc-700 font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>VIEW</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-brand-ink shadow-2xl relative">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-zinc-100 hover:bg-black hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-black uppercase text-brand-violet bg-brand-violet/10 px-2.5 py-1 rounded-full">
                SUBMISSION DETAIL
              </span>
              <h3 className="font-display text-2xl font-black uppercase text-brand-ink mt-2">
                {selectedRecord.fullName}
              </h3>
              <p className="font-mono text-xs text-zinc-500">{selectedRecord.id}</p>
            </div>

            <div className="space-y-3 text-xs bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div className="flex justify-between">
                <span className="font-bold text-zinc-500">EMAIL:</span>
                <span className="font-medium text-brand-ink">{selectedRecord.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-zinc-500">PHONE:</span>
                <span className="font-medium text-brand-ink">{selectedRecord.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-zinc-500">REGISTERED AT:</span>
                <span className="font-medium text-brand-ink font-mono">
                  {new Date(selectedRecord.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-zinc-500">TRACKS:</span>
                <span className="font-bold text-brand-violet uppercase">
                  {selectedRecord.selectedEvents?.join(", ")}
                </span>
              </div>
            </div>

            {/* Event Specific Sub-objects */}
            {selectedRecord.startupRoulette && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs space-y-1">
                <div className="font-black text-[#FF5A36] uppercase">Startup Roulette Details:</div>
                <div><strong>Team:</strong> {selectedRecord.startupRoulette.teamName}</div>
                <div><strong>Leader:</strong> {selectedRecord.startupRoulette.teamLeaderName}</div>
                <div><strong>Idea:</strong> {selectedRecord.startupRoulette.ideaName}</div>
              </div>
            )}

            {selectedRecord.bayArea && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                <div className="font-black text-brand-violet uppercase">Bay Area Stall Details:</div>
                <div><strong>Stall Name:</strong> {selectedRecord.bayArea.stallName}</div>
                <div><strong>Type:</strong> {selectedRecord.bayArea.stallType} (₹4,000)</div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-full bg-brand-ink text-white font-bold text-xs uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
