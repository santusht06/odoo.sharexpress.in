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

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const fetchEmployees = createAsyncThunk(
  "employees/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/employees");
      return res.data.employees;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const promoteEmployeeRole = createAsyncThunk(
  "employees/promoteRole",
  async ({ employeeId, role }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/employees/${employeeId}/role`, { role });
      dispatch(fetchEmployees());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const assignEmployeeDepartment = createAsyncThunk(
  "employees/assignDepartment",
  async ({ employeeId, departmentId }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/employees/${employeeId}/department`, { department_id: departmentId });
      dispatch(fetchEmployees());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const toggleEmployeeStatus = createAsyncThunk(
  "employees/toggleStatus",
  async (employeeId, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/employees/${employeeId}/toggle-status`);
      dispatch(fetchEmployees());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const employeeReducer = employeeSlice.reducer;
