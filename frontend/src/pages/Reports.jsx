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
import { api } from "../api/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { BarChart3, TrendingUp, AlertOctagon, RefreshCw, Clipboard } from "lucide-react";
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, EmptyState, TableSkeleton } from "../components/ui/TableComponents";
import Button from "../components/ui/Button";

export default function Reports() {
  const [utilizationData, setUtilizationData] = useState(null);
  const [idleAssets, setIdleAssets] = useState([]);
  const [maintenanceFrequency, setMaintenanceFrequency] = useState([]);
  const [deptAllocations, setDeptAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, iRes, mRes, dRes] = await Promise.all([
        api.get("/reports/utilization"),
        api.get("/reports/idle-assets"),
        api.get("/reports/maintenance-frequency"),
        api.get("/reports/department-allocation")
      ]);
      setUtilizationData(uRes.data.data);
      setIdleAssets(iRes.data.idle_assets || []);
      setMaintenanceFrequency(mRes.data.data || []);
      setDeptAllocations(dRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await api.get(`/reports/export?type=${type}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ["#5E6AD2", "#3B82F6", "#F59E0B", "#EF4444"];

  const utilizationPieData = utilizationData ? [
    { name: "Allocated", value: utilizationData.allocated },
    { name: "Available", value: utilizationData.available },
    { name: "In Maintenance", value: utilizationData.under_maintenance }
  ] : [];

  // Custom premium Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card border border-border-primary rounded-lg p-2.5 shadow-premium text-[11px] font-sans">
          {label && <p className="font-semibold text-text-primary mb-1">{label}</p>}
          {payload.map((pld, idx) => (
            <p key={idx} style={{ color: pld.color || "#5E6AD2" }} className="font-medium">
              {pld.name}: <span className="font-bold text-text-primary ml-1">{pld.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 text-text-primary">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">Reports & Metrics</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Exportable analytical metrics and category distributions</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            onChange={(e) => {
              if (e.target.value) {
                handleExport(e.target.value);
                e.target.value = ""; // Reset value
              }
            }}
            className="bg-bg-card border border-border-primary rounded-lg text-xs px-2.5 py-1.5 font-medium text-text-primary outline-none focus:border-accent-purple"
            defaultValue=""
          >
            <option value="" disabled>Export Report...</option>
            <option value="assets">Assets List (CSV)</option>
            <option value="allocations">Allocations (CSV)</option>
            <option value="maintenance">Maintenance (CSV)</option>
            <option value="bookings">Bookings (CSV)</option>
          </select>
          <Button variant="secondary" size="sm" onClick={fetchData} className="flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
          </Button>
        </div>
      </div>


      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-bg-card border border-border-primary rounded-xl p-6 h-80 animate-pulse" />
          <div className="bg-bg-card border border-border-primary rounded-xl p-6 lg:col-span-2 h-80 animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Utilization Rate Chart */}
          <div className="bg-bg-card border border-border-primary rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider border-b border-border-primary/50 pb-3">
              Utilization Rate
            </h3>
            {utilizationData ? (
              <div className="h-60 flex flex-col justify-between mt-4">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={utilizationPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {utilizationPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-around text-center text-xs mt-2 border-t border-border-primary/40 pt-4">
                  <div>
                    <span className="block font-semibold text-text-primary">{utilizationData.utilization_rate}%</span>
                    <span className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Utilization</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-text-primary">{utilizationData.total_bookable}</span>
                    <span className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Bookables</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-text-primary">{utilizationData.allocated}</span>
                    <span className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Allocated</span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="No metrics available" />
            )}
          </div>

          {/* Department Distribution Chart */}
          <div className="bg-bg-card border border-border-primary rounded-xl p-6 lg:col-span-2 shadow-sm flex flex-col justify-between">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider border-b border-border-primary/50 pb-3">
              Department Distribution
            </h3>
            <div className="h-60 mt-4">
              {deptAllocations.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptAllocations} margin={{ left: -10, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                    <XAxis dataKey="department_name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--secondary-bg)", opacity: 0.4 }} />
                    <Bar dataKey="allocated_count" fill="#5E6AD2" radius={[4, 4, 0, 0]} name="Allocated Count" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No allocation distributions" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lists & Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequent Repair Assets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Frequent Repair Assets</h3>
            <span className="text-[10px] text-text-muted font-medium">Assets in maintenance cycles</span>
          </div>

          <TableContainer>
            {loading ? (
              <TableSkeleton rows={4} cols={3} />
            ) : maintenanceFrequency.length === 0 ? (
              <EmptyState title="No maintenance logs found" icon={AlertOctagon} />
            ) : (
              <Table>
                <Thead>
                  <Th>Tag</Th>
                  <Th>Asset Name</Th>
                  <Th className="text-right">Maintenance Request Count</Th>
                </Thead>
                <Tbody>
                  {maintenanceFrequency.map((item, idx) => (
                    <Tr key={idx}>
                      <Td className="font-semibold text-accent-purple">{item.asset_tag}</Td>
                      <Td className="font-medium text-text-primary">{item.asset_name}</Td>
                      <Td className="text-right font-medium">{item.request_count}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </TableContainer>
        </div>

        {/* Idle Assets List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Idle Central Inventory</h3>
            <span className="text-[10px] text-text-muted font-medium">Assets not currently allocated</span>
          </div>

          <TableContainer>
            {loading ? (
              <TableSkeleton rows={4} cols={3} />
            ) : idleAssets.length === 0 ? (
              <EmptyState title="No idle assets in central inventory" icon={Clipboard} />
            ) : (
              <Table>
                <Thead>
                  <Th>Tag</Th>
                  <Th>Asset Name</Th>
                  <Th>Location</Th>
                </Thead>
                <Tbody>
                  {idleAssets.map((asset) => (
                    <Tr key={asset.asset_id}>
                      <Td className="font-semibold text-accent-purple">{asset.asset_tag}</Td>
                      <Td className="font-medium text-text-primary">{asset.name}</Td>
                      <Td className="font-medium text-text-secondary">{asset.location || "Central Stock"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </TableContainer>
        </div>
      </div>
    </div>
  );
}
