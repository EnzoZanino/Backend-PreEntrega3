import { Router } from "express";
import { authorization } from "../../utils/auth.js";
import { passportCall } from "../../utils/passport.js";
import {
  cartService,
  productsService,
  ticketsService,
  usersService,
} from "../../services/service.js";

const viewsRouter = Router();

//Basic redirection
viewsRouter.get("/", (req, res) => {
  const token = req.cookies["jwtCookieToken"];
  if (!token) {
    res.redirect("/users/login");
    return; // Importante: Terminar la ejecución después de redirigir
  }
  res.redirect("/products");
});

//Chat
viewsRouter.get(
  "/chat",
  passportCall("jwt"),
  authorization("user"),
  (req, res) => {
    const token = req.cookies["jwtCookieToken"];
    if (!token) {
      res.redirect("/users/login");
      return; // Importante: Terminar la ejecución después de redirigir
    }
    res.render("chat", {
      title: "Chat",
      user: req.user,
    });
  }
);

//Products
viewsRouter.get(
  "/products",
  passportCall("jwt"),
  authorization(["admin", "user"]),
  async (req, res) => {
    const token = req.cookies["jwtCookieToken"];
    if (!token) {
      res.redirect("/users/login");
      return; // Importante: Terminar la ejecución después de redirigir
    }
    const { page, limit, sort } = req.query;
    const products = await productsService.getAll(limit, page, sort);
    res.render("products", {
      title: "Products",
      products,
      user: req.user,
    });
  }
);

//Purchase successfull
viewsRouter.get(
  "/successPurchase",
  passportCall("jwt"),
  authorization("user"),
  (req, res) => {
    res.render("success", {
      title: "Success Purchase",
      user: req.user,
    });
  }
);

//Product Manager
viewsRouter.get(
  "/productmanager",
  passportCall("jwt"),
  authorization("admin"),
  async (req, res) => {
    const token = req.cookies["jwtCookieToken"];
    if (!token) {
      res.redirect("/users/login");
      return; // Importante: Terminar la ejecución después de redirigir
    }
    const products = await productsService.getAll(20, 1, "asc");
    res.render("productManager", {
      title: "Products Mongoose",
      products,
      user: req.user,
    });
  }
);

//Cart Manager
viewsRouter.get(
  "/cartmanager",
  passportCall("jwt"),
  authorization("admin"),
  async (req, res) => {
    const token = req.cookies["jwtCookieToken"];
    if (!token) {
      res.redirect("/users/login");
      return; // Importante: Terminar la ejecución después de redirigir
    }
    const carts = await cartService.getAll();
    res.render("cartManager", {
      title: "Carts Mongoose",
      carts,
    });
  }
);

//Users Manager
viewsRouter.get(
  "/usermanager",
  passportCall("jwt"),
  authorization("admin"),
  async (req, res) => {
    const token = req.cookies["jwtCookieToken"];
    if (!token) {
      res.redirect("/users/login");
      return; // Importante: Terminar la ejecución después de redirigir
    }
    const users = await usersService.getAll();
    res.render("userManager", {
      title: "Users Mongoose",
      users,
    });
  }
);

//Tickets Manager
viewsRouter.get(
  "/ticketmanager",
  passportCall("jwt"),
  authorization("admin"),
  async (req, res) => {
    const token = req.cookies["jwtCookieToken"];
    if (!token) {
      res.redirect("/users/login");
      return; // Importante: Terminar la ejecución después de redirigir
    }
    const tickets = await ticketsService.getAll();
    res.render("ticketManager", {
      title: "Ticket Mongoose",
      tickets,
    });
  }
);

export { viewsRouter };