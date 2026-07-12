import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllocations, allocateAsset, returnAsset } from "../store/slices/allocationSlice";
import { fetchTransfers, requestTransfer, approveTransfer, rejectTransfer } from "../store/slices/transferSlice";
import { fetchAssets } from "../store/slices/assetSlice";
import { fetchEmployees } from "../store/slices/employeeSlice";
import { toast } from "react-toastify";
import { Plus, RefreshCw, Calendar, Check, X, ArrowLeftRight } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Drawer from "../components/ui/Drawer";
import StatusBadge from "../components/ui/StatusBadge";
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "../components/ui/TableComponents";

export default function Allocations() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("allocations");

  const { items: allocations } = useSelector((state) => state.allocations);
  const { items: transfers } = useSelector((state) => state.transfers);
  const { items: assets } = useSelector((state) => state.assets);
  const { items: employees } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);

  // Drawer toggles
  const [showAllocForm, setShowAllocForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  // Forms states
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

  const refreshData = () => {
    dispatch(fetchAllocations());
    dispatch(fetchTransfers());
    dispatch(fetchAssets({ status: "Available" }));
    dispatch(fetchEmployees());
  };

  useEffect(() => {
    refreshData();
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
        setShowAllocForm(false);
        setAllocAssetId("");
        setAllocToUser("");
        setExpectedReturn("");
        setAllocNotes("");
        refreshData();
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
        refreshData();
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
        setShowTransferForm(false);
        setTransferAssetId("");
        setTransferToUser("");
        setTransferNotes("");
        refreshData();
      })
      .catch((err) => toast.error(err));
  };

  const handleApproveTransfer = (transferId) => {
    dispatch(approveTransfer({ transferId, notes: "Approved transfer." }))
      .unwrap()
      .then(() => {
        toast.success("Transfer approved successfully!");
        refreshData();
      })
      .catch((err) => toast.error(err));
  };

  const handleRejectTransfer = (transferId) => {
    dispatch(rejectTransfer({ transferId, notes: "Rejected transfer." }))
      .unwrap()
      .then(() => {
        toast.success("Transfer rejected");
        refreshData();
      })
      .catch((err) => toast.error(err));
  };

  return (
    <div className="space-y-6 text-text-primary">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Handovers & Transfers</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Manage team hardware assignments and department relocations</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "allocations" ? (
            ["ADMIN", "ASSET_MANAGER"].includes(user?.role) && (
              <Button
                onClick={() => setShowAllocForm(true)}
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Allocate Asset
              </Button>
            )
          ) : (
            <Button
              onClick={() => setShowTransferForm(true)}
              variant="primary"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" /> Request Transfer
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-primary/80 text-xs">
        <button
          onClick={() => setActiveTab("allocations")}
          className={`px-4.5 py-3 border-b-2 font-medium tracking-tight transition-colors cursor-pointer ${
            activeTab === "allocations"
              ? "border-accent-purple text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 inline mr-2 align-text-bottom" /> Active Assignments
        </button>
        <button
          onClick={() => setActiveTab("transfers")}
          className={`px-4.5 py-3 border-b-2 font-medium tracking-tight transition-colors cursor-pointer ${
            activeTab === "transfers"
              ? "border-accent-purple text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5 inline mr-2 align-text-bottom" /> Relocation Transfers
        </button>
      </div>

      {/* Allocations View */}
      {activeTab === "allocations" && (
        <TableContainer>
          {allocations.length === 0 ? (
            <EmptyState 
              title="No active assignments" 
              description="No company assets are currently checked out to employees."
              primaryActionLabel={["ADMIN", "ASSET_MANAGER"].includes(user?.role) ? "Allocate Asset" : null}
              onPrimaryAction={["ADMIN", "ASSET_MANAGER"].includes(user?.role) ? () => setShowAllocForm(true) : null}
            />
          ) : (
            <Table>
              <Thead>
                <Th>Asset</Th>
                <Th>Tag</Th>
                <Th>Holder</Th>
                <Th>Expected Return</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Thead>
              <Tbody>
                {allocations.map((a) => (
                  <Tr key={a.allocation_id}>
                    <Td className="font-semibold text-text-primary">{a.asset_name}</Td>
                    <Td className="font-bold text-accent-purple">{a.asset_tag}</Td>
                    <Td className="font-medium text-text-secondary">{a.allocated_to_name}</Td>
                    <Td className="text-text-muted">
                      {a.expected_return_date ? new Date(a.expected_return_date).toLocaleDateString() : "Permanent"}
                    </Td>
                    <Td>
                      <StatusBadge status={a.status} />
                    </Td>
                    <Td className="text-right">
                      {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && (a.status === "Active" || a.status === "Overdue") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReturnAllocId(a.allocation_id)}
                          className="text-accent-purple"
                        >
                          Check In
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </TableContainer>
      )}

      {/* Transfers View */}
      {activeTab === "transfers" && (
        <TableContainer>
          {transfers.length === 0 ? (
            <EmptyState 
              title="No transfer requests" 
              description="Inventory items have not been routed for staff relocation transfers."
              primaryActionLabel="Request Transfer"
              onPrimaryAction={() => setShowTransferForm(true)}
            />
          ) : (
            <Table>
              <Thead>
                <Th>Asset</Th>
                <Th>Tag</Th>
                <Th>From Holder</Th>
                <Th>To Recipient</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Thead>
              <Tbody>
                {transfers.map((t) => (
                  <Tr key={t.transfer_id}>
                    <Td className="font-semibold text-text-primary">{t.asset_name}</Td>
                    <Td className="font-bold text-accent-purple">{t.asset_tag}</Td>
                    <Td className="text-text-secondary">{t.from_user_name}</Td>
                    <Td className="font-medium text-text-primary">{t.to_user_name}</Td>
                    <Td>
                      <StatusBadge status={t.status} />
                    </Td>
                    <Td className="text-right">
                      {["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(user?.role) && t.status === "Requested" && (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveTransfer(t.transfer_id)}
                            className="p-1 hover:bg-status-success/10 text-status-success rounded-md border border-transparent hover:border-status-success/20 transition-all cursor-pointer"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectTransfer(t.transfer_id)}
                            className="p-1 hover:bg-status-danger/10 text-status-danger rounded-md border border-transparent hover:border-status-danger/20 transition-all cursor-pointer"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </TableContainer>
      )}

      {/* Allocate Drawer */}
      <Drawer
        isOpen={showAllocForm}
        onClose={() => setShowAllocForm(false)}
        title="Allocate Company Asset"
        subtitle="Handover central store resource to staff member"
        size="sm"
      >
        <form onSubmit={handleAllocate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Select Available Asset *</label>
            <select
              required
              value={allocAssetId}
              onChange={(e) => setAllocAssetId(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
            >
              <option value="">Select Asset</option>
              {assets.map((a) => (
                <option key={a.asset_id} value={a.asset_id}>{a.name} ({a.asset_tag})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Allocate To Employee *</label>
            <select
              required
              value={allocToUser}
              onChange={(e) => setAllocToUser(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e.user_id} value={e.user_id}>{e.name} ({e.email})</option>
              ))}
            </select>
          </div>

          <Input
            label="Expected Return Date"
            type="date"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(e.target.value)}
            description="Leave blank for permanent assignments"
          />

          <Input
            label="Allocation Justification"
            type="textarea"
            value={allocNotes}
            onChange={(e) => setAllocNotes(e.target.value)}
            placeholder="Reason for allocation, project details, etc."
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setShowAllocForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Assign Asset
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Request Transfer Drawer */}
      <Drawer
        isOpen={showTransferForm}
        onClose={() => setShowTransferForm(false)}
        title="Request Relocation Transfer"
        subtitle="Transfer holding assignments directly between staff workers"
        size="sm"
      >
        <form onSubmit={handleRequestTransfer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Select Assigned Asset *</label>
            <select
              required
              value={transferAssetId}
              onChange={(e) => setTransferAssetId(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
            >
              <option value="">Select Asset</option>
              {allocations.filter(a => a.status === "Active" || a.status === "Overdue").map((a) => (
                <option key={a.asset_id} value={a.asset_id}>{a.asset_name} ({a.asset_tag})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Transfer to Recipient *</label>
            <select
              required
              value={transferToUser}
              onChange={(e) => setTransferToUser(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
            >
              <option value="">Select Recipient</option>
              {employees.map((e) => (
                <option key={e.user_id} value={e.user_id}>{e.name} ({e.email})</option>
              ))}
            </select>
          </div>

          <Input
            label="Justification Reason"
            type="textarea"
            value={transferNotes}
            onChange={(e) => setTransferNotes(e.target.value)}
            placeholder="Why is this asset transfer required?"
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setShowTransferForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Request Transfer
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Check In / Return Drawer */}
      <Drawer
        isOpen={!!returnAllocId}
        onClose={() => setReturnAllocId(null)}
        title="Check-In Asset Return"
        subtitle="Record device return and inspect functional hardware state"
        size="sm"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Return Condition State</label>
            <select
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
            >
              <option value="Good">Good (Ready to Re-allocate)</option>
              <option value="Fair">Fair (Minor signs of wear)</option>
              <option value="Poor">Poor (Needs repair inspection)</option>
              <option value="Damaged">Damaged (Broken / Out of Service)</option>
            </select>
          </div>

          <Input
            label="Check-in Inspection Notes"
            type="textarea"
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
            placeholder="Specify returned parts, cables, packaging or hardware wear details..."
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setReturnAllocId(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Process Check-In
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
