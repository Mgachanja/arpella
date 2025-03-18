import axios from 'axios';

export let products = [];
const baseUrl = process.env.REACT_APP_BASE_API_URL;

export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${baseUrl}/products`);
    
    // Log the default response data from the API.
    console.log("Default response:", response.data);

    // Filter unique products based on name.
    const productMap = new Map();

    response.data.forEach(item => {
      if (productMap.has(item.name)) {
        // If the product exists, merge barcode info if needed.
        const existingProduct = productMap.get(item.name);
        if (item.barcode && !existingProduct.barcodes.includes(item.barcode)) {
          existingProduct.barcodes.push(item.barcode);
        }
      } else {
        // Add new product and initialize barcodes array.
        productMap.set(item.name, {
          id: item.id,
          name: item.name,
          price: item.price,
          purchaseCap: item.purchaseCap,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          taxRates: item.taxRates,
          productimages: item.productimages || [],
          barcodes: item.barcode ? [item.barcode] : []
        });
      }
    });

    products = Array.from(productMap.values());
    
    // Log the unique products after filtering.
    console.log("Unique products:", products);

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};
