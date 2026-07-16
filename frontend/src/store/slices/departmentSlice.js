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

export const fetchDepartments = createAsyncThunk(
  "departments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/departments");
      return res.data.departments;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createDepartment = createAsyncThunk(
  "departments/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/departments", data);
      dispatch(fetchDepartments());
      return res.data.department;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "departments/update",
  async ({ deptId, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/departments/${deptId}`, data);
      dispatch(fetchDepartments());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateDepartmentStatus = createAsyncThunk(
  "departments/updateStatus",
  async ({ deptId, status }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/departments/${deptId}/status`, { status });
      dispatch(fetchDepartments());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const departmentReducer = departmentSlice.reducer;
