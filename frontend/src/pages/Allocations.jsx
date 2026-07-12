import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllocations, allocateAsset, returnAsset } from "../store/slices/allocationSlice";
import { fetchTransfers, requestTransfer, approveTransfer, rejectTransfer } from "../store/slices/transferSlice";
import { fetchAssets } from "../store/slices/assetSlice";
import { fetchEmployees } from "../store/slices/employeeSlice";
import { toast } from "react-toastify";
import { Plus, RefreshCw, Calendar, Check, X } from "lucide-react";

export default function Allocations() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("allocations");

  const { items: allocations } = useSelector((state) => state.allocations);
  const { items: transfers } = useSelector((state) => state.transfers);
  const { items: assets } = useSelector((state) => state.assets);
  const { items: employees } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);

  // Forms
  const [allocAssetId, setAllocAssetId] = useState("");
  const [allocToUser, setAllocToUser] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [allocNotes, setAllocNotes] = useState("");

  const [returnAllocId, setReturnAllocId] = useState(null);
  const [returnCondition, setReturnCondition] = useState("Good");
  const [returnNotes, setReturnNotes] = useState("");

  const [transferAssetId, setTransferAssetId] = useState("");
  const [transferToUser, setTransferToUser] = useState("");
  const [transferNotes, setTransferNotes] = useState("");

  useEffect(() => {
    dispatch(fetchAllocations());
    dispatch(fetchTransfers());
    dispatch(fetchAssets({ status: "Available" }));
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleAllocate = (e) => {
    e.preventDefault();
    if (!allocAssetId || !allocToUser) return;

    dispatch(allocateAsset({
      asset_id: allocAssetId,
      allocated_to: allocToUser,
      expected_return_date: expectedReturn || null,
      notes: allocNotes
    })).unwrap()
      .then(() => {
        toast.success("Asset allocated successfully!");
        setAllocAssetId("");
        setAllocToUser("");
        setExpectedReturn("");
        setAllocNotes("");
        dispatch(fetchAssets({ status: "Available" }));
      })
      .catch((err) => toast.error(err));
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnAllocId) return;

    dispatch(returnAsset({
      allocationId: returnAllocId,
      data: {
        return_condition: returnCondition,
        return_notes: returnNotes
      }
    })).unwrap()
      .then(() => {
        toast.success("Asset returned successfully!");
        setReturnAllocId(null);
        setReturnCondition("Good");
        setReturnNotes("");
        dispatch(fetchAssets({ status: "Available" }));
      })
      .catch((err) => toast.error(err));
  };

  const handleRequestTransfer = (e) => {
    e.preventDefault();
    if (!transferAssetId || !transferToUser) return;

    dispatch(requestTransfer({
      asset_id: transferAssetId,
      to_user: transferToUser,
      notes: transferNotes
    })).unwrap()
      .then(() => {
        toast.success("Transfer request submitted!");
        setTransferAssetId("");
        setTransferToUser("");
        setTransferNotes("");
      })
      .catch((err) => toast.error(err));
  };

  const handleApproveTransfer = (transferId) => {
    dispatch(approveTransfer({ transferId, notes: "Approved transfer." }))
      .unwrap()
      .then(() => toast.success("Transfer approved successfully!"))
      .catch((err) => toast.error(err));
  };

  const handleRejectTransfer = (transferId) => {
    dispatch(rejectTransfer({ transferId, notes: "Rejected transfer." }))
      .unwrap()
      .then(() => toast.success("Transfer rejected"))
      .catch((err) => toast.error(err));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Allocations & Transfers</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">Assign resources to employees or workflow asset re-allocations</p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("allocations")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === "allocations"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" /> Allocations
        </button>
        <button
          onClick={() => setActiveTab("transfers")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === "transfers"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <RefreshCw className="h-4 w-4 inline mr-2" /> Transfers Workflow
        </button>
      </div>

      {activeTab === "allocations" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alloc Form */}
          {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && (
            <div className="jira-card p-6 h-fit bg-white">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
                Allocate Asset
              </h3>
              <form onSubmit={handleAllocate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Available Asset *</label>
                  <select
                    required
                    value={allocAssetId}
                    onChange={(e) => setAllocAssetId(e.target.value)}
                    className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="">Select Asset</option>
                    {assets.map((a) => (
                      <option key={a.asset_id} value={a.asset_id}>{a.name} ({a.asset_tag})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Allocate To Employee *</label>
                  <select
                    required
                    value={allocToUser}
                    onChange={(e) => setAllocToUser(e.target.value)}
                    className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                      <option key={e.user_id} value={e.user_id}>{e.name} ({e.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(e.target.value)}
                    className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                  <textarea
                    value={allocNotes}
                    onChange={(e) => setAllocNotes(e.target.value)}
                    className="jira-input w-full px-3 py-2 text-xs text-slate-800 h-16"
                  />
                </div>

                <button type="submit" className="w-full btn-primary py-2 text-xs font-bold cursor-pointer">
                  Allocate Asset
                </button>
              </form>
            </div>
          )}

          {/* List Allocations */}
          <div className="jira-card p-6 lg:col-span-2 bg-white">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
              Active & Overdue Assignments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Tag</th>
                    <th className="py-2.5 px-3">Holder</th>
                    <th className="py-2.5 px-3">Expected Return</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-slate-400">No active assignments</td>
                    </tr>
                  ) : (
                    allocations.map((a) => (
                      <tr key={a.allocation_id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{a.asset_name}</td>
                        <td className="py-2.5 px-3 font-bold text-blue-600">{a.asset_tag}</td>
                        <td className="py-2.5 px-3 text-slate-600">{a.allocated_to_name}</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {a.expected_return_date ? new Date(a.expected_return_date).toLocaleDateString() : "Permanent"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.status === "Overdue" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && (a.status === "Active" || a.status === "Overdue") && (
                            <button
                              onClick={() => setReturnAllocId(a.allocation_id)}
                              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                            >
                              Process Return
                            </button>
                          )}
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

      {/* Tab B: Transfers Workflow */}
      {activeTab === "transfers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="jira-card p-6 h-fit bg-white">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
              Request Asset Transfer
            </h3>
            <form onSubmit={handleRequestTransfer} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Assigned Asset *</label>
                <select
                  required
                  value={transferAssetId}
                  onChange={(e) => setTransferAssetId(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                >
                  <option value="">Select Asset</option>
                  {allocations.filter(a => a.status === "Active" || a.status === "Overdue").map((a) => (
                    <option key={a.asset_id} value={a.asset_id}>{a.asset_name} ({a.asset_tag})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transfer to Employee *</label>
                <select
                  required
                  value={transferToUser}
                  onChange={(e) => setTransferToUser(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                >
                  <option value="">Select Recipient</option>
                  {employees.map((e) => (
                    <option key={e.user_id} value={e.user_id}>{e.name} ({e.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transfer Justification Notes</label>
                <textarea
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800 h-20"
                />
              </div>

              <button type="submit" className="w-full btn-primary py-2 text-xs font-bold cursor-pointer">
                Submit Request
              </button>
            </form>
          </div>

          <div className="jira-card p-6 lg:col-span-2 bg-white">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
              Pending & Completed Transfers
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Tag</th>
                    <th className="py-2.5 px-3">From</th>
                    <th className="py-2.5 px-3">To</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-slate-400">No transfer requests filed</td>
                    </tr>
                  ) : (
                    transfers.map((t) => (
                      <tr key={t.transfer_id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{t.asset_name}</td>
                        <td className="py-2.5 px-3 font-bold text-blue-600">{t.asset_tag}</td>
                        <td className="py-2.5 px-3 text-slate-500">{t.from_user_name}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-semibold">{t.to_user_name}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : t.status === "Requested"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-rose-50 text-rose-700"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right flex justify-end gap-1.5">
                          {["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(user?.role) && t.status === "Requested" && (
                            <>
                              <button
                                onClick={() => handleApproveTransfer(t.transfer_id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectTransfer(t.transfer_id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
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

      {/* Return Asset Dialog Modal */}
      {returnAllocId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 shadow-xl rounded max-w-md w-full p-6 relative">
            <button
              onClick={() => setReturnAllocId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
              Process Asset Check-In
            </h3>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Return Condition</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                >
                  <option value="Good">Good (Ready to Re-allocate)</option>
                  <option value="Fair">Fair (Minor signs of wear)</option>
                  <option value="Poor">Poor (Needs repair inspection)</option>
                  <option value="Damaged">Damaged (Broken / Out of Service)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Check-in Notes</label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800 h-20"
                  placeholder="Details about components returned (charger, bag, etc.)"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setReturnAllocId(null)}
                  className="btn-secondary py-2 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 text-xs font-bold cursor-pointer">
                  Complete Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
