"use client";

import { useState } from "react";
import {
  Download,
  Search,
  Eye,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Swords,
  Briefcase,
  Users,
  TrendingUp,
  Layers,
} from "lucide-react";

export interface EventRegistration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  eventSlug: "startup-roulette" | "the-war-room" | "the-boardroom" | "entre-prenormie" | "bulls-and-bears";
  status: string;
  createdAt: string;
  teamName?: string;
  teamLeaderName?: string;
  teamMembersNames?: string;
  ideaName?: string;
  ideaDescription?: string;
  partnerName?: string;
  founderDiscussionTopic?: string;
}

export default function RegistrationsTable({
  registrations = [],
  byEvent,
  onDeleteRegistration,
}: {
  registrations: EventRegistration[];
  byEvent?: {
    "startup-roulette"?: EventRegistration[];
    "the-war-room"?: EventRegistration[];
    "the-boardroom"?: EventRegistration[];
    "entre-prenormie"?: EventRegistration[];
    "bulls-and-bears"?: EventRegistration[];
  };
  onDeleteRegistration?: (id: string, eventSlug: string) => void;
}) {
  const [activeEventTab, setActiveEventTab] = useState<string>("startup-roulette");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<EventRegistration | null>(null);
  const [deleteTargetRecord, setDeleteTargetRecord] = useState<EventRegistration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Grouped lists
  const rouletteList = byEvent?.["startup-roulette"] || registrations.filter((r) => r.eventSlug === "startup-roulette");
  const warRoomList = byEvent?.["the-war-room"] || registrations.filter((r) => r.eventSlug === "the-war-room");
  const boardroomList = byEvent?.["the-boardroom"] || registrations.filter((r) => r.eventSlug === "the-boardroom");
  const entreList = byEvent?.["entre-prenormie"] || registrations.filter((r) => r.eventSlug === "entre-prenormie");
  const bullsList = byEvent?.["bulls-and-bears"] || registrations.filter((r) => r.eventSlug === "bulls-and-bears");

  const currentList = (() => {
    switch (activeEventTab) {
      case "startup-roulette":
        return rouletteList;
      case "the-war-room":
        return warRoomList;
      case "the-boardroom":
        return boardroomList;
      case "entre-prenormie":
        return entreList;
      case "bulls-and-bears":
        return bullsList;
      default:
        return registrations;
    }
  })();

  const filteredRegistrations = currentList.filter((reg) => {
    const q = searchQuery.toLowerCase();
    return (
      reg.fullName?.toLowerCase().includes(q) ||
      reg.email?.toLowerCase().includes(q) ||
      reg.phone?.includes(q) ||
      reg.id?.toLowerCase().includes(q) ||
      reg.teamName?.toLowerCase().includes(q) ||
      reg.ideaName?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (record: EventRegistration) => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/registrations?id=${encodeURIComponent(record.id)}&eventSlug=${encodeURIComponent(record.eventSlug)}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete registration");
      }

      onDeleteRegistration?.(record.id, record.eventSlug);
      setDeleteSuccessMsg(`Registration ${record.id} for ${record.fullName} removed from database.`);
      setTimeout(() => setDeleteSuccessMsg(null), 4000);

      if (selectedRecord?.id === record.id) {
        setSelectedRecord(null);
      }
      setDeleteTargetRecord(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete record");
    } finally {
      setIsDeleting(false);
    }
  };

  const exportCurrentEventCSV = () => {
    let headers: string[] = [];
    let rows: (string | undefined)[][] = [];
    let filename = `cabinet_valley_${activeEventTab}_registrations_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeEventTab === "startup-roulette") {
      headers = [
        "Pass ID",
        "Full Name",
        "Email",
        "Phone",
        "Team Name",
        "Team Leader",
        "Roster Members",
        "Idea Name",
        "Pitch Description",
        "Registered At",
        "Status",
      ];
      rows = filteredRegistrations.map((r) => [
        r.id,
        `"${r.fullName || ""}"`,
        `"${r.email || ""}"`,
        `"${r.phone || ""}"`,
        `"${r.teamName || ""}"`,
        `"${r.teamLeaderName || ""}"`,
        `"${r.teamMembersNames || ""}"`,
        `"${r.ideaName || ""}"`,
        `"${(r.ideaDescription || "").replace(/"/g, '""')}"`,
        `"${new Date(r.createdAt).toLocaleString()}"`,
        r.status,
      ]);
    } else if (activeEventTab === "the-war-room") {
      headers = [
        "Pass ID",
        "Full Name",
        "Email",
        "Phone",
        "Syndicate Team",
        "Chief Negotiator (Leader)",
        "5-Member Roster",
        "Registered At",
        "Status",
      ];
      rows = filteredRegistrations.map((r) => [
        r.id,
        `"${r.fullName || ""}"`,
        `"${r.email || ""}"`,
        `"${r.phone || ""}"`,
        `"${r.teamName || ""}"`,
        `"${r.teamLeaderName || ""}"`,
        `"${r.teamMembersNames || ""}"`,
        `"${new Date(r.createdAt).toLocaleString()}"`,
        r.status,
      ]);
    } else if (activeEventTab === "the-boardroom") {
      headers = [
        "Pass ID",
        "Full Name",
        "Email",
        "Phone",
        "Duo Team Name",
        "Lead Partner",
        "Duo Partner",
        "Registered At",
        "Status",
      ];
      rows = filteredRegistrations.map((r) => [
        r.id,
        `"${r.fullName || ""}"`,
        `"${r.email || ""}"`,
        `"${r.phone || ""}"`,
        `"${r.teamName || ""}"`,
        `"${r.teamLeaderName || ""}"`,
        `"${r.partnerName || r.teamMembersNames || ""}"`,
        `"${new Date(r.createdAt).toLocaleString()}"`,
        r.status,
      ]);
    } else if (activeEventTab === "entre-prenormie") {
      headers = [
        "Pass ID",
        "Full Name",
        "Email",
        "Phone",
        "Founder Discussion Topic",
        "Registered At",
        "Status",
      ];
      rows = filteredRegistrations.map((r) => [
        r.id,
        `"${r.fullName || ""}"`,
        `"${r.email || ""}"`,
        `"${r.phone || ""}"`,
        `"${(r.founderDiscussionTopic || "").replace(/"/g, '""')}"`,
        `"${new Date(r.createdAt).toLocaleString()}"`,
        r.status,
      ]);
    } else if (activeEventTab === "bulls-and-bears") {
      headers = [
        "Pass ID",
        "Trader Name",
        "Email",
        "Phone",
        "Registered At",
        "Status",
      ];
      rows = filteredRegistrations.map((r) => [
        r.id,
        `"${r.fullName || ""}"`,
        `"${r.email || ""}"`,
        `"${r.phone || ""}"`,
        `"${new Date(r.createdAt).toLocaleString()}"`,
        r.status,
      ]);
    } else {
      headers = ["Pass ID", "Full Name", "Email", "Phone", "Event", "Registered At", "Status"];
      rows = filteredRegistrations.map((r) => [
        r.id,
        `"${r.fullName || ""}"`,
        `"${r.email || ""}"`,
        `"${r.phone || ""}"`,
        r.eventSlug,
        `"${new Date(r.createdAt).toLocaleString()}"`,
        r.status,
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEventBadge = (slug: string) => {
    switch (slug) {
      case "startup-roulette":
        return { label: "Startup Roulette", color: "bg-orange-100 text-[#FF5A36] border-orange-200" };
      case "the-war-room":
        return { label: "The War Room", color: "bg-blue-100 text-[#2F6FED] border-blue-200" };
      case "the-boardroom":
        return { label: "The Boardroom", color: "bg-orange-100 text-[#FF5A36] border-orange-200" };
      case "entre-prenormie":
        return { label: "Entrepre-Normie", color: "bg-purple-100 text-brand-violet border-purple-200" };
      case "bulls-and-bears":
        return { label: "Bulls & Bears", color: "bg-lime-100 text-emerald-800 border-lime-300" };
      default:
        return { label: slug, color: "bg-zinc-100 text-zinc-700 border-zinc-200" };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Delete Success Toast */}
      {deleteSuccessMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-between gap-2 text-emerald-900 text-xs font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{deleteSuccessMsg}</span>
          </div>
          <button
            onClick={() => setDeleteSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Event Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-zinc-200">
        <button
          onClick={() => setActiveEventTab("startup-roulette")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeEventTab === "startup-roulette"
              ? "bg-[#FF5A36] text-white shadow-md"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>STARTUP ROULETTE ({rouletteList.length})</span>
        </button>

        <button
          onClick={() => setActiveEventTab("the-war-room")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeEventTab === "the-war-room"
              ? "bg-[#2F6FED] text-white shadow-md"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>THE WAR ROOM ({warRoomList.length})</span>
        </button>

        <button
          onClick={() => setActiveEventTab("the-boardroom")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeEventTab === "the-boardroom"
              ? "bg-[#FF5A36] text-white shadow-md"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>THE BOARDROOM ({boardroomList.length})</span>
        </button>

        <button
          onClick={() => setActiveEventTab("entre-prenormie")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeEventTab === "entre-prenormie"
              ? "bg-brand-violet text-white shadow-md"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>ENTRE-PRENORMIE ({entreList.length})</span>
        </button>

        <button
          onClick={() => setActiveEventTab("bulls-and-bears")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeEventTab === "bulls-and-bears"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>BULLS & BEARS ({bullsList.length})</span>
        </button>

        <button
          onClick={() => setActiveEventTab("all")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeEventTab === "all"
              ? "bg-brand-ink text-white shadow-md"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ALL REGISTRATIONS ({registrations.length})</span>
        </button>
      </div>

      {/* Action & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeEventTab === "all" ? "all records" : activeEventTab.replace(/-/g, " ")}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
          />
        </div>

        {/* Dedicated CSV Export Button */}
        <button
          onClick={exportCurrentEventCSV}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-brand-ink hover:bg-brand-violet text-white text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-brand-lime" />
          <span>
            DOWNLOAD {activeEventTab === "all" ? "ALL" : activeEventTab.replace(/-/g, " ").toUpperCase()} CSV ({filteredRegistrations.length})
          </span>
        </button>
      </div>

      {/* Dynamic Event Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 font-bold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="py-3.5 px-4">Pass ID</th>
                <th className="py-3.5 px-4">Participant</th>
                <th className="py-3.5 px-4">Contact</th>

                {/* Event specific column headers */}
                {activeEventTab === "startup-roulette" && (
                  <>
                    <th className="py-3.5 px-4">Team & Leader</th>
                    <th className="py-3.5 px-4">Idea</th>
                  </>
                )}

                {activeEventTab === "the-war-room" && (
                  <>
                    <th className="py-3.5 px-4">Syndicate Team</th>
                    <th className="py-3.5 px-4">Chief Negotiator</th>
                  </>
                )}

                {activeEventTab === "the-boardroom" && (
                  <>
                    <th className="py-3.5 px-4">Duo Team</th>
                    <th className="py-3.5 px-4">Duo Partner</th>
                  </>
                )}

                {activeEventTab === "entre-prenormie" && (
                  <th className="py-3.5 px-4">Discussion Topic</th>
                )}

                {activeEventTab === "all" && (
                  <th className="py-3.5 px-4">Track</th>
                )}

                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-zinc-400 font-bold uppercase">
                    No registrations found in this event table
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

                    {/* Startup Roulette Columns */}
                    {activeEventTab === "startup-roulette" && (
                      <>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-brand-ink">{reg.teamName || "—"}</div>
                          <div className="text-[11px] text-zinc-500">Lead: {reg.teamLeaderName || "—"}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#FF5A36]">{reg.ideaName || "—"}</div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1">{reg.ideaDescription || "—"}</div>
                        </td>
                      </>
                    )}

                    {/* The War Room Columns */}
                    {activeEventTab === "the-war-room" && (
                      <>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-brand-ink">{reg.teamName || "—"}</div>
                          <div className="text-[11px] text-zinc-400">Roster: {reg.teamMembersNames || "—"}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#2F6FED]">{reg.teamLeaderName || "—"}</div>
                        </td>
                      </>
                    )}

                    {/* The Boardroom Columns */}
                    {activeEventTab === "the-boardroom" && (
                      <>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-brand-ink">{reg.teamName || "—"}</div>
                          <div className="text-[11px] text-zinc-500">Lead: {reg.teamLeaderName || "—"}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#FF5A36]">{reg.partnerName || reg.teamMembersNames || "—"}</div>
                        </td>
                      </>
                    )}

                    {/* Entre-Prenormie Column */}
                    {activeEventTab === "entre-prenormie" && (
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-zinc-700 line-clamp-2 italic">
                          {reg.founderDiscussionTopic || "General 1-on-1 mentorship"}
                        </div>
                      </td>
                    )}

                    {/* All View Column */}
                    {activeEventTab === "all" && (
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${getEventBadge(reg.eventSlug).color}`}>
                          {getEventBadge(reg.eventSlug).label}
                        </span>
                      </td>
                    )}

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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRecord(reg)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-surface hover:bg-brand-ink hover:text-white text-zinc-700 font-bold transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>VIEW</span>
                        </button>
                        <button
                          onClick={() => setDeleteTargetRecord(reg)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-bold transition-colors"
                          title="Delete Registration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal Inspector */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-brand-ink shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-zinc-100 hover:bg-black hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getEventBadge(selectedRecord.eventSlug).color}`}>
                {getEventBadge(selectedRecord.eventSlug).label}
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
                <span className="font-medium text-brand-ink font-mono">{selectedRecord.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-zinc-500">SUBMITTED AT:</span>
                <span className="font-medium text-brand-ink font-mono">
                  {new Date(selectedRecord.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-zinc-500">STATUS:</span>
                <span className="font-bold text-emerald-700 uppercase">{selectedRecord.status}</span>
              </div>
            </div>

            {/* Event Specific Sub-card in Modal */}
            {selectedRecord.teamName && (
              <div className="mt-4 p-4 bg-brand-surface rounded-2xl border border-brand-border text-xs space-y-2">
                <div className="text-[10px] font-black uppercase text-brand-violet">TEAM ROSTER & SPECS</div>
                <div><strong>Team Name:</strong> {selectedRecord.teamName}</div>
                {selectedRecord.teamLeaderName && (
                  <div><strong>Team Leader / Chief:</strong> {selectedRecord.teamLeaderName}</div>
                )}
                {selectedRecord.teamMembersNames && (
                  <div><strong>Members / Roster:</strong> {selectedRecord.teamMembersNames}</div>
                )}
                {selectedRecord.partnerName && (
                  <div><strong>Duo Partner:</strong> {selectedRecord.partnerName}</div>
                )}
              </div>
            )}

            {selectedRecord.ideaName && (
              <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs space-y-1.5">
                <div className="text-[10px] font-black uppercase text-[#FF5A36]">PITCH & VENTURE CONCEPT</div>
                <div><strong>Idea Name:</strong> {selectedRecord.ideaName}</div>
                <div><strong>Description:</strong> {selectedRecord.ideaDescription}</div>
              </div>
            )}

            {selectedRecord.founderDiscussionTopic && (
              <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs space-y-1.5">
                <div className="text-[10px] font-black uppercase text-brand-violet">FOUNDER 1-ON-1 TOPIC</div>
                <div className="italic text-zinc-700">{selectedRecord.founderDiscussionTopic}</div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-zinc-100">
              <button
                onClick={() => setDeleteTargetRecord(selectedRecord)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-black text-xs uppercase tracking-wider transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>REMOVE FROM DB</span>
              </button>

              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-full bg-brand-ink text-white font-black text-xs uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {deleteTargetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-red-500 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-display text-2xl font-black uppercase text-brand-ink">
              REMOVE REGISTRATION?
            </h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete registration <strong>{deleteTargetRecord.id}</strong> for <strong>{deleteTargetRecord.fullName}</strong> from table <code className="text-brand-violet font-bold">registrations_{deleteTargetRecord.eventSlug.replace(/-/g, "_")}</code>?
            </p>

            <div className="mt-4 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs space-y-1 font-mono text-zinc-700">
              <div><strong>ID:</strong> {deleteTargetRecord.id}</div>
              <div><strong>Email:</strong> {deleteTargetRecord.email}</div>
              <div><strong>Track:</strong> {getEventBadge(deleteTargetRecord.eventSlug).label}</div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTargetRecord(null)}
                className="px-5 py-2.5 rounded-full border border-zinc-300 text-xs font-bold uppercase hover:bg-zinc-100 transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDelete(deleteTargetRecord)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "REMOVING..." : "CONFIRM DELETE"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


