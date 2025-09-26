import React, { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Modal,
  Form,
  Table,
  Row,
  Col,
  Checkbox
} from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";
import { toast } from "react-toastify";
import axios from "axios";
import {baseUrl} from "../../constants";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { FaPencilAlt , FaTrash } from "react-icons/fa";
const StockManagement = () => {
  // Modal visibility states (all modals except suppliers are modals)
  const [showStockModal, setShowStockModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showStockExcelModal, setShowStockExcelModal] = useState(false);
  const [showProductsExcelModal, setShowProductsExcelModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [showTaxModal,setShowTaxModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
   const [showUploadModal, setShowUploadModal] = useState(false);
const [uploadProductId, setUploadProductId] = useState(null);
const [uploadFile, setUploadFile] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
const [editProductData, setEditProductData] = useState([]);
  // Toast and loading states
  const [isLoading, setIsLoading] = useState(false);

  const [stockMeta, setStockMeta] = useState({
  invoiceNumber: '',
  supplierId: ''
});

const [stockEntries, setStockEntries] = useState([
  { productId: '', stockQuantity: '', stockThreshold: '', stockPrice: '' }
]);

const addStockRow = () => {
  setStockEntries([...stockEntries, { productId: '', stockQuantity: '', stockThreshold: '', stockPrice: '' }]);
};

const removeStockRow = (index) => {
  const updated = [...stockEntries];
  updated.splice(index, 1);
  setStockEntries(updated);
};

const updateEntry = (index, field, value) => {
  const updated = [...stockEntries];
  updated[index][field] = value;
  setStockEntries(updated);
};

  

  // Active view for main content ("stocks", "products", or "suppliers")
  const [activeView, setActiveView] = useState(" ");

  // Form states
  const [taxData,setTaxData] = useState({
    productId:null,
    taxRate:null,
    ItemDecription:null,
    unitMesure:null,
    ItemCode:null
  })
  const [stockData, setStockData] = useState({
    productId: "",
    invoiceNumber: "",
    stockPrice: "",
    stockQuantity: "",
    stockThreshold: "",
    supplierId: ""
  });
  const [categoryName, setCategoryName] = useState("");
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    priceAfterDiscount: "",
    purchaseCap: "",
    discountQuantity: "",
    barcodes: "",
    inventoryId: "",
    categoryId: null,
    subCategoryId: null
  });
  const [imageData, setImageData] = useState({
    isPrimary: false,
    image: null
  });
  const [subCategoryData, setSubCategoryData] = useState({
    subcategoryName: "",
    categoryId: null
  });
  const [supplierData, setSupplierData] = useState([]);
  const [editStockData, setEditStockData] = useState(null);
const [restockMeta, setRestockMeta] = useState({
  invoiceNumber: "",
  supplierId: "",
});

const [restockEntries, setRestockEntries] = useState([
  { productId: "", restockQuantity: "", purchasePrice: "" },
]);

const [invoiceForm, setInvoiceForm] = useState({
  invoiceId: '',
  totalAmount: '',
  supplierId: ''
});


  // Data arrays
  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [editingSupplier, setEditingSupplier] = useState({ id: null, supplierName: "", kraPin: "" });
  const resetRestockForm = () => {
  setRestockData({
    supplierId: "",
    invoiceNumber: "",
    restocks: [
      {
        productId: "",
        restockQuantity: "",
        purchasePrice: "",
      },
    ],
  });
};
  // Ref and API base URL
  const fileInputRef = useRef(null);

  // Excel file states
  const [stockExcelFile, setStockExcelFile] = useState(null);
  const [productsExcelFile, setProductsExcelFile] = useState(null);

  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    fetchData();
    setActiveView("stocks");
  }, []);

  // Fetch inventories, categories, subcategories, and products
const fetchData = async () => {
  setIsLoading(true);
  try {

    const catRes = await axios.get(`${baseUrl}/categories`, {
      headers: { "Content-Type": "application/json" }
    });
    setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const sup = await axios.get(`${baseUrl}/suppliers`, {
      headers: { "Content-Type": "application/json" }
    })
    setSuppliers(Array.isArray(sup.data) ? sup.data : []);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const inv = await axios.get(`${baseUrl}/invoices`, {
      headers: { "Content-Type": "application/json" }
    })
    setInvoices(Array.isArray(inv.data) ? inv.data : []);
    await new Promise(resolve => setTimeout(resolve, 1500));
    

    const subCatRes = await axios.get(`${baseUrl}/subcategories`, {
      headers: { "Content-Type": "application/json" }
    });
    setSubCategories(Array.isArray(subCatRes.data) ? subCatRes.data : []);
    await new Promise(resolve => setTimeout(resolve, 1500));

  } catch (error) {
    showToastMessage("Failed to fetch data: " + (error.message || "Unknown error"), "danger");
  } finally {
    setIsLoading(false);
  }
};
const pageSize = 25;
const [currentInventoryPage, setCurrentInventoryPage] = useState(1);
const fetchStocks = async (page) => {
  try {
    setIsLoading(true);
    const res = await axios.get(`${baseUrl}/paged-inventories?pageNumber=${page}&pageSize=${pageSize}`);
    const data = Array.isArray(res.data) ? res.data : res.data.content || [];
    setInventories(data);
    setHasMore(data.length === pageSize); 
  } catch (err) {
    console.error("Error fetching stocks:", err);
  } finally {
    setIsLoading(false);
  }
}


useEffect(() => {
  fetchStocks(currentInventoryPage);
}, [currentInventoryPage]);

const handleInventoryPageChange = (page) => {
    if (page >= 1 && (page < currentInventoryPage || hasMore)) {
      setCurrentInventoryPage(page);
    }
  };

  const categoryMap = React.useMemo(
  () => Object.fromEntries((categories || []).map(c => [String(c.id), c.categoryName ?? c.name ?? ""])),
  [categories]
);
const subCategoryMap = React.useMemo(
  () => Object.fromEntries((subCategories || []).map(s => [String(s.id), s.subcategoryName ?? s.name ?? ""])),
  [subCategories]
);

