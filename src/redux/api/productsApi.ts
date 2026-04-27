import { api } from "./rtkApi";

export const toArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (payload == null) return [];
  if (payload && Array.isArray(payload.content)) return payload.content;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [payload];
};

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<any[], void>({
      query: () => "/categories",
      transformResponse: toArray,
      providesTags: ["Products"],
    }),
    createCategory: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/category",
        method: "POST",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Products"],
    }),
    getSubcategories: builder.query<any[], void>({
      query: () => "/subcategories",
      transformResponse: toArray,
      providesTags: ["Products"],
    }),
    createSubcategory: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/subCategory",
        method: "POST",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Products"],
    }),
    getSuppliers: builder.query<any[], void>({
      query: () => "/suppliers",
      transformResponse: toArray,
      providesTags: ["Products"],
    }),
    createSupplier: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/supplier",
        method: "POST",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Products"],
    }),
    updateSupplier: builder.mutation<any, { id: string; payload: any }>({
      query: ({ id, payload }) => ({
        url: `/supplier/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Products"],
    }),
    removeSupplier: builder.mutation<any, string>({
      query: (id) => ({
        url: `/supplier/${id}`,
        method: "DELETE",
      }),
      transformResponse: toArray,
      invalidatesTags: ["Products"],
    }),
    getInvoices: builder.query<any[], void>({
      query: () => "/invoices",
      transformResponse: toArray,
      providesTags: ["Products"],
    }),
    createInvoice: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/invoice",
        method: "POST",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Products"],
    }),
    createInventory: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/inventory",
        method: "POST",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Stock"],
    }),
    updateInventory: builder.mutation<any, { id: string; payload: any }>({
      query: ({ id, payload }) => ({
        url: `/inventory/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Stock"],
    }),
    getPagedInventories: builder.query<any, { page: number; pageSize: number }>({
      query: ({ page = 1, pageSize = 25 }) => `/paged-inventories?pageNumber=${page}&pageSize=${pageSize}`,
      transformResponse: toArray,
      providesTags: ["Stock"],
    }),
    uploadExcelInventories: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/inventories",
        method: "POST",
        body: formData,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Stock"],
    }),
    getPagedProducts: builder.query<any, { page: number; pageSize: number }>({
      query: ({ page = 1, pageSize = 25 }) => `/pos-paged-products?pageNumber=${page}&pageSize=${pageSize}`,
      transformResponse: toArray,
      providesTags: ["Products"],
    }),
    getProducts: builder.query<any[], void>({
      query: () => "/products",
      transformResponse: toArray,
      providesTags: ["Products"],
    }),
    getProduct: builder.query<any, string>({
      query: (id) => `/product/${id}`,
      transformResponse: toArray,
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/product",
        method: "POST",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Products"],
    }),
    updateProduct: builder.mutation<any, { id: string; payload: any }>({
      query: ({ id, payload }) => ({
        url: `/product/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Products"],
    }),
    uploadProductImage: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/product-image-details",
        method: "POST",
        body: formData,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Products"],
    }),
    createRestockLog: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/restock-log",
        method: "POST",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Stock"],
    }),
    getGoodsInfo: builder.query<any[], void>({
      query: () => "/taxData",
      transformResponse: toArray,
      providesTags: ["Products"],
    }),
    createGoodsInfo: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/goodsinfo",
        method: "POST",
        body: payload,
      }),
      transformResponse: toArray,
      invalidatesTags: ["Products"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetSubcategoriesQuery,
  useCreateSubcategoryMutation,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useRemoveSupplierMutation,
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useGetPagedInventoriesQuery,
  useUploadExcelInventoriesMutation,
  useGetPagedProductsQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useCreateRestockLogMutation,
  useGetGoodsInfoQuery,
  useCreateGoodsInfoMutation,
  useLazyGetPagedInventoriesQuery,
  useLazyGetPagedProductsQuery,
  useLazyGetProductQuery,
  useLazyGetInvoicesQuery,
} = productsApi;
