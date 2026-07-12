import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchAuditCycles, 
  createAuditCycle, 
  recordAuditEntry, 
  fetchDiscrepancyReport, 
  closeAuditCycle 
} from "../store/slices/auditSlice";
import { fetchDepartments } from "../store/slices/departmentSlice";
import { fetchEmployees } from "../store/slices/employeeSlice";
import { fetchAssets } from "../store/slices/assetSlice";
import { toast } from "react-toastify";
import { Plus, ClipboardCheck, Lock, Eye, AlertTriangle } from "lucide-react";

export default function Audits() {
  const dispatch = useDispatch();
  const { items: cycles } = useSelector((state) => state.audits);
  const { items: departments } = useSelector((state) => state.departments);
  const { items: employees } = useSelector((state) => state.employees);
  const { items: assets } = useSelector((state) => state.assets);
  const { user } = useSelector((state) => state.auth);

  const [showAddForm, setShowAddForm] = useState(false);
  const [cycleName, setCycleName] = useState("");
  const [scopeDept, setScopeDept] = useState("");
  const [scopeLoc, setScopeLoc] = useState("");
  const [selectedAuditors, setSelectedAuditors] = useState([]);

  const [activeCycle, setActiveCycle] = useState(null);
  const [activeCycleDetails, setActiveCycleDetails] = useState([]);
  const [discrepancyReport, setDiscrepancyReport] = useState(null);

  useEffect(() => {
    dispatch(fetchAuditCycles());
    dispatch(fetchDepartments());
    dispatch(fetchEmployees());
    dispatch(fetchAssets());
  }, [dispatch]);

  const handleCreateCycle = (e) => {
    e.preventDefault();
    if (!cycleName) return;

    dispatch(createAuditCycle({
      name: cycleName,
      scope_department: scopeDept || null,
      scope_location: scopeLoc || null,
      auditors: selectedAuditors
    })).unwrap()
      .then(() => {
        toast.success("Audit cycle successfully initialized!");
        setShowAddForm(false);
        setCycleName("");
        setScopeDept("");
        setScopeLoc("");
        setSelectedAuditors([]);
      })
      .catch((err) => toast.error(err));
  };

  const handleAuditorChange = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedAuditors(values);
  };

  const handleInspectCycle = (cycle) => {
    setActiveCycle(cycle);
    setDiscrepancyReport(null);
    // Find assets that match the scope of the cycle
    const filtered = assets.filter(a => {
      if (cycle.scope_department && a.department_id !== cycle.scope_department) return false;
      if (cycle.scope_location && a.location !== cycle.scope_location) return false;
      return true;
    });
    setActiveCycleDetails(filtered);
  };

  const handleRecordEntry = (assetId, result) => {
    dispatch(recordAuditEntry({
      cycleId: activeCycle.cycle_id,
      data: {
        asset_id: assetId,
        result,
        notes: "Audited during scheduled cycle verification."
      }
    })).unwrap()
      .then(() => {
        toast.success(`Asset marked ${result}`);
      })
      .catch((err) => toast.error(err));
  };

  const handleLoadReport = (cycleId) => {
    dispatch(fetchDiscrepancyReport(cycleId)).unwrap()
      .then((data) => {
        setDiscrepancyReport(data);
      });
  };

  const handleCloseCycle = (cycleId) => {
    if (window.confirm("Closing the cycle will lock all entries and update missing assets to 'Lost'. Proceed?")) {
      dispatch(closeAuditCycle(cycleId)).unwrap()
        .then(() => {
          toast.success("Audit cycle closed. Asset directory records updated.");
          setActiveCycle(null);
        })
        .catch((err) => toast.error(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Asset Verification Cycles</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Designate auditors, perform cycle checks, and resolve missing inventories</p>
        </div>
        {user?.role === "ADMIN" && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2 py-2 text-xs font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Start Audit Cycle
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="jira-card p-6 bg-white max-w-lg">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
            Initialize Audit Cycle
          </h3>
          <form onSubmit={handleCreateCycle} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cycle Name / Scope Title *</label>
              <input
                type="text"
                required
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                placeholder="e.g. Q3 Hardware Audit 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department Scope</label>
                <select
                  value={scopeDept}
                  onChange={(e) => setScopeDept(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Office Location Scope</label>
                <input
                  type="text"
                  value={scopeLoc}
                  onChange={(e) => setScopeLoc(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                  placeholder="e.g. HQ Office"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Designate Auditors (Multi-Select) *</label>
              <select
                multiple
                value={selectedAuditors}
                onChange={handleAuditorChange}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800 h-24"
              >
                {employees.map((e) => (
                  <option key={e.user_id} value={e.user_id}>{e.name} ({e.email})</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Hold Cmd/Ctrl to select multiple users</p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary py-2 text-xs font-bold cursor-pointer">
                Launch Cycle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main cycles table / detail split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="jira-card p-6 bg-white lg:col-span-1 h-fit">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
            Audit Cycles
          </h3>
          <div className="space-y-3">
            {cycles.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No audit cycles started yet</p>
            ) : (
              cycles.map((c) => (
                <div key={c.cycle_id} className="p-3 border border-slate-200 rounded flex flex-col justify-between hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-800 truncate">{c.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === "Open" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                    }`}>{c.status}</span>
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      onClick={() => handleInspectCycle(c)}
                      className="btn-secondary py-1 px-2.5 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ClipboardCheck className="h-3 w-3" /> Inspect
                    </button>
                    <button
                      onClick={() => handleLoadReport(c.cycle_id)}
                      className="btn-secondary py-1 px-2.5 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3 w-3" /> Discrepancies
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Cycle Actions & List */}
        <div className="jira-card p-6 bg-white lg:col-span-2">
          {activeCycle && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase">Active verification cycle</span>
                  <h3 className="text-sm font-bold text-slate-800 mt-1">{activeCycle.name}</h3>
                </div>
                {user?.role === "ADMIN" && activeCycle.status === "Open" && (
                  <button
                    onClick={() => handleCloseCycle(activeCycle.cycle_id)}
                    className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" /> Close & Lock Cycle
                  </button>
                )}
              </div>

              {/* Items under audit scope */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                      <th className="py-2 px-3">Asset Tag</th>
                      <th className="py-2 px-3">Asset Name</th>
                      <th className="py-2 px-3">Current Status</th>
                      {activeCycle.status === "Open" && (
                        <th className="py-2 px-3 text-right">Verification Results</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeCycleDetails.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-4 text-center text-slate-400">No assets match the scope of this cycle</td>
                      </tr>
                    ) : (
                      activeCycleDetails.map((asset) => (
                        <tr key={asset.asset_id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-700">{asset.asset_tag}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{asset.name}</td>
                          <td className="py-2 px-3 text-slate-500">{asset.status}</td>
                          {activeCycle.status === "Open" && (
                            <td className="py-2 px-3 text-right space-x-1.5">
                              <button
                                onClick={() => handleRecordEntry(asset.asset_id, "Verified")}
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Verified
                              </button>
                              <button
                                onClick={() => handleRecordEntry(asset.asset_id, "Missing")}
                                className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Missing
                              </button>
                              <button
                                onClick={() => handleRecordEntry(asset.asset_id, "Damaged")}
                                className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Damaged
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {discrepancyReport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Discrepancy & Verification Report
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-slate-50 p-3 border border-slate-200 rounded">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Scope</p>
                  <p className="text-lg font-bold text-slate-700 mt-1">{discrepancyReport.summary.total_assets}</p>
                </div>
                <div className="bg-emerald-50 p-3 border border-emerald-200 rounded">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Verified</p>
                  <p className="text-lg font-bold text-emerald-700 mt-1">{discrepancyReport.summary.verified}</p>
                </div>
                <div className="bg-rose-50 p-3 border border-rose-200 rounded animate-pulse">
                  <p className="text-[10px] text-rose-600 font-bold uppercase">Missing</p>
                  <p className="text-lg font-bold text-rose-700 mt-1">{discrepancyReport.summary.missing}</p>
                </div>
                <div className="bg-amber-50 p-3 border border-amber-200 rounded">
                  <p className="text-[10px] text-amber-600 font-bold uppercase">Damaged</p>
                  <p className="text-lg font-bold text-amber-700 mt-1">{discrepancyReport.summary.damaged}</p>
                </div>
              </div>

              {/* List Discrepancies Table */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Unverified / Flagged Discrepancies</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-bold">
                        <th className="py-2 px-3">Asset Tag</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Location</th>
                        <th className="py-2 px-3">Discrepancy Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {discrepancyReport.discrepancies.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-4 text-center text-slate-400">All scoped assets verified successfully!</td>
                        </tr>
                      ) : (
                        discrepancyReport.discrepancies.map((d, i) => (
                          <tr key={i}>
                            <td className="py-2 px-3 font-bold text-blue-600">{d.asset_tag}</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">{d.asset_name}</td>
                            <td className="py-2 px-3 text-slate-500">{d.location || "Unspecified"}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                d.result === "Missing" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"
                              }`}>{d.result}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!activeCycle && !discrepancyReport && (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select or inspect an audit cycle from the side panel to begin asset verification procedures.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
