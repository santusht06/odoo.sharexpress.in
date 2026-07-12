import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const fetchTransfers = createAsyncThunk(
  "transfers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/transfers");
      return res.data.transfers;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const requestTransfer = createAsyncThunk(
  "transfers/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/transfers", data);
      dispatch(fetchTransfers());
      return res.data.transfer;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const approveTransfer = createAsyncThunk(
  "transfers/approve",
  async ({ transferId, notes }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/transfers/${transferId}/approve`, { notes });
      dispatch(fetchTransfers());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const rejectTransfer = createAsyncThunk(
  "transfers/reject",
  async ({ transferId, notes }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/transfers/${transferId}/reject`, { notes });
      dispatch(fetchTransfers());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const transferSlice = createSlice({
  name: "transfers",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransfers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const transferReducer = transferSlice.reducer;
