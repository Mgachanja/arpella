import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Form, Table, Toast, ToastContainer, Row, Col } from "react-bootstrap";
import axios from "axios";

const StockManagement = () => {
  // Modal visibility, toast notifications, and loading state.
  const [showStockModal, setShowStockModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showStockExcelModal, setShowStockExcelModal] = useState(false);
  const [showProductsExcelModal, setShowProductsExcelModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [isLoading, setIsLoading] = useState(false);

  // Form state for stock, category, product, image, and subcategory modals.
  const [stockData, setStockData] = useState({ productId: "", stockPrice: "", stockQuantity: "", stockThreshold: "" });
  const [categoryName, setCategoryName] = useState("");
  // Use null for numeric IDs so they can be compared with fetched data.
  const [productData, setProductData] = useState({ 
    name: null, 
    price: null, 
    priceAfterDiscount: null,
    taxRate: null,
    purchaseCap:null,
    discountQuantity: null,
    barcode: null,
    inventoryId: null, 
    categoryId: null, 
    subCategoryId: null,
  });
  const [imageData, setImageData] = useState({ productId: "", isPrimary: false, image: null });
  const [subCategoryData, setSubCategoryData] = useState({ subcategoryName: "", categoryId: null });

  // Data arrays.
  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [barcodeTags, setBarcodeTags] = useState([]);

  // File input ref and base API URL.
  const fileInputRef = useRef(null);
  const baseUrl = process.env.REACT_APP_BASE_API_URL;

  // Excel file states.
  const [stockExcelFile, setStockExcelFile] = useState(null);
  const [productsExcelFile, setProductsExcelFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Fetch inventories, categories, subcategories, and products from their respective endpoints.
   * Note: Subcategories are now fetched from the `/subcategories` endpoint.
   */
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const inventoriesResponse = await axios.get(`${baseUrl}/inventories`, {
        headers: { "Content-Type": "application/json" }
      });
      if (Array.isArray(inventoriesResponse.data)) {
        setInventories(inventoriesResponse.data);
      } else {
        showToastMessage("Failed to fetch inventories: Invalid data format", "danger");
      }

      const categoriesResponse = await axios.get(`${baseUrl}/categories`, {
        headers: { "Content-Type": "application/json" }
      });
      if (Array.isArray(categoriesResponse.data)) {
        setCategories(categoriesResponse.data);
      } else {
        showToastMessage("Failed to fetch categories: Invalid data format", "danger");
      }

      // Fetch subcategories from the /subcategories endpoint.
      const subCategoriesResponse = await axios.get(`${baseUrl}/subcategories`, {
        headers: { "Content-Type": "application/json" }
      });
      if (Array.isArray(subCategoriesResponse.data)) {
        setSubCategories(subCategoriesResponse.data);
      } else {
        showToastMessage("Failed to fetch subcategories: Invalid data format", "danger");
      }

      const productsResponse = await axios.get(`${baseUrl}/products`, {
        headers: { "Content-Type": "application/json" }
      });
      if (Array.isArray(productsResponse.data)) {
        setProducts(productsResponse.data);
      } else {
        showToastMessage("Failed to fetch products: Invalid data format", "danger");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      showToastMessage(`Failed to fetch data: ${errorMessage}`, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset all form fields and file inputs.
   */
  const resetForms = () => {
    setStockData({ productId: "", stockQuantity: "", stockThreshold: "", stockPrice: "" });
    setCategoryName("");
    setProductData({ 
      name: "", 
      price: null , 
      priceAfterDiscount:null  ,
      taxRate:null  ,
      discountQuantity:null  ,
      barcode:null ,
      inventoryId: "", 
      categoryId: null, 
      subCategoryId: null,
      purchaseCap: null 
    });
    setImageData({ productId: "", isPrimary: false, image: null });
    setSubCategoryData({ subcategoryName: "", categoryId: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStockExcelFile(null);
    setProductsExcelFile(null);
    setBarcodeTags([]);
  };

  /**
   * Display a toast notification.
   * @param {string} message - The notification message.
   * @param {string} variant - The toast variant ("success", "danger", etc.).
   */
  const showToastMessage = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  /**
   * Handle adding new stock.
   */
  const handleAddStock = async () => {
    try {
      setIsLoading(true);
      if (!stockData.productId || !stockData.stockQuantity || !stockData.stockThreshold || !stockData.stockPrice) {
        throw new Error("All fields are required");
      }
      await axios.post(`${baseUrl}/inventory`, stockData, {
        headers: { "Content-Type": "application/json" }
      });
      showToastMessage("Stock added successfully", "success");
      setShowStockModal(false);
      resetForms();
      fetchData();
    } catch (error) {
      showToastMessage("Failed to add stock: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle adding a new category.
   */
  const handleAddCategory = async () => {
    try {
      setIsLoading(true);
      if (!categoryName.trim()) {
        throw new Error("Category name is required");
      }
      await axios.post(`${baseUrl}/category`, { categoryName: categoryName });
      showToastMessage("Category added successfully", "success");
      setShowCategoryModal(false);
      resetForms();
      fetchData();
    } catch (error) {
      showToastMessage("Failed to add category: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle adding a new subcategory.
   */
  const handleAddSubCategory = async () => {
    try {
      setIsLoading(true);
      if (!subCategoryData.subcategoryName.trim() || subCategoryData.categoryId === null) {
        throw new Error("Subcategory name and category are required");
      }
      await axios.post(`${baseUrl}/subCategory`, subCategoryData, {
        headers: { "Content-Type": "application/json" }
      });
      showToastMessage("Subcategory added successfully", "success");
      setShowSubCategoryModal(false);
      resetForms();
      fetchData();
    } catch (error) {
      showToastMessage("Failed to add subcategory: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle adding a new product.
   * Transforms the product data into an object with keys exactly:
   * id, barcodes, category, subcategory, name, price, taxRate, discountQuantity, priceAfterDiscount.
   * If multiple barcodes (comma separated) are provided, posts each individually.
   */
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
      if (productData.taxRate && !/^\d*\.?\d{0,2}$/.test(productData.taxRate)) {
        showToastMessage("Tax rate must be in format 0.00", "danger");
        return;
      }
      // Create payload with keys exactly as required.
      const createPayload = (barcodeValue) => ({
        inventoryId: productData.inventoryId,
        barcodes: barcodeValue,
        purchaseCap:productData.purchaseCap,
        category: productData.categoryId,
        subcategory: productData.subCategoryId,
        name: productData.name,
        price: productData.price,
        taxRate: productData.taxRate,
        discountQuantity: productData.discountQuantity,
        priceAfterDiscount: productData.priceAfterDiscount
      });
      
      if (productData.barcode) {
        const barcodes = productData.barcode.split(",").map(code => code.trim()).filter(code => code);
        if (barcodes.length > 0) {
          for (const barcode of barcodes) {
            const payload = createPayload(barcode);
            console.log("Submitting payload for barcode:", barcode, payload);
            await axios.post(`${baseUrl}/product`, payload, {
              headers: { "Content-Type": "application/json" }
            });
          }
          showToastMessage(`${barcodes.length} product(s) added successfully`, "success");
        } else {
          const payload = createPayload(productData.barcode);
          console.log("Submitting payload:", payload);
          await axios.post(`${baseUrl}/products`, payload, {
            headers: { "Content-Type": "application/json" }
          });
          showToastMessage("Product added successfully", "success");
        }
      } else {
        // If no barcode is provided, submit with an empty string.
        const payload = createPayload("");
        console.log("Submitting payload with empty barcode:", payload);
        await axios.post(`${baseUrl}/product`, payload, {
          headers: { "Content-Type": "application/json" }
        });
        showToastMessage("Product added successfully", "success");
      }
      setShowProductModal(false);
      resetForms();
      fetchData();
    } catch (error) {
      showToastMessage("Failed to add product: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle file selection for image upload and validate file type/size.
   */
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

  /**
   * Handle uploading the product image.
   */
  const handleUploadImage = async () => {
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
      showToastMessage("Image uploaded successfully", "success");
      setShowImageUploadModal(false);
      resetForms();
      fetchData();
    } catch (error) {
      showToastMessage("Failed to upload image: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle uploading the Stock Excel file.
   */
  const handleUploadStockExcel = async () => {
    if (!stockExcelFile) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", stockExcelFile);
      await axios.post(`${baseUrl}/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      showToastMessage("Stock Excel uploaded successfully", "success");
      setShowStockExcelModal(false);
      setStockExcelFile(null);
      fetchData();
    } catch (error) {
      showToastMessage("Failed to upload Stock Excel: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle uploading the Products Excel file.
   */
  const handleUploadProductsExcel = async () => {
    if (!productsExcelFile) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", productsExcelFile);
      await axios.post(`${baseUrl}/inventories`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      showToastMessage("Products Excel uploaded successfully", "success");
      setShowProductsExcelModal(false);
      setProductsExcelFile(null);
      fetchData();
    } catch (error) {
      showToastMessage("Failed to upload Products Excel: " + (error.response?.data?.message || error.message), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render subcategory options filtered by the selected category.
   */
  const renderSubCategoryOptions = () => {
    const filteredSubCategories = subCategories.filter(
      subCat => productData.categoryId !== null && subCat.categoryId === productData.categoryId
    );
    return filteredSubCategories.map(subCat => (
      <option key={subCat.id} value={subCat.id}>
        {subCat.subcategoryName}
      </option>
    ));
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Stock Management</h2>
      <div className="d-flex gap-3 mb-3">
        <Button onClick={() => setShowStockModal(true)} disabled={isLoading}>Add Stock</Button>
        <Button onClick={() => setShowCategoryModal(true)} disabled={isLoading}>Add Category</Button>
        <Button onClick={() => setShowProductModal(true)} disabled={isLoading}>Add Product</Button>
        <Button onClick={() => setShowImageUploadModal(true)} disabled={isLoading}>Upload Product Image</Button>
        <Button onClick={() => setShowStockExcelModal(true)} disabled={isLoading}>Upload Stock Excel</Button>
        <Button onClick={() => setShowProductsExcelModal(true)} disabled={isLoading}>Upload Products Excel</Button>
      </div>

      {/* Stock Excel Modal */}
      <Modal show={showStockExcelModal} onHide={() => setShowStockExcelModal(false)}>
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
          <Button variant="secondary" onClick={() => setShowStockExcelModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleUploadStockExcel} disabled={isLoading || !stockExcelFile}>
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Products Excel Modal */}
      <Modal show={showProductsExcelModal} onHide={() => setShowProductsExcelModal(false)}>
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
          <Button variant="secondary" onClick={() => setShowProductsExcelModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleUploadProductsExcel} disabled={isLoading || !productsExcelFile}>
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant} className="text-white">
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      
      {/* Add Stock Modal */}
      <Modal show={showStockModal} onHide={() => !isLoading && setShowStockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product SKU</Form.Label>
              <Form.Control type="text" value={stockData.productId} onChange={e => setStockData({ ...stockData, productId: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" value={stockData.stockQuantity} onChange={e => setStockData({ ...stockData, stockQuantity: e.target.value })} required min="0" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Threshold</Form.Label>
              <Form.Control type="number" value={stockData.stockThreshold} onChange={e => setStockData({ ...stockData, stockThreshold: e.target.value })} required min="0" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Purchase Price</Form.Label>
              <Form.Control type="number" value={stockData.stockPrice} onChange={e => setStockData({ ...stockData, stockPrice: e.target.value })} required min="0" step="0.01" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowStockModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddStock} disabled={isLoading}>
            {isLoading ? "Adding..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Category Modal */}
      <Modal show={showCategoryModal} onHide={() => !isLoading && setShowCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Category Name</Form.Label>
              <Form.Control type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowCategoryModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddCategory} disabled={isLoading}>
            {isLoading ? "Adding..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>

  {/* Add Product Modal */}
    <Modal show={showProductModal} onHide={() => !isLoading && setShowProductModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Products</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Inventory Product</Form.Label>
                <Form.Select value={productData.inventoryId} onChange={e => setProductData({ ...productData, inventoryId: e.target.value })} required>
                  <option value="">Select a product</option>
                  {inventories.map(inv => (
                    <option key={inv.productId} value={inv.productId}>{inv.productId}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Product Name</Form.Label>
                <Form.Control type="text" value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} required />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control type="number" value={productData.price} onChange={e => setProductData({ ...productData, price: e.target.value })} required min="0" step="1" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Price After Discount</Form.Label>
                <Form.Control type="number" value={productData.priceAfterDiscount} onChange={e => setProductData({ ...productData, priceAfterDiscount: e.target.value })} min="0" step="0.001" />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tax Rate (e.g., 0.075 for 7.5%)</Form.Label>
                <Form.Control type="number" value={productData.taxRate} onChange={e => setProductData({ ...productData, taxRate: e.target.value })} min="0" max="1" step="0.001" placeholder="0.00" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Discount Quantity</Form.Label>
                <Form.Control type="number" value={productData.discountQuantity} onChange={e => setProductData({ ...productData, discountQuantity: e.target.value })} min="0" placeholder="Minimum quantity for discount" />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Barcodes (comma separated for multiple products)</Form.Label>
            <Form.Control type="text" value={productData.barcode} onChange={e => setProductData({ ...productData, barcode: e.target.value })} placeholder="e.g., 123456789, 987654321" />
            <Form.Text className="text-muted">
              Multiple barcodes will create multiple products with the same details but different barcodes.
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={productData.categoryId ?? ""}
                  onChange={e => {
                    const value = e.target.value;
                    setProductData({ 
                      ...productData, 
                      categoryId: value === "" ? null : Number(value),
                      subCategoryId: null 
                    });
                  }}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Subcategory</Form.Label>
                <div className="d-flex">
                  <Form.Select
                    value={productData.subCategoryId ?? ""}
                    onChange={e => setProductData({ ...productData, subCategoryId: e.target.value === "" ? null : Number(e.target.value) })}
                    required
                    className="me-2"
                    disabled={productData.categoryId === null}
                  >
                    <option value="">Select a subcategory</option>
                    {renderSubCategoryOptions()}
                  </Form.Select>
                  <Button variant="outline-secondary" onClick={() => setShowSubCategoryModal(true)} disabled={isLoading || productData.categoryId === null}>
                    +
                  </Button>
                </div>
                {productData.categoryId === null && (
                  <Form.Text className="text-muted">Please select a category first</Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Removed required from Purchase Cap */}
          <Form.Group className="mb-3">
            <Form.Label>Purchase Cap</Form.Label>
            <Form.Control type="number" value={productData.purchaseCap} onChange={e => setProductData({ ...productData, purchaseCap: e.target.value })} min="1" />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => !isLoading && setShowProductModal(false)}>Close</Button>
        <Button variant="primary" onClick={handleAddProduct} disabled={isLoading}>
          {isLoading ? "Adding..." : "Submit"}
        </Button>
      </Modal.Footer>
    </Modal>


      {/* Add Subcategory Modal */}
      <Modal show={showSubCategoryModal} onHide={() => !isLoading && setShowSubCategoryModal(false)}>
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
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Subcategory Name</Form.Label>
              <Form.Control type="text" value={subCategoryData.subcategoryName} onChange={e => setSubCategoryData({ ...subCategoryData, subcategoryName: e.target.value })} required />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowSubCategoryModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddSubCategory} disabled={isLoading}>
            {isLoading ? "Adding..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Upload Product Image Modal */}
      <Modal show={showImageUploadModal} onHide={() => !isLoading && setShowImageUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Product Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Product</Form.Label>
              <Form.Select value={imageData.productId} onChange={e => setImageData({ ...imageData, productId: e.target.value })} required>
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </Form.Select>
              {products.length === 0 && (
                <div className="text-danger mt-2">No products available. Please add products first.</div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control formEncType="multipart/form-data" type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/jpeg,image/png,image/jpg,image/webp" required />
              <Form.Text className="text-muted">Supported formats: JPEG, PNG, WebP. Maximum size: 5MB</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" id="isPrimaryCheckbox" label="Set as primary product image" checked={imageData.isPrimary} onChange={e => setImageData({ ...imageData, isPrimary: e.target.checked })} />
              <Form.Text className="text-muted">Primary images are displayed as the main product image</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => !isLoading && setShowImageUploadModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleUploadImage} disabled={isLoading || !imageData.productId || !imageData.image}>
            {isLoading ? "Uploading..." : "Upload Image"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant} className="text-white">
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Threshold</th>
            <th>Purchase Price</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="6" className="text-center">Loading...</td>
            </tr>
          ) : inventories.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">No data available</td>
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
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default StockManagement;
