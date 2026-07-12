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
import { api } from "../api/api";
import { toast } from "react-toastify";
import { Plus, Check, X, UserPlus, CheckSquare } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Drawer from "../components/ui/Drawer";
import StatusBadge from "../components/ui/StatusBadge";
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "../components/ui/TableComponents";
import ImageModal from "../components/ui/ImageModal";

export default function Maintenance() {
  const dispatch = useDispatch();
  const { items: requests } = useSelector((state) => state.maintenance);
  const { items: assets } = useSelector((state) => state.assets);
  const { user } = useSelector((state) => state.auth);

  // Forms drawers
  const [showAddForm, setShowAddForm] = useState(false);
  const [assignReqId, setAssignReqId] = useState(null);
  const [resolveReqId, setResolveReqId] = useState(null);

  // Form fields
  const [assetId, setAssetId] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [techName, setTechName] = useState("");
  const [resNotes, setResNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [viewerPhotoUrl, setViewerPhotoUrl] = useState("");
  const [viewerPhotoTitle, setViewerPhotoTitle] = useState("");

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPhoto(true);
    try {
      const res = await api.post("/assets/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      if (res.data.success) {
        setPhotoUrl(res.data.url);
        toast.success("Incident photo uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image to Cloudinary");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const refreshData = () => {
    dispatch(fetchMaintenanceRequests());
    dispatch(fetchAssets());
  };

  useEffect(() => {
    refreshData();
  }, [dispatch]);

  const handleRaiseRequest = (e) => {
    e.preventDefault();
    if (!assetId || !desc) return;

    dispatch(raiseMaintenanceRequest({
      asset_id: assetId,
      issue_description: desc,
      priority,
      photos: photoUrl ? [photoUrl] : []
    })).unwrap()
      .then(() => {
        toast.success("Maintenance request raised successfully!");
        setShowAddForm(false);
        setAssetId("");
        setDesc("");
        setPriority("Medium");
        setPhotoUrl("");
        refreshData();
      })
      .catch((err) => toast.error(err));
  };

  const handleApprove = (id) => {
    dispatch(approveMaintenanceRequest(id))
      .unwrap()
      .then(() => {
        toast.success("Request approved");
        refreshData();
      })
      .catch((err) => toast.error(err));
  };

  const handleReject = (id) => {
    dispatch(rejectMaintenanceRequest(id))
      .unwrap()
      .then(() => {
        toast.success("Request rejected");
        refreshData();
      })
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
        refreshData();
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
        refreshData();
      })
      .catch((err) => toast.error(err));
  };

  return (
    <div className="space-y-6 text-text-primary">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Repairs & Maintenance</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Log hardware malfunctions, track ticket lines, and verify engineering technician dispatches</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Raise Request
        </Button>
      </div>

      {/* Tickets List */}
      <TableContainer>
        {requests.length === 0 ? (
          <EmptyState 
            title="No maintenance requests" 
            description="There are currently no logged repair tickets or hardware incidents."
            primaryActionLabel="Raise Request"
            onPrimaryAction={() => setShowAddForm(true)}
          />
        ) : (
          <Table>
            <Thead>
              <Th>Asset</Th>
              <Th>Issue Description</Th>
              <Th>Priority</Th>
              <Th>Technician</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </Thead>
            <Tbody>
              {requests.map((req) => (
                <Tr key={req.request_id}>
                  <Td className="font-semibold text-text-primary">
                    <div>
                      <p className="font-semibold">{req.asset_name}</p>
                      <p className="text-[9px] text-accent-purple font-bold mt-0.5">{req.asset_tag}</p>
                    </div>
                  </Td>
                  <Td className="font-medium text-text-secondary leading-relaxed max-w-xs">
                    <div className="flex flex-col gap-1.5">
                      <p className="line-clamp-2" title={req.issue_description}>{req.issue_description}</p>
                      {req.photos && req.photos.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-0.5">
                          {req.photos.map((photo, pIdx) => (
                            <button 
                              key={pIdx} 
                              type="button"
                              onClick={() => {
                                setViewerPhotoUrl(photo);
                                setViewerPhotoTitle(`Malfunction Photo - ${req.asset_name} (${req.asset_tag})`);
                              }}
                              className="inline-block h-10 w-10 rounded-lg overflow-hidden border border-border-primary/80 hover:border-accent-purple/60 transition-colors shadow-sm cursor-zoom-in"
                            >
                              <img 
                                src={photo} 
                                alt="Reported malfunction" 
                                className="h-full w-full object-cover hover:scale-105 transition-transform" 
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.priority === "High" 
                        ? "bg-status-danger/10 text-status-danger" 
                        : req.priority === "Medium"
                        ? "bg-status-warning/10 text-status-warning"
                        : "bg-status-info/10 text-status-info"
                    }`}>
                      {req.priority}
                    </span>
                  </Td>
                  <Td className="text-text-secondary font-medium">
                    {req.technician_name || (
                      <span className="text-text-muted italic">Unassigned</span>
                    )}
                  </Td>
                  <Td>
                    <StatusBadge status={req.status} />
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && ["Pending Approval", "Pending"].includes(req.status) && (
                        <>
                          <button
                            onClick={() => handleApprove(req.request_id)}
                            className="p-1 hover:bg-status-success/10 text-status-success rounded-md transition-colors cursor-pointer"
                            title="Approve Ticket"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(req.request_id)}
                            className="p-1 hover:bg-status-danger/10 text-status-danger rounded-md transition-colors cursor-pointer"
                            title="Reject Ticket"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && req.status === "Approved" && !req.technician_name && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAssignReqId(req.request_id)}
                          className="flex items-center gap-1 text-accent-purple"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Assign Tech
                        </Button>
                      )}

                      {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && ["Under Repair", "In Progress"].includes(req.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setResolveReqId(req.request_id)}
                          className="flex items-center gap-1 text-status-success"
                        >
                          <CheckSquare className="h-3.5 w-3.5" /> Resolve Ticket
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* Raise Request Drawer */}
      <Drawer
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Raise Repair Incident"
        subtitle="Log a hardware issue for specialized tech inspection"
        size="sm"
      >
        <form onSubmit={handleRaiseRequest} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Select Malfunctioning Asset *</label>
            <select
              required
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
            >
              <option value="">Select Asset</option>
              {assets.map((asset) => (
                <option key={asset.asset_id} value={asset.asset_id}>
                  {asset.name} ({asset.asset_tag})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
            >
              <option value="Low">Low (Minor annoyance)</option>
              <option value="Medium">Medium (Functional impact)</option>
              <option value="High">High (System down / blocker)</option>
            </select>
          </div>

          <Input
            label="Issue Malfunction Details"
            type="textarea"
            required
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe hardware cracks, visual issues, hardware components behaving abnormally..."
          />

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Malfunction Pictures (Optional)</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="block w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent-purple/10 file:text-accent-purple hover:file:bg-accent-purple/20 cursor-pointer"
              />
              {uploadingPhoto && <span className="text-[10px] text-accent-purple animate-pulse">Uploading...</span>}
              {photoUrl && (
                <img 
                  src={photoUrl} 
                  alt="Incident Preview" 
                  className="h-10 w-10 object-cover rounded-lg border border-border-primary" 
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Ticket
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Assign Technician Drawer */}
      <Drawer
        isOpen={!!assignReqId}
        onClose={() => setAssignReqId(null)}
        title="Assign Support Specialist"
        subtitle="Route approved repair request to an on-site technician"
        size="sm"
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <Input
            label="Technician Full Name"
            required
            autoFocus
            value={techName}
            onChange={(e) => setTechName(e.target.value)}
            placeholder="e.g. John Doe"
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setAssignReqId(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Assign Dispatcher
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Resolve Incident Drawer */}
      <Drawer
        isOpen={!!resolveReqId}
        onClose={() => setResolveReqId(null)}
        title="Resolve Repair Incident"
        subtitle="Mark ticket closed and document resolution details"
        size="sm"
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <Input
            label="Resolution Inspection Notes"
            type="textarea"
            required
            autoFocus
            value={resNotes}
            onChange={(e) => setResNotes(e.target.value)}
            placeholder="Specify replacement parts, fixes deployed, functionally verified components..."
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setResolveReqId(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Mark Resolved
            </Button>
          </div>
        </form>
      </Drawer>

      <ImageModal
        isOpen={!!viewerPhotoUrl}
        onClose={() => {
          setViewerPhotoUrl("");
          setViewerPhotoTitle("");
        }}
        imageUrl={viewerPhotoUrl}
        title={viewerPhotoTitle}
      />
    </div>
  );
}
