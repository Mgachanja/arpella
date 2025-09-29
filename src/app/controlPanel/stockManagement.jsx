// StockManagement.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Pagination,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { Backdrop, CircularProgress } from "@mui/material";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { baseUrl } from "../../constants";

// <-- Use your service file here -->
import * as API from "../../services/ProductServices";

const StockManagement = () => {
  // Modal visibility states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddInventoryProductModal, setShowAddInventoryProductModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showStockExcelModal, setShowStockExcelModal] = useState(false);
  const [showProductsExcelModal, setShowProductsExcelModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Loading and misc states
  const [isLoading, setIsLoading] = useState(false);

  // Active view
  const [activeView, setActiveView] = useState("stocks");

  // File input ref
  const fileInputRef = useRef(null);

  // Pagination
  const pageSize = 25;
  const [currentInventoryPage, setCurrentInventoryPage] = useState(1); // inventories list
  const [currentPage, setCurrentPage] = useState(1); // products list
  const [hasMore, setHasMore] = useState(true);

  // Excel files
  const [stockExcelFile, setStockExcelFile] = useState(null);
  const [productsExcelFile, setProductsExcelFile] = useState(null);

  // Data lists
  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [taxList, setTaxList] = useState([]);

  // Forms and related state
  const [restockMeta, setRestockMeta] = useState({ invoiceNumber: "", supplierId: "" });
  const [restockEntries, setRestockEntries] = useState([
    { productId: "", restockQuantity: "", purchasePrice: "" },
  ]);

  const [supplierData, setSupplierData] = useState({ supplierName: "", kraPin: "" });
  const [editingSupplier, setEditingSupplier] = useState({ id: null, supplierName: "", kraPin: "" });

  // Product form (edit)
  const [editProductData, setEditProductData] = useState({
    Id: null,
    inventoryId: "",
    name: "",
    price: "",
    priceAfterDiscount: "",
    purchaseCap: "",
    discountQuantity: "",
    barcodes: "",
    categoryId: null,
    subCategoryId: null,
    showOnline: false,
  });

  // Merged Add Inventory & Product form
  const [inventoryProductForm, setInventoryProductForm] = useState({
    inventoryId: "",
    initialQuantity: "",
    initialPrice: "",
    threshold: "",
    name: "",
    price: "",
    priceAfterDiscount: "",
    barcodes: "",
    purchaseCap: "",
    discountQuantity: "",
    categoryId: null,
    subCategoryId: null,
    showOnline: false,
  });

  const [imageData, setImageData] = useState({ isPrimary: false, image: null });
  const [uploadProductId, setUploadProductId] = useState(null);

  // tax form
  const [taxForm, setTaxForm] = useState({
    productId: "",
    taxRate: "",
    ItemDecription: "",
    unitMesure: "",
    ItemCode: "",
  });

  const [editStockData, setEditStockData] = useState(null);

  // Restock picker
  const [restockSearch, setRestockSearch] = useState("");
  const [restockSearchResults, setRestockSearchResults] = useState([]);
  const restockSearchTimeout = useRef(null);

  // small helpers
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryData, setSubCategoryData] = useState({ subcategoryName: "", categoryId: null });
  const [invoiceForm, setInvoiceForm] = useState({ invoiceId: "", totalAmount: "", supplierId: "" });

  // Toast helper
  const showToastMessage = (message, variant = "info") => {
    switch (variant) {
      case "success":
        toast.success(message);
        break;
      case "danger":
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warn(message);
        break;
      default:
        toast.info(message);
    }
  };

  // ----------- Fetch functions using services -----------
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cats, sups, invs, subcats] = await Promise.all([
        API.categories.list(),
        API.suppliers.list(),
        API.invoices.list(),
        API.subcategories.list(),
      ]);
      setCategories(cats || []);
      setSuppliers(sups || []);
      setInvoices(invs || []);
      setSubCategories(subcats || []);
    } catch (error) {
      showToastMessage("Failed to fetch data: " + (error.message || "Unknown error"), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setActiveView("stocks");
  }, []);

  const fetchStocks = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await API.inventories.paged(page, pageSize);
      setInventories(data || []);
      setHasMore((data || []).length === pageSize);
    } catch (err) {
      console.error("Error fetching stocks:", err);
      showToastMessage("Failed to fetch stocks", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks(currentInventoryPage);
  }, [currentInventoryPage]);

  const handleInventoryPageChange = (page) => {
    if (page >= 1 && (page < currentInventoryPage || hasMore)) {
      setCurrentInventoryPage(page);
    }
  };

  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await API.products.paged(page, pageSize);
      setProducts(data || []);
      setHasMore((data || []).length === pageSize);
    } catch (err) {
      console.error("Error fetching products:", err);
      showToastMessage("Failed to fetch products", "danger");
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

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await API.suppliers.list();
      setSuppliers(data || []);
      setActiveView("suppliers");
    } catch (error) {
      showToastMessage("Failed to fetch suppliers: " + (error.message || "Unknown error"), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const data = await API.invoices.list();
      setInvoices(data || []);
      setActiveView("invoice");
    } catch (err) {
      console.error(err);
      showToastMessage("Failed to fetch invoices", "danger");
    }
  };

  const fetchTaxData = async () => {
    try {
      const data = await API.goodsInfo.list();
      setTaxList(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTaxData();
  }, []);

  // ----------- Utility / small handlers -----------
  const addRestockEntry = () => {
    setRestockEntries([...restockEntries, { productId: "", restockQuantity: "", purchasePrice: "" }]);
  };

  const removeRestockEntry = (index) => {
    const updated = [...restockEntries];
    updated.splice(index, 1);
    setRestockEntries(updated);
  };

  const updateRestockEntry = (index, field, value) => {
    const updated = [...restockEntries];
    updated[index][field] = value;
    setRestockEntries(updated);
  };

  const resetForms = () => {
    setInventoryProductForm({
      inventoryId: "",
      initialQuantity: "",
      initialPrice: "",
      threshold: "",
      name: "",
      price: "",
      priceAfterDiscount: "",
      barcodes: "",
      purchaseCap: "",
      discountQuantity: "",
      categoryId: null,
      subCategoryId: null,
      showOnline: false,
    });
    setCategoryName("");
    setImageData({ isPrimary: false, image: null });
    setSupplierData({ supplierName: "", kraPin: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStockExcelFile(null);
    setProductsExcelFile(null);
  };

  // ----------- Handlers for create/update actions using services -----------
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!categoryName.trim()) throw new Error("Category name is required");
      await API.categories.create({ categoryName });
      showToastMessage("Category added successfully", "success");
      setShowCategoryModal(false);
      resetForms();
      const catRes = await API.categories.list();
      setCategories(catRes || []);
    } catch (error) {
      showToastMessage("Failed to add category: " + (error?.message || "error"), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!subCategoryData.subcategoryName.trim() || subCategoryData.categoryId === null) {
        throw new Error("Subcategory name and category are required");
      }
      await API.subcategories.create(subCategoryData);
      showToastMessage("Subcategory added successfully", "success");
      setShowSubCategoryModal(false);
      const subCatRes = await API.subcategories.list();
      setSubCategories(subCatRes || []);
    } catch (error) {
      showToastMessage("Failed to add subcategory: " + (error?.message || "error"), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSupplier = async () => {
    try {
      setIsLoading(true);
      if (!supplierData.supplierName.trim() || !supplierData.kraPin.trim()) {
        throw new Error("Supplier name and KRA Pin are required");
      }
      await API.suppliers.create(supplierData);
      showToastMessage("Supplier added successfully", "success");
      setShowSupplierModal(false);
      setSupplierData({ supplierName: "", kraPin: "" });
      fetchSuppliers();
    } catch (error) {
      showToastMessage("Failed to add supplier: " + (error?.message || "error"), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSupplier = async () => {
    try {
      setIsLoading(true);
      await API.suppliers.update(editingSupplier.id, {
        supplierName: editingSupplier.supplierName,
        kraPin: editingSupplier.kraPin,
      });
      fetchSuppliers();
      showToastMessage("Supplier updated successfully", "success");
    } catch (error) {
      console.error(error);
      showToastMessage("Failed to update supplier", "danger");
    } finally {
      setShowEditSupplierModal(false);
      setIsLoading(false);
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      setIsLoading(true);
      await API.suppliers.remove(id);
      showToastMessage("Supplier deleted successfully", "success");
    } catch (error) {
      console.error(error);
      showToastMessage("Failed to delete supplier", "danger");
    } finally {
      fetchSuppliers();
      setIsLoading(false);
    }
  };

  const handleEditSupplier = (id) => {
    const supplier = suppliers.find((s) => s.id === id);
    if (supplier) {
      setEditingSupplier(supplier);
      setShowEditSupplierModal(true);
    }
  };

  // ----------- Product handlers (edit only) -----------
  const handleEditShow = async (product) => {
    try {
      setIsLoading(true);
      const resp = await API.products.get(product.id);
      const p = Array.isArray(resp) ? resp[0] : resp;
      const source = p || product;
      setEditProductData({
        Id: source.id,
        inventoryId: source.inventoryId ?? product.inventoryId,
        name: source.name ?? product.name,
        price: source.price ?? product.price,
        priceAfterDiscount: source.priceAfterDiscount ?? product.priceAfterDiscount,
        categoryId: source.category ?? product.category,
        subCategoryId: source.subcategory ?? product.subcategory,
        purchaseCap: source.purchaseCap ?? product.purchaseCap,
        discountQuantity: source.discountQuantity ?? product.discountQuantity,
        barcodes: source.barcodes ?? product.barcodes,
        showOnline: !!(source.showOnline ?? product.showOnline),
      });
      setShowEditModal(true);
    } catch (err) {
      showToastMessage("Failed to load product for editing", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClose = () => {
    if (!isLoading) setShowEditModal(false);
  };

  const handleEditProduct = async () => {
    try {
      setIsLoading(true);
      if (!editProductData.name || editProductData.price === "" || !editProductData.inventoryId || editProductData.categoryId === null || editProductData.subCategoryId === null) {
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
        showOnline: !!editProductData.showOnline,
        discountQuantity: editProductData.discountQuantity,
        priceAfterDiscount: editProductData.priceAfterDiscount,
      };
      await API.products.update(editProductData.Id, payload);
      showToastMessage("Product updated successfully", "success");
      setShowEditModal(false);
      const prodRes = await API.products.list();
      setProducts(prodRes || []);
    } catch (error) {
      console.error(error);
      showToastMessage("Failed to update product: " + (error?.message || "error"), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Image upload flow
  const openUploadModal = (productId) => {
    setUploadProductId(productId);
    setImageData({ isPrimary: false, image: null });
    setShowImageUploadModal(true);
  };

  const handleChooseFile = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImageData({ ...imageData, image: file });
  };

  const handleUploadImage = async () => {
    if (!imageData.image || !uploadProductId) {
      alert("Please select an image and product first");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageData.image);
      formData.append("productId", uploadProductId);
      formData.append("isPrimary", imageData.isPrimary ? "true" : "false");
      await API.products.uploadImage(formData);
      setShowImageUploadModal(false);
      showToastMessage("Image uploaded successfully", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showToastMessage("Failed to upload image", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Excel uploads
  const handleUploadProductsExcel = async () => {
    if (!productsExcelFile) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", productsExcelFile);
      await API.inventories.uploadExcel(formData);
      showToastMessage("Products Excel uploaded successfully", "success");
      setShowProductsExcelModal(false);
      setProductsExcelFile(null);
    } catch (error) {
      showToastMessage("Failed to upload Products Excel: " + (error?.message || "error"), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadStockExcel = async () => {
    if (!stockExcelFile) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("excelFile", stockExcelFile);
      await API.inventories.uploadExcel(formData);
      showToastMessage("Stock Excel uploaded successfully", "success");
      setShowStockExcelModal(false);
    } catch (error) {
      console.error("Upload failed:", error);
      showToastMessage(`Failed to upload Stock Excel: ${error?.message || "error"}`, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Restock
  const resetRestockForm = () => {
    setRestockMeta({ invoiceNumber: "", supplierId: "" });
    setRestockEntries([{ productId: "", restockQuantity: "", purchasePrice: "" }]);
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
        await API.restockLog.create(payload);
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

  // Tax
  const handleAddTaxData = async () => {
    if (!taxForm.productId || !taxForm.ItemCode || !taxForm.taxRate || !taxForm.ItemDecription || !taxForm.unitMesure) {
      showToastMessage("Please fill in all fields", "danger");
      return;
    }
    try {
      setIsLoading(true);
      await API.goodsInfo.create(taxForm);
      showToastMessage("Tax data added successfully", "success");
      setShowTaxModal(false);
      fetchTaxData();
    } catch (error) {
      console.error("Error adding tax data:", error);
      showToastMessage(`Failed to add tax data: ${error?.message || "error"}`, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit stock modal open
  const handleEditStock = (stock) => {
    setEditStockData(stock);
    setShowEditStockModal(true);
  };

  // Render helpers
  const categoryMap = useMemo(
    () => Object.fromEntries((categories || []).map((c) => [String(c.id), c.categoryName ?? c.name ?? ""])),
    [categories]
  );

  const subCategoryMap = useMemo(
    () => Object.fromEntries((subCategories || []).map((s) => [String(s.id), s.subcategoryName ?? s.name ?? ""])),
    [subCategories]
  );

  const renderSubCategoryOptionsFor = (categoryId) => {
    if (categoryId == null) return null;
    return (subCategories || [])
      .filter((sc) => Number(sc.categoryId) === Number(categoryId))
      .map((sc) => <option key={sc.id} value={sc.id}>{sc.subcategoryName}</option>);
  };

  // ----------------- RESTOCK SEARCH (debounced client-side on current page) -----------------
  useEffect(() => {
    if (restockSearchTimeout.current) clearTimeout(restockSearchTimeout.current);
    restockSearchTimeout.current = setTimeout(() => {
      const q = (restockSearch || "").trim().toLowerCase();
      if (!q) {
        setRestockSearchResults(inventories.slice(0, 50));
      } else {
        setRestockSearchResults(
          inventories.filter((inv) => {
            const pid = (inv.productId || "").toString().toLowerCase();
            const name = ((inv.productName || inv.name) || "").toString().toLowerCase();
            return pid.includes(q) || name.includes(q);
          }).slice(0, 200)
        );
      }
    }, 250);
    return () => {
      if (restockSearchTimeout.current) clearTimeout(restockSearchTimeout.current);
    };
  }, [restockSearch, inventories]);

  const pickRestockProduct = (entryIndex, productId) => {
    updateRestockEntry(entryIndex, "productId", productId);
  };

  // ----------------- MERGED "ADD INVENTORY & PRODUCT" FLOW (uses services) -----------------
  const handleAddInventoryAndProduct = async () => {
    try {
      setIsLoading(true);

      if (!inventoryProductForm.name || inventoryProductForm.price === "") {
        throw new Error("Product name and price are required.");
      }

      let targetInventoryId = inventoryProductForm.inventoryId || null;

      if (targetInventoryId) {
        const invPayload = {
          productId: inventoryProductForm.inventoryId,
          stockQuantity: inventoryProductForm.initialQuantity || 0,
          stockPrice: inventoryProductForm.initialPrice || 0,
          stockThreshold: inventoryProductForm.threshold || 0,
        };
        await API.inventories.create(invPayload);
      }

      const prodPayload = {
        inventoryId: targetInventoryId || inventoryProductForm.inventoryId || undefined,
        purchaseCap: inventoryProductForm.purchaseCap,
        category: inventoryProductForm.categoryId,
        subcategory: inventoryProductForm.subCategoryId,
        name: inventoryProductForm.name,
        price: inventoryProductForm.price,
        barcodes: inventoryProductForm.barcodes,
        showOnline: !!inventoryProductForm.showOnline,
        discountQuantity: inventoryProductForm.discountQuantity,
        priceAfterDiscount: inventoryProductForm.priceAfterDiscount,
      };

      await API.products.create(prodPayload);
      showToastMessage("Inventory (if provided) and product created successfully", "success");
      setShowAddInventoryProductModal(false);
      resetForms();
      fetchProducts(currentPage);
      fetchStocks(currentInventoryPage);
    } catch (error) {
      console.error("Error creating inventory/product:", error);
      showToastMessage("Failed to create inventory/product: " + (error?.message || "error"), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- JSX return ----
  return (
    <div>
      <style type="text/css">{`
        .custom-modal { margin-right: 250px; }
        .small-offset-modal { margin-right: 50px; }
        .nav-link.active { color: orange !important; border-bottom: 2px solid orange; }
        .restock-search-results { max-height: 180px; overflow:auto; border: 1px solid #e9ecef; border-radius:6px; background: #fff; }
        .restock-search-item { padding:6px 8px; cursor:pointer; border-bottom:1px solid #f1f1f1; }
        .restock-search-item:last-child { border-bottom: none; }
      `}</style>

      {/* Top Navigation Bar */}
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="justify-content-center" style={{ width: "100%" }}>
              <Nav.Link active={activeView === "stocks"} onClick={() => setActiveView("stocks")}>Stocks</Nav.Link>
              <Nav.Link active={activeView === "products"} onClick={() => setActiveView("products")}>Products</Nav.Link>
              <Nav.Link active={activeView === "suppliers"} onClick={() => { fetchSuppliers(); }}>Suppliers</Nav.Link>
              <Nav.Link active={activeView === "invoice"} onClick={() => fetchInvoices()}>Invoices</Nav.Link>
              <Nav.Link active={activeView === "taxData"} onClick={() => { fetchTaxData(); setActiveView("taxData"); }}>Tax Data</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mb-4">
        <h2>Stock Management</h2>
        {activeView === "taxData" && <h4>Tax Data</h4>}
        {activeView === "stocks" && <h4>Stocks</h4>}
        {activeView === "products" && <h4>Products</h4>}
        {activeView === "suppliers" && <h4>Suppliers</h4>}
        {activeView === "invoice" && <h4>Invoices</h4>}
      </Container>

      {/* Stocks view */}
      {activeView === "stocks" && (
        <Container>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <Button onClick={() => setShowRestockModal(true)}>Add Restock Data</Button>
            <Button onClick={() => fetchSuppliers()}>View Suppliers</Button>
            <Button onClick={() => setShowSupplierModal(true)}>Add Supplier</Button>
            <Button onClick={() => fetchInvoices()}>View Invoices</Button>
            <Button onClick={() => setShowInvoiceModal(true)}>Add Invoice</Button>
            <Button onClick={() => setShowStockExcelModal(true)}>Upload Stock Excel</Button>
          </div>

          <Pagination className="mt-3 justify-content-center">
            <Pagination.Prev onClick={() => handleInventoryPageChange(currentInventoryPage - 1)} disabled={currentInventoryPage === 1} />
            <Pagination.Item active> page {currentInventoryPage}</Pagination.Item>
            <Pagination.Next onClick={() => handleInventoryPageChange(currentInventoryPage + 1)} disabled={!hasMore} />
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
                <tr><td colSpan="7" className="text-center">Loading...</td></tr>
              ) : inventories.length === 0 ? (
                <tr><td colSpan="7" className="text-center">No data available</td></tr>
              ) : (
                inventories.map((inv, index) => (
                  <tr key={index}>
                    <td>{inv.productId}</td>
                    <td>{inv.stockQuantity}</td>
                    <td>{inv.stockThreshold}</td>
                    <td>{inv.stockPrice}</td>
                    <td>{inv.createdAt ? new Date(inv.createdAt).toLocaleString() : ""}</td>
                    <td>{inv.updatedAt ? new Date(inv.updatedAt).toLocaleString() : ""}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => handleEditStock(inv)}>Edit</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Container>
      )}

      {/* Products view */}
      {activeView === "products" && (
        <Container>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <Button onClick={() => setShowAddInventoryProductModal(true)}>Add Product</Button>
            <Button onClick={() => setShowImageUploadModal(true)}>Upload Product Image</Button>
            <Button onClick={() => setShowProductsExcelModal(true)}>Upload Products Excel</Button>
          </div>

          <Pagination className="mt-3 justify-content-center">
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            <Pagination.Item active> page {currentPage}</Pagination.Item>
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={!hasMore} />
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
                <tr><td colSpan="7" className="text-center">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7" className="text-center">No data available</td></tr>
              ) : (
                products.map((prod, index) => (
                  <tr key={index}>
                    <td>{prod.name}</td>
                    <td>{prod.price}</td>
                    <td>{categoryMap[String(prod.category)] || prod.category}</td>
                    <td>{subCategoryMap[String(prod.subcategory)] || prod.subcategory}</td>
                    <td>{prod.updatedAt ? new Date(prod.updatedAt).toLocaleString() : ""}</td>
                    <td>{prod.showOnline ? "Yes" : "No"}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => openUploadModal(prod.id)}>upload image</Button>{" "}
                      <Button variant="outline-primary" size="sm" onClick={() => handleEditShow(prod)}>Edit</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Container>
      )}

      {/* Suppliers */}
      {activeView === "suppliers" && (
        <Container>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <Button onClick={() => fetchSuppliers()}>View Suppliers</Button>
            <Button onClick={() => setShowSupplierModal(true)}>Add Supplier</Button>
            <Button onClick={() => setShowRestockModal(true)}>Add Restock Data</Button>
            <Button onClick={() => fetchInvoices()}>View Invoices</Button>
            <Button onClick={() => setShowInvoiceModal(true)}>Add Invoice</Button>
          </div>

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
                <tr><td colSpan="4" className="text-center">Loading...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan="4" className="text-center">No suppliers found</td></tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.id}</td>
                    <td>{supplier.supplierName}</td>
                    <td>{supplier.kraPin}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button variant="outline-primary" size="sm" onClick={() => handleEditSupplier(supplier.id)}><FaPencilAlt /></Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteSupplier(supplier.id)}><FaTrash /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Container>
      )}

      {/* Invoices */}
      {activeView === "invoice" && (
        <Container>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <Button onClick={() => fetchSuppliers()}>View Suppliers</Button>
            <Button onClick={() => setShowSupplierModal(true)}>Add Supplier</Button>
            <Button onClick={() => setShowRestockModal(true)}>Add Restock Data</Button>
            <Button onClick={() => fetchInvoices()}>View Invoices</Button>
            <Button onClick={() => setShowInvoiceModal(true)}>Add Invoice</Button>
          </div>

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
                <tr><td colSpan="4" className="text-center">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="4" className="text-center">No invoices found</td></tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.invoiceId}>
                    <td>{invoice.invoiceId}</td>
                    <td>{invoice.supplierId}</td>
                    <td>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : ""}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" href={`${baseUrl}/invoices/${invoice.id}`}>Edit</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Container>
      )}

      {/* TAX DATA view */}
      {activeView === "taxData" && (
        <Container>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button onClick={() => setShowTaxModal(true)}>Add Product Tax Data</Button>
          </div>

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
                <tr><td colSpan="8" className="text-center">Loading...</td></tr>
              ) : taxList.length === 0 ? (
                <tr><td colSpan="8" className="text-center">No tax data available</td></tr>
              ) : (
                taxList.map((tax, index) => (
                  <tr key={index}>
                    <td>{tax.productId}</td>
                    <td>{tax.ItemCode}</td>
                    <td>{tax.taxRate}%</td>
                    <td>{tax.ItemDecription}</td>
                    <td>{tax.unitMesure}</td>
                    <td>{tax.createdAt ? new Date(tax.createdAt).toLocaleString() : ""}</td>
                    <td>{tax.updatedAt ? new Date(tax.updatedAt).toLocaleString() : ""}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => { setTaxForm(tax); setShowTaxModal(true); }}>Edit</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Container>
      )}

      {/* ---------------------- MODALS ---------------------- */}

      {/* Restock Modal */}
      <Modal show={showRestockModal} onHide={() => setShowRestockModal(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Add Restock Data</Modal.Title></Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Label>Supplier</Form.Label>
                <Form.Select value={restockMeta.supplierId} onChange={(e) => setRestockMeta({ ...restockMeta, supplierId: e.target.value })}>
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.supplierName}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Invoice</Form.Label>
                <Form.Select value={restockMeta.invoiceNumber} onChange={(e) => setRestockMeta({ ...restockMeta, invoiceNumber: e.target.value })}>
                  <option value="">Select the invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.invoiceId} value={inv.invoiceId}>{inv.invoiceId}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {restockEntries.map((entry, index) => (
              <div key={index} style={{ marginBottom: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8, backgroundColor: "#f9f9f9" }}>
                <Row className="mb-2">
                  <Col md={6}>
                    <Form.Label>Find product (search)</Form.Label>
                    <Form.Control
                      placeholder="Search SKU or name..."
                      value={restockSearch}
                      onChange={(e) => setRestockSearch(e.target.value)}
                    />
                    <div className="restock-search-results mt-2">
                      {restockSearchResults.length === 0 ? (
                        <div style={{ padding: 8 }} className="text-muted small">No results on this page. Try changing page or typing different text.</div>
                      ) : restockSearchResults.map((inv) => (
                        <div
                          key={inv.productId}
                          className="restock-search-item"
                          onClick={() => pickRestockProduct(index, inv.productId)}
                          title={`Pick ${inv.productId}`}
                        >
                          <strong>{inv.productId}</strong> {inv.productName ? `— ${inv.productName}` : ""}
                        </div>
                      ))}
                    </div>

                    <div className="d-flex gap-2 mt-2">
                      <Button size="sm" onClick={() => { if (currentInventoryPage > 1) setCurrentInventoryPage(currentInventoryPage - 1); }}>Prev page</Button>
                      <Button size="sm" onClick={() => { if (hasMore) setCurrentInventoryPage(currentInventoryPage + 1); }}>Next page</Button>
                      <div className="ms-auto text-muted small align-self-center">Page {currentInventoryPage}</div>
                    </div>
                    <Form.Text className="text-muted">Click an item to populate product field below.</Form.Text>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control type="number" value={entry.restockQuantity} onChange={(e) => updateRestockEntry(index, "restockQuantity", e.target.value)} />
                  </Col>

                  <Col md={3}>
                    <Form.Label>Purchase Price</Form.Label>
                    <Form.Control type="number" value={entry.purchasePrice} onChange={(e) => updateRestockEntry(index, "purchasePrice", e.target.value)} />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Selected Product ID</Form.Label>
                      <Form.Control type="text" value={entry.productId} onChange={(e) => updateRestockEntry(index, "productId", e.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-2">
                  <Button variant="outline-danger" size="sm" onClick={() => removeRestockEntry(index)}>Remove</Button>
                </div>
              </div>
            ))}

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={addRestockEntry}>+ Add Another Product</Button>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowRestockModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddRestock} disabled={isLoading}>{isLoading ? "Saving…" : "Save Restock"}</Button>
        </Modal.Footer>
      </Modal>

      {/* Backdrop spinner */}
      <Backdrop open={isLoading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: "#fff" }}>
        <CircularProgress />
      </Backdrop>

      {/* Merged: Add Inventory & Product Modal (removed optional helper text) */}
      <Modal show={showAddInventoryProductModal} onHide={() => !isLoading && setShowAddInventoryProductModal(false)} size="lg" dialogClassName="small-offset-modal modal-dialog-centered">
        <Form onSubmit={(e) => { e.preventDefault(); handleAddInventoryAndProduct(); }}>
          <Modal.Header closeButton><Modal.Title>Add Inventory & Product</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <h6 className="mb-2">Inventory </h6>
                <Form.Group className="mb-3">
                  <Form.Label>Inventory Product ID (SKU)</Form.Label>
                  <Form.Control type="text" value={inventoryProductForm.inventoryId} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, inventoryId: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Initial Quantity</Form.Label>
                  <Form.Control type="number" value={inventoryProductForm.initialQuantity} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, initialQuantity: e.target.value })} min="0" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Initial Purchase Price</Form.Label>
                  <Form.Control type="number" value={inventoryProductForm.initialPrice} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, initialPrice: e.target.value })} min="0" step="0.01" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Threshold</Form.Label>
                  <Form.Control type="number" value={inventoryProductForm.threshold} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, threshold: e.target.value })} min="0" />
                </Form.Group>
              </Col>

              <Col md={6}>
                <h6 className="mb-2">Product Details</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control type="text" value={inventoryProductForm.name} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, name: e.target.value })} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Price *</Form.Label>
                  <Form.Control type="number" value={inventoryProductForm.price} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, price: e.target.value })} required min="0" step="0.01" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Price After Discount</Form.Label>
                  <Form.Control type="number" value={inventoryProductForm.priceAfterDiscount} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, priceAfterDiscount: e.target.value })} min="0" step="0.01" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Barcode</Form.Label>
                  <Form.Control type="text" value={inventoryProductForm.barcodes} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, barcodes: e.target.value })} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Discount Quantity</Form.Label>
                  <Form.Control type="text" value={inventoryProductForm.discountQuantity} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, discountQuantity: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <div className="d-flex">
                    <Form.Select value={inventoryProductForm.categoryId ?? ""} onChange={(e) => { const val = e.target.value; setInventoryProductForm({ ...inventoryProductForm, categoryId: val === "" ? null : Number(val), subCategoryId: null }); }}>
                      <option value="">Select a category</option>
                      {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.id + " - " + cat.categoryName}</option>))}
                    </Form.Select>
                    <Button type="button" variant="outline-secondary" className="ms-2" onClick={() => setShowCategoryModal(true)} disabled={isLoading}>+</Button>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subcategory</Form.Label>
                  <div className="d-flex">
                    <Form.Select value={inventoryProductForm.subCategoryId ?? ""} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, subCategoryId: e.target.value === "" ? null : Number(e.target.value) })} disabled={inventoryProductForm.categoryId === null} className="me-2">
                      <option value="">Select a subcategory</option>
                      {renderSubCategoryOptionsFor(inventoryProductForm.categoryId)}
                    </Form.Select>
                    <Button type="button" variant="outline-secondary" onClick={() => setShowSubCategoryModal(true)} disabled={isLoading || inventoryProductForm.categoryId === null}>+</Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Cap</Form.Label>
                  <Form.Control type="number" value={inventoryProductForm.purchaseCap} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, purchaseCap: e.target.value })} min="1" />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded-3">
                    <div>
                      <Form.Label className="mb-1">Show Online</Form.Label>
                      <div className="text-muted small">Display this product on your online store</div>
                    </div>
                    <Form.Check type="switch" id="showOnlineSwitchAddMerged" checked={!!inventoryProductForm.showOnline} onChange={(e) => setInventoryProductForm({ ...inventoryProductForm, showOnline: e.target.checked })} />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="secondary" onClick={() => !isLoading && setShowAddInventoryProductModal(false)}>Close</Button>
            <Button type="submit" variant="primary" disabled={isLoading}>{isLoading ? "Adding..." : "Submit"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} dialogClassName="custom-modal modal-dialog-centered">
          <Form onSubmit={(e) => { e.preventDefault(); /* Add invoice flow as needed */ }}>
            <Modal.Header closeButton><Modal.Title className="text-uppercase">Add Invoice</Modal.Title></Modal.Header>
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
                    {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.supplierName}</option>))}
                  </Form.Select>
                  <Button variant="primary" className="ms-2" onClick={() => setShowSupplierModal(true)}>+</Button>
                </div>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => !isLoading && setShowInvoiceModal(false)}>Close</Button>
              <Button type="submit" variant="primary" disabled={isLoading}>{isLoading ? "Adding…" : "Add"}</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}

      {/* Edit Supplier Modal */}
      <Modal show={showEditSupplierModal} onHide={() => setShowEditSupplierModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton><Modal.Title>Edit Supplier</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Supplier Name</Form.Label>
              <Form.Control type="text" value={editingSupplier.supplierName} onChange={(e) => setEditingSupplier({ ...editingSupplier, supplierName: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>KRA PIN</Form.Label>
              <Form.Control type="text" value={editingSupplier.kraPin} onChange={(e) => setEditingSupplier({ ...editingSupplier, kraPin: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditSupplierModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => handleUpdateSupplier()}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal show={showSupplierModal} onHide={() => !isLoading && setShowSupplierModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton><Modal.Title>Add Supplier</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Supplier Name</Form.Label>
              <Form.Control type="text" value={supplierData.supplierName} onChange={(e) => setSupplierData({ ...supplierData, supplierName: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>KRA Pin</Form.Label>
              <Form.Control type="text" value={supplierData.kraPin} onChange={(e) => setSupplierData({ ...supplierData, kraPin: e.target.value })} required />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowSupplierModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddSupplier} disabled={isLoading}>{isLoading ? "Adding..." : "Submit"}</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Product Modal (unchanged behavior) */}
      <Modal show={showEditModal} onHide={() => !isLoading && handleEditClose()} size="lg" dialogClassName="small-offset-modal modal-dialog-centered" style={{ borderRadius: "12px" }}>
        <Form onSubmit={(e) => { e.preventDefault(); handleEditProduct(); }}>
          <Modal.Header closeButton className="border-0 pb-0"><Modal.Title className="h4 fw-semibold text-dark mb-0">Edit Product</Modal.Title></Modal.Header>
          <Modal.Body className="px-4 py-3">
            {/* Basic Information, Pricing, Product Details, Category, Settings (same as before) */}
            <div className="mb-4">
              <h6 className="text-muted fw-medium mb-3 text-uppercase small">Basic Information</h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">Inventory Product ID</Form.Label>
                    <Form.Control type="text" value={editProductData.inventoryId} readOnly className="form-control-lg border-1 rounded-3" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">Product Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" value={editProductData.name} onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })} required className="form-control-lg border-1 rounded-3" placeholder="Enter product name" />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="mb-4">
              <h6 className="text-muted fw-medium mb-3 text-uppercase small">Pricing Details</h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">Regular Price <span className="text-danger">*</span></Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-1 rounded-start-3"><i className="bi bi-currency-dollar text-muted"></i></span>
                      <Form.Control type="number" value={editProductData.price} onChange={(e) => setEditProductData({ ...editProductData, price: e.target.value })} required min="0" step="1" className="form-control-lg border-1 rounded-end-3" placeholder="0.00" />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">Discounted Price</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-1 rounded-start-3"><i className="bi bi-tag text-success"></i></span>
                      <Form.Control type="number" value={editProductData.priceAfterDiscount} onChange={(e) => setEditProductData({ ...editProductData, priceAfterDiscount: e.target.value })} min="0" step="0.001" className="form-control-lg border-1 rounded-end-3" placeholder="0.00" />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="mb-4">
              <h6 className="text-muted fw-medium mb-3 text-uppercase small">Product Details</h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">Barcode</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-1 rounded-start-3"><i className="bi bi-upc-scan text-muted"></i></span>
                      <Form.Control type="text" value={editProductData.barcodes} onChange={(e) => setEditProductData({ ...editProductData, barcodes: e.target.value })} placeholder="Enter product barcode" className="form-control-lg border-1 rounded-end-3" />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">Discount Quantity</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-1 rounded-start-3"><i className="bi bi-percent text-muted"></i></span>
                      <Form.Control type="text" value={editProductData.discountQuantity} onChange={(e) => setEditProductData({ ...editProductData, discountQuantity: e.target.value })} placeholder="Enter discount quantity" className="form-control-lg border-1 rounded-end-3" />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="mb-4">
              <h6 className="text-muted fw-medium mb-3 text-uppercase small">Category Management</h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">Category <span className="text-danger">*</span></Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Select value={editProductData.categoryId ?? ""} onChange={(e) => {
                        const val = e.target.value;
                        setEditProductData({ ...editProductData, categoryId: val === "" ? null : Number(val), subCategoryId: null });
                      }} required className="form-control-lg border-1 rounded-3">
                        <option value="">Select a category</option>
                        {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.id + " - " + cat.categoryName}</option>))}
                      </Form.Select>
                      <Button type="button" variant="outline-primary" className="px-3" onClick={() => setShowCategoryModal(true)} disabled={isLoading} title="Add new category">+</Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">Subcategory <span className="text-danger">*</span></Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Select name="subCategoryId" value={editProductData.subCategoryId ?? ""} onChange={(e) => setEditProductData({ ...editProductData, subCategoryId: e.target.value === "" ? null : Number(e.target.value) })} required disabled={editProductData.categoryId === null} className="form-control-lg border-1 rounded-3">
                        <option value="">Select a subcategory</option>
                        {Array.isArray(subCategories) ? subCategories.filter(sc => Number(sc.categoryId) === Number(editProductData.categoryId)).map(sc => (<option key={sc.id} value={sc.id}>{sc.subcategoryName}</option>)) : null}
                      </Form.Select>
                      <Button type="button" variant="outline-primary" className="px-3" onClick={() => setShowSubCategoryModal(true)} disabled={isLoading || editProductData.categoryId === null} title="Add new subcategory">+</Button>
                    </div>
                    {editProductData.categoryId === null && <Form.Text className="text-muted small mt-1">Please select a category first</Form.Text>}
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="mb-4">
              <h6 className="text-muted fw-medium mb-3 text-uppercase small">Product Settings</h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-dark mb-2">Purchase Limit</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-1 rounded-start-3"><i className="bi bi-basket text-muted"></i></span>
                      <Form.Control type="number" value={editProductData.purchaseCap} onChange={(e) => setEditProductData({ ...editProductData, purchaseCap: e.target.value })} min="1" className="form-control-lg border-1 rounded-end-3" placeholder="Max items per customer" />
                    </div>
                    <Form.Text className="text-muted small mt-1">Maximum quantity a customer can purchase</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Form.Group className="w-100">
                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 border-1">
                      <div>
                        <Form.Label className="fw-medium text-dark mb-1"><i className="bi bi-globe me-2 text-primary"></i> Show Online</Form.Label>
                        <div className="text-muted small">Display this product on your online store</div>
                      </div>
                      <Form.Check type="switch" id="showOnlineSwitchEdit" className="ms-3" checked={!!editProductData.showOnline} onChange={(e) => setEditProductData({ ...editProductData, showOnline: e.target.checked })} style={{ transform: "scale(1.2)" }} />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0 pb-4 px-4">
            <div className="d-flex justify-content-end gap-3 w-100">
              <Button type="button" variant="light" onClick={() => !isLoading && handleEditClose()} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isLoading}>{isLoading ? "Saving Changes..." : "Save Changes"}</Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Tax Modal */}
      <Modal show={showTaxModal} onHide={() => !isLoading && setShowTaxModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add products tax data</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Inventory Product</Form.Label>
              <Form.Select value={taxForm.productId} onChange={(e) => setTaxForm({ ...taxForm, productId: e.target.value })} required>
                <option value="">Select a product</option>
                {products.map((prod) => (<option key={prod.id} value={prod.inventoryId}>{prod.name}</option>))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>kra tax code</Form.Label>
              <Form.Control type="text" value={taxForm.ItemCode} onChange={(e) => setTaxForm({ ...taxForm, ItemCode: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>KRA tax rate</Form.Label>
              <Form.Control type="number" value={taxForm.taxRate} onChange={(e) => setTaxForm({ ...taxForm, taxRate: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Item Decription</Form.Label>
              <Form.Control type="text" value={taxForm.ItemDecription} onChange={(e) => setTaxForm({ ...taxForm, ItemDecription: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>unit of measure</Form.Label>
              <Form.Control type="text" value={taxForm.unitMesure} onChange={(e) => setTaxForm({ ...taxForm, unitMesure: e.target.value })} required />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowTaxModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddTaxData} disabled={isLoading}>{isLoading ? "Adding..." : "Add"}</Button>
        </Modal.Footer>
      </Modal>

      {/* Image Upload Modal */}
      <Modal show={showImageUploadModal} onHide={() => !isLoading && setShowImageUploadModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton><Modal.Title>Upload Product Image</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/jpeg,image/png,image/jpg,image/webp" style={{ display: "none" }} />
              <div className="border border-2 rounded p-3 text-center" style={{ cursor: "pointer", backgroundColor: "#f8f9ff" }} onClick={handleChooseFile}>
                {imageData.image ? (
                  <div>
                    <strong>{imageData.image.name}</strong>
                    <div className="text-muted small">Size: {(imageData.image.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <div>
                    <div><strong>Click to select an image</strong></div>
                    <div className="text-muted small">Choose from your computer</div>
                  </div>
                )}
              </div>
              <Form.Text className="text-muted">Supported formats: JPEG, PNG, WebP. Maximum size: 5MB</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check type="checkbox" id="isPrimaryCheckbox" label="Set as primary product image" checked={imageData.isPrimary} onChange={(e) => setImageData({ ...imageData, isPrimary: e.target.checked })} />
              <Form.Text className="text-muted">Primary images are displayed as the main product image</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowImageUploadModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleUploadImage} disabled={isLoading || !imageData.image}>{isLoading ? "Uploading..." : "Upload Image"}</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Stock Modal */}
      <Modal show={showEditStockModal} onHide={() => !isLoading && setShowEditStockModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton><Modal.Title>Edit Stock</Modal.Title></Modal.Header>
        <Modal.Body>
          {editStockData && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Product SKU</Form.Label>
                <Form.Control type="text" value={editStockData.productId} onChange={(e) => setEditStockData({ ...editStockData, productId: e.target.value })} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control type="number" value={editStockData.stockQuantity} onChange={(e) => setEditStockData({ ...editStockData, stockQuantity: e.target.value })} required min="0" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Threshold</Form.Label>
                <Form.Control type="number" value={editStockData.stockThreshold} onChange={(e) => setEditStockData({ ...editStockData, stockThreshold: e.target.value })} required min="0" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Purchase Price</Form.Label>
                <Form.Control type="number" value={editStockData.stockPrice} onChange={(e) => setEditStockData({ ...editStockData, stockPrice: e.target.value })} required min="0" step="0.01" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Supplier</Form.Label>
                <Form.Select value={editStockData.supplierId} onChange={(e) => setEditStockData({ ...editStockData, supplierId: e.target.value })} required>
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (<option key={supplier.id} value={supplier.id}>{supplier.supplierName}</option>))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowEditStockModal(false)}>Close</Button>
          <Button variant="primary" onClick={async () => {
            // update flow: call inventories.update if you want; left as-is (you can wire to API.inventories.update)
            if (!editStockData) return;
            try {
              setIsLoading(true);
              await API.inventories.update(editStockData.productId, editStockData);
              showToastMessage("Stock updated successfully", "success");
              setShowEditStockModal(false);
              fetchStocks(currentInventoryPage);
            } catch (err) {
              showToastMessage("Failed to update stock: " + (err?.message || "error"), "danger");
            } finally {
              setIsLoading(false);
            }
          }} disabled={isLoading}>{isLoading ? "Updating..." : "Update"}</Button>
        </Modal.Footer>
      </Modal>

      {/* Products Excel Modal */}
      <Modal show={showProductsExcelModal} onHide={() => setShowProductsExcelModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton><Modal.Title>Upload Products Excel</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Drag & drop or click to select an Excel file</Form.Label>
              <Form.Control type="file" accept=".xlsx,.xls" onChange={(e) => setProductsExcelFile(e.target.files[0])} />
              <Form.Text className="text-muted">The file will be sent as-is to the /inventories endpoint.</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductsExcelModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleUploadProductsExcel} disabled={isLoading || !productsExcelFile}>{isLoading ? "Uploading..." : "Upload"}</Button>
        </Modal.Footer>
      </Modal>

      {/* Stock Excel Modal */}
      <Modal show={showStockExcelModal} onHide={() => setShowStockExcelModal(false)} dialogClassName="custom-modal modal-dialog-centered">
        <Modal.Header closeButton><Modal.Title>Upload Stock Excel</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Drag & drop or click to select an Excel file</Form.Label>
              <Form.Control type="file" accept=".xlsx,.xls" onChange={(e) => setStockExcelFile(e.target.files[0])} />
              <Form.Text className="text-muted">The file will be sent as-is to the /products endpoint.</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStockExcelModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleUploadStockExcel} disabled={isLoading || !stockExcelFile}>{isLoading ? "Uploading..." : "Upload"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StockManagement;
