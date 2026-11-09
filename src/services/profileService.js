import api from "./api";

export const profileService = {
  getMyProfile() {
    return api.get("/profile/me");
  },

  updateMyProfile(data) {
    return api.put("/profile/me", data);
  },
};
