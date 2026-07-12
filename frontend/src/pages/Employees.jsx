import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees, toggleEmployeeStatus } from "../store/slices/employeeSlice";
import { fetchDepartments } from "../store/slices/departmentSlice";
import { toast } from "react-toastify";
import { Users, CheckCircle, XCircle } from "lucide-react";

export default function Employees() {
  const dispatch = useDispatch();
  const { items: employees, loading } = useSelector((state) => state.employees);
  const { items: departments } = useSelector((state) => state.departments);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleToggleStatus = (id) => {
    dispatch(toggleEmployeeStatus(id)).unwrap()
      .then(() => toast.success("Employee status updated"))
      .catch((err) => toast.error(err));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employee Directory</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">Browse company staff and verify active system access controls</p>
      </div>

      <div className="jira-card p-6 bg-white">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
          All Registered Employees
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">System Role</th>
                <th className="py-2.5 px-3">Access Status</th>
                {user?.role === "ADMIN" && (
                  <th className="py-2.5 px-3 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.user_id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      {emp.name?.charAt(0).toUpperCase()}
                    </div>
                    {emp.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{emp.email}</td>
                  <td className="py-2.5 px-3 text-slate-500">{emp.department_name || "Unassigned"}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-600">{emp.role}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                      {emp.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {emp.is_active ? "Active" : "Locked"}
                    </span>
                  </td>
                  {user?.role === "ADMIN" && (
                    <td className="py-2.5 px-3 text-right">
                      {emp.user_id !== user.user_id && (
                        <button
                          onClick={() => handleToggleStatus(emp.user_id)}
                          className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                            emp.is_active 
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {emp.is_active ? "Suspend" : "Activate"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
