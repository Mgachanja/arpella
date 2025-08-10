// src/redux/slices/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../../../constants/index';

/** Normalize a single product's structure */
const normalizeProduct = item => {
  const barcodes = item.barcodes ? [item.barcodes] : (Array.isArray(item.barcodes) ? item.barcodes : []);
  const images  = Array.isArray(item.productimages) ? item.productimages : item.productimages ? [item.productimages] : [];
  const primary = images.find(img => img.isPrimary) || images[0] || {};

  return {
    ...item,
    barcodes,
    productimages: images,
    imageUrl:      primary.imageUrl || item.imageUrl || null,
    imageId:       primary.id       || item.imageId || null,
    imageLoaded:   Boolean(primary.imageUrl || item.imageUrl),
    imageFetching: false
  };
};

/** Merge products with the same name into a single record */
const mergeProductsByName = data => {
  const map = new Map();

  data.forEach(raw => {
    const item = normalizeProduct(raw);
    const key        = item.name || `id-${item.id}`;
    if (!map.has(key)) {
      map.set(key, item);
    } else {
      const existing = map.get(key);

      // Merge unique barcodes
      (item.barcodes || []).forEach(code => {
        if (!existing.barcodes.includes(code)) {
          existing.barcodes.push(code);
        }
      });

      // Prefer the first available primary image
      if (!existing.imageUrl && item.imageUrl) {
        existing.imageUrl     = item.imageUrl;
        existing.imageId      = item.imageId;
        existing.imageLoaded  = true;
      }

      // Merge other fields conservatively (prefer existing values)
      existing.price = existing.price ?? item.price;
    }
  });

  return Array.from(map.values());
};

/**
 * API helper for React Query / external fetchers.
 * Returns an object: { items: Array, hasMore: boolean }
 * Keep this exported so productIndex and react-query can use it.
 */
