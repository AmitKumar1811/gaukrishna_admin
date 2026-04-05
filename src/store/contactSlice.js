import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/AxiosInstance';
import { CONTACTS } from '../services/Admin/adminEndPoints';

export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(CONTACTS);
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch contacts');
    }
  }
);

export const updateContactStatus = createAsyncThunk(
  'contacts/updateContactStatus',
  async ({ id, status, read }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`${CONTACTS}/${id}/status`, { status, read });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update contact');
    }
  }
);

export const solveInquiry = createAsyncThunk(
  'contacts/solveInquiry',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`${CONTACTS}/${id}/solve`);
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to resolve inquiry');
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${CONTACTS}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete contact');
    }
  }
);

const contactSlice = createSlice({
  name: 'contacts',
  initialState: {
    contacts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateContactStatus.fulfilled, (state, action) => {
        const index = state.contacts.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
      })
      .addCase(solveInquiry.fulfilled, (state, action) => {
        const index = state.contacts.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter(c => c._id !== action.payload);
      });
  },
});

export default contactSlice.reducer;
