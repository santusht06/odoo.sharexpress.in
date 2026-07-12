import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const fetchAllocations = createAsyncThunk(
  "allocations/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/allocations", { params });
      return res.data.allocations;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const allocateAsset = createAsyncThunk(
  "allocations/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/allocations", data);
      dispatch(fetchAllocations());
      return res.data.allocation;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const returnAsset = createAsyncThunk(
  "allocations/return",
  async ({ allocationId, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/allocations/${allocationId}/return`, data);
      dispatch(fetchAllocations());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const allocationSlice = createSlice({
  name: "allocations",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllocations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const allocationReducer = allocationSlice.reducer;
