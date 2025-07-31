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
  Col
} from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import {baseUrl} from "../../constants";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { FaPencilAlt , FaTrash } from "react-icons/fa";
import { fetchProducts } from "../../redux/slices/productsSlice";
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
    productId: "",
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

  useEffect(() => {
    fetchData();
    fetchProducts()
    setActiveView("stocks");
  }, []);

  // Fetch inventories, categories, subcategories, and products
const fetchData = async () => {
  setIsLoading(true);
  try {
    const invRes = await axios.get(`${baseUrl}/inventories`, {
      headers: { "Content-Type": "application/json" }
    });
    setInventories(Array.isArray(invRes.data) ? invRes.data : []);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const catRes = await axios.get(`${baseUrl}/categories`, {
      headers: { "Content-Type": "application/json" }
    });
    setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const subCatRes = await axios.get(`${baseUrl}/subcategories`, {
      headers: { "Content-Type": "application/json" }
    });

    const prodRes = await axios.get(`${baseUrl}/products`, {
      headers: { "Content-Type": "application/json" }
    });
    setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubCategories(Array.isArray(subCatRes.data) ? subCatRes.data : []);
    await new Promise(resolve => setTimeout(resolve, 1500));

  } catch (error) {
    showToastMessage("Failed to fetch data: " + (error.message || "Unknown error"), "danger");
  } finally {
    setIsLoading(false);
  }
};

const fetchSubCategories = async () => {
  setIsLoading(true);
  try {
    const subCatRes = await axios.get(`${baseUrl}/subcategories`, {
      headers: { "Content-Type": "application/json" }
    });
    setSubCategories(Array.isArray(subCatRes.data) ? subCatRes.data : []);
  } catch (error) {
    showToastMessage("Failed to fetch subcategories: " + (error.message || "Unknown error"), "danger");
  } finally {
    setIsLoading(false);
  }
};

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
      fetchData();
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

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        showToastMessage("Please select a valid image file (JPEG, PNG, WebP)", "danger");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToastMessage("Image size should be less than 5MB", "danger");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setImageData({ ...imageData, image: file });
    }
  };

  // Handle image upload
  const handleUploadImage = async () => {
    console.log(imageData)
    try {
      setIsLoading(true);
      if (!imageData.productId || !imageData.image) {
        throw new Error("Please select a product and an image");
      }
      await axios.post(`${baseUrl}/product-image-details`, {
        productId: imageData.productId,
        isPrimary: imageData.isPrimary,
        image_url: imageData.image
      }, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      showToastMessage("Image uploaded successfully" , "success");
      setShowImageUploadModal(false);
    } catch (error) {
      showToastMessage("Failed to upload image: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Stock Excel upload
  const handleUploadStockExcel = async () => {
    if (!stockExcelFile) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", stockExcelFile);
      await axios.post(`${baseUrl}/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      showToastMessage("Stock Excel uploaded successfully");
      setShowStockExcelModal(false);
      setStockExcelFile(null);
      fetchData();
    } catch (error) {
      showToastMessage("Failed to upload Stock Excel: " + (error.response?.data?.message || error.message), "danger");
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
      fetchData();
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
 const handleAddInvoice = async () => {
    setIsLoading(true);
    console.log(invoices);
    await axios.post(`${baseUrl}/invoice`, invoices);
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
            </Box>
          

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
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Created At</th>
                <th>Updated At</th>
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
                    <td>{prod.id}</td>
                    <td>{prod.name}</td>
                    <td>{prod.price}</td>
                    <td>{prod.category}</td>
                    <td>{prod.subcategory}</td>
                    <td>{new Date(prod.createdAt).toLocaleString()}</td>
                    <td>{new Date(prod.updatedAt).toLocaleString()}</td>
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
                supplierData.map((supplier) => (
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
                <th>UnitMesure of Measure</th>
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
                {supplierData.map((supplier) => (
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
                    value={entry.productId}
                    onChange={(e) =>
                      updateRestockEntry(index, "productId", e.target.value)
                    }
                  >
                    <option value="">Select product</option>
                    {inventories.map((i) => (
                      <option key={i.productId} value={i.productId}>
                        {i.productId}
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
                  {supplierData.map((supplier) => (
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
                handleAddInvoice();
              }}
            >
        <Modal.Header closeButton>
          <Modal.Title className="text-uppercase">Add Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Invoice Number</Form.Label>
              <Form.Control type="text" value={invoices.invoiceId} onChange={(e) => setInvoices({ ...invoices, invoiceId: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Total Amount</Form.Label>
              <Form.Control type="number" value={invoices.totalAmount} onChange={(e) => setInvoices({ ...invoices, totalAmount: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Supplier</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Select value={stockData.supplierId} onChange={(e) => setInvoices({ ...invoices, supplierId: e.target.value })}>
                  <option value="">Select a supplier</option>
                  {supplierData.map(supplier => (
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
                    onChange={e =>
                      setProductData({ ...productData, inventoryId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a product</option>
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
              <Form.Label>Select Product</Form.Label>
              <Form.Select
                value={imageData.productId}
                onChange={e => setImageData({ ...imageData, productId: e.target.value })}
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Form.Select>
              {products.length === 0 && (
                <div className="text-danger mt-2">No products available. Please add products first.</div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                formEncType="multipart/form-data"
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                required
              />
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
          <Button variant="primary" onClick={handleUploadImage} disabled={isLoading || !imageData.productId || !imageData.image}>
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
