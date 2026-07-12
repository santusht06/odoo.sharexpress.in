import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchMaintenanceRequests, 
  raiseMaintenanceRequest, 
  approveMaintenanceRequest, 
  rejectMaintenanceRequest,
  assignTechnician,
  resolveMaintenance
} from "../store/slices/maintenanceSlice";
import { fetchAssets } from "../store/slices/assetSlice";
import { toast } from "react-toastify";
import { Plus, Check, X, UserPlus, CheckSquare } from "lucide-react";

export default function Maintenance() {
  const dispatch = useDispatch();
  const { items: requests } = useSelector((state) => state.maintenance);
  const { items: assets } = useSelector((state) => state.assets);
  const { user } = useSelector((state) => state.auth);

  const [showAddForm, setShowAddForm] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [assignReqId, setAssignReqId] = useState(null);
  const [techName, setTechName] = useState("");

  const [resolveReqId, setResolveReqId] = useState(null);
  const [resNotes, setResNotes] = useState("");

  useEffect(() => {
    dispatch(fetchMaintenanceRequests());
    dispatch(fetchAssets());
  }, [dispatch]);

  const handleRaiseRequest = (e) => {
    e.preventDefault();
    if (!assetId || !desc) return;

    dispatch(raiseMaintenanceRequest({
      asset_id: assetId,
      issue_description: desc,
      priority
    })).unwrap()
      .then(() => {
        toast.success("Maintenance request raised successfully!");
        setShowAddForm(false);
        setAssetId("");
        setDesc("");
        setPriority("Medium");
      })
      .catch((err) => toast.error(err));
  };

  const handleApprove = (id) => {
    dispatch(approveMaintenanceRequest(id))
      .unwrap()
      .then(() => toast.success("Request approved"))
      .catch((err) => toast.error(err));
  };

  const handleReject = (id) => {
    dispatch(rejectMaintenanceRequest(id))
      .unwrap()
      .then(() => toast.success("Request rejected"))
      .catch((err) => toast.error(err));
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!techName) return;

    dispatch(assignTechnician({
      requestId: assignReqId,
      data: { technician_name: techName }
    })).unwrap()
      .then(() => {
        toast.success("Technician assigned!");
        setAssignReqId(null);
        setTechName("");
      })
      .catch((err) => toast.error(err));
  };

  const handleResolve = (e) => {
    e.preventDefault();
    if (!resNotes) return;

    dispatch(resolveMaintenance({
      requestId: resolveReqId,
      data: { resolution_notes: resNotes }
    })).unwrap()
      .then(() => {
        toast.success("Maintenance resolved. Asset marked Available!");
        setResolveReqId(null);
        setResNotes("");
      })
      .catch((err) => toast.error(err));
  };

  // Group requests by status for Kanban Board
  const getStatusColumn = (status) => {
    return requests.filter(r => r.status === status);
  };

  const columns = ["Pending", "Approved", "In Progress", "Resolved"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Maintenance & Repairs</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Route and verify hardware repair requests through approved stages</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2 py-2 text-xs font-bold cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Raise Issue
        </button>
      </div>

      {showAddForm && (
        <div className="jira-card p-6 bg-white max-w-lg">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
            Report Hardware Issue
          </h3>
          <form onSubmit={handleRaiseRequest} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Asset *</label>
              <select
                required
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
              >
                <option value="">Select Asset</option>
                {assets.map((a) => (
                  <option key={a.asset_id} value={a.asset_id}>{a.name} ({a.asset_tag})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Issue Description *</label>
              <textarea
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800 h-20"
                placeholder="Explain the screen crack, hardware fault, battery issue etc."
              />
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
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {columns.map((col) => {
          const colRequests = getStatusColumn(col);
          return (
            <div key={col} className="bg-slate-100 rounded p-4 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{col}</span>
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                  {colRequests.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colRequests.map((req) => (
                  <div key={req.request_id} className="bg-white border border-slate-200 p-4 rounded shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">{req.asset_tag}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        req.priority === "Critical" || req.priority === "High"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>{req.priority}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{req.asset_name}</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed truncate">{req.issue_description}</p>
                    
                    {req.assigned_technician && (
                      <p className="text-[10px] text-slate-600 font-bold bg-slate-50 p-1 rounded">
                        Tech: {req.assigned_technician}
                      </p>
                    )}

                    {/* Actions based on role and column state */}
                    {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && (
                      <div className="flex gap-2 pt-2 border-t border-slate-100 justify-end">
                        {req.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(req.request_id)}
                              className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 cursor-pointer"
                              title="Approve"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleReject(req.request_id)}
                              className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100 cursor-pointer"
                              title="Reject"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}

                        {req.status === "Approved" && (
                          <button
                            onClick={() => setAssignReqId(req.request_id)}
                            className="btn-secondary py-1 px-2 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus className="h-3 w-3" /> Assign
                          </button>
                        )}

                        {req.status === "In Progress" && (
                          <button
                            onClick={() => setResolveReqId(req.request_id)}
                            className="btn-primary py-1 px-2 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckSquare className="h-3 w-3" /> Resolve
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Tech Modal */}
      {assignReqId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 shadow-xl rounded max-w-sm w-full p-6 relative">
            <button onClick={() => setAssignReqId(null)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
              Assign Repair Technician
            </h3>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Technician Name *</label>
                <input
                  type="text"
                  required
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                  placeholder="e.g. John Doe Tech services"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignReqId(null)}
                  className="btn-secondary py-2 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 text-xs font-bold cursor-pointer">
                  Start Repair
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveReqId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 shadow-xl rounded max-w-sm w-full p-6 relative">
            <button onClick={() => setResolveReqId(null)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
              Mark Maintenance Resolved
            </h3>
            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Resolution Summary *</label>
                <textarea
                  required
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800 h-20"
                  placeholder="Explain what was fixed (e.g. replaced screen module)"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolveReqId(null)}
                  className="btn-secondary py-2 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 text-xs font-bold cursor-pointer">
                  Resolve Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
