import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../../../constants/index';

// Fetch products and attach any initial product images
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseUrl}/products`);
      const map = new Map();

      data.forEach(item => {
        const key = item.name;
        const barcodes = item.barcodes ? [item.barcodes] : [];
        const imgs = Array.isArray(item.productimages) ? item.productimages : [];
        const primary = imgs.find(i => i.isPrimary) || imgs[0] || {};
        const imageUrl = primary.imageUrl || null;
        const imageId  = primary.id       || null;

        if (!map.has(key)) {
          map.set(key, {
            ...item,
            barcodes,
            productimages: imgs,
            imageUrl,
            imageId
          });
        } else {
          const ex = map.get(key);
          barcodes.forEach(bc => {
            if (!ex.barcodes.includes(bc)) ex.barcodes.push(bc);
          });
        }
      });

      return Array.from(map.values());
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch a single product's image on demand
export const fetchProductImage = createAsyncThunk(
  'products/fetchProductImage',
  async (productId, { rejectWithValue }) => {
    if (!productId) {
      return rejectWithValue('Missing productId');
    }
    try {
      const { data } = await axios.get(`${baseUrl}/product-image/${productId}`);
      
      // Handle different response structures
      let imageData = data;
      
      if (Array.isArray(data) && data.length > 0) {
        imageData = data[0];
      } else if (data && typeof data === 'object' && data['0']) {
        imageData = data['0'];
      } else if (data && data.imageUrl) {
        imageData = data;
      }
      
      return { 
        productId, 
        imageUrl: imageData?.imageUrl || null,
        id: imageData?.id || imageData?.imageId || null,
        imageId: imageData?.imageId || imageData?.id || null,
        isPrimary: imageData?.isPrimary || false,
        ...imageData
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch products and related data
export const fetchProductsAndRelated = createAsyncThunk(
  'products/fetchProductsAndRelated',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const prodRes = await axios.get(`${baseUrl}/products`);
      const map = new Map();
      prodRes.data.forEach(item => {
        const key = item.name;
        const barcodes = item.barcodes ? [item.barcodes] : [];
        const imgs = Array.isArray(item.productimages) ? item.productimages : [];
        const primary = imgs.find(i => i.isPrimary) || imgs[0] || {};
        const imageUrl = primary.imageUrl || null;
        const imageId  = primary.id       || null;

        if (!map.has(key)) {
          map.set(key, {
            ...item,
            barcodes,
            productimages: imgs,
            imageUrl,
            imageId
          });
        } else {
          const ex = map.get(key);
          barcodes.forEach(bc => {
            if (!ex.barcodes.includes(bc)) ex.barcodes.push(bc);
          });
        }
      });
      const products = Array.from(map.values());
      dispatch(setProducts(products));

      // Fetch related data in parallel
      const [invRes, catRes, subRes] = await Promise.all([
        axios.get(`${baseUrl}/inventories`),
        axios.get(`${baseUrl}/categories`),
        axios.get(`${baseUrl}/subcategories`)
      ]);

      return {
        products,
        inventories: Array.isArray(invRes.data) ? invRes.data : [],
        categories:  Array.isArray(catRes.data) ? catRes.data : [],
        subcategories: Array.isArray(subRes.data) ? subRes.data : []
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Batch-fetch images by ID
export const fetchMultipleProductImages = createAsyncThunk(
  'products/fetchMultipleProductImages',
  async (products, { rejectWithValue }) => {
    const valid = products.filter(p => p.id);
    try {
      const results = await Promise.all(
        valid.map(p =>
          axios
            .get(`${baseUrl}/product-image/${p.id}`)
            .then(res => ({ success: true, productId: p.id, ...res.data }))
            .catch(err => ({ success: false, productId: p.id, error: err.message }))
        )
      );
      return results;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Orchestrate batch fetch + merge into state
export const loadAllProductImages = () => async (dispatch, getState) => {
  const { products } = getState().products;
  const images = await dispatch(fetchMultipleProductImages(products)).unwrap();

  const byId = images.reduce((acc, img) => {
    if (img.success) {
      (acc[img.productId] = acc[img.productId] || []).push(img);
    }
    return acc;
  }, {});

  const merged = products.map(p => {
    const extra = byId[p.id] || [];
    const primary = extra.find(i => i.isPrimary) || extra[0] || {};
    return {
      ...p,
      productimages: [...p.productimages, ...extra],
      imageUrl: primary.imageUrl  || p.imageUrl,
      imageId:  primary.id        || p.imageId
    };
  });

  dispatch(setProducts(merged));
};

const initialState = {
  products: [],
  inventories: [],
  categories: [],
  subcategories: [],
  loading: false,
  error: null,
  imageLoadingStates: {}
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setImageLoading: (state, { payload: { productId, loading } }) => {
      state.imageLoadingStates[productId] = loading;
    },
    clearImageLoadingStates: state => {
      state.imageLoadingStates = {};
    }
  },
  extraReducers: builder => {
    builder
      // Handle fetchProductsAndRelated
      .addCase(fetchProductsAndRelated.pending, state => {
        state.loading = true; 
        state.error = null;
      })
      .addCase(fetchProductsAndRelated.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.inventories  = payload.inventories;
        state.categories   = payload.categories;
        state.subcategories = payload.subcategories;
      })
      .addCase(fetchProductsAndRelated.rejected, (state, { payload }) => {
        state.loading = false; 
        state.error = payload;
      })

      // Handle fetchProducts
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
      })

      // Handle fetchProductImage
      .addCase(fetchProductImage.pending, (state, { meta }) => {
        state.imageLoadingStates[meta.arg] = true;
      })
      .addCase(fetchProductImage.fulfilled, (state, { payload }) => {
  const productIndex = state.products.findIndex(p => p.id === payload.productId);
  if (productIndex !== -1) {
    const product = state.products[productIndex];
    
    if (payload.imageUrl && (payload.id || payload.imageId)) {
      const actualImageId = payload.id || payload.imageId;
      const newImage = {
        id: actualImageId,
        imageId: actualImageId,
        imageUrl: payload.imageUrl,
        isPrimary: payload.isPrimary || false,
        ...Object.fromEntries(
          Object.entries(payload).filter(([key]) => key !== 'productId')
        )
      };
      
      const existingImageIndex = product.productimages.findIndex(img => 
        img.id === actualImageId || img.imageId === actualImageId
      );
      if (existingImageIndex === -1) {
        product.productimages.push(newImage);
      } else {
        product.productimages[existingImageIndex] = newImage;
      }
      
      // Update imageUrl and imageId only if they are different
      if (product.imageUrl !== payload.imageUrl) {
        product.imageUrl = payload.imageUrl;
      }
      if (product.imageId !== actualImageId) {
        product.imageId = actualImageId;
      }
    }
  }
  
  state.imageLoadingStates[payload.productId] = false;
})

      .addCase(fetchProductImage.rejected, (state, { meta }) => {
        state.imageLoadingStates[meta.arg] = false;
      })

      // Handle fetchMultipleProductImages
      .addCase(fetchMultipleProductImages.pending, (state, { meta }) => {
        meta.arg.forEach(p => { 
          state.imageLoadingStates[p.id] = true; 
        });
      })
      .addCase(fetchMultipleProductImages.fulfilled, (state, { payload }) => {
        payload.forEach(imageResult => {
          state.imageLoadingStates[imageResult.productId] = false;
          
          if (imageResult.success) {
            const productIndex = state.products.findIndex(p => p.id === imageResult.productId);
            if (productIndex !== -1) {
              const product = state.products[productIndex];
              const newImage = {
                id: imageResult.id,
                imageUrl: imageResult.imageUrl,
                isPrimary: imageResult.isPrimary || false,
                ...imageResult
              };
              
              const existingImageIndex = product.productimages.findIndex(img => img.id === newImage.id);
              if (existingImageIndex === -1) {
                product.productimages.push(newImage);
              } else {
                product.productimages[existingImageIndex] = newImage;
              }
              
              if (newImage.isPrimary || !product.imageUrl) {
                product.imageUrl = imageResult.imageUrl;
                product.imageId = imageResult.id;
              }
            }
          }
        });
      })
      .addCase(fetchMultipleProductImages.rejected, (state, { meta }) => {
        meta.arg.forEach(p => { 
          state.imageLoadingStates[p.id] = false; 
        });
      });
  }
});

export const { setProducts, setImageLoading, clearImageLoadingStates } = productsSlice.actions;
export default productsSlice.reducer;
