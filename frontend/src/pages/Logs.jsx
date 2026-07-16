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
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "../components/ui/TableComponents";
import Button from "../components/ui/Button";
import { RefreshCw, Clipboard, Calendar } from "lucide-react";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * 20;
      let url = `/activity-logs?limit=20&skip=${skip}`;
      if (actionFilter) url += `&action=${actionFilter}`;
      if (entityFilter) url += `&entity_type=${entityFilter}`;
      
      const response = await api.get(url);
      if (response.data.success) {
        setLogs(response.data.logs || []);
        setTotal(response.data.total || 0);
      }
    } catch (e) {
      console.error("Failed to fetch activity logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 text-text-primary">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Audit Logs</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Browse system-wide audit records and administrative tracking logs</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchLogs} className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex gap-4 p-4 rounded-xl border border-border-primary bg-bg-card shadow-sm">
        <div className="flex-1">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">Action Type</label>
          <select 
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="w-full bg-bg-secondary border border-border-primary rounded-lg text-xs px-3 py-2 font-medium text-text-primary outline-none focus:border-accent-purple"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="allocate">Allocate</option>
            <option value="return">Return</option>
            <option value="transfer">Transfer</option>
            <option value="verify">Verify</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">Entity Target</label>
          <select 
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="w-full bg-bg-secondary border border-border-primary rounded-lg text-xs px-3 py-2 font-medium text-text-primary outline-none focus:border-accent-purple"
          >
            <option value="">All Entities</option>
            <option value="asset">Asset</option>
            <option value="user">User</option>
            <option value="department">Department</option>
            <option value="booking">Booking</option>
            <option value="maintenance">Maintenance</option>
            <option value="audit">Audit</option>
          </select>
        </div>
      </div>

      <TableContainer>
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted animate-pulse">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <EmptyState 
            title="No logs found" 
            description="No activity matches the current logs criteria."
            icon={Clipboard}
          />
        ) : (
          <Table>
            <Thead>
              <Th>User</Th>
              <Th>Action</Th>
              <Th>Target</Th>
              <Th>Entity ID</Th>
              <Th>Details / Changes</Th>
              <Th>Timestamp</Th>
            </Thead>
            <Tbody>
              {logs.map((log, idx) => (
                <Tr key={log.log_id || idx}>
                  <Td>
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-primary">{log.user_name || "System"}</span>
                      <span className="text-[10px] text-text-muted font-medium">{log.user_email}</span>
                    </div>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded border border-border-primary bg-bg-secondary text-[10px] font-semibold uppercase tracking-wider text-accent-purple">
                      {log.action}
                    </span>
                  </Td>
                  <Td className="font-medium text-text-primary capitalize">{log.entity_type}</Td>
                  <Td className="font-mono text-[10px] text-text-secondary select-all">{log.entity_id || "N/A"}</Td>
                  <Td>
                    <div className="max-w-xs truncate text-[11px] font-medium text-text-secondary">
                      {log.new_value ? JSON.stringify(log.new_value) : "Logged system event details."}
                    </div>
                  </Td>
                  <Td className="text-text-secondary">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Calendar className="h-3 w-3 text-text-muted" />
                      {formatDate(log.timestamp)}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-text-muted font-medium">
            Showing {Math.min(total, (page - 1) * 20 + 1)}-{Math.min(total, page * 20)} of {total} records
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page * 20 >= total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
