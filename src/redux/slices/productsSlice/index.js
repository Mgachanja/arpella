import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

// Old async thunk: fetch only products (with duplicate filtering)
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${baseUrl}/products`, {
        headers: { "Content-Type": "application/json" }
      });
      console.log("Default response:", response.data);

      // Filter duplicate products by name and merge barcodes if present.
      const productMap = new Map();
      response.data.forEach(item => {
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
      console.log("Unique products:", uniqueProducts);

      return uniqueProducts;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// New async thunk: fetch products, inventories, categories, and subcategories safely
export const fetchProductsAndRelated = createAsyncThunk(
  'products/fetchProductsAndRelated',
  async (_, thunkAPI) => {
    try {
      // Each request is wrapped with its own catch so that even if it fails, we get an empty array.
      const productsPromise = axios.get(`${baseUrl}/products`, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }).catch(error => {
        console.error("Error fetching products:", error);
        return { data: [] };
      });
      const inventoriesPromise = axios.get(`${baseUrl}/inventories`, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }).catch(error => {
        console.error("Error fetching inventories:", error);
        return { data: [] };
      });
      const categoriesPromise = axios.get(`${baseUrl}/categories`, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }).catch(error => {
        console.error("Error fetching categories:", error);
        return { data: [] };
      });
      const subcategoriesPromise = axios.get(`${baseUrl}/subcategories`, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }).catch(error => {
        console.error("Error fetching subcategories:", error);
        return { data: [] };
      });

      const [productsRes, inventoriesRes, categoriesRes, subcategoriesRes] = await Promise.all([
        productsPromise,
        inventoriesPromise,
        categoriesPromise,
        subcategoriesPromise,
      ]);

      // Process products: filter duplicate products by name and merge barcodes if present.
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
            barcodes: item.barcode ? [item.barcode] : [],
          });
        }
      });
      const uniqueProducts = Array.from(productMap.values());

      return {
        products: uniqueProducts,
        inventories: inventoriesRes.data,
        categories: categoriesRes.data,
        subcategories: subcategoriesRes.data,
      };
    } catch (error) {
      console.error("Error in fetchProductsAndRelated:", error);
      return thunkAPI.rejectWithValue(error.response ? error.response.data : error.message);
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
    // Additional reducers if needed.
  },
  extraReducers: (builder) => {
    // Cases for the old fetchProducts thunk
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    // Cases for the new fetchProductsAndRelated thunk
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
