import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

<<<<<<< HEAD
// Old async thunk: fetch only products (with duplicate filtering)
=======
// Async thunk to fetch all products
>>>>>>> 5c1c301cfb009aae64e0dfbdb06bf7ccbd5c2ece
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, thunkAPI) => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`${baseUrl}/products`, {
        headers: { "Content-Type": "application/json" }
      });
=======
      const response = await axios.get(`${baseUrl}/products`);
>>>>>>> 5c1c301cfb009aae64e0dfbdb06bf7ccbd5c2ece
      console.log("Default response:", response.data);

      // Filter duplicate products by name and merge barcodes if present.
      const productMap = new Map();
      response.data.forEach(item => {
        if (productMap.has(item.name)) {
          const existing = productMap.get(item.name);
<<<<<<< HEAD
=======
          // Merge barcode if it exists and isn't already in the list.
>>>>>>> 5c1c301cfb009aae64e0dfbdb06bf7ccbd5c2ece
          if (item.barcode && !existing.barcodes.includes(item.barcode)) {
            existing.barcodes.push(item.barcode);
          }
        } else {
          productMap.set(item.name, {
            ...item,
<<<<<<< HEAD
=======
            // Initialize barcodes as an array if barcode exists; otherwise empty.
>>>>>>> 5c1c301cfb009aae64e0dfbdb06bf7ccbd5c2ece
            barcodes: item.barcode ? [item.barcode] : []
          });
        }
      });

      const uniqueProducts = Array.from(productMap.values());
      console.log("Unique products:", uniqueProducts);

      return uniqueProducts;
    } catch (error) {
<<<<<<< HEAD
      return thunkAPI.rejectWithValue(error.response ? error.response.data : error.message);
=======
      return thunkAPI.rejectWithValue(error.response.data);
>>>>>>> 5c1c301cfb009aae64e0dfbdb06bf7ccbd5c2ece
    }
  }
);

<<<<<<< HEAD
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
=======
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    loading: false,
    error: null
  },
>>>>>>> 5c1c301cfb009aae64e0dfbdb06bf7ccbd5c2ece
  reducers: {
    // Additional reducers if needed.
  },
  extraReducers: (builder) => {
<<<<<<< HEAD
    // Cases for the old fetchProducts thunk
=======
>>>>>>> 5c1c301cfb009aae64e0dfbdb06bf7ccbd5c2ece
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
<<<<<<< HEAD
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
=======
>>>>>>> 5c1c301cfb009aae64e0dfbdb06bf7ccbd5c2ece
  }
});

export default productsSlice.reducer;
