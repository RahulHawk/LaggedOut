export const endpoints = {
  genre: {
    getAll: "/genres",
    add: "/add-genre",
    update: (id: string) => `/update-genre/${id}`,
    delete: (id: string) => `/delete-genre/${id}`,
    preview: "/genres/previews"
  },
  tag: {
    getAll: "/tags",
    add: "/add-tag",
    update: (id: string) => `/update-tag/${id}`,
    delete: (id: string) => `/delete-tag/${id}`,
  },
};