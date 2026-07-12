import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDepartments, createDepartment, updateDepartment } from "../store/slices/departmentSlice";
import { fetchCategories, createCategory } from "../store/slices/categorySlice";
import { fetchEmployees, promoteEmployeeRole, assignEmployeeDepartment, toggleEmployeeStatus } from "../store/slices/employeeSlice";
import { toast } from "react-toastify";
import { Plus, Settings, Users, FolderTree, ShieldAlert } from "lucide-react";

export default function OrganizationSetup() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("departments");

  const { items: departments } = useSelector((state) => state.departments);
  const { items: categories } = useSelector((state) => state.categories);
  const { items: employees } = useSelector((state) => state.employees);

  // Forms states
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptParent, setDeptParent] = useState("");
  const [deptHead, setDeptHead] = useState("");

  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("text");

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchCategories());
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleCreateDept = (e) => {
    e.preventDefault();
    if (!deptName) return;

    dispatch(createDepartment({
      name: deptName,
      description: deptDesc,
      parent_id: deptParent || null,
      head_id: deptHead || null
    })).unwrap()
      .then(() => {
        toast.success("Department created successfully!");
        setDeptName("");
        setDeptDesc("");
        setDeptParent("");
        setDeptHead("");
      })
      .catch((err) => toast.error(err));
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!catName) return;

    dispatch(createCategory({
      name: catName,
      description: catDesc,
      custom_fields: customFields
    })).unwrap()
      .then(() => {
        toast.success("Category created successfully!");
        setCatName("");
        setCatDesc("");
        setCustomFields([]);
      })
      .catch((err) => toast.error(err));
  };

  const addCustomField = () => {
    if (!fieldName) return;
    setCustomFields([...customFields, { field_name: fieldName, field_type: fieldType, required: false }]);
    setFieldName("");
  };

  const removeCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Organization Master Setup</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">Configure master departments, asset categories, and control user access policies</p>
      </div>

      {/* Tabs Headers */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("departments")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === "departments"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FolderTree className="h-4 w-4 inline mr-2" /> Departments
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === "categories"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Settings className="h-4 w-4 inline mr-2" /> Asset Categories
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === "employees"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" /> Employee Directory
        </button>
      </div>

      {/* Tab A: Departments */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Dept Form */}
          <div className="jira-card p-6 h-fit">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Create Department
            </h3>
            <form onSubmit={handleCreateDept} className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                  placeholder="e.g. Engineering"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800 h-20"
                  placeholder="e.g. Software developments team"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Parent Department</label>
                <select
                  value={deptParent}
                  onChange={(e) => setDeptParent(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                >
                  <option value="">None (Top-Level)</option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department Head</label>
                <select
                  value={deptHead}
                  onChange={(e) => setDeptHead(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                >
                  <option value="">Unassigned</option>
                  {employees.map((e) => (
                    <option key={e.user_id} value={e.user_id}>{e.name} ({e.email})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full btn-primary py-2 text-xs font-bold cursor-pointer">
                Create Department
              </button>
            </form>
          </div>

          {/* List Depts */}
          <div className="jira-card p-6 lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Departments List
            </h3>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Head</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-slate-400">No departments configured</td>
                    </tr>
                  ) : (
                    departments.map((d) => (
                      <tr key={d.department_id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{d.name}</td>
                        <td className="py-2.5 px-3 text-slate-500 truncate max-w-[200px]">{d.description}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{d.head_name || "Unassigned"}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {d.status}
                          </span>
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

      {/* Tab B: Asset Categories */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="jira-card p-6 h-fit">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Create Asset Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                  placeholder="e.g. Laptops"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800 h-20"
                  placeholder="e.g. Enterprise computers"
                />
              </div>

              {/* Custom fields definitions */}
              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">Category Specific Fields</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="jira-input flex-1 px-2 py-1 text-xs"
                    placeholder="Field Name (e.g. RAM)"
                  />
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value)}
                    className="jira-input px-2 py-1 text-xs"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="px-2 py-1 bg-slate-800 text-white rounded text-xs hover:bg-slate-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-3 space-y-1.5">
                  {customFields.map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1 rounded text-xs">
                      <span className="font-semibold text-slate-700">{field.field_name} ({field.field_type})</span>
                      <button
                        type="button"
                        onClick={() => removeCustomField(idx)}
                        className="text-red-500 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-2 text-xs font-bold cursor-pointer">
                Create Category
              </button>
            </form>
          </div>

          <div className="jira-card p-6 lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Asset Categories List
            </h3>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Custom Fields Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-slate-400">No categories configured</td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c.category_id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{c.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{c.description}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-600">
                          {c.custom_fields?.length || 0} fields
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

      {/* Tab C: Employee Directory */}
      {activeTab === "employees" && (
        <div className="jira-card p-6">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
            Employee Directory & Access Policy
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Current Role</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.user_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{emp.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{emp.email}</td>
                    <td className="py-2.5 px-3">
                      <select
                        value={emp.department_id || ""}
                        onChange={(e) => {
                          dispatch(assignEmployeeDepartment({ employeeId: emp.user_id, departmentId: e.target.value }))
                            .then(() => toast.success("Department updated successfully"));
                        }}
                        className="jira-input px-2 py-1 text-xs"
                      >
                        <option value="">Unassigned</option>
                        {departments.map((d) => (
                          <option key={d.department_id} value={d.department_id}>{d.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={emp.role}
                        onChange={(e) => {
                          dispatch(promoteEmployeeRole({ employeeId: emp.user_id, role: e.target.value }))
                            .then(() => toast.success("Access role updated successfully"));
                        }}
                        className="jira-input px-2 py-1 text-xs font-bold"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="ASSET_MANAGER">ASSET_MANAGER</option>
                        <option value="DEPARTMENT_HEAD">DEPARTMENT_HEAD</option>
                        <option value="EMPLOYEE">EMPLOYEE</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          dispatch(toggleEmployeeStatus(emp.user_id))
                            .then(() => toast.success("Employee status toggled"));
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                          emp.is_active 
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {emp.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
