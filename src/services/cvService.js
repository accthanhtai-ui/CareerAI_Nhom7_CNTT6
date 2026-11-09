import api from "./api";

export const cvService = {
  getAll() {
    return api.get("/cvs");
  },

  upload(formData) {
    return api.post("/cvs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  analyze(cvId) {
    return api.post(`/cvs/${cvId}/analyze`);
  },
};
