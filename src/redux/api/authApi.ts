import { api } from "./rtkApi";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login?platform=web",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),
    editUser: builder.mutation({
      query: ({ phoneNumber, payload }) => ({
        url: `/user-details/${phoneNumber}`,
        method: "PUT",
        body: payload,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { 
    useLoginMutation, 
    useRegisterMutation, 
    useEditUserMutation 
} = authApi;
