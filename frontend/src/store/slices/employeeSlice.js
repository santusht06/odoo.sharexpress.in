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
