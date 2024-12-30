import { loadData, saveData } from "../../utils/localstore.js";
import { LOGIN_FAILURE, LOGIN_SUCCESS } from "./actionType.js";

const initState = {
  token: loadData("token") || "",
  isAuth: !loadData("token") ? false : true,
  userId: loadData("id"),
};

export const reducer = (state = initState, { type, payload, userId }) => {
  switch (type) {
    case LOGIN_SUCCESS:
      saveData("token", payload.token); // payload giờ chứa cả token và userID
      saveData("userID", payload.userID);
      return {
        ...state,
        isAuth: true,
        token: payload.token,
        userID: payload.userID,
      };

    case LOGIN_FAILURE:
      saveData("token", "");
      saveData("userID", ""); // Xóa userID khi đăng nhập thất bại
      return {
        ...state,
        isAuth: false,
        token: "",
        userID: "",
      };
    default:
      return state;
  }
};
