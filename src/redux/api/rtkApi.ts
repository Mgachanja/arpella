import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";
import { baseUrl } from "../../constants";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    // The Redux store attaches the auth state to the 'auth' reducer key.
    const token = (getState() as any).auth?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithLogout: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, queryApi: BaseQueryApi, extraOptions) => {
  const url = typeof args === "string" ? args : args.url;
  const method = typeof args === "string" ? "GET" : args.method || "GET";
  const token = (queryApi.getState() as any).auth?.token;

  console.log(`[RTK Query] ${method} ${url} | token: ${token ? token.substring(0, 20) + '...' : 'NONE'}`);

  const result = await baseQuery(args, queryApi, extraOptions);

  if (result.error) {
    console.error(`[RTK Query Error] ${method} ${url}:`, result.error);
  }

  // Auto-logout on 401 exceptions, except for login endpoints
  if (result?.error?.status === 401 && !url?.includes("login")) {
    // queryApi.dispatch(api.util.resetApiState()); // if you want to reset api cache across the board on logout
    queryApi.dispatch(logout());
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithLogout,
  endpoints: () => ({}),
  tagTypes: ["Staff", "Products", "Stock", "Auth", "User"],
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 0,
  extractRehydrationInfo(action: any, { reducerPath }) {
    // Automatically rehydrate the RTK Query cache using redux-persist
    if (action.type === "persist/REHYDRATE") {
      return action.payload?.[reducerPath];
    }
  },
});
