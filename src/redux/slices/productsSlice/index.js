import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../../../constants';

// Utility function to delay execution
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Old async thunk: fetch only products (with duplicate filtering)
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${baseUrl}/products`);
      console.log("Default response:", response.data);

      // Filter duplicate products by name and merge barcodes if present.
      const productMap = new Map();
      response.data.forEach(item => {
        if (productMap.has(item.name)) {
          const existing = productMap.get(item.name);
          // Merge barcode if it exists and isn't already in the list.
          if (item.barcode && !existing.barcodes.includes(item.barcode)) {
            existing.barcodes.push(item.barcode);
          }
        } else {
          productMap.set(item.name, {
            ...item,
            barcodes: item.barcode ? [item.barcode] : []
          });
        }
      });

      const uniqueProducts = Array.from(productMap.values());
      console.log("Unique products:", uniqueProducts);

      return uniqueProducts;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// New async thunk: fetch products, inventories, categories, and subcategories sequentially with delay
export const fetchProductsAndRelated = createAsyncThunk(
  'products/fetchProductsAndRelated',
  async (_, thunkAPI) => {
    try {
      // Fetch products
      const productsRes = await axios.get(`${baseUrl}/products`);
      const productMap = new Map();
      productsRes.data.forEach(item => {
        if (productMap.has(item.name)) {
          const existing = productMap.get(item.name);
          if (item.barcode && !existing.barcodes.includes(item.barcode)) {
            existing.barcodes.push(item.barcode);
          }
        } else {
          productMap.set(item.name, {
            ...item,
            barcodes: item.barcode ? [item.barcode] : []
          });
        }
      });
      const uniqueProducts = Array.from(productMap.values());

      await wait(1500);

      // Fetch inventories
      const inventoriesRes = await axios.get(`${baseUrl}/inventories`);
      await wait(1500);

      // Fetch categories
      const categoriesRes = await axios.get(`${baseUrl}/categories`);
      await wait(1500);

      // Fetch subcategories
      const subcategoriesRes = await axios.get(`${baseUrl}/subcategories`);

      return {
        products: uniqueProducts,
        inventories: Array.isArray(inventoriesRes.data) ? inventoriesRes.data : [],
        categories: Array.isArray(categoriesRes.data) ? categoriesRes.data : [],
        subcategories: Array.isArray(subcategoriesRes.data) ? subcategoriesRes.data : [],
      };
    } catch (error) {
      console.error("Data fetch error:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message || "Unknown error");
    }
  }
);

const initialState = {
  products: [],
  inventories: [],
  categories: [],
  subcategories: [],
  loading: false,
  error: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Additional reducers if needed
  },
  extraReducers: (builder) => {
    // Cases for fetchProducts thunk
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
      console.log("Fetched products:", state.products);
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Cases for fetchProductsAndRelated thunk
    builder.addCase(fetchProductsAndRelated.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductsAndRelated.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.inventories = action.payload.inventories;
      state.categories = action.payload.categories;
      state.subcategories = action.payload.subcategories;
    });
    builder.addCase(fetchProductsAndRelated.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export default productsSlice.reducer;
