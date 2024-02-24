import { Router } from "express";
import {
  getUsersController,
  getUserController,
  deleteUserController,
} from "../../controllers/usersControllers.js";
import { authorization } from "../../utils/auth.js";
import { passportCall } from "../../utils/passport.js";

const router = Router();

router.get(
  "/",
  passportCall("jwt"),
  authorization("admin"),
  getUsersController
);

router.get(
  "/:userId",
  passportCall("jwt"),
  authorization("admin"),
  getUserController
);

router.delete(
  "/:userId",
  passportCall("jwt"),
  authorization("admin"),
  deleteUserController
);

export default router;
