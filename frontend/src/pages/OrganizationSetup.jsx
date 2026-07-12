import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDepartments, createDepartment } from "../store/slices/departmentSlice";
import { fetchCategories, createCategory } from "../store/slices/categorySlice";
import { fetchEmployees, promoteEmployeeRole, assignEmployeeDepartment, toggleEmployeeStatus } from "../store/slices/employeeSlice";
import { toast } from "react-toastify";
import { Plus, Settings, Users, FolderTree, ShieldAlert, Sparkles, PlusCircle } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusBadge from "../components/ui/StatusBadge";
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "../components/ui/TableComponents";

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

  const refreshData = () => {
    dispatch(fetchDepartments());
    dispatch(fetchCategories());
    dispatch(fetchEmployees());
  };

  useEffect(() => {
    refreshData();
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
        refreshData();
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
        refreshData();
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
    <div className="space-y-6 text-text-primary">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Organization Master Setup</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Configure corporate structures, physical resource categories, and control user access profiles</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-primary/80 text-xs">
        <button
          onClick={() => setActiveTab("departments")}
          className={`px-4.5 py-3 border-b-2 font-medium tracking-tight transition-colors cursor-pointer ${
            activeTab === "departments"
              ? "border-accent-purple text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <FolderTree className="h-3.5 w-3.5 inline mr-2 align-text-bottom" /> Departments Master
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4.5 py-3 border-b-2 font-medium tracking-tight transition-colors cursor-pointer ${
            activeTab === "categories"
              ? "border-accent-purple text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <Settings className="h-3.5 w-3.5 inline mr-2 align-text-bottom" /> Resource Categories
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-4.5 py-3 border-b-2 font-medium tracking-tight transition-colors cursor-pointer ${
            activeTab === "employees"
              ? "border-accent-purple text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <Users className="h-3.5 w-3.5 inline mr-2 align-text-bottom" /> Access Permissions
        </button>
      </div>

      {/* Tab A: Departments */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Dept Form */}
          <div className="bg-bg-card border border-border-primary rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider border-b border-border-primary/50 pb-3">
              Create Department
            </h3>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <Input
                label="Department Name"
                required
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="e.g. Engineering"
              />

              <Input
                label="Description"
                type="textarea"
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                placeholder="Describe team responsibilities..."
              />

              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Parent Department Scope</label>
                <select
                  value={deptParent}
                  onChange={(e) => setDeptParent(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
                >
                  <option value="">None (Top-Level Unit)</option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Department Lead Specialist</label>
                <select
                  value={deptHead}
                  onChange={(e) => setDeptHead(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {employees.map((e) => (
                    <option key={e.user_id} value={e.user_id}>{e.name} ({e.email})</option>
                  ))}
                </select>
              </div>

              <Button type="submit" variant="primary" className="w-full py-2.5">
                Create Department
              </Button>
            </form>
          </div>

          {/* List Depts */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Corporate Departments</h3>
              <span className="text-[10px] text-text-muted font-medium">Departments list</span>
            </div>
            
            <TableContainer>
              {departments.length === 0 ? (
                <EmptyState title="No departments configured" />
              ) : (
                <Table>
                  <Thead>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Lead Head</Th>
                    <Th>Status</Th>
                  </Thead>
                  <Tbody>
                    {departments.map((d) => (
                      <Tr key={d.department_id}>
                        <Td className="font-semibold text-text-primary">{d.name}</Td>
                        <Td className="text-text-secondary truncate max-w-[200px]" title={d.description}>{d.description || "-"}</Td>
                        <Td className="font-medium text-text-secondary">{d.head_name || "Unassigned"}</Td>
                        <Td>
                          <StatusBadge status={d.status} />
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

      {/* Tab B: Asset Categories */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-bg-card border border-border-primary rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider border-b border-border-primary/50 pb-3">
              Create Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <Input
                label="Category Name"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Laptops"
              />

              <Input
                label="Description"
                type="textarea"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="e.g. Corporate employee laptops..."
              />

              {/* Custom fields definitions */}
              <div className="border border-border-primary rounded-xl p-3 bg-bg-secondary/40 space-y-3">
                <label className="block text-[9px] font-semibold text-text-muted uppercase tracking-wider">Dynamic Specification Fields</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="flex-1 bg-bg-card border border-border-primary text-xs text-text-primary rounded-lg px-2 py-1 placeholder-text-muted focus:border-accent-purple/80 focus:outline-none"
                    placeholder="Field Name (e.g. RAM)"
                  />
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value)}
                    className="bg-bg-card border border-border-primary text-xs text-text-primary rounded-lg px-1.5 py-1 focus:border-accent-purple/80 focus:outline-none cursor-pointer"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addCustomField}
                    className="px-3"
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {customFields.map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-bg-card border border-border-primary px-2.5 py-1 rounded-lg text-xs">
                      <span className="font-semibold text-text-primary">{field.field_name} ({field.field_type})</span>
                      <button
                        type="button"
                        onClick={() => removeCustomField(idx)}
                        className="text-status-danger font-bold hover:underline text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full py-2.5">
                Create Category
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Asset Categories</h3>
              <span className="text-[10px] text-text-muted font-medium">Categories list</span>
            </div>

            <TableContainer>
              {categories.length === 0 ? (
                <EmptyState title="No categories configured" />
              ) : (
                <Table>
                  <Thead>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Custom Fields Count</Th>
                  </Thead>
                  <Tbody>
                    {categories.map((c) => (
                      <Tr key={c.category_id}>
                        <Td className="font-semibold text-text-primary">{c.name}</Td>
                        <Td className="text-text-secondary">{c.description || "-"}</Td>
                        <Td className="font-bold text-accent-purple">
                          {c.custom_fields?.length || 0} fields
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

      {/* Tab C: Employee Directory */}
      {activeTab === "employees" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Staff Role Routing & Access Control</h3>
            <span className="text-[10px] text-text-muted font-medium">Assign roles and units</span>
          </div>

          <TableContainer>
            <Table>
              <Thead>
                <Th>Name</Th>
                <Th>Email Address</Th>
                <Th>Unit / Department</Th>
                <Th>Privilege Role</Th>
                <Th className="text-right">Access Action</Th>
              </Thead>
              <Tbody>
                {employees.map((emp) => (
                  <Tr key={emp.user_id}>
                    <Td className="font-semibold text-text-primary">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-semibold flex items-center justify-center border border-accent-purple/20 select-none">
                          {emp.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </Td>
                    <Td className="font-medium text-text-secondary">{emp.email}</Td>
                    <Td>
                      <select
                        value={emp.department_id || ""}
                        onChange={(e) => {
                          dispatch(assignEmployeeDepartment({ employeeId: emp.user_id, departmentId: e.target.value }))
                            .then(() => toast.success("Department assigned successfully"));
                        }}
                        className="bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-2.5 py-1.5 focus:border-accent-purple/80 focus:outline-none cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {departments.map((d) => (
                          <option key={d.department_id} value={d.department_id}>{d.name}</option>
                        ))}
                      </select>
                    </Td>
                    <Td>
                      <select
                        value={emp.role}
                        onChange={(e) => {
                          dispatch(promoteEmployeeRole({ employeeId: emp.user_id, role: e.target.value }))
                            .then(() => toast.success("Access privileges updated successfully"));
                        }}
                        className="bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-2.5 py-1.5 font-bold focus:border-accent-purple/80 focus:outline-none cursor-pointer"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="ASSET_MANAGER">ASSET_MANAGER</option>
                        <option value="DEPARTMENT_HEAD">DEPARTMENT_HEAD</option>
                        <option value="EMPLOYEE">EMPLOYEE</option>
                      </select>
                    </Td>
                    <Td className="text-right">
                      {emp.user_id !== user.user_id && (
                        <Button
                          variant={emp.is_active ? "secondary" : "primary"}
                          size="sm"
                          onClick={() => {
                            dispatch(toggleEmployeeStatus(emp.user_id))
                              .then(() => toast.success("Access status toggled"));
                          }}
                        >
                          {emp.is_active ? "Suspend" : "Activate"}
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
}
