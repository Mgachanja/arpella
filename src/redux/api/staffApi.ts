import { api } from "./rtkApi";

export const staffApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStaffMembers: builder.query<any, void>({
      query: () => "/special-users",
      providesTags: ["Staff"],
    }),
    addStaff: builder.mutation<any, any>({
      query: ({ role, ...userFields }) => ({
        url: "/control",
        method: "POST",
        body: {
          user: userFields,
          role,
        },
      }),
      invalidatesTags: ["Staff"],
    }),
    deleteStaff: builder.mutation<any, string>({
      query: (PhoneNumber) => ({
        url: `/user/${PhoneNumber}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),
    getStaffCount: builder.query<number, void>({
      query: () => "/staffs",
      transformResponse: (response: any[]) => response.length,
      providesTags: ["Staff"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStaffMembersQuery,
  useAddStaffMutation,
  useDeleteStaffMutation,
  useGetStaffCountQuery,
} = staffApi;