const fetchProducts = async (page) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${baseUrl}/paged-products?pageNumber=${page}&pageSize=${pageSize}`);
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];

      setProducts(data);
      console.log(data);
      setHasMore(data.length === pageSize); 
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && (page < currentPage || hasMore)) {
      setCurrentPage(page);
    }
  };


  const fetchSubCategories = async () => {
    setIsLoading(true);
    try {
      const subCatRes = await axios.get(`${baseUrl}/subcategories`, {
        headers: { "Content-Type": "application/json" }
      });
      setSubCategories(Array.isArray(subCatRes.data) ? subCatRes.data : []);
      console.log("Fetched subcategories:", subCategories);
    } catch (error) {
      showToastMessage("Failed to fetch subcategories: " + (error.message || "Unknown error"), "danger");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchSubCategories();
  }, []);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/suppliers`, {
        headers: { "Content-Type": "application/json" }
      });
      setSupplierData(Array.isArray(res.data) ? res.data : []);
      setActiveView("suppliers")
    } catch (error) {
      showToastMessage("Failed to fetch suppliers: " + (error.message || "Unknown error"), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset forms
  const resetForms = () => {
    setStockData({
      productId: "",
      stockPrice: "",
      stockQuantity: "",
      stockThreshold: "",
      supplierId: ""
    });
    setCategoryName("");
    setProductData({
      name: "",
      price: "",
      priceAfterDiscount: "",
      barcodes: "",
      purchaseCap: "",
      discountQuantity: "",
      inventoryId: "",
      categoryId: null,
      subCategoryId: null
    });
    setImageData({ productId: "", isPrimary: false, image: null });
    setSubCategoryData({ subcategoryName: "", categoryId: null });
    setSupplierData({ supplierName: "", kraPin: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStockExcelFile(null);
    setProductsExcelFile(null);
  };

  const [restockData, setRestockData] = useState({
    productId: "", supplierId: "", invoiceNumber: "", restockQuantity: "",
  });

  // Toast notification function
  const showToastMessage = (message, variant ) => {
   switch (variant) {
    case "success":
      toast.success(message);
      break;
    case "error":
    case "danger":
      toast.error(message);
      break;
    case "info":
      toast.info(message);
      break;
    case "warning":
      toast.warn(message);
      break;
    default:
      toast(message);
  }
  };

  // Handle adding new stock
  const handleAddStock = async () => {
    if (!stockMeta.invoiceNumber || !stockMeta.supplierId) {
      toast.error("Invoice number and supplier are required.");
      return;
    }

    try {
      setIsLoading(true);

      for (let entry of stockEntries) {
        const payload = {
          invoiceNumber: stockMeta.invoiceNumber,
          supplierId: stockMeta.supplierId,
          productId: entry.productId,
          stockQuantity: entry.stockQuantity,
          stockThreshold: entry.stockThreshold,
          stockPrice: entry.stockPrice,
        };

        const res = await axios.post(`${baseUrl}/inventory`, payload, {
         
        });

        if (res.status !== 201 && res.status !== 200) {
          throw new Error(`Failed to add stock for product ID ${entry.productId}`);
        }
      }

      toast.success("Stock added successfully.");
      setShowStockModal(false);
    } catch (error) {
      console.error("Error adding stock:", error);
      toast.error("Failed to add one or more stock items.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating stock
  const handleUpdateStock = async () => {
    try {
      setIsLoading(true);
      const { productId, stockQuantity, stockThreshold, stockPrice, supplierId } = editStockData;
      console.log(editStockData);
      if (!productId || !stockQuantity || !stockThreshold || !stockPrice || !supplierId) {
        throw new Error("All fields are required");
      }
      await axios.put(`${baseUrl}/inventory/${productId}`, editStockData, {
        headers: { "Content-Type": "application/json" }
      });
      showToastMessage("Stock updated successfully");
      setShowEditStockModal(false);
      setEditStockData(null);
      resetForms();
    } catch (error) {
      showToastMessage("Failed to update stock: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding category (now triggered from Add Product modal)
  const handleAddCategory = async (e) => {
    try {
      setIsLoading(true);
      if (!categoryName.trim()) throw new Error("Category name is required");
      await axios.post(`${baseUrl}/category`, { categoryName }, {
        headers: { "Content-Type": "application/json" }
      });
      e.preventDefault()
      showToastMessage("Category added successfully");
      setShowCategoryModal(false);
      resetForms();
      // Refresh categories so the new one appears in the dropdown
      const catRes = await axios.get(`${baseUrl}/categories`, {
        headers: { "Content-Type": "application/json" }
      });
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (error) {
      showToastMessage("Failed to add category: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding subcategory
  const handleAddSubCategory = async (e) => {
    try {
      setIsLoading(true);
      if (!subCategoryData.subcategoryName.trim() || subCategoryData.categoryId === null) {
        throw new Error("Subcategory name and category are required");
      }
      await axios.post(`${baseUrl}/subCategory`, subCategoryData, {
        headers: { "Content-Type": "application/json" }
      });
      showToastMessage("Subcategory added successfully");
      setShowSubCategoryModal(false);
      e.preventDefault()
      const subCatRes = await axios.get(`${baseUrl}/subcategories`, {
        headers: { "Content-Type": "application/json" }
      });
      setSubCategories(Array.isArray(subCatRes.data) ? subCatRes.data : []);
    } catch (error) {
      showToastMessage("Failed to add subcategory: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding supplier
  const handleAddSupplier = async () => {
    try {
      setIsLoading(true);
      if (!supplierData.supplierName.trim() || !supplierData.kraPin.trim()) {
        throw new Error("Supplier name and KRA Pin are required");
      }
      await axios.post(`${baseUrl}/supplier`, supplierData, {
        headers: { "Content-Type": "application/json" }
      });
      showToastMessage("Supplier added successfully");
      setShowSupplierModal(false);
      resetForms();
      fetchSuppliers();
    } catch (error) {
      showToastMessage("Failed to add supplier: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showTaxModal) {
      setTaxData({
        productId: '',
        ItemCode: '',
        taxRate: '',
        ItemDecription: '',
        unitMesure: ''
      });
    }
  }, [showTaxModal]);
  const handleAddTaxData = async () => {
    // Validate form data
    console.log(taxData)
    if (!taxData.productId || !taxData.ItemCode || !taxData.taxRate || !taxData.ItemDecription || !taxData.unitMesure) {
      showToastMessage('Please fill in all fields', "danger");
      return;
    }

    try {
      setIsLoading(true);
      // Send data to endpoint
      const response = await axios.post(`${baseUrl}/goodsinfo`, taxData);
      if (response.status === 200 || response.status === 201) {
        showToastMessage('Tax data added successfully' , "success");
        setShowTaxModal(false);
      } else {
        showToastMessage('Failed to add tax data' , "danger");
      }
    } catch (error) {
      console.error('Error adding tax data:', error);
      showToastMessage(`Failed to add tax data: ${error.message}`, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding product 
  const handleAddProduct = async () => {
    try {
      setIsLoading(true);
      if (
        !productData.name ||
        !productData.price ||
        !productData.inventoryId ||
        productData.categoryId === null ||
        productData.subCategoryId === null
      ) {
        throw new Error("All required product fields must be filled");
      }
      
      const payload = {
        inventoryId: productData.inventoryId,
        purchaseCap: productData.purchaseCap,
        category: productData.categoryId,
        subcategory: productData.subCategoryId,
        name: productData.name,
        price: productData.price,
        barcodes: productData.barcodes,
        showOnline:productData.showOnline,
        discountQuantity: productData.discountQuantity,
        priceAfterDiscount: productData.priceAfterDiscount
      };console.log(payload)
      await axios.post(`${baseUrl}/product`, payload, {
        headers: { "Content-Type": "application/json" }
      });
      showToastMessage("Product added successfully");
      setShowProductModal(false);
      resetForms();
       const prodRes = await axios.get(`${baseUrl}/products`, {
      headers: { "Content-Type": "application/json" }
    });
    setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (error) {
      console.log(error)
      showToastMessage("Failed to add product: " + (error.response?.data?.message || error.response), "danger");
    } finally {
      setIsLoading(false);
    }
  };

const handleEditShow = (product) => {
  setIsLoading(true);
   const response = axios.get(`${baseUrl}/product/${product.id}`)
  .catch(() => ({ data: [] }));
  console.log(response)
  setIsLoading(false);
  setEditProductData({
    Id: product.id,
    inventoryId: product.inventoryId,
    name: product.name,
    price: product.price,
    priceAfterDiscount: product.priceAfterDiscount,
    categoryId: product.category, 
    subCategoryId: product.subcategory,
    purchaseCap: product.purchaseCap,
    discountQuantity: product.discountQuantity,
    barcodes: product.barcodes,
    showOnline:product.showOnline
  });
  setShowEditModal(true);
};

const handleEditClose = () => {
  if (!isLoading) setShowEditModal(false);
};

const handleEditProduct = async () => {
  try {
    setIsLoading(true);
    if (
      !editProductData.name ||
      !editProductData.price ||
      !editProductData.inventoryId ||
      editProductData.categoryId === null ||
      editProductData.subCategoryId === null
    ) {
      throw new Error("All required product fields must be filled");
    }

    const payload = {
      inventoryId: editProductData.inventoryId,
      purchaseCap: editProductData.purchaseCap,
      category: editProductData.categoryId,
      subcategory: editProductData.subCategoryId,
      name: editProductData.name,
      price: editProductData.price,
      barcodes: editProductData.barcodes,
      showOnline:editProductData.showOnline,
      discountQuantity: editProductData.discountQuantity,
      priceAfterDiscount: editProductData.priceAfterDiscount
    };

    await axios.put(`${baseUrl}/product/${editProductData.Id}`, payload, {
      headers: { "Content-Type": "application/json" }
    });

    showToastMessage("Product updated successfully");
    setShowEditModal(false);

    // Refresh products
    const prodRes = await axios.get(`${baseUrl}/products`, {
      headers: { "Content-Type": "application/json" }
    });
    setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    console.log(products)
  } catch (error) {
    console.error(error);
    showToastMessage(
      "Failed to update product: " +
        (error.response?.data?.message || error.response),
      "danger"
    );
  } finally {
    setIsLoading(false);
  }
};

  // Handle image selection


  // Handle image upload
  const openUploadModal = (productId) => {
  setUploadProductId(productId);
  setUploadFile(null);          // reset previous file selection
  setShowImageUploadModal(true);
};

const closeUploadModal = () => {
  setShowUploadModal(false);
  setUploadProductId(null);
  setUploadFile(null);
};
const handleChooseFile = () => {
    console.log('Choose file clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

   const handleUploadImage = () => {
    if (!imageData.image) {
      alert('Please select an image first');
      return;
    }
    
    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', imageData.image);
    formData.append('productId', uploadProductId);
    formData.append('isPrimary', imageData.isPrimary ? 'true' : 'false');

    axios.post(`${baseUrl}/product-image-details`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        console.log('Image uploaded successfully:', response.data);
        setShowImageUploadModal(false);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error uploading image:', error);
        setIsLoading(false);
      });
  };

  const handleImageChange = (e) => {
    console.log('File selected');
    const file = e.target.files[0];
    if (file) {
      setImageData({ ...imageData, image: file });
    }
  };

  // Handle Stock Excel upload
  const handleUploadStockExcel = async () => {
  // Guard clause: nothing to do if no file selected
  if (!stockExcelFile) return;

  console.log("Preparing to upload stock Excel:", stockExcelFile);

  try {
    setIsLoading(true);

    // Build multipart/form-data payload
    const formData = new FormData();
    formData.append("excelFile", stockExcelFile); 

    // Execute the POST
    const response = await axios.post(
      `${baseUrl}inventories`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );

    console.log("Upload succeeded:", response.data);
    showToastMessage("Stock Excel uploaded successfully");
    setShowStockExcelModal(false);

  } catch (error) {
    console.error("Upload failed:", error);
    const msg = error.response?.data?.message || error.message;
    showToastMessage(`Failed to upload Stock Excel: ${msg}`, "danger");

  } finally {
    setIsLoading(false);
  }
};

  // Handle Products Excel upload
  const handleUploadProductsExcel = async () => {
    if (!productsExcelFile) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", productsExcelFile);
      await axios.post(`${baseUrl}/inventories`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      showToastMessage("Products Excel uploaded successfully");
      setShowProductsExcelModal(false);
      setProductsExcelFile(null);
    } catch (error) {
      showToastMessage("Failed to upload Products Excel: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Render subcategory options
  const renderSubCategoryOptions = () => {
    const filtered = subCategories.filter(
      subCat => productData.categoryId !== null && subCat.categoryId === productData.categoryId
    );
    return filtered.map(subCat => (
      <option key={subCat.id} value={subCat.id}>
        {subCat.id + " - " + subCat.subcategoryName}
      </option>
    ));
  };

  // Open edit stock modal
  const handleEditStock = (stock) => {
    setEditStockData(stock);
    setShowEditStockModal(true);
  };

  useEffect(() => {
    fetchSubCategories()
  }, [subCategories.length]);

    const fetchInvoices = async () => {
    const res = await axios.get(`${baseUrl}/invoices`);
    setInvoices(res.data);
    setActiveView("invoice");
  };
  const fetchTaxData = async () => {
    const res = await axios.get(`${baseUrl}/taxData`);
    setTaxData(res.data);
  };

  // handlers for adding
 const handleAddInvoice = async (invoiceForm) => {
    setIsLoading(true);
    console.log(invoiceForm);
    await axios.post(`${baseUrl}/invoice`, invoiceForm);
    setShowInvoiceModal(false);
    setIsLoading(false);
 }

 const updateRestockEntry = (index, field, value) => {
  const updated = [...restockEntries];
  updated[index][field] = value;
  setRestockEntries(updated);
};

const removeRestockEntry = (index) => {
  const updated = [...restockEntries];
  updated.splice(index, 1);
  setRestockEntries(updated);
};

const addRestockEntry = () => {
  setRestockEntries([
    ...restockEntries,
    { productId: "", restockQuantity: "", purchasePrice: "" },
  ]);
};

 const handleAddRestock = async () => {
  if (!restockMeta.invoiceNumber || !restockMeta.supplierId) {
    toast.error("Supplier and invoice are required.");
    return;
  }

  try {
    setIsLoading(true);

    for (const entry of restockEntries) {
      const payload = {
        invoiceNumber: restockMeta.invoiceNumber,
        supplierId: restockMeta.supplierId,
        productId: entry.productId,
        restockQuantity: entry.restockQuantity,
        purchasePrice: entry.purchasePrice,
      };

      const res = await axios.post(`${baseUrl}/restock-log`, payload);

      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Failed to add some restock entries.");
      }
    }

    toast.success("All restock entries added.");
    setShowRestockModal(false);
    resetRestockForm();
  } catch (error) {
    console.error(error);
    toast.error("An error occurred while saving restocks.");
  } finally {
    setIsLoading(false);
  }
};

  const handleEditSupplier = (id) => {
  const supplier = supplierData.find(s => s.id === id);
  if (supplier) {
    setEditingSupplier(supplier);
    setShowEditSupplierModal(true);
  }
};

  const handleDeleteSupplier = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`${baseUrl}/supplier/${id}`)
      showToastMessage("Supplier deleted successfully");
    } catch (error) {
      console.error(error);
    }finally{
      fetchSuppliers();
      setIsLoading(false);
    }
  };

  const handleUpdateSupplier = async () => {
    try {
      console.log(supplierData);
      await axios.put(`${baseUrl}/supplier/${editingSupplier.id}`, {
      supplierName: editingSupplier.supplierName,
      kraPin: editingSupplier.kraPin
    });
      fetchSuppliers();
      showToastMessage("Supplier updated successfully", "success");
    } catch (error) {
      console.ferror(error);
      showToastMessage("Failed to update supplier", "danger");
    }finally{
      setShowEditSupplierModal(false);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Custom CSS for modal offsets and nav styling */}
      <style type="text/css">
        {`
          .custom-modal {
            margin-right: 250px;
          }
          .small-offset-modal {
            margin-right: 50px;
          }
          .nav-link.active {
            color: orange !important;
            border-bottom: 2px solid orange;
          }
        `}
      </style>

      {/* Top Navigation Bar */}
      <div>
      <Navbar bg="light" expand="lg" className="shadow-sm ">
        <Container>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="justify-content-center">
              <Nav.Link active={activeView==="stocks"} onClick={()=> {setActiveView("stocks")}}>
                Stocks
              </Nav.Link>
              <Nav.Link active={activeView==="products"} onClick={()=>setActiveView("products")}>
                Products
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      </div>

      {/* Titles */}
      <Container className="mb-4">
        <h2>Stock Management</h2>
        {activeView === "TaxData" && <h4>Tax Data</h4>}
        {activeView === "stocks" && <h4>Stocks</h4>}
        {activeView === "products" && <h4>Products</h4>}
        {activeView === "suppliers" && <h4>Suppliers</h4>}
        {activeView === "invoice" && <h4>Invoices</h4>}
      </Container>

      {/* Main Content */}
      {activeView === "stocks" && (
        <Container>
            {/* Stocks action buttons */}
            <Box sx={{display: 'flex',flexWrap: 'wrap',gap: 2, mb: 2,}}>
              <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={setShowStockModal}>add stock</Button> 
              <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={fetchSuppliers}>View Suppliers</Button>
              <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowSupplierModal(true)}>Add Supplier</Button>
              <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowRestockModal(true)}>Add Restock Data</Button>
              <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={fetchInvoices}>View Invoices</Button>
              <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowInvoiceModal(true)}>Add Invoice</Button>
              <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowStockExcelModal(true)}>upload stock excel sheet</Button>
            </Box>
            <Pagination className="mt-3 justify-content-center">
            <Pagination.Prev
                onClick={() => handleInventoryPageChange(currentInventoryPage - 1)}
                disabled={currentPage === 1}
              />
              <Pagination.Item active>  page  {currentInventoryPage}</Pagination.Item>
              <Pagination.Next
                onClick={() => handleInventoryPageChange(currentInventoryPage + 1)}
                disabled={!hasMore}
              />
          </Pagination>

          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Threshold</th>
                <th>Purchase Price</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center">Loading...</td>
                </tr>
              ) : inventories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No data available</td>
                </tr>
              ) : (
                inventories.map((inv, index) => (
                  <tr key={index}>
                    <td>{inv.productId}</td>
                    <td>{inv.stockQuantity}</td>
                    <td>{inv.stockThreshold}</td>
                    <td>{inv.stockPrice}</td>
                    <td>{new Date(inv.createdAt).toLocaleString()}</td>
                    <td>{new Date(inv.updatedAt).toLocaleString()}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => handleEditStock(inv)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          
        </Container>
      )}
      {activeView === "products" && (
        <Container>
         <Box sx={{display: 'flex',flexWrap: 'wrap',gap: 2, mb: 2,}}>
           <Button sx={{ mr:10, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowProductModal(true)}>Add Product</Button>
            <Button sx={{ mr:10, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowImageUploadModal(true)}>Upload Product Image</Button>
            <Button sx={{ mr:10, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowProductsExcelModal(true)}>Upload Products Excel</Button>
            <Button sx={{ mr:10, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowTaxModal(true)}>Add Product Tax Data</Button>
          </Box>
          <Pagination className="mt-3 justify-content-center">
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              <Pagination.Item active>  page {currentPage}</Pagination.Item>
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasMore}
              />
            </Pagination>
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Updated At</th>
                <th>show online</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No data available</td>
                </tr>
              ) : (
                products.map((prod, index) => (
                  <tr key={index}>
                    <td>{prod.name}</td>
                    <td>{prod.price}</td>
                    <td>{categoryMap[String(prod.category)] || prod.category}</td>
                    <td>{subCategoryMap[String(prod.subcategory)] || prod.subcategory}</td>
                    <td>{new Date(prod.updatedAt).toLocaleString()}</td>
                    <td>{prod.showOnline ? 'Yes' : 'No'}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => openUploadModal(prod.id)}>
                        upload image
                      </Button>
                      <Button variant="outline-primary" size="sm" onClick={() =>handleEditShow(prod)}>
                        Edit
                      </Button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </Table>
           
        </Container>
      )}
      {activeView === "suppliers" && (
        <Container>
            <Box sx={{display: 'flex',flexWrap: 'wrap',gap: 2, mb: 2,}}>
              <Button sx={{ mr:10, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={setShowStockModal}>add stock</Button> 
              <Button sx={{ mr:10, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={fetchSuppliers}>View Suppliers</Button>
              <Button sx={{ mr:10, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowSupplierModal(true)}>Add Supplier</Button>
              <Button sx={{ mr:10, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowRestockModal(true)}>Add Restock Data</Button>
              <Button sx={{ mr:10, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={fetchInvoices}>View Invoices</Button>
              <Button sx={{ mr:10, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowInvoiceModal(true)}>Add Invoice</Button>
            </Box>
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Supplier ID</th>
                <th>Supplier Name</th>
                <th>KRA Pin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center">Loading...</td>
                </tr>
              ) : supplierData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No suppliers found</td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.id}</td>
                    <td>{supplier.supplierName}</td>
                    <td>{supplier.kraPin}</td>
                    <td>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditSupplier(supplier.id)}
                      >
                        <FaPencilAlt/>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                      >
                        <FaTrash/>
                      </Button>
                    </Box>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Container>
      )}
      {activeView === "invoice" && (
        <Container>
            <Box sx={{display: 'flex',flexWrap: 'wrap',gap: 2, mb: 2,}}>
           <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={setShowStockModal}>add stock</Button> 
            <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={fetchSuppliers}>View Suppliers</Button>
            <Button sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowSupplierModal(true)}>Add Supplier</Button>
            <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowRestockModal(true)}>Add Restock Data</Button>
            <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={fetchInvoices}>View Invoices</Button>
            <Button  sx={{ mr:1, mb:2  ,backgroundColor: 'orange !important',borderRadius: '50px', color: 'white !important', textTransform: 'none', px: 3, py: 1, '&:hover': {backgroundColor: '#e69500' } }} onClick={()=>setShowInvoiceModal(true)}>Add Invoice</Button>
            </Box>
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Supplier Name</th>
                <th>Invoice Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center">Loading...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No invoices found</td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.invoiceId}>
                    <td>{invoice.invoiceId}</td>
                    <td>{invoice.supplierId}</td>
                    <td>{new Date(invoice.createdAt).toLocaleString()}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        href={`${baseUrl}/invoices/${invoice.id}`}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>          
        </Container>
      )}

      {activeView === "taxData" && (
        <Container>
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>KRA ItemCode</th>
                <th>KRA Tax Rate</th>
                <th>Item Item Decription</th>
                <th>Unit of Measure</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center">Loading...</td>
                </tr>
              ) : taxData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">No tax data available</td>
                </tr>
              ) : (
                taxData.map((tax, index) => (
                  <tr key={index}>
                    <td>{tax.productId}</td>
                    <td>{tax.ItemCode}</td>
                    <td>{tax.taxRate}%</td>
                    <td>{tax.ItemDecription}</td>
                    <td>{tax.unitMesure}</td>
                    <td>{new Date(tax.createdAt).toLocaleString()}</td>
                    <td>{new Date(tax.updatedAt).toLocaleString()}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => handleAddTaxData(tax)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Container>
      )}
      {/* --- Modals --- */}
   

      {/* ——— Add Restock Data Modal ——— */}
    <Modal
      show={showRestockModal}
      onHide={() => setShowRestockModal(false)}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Add Restock Data</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Form>
          {/* Supplier & Invoice Info */}
          <Row className="mb-3">
            <Col>
              <Form.Label>Supplier</Form.Label>
              <Form.Select
                value={restockMeta.supplierId}
                onChange={(e) =>
                  setRestockMeta({ ...restockMeta, supplierId: e.target.value })
                }
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </option>
                  ))}
              </Form.Select>
            </Col>

            <Col>
              <Form.Label>Invoice</Form.Label>
              <Form.Select
                value={restockMeta.invoiceNumber}
                onChange={(e) =>
                  setRestockMeta({
                    ...restockMeta,
                    invoiceNumber: e.target.value,
                  })
                }
              >
                <option value="">Select the invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.invoiceId} value={inv.invoiceId}>
                      {inv.invoiceId}
                    </option>
                  ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Restock Product Entries */}
          {restockEntries.map((entry, index) => (
            <div
              key={index}
              style={{
                marginBottom: 24,
                padding: 16,
                border: "1px solid #ccc",
                borderRadius: 8,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Row className="mb-3">
                <Col>
                  <Form.Label>Product</Form.Label>
                 <Form.Select
                value={productData.inventoryId}
                onChange={e => {
                  const value = e.target.value;
                  if (value === '__prev__') {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    fetchStocks(newPage);
                    return;
                  }
                  if (value === '__next__') {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    fetchStocks(newPage);
                    return;
                  }
                  setProductData({ ...productData, inventoryId: value });
                }}
                required
              >
                <option value="">Select a product</option>
                <option disabled>──── Page {currentPage} Navigation ────</option>
                
                {currentPage > 1 && (
                  <option value="__prev__">← Previous Page</option>
                )}
                <option value="__next__">→ Next Page</option>
                
                <option disabled>──── Products ────</option>
                {inventories.map(inv => (
                  <option key={inv.productId} value={inv.productId}>
                    {inv.productId}
                  </option>
                ))}
              </Form.Select>
                </Col>

                <Col>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={entry.restockQuantity}
                    onChange={(e) =>
                      updateRestockEntry(index, "restockQuantity", e.target.value)
                    }
                  />
                </Col>

                <Col>
                  <Form.Label>Purchase Price</Form.Label>
                  <Form.Control
                    type="number"
                    value={entry.purchasePrice}
                    onChange={(e) =>
                      updateRestockEntry(index, "purchasePrice", e.target.value)
                    }
                  />
                </Col>

                <Col xs="auto" className="d-flex align-items-end">
                  <Button
                    variant="outline-danger"
                    onClick={() => removeRestockEntry(index)}
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            </div>
          ))}

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={addRestockEntry}>
              + Add Another Product
            </Button>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={() => setShowRestockModal(false)}
        >
          Close
        </Button>
        <Button variant="primary" onClick={handleAddRestock} disabled={isLoading}>
          {isLoading ? "Saving…" : "Save Restock"}
        </Button>
      </Modal.Footer>
    </Modal>



      {/* Backdrop spinner */}
      <Backdrop open={isLoading} sx={{ zIndex: theme => theme.zIndex.drawer + 1, color: "#fff" }}>
        <CircularProgress />
      </Backdrop>


      {/* Add Stock Modal*/}
      <Modal
        show={showStockModal}
        onHide={() => setShowStockModal(false)}
        dialogClassName="modal-dialog-centered modal-dialog-scrollable"
        style={{
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddStock();
          }}
        >
          <Modal.Header closeButton style={{ borderBottom: '1px solid #dee2e6' }}>
            <Modal.Title className="text-uppercase">Add Stock</Modal.Title>
          </Modal.Header>

          <Modal.Body
            style={{
              overflowY: 'auto',
              maxHeight: '60vh',
              paddingRight: '12px',
              paddingLeft: '12px',
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Invoice Number</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Select
                  value={stockMeta.invoiceNumber}
                  onChange={(e) =>
                    setStockMeta({ ...stockMeta, invoiceNumber: e.target.value })
                  }
                >
                  <option value="">Select the invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.invoiceId} value={inv.invoiceId}>
                      {inv.invoiceId}
                    </option>
                  ))}
                </Form.Select>
                <Button
                  variant="primary"
                  className="ms-2"
                  onClick={() => setShowSupplierModal(true)}
                >
                  <i className="fas fa-plus"></i> +
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Supplier</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Select
                  value={stockMeta.supplierId}
                  onChange={(e) =>
                    setStockMeta({ ...stockMeta, supplierId: e.target.value })
                  }
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </option>
                  ))}
                </Form.Select>
                <Button
                  variant="primary"
                  className="ms-2"
                  onClick={() => setShowSupplierModal(true)}
                >
                  <i className="fas fa-plus"></i> +
                </Button>
              </div>
            </Form.Group>

            <hr />
            <h5 className="fw-bold">Products</h5>

            {stockEntries.map((entry, index) => (
              <div key={index} className="mb-3 border p-3 rounded">
                <Row className="mb-2">
                  <Col>
                    <Form.Label>Product ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={entry.productId}
                      onChange={(e) =>
                        updateEntry(index, "productId", e.target.value)
                      }
                      placeholder="Product ID"
                    />
                  </Col>
                  <Col>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={entry.stockQuantity}
                      onChange={(e) =>
                        updateEntry(index, "stockQuantity", e.target.value)
                      }
                      placeholder="Quantity"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Label>Threshold</Form.Label>
                    <Form.Control
                      type="number"
                      value={entry.stockThreshold}
                      onChange={(e) =>
                        updateEntry(index, "stockThreshold", e.target.value)
                      }
                      placeholder="Threshold"
                    />
                  </Col>
                  <Col>
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      value={entry.stockPrice}
                      onChange={(e) =>
                        updateEntry(index, "stockPrice", e.target.value)
                      }
                      placeholder="Price"
                    />
                  </Col>
                  <Col xs="auto" className="d-flex align-items-end">
                    <Button
                      variant="danger"
                      onClick={() => removeStockRow(index)}
                      disabled={stockEntries.length === 1}
                    >
                      −
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}

            <Button variant="secondary" className="mb-3" onClick={addStockRow}>
              + Add Another Product
            </Button>
          </Modal.Body>

          <Modal.Footer
            style={{
              borderTop: '1px solid #dee2e6',
              padding: '1rem',
              backgroundColor: '#fff',
              zIndex: 10,
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => !isLoading && setShowStockModal(false)}
            >
              Close
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Adding…" : "Add Stock"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* invoice Modal*/}
      {showInvoiceModal && (
        <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} dialogClassName="custom-modal modal-dialog-centered">
          <Form
              onSubmit={e => {
                e.preventDefault();
                handleAddInvoice(invoiceForm);
              }}
            >
        <Modal.Header closeButton>
          <Modal.Title className="text-uppercase">Add Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Invoice Number</Form.Label>
              <Form.Control type="text" value={invoiceForm.invoiceId} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceId: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Total Amount</Form.Label>
              <Form.Control type="text" value={invoiceForm.totalAmount} onChange={(e) => setInvoiceForm({ ...invoiceForm, totalAmount: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Supplier</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Select value={invoiceForm.supplierId} onChange={(e) => setInvoiceForm({ ...invoiceForm, supplierId: e.target.value })}>
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </option>
                  ))}
                </Form.Select>
                <Button variant="primary" className="ms-2" onClick={() => setShowSupplierModal(true)}>
                  <i className="fas fa-plus"></i> +
                </Button>
              </div>
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button type="button" variant="secondary" onClick={() => !isLoading && setShowInvoiceModal(false)}>
              Close
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Adding…" : "Add"}
            </Button>
        </Modal.Footer>
        </Form>
      </Modal>
       )}

      {/* edit Supplier data  Modal */} 
      <Modal
        show={showEditSupplierModal}
        onHide={() => setShowEditSupplierModal(false)}
        dialogClassName="custom-modal modal-dialog-centered"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Supplier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Supplier Name</Form.Label>
              <Form.Control
                type="text"
                value={editingSupplier.supplierName}
                onChange={e =>
                  setEditingSupplier({ ...editingSupplier, supplierName: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>KRA PIN</Form.Label>
              <Form.Control
                type="text"
                value={editingSupplier.kraPin}
                onChange={e =>
                  setEditingSupplier({ ...editingSupplier, kraPin: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditSupplierModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleUpdateSupplier(editingSupplier.id)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Supplier Modal (wide offset) */}
      <Modal show={showSupplierModal} onHide={() => !isLoading && setShowSupplierModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton>
          <Modal.Title>Add Supplier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Supplier Name</Form.Label>
              <Form.Control
                type="text"
                value={supplierData.supplierName}
                onChange={e => setSupplierData({ ...supplierData, supplierName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>KRA Pin</Form.Label>
              <Form.Control
                type="text"
                value={supplierData.kraPin}
                onChange={e => setSupplierData({ ...supplierData, kraPin: e.target.value })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowSupplierModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddSupplier} disabled={isLoading}>
            {isLoading ? "Adding..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* edit products modal */}
      <Modal
        show={showEditModal}
        onHide={() => !isLoading && handleEditClose()}
        size="lg"
        dialogClassName="small-offset-modal modal-dialog-centered"
        style={{ borderRadius: '12px' }}
      >
        <Form
          onSubmit={e => {
            e.preventDefault();
            handleEditProduct();
          }}
        >
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="h4 fw-semibold text-dark mb-0">
              <i className="bi bi-pencil-square me-2 text-primary"></i>
              Edit Product
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="px-4 py-3">
            {/* Basic Information Section */}
            <div className="mb-4">
              <h6 className="text-muted fw-medium mb-3 text-uppercase small">
                <i className="bi bi-info-circle me-2"></i>Basic Information
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">
                      Inventory Product ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={editProductData.inventoryId}
                      required
                      className="form-control-lg border-1 rounded-3"
                      style={{ backgroundColor: '#f8f9fa' }}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">
                      Product Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={editProductData.name}
                      onChange={e =>
                        setEditProductData({ ...editProductData, name: e.target.value })
                      }
                      required
                      className="form-control-lg border-1 rounded-3"
                      placeholder="Enter product name"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Pricing Section */}
            <div className="mb-4">
              <h6 className="text-muted fw-medium mb-3 text-uppercase small">
                <i className="bi bi-currency-dollar me-2"></i>Pricing Details
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">
                      Regular Price <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-1 rounded-start-3">
                        <i className="bi bi-currency-dollar text-muted"></i>
                      </span>
                      <Form.Control
                        type="number"
                        value={editProductData.price}
                        onChange={e =>
                          setEditProductData({ ...editProductData, price: e.target.value })
                        }
                        required
                        min="0"
                        step="1"
                        className="form-control-lg border-1 rounded-end-3"
                        placeholder="0.00"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">
                      Discounted Price
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-1 rounded-start-3">
                        <i className="bi bi-tag text-success"></i>
                      </span>
                      <Form.Control
                        type="number"
                        value={editProductData.priceAfterDiscount}
                        onChange={e =>
                          setEditProductData({
                            ...editProductData,
                            priceAfterDiscount: e.target.value,
                          })
                        }
                        min="0"
                        step="0.001"
                        className="form-control-lg border-1 rounded-end-3"
                        placeholder="0.00"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Product Details Section */}
            <div className="mb-4">
              <h6 className="text-muted fw-medium mb-3 text-uppercase small">
                <i className="bi bi-box-seam me-2"></i>Product Details
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">
                      Barcode
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-1 rounded-start-3">
                        <i className="bi bi-upc-scan text-muted"></i>
                      </span>
                      <Form.Control
                        type="text"
                        value={editProductData.barcodes}
                        onChange={e =>
                          setEditProductData({ ...editProductData, barcodes: e.target.value })
                        }
                        placeholder="Enter product barcode"
                        className="form-control-lg border-1 rounded-end-3"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">
                      Discount Quantity
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-1 rounded-start-3">
                        <i className="bi bi-percent text-muted"></i>
                      </span>
                      <Form.Control
                        type="text"
                        value={editProductData.discountQuantity}
                        onChange={e =>
                          setEditProductData({ ...editProductData, discountQuantity: e.target.value })
                        }
                        placeholder="Enter discount quantity"
                        className="form-control-lg border-1 rounded-end-3"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Category Section */}
            <div className="mb-4">
              <h6 className="text-muted fw-medium mb-3 text-uppercase small">
                <i className="bi bi-folder me-2"></i>Category Management
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">
                      Category <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Select
                        value={editProductData.categoryId ?? ""}
                        onChange={e => {
                          const val = e.target.value;
                          setEditProductData({
                            ...editProductData,
                            categoryId: val === "" ? null : Number(val),
                            subCategoryId: null,
                          });
                        }}
                        required
                        className="form-control-lg border-1 rounded-3"
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.id + " - " + cat.categoryName}
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        type="button"
                        variant="outline-primary"
                        className="px-3 border-1 rounded-3"
                        onClick={() => setShowCategoryModal(true)}
                        disabled={isLoading}
                        title="Add new category"
                      >
                        <i className="bi bi-plus-lg"></i>
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">
                      Subcategory <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="d-flex gap-2">
                    <Form.Select
                        name="subCategoryId"
                        value={editProductData.subCategoryId ?? ""}
                        onChange={e =>
                          setEditProductData({
                            ...editProductData,
                            subCategoryId: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        required
                        disabled={editProductData.categoryId === null}
                        className="form-control-lg border-1 rounded-3"
                      >
                        <option value="">Select a subcategory</option>
                        {Array.isArray(subCategories)
                          ? subCategories
                              .filter(sc => Number(sc.categoryId) === Number(editProductData.categoryId))
                              .map(sc => (
                                <option key={sc.id} value={sc.id}>
                                  {sc.subcategoryName}
                                </option>
                              ))
                          : null}
                      </Form.Select>

                      <Button
                        type="button"
                        variant="outline-primary"
                        className="px-3 border-1 rounded-3"
                        onClick={() => setShowSubCategoryModal(true)}
                        disabled={isLoading || editProductData.categoryId === null}
                        title="Add new subcategory"
                      >
                        <i className="bi bi-plus-lg"></i>
                      </Button>
                    </div>
                    {editProductData.categoryId === null && (
                      <Form.Text className="text-muted small mt-1">
                        <i className="bi bi-info-circle me-1"></i>
                        Please select a category first
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </div>
            {/* Settings Section */}
            <div className="mb-4">
              <h6 className="text-muted fw-medium mb-3 text-uppercase small">
                <i className="bi bi-gear me-2"></i>Product Settings
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">
                      Purchase Limit
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-1 rounded-start-3">
                        <i className="bi bi-basket text-muted"></i>
                      </span>
                      <Form.Control
                        type="number"
                        value={editProductData.purchaseCap}
                        onChange={e =>
                          setEditProductData({ ...editProductData, purchaseCap: e.target.value })
                        }
                        min="1"
                        className="form-control-lg border-1 rounded-end-3"
                        placeholder="Max items per customer"
                      />
                    </div>
                    <Form.Text className="text-muted small mt-1">
                      Maximum quantity a customer can purchase
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Form.Group className="w-100">
                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 border-1">
                      <div>
                        <Form.Label className="fw-medium text-dark mb-1">
                          <i className="bi bi-globe me-2 text-primary"></i>
                          Show Online
                        </Form.Label>
                        <div className="text-muted small">
                          Display this product on your online store
                        </div>
                      </div>
                      <Form.Check
                        type="switch"
                        id="showOnlineSwitch"
                        className="ms-3"
                        checked={editProductData.showOnline}
                        onChange={e => setEditProductData({...editProductData, showOnline: e.target.checked})}
                        style={{ transform: 'scale(1.2)' }}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>

          </Modal.Body>

          <Modal.Footer className="border-0 pt-0 pb-4 px-4">
            <div className="d-flex justify-content-end gap-3 w-100">
              <Button
                type="button"
                variant="light"
                className="px-4 py-2 fw-medium rounded-3 border-1"
                onClick={() => !isLoading && handleEditClose()}
                disabled={isLoading}
              >
                <i className="bi bi-x-lg me-2"></i>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="px-4 py-2 fw-medium rounded-3 border-0"
                disabled={isLoading}
                style={{ 
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  boxShadow: isLoading ? 'none' : '0 4px 12px rgba(0, 123, 255, 0.3)'
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>


      {/*add tax data modal for kra purposes */}
      <Modal show={showTaxModal} onHide={() => !isLoading && setShowTaxModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add products tax data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
                <Form.Group className = "mb-3">
                  <Form.Label>Inventory Product</Form.Label>
                  <Form.Select
                    value={taxData.productId}
                    onChange={e => setTaxData({ ...taxData, productId: e.target.value })}
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map(prod => (
                      <option key={prod.id} value={prod.inventoryId}>
                        {prod.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
              <Form.Label>kra tax code</Form.Label>
              <Form.Control
                type="text"
                value={taxData.ItemCode}
                onChange={e => setTaxData({ ...taxData, ItemCode: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>KRA tax rate</Form.Label>
              <Form.Control
                type="number"
                value={taxData.taxRate}
                onChange={e => setTaxData({ ...taxData, taxRate: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label> Item Decription</Form.Label>
              <Form.Control
                type="text"
                value={taxData.ItemDecription}
                onChange={e => setTaxData({ ...taxData, ItemDecription: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>unit of measure</Form.Label>
              <Form.Control
                type="text"
                value={taxData.unitMesure}
                onChange={e => setTaxData({ ...taxData, unitMesure: e.target.value })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowTaxModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddTaxData} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Modal (small offset) */}
      <Modal
        show={showProductModal}
        onHide={() => !isLoading && setShowProductModal(false)}
        size="lg"
        dialogClassName="small-offset-modal modal-dialog-centered"
      >
        <Form
          onSubmit={e => {
            e.preventDefault();
            handleAddProduct();
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Product</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row>
              <Col md={6}>
             <Form.Group className="mb-3">
              <Form.Label>Inventory Product</Form.Label>
              <Form.Select
                value={productData.inventoryId}
                onChange={e => {
                  const value = e.target.value;
                  if (value === '__prev__') {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    fetchStocks(newPage);
                    return;
                  }
                  if (value === '__next__') {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    fetchStocks(newPage);
                    return;
                  }
                  setProductData({ ...productData, inventoryId: value });
                }}
                required
              >
                <option value="">Select a product</option>
                <option disabled>──── Page {currentPage} Navigation ────</option>
                
                {currentPage > 1 && (
                  <option value="__prev__">← Previous Page</option>
                )}
                <option value="__next__">→ Next Page</option>
                
                <option disabled>──── Products ────</option>
                {inventories.map(inv => (
                  <option key={inv.productId} value={inv.productId}>
                    {inv.productId}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={productData.name}
                    onChange={e =>
                      setProductData({ ...productData, name: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    value={productData.price}
                    onChange={e =>
                      setProductData({ ...productData, price: e.target.value })
                    }
                    required
                    min="0"
                    step="1"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price After Discount</Form.Label>
                  <Form.Control
                    type="number"
                    value={productData.priceAfterDiscount}
                    onChange={e =>
                      setProductData({
                        ...productData,
                        priceAfterDiscount: e.target.value,
                      })
                    }
                    min="0"
                    step="0.001"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Barcode</Form.Label>
              <Form.Control
                type="text"
                value={productData.barcodes}
                onChange={e =>
                  setProductData({ ...productData, barcodes: e.target.value })
                }
                placeholder="Enter product barcode"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Discount Quantity</Form.Label>
              <Form.Control
                type="text"
                value={productData.discountQuantity}
                onChange={e =>
                  setProductData({ ...productData, discountQuantity: e.target.value })
                }
                placeholder="Enter product discount quantity"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <div className="d-flex">
                    <Form.Select
                      value={productData.categoryId ?? ""}
                      onChange={e => {
                        const val = e.target.value;
                        setProductData({
                          ...productData,
                          categoryId: val === "" ? null : Number(val),
                          subCategoryId: null,
                        });
                      }}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.id + " - " + cat.categoryName}
                        </option>
                      ))}
                    </Form.Select>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="ms-2"
                      onClick={() => setShowCategoryModal(true)}
                      disabled={isLoading}
                    >
                      +
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subcategory</Form.Label>
                  <div className="d-flex">
                    <Form.Select
                      value={productData.subCategoryId ?? ""}
                      onChange={e =>
                        setProductData({
                          ...productData,
                          subCategoryId:
                            e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      required
                      disabled={productData.categoryId === null}
                      className="me-2"
                    >
                      <option value="">Select a subcategory</option>
                      {renderSubCategoryOptions()}
                    </Form.Select>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setShowSubCategoryModal(true)}
                      disabled={isLoading || productData.categoryId === null}
                    >
                      +
                    </Button>
                  </div>
                  {productData.categoryId === null && (
                    <Form.Text className="text-muted">
                      Please select a category first
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Purchase Cap</Form.Label>
              <Form.Control
                type="number"
                value={productData.purchaseCap}
                onChange={e =>
                  setProductData({ ...productData, purchaseCap: e.target.value })
                }
                min="1"
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={() => !isLoading && setShowProductModal(false)}
            >
              Close
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Adding..." : "Submit"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Category Modal (wide offset) – now launched from within Add Product */}
      <Modal show={showCategoryModal} onHide={() => !isLoading && setShowCategoryModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowCategoryModal(false)}>Close</Button>
          <Button variant="primary" onClick={(e) => handleAddCategory(e)} disabled={isLoading}>
            {isLoading ? "Adding..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Subcategory Modal (wide offset) */}
      <Modal show={showSubCategoryModal} onHide={() => !isLoading && setShowSubCategoryModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton>
          <Modal.Title>Add Subcategory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={subCategoryData.categoryId ?? ""}
                onChange={e => setSubCategoryData({ ...subCategoryData, categoryId: e.target.value === "" ? null : Number(e.target.value) })}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Subcategory Name</Form.Label>
              <Form.Control
                type="text"
                value={subCategoryData.subcategoryName}
                onChange={e => setSubCategoryData({ ...subCategoryData, subcategoryName: e.target.value })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowSubCategoryModal(false)}>Close</Button>
          <Button variant="primary" onClick={(e) => handleAddSubCategory(e)} disabled={isLoading}>
            {isLoading ? "Adding..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Upload Product Image Modal (wide offset) */}
      <Modal show={showImageUploadModal} onHide={() => !isLoading && setShowImageUploadModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton>
          <Modal.Title>Upload Product Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Upload Image</Form.Label>
              
              {/* Hidden file input */}
              <Form.Control
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                style={{ display: 'none' }}
              />
              
              {/* Custom upload area */}
              <div 
                className="border border-2 border-dashed rounded p-3 text-center"
                style={{ 
                  borderColor: '#0d6efd',
                  backgroundColor: '#f8f9ff',
                  cursor: 'pointer'
                }}
                onClick={handleChooseFile}
              >
                {imageData.image ? (
                  <div>
                    <strong>{imageData.image.name}</strong>
                    <div className="text-muted small">
                      Size: {(imageData.image.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                ) : (
                  <div>
                    <div><strong>Click to select an image</strong></div>
                    <div className="text-muted small">Choose from your computer</div>
                  </div>
                )}
              </div>
              
              <Form.Text className="text-muted">
                Supported formats: JPEG, PNG, WebP. Maximum size: 5MB
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="isPrimaryCheckbox"
                label="Set as primary product image"
                checked={imageData.isPrimary}
                onChange={e => setImageData({ ...imageData, isPrimary: e.target.checked })}
              />
              <Form.Text className="text-muted">
                Primary images are displayed as the main product image
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowImageUploadModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUploadImage} disabled={isLoading || !imageData.image}>
            {isLoading ? "Uploading..." : "Upload Image"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Stock Modal (wide offset) */}
      <Modal show={showEditStockModal} onHide={() => !isLoading && setShowEditStockModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton>
          <Modal.Title>Edit Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editStockData && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Product SKU</Form.Label>
                <Form.Control
                  type="text"
                  value={editStockData.productId}
                  onChange={e => setEditStockData({ ...editStockData, productId: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={editStockData.stockQuantity}
                  onChange={e => setEditStockData({ ...editStockData, stockQuantity: e.target.value })}
                  required
                  min="0"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Threshold</Form.Label>
                <Form.Control
                  type="number"
                  value={editStockData.stockThreshold}
                  onChange={e => setEditStockData({ ...editStockData, stockThreshold: e.target.value })}
                  required
                  min="0"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Purchase Price</Form.Label>
                <Form.Control
                  type="number"
                  value={editStockData.stockPrice}
                  onChange={e => setEditStockData({ ...editStockData, stockPrice: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Supplier</Form.Label>
                <Form.Select
                  value={editStockData.supplierId}
                  onChange={e => setEditStockData({ ...editStockData, supplierId: e.target.value })}
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowEditStockModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateStock} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Products Excel Modal (wide offset) */}
      <Modal show={showProductsExcelModal} onHide={() => setShowProductsExcelModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton>
          <Modal.Title>Upload Products Excel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Drag & drop or click to select an Excel file</Form.Label>
              <Form.Control type="file" accept=".xlsx,.xls" onChange={e => setProductsExcelFile(e.target.files[0])} />
              <Form.Text className="text-muted">
                The file will be sent as-is to the /inventories endpoint.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductsExcelModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUploadProductsExcel} disabled={isLoading || !productsExcelFile}>
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Stock Excel Modal (wide offset) */}
      <Modal show={showStockExcelModal} onHide={() => setShowStockExcelModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton>
          <Modal.Title>Upload Stock Excel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Drag & drop or click to select an Excel file</Form.Label>
              <Form.Control type="file" accept=".xlsx,.xls" onChange={e => setStockExcelFile(e.target.files[0])} />
              <Form.Text className="text-muted">
                The file will be sent as-is to the /products endpoint.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStockExcelModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUploadStockExcel} disabled={isLoading || !stockExcelFile}>
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StockManagement;
