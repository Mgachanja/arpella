import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: {} 
  },
  reducers: {
    addItemToCart: (state, action) => {
      const { product } = action.payload;
      const { id } = product;
      if (!id) {
        console.error("Product ID is undefined");
        return;
      }
      if (state.items[id]) {
        state.items[id].quantity += product.quantity;
      } else {
        state.items[id] = product;
      }
      console.log("Cart after addItemToCart:", JSON.parse(JSON.stringify(state.items)));
    },
    removeItemFromCart: (state, action) => {
      const productId = action.payload;
      delete state.items[productId];
      console.log("Cart after removeItemFromCart:", JSON.parse(JSON.stringify(state.items)));
    },
    clearCart: (state) => {
      state.items = {};
      console.log("Cart cleared:", JSON.parse(JSON.stringify(state.items)));
    }
  }
});

export const { addItemToCart, removeItemFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
