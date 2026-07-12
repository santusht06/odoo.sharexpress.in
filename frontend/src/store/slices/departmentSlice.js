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
