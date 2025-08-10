// src/redux/slices/stockSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../../../constants/index';

/**
 * Thunks
 *
 * - fetchStockPageData: fetches inventories, categories, subcategories, a small products page and suppliers (one call)
 * - addStockEntriesBulk: adds multiple stock entries sequentially (server must accept single-post per entry)
 * - updateStock: update single inventory record
 * - addCategory, addSubCategory, addProduct, addSupplier: create resources
 * - uploadStockExcel, uploadProductsExcel, uploadImage: file uploads
 * - fetchSuppliers, fetchInvoices, addInvoice, addRestock: misc flows used by the UI
 *
 * All thunks return a normalized payload and use rejectWithValue for consistent errors.
 */

// Helper: normalized axios wrapper returning data or throwing string
const extractError = err => err?.response?.data?.message || err?.response?.data || err?.message || 'Unknown error';

export const fetchStockPageData = createAsyncThunk(
  'stock/fetchStockPageData',
  async (_, { rejectWithValue }) => {
    try {
      // Run lightweight requests in parallel; products request fetches only first page (50)
      const [invRes, catRes, subRes, prodRes, supRes] = await Promise.all([
        axios.get(`${baseUrl}/inventories`).catch(() => ({ data: [] })),
        axios.get(`${baseUrl}/categories`).catch(() => ({ data: [] })),
        axios.get(`${baseUrl}/subcategories`).catch(() => ({ data: [] })),
        axios.get(`${baseUrl}/products/1/50`).catch(() => ({ data: [] })), // safe small page
        axios.get(`${baseUrl}/suppliers`).catch(() => ({ data: [] }))
      ]);

      return {
        inventories: Array.isArray(invRes.data) ? invRes.data : [],
        categories: Array.isArray(catRes.data) ? catRes.data : [],
        subcategories: Array.isArray(subRes.data) ? subRes.data : [],
        products: Array.isArray(prodRes.data) ? prodRes.data : [],
        suppliers: Array.isArray(supRes.data) ? supRes.data : []
      };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const fetchSuppliers = createAsyncThunk(
  'stock/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${baseUrl}/suppliers`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const addStockEntriesBulk = createAsyncThunk(
  'stock/addStockEntriesBulk',
  async ({ invoiceNumber, supplierId, stockEntries }, { rejectWithValue }) => {
    try {
      if (!invoiceNumber || !supplierId || !Array.isArray(stockEntries) || stockEntries.length === 0) {
        return rejectWithValue('Invalid payload for adding stock entries');
      }

      // perform sequential posts to keep load steady and allow individual error handling
      const results = [];
      for (const entry of stockEntries) {
        const payload = {
          invoiceNumber,
          supplierId,
          productId: entry.productId,
          stockQuantity: entry.stockQuantity,
          stockThreshold: entry.stockThreshold,
          stockPrice: entry.stockPrice
        };
        const res = await axios.post(`${baseUrl}/inventory`, payload);
        results.push(res.data);
      }
      return { added: results };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const updateStock = createAsyncThunk(
  'stock/updateStock',
  async (stockPayload, { rejectWithValue }) => {
    try {
      const { productId } = stockPayload;
      if (!productId) return rejectWithValue('Missing productId for update');
      const res = await axios.put(`${baseUrl}/inventory/${productId}`, stockPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const addCategory = createAsyncThunk(
  'stock/addCategory',
  async (categoryName, { rejectWithValue }) => {
    try {
      if (!categoryName || !categoryName.trim()) return rejectWithValue('Category name required');
      const res = await axios.post(`${baseUrl}/category`, { categoryName }, {
        headers: { 'Content-Type': 'application/json' }
      });
      // return new categories list to update UI simply
      const catRes = await axios.get(`${baseUrl}/categories`);
      return Array.isArray(catRes.data) ? catRes.data : [];
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const addSubCategory = createAsyncThunk(
  'stock/addSubCategory',
  async (subCategoryPayload, { rejectWithValue }) => {
    try {
      const { subcategoryName, categoryId } = subCategoryPayload;
      if (!subcategoryName || categoryId == null) return rejectWithValue('Subcategory name and category required');
      await axios.post(`${baseUrl}/subCategory`, subCategoryPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
      const res = await axios.get(`${baseUrl}/subcategories`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const addSupplier = createAsyncThunk(
  'stock/addSupplier',
  async (supplierPayload, { rejectWithValue }) => {
    try {
      if (!supplierPayload.supplierName || !supplierPayload.kraPin) return rejectWithValue('Supplier name and KRA Pin required');
      await axios.post(`${baseUrl}/supplier`, supplierPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
      const res = await axios.get(`${baseUrl}/suppliers`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const addProduct = createAsyncThunk(
  'stock/addProduct',
  async (productPayload, { rejectWithValue }) => {
    try {
      // minimal validation, backend should validate fully
      await axios.post(`${baseUrl}/product`, productPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
      // return first page so UI has a fresh small product list
      const prodRes = await axios.get(`${baseUrl}/products/1/50`);
      return Array.isArray(prodRes.data) ? prodRes.data : [];
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

// File uploads
export const uploadImage = createAsyncThunk(
  'stock/uploadImage',
  async ({ productId, isPrimary, imageFile }, { rejectWithValue }) => {
    try {
      if (!productId || !imageFile) return rejectWithValue('Missing image upload payload');
      const fd = new FormData();
      fd.append('productId', productId);
      fd.append('isPrimary', isPrimary ? 'true' : 'false');
      fd.append('image', imageFile);
      const res = await axios.post(`${baseUrl}/product-image-details`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const uploadStockExcel = createAsyncThunk(
  'stock/uploadStockExcel',
  async (file, { rejectWithValue }) => {
    try {
      if (!file) return rejectWithValue('No file provided');
      const formData = new FormData();
      formData.append('excelFile', file);
      const res = await axios.post(`${baseUrl}inventories`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const uploadProductsExcel = createAsyncThunk(
  'stock/uploadProductsExcel',
  async (file, { rejectWithValue }) => {
    try {
      if (!file) return rejectWithValue('No file provided');
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${baseUrl}/inventories`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const fetchInvoices = createAsyncThunk(
  'stock/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${baseUrl}/invoices`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const addInvoice = createAsyncThunk(
  'stock/addInvoice',
  async (invoicePayload, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${baseUrl}/invoice`, invoicePayload);
      return res.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const addRestock = createAsyncThunk(
  'stock/addRestock',
  async ({ restockMeta, restockEntries }, { rejectWithValue }) => {
    try {
      if (!restockMeta.invoiceNumber || !restockMeta.supplierId) return rejectWithValue('Invoice and supplier required');
      const results = [];
      for (const entry of restockEntries) {
        const payload = {
          invoiceNumber: restockMeta.invoiceNumber,
          supplierId: restockMeta.supplierId,
          productId: entry.productId,
          restockQuantity: entry.restockQuantity,
          purchasePrice: entry.purchasePrice
        };
        const res = await axios.post(`${baseUrl}/restock-log`, payload);
        results.push(res.data);
      }
      return { added: results };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

/** Slice */
const stockSlice = createSlice({
  name: 'stock',
  initialState: {
    inventories: [],
    categories: [],
    subcategories: [],
    products: [],
    suppliers: [],
    invoices: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    // local-only reducers if needed later
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStockPageData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockPageData.fulfilled, (state, action) => {
        state.loading = false;
        state.inventories = action.payload.inventories;
        state.categories = action.payload.categories;
        state.subcategories = action.payload.subcategories;
        state.products = action.payload.products;
        state.suppliers = action.payload.suppliers;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchStockPageData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load stock page data';
      })

      // suppliers
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.error = action.payload;
      })

      // products / categories / subcategories modifications update respective lists
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(addSubCategory.fulfilled, (state, action) => {
        state.subcategories = action.payload;
      })
      .addCase(addSubCategory.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(addSupplier.fulfilled, (state, action) => {
        state.suppliers = action.payload;
      })
      .addCase(addSupplier.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(addProduct.fulfilled, (state, action) => {
        // reset local page of products to the returned small page
        state.products = action.payload;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(uploadImage.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(uploadStockExcel.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(uploadProductsExcel.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload;
      })

      .addCase(addInvoice.fulfilled, (state, action) => {
        state.invoices = [ ...(state.invoices || []), action.payload ];
      });

  }
});

export default stockSlice.reducer;
