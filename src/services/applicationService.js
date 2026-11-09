import api from "./api";

export const applicationService = {
  apply(jobId, data) {
    return api.post(`/jobs/${jobId}/apply`, data);
  },

  getMyApplications() {
    return api.get("/applications/me");
  },
};
