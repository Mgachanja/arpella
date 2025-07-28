// src/redux/slices/productsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../../../constants/index';

// Utility delay
const wait = ms => new Promise(res => setTimeout(res, ms));

// Thunk: fetch only products (de-duplicate by name, merge barcodes)
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseUrl}/products`);
      const map = new Map();
      data.forEach(item => {
        if (map.has(item.name)) {
          const existing = map.get(item.name);
          if (item.barcode && !existing.barcodes.includes(item.barcode)) {
            existing.barcodes.push(item.barcode);
          }
        } else {
          map.set(item.name, {
            ...item,
            barcodes: item.barcode ? [item.barcode] : [],
            imageUrl: null
          });
        }
      });
      return Array.from(map.values());
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk: fetch products + inventories + categories + subcategories
export const fetchProductsAndRelated = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // products
      const prodRes = await axios.get(`${baseUrl}/products`);
      const map = new Map();
      prodRes.data.forEach(item => {
        if (map.has(item.name)) {
          const ex = map.get(item.name);
          if (item.barcode && !ex.barcodes.includes(item.barcode)) {
            ex.barcodes.push(item.barcode);
          }
        } else {
          map.set(item.name, {
            ...item,
            barcodes: item.barcode ? [item.barcode] : [],
            imageUrl: null
          });
        }
      });
      const products = Array.from(map.values());

      await wait(1500);
      const invRes = await axios.get(`${baseUrl}/inventories`);
      await wait(1500);
      const catRes = await axios.get(`${baseUrl}/categories`);
      await wait(1500);
      const subRes = await axios.get(`${baseUrl}/subcategories`);

      return {
        products,
        inventories: Array.isArray(invRes.data) ? invRes.data : [],
        categories: Array.isArray(catRes.data) ? catRes.data : [],
        subcategories: Array.isArray(subRes.data) ? subRes.data : []
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk: fetch a single product's image URL
export const fetchProductImage = createAsyncThunk(
  'products/fetchImage',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseUrl}/product-image/${productId}`);
      // API returns { imageId, productId, imageUrl }
      console.log(`Fetched image for product ${productId}:`, data);
      return { 
        productId: data.productId || productId, 
        imageUrl: data.imageUrl,
        imageId: data.imageId 
      };
    } catch (err) {
      console.error(`Failed to fetch image for product ${productId}:`, err.message);
      return rejectWithValue({ productId, message: err.message });
    }
  }
);

// Thunk: fetch multiple product images at once (batch fetch)
export const fetchMultipleProductImages = createAsyncThunk(
  'products/fetchMultipleImages',
  async (productIds, { rejectWithValue }) => {
    try {
      const imagePromises = productIds.map(async (productId) => {
        try {
          const { data } = await axios.get(`${baseUrl}/product-image/${productId}`);
          console.log(`Batch fetched image for product ${productId}:`, data);
          return { 
            productId: data.productId || productId, 
            imageUrl: data.imageUrl,
            imageId: data.imageId,
            success: true
          };
        } catch (err) {
          console.error(`Failed to batch fetch image for product ${productId}:`, err.message);
          return { 
            productId, 
            success: false, 
            error: err.message 
          };
        }
      });

      const results = await Promise.allSettled(imagePromises);
      return results.map(result => result.status === 'fulfilled' ? result.value : result.reason);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  products: [],
  inventories: [],
  categories: [],
  subcategories: [],
  loading: false,
  error: null,
  imageLoadingStates: {} // Track image loading states per product
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Set image loading state for a product
    setImageLoading: (state, { payload }) => {
      const { productId, loading } = payload;
      state.imageLoadingStates[productId] = loading;
    },
    // Clear all image loading states
    clearImageLoadingStates: (state) => {
      state.imageLoadingStates = {};
    }
  },
  extraReducers: builder => {
    // fetchProducts
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = payload;
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // fetchProductsAndRelated
    builder
      .addCase(fetchProductsAndRelated.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsAndRelated.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = payload.products;
        state.inventories = payload.inventories;
        state.categories = payload.categories;
        state.subcategories = payload.subcategories;
      })
      .addCase(fetchProductsAndRelated.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // fetchProductImage
    builder
      .addCase(fetchProductImage.pending, (state, { meta }) => {
        const productId = meta.arg;
        state.imageLoadingStates[productId] = true;
      })
      .addCase(fetchProductImage.fulfilled, (state, { payload }) => {
        const { productId, imageUrl, imageId } = payload;
        const prod = state.products.find(p => p.id === productId);
        if (prod) {
          prod.imageUrl = imageUrl;
          prod.imageId = imageId;
        }
        state.imageLoadingStates[productId] = false;
        console.log(`Successfully updated product ${productId} with image URL: ${imageUrl}`);
      })
      .addCase(fetchProductImage.rejected, (state, { payload }) => {
        const { productId, message } = payload;
        state.imageLoadingStates[productId] = false;
        console.error(`Image load failed for product ${productId}:`, message);
      });

    // fetchMultipleProductImages
    builder
      .addCase(fetchMultipleProductImages.pending, (state, { meta }) => {
        const productIds = meta.arg;
        productIds.forEach(productId => {
          state.imageLoadingStates[productId] = true;
        });
      })
      .addCase(fetchMultipleProductImages.fulfilled, (state, { payload }) => {
        payload.forEach(result => {
          if (result.success) {
            const { productId, imageUrl, imageId } = result;
            const prod = state.products.find(p => p.id === productId);
            if (prod) {
              prod.imageUrl = imageUrl;
              prod.imageId = imageId;
            }
            state.imageLoadingStates[productId] = false;
            console.log(`Batch update: Successfully updated product ${productId} with image URL: ${imageUrl}`);
          } else {
            state.imageLoadingStates[result.productId] = false;
            console.error(`Batch update: Image load failed for product ${result.productId}:`, result.error);
          }
        });
      })
      .addCase(fetchMultipleProductImages.rejected, (state, { meta }) => {
        const productIds = meta.arg;
        productIds.forEach(productId => {
          state.imageLoadingStates[productId] = false;
        });
      });
  }
});

export const { setImageLoading, clearImageLoadingStates } = productsSlice.actions;
export default productsSlice.reducer;