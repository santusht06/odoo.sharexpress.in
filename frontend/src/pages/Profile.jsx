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

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile } from "../store/slices/authSlice";
import { api } from "../api/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Calendar, 
  Building, 
  History, 
  Edit3, 
  Check, 
  X,
  Activity
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    document.title = "User Profile — AssetFlow";
    if (user) {
      setName(user.user_name || "");
      fetchMyHistory();
    }
  }, [user]);

  const fetchMyHistory = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get("/activity-logs/my-history?limit=5");
      if (res.data && res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Name cannot be empty");
      return;
    }
    setUpdating(true);
    try {
      await dispatch(updateUserProfile(name.trim())).unwrap();
      toast.success("Profile name updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error(err || "Failed to update profile name");
    } finally {
      setUpdating(false);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return isoString;
    }
  };

  const getActionColor = (action) => {
    const act = action?.toUpperCase();
    if (act?.includes("LOGIN") || act?.includes("SIGNUP")) return "status-success";
    if (act?.includes("CREATE") || act?.includes("ALLOCATE")) return "status-success";
    if (act?.includes("UPDATE")) return "status-warning";
    if (act?.includes("DELETE") || act?.includes("REVOKE")) return "status-danger";
    return "text-text-muted bg-bg-secondary";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl font-semibold text-text-primary tracking-tight">Account Profile</h1>
        <p className="text-xs text-text-muted mt-0.5">Manage your personal account settings and audit your session logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Profile Actions */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-bg-card border border-border-primary rounded-2xl p-6 text-center space-y-4">
            <div className="relative inline-block">
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt="Profile" 
                  className="h-20 w-20 rounded-full border border-border-primary mx-auto object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple/20 flex items-center justify-center font-bold text-2xl mx-auto select-none">
                  {user?.user_name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-text-primary truncate">{user?.user_name}</h2>
              <p className="text-xs text-text-muted truncate mt-0.5">{user?.email}</p>
            </div>

            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
                user?.role === "ADMIN" 
                  ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/20"
                  : user?.role === "ASSET_MANAGER"
                  ? "bg-status-success/15 text-status-success border border-status-success/20"
                  : "bg-bg-secondary text-text-muted border border-border-primary"
              }`}>
                <Shield className="h-3 w-3" />
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile details form & Audit Logs */}
        <div className="md:col-span-2 space-y-6">
          {/* Account Information Card */}
          <div className="bg-bg-card border border-border-primary rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border-primary pb-3.5">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-widest flex items-center gap-2">
                <User className="h-4 w-4 text-accent-purple" />
                Personal Details
              </h3>
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="secondary"
                  className="py-1 px-2.5 text-[10px] flex items-center gap-1"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit Name
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateName} className="space-y-4">
                <Input
                  label="Display Name"
                  id="display-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter display name"
                  autoFocus
                />
                
                <div className="flex items-center gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.user_name || "");
                    }}
                    className="py-1.5 px-3 text-[11px] flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={updating}
                    className="py-1.5 px-3 text-[11px] flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-xs">
                <div className="space-y-1">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Display Name
                  </span>
                  <p className="font-medium text-text-primary">{user?.user_name || "—"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email Address
                  </span>
                  <p className="font-medium text-text-primary">{user?.email || "—"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5" />
                    Authentication Mode
                  </span>
                  <p className="font-medium text-text-primary flex items-center gap-1.5 capitalize">
                    {user?.auth_provider || "OTP"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" />
                    Department
                  </span>
                  <p className="font-medium text-text-primary">{user?.department_name || "Unassigned"}</p>
                </div>

                <div className="space-y-1 col-span-2">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Account Registered
                  </span>
                  <p className="font-medium text-text-primary">{formatTimestamp(user?.created_at) || "—"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Security Audit logs Card */}
          <div className="bg-bg-card border border-border-primary rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-widest flex items-center gap-2 border-b border-border-primary pb-3.5">
              <History className="h-4 w-4 text-accent-purple" />
              Recent Activity Audit History
            </h3>

            {logsLoading ? (
              <div className="py-8 text-center text-xs text-text-muted">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">No activity records found.</div>
            ) : (
              <div className="space-y-3.5">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-b border-border-primary/40 last:border-b-0 pb-3 last:pb-0">
                    <div className="h-7 w-7 rounded-lg bg-bg-secondary border border-border-primary flex items-center justify-center shrink-0">
                      <Activity className="h-3.5 w-3.5 text-text-muted" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-mono text-[9px] font-semibold ${
                          getActionColor(log.action) === "status-success" ? "bg-status-success/10 text-status-success" :
                          getActionColor(log.action) === "status-warning" ? "bg-status-warning/10 text-status-warning" :
                          getActionColor(log.action) === "status-danger" ? "bg-status-danger/10 text-status-danger" :
                          "bg-bg-secondary text-text-muted"
                        }`}>
                          {log.action}
                        </span>
                        
                        <span className="text-[10px] text-text-muted font-medium">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-text-primary mt-1 leading-normal text-[11px]">
                        {log.details || `Performed ${log.action} on ${log.entity_type}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
