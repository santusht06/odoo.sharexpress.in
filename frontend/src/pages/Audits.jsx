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
import { Plus, ClipboardCheck, Lock, Eye, AlertTriangle, CheckSquare, XCircle, Slash } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Drawer from "../components/ui/Drawer";
import StatusBadge from "../components/ui/StatusBadge";
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "../components/ui/TableComponents";

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

  const refreshData = () => {
    dispatch(fetchAuditCycles());
    dispatch(fetchDepartments());
    dispatch(fetchEmployees());
    dispatch(fetchAssets());
  };

  useEffect(() => {
    refreshData();
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
        refreshData();
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
          refreshData();
        })
        .catch((err) => toast.error(err));
    }
  };

  return (
    <div className="space-y-6 text-text-primary">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Compliance & Audits</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Verify physical workspace locations, designate checkers, and flags discrepancies</p>
        </div>
        {user?.role === "ADMIN" && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Initialize Cycle
          </Button>
        )}
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Cycles list card */}
        <div className="bg-bg-card border border-border-primary rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-border-primary pb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Compliance Cycles</h3>
            <span className="text-[10px] text-text-muted font-medium">Verification blocks</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {cycles.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No audit cycles started yet</p>
            ) : (
              cycles.map((c) => (
                <div key={c.cycle_id} className="p-3 bg-bg-secondary/40 border border-border-primary rounded-lg flex flex-col justify-between hover:bg-bg-secondary transition-all">
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="text-xs font-semibold text-text-primary truncate" title={c.name}>{c.name}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  
                  <div className="flex gap-2 justify-end mt-1.5 border-t border-border-primary/20 pt-2.5">
                    <Button
                      onClick={() => handleInspectCycle(c)}
                      variant="ghost"
                      size="sm"
                      className="text-[10px] py-1 gap-1"
                    >
                      <ClipboardCheck className="h-3 w-3" /> Verify List
                    </Button>
                    
                    <Button
                      onClick={() => handleLoadReport(c.cycle_id)}
                      variant="secondary"
                      size="sm"
                      className="text-[10px] py-1 gap-1"
                    >
                      <Eye className="h-3 w-3" /> Report
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Active items check table or discrepancy report details */}
        <div className="bg-bg-card border border-border-primary rounded-xl p-5 lg:col-span-2 shadow-sm">
          
          {/* 1. Scoped Verification Screen */}
          {activeCycle && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-border-primary pb-3">
                <div>
                  <span className="text-[9px] text-text-muted font-semibold uppercase tracking-wider">Active verification cycle</span>
                  <h3 className="text-sm font-semibold text-text-primary mt-1">{activeCycle.name}</h3>
                </div>
                {user?.role === "ADMIN" && activeCycle.status === "Open" && (
                  <Button
                    onClick={() => handleCloseCycle(activeCycle.cycle_id)}
                    variant="danger"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5" /> Close & Lock Cycle
                  </Button>
                )}
              </div>

              {/* Scoped list table */}
              <TableContainer>
                {activeCycleDetails.length === 0 ? (
                  <EmptyState 
                    title="No assets matching scope" 
                    description="No hardware matches the department or location filters set for this cycle." 
                  />
                ) : (
                  <Table>
                    <Thead>
                      <Th>Asset Tag</Th>
                      <Th>Asset Name</Th>
                      <Th>Current Status</Th>
                      {activeCycle.status === "Open" && (
                        <Th className="text-right">Verification Results</Th>
                      )}
                    </Thead>
                    <Tbody>
                      {activeCycleDetails.map((asset) => (
                        <Tr key={asset.asset_id}>
                          <Td className="font-bold text-accent-purple">{asset.asset_tag}</Td>
                          <Td className="font-medium text-text-primary">{asset.name}</Td>
                          <Td className="text-text-secondary">{asset.status}</Td>
                          {activeCycle.status === "Open" && (
                            <Td className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  onClick={() => handleRecordEntry(asset.asset_id, "Verified")}
                                  variant="ghost"
                                  size="sm"
                                  className="text-status-success hover:bg-status-success/10 text-[10px] px-2 py-0.5"
                                >
                                  Verify
                                </Button>
                                <Button
                                  onClick={() => handleRecordEntry(asset.asset_id, "Missing")}
                                  variant="ghost"
                                  size="sm"
                                  className="text-status-danger hover:bg-status-danger/10 text-[10px] px-2 py-0.5"
                                >
                                  Missing
                                </Button>
                                <Button
                                  onClick={() => handleRecordEntry(asset.asset_id, "Damaged")}
                                  variant="ghost"
                                  size="sm"
                                  className="text-status-warning hover:bg-status-warning/10 text-[10px] px-2 py-0.5"
                                >
                                  Damaged
                                </Button>
                              </div>
                            </Td>
                          )}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </TableContainer>
            </div>
          )}

          {/* 2. Discrepancy report detail */}
          {discrepancyReport && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border-primary pb-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-status-warning" /> Discrepancy Overview
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-bg-secondary border border-border-primary p-3.5 rounded-xl">
                  <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Total Scoped</p>
                  <p className="text-xl font-light text-text-primary mt-1">{discrepancyReport.summary.total_assets}</p>
                </div>
                <div className="bg-bg-secondary border border-border-primary p-3.5 rounded-xl">
                  <p className="text-[9px] text-status-success font-bold uppercase tracking-wider">Verified</p>
                  <p className="text-xl font-light text-status-success mt-1">{discrepancyReport.summary.verified}</p>
                </div>
                <div className="bg-bg-secondary border border-border-primary p-3.5 rounded-xl animate-pulse">
                  <p className="text-[9px] text-status-danger font-bold uppercase tracking-wider">Missing</p>
                  <p className="text-xl font-light text-status-danger mt-1">{discrepancyReport.summary.missing}</p>
                </div>
                <div className="bg-bg-secondary border border-border-primary p-3.5 rounded-xl">
                  <p className="text-[9px] text-status-warning font-bold uppercase tracking-wider">Damaged</p>
                  <p className="text-xl font-light text-status-warning mt-1">{discrepancyReport.summary.damaged}</p>
                </div>
              </div>

              {/* Discrepancy catalog */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">Flagged Incidents</h4>
                <TableContainer>
                  {discrepancyReport.discrepancies.length === 0 ? (
                    <EmptyState 
                      title="All assets verified" 
                      description="No discrepancies or missing items flagged during this check cycle." 
                    />
                  ) : (
                    <Table>
                      <Thead>
                        <Th>Asset Tag</Th>
                        <Th>Name</Th>
                        <Th>Location</Th>
                        <Th>Incident Status</Th>
                      </Thead>
                      <Tbody>
                        {discrepancyReport.discrepancies.map((d, i) => (
                          <Tr key={i}>
                            <Td className="font-bold text-accent-purple">{d.asset_tag}</Td>
                            <Td className="font-medium text-text-primary">{d.asset_name}</Td>
                            <Td className="text-text-secondary">{d.location || "Unspecified"}</Td>
                            <Td>
                              <StatusBadge status={d.result} />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </TableContainer>
              </div>
            </div>
          )}

          {!activeCycle && !discrepancyReport && (
            <div className="p-16 text-center text-text-muted text-xs font-medium space-y-2">
              <ClipboardCheck className="h-6 w-6 text-accent-purple mx-auto opacity-40 mb-1" />
              <p>Select or inspect an audit cycle from the checklist to record checks.</p>
            </div>
          )}
        </div>
      </div>

      {/* Start Cycle Drawer */}
      <Drawer
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Initialize Compliance Cycle"
        subtitle="Provision checklist cycle audits to scan physical office inventory"
        size="sm"
      >
        <form onSubmit={handleCreateCycle} className="space-y-4">
          <Input
            label="Cycle / Scope Title"
            required
            value={cycleName}
            onChange={(e) => setCycleName(e.target.value)}
            placeholder="e.g. Q3 Hardware Audit 2026"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Department Scope</label>
              <select
                value={scopeDept}
                onChange={(e) => setScopeDept(e.target.value)}
                className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>{d.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Location Scope"
              value={scopeLoc}
              onChange={(e) => setScopeLoc(e.target.value)}
              placeholder="e.g. HQ Office"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Designate Scoped Auditors *</label>
            <select
              multiple
              required
              value={selectedAuditors}
              onChange={handleAuditorChange}
              className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer h-28"
            >
              {employees.map((e) => (
                <option key={e.user_id} value={e.user_id}>{e.name} ({e.email})</option>
              ))}
            </select>
            <p className="text-[9px] text-text-muted font-medium">Hold Cmd/Ctrl keys to choose multiple staff auditors</p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Launch Cycle
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
