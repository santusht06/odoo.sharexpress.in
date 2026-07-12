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
import { 
  Plus, 
  ClipboardCheck, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  ShieldCheck,
  Building,
  MapPin,
  Users
} from "lucide-react";
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
  const { user } = useSelector((state) => state.auth);

  const [showAddForm, setShowAddForm] = useState(false);
  const [cycleName, setCycleName] = useState("");
  const [scopeDept, setScopeDept] = useState("");
  const [scopeLoc, setScopeLoc] = useState("");
  const [selectedAuditors, setSelectedAuditors] = useState([]);

  const [activeCycle, setActiveCycle] = useState(null);
  const [discrepancyReport, setDiscrepancyReport] = useState(null);
  const [activeTab, setActiveTab] = useState("checklist"); // "checklist" or "incidents"

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

  const handleSelectCycle = (cycle) => {
    setActiveCycle(cycle);
    setActiveTab("checklist");
    dispatch(fetchDiscrepancyReport(cycle.cycle_id)).unwrap()
      .then((data) => {
        setDiscrepancyReport(data);
      })
      .catch((err) => {
        toast.error("Failed to load audit discrepancy report: " + err);
        setDiscrepancyReport(null);
      });
  };

  const handleRecordEntry = (assetId, result) => {
    if (!activeCycle) return;
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
        // Reload discrepancy report to dynamically update stats, progress bar, and list rows
        dispatch(fetchDiscrepancyReport(activeCycle.cycle_id)).unwrap()
          .then((data) => {
            setDiscrepancyReport(data);
          });
      })
      .catch((err) => toast.error(err));
  };

  const handleCloseCycle = (cycleId) => {
    if (window.confirm("Closing the cycle will lock all entries and update missing assets to 'Lost'. Proceed?")) {
      dispatch(closeAuditCycle(cycleId)).unwrap()
        .then(() => {
          toast.success("Audit cycle closed. Asset directory records updated.");
          refreshData();
          // Reload cycle and report status
          dispatch(fetchAuditCycles()).unwrap()
            .then((newCycles) => {
              const updated = newCycles.find(c => c.cycle_id === cycleId);
              if (updated) {
                setActiveCycle(updated);
              }
            });
          dispatch(fetchDiscrepancyReport(cycleId)).unwrap()
            .then((data) => {
              setDiscrepancyReport(data);
            });
        })
        .catch((err) => toast.error(err));
    }
  };

  // Compute live statistics from the loaded discrepancy report
  const total = discrepancyReport?.summary?.total_assets || 0;
  const verified = discrepancyReport?.summary?.verified || 0;
  const missing = discrepancyReport?.summary?.missing || 0;
  const damaged = discrepancyReport?.summary?.damaged || 0;
  const unverified = discrepancyReport?.summary?.unverified || 0;
  const completed = verified + missing + damaged;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Filter discrepancies (incidents) list (Verified is excluded, showing only Missing / Damaged / Unverified discrepancies)
  const incidents = discrepancyReport?.discrepancies?.filter(d => d.result !== "Verified") || [];

  return (
    <div className="space-y-6 text-text-primary">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border-primary/60 pb-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Compliance & Audits</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">
            Verify physical workspace locations, designate checkers, and track asset discrepancies.
          </p>
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Card: Cycles Catalog */}
        <div className="bg-bg-card border border-border-primary rounded-xl p-5 space-y-4">
          <div className="border-b border-border-primary/80 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Compliance Cycles</h3>
            <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wide">Select to Inspect</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {cycles.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border-primary rounded-xl">
                <ClipboardCheck className="h-6 w-6 text-text-muted/40 mx-auto mb-2" />
                <p className="text-xs text-text-muted">No audit cycles started yet</p>
              </div>
            ) : (
              cycles.map((c) => {
                const isSelected = activeCycle?.cycle_id === c.cycle_id;
                return (
                  <div
                    key={c.cycle_id}
                    onClick={() => handleSelectCycle(c)}
                    className={`p-4 border rounded-xl flex flex-col justify-between hover:bg-bg-secondary/60 transition-all cursor-pointer select-none ${
                      isSelected 
                        ? "border-accent-purple bg-accent-purple/[0.02]" 
                        : "border-border-primary bg-bg-secondary/35"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-text-primary truncate max-w-[170px]" title={c.name}>
                        {c.name}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>

                    <div className="space-y-1.5 text-[10px] text-text-secondary mt-1">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-text-muted" />
                        <span>Dept Scope: {c.scope_department ? (departments.find(d => d.department_id === c.scope_department)?.name || "Matching Filter") : "All Departments"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-text-muted" />
                        <span>Location: {c.scope_location || "All Locations"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-text-muted" />
                        <span>Checkors: {c.auditor_names?.join(", ") || "No Auditors Assigned"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Card: Dynamic Unified Cycle Inspector */}
        <div className="bg-bg-card border border-border-primary rounded-xl p-5 lg:col-span-2 min-h-[500px]">
          {activeCycle && discrepancyReport ? (
            <div className="space-y-6">
              
              {/* Inspector Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Inspect verification cycle</span>
                    <StatusBadge status={activeCycle.status} />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mt-1">{activeCycle.name}</h3>
                </div>
                {user?.role === "ADMIN" && activeCycle.status === "Open" && (
                  <Button
                    onClick={() => handleCloseCycle(activeCycle.cycle_id)}
                    variant="danger"
                    size="sm"
                    className="flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                  >
                    <Lock className="h-3.5 w-3.5" /> Close & Lock Cycle
                  </Button>
                )}
              </div>

              {/* Progress & Analytics Strip */}
              <div className="bg-bg-secondary/40 border border-border-primary rounded-xl p-4.5 space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-status-success" /> Verification Checklist Progress
                    </span>
                    <span>{progressPercent}% Completed ({completed} / {total} assets scanned)</span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-secondary border border-border-primary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-status-success transition-all duration-500 rounded-full" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-1">
                  <div className="bg-bg-card border border-border-primary/80 p-3 rounded-lg text-center">
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Scoped</p>
                    <p className="text-lg font-semibold text-text-primary mt-0.5">{total}</p>
                  </div>
                  <div className="bg-bg-card border border-border-primary/80 p-3 rounded-lg text-center">
                    <p className="text-[9px] text-status-success font-bold uppercase tracking-wider">Verified</p>
                    <p className="text-lg font-semibold text-status-success mt-0.5">{verified}</p>
                  </div>
                  <div className="bg-bg-card border border-border-primary/80 p-3 rounded-lg text-center">
                    <p className="text-[9px] text-status-danger font-bold uppercase tracking-wider">Missing</p>
                    <p className="text-lg font-semibold text-status-danger mt-0.5">{missing}</p>
                  </div>
                  <div className="bg-bg-card border border-border-primary/80 p-3 rounded-lg text-center">
                    <p className="text-[9px] text-status-warning font-bold uppercase tracking-wider">Damaged</p>
                    <p className="text-lg font-semibold text-status-warning mt-0.5">{damaged}</p>
                  </div>
                  <div className="bg-bg-card border border-border-primary/80 p-3 rounded-lg text-center col-span-2 sm:col-span-1">
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Unverified</p>
                    <p className="text-lg font-semibold text-text-muted mt-0.5">{unverified}</p>
                  </div>
                </div>
              </div>

              {/* Tab navigation */}
              <div className="flex border-b border-border-primary gap-1">
                <button
                  onClick={() => setActiveTab("checklist")}
                  className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === "checklist"
                      ? "border-accent-purple text-accent-purple"
                      : "border-transparent text-text-muted hover:text-text-primary"
                  }`}
                >
                  Verification Checklist ({total})
                </button>
                <button
                  onClick={() => setActiveTab("incidents")}
                  className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === "incidents"
                      ? "border-accent-purple text-accent-purple"
                      : "border-transparent text-text-muted hover:text-text-primary"
                  }`}
                >
                  Flagged Discrepancies ({incidents.length})
                </button>
              </div>

              {/* TAB CONTENT: 1. Verification Checklist */}
              {activeTab === "checklist" && (
                <div className="space-y-4">
                  <TableContainer>
                    {discrepancyReport.discrepancies.length === 0 ? (
                      <EmptyState 
                        title="No assets in scope" 
                        description="There are no assets matching the department or location filters of this cycle." 
                      />
                    ) : (
                      <Table>
                        <Thead>
                          <Th>Asset Tag</Th>
                          <Th>Asset Name</Th>
                          <Th>Location</Th>
                          <Th>Verification State</Th>
                          {activeCycle.status === "Open" && <Th className="text-right">Audit Action</Th>}
                        </Thead>
                        <Tbody>
                          {discrepancyReport.discrepancies.map((asset) => (
                            <Tr key={asset.asset_id}>
                              <Td className="font-bold text-accent-purple">{asset.asset_tag}</Td>
                              <Td className="font-medium text-text-primary">{asset.asset_name}</Td>
                              <Td className="text-text-secondary">{asset.location || "Unspecified"}</Td>
                              <Td>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  asset.result === "Verified" ? "bg-status-success/8 text-status-success border border-status-success/15" :
                                  asset.result === "Missing" ? "bg-status-danger/8 text-status-danger border border-status-danger/15" :
                                  asset.result === "Damaged" ? "bg-status-warning/8 text-status-warning border border-status-warning/15" :
                                  "bg-bg-secondary text-text-muted border border-border-primary"
                                }`}>
                                  {asset.result === "Verified" && <CheckCircle2 className="h-3 w-3" />}
                                  {asset.result === "Missing" && <AlertCircle className="h-3 w-3" />}
                                  {asset.result === "Damaged" && <AlertTriangle className="h-3 w-3" />}
                                  {asset.result === "Unverified" && <HelpCircle className="h-3 w-3" />}
                                  {asset.result}
                                </span>
                              </Td>
                              {activeCycle.status === "Open" && (
                                <Td className="text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => handleRecordEntry(asset.asset_id, "Verified")}
                                      className={`text-[10px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer ${
                                        asset.result === "Verified"
                                          ? "bg-status-success text-white border border-status-success"
                                          : "bg-bg-secondary hover:bg-status-success/10 text-status-success border border-border-primary"
                                      }`}
                                    >
                                      Verify
                                    </button>
                                    <button
                                      onClick={() => handleRecordEntry(asset.asset_id, "Missing")}
                                      className={`text-[10px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer ${
                                        asset.result === "Missing"
                                          ? "bg-status-danger text-white border border-status-danger"
                                          : "bg-bg-secondary hover:bg-status-danger/10 text-status-danger border border-border-primary"
                                      }`}
                                    >
                                      Missing
                                    </button>
                                    <button
                                      onClick={() => handleRecordEntry(asset.asset_id, "Damaged")}
                                      className={`text-[10px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer ${
                                        asset.result === "Damaged"
                                          ? "bg-status-warning text-white border border-status-warning"
                                          : "bg-bg-secondary hover:bg-status-warning/10 text-status-warning border border-border-primary"
                                      }`}
                                    >
                                      Damage
                                    </button>
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

              {/* TAB CONTENT: 2. Incidents & Discrepancies */}
              {activeTab === "incidents" && (
                <div className="space-y-4">
                  <TableContainer>
                    {incidents.length === 0 ? (
                      <div className="text-center py-14 border border-dashed border-border-primary rounded-xl bg-bg-secondary/15">
                        <CheckCircle2 className="h-8 w-8 text-status-success mx-auto mb-2.5 opacity-80" />
                        <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Perfect Alignment</h4>
                        <p className="text-[11px] text-text-muted mt-1 max-w-xs mx-auto leading-relaxed">
                          All assets in this cycle's scope are verified healthy. No missing or damaged items flagged.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <Thead>
                          <Th>Asset Tag</Th>
                          <Th>Name</Th>
                          <Th>Location</Th>
                          <Th>Incidents & State</Th>
                        </Thead>
                        <Tbody>
                          {incidents.map((d, i) => (
                            <Tr key={i}>
                              <Td className="font-bold text-accent-purple">{d.asset_tag}</Td>
                              <Td className="font-medium text-text-primary">{d.asset_name}</Td>
                              <Td className="text-text-secondary">{d.location || "Unspecified"}</Td>
                              <Td>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                                  d.result === "Missing" ? "bg-status-danger/8 text-status-danger border border-status-danger/15" :
                                  d.result === "Damaged" ? "bg-status-warning/8 text-status-warning border border-status-warning/15" :
                                  "bg-bg-secondary text-text-muted border border-border-primary"
                                }`}>
                                  {d.result === "Missing" && <AlertCircle className="h-3 w-3" />}
                                  {d.result === "Damaged" && <AlertTriangle className="h-3 w-3" />}
                                  {d.result === "Unverified" && <HelpCircle className="h-3 w-3" />}
                                  {d.result}
                                </span>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </TableContainer>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-text-muted py-20 space-y-3">
              <div className="h-12 w-12 rounded-full bg-accent-purple/5 border border-accent-purple/10 flex items-center justify-center text-accent-purple">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Audit Details Panel</h3>
              <p className="text-[11px] text-text-muted max-w-xs leading-relaxed">
                Choose a compliance cycle from the directory to verify physical equipment lists, record audits, or review discrepancy logs.
              </p>
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
