/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchAssets, createAsset } from "../store/slices/assetSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import { fetchDepartments } from "../store/slices/departmentSlice";
import { toast } from "react-toastify";
import { Plus, Search, Filter, QrCode, RefreshCw } from "lucide-react";
import { api } from "../api/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Drawer from "../components/ui/Drawer";
import StatusBadge from "../components/ui/StatusBadge";
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, EmptyState, TableSkeleton } from "../components/ui/TableComponents";
import ImageModal from "../components/ui/ImageModal";

export default function AssetDirectory() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { items: assets, loading } = useSelector((state) => state.assets);
  const { items: categories } = useSelector((state) => state.categories);
  const { items: departments } = useSelector((state) => state.departments);
  const { user } = useSelector((state) => state.auth);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filter states
  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");
  const [catFilter, setCatFilter] = useState(searchParams.get("category_id") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");

  // Create form states
  const [name, setName] = useState("");
  const [serial, setSerial] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cost, setCost] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [condition, setCondition] = useState("New");
  const [location, setLocation] = useState("");
  const [deptId, setDeptId] = useState("");
  const [isBookable, setIsBookable] = useState(false);
  const [desc, setDesc] = useState("");
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
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image to Cloudinary");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const refreshAssets = () => {
    dispatch(fetchAssets({
      search: searchVal || undefined,
      category_id: catFilter || undefined,
      status: statusFilter || undefined
    }));
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Synchronize state and trigger search when URL search params change
  useEffect(() => {
    const searchParam = searchParams.get("search") || "";
    const catParam = searchParams.get("category_id") || "";
    const statusParam = searchParams.get("status") || "";

    setSearchVal(searchParam);
    setCatFilter(catParam);
    setStatusFilter(statusParam);

    dispatch(fetchAssets({
      search: searchParam || undefined,
      category_id: catParam || undefined,
      status: statusParam || undefined
    }));
  }, [dispatch, searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (searchVal) params.search = searchVal;
    if (catFilter) params.category_id = catFilter;
    if (statusFilter) params.status = statusFilter;
    setSearchParams(params);
  };

  const handleCreateAsset = (e) => {
    e.preventDefault();
    if (!name || !categoryId) return;

    dispatch(createAsset({
      name,
      serial_number: serial || null,
      category_id: categoryId,
      cost: parseFloat(cost),
      purchase_date: purchaseDate || null,
      condition,
      location,
      department_id: deptId || null,
      is_bookable: isBookable,
      description: desc,
      photos: photoUrl ? [photoUrl] : []
    })).unwrap()
      .then(() => {
        toast.success("Asset registered successfully!");
        setShowAddForm(false);
        // Reset states
        setName("");
        setSerial("");
        setCategoryId("");
        setCost(0);
        setPurchaseDate("");
        setCondition("New");
        setLocation("");
        setDeptId("");
        setIsBookable(false);
        setDesc("");
        setPhotoUrl("");
        refreshAssets();
      })
      .catch((err) => toast.error(err));
  };

  const handleViewDetails = (assetId) => {
    setLoadingDetails(true);
    api.get(`/assets/${assetId}`).then((res) => {
      setSelectedAsset(res.data.asset);
    }).catch(err => {
      toast.error("Failed to load details");
    }).finally(() => {
      setLoadingDetails(false);
    });
  };

  return (
    <div className="space-y-6 text-text-primary">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Asset Catalog</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Register, track and inspect enterprise hardware and facilities</p>
        </div>
        {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Register Asset
          </Button>
        )}
      </div>

      {/* Filter Toolbar Form */}
      <form onSubmit={handleFilterSubmit} className="bg-bg-card border border-border-primary rounded-xl p-4.5 flex flex-wrap gap-4 items-end shadow-sm">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Search Keywords</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg pl-9 pr-3.5 py-2 placeholder-text-muted focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all"
              placeholder="Tag, Serial, Name, Location..."
            />
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Category</label>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="w-full sm:w-44 bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <Button type="submit" variant="secondary" size="md" className="flex items-center gap-1.5 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5" /> Filter
        </Button>
      </form>

      {/* Directory Table */}
      <TableContainer>
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : assets.length === 0 ? (
          <EmptyState 
            title="No physical assets registered" 
            description="Start listing system endpoints, company devices, or hardware suites."
            primaryActionLabel={["ADMIN", "ASSET_MANAGER"].includes(user?.role) ? "Register Asset" : null}
            onPrimaryAction={["ADMIN", "ASSET_MANAGER"].includes(user?.role) ? () => setShowAddForm(true) : null}
          />
        ) : (
          <Table>
            <Thead>
              <Th>Tag</Th>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Department</Th>
              <Th>Location</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </Thead>
            <Tbody>
              {assets.map((asset) => (
                <Tr key={asset.asset_id}>
                  <Td className="font-semibold text-accent-purple leading-none">{asset.asset_tag}</Td>
                  <Td className="font-medium text-text-primary">{asset.name}</Td>
                  <Td className="text-text-secondary">{asset.category_name}</Td>
                  <Td className="text-text-secondary">{asset.department_name || "Unassigned"}</Td>
                  <Td className="text-text-muted">{asset.location || "Central Storage"}</Td>
                  <Td>
                    <StatusBadge status={asset.status} />
                  </Td>
                  <Td className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDetails(asset.asset_id)}
                      className="text-accent-purple"
                    >
                      Inspect
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* Register Asset Drawer */}
      <Drawer
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Register New Asset"
        subtitle="Provision physical hardware components and bookables into database"
        size="md"
      >
        <form onSubmit={handleCreateAsset} className="space-y-4">
          <Input
            label="Asset Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Macbook Pro 16"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Serial Number"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="e.g. C02H35..."
            />

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Acquisition Cost ($)"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />

            <Input
              label="Purchase Date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <Input
              label="Location / Office"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Conference Room B"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Assign to Department</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
              >
                <option value="">Unassigned (Central Stock)</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="bookable"
                type="checkbox"
                checked={isBookable}
                onChange={(e) => setIsBookable(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-border-primary bg-bg-secondary text-accent-purple focus:ring-accent-purple"
              />
              <label htmlFor="bookable" className="text-xs font-medium text-text-secondary select-none">
                Shared Bookable Resource
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Asset Photo</label>
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
                  alt="Asset Preview" 
                  className="h-10 w-10 object-cover rounded-lg border border-border-primary" 
                />
              )}
            </div>
          </div>

          <Input
            label="Notes / Description"
            type="textarea"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Additional notes about hardware specs, warranties, etc."
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Registration
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Asset Detail Drawer */}
      <Drawer
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        title={selectedAsset ? selectedAsset.name : "Asset Details"}
        subtitle={selectedAsset ? selectedAsset.asset_tag : ""}
        size="md"
      >
        {selectedAsset && (
          <div className="space-y-6">
            {selectedAsset.photos && selectedAsset.photos.length > 0 && (
              <button 
                type="button"
                onClick={() => {
                  setViewerPhotoUrl(selectedAsset.photos[0]);
                  setViewerPhotoTitle(`Asset Catalog - ${selectedAsset.name} (${selectedAsset.asset_tag})`);
                }}
                className="relative rounded-xl overflow-hidden border border-border-primary h-48 bg-bg-secondary w-full flex items-center justify-center cursor-zoom-in group"
              >
                <img 
                  src={selectedAsset.photos[0]} 
                  alt={selectedAsset.name} 
                  className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" 
                />
              </button>
            )}

            {/* Header info & QR */}
            <div className="flex justify-between items-center bg-bg-secondary border border-border-primary p-4 rounded-xl">
              <div>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Lifecycle Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedAsset.status} />
                </div>
              </div>
              
              {selectedAsset.qr_code_data_url && (
                <div className="flex flex-col items-center border border-border-primary p-2 bg-bg-primary rounded-xl">
                  <img src={selectedAsset.qr_code_data_url} alt="QR Code" className="h-16 w-16" />
                  <span className="text-[9px] text-text-muted font-bold mt-1.5 uppercase flex items-center gap-0.5">
                    <QrCode className="h-3 w-3 text-accent-purple" /> QR Verified
                  </span>
                </div>
              )}
            </div>

            {/* Spec Fields */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-bg-secondary/40 border border-border-primary/60 p-3 rounded-lg">
                <p className="text-text-muted font-medium">Category</p>
                <p className="font-semibold text-text-primary mt-1">{selectedAsset.category_name}</p>
              </div>
              <div className="bg-bg-secondary/40 border border-border-primary/60 p-3 rounded-lg">
                <p className="text-text-muted font-medium">Serial Number</p>
                <p className="font-semibold text-text-primary mt-1 truncate" title={selectedAsset.serial_number}>{selectedAsset.serial_number || "None"}</p>
              </div>
              <div className="bg-bg-secondary/40 border border-border-primary/60 p-3 rounded-lg">
                <p className="text-text-muted font-medium">Acquisition Cost</p>
                <p className="font-semibold text-text-primary mt-1">${selectedAsset.cost}</p>
              </div>
              <div className="bg-bg-secondary/40 border border-border-primary/60 p-3 rounded-lg">
                <p className="text-text-muted font-medium">Condition</p>
                <p className="font-semibold text-text-primary mt-1">{selectedAsset.condition}</p>
              </div>
              <div className="bg-bg-secondary/40 border border-border-primary/60 p-3 rounded-lg">
                <p className="text-text-muted font-medium">Office Location</p>
                <p className="font-semibold text-text-primary mt-1">{selectedAsset.location || "Central Storage"}</p>
              </div>
              <div className="bg-bg-secondary/40 border border-border-primary/60 p-3 rounded-lg">
                <p className="text-text-muted font-medium">Allocated Department</p>
                <p className="font-semibold text-text-primary mt-1">{selectedAsset.department_name || "Unassigned"}</p>
              </div>
            </div>

            {/* Description Notes */}
            {selectedAsset.description && (
              <div className="bg-bg-secondary/40 border border-border-primary/60 p-4.5 rounded-lg text-xs space-y-1">
                <p className="text-text-muted font-medium">Notes & Specifications</p>
                <p className="text-text-secondary leading-relaxed font-medium">{selectedAsset.description}</p>
              </div>
            )}

            {/* Allocation Log History */}
            <div className="border-t border-border-primary pt-5 space-y-3">
              <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Asset Handover History</h4>
              
              {!selectedAsset.allocation_history || selectedAsset.allocation_history.length === 0 ? (
                <p className="text-xs text-text-muted font-medium italic">No allocation events logged for this asset.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedAsset.allocation_history.map((h, i) => (
                    <div key={i} className="bg-bg-secondary border border-border-primary/80 p-3 rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-text-primary">Allocated to: {h.allocated_to_name}</p>
                        <p className="text-[10px] text-text-muted font-medium mt-0.5">Date: {new Date(h.allocated_at).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={h.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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
