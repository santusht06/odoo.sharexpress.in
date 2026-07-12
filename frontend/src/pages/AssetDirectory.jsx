import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAssets, createAsset } from "../store/slices/assetSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import { fetchDepartments } from "../store/slices/departmentSlice";
import { toast } from "react-toastify";
import { Plus, Search, Filter, QrCode } from "lucide-react";
import { api } from "../api/api";

export default function AssetDirectory() {
  const dispatch = useDispatch();
  const { items: assets, loading } = useSelector((state) => state.assets);
  const { items: categories } = useSelector((state) => state.categories);
  const { items: departments } = useSelector((state) => state.departments);
  const { user } = useSelector((state) => state.auth);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Filter states
  const [searchVal, setSearchVal] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

  useEffect(() => {
    dispatch(fetchAssets());
    dispatch(fetchCategories());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchAssets({
      search: searchVal || undefined,
      category_id: catFilter || undefined,
      status: statusFilter || undefined
    }));
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
      description: desc
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
      })
      .catch((err) => toast.error(err));
  };

  const handleViewDetails = (assetId) => {
    api.get(`/assets/${assetId}`).then((res) => {
      setSelectedAsset(res.data.asset);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Asset Directory</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Register, track and inspect organization resources</p>
        </div>
        {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2 py-2 text-xs font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Register Asset
          </button>
        )}
      </div>

      {/* Register Asset Form Panel */}
      {showAddForm && (
        <div className="jira-card p-6 bg-white">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
            Register New Asset
          </h3>
          <form onSubmit={handleCreateAsset} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Asset Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                placeholder="e.g. Macbook Pro 16"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Serial Number</label>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                placeholder="e.g. C02H35..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Acquisition Cost</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Location / Office</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                placeholder="e.g. Conference Room B"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign to Department</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
              >
                <option value="">Unassigned (Central Stock)</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                id="bookable"
                type="checkbox"
                checked={isBookable}
                onChange={(e) => setIsBookable(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="bookable" className="text-xs font-bold text-slate-600">
                Shared Bookable Resource
              </label>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes / Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800 h-16"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary py-2 text-xs font-bold cursor-pointer">
                Save Registration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Form */}
      <form onSubmit={handleFilterSubmit} className="jira-card p-4 bg-white flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Search Keywords</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="jira-input w-full pl-9 pr-3 py-1.5 text-xs text-slate-800"
              placeholder="Tag, Serial, Name, Location..."
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="jira-input px-3 py-1.5 text-xs text-slate-800 min-w-[150px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="jira-input px-3 py-1.5 text-xs text-slate-800 min-w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <button type="submit" className="btn-secondary flex items-center gap-1.5 py-1.5 text-xs font-bold cursor-pointer">
          <Filter className="h-3.5 w-3.5" /> Filter
        </button>
      </form>

      {/* Directory Table */}
      <div className="jira-card p-6 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                <th className="py-2.5 px-3">Tag</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-slate-400">No assets matching filters found</td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.asset_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-blue-600">{asset.asset_tag}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{asset.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{asset.category_name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{asset.department_name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{asset.location || "Central Storage"}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        asset.status === "Available"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : asset.status === "Allocated"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : asset.status === "Under Maintenance"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleViewDetails(asset.asset_id)}
                        className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                      >
                        Inspect details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 shadow-xl rounded max-w-2xl w-full p-6 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAsset(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{selectedAsset.asset_tag}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedAsset.name}</h3>
              </div>
              {selectedAsset.qr_code_data_url && (
                <div className="flex flex-col items-center border border-slate-100 p-2 bg-slate-50/50 rounded">
                  <img src={selectedAsset.qr_code_data_url} alt="QR Code" className="h-16 w-16" />
                  <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase flex items-center gap-0.5">
                    <QrCode className="h-2.5 w-2.5" /> Scan QR
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
              <div>
                <p className="text-slate-400 font-semibold">Category</p>
                <p className="font-bold text-slate-700 mt-0.5">{selectedAsset.category_name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Serial Number</p>
                <p className="font-bold text-slate-700 mt-0.5">{selectedAsset.serial_number || "None"}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Cost</p>
                <p className="font-bold text-slate-700 mt-0.5">${selectedAsset.cost}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Condition</p>
                <p className="font-bold text-slate-700 mt-0.5">{selectedAsset.condition}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Location</p>
                <p className="font-bold text-slate-700 mt-0.5">{selectedAsset.location || "Central Storage"}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Current Department</p>
                <p className="font-bold text-slate-700 mt-0.5">{selectedAsset.department_name}</p>
              </div>
            </div>

            {/* Nested Allocation History */}
            {selectedAsset.allocation_history?.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Allocation Log</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedAsset.allocation_history.map((h, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200/60 p-2.5 rounded text-xs flex justify-between">
                      <div>
                        <p className="font-bold text-slate-800">To: {h.allocated_to_name}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Assigned: {new Date(h.allocated_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold h-fit ${
                        h.status === "Active" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                      }`}>{h.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
