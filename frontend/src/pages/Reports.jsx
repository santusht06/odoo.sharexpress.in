import React, { useEffect, useState } from "react";
import { api } from "../api/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, AlertOctagon } from "lucide-react";

export default function Reports() {
  const [utilizationData, setUtilizationData] = useState(null);
  const [idleAssets, setIdleAssets] = useState([]);
  const [maintenanceFrequency, setMaintenanceFrequency] = useState([]);
  const [deptAllocations, setDeptAllocations] = useState([]);

  useEffect(() => {
    api.get("/reports/utilization").then(res => setUtilizationData(res.data.data));
    api.get("/reports/idle-assets").then(res => setIdleAssets(res.data.idle_assets));
    api.get("/reports/maintenance-frequency").then(res => setMaintenanceFrequency(res.data.data));
    api.get("/reports/department-allocation").then(res => setDeptAllocations(res.data.data));
  }, []);

  const COLORS = ["#0052CC", "#0065FF", "#4C9AFF", "#DEEBFF"];

  const utilizationPieData = utilizationData ? [
    { name: "Allocated", value: utilizationData.allocated },
    { name: "Available", value: utilizationData.available },
    { name: "In Maintenance", value: utilizationData.under_maintenance }
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">Exportable metrics detailing category utilization and maintenance cycles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization Chart */}
        <div className="jira-card p-6 bg-white">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
            Utilization Rate
          </h3>
          {utilizationData && (
            <div className="h-64 flex flex-col justify-between">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={utilizationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {utilizationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-around text-center text-xs mt-2">
                <div>
                  <span className="block font-bold text-slate-700">{utilizationData.utilization_rate}%</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Utilization Rate</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-700">{utilizationData.total_bookable}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Bookables</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Department Allocation Chart */}
        <div className="jira-card p-6 bg-white lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
            Department Asset Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptAllocations}>
                <XAxis dataKey="department_name" stroke="#42526E" fontSize={11} />
                <YAxis stroke="#42526E" fontSize={11} />
                <Tooltip />
                <Bar dataKey="allocated_count" fill="#0052CC" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Maintenance Frequency */}
        <div className="jira-card p-6 bg-white">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
            Frequent Repair Assets
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                  <th className="py-2 px-3">Asset</th>
                  <th className="py-2 px-3">Tag</th>
                  <th className="py-2 px-3 text-center">Repair Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenanceFrequency.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-slate-400">No maintenance frequency records</td>
                  </tr>
                ) : (
                  maintenanceFrequency.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{item.asset_name}</td>
                      <td className="py-2 px-3 font-bold text-blue-600">{item.asset_tag}</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-700">{item.maintenance_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Idle Assets */}
        <div className="jira-card p-6 bg-white">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
            Idle Assets Alert (30+ Days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                  <th className="py-2 px-3">Asset</th>
                  <th className="py-2 px-3">Tag</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Office Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {idleAssets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400">No idle assets flagged</td>
                  </tr>
                ) : (
                  idleAssets.slice(0, 5).map((asset) => (
                    <tr key={asset.asset_id}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{asset.name}</td>
                      <td className="py-2 px-3 font-bold text-blue-600">{asset.asset_tag}</td>
                      <td className="py-2 px-3 text-slate-500">{asset.category_name}</td>
                      <td className="py-2 px-3 text-slate-500">{asset.location || "Central Stock"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
