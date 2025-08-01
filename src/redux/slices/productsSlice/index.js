import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../../../constants/index';

/** Normalize a single product’s structure */
const normalizeProduct = item => {
  const barcodes = item.barcodes ? [item.barcodes] : [];
  const images  = Array.isArray(item.productimages) ? item.productimages : [];
  const primary = images.find(img => img.isPrimary) || images[0] || {};

  return {
    ...item,
    barcodes,
    productimages: images,
    imageUrl:      primary.imageUrl || null,
    imageId:       primary.id       || null,
    imageLoaded:   Boolean(primary.imageUrl),
    imageFetching: false
  };
};

/** Merge products with the same name into a single record */
const mergeProductsByName = data => {
  const map = new Map();

  data.forEach(item => {
    const key        = item.name;
    const normalized = normalizeProduct(item);

    if (!map.has(key)) {
      map.set(key, normalized);
    } else {
      const existing = map.get(key);

      // Merge unique barcodes
      normalized.barcodes.forEach(code => {
        if (!existing.barcodes.includes(code)) {
          existing.barcodes.push(code);
        }
      });

      // Prefer the first available primary image
      if (!existing.imageUrl && normalized.imageUrl) {
        existing.imageUrl     = normalized.imageUrl;
        existing.imageId      = normalized.imageId;
        existing.imageLoaded  = true;
      }
    }
  });

  return Array.from(map.values());
};

/** Fetch and normalize product list */
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseUrl}/products`);
      const merged  = mergeProductsByName(data);
      return merged;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/** Fetch a single product’s image, if not already present */
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

/** Fetch products and related inventories, categories, subcategories */
export const fetchProductsAndRelated = createAsyncThunk(
  'products/fetchProductsAndRelated',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const prodRes = await axios.get(`${baseUrl}/products`);
      const products = mergeProductsByName(prodRes.data);
      dispatch(setProducts(products));

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
  products:             [],
  inventories:          [],
  categories:           [],
  subcategories:        [],
  loading:              false,
  error:                null,
  imageLoadingStates:   {},
  lastFetchTimestamp:   null,
  fetchRequestCount:    0
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    /** Replace the entire product list in state */
    setProducts(state, action) {
      state.products           = action.payload;
      state.lastFetchTimestamp = Date.now();
    },
    /** Update a single product’s fields */
    updateProduct(state, action) {
      const idx = state.products.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) {
        state.products[idx] = { ...state.products[idx], ...action.payload };
      }
    },
    /** Clear all image-loading indicators */
    clearImageLoadingStates(state) {
      state.imageLoadingStates = {};
    }
  },
  extraReducers: builder => {
    builder
      // productsAndRelated lifecycle
      .addCase(fetchProductsAndRelated.pending, state => {
        state.loading          = true;
        state.error            = null;
        state.fetchRequestCount++;
      })
      .addCase(fetchProductsAndRelated.fulfilled, (state, action) => {
        state.loading          = false;
        state.inventories      = action.payload.inventories;
        state.categories       = action.payload.categories;
        state.subcategories    = action.payload.subcategories;
        state.lastFetchTimestamp = Date.now();
      })
      .addCase(fetchProductsAndRelated.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // fetchProducts lifecycle
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading          = false;
        state.products         = action.payload;
        state.lastFetchTimestamp = Date.now();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // fetchProductImage lifecycle
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
  clearImageLoadingStates
} = productsSlice.actions;

export default productsSlice.reducer;
