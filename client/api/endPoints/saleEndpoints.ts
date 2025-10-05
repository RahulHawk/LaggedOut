export const saleEndpoints = {
  create: "/sales",
  getAll: "/sales",
  getActive: "/sales/active",
  activate: (saleId: string) => `/sales/activate/${saleId}`,
  deactivate: (saleId: string) => `/sales/deactivate/${saleId}`,
};