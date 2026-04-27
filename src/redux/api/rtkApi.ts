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
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithLogout: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, queryApi: BaseQueryApi, extraOptions) => {
  const result = await baseQuery(args, queryApi, extraOptions);

  // Auto-logout on 401 exceptions, except for login endpoints
  const url = typeof args === "string" ? args : args.url;
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