export const fetchProductsApi = async (pageNumber = 1, pageSize = 50) => {
  const url = `${baseUrl}/paged-products?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  const res  = await axios.get(url);
  const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
  const hasMore = items.length === pageSize; // heuristic — adjust if backend provides totalPages/hasMore
  return { items, hasMore };
};

/** Fetch and normalize product list (backwards-compatible thunk) 
 *  If arg is { pageNumber, pageSize } it will fetch that single page.
 *  If arg is undefined it will default to page 1 and pageSize 50 (no full 1400 fetch).
 */
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (arg = { pageNumber: 1, pageSize: 50 }, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 50 } = arg || {};
      const url = `${baseUrl}/paged-products?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      const { data } = await axios.get(url);
      const arr = Array.isArray(data) ? data : (data.items || []);
      const merged = mergeProductsByName(arr);
      // return a shape matching page fetch
      return { items: merged, pageNumber, pageSize, hasMore: arr.length === pageSize };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/** Fetch a single product's image, if not already present */
export const fetchProductImage = createAsyncThunk(
  'products/fetchProductImage',
  async (productId, { getState, rejectWithValue }) => {
    if (!productId) {
      return rejectWithValue('Missing productId');
    }

    const state   = getState();
    const product = state.products.products.find(p => p.id === productId);

    if (!product) {
      return rejectWithValue('Product not found');
    }

    if (product.imageUrl) {
      return { productId, imageUrl: product.imageUrl, cached: true };
    }

    try {
      const response = await axios.get(`${baseUrl}/product-image/${productId}`);
      let imageData   = response.data;

      if (Array.isArray(imageData) && imageData.length > 0) {
        imageData = imageData[0];
      } else if (imageData && typeof imageData === 'object' && imageData['0']) {
        imageData = imageData['0'];
      }

      return {
        productId,
        imageUrl:    imageData.imageUrl || null,
        id:          imageData.id || imageData.imageId || null,
        isPrimary:   Boolean(imageData.isPrimary),
        ...imageData
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/** Fetch products and related inventories, categories, subcategories
 *  Note: trimmed so it doesn't fetch ALL products for the home page.
 *  It fetches related resources and the first page of products (small payload).
 */
export const fetchProductsAndRelated = createAsyncThunk(
  'products/fetchProductsAndRelated',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Fetch only a lightweight products page (page 1) to keep admin/home initial state safe
      const prodRes = await axios.get(`${baseUrl}/paged-products?pageNumber=1&pageSize=50`).catch(() => ({ data: [] }));
      const products = mergeProductsByName(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.items || []));

      // populate products in store (this is safe small-first-page)
      dispatch(setProducts(products));

      // Fetch other related resources concurrently
      const [invRes, catRes, subRes] = await Promise.all([
        axios.get(`${baseUrl}/inventories`).catch(() => ({ data: [] })),
        axios.get(`${baseUrl}/categories`).catch(() => ({ data: [] })),
        axios.get(`${baseUrl}/subcategories`).catch(() => ({ data: [] }))
      ]);

      return {
        products,
        inventories:   Array.isArray(invRes.data) ? invRes.data : [],
        categories:    Array.isArray(catRes.data) ? catRes.data : [],
        subcategories: Array.isArray(subRes.data) ? subRes.data : []
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  // legacy keys kept for selectors/components compatibility
  products:             [],     // flattened array (keeps existing shape)
  inventories:          [],
  categories:           [],
  subcategories:        [],
  loading:              false,
  error:                null,
  imageLoadingStates:   {},
  lastFetchTimestamp:   null,
  fetchRequestCount:    0,

  // new pagination helpers (internal)
  pages: {},               // pages[pageNumber] = { ids: [...], ts }
  productsById: {},        // normalized store by id for O(1) updates
  pageFetchStatus: {},     // pageFetchStatus[pageNumber] = 'pending'|'fulfilled'|'rejected'
  hasMore: true
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    /** Replace the entire product list in state (keeps name) */
    setProducts(state, action) {
      // action.payload can be an array (list) or already processed structure
      const incoming = Array.isArray(action.payload) ? action.payload : (action.payload.items || []);
      // Merge de-duped list by name so we don't create duplicates if called repeatedly
      const merged = mergeProductsByName([...(state.products || []), ...incoming]);

      // update normalized store
      const byId = { ...state.productsById };
      merged.forEach(p => {
        byId[p.id] = p;
      });

      state.products = merged;
      state.productsById = byId;
      state.lastFetchTimestamp = Date.now();
    },

    /** Update a single product's fields */
    updateProduct(state, action) {
      const idx = state.products.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) {
        state.products[idx] = { ...state.products[idx], ...action.payload };
      }
      if (action.payload && action.payload.id) {
        state.productsById[action.payload.id] = {
          ...(state.productsById[action.payload.id] || {}),
          ...action.payload
        };
      }
    },

    /** Clear all image-loading indicators */
    clearImageLoadingStates(state) {
      state.imageLoadingStates = {};
    },

    // internal helpers (not exported by name elsewhere)
    _setPageFulfilled(state, action) {
      const { pageNumber, items } = action.payload;
      state.pageFetchStatus[pageNumber] = 'fulfilled';
      state.pages[pageNumber] = { ids: items.map(i => i.id), ts: Date.now() };

      // merge to products and productsById
      const merged = mergeProductsByName([...(state.products || []), ...items]);
      state.products = merged;
      items.forEach(p => {
        state.productsById[p.id] = { ...(state.productsById[p.id] || {}), ...p };
      });
      state.lastFetchTimestamp = Date.now();
    },

    _setPagePending(state, action) {
      const { pageNumber } = action.payload;
      state.pageFetchStatus[pageNumber] = 'pending';
    },

    _setPageRejected(state, action) {
      const { pageNumber } = action.payload;
      state.pageFetchStatus[pageNumber] = 'rejected';
    },

    _setHasMore(state, action) {
      state.hasMore = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      // productsAndRelated lifecycle (keeps the old flow for categories/inventories)
      .addCase(fetchProductsAndRelated.pending, state => {
        state.loading          = true;
        state.error            = null;
        state.fetchRequestCount++;
      })
      .addCase(fetchProductsAndRelated.fulfilled, (state, action) => {
        state.loading          = false;
        // products was dispatched via setProducts above already
        state.inventories      = action.payload.inventories;
        state.categories       = action.payload.categories;
        state.subcategories    = action.payload.subcategories;
        state.lastFetchTimestamp = Date.now();
      })
      .addCase(fetchProductsAndRelated.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // fetchProducts lifecycle (page-based)
      .addCase(fetchProducts.pending, (state, action) => {
        state.loading = true;
        state.error   = null;
        state.fetchRequestCount++;
        const pageNumber = (action.meta.arg && action.meta.arg.pageNumber) || 1;
        state.pageFetchStatus[pageNumber] = 'pending';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const { items, pageNumber, hasMore } = action.payload;
        // Use internal reducer logic to set page fulfilled semantics
        state.pageFetchStatus[pageNumber] = 'fulfilled';
        state.pages[pageNumber] = { ids: items.map(i => i.id), ts: Date.now() };
        // merge into products and productsById
        const merged = mergeProductsByName([...(state.products || []), ...items]);
        state.products = merged;
        items.forEach(p => {
          state.productsById[p.id] = { ...(state.productsById[p.id] || {}), ...p };
        });
        state.hasMore = typeof hasMore === 'boolean' ? hasMore : state.hasMore;
        state.lastFetchTimestamp = Date.now();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        const pageNumber = (action.meta.arg && action.meta.arg.pageNumber) || 1;
        state.pageFetchStatus[pageNumber] = 'rejected';
        state.error   = action.payload;
      })

      // fetchProductImage lifecycle (preserved)
      .addCase(fetchProductImage.pending, (state, action) => {
        const id = action.meta.arg;
        state.imageLoadingStates[id] = true;
      })
      .addCase(fetchProductImage.fulfilled, (state, action) => {
        const { productId, imageUrl, cached } = action.payload;
        delete state.imageLoadingStates[productId];
        if (!cached && imageUrl) {
          const idx = state.products.findIndex(p => p.id === productId);
          if (idx !== -1) {
            state.products[idx].imageUrl     = imageUrl;
            state.products[idx].imageId      = action.payload.id;
            state.products[idx].imageLoaded  = true;
          }
          state.productsById[productId] = {
            ...(state.productsById[productId] || {}),
            imageUrl: imageUrl,
            imageId: action.payload.id,
            imageLoaded: true
          };
        }
      })
      .addCase(fetchProductImage.rejected, (state, action) => {
        const id = action.meta.arg;
        delete state.imageLoadingStates[id];
      });
  }
});

export const {
  setProducts,
  updateProduct,
  clearImageLoadingStates,
  _setPageFulfilled,
  _setPagePending,
  _setPageRejected,
  _setHasMore
} = productsSlice.actions;

export default productsSlice.reducer;