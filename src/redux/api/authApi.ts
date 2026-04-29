import { api } from "./rtkApi";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login?platform=web",
        method: "POST",
        body: {
          userName: credentials.userName || credentials.phoneNumber,
          password: credentials.passwordHash || credentials.password,
        },
      }),
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: "/register?platform=web",
        method: "POST",
        body: userData,
      }),
    }),

    sendOtp: builder.mutation({
      query: ({ username }) => ({
        url: `/send-otp?username=${username}&platform=web`,
        method: "GET",
      }),
    }),

    verifyOtp: builder.mutation({
      query: ({ username, otp }) => ({
        url: `/verify-otp?username=${username}&otp=${otp}&platform=web`,
        method: "POST",
      }),
    }),

    editUser: builder.mutation({
      query: ({ phoneNumber, payload }) => ({
        url: `/user-details/${phoneNumber}?platform=web`,
        method: "PUT",
        body: payload,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useEditUserMutation,
} = authApi;
