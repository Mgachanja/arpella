import axios from "axios";
import { baseUrl } from "../constants";
const api = axios.create({
  baseURL: baseUrl,
  headers: { "Content-Type": "application/json" },
});

export const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload == null) return [];
  if (payload && Array.isArray(payload.content)) return payload.content;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [payload];
};


export const categories = {
  list: async () => toArray((await api.get("/categories")).data),
  create: async (payload) => toArray((await api.post("/category", payload)).data),
};

export const subcategories = {
  list: async () => toArray((await api.get("/subcategories")).data),
  create: async (payload) => toArray((await api.post("/subCategory", payload)).data),
};

export const suppliers = {
  list: async () => toArray((await api.get("/suppliers")).data),
  create: async (payload) => toArray((await api.post("/supplier", payload)).data),
  update: async (id, payload) => toArray((await api.put(`/supplier/${id}`, payload)).data),
  remove: async (id) => toArray((await api.delete(`/supplier/${id}`)).data),
};

export const invoices = {
  list: async () => toArray((await api.get("/invoices")).data),
  create: async (payload) => toArray((await api.post("/invoice", payload)).data),
};

export const inventories = {
  create: async (payload) => toArray((await api.post("/inventory", payload)).data),
  update: async (id, payload) => toArray((await api.put(`/inventory/${id}`, payload)).data),
  paged: async (page = 1, pageSize = 25) => {
    const res = await api.get("/paged-inventories", { params: { pageNumber: page, pageSize } });
    return toArray(res.data?.content ?? res.data);
  },
  uploadExcel: async (formData) => toArray((await api.post("/inventories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })).data),
};

export const products = {
  paged: async (page = 1, pageSize = 25) => {
    const res = await api.get("/pos-paged-products", { params: { pageNumber: page, pageSize } });
    return toArray(res.data?.content ?? res.data);
  },
  list: async () => toArray((await api.get("/products")).data),
  get: async (id) => toArray((await api.get(`/product/${id}`)).data),
  create: async (payload) => toArray((await api.post("/product", payload)).data),
  update: async (id, payload) => toArray((await api.put(`/product/${id}`, payload)).data),
  uploadImage: async (formData) => toArray((await api.post("/product-image-details", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })).data),
};

export const restockLog = {
  create: async (payload) => toArray((await api.post("/restock-log", payload)).data),
};

export const goodsInfo = {
  list: async () => toArray((await api.get("/taxData")).data),
  create: async (payload) => toArray((await api.post("/goodsinfo", payload)).data),
};
