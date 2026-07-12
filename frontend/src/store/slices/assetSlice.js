import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const fetchAssets = createAsyncThunk(
  "assets/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/assets", { params });
      return res.data.assets;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createAsset = createAsyncThunk(
  "assets/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/assets", data);
      dispatch(fetchAssets());
      return res.data.asset;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateAsset = createAsyncThunk(
  "assets/update",
  async ({ assetId, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/assets/${assetId}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const assetSlice = createSlice({
  name: "assets",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const assetReducer = assetSlice.reducer;
