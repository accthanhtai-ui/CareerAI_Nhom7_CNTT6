import api from "./api";

export const jobService = {
  getAll(params) {
    return api.get("/jobs", { params });
  },

  getById(jobId) {
    return api.get(`/jobs/${jobId}`);
  },
};
