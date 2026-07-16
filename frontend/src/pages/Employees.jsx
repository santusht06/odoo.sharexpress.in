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

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees, toggleEmployeeStatus } from "../store/slices/employeeSlice";
import { fetchDepartments } from "../store/slices/departmentSlice";
import { toast } from "react-toastify";
import { Users, Shield, RefreshCw } from "lucide-react";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, EmptyState, TableSkeleton } from "../components/ui/TableComponents";

export default function Employees() {
  const dispatch = useDispatch();
  const { items: employees, loading } = useSelector((state) => state.employees);
  const { items: departments } = useSelector((state) => state.departments);
  const { user } = useSelector((state) => state.auth);

  const refreshData = () => {
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
  };

  useEffect(() => {
    refreshData();
  }, [dispatch]);

  const handleToggleStatus = (id) => {
    dispatch(toggleEmployeeStatus(id)).unwrap()
      .then(() => toast.success("Employee access control status updated"))
      .catch((err) => toast.error(err));
  };

  return (
    <div className="space-y-6 text-text-primary">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Staff Directory</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Verify employee directory records and manage active access control profiles</p>
        </div>
        <Button variant="secondary" size="sm" onClick={refreshData} className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <TableContainer>
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : employees.length === 0 ? (
          <EmptyState 
            title="No staff employees found" 
            description="The staff directory lists no active user accounts currently." 
          />
        ) : (
          <Table>
            <Thead>
              <Th>Name</Th>
              <Th>Email Address</Th>
              <Th>Department Unit</Th>
              <Th>Access Privileges</Th>
              <Th>Verification State</Th>
              {user?.role === "ADMIN" && (
                <Th className="text-right">Actions</Th>
              )}
            </Thead>
            <Tbody>
              {employees.map((emp) => (
                <Tr key={emp.user_id}>
                  <Td className="font-semibold text-text-primary">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-semibold flex items-center justify-center border border-accent-purple/20 select-none">
                        {emp.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-text-primary">{emp.name}</span>
                    </div>
                  </Td>
                  <Td className="font-medium text-text-secondary">{emp.email}</Td>
                  <Td className="text-text-secondary">{emp.department_name || "Central Unit"}</Td>
                  <Td className="text-text-secondary">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border-primary bg-bg-secondary text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                      <Shield className="h-3 w-3 text-accent-purple" />
                      {emp.role}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge status={emp.is_active ? "Active" : "Retired"} />
                  </Td>
                  {user?.role === "ADMIN" && (
                    <Td className="text-right">
                      {emp.user_id !== user.user_id && (
                        <Button
                          variant={emp.is_active ? "secondary" : "primary"}
                          size="sm"
                          onClick={() => handleToggleStatus(emp.user_id)}
                        >
                          {emp.is_active ? "Suspend" : "Activate"}
                        </Button>
                      )}
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>
    </div>
  );
}
