//Modules imports:
import express from "express";
import handlebars from "express-handlebars";
import Handlebars from "handlebars";

//Passport imports
import passport from "passport";
import cookieParser from "cookie-parser";
import initializePassport from "./config/usersConfig.js";

//Routers imports:
import { ProductRouter } from "./routes/api/products.routes.js";
import { CartsRouter } from "./routes/api/carts.routes.js";
import { viewsRouter } from "./routes/views/views.routes.js";
import { adminRouter } from "./routes/views/admin.views.routes.js";
import ticketRouter from "./routes/api/tickets.routes.js";
import emailRouter from "./routes/api/email.routes.js";
import usersRouter from "./routes/api/users.routes.js";
import userViewRouter from "./routes/views/users.views.routes.js";
import jwtRouter from "./routes/api/jwt.routes.js";
import actionsRouter from "./routes/api/users.actions.routes.js";

//Assets imports:
import { Server } from "socket.io";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import { messagesService } from "./services/service.js";
import basePath from "./utils/path.js";
import { cookieExtractorEmail } from './utils/extractor.js'

// import fetch from 'node-fetch';

//Config imports
import config from "./config/config.js";
import MongoSingleton from "./config/mongodb_Singleton.js";
import cors from "cors";

//Server
const app = express();
const PORT = config.port;
const httpServer = app.listen(PORT, () => {
  `Server listening on port ${PORT}`;
});

//Midlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
initializePassport();
app.use(passport.initialize());
app.use(cors());

//Handlebars
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
      ifRoleEquals: function (role, targetRole, options) {
        return role === targetRole ? options.fn(this) : options.inverse(this);
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", `${basePath}/views`);

//Static
app.use(express.static(`${basePath}/public`));

//Mongoose
const mongoInstance = async () => {
  try {
    await MongoSingleton.getInstance();
  } catch (error) {
    console.log(error);
  }
};
mongoInstance();

//SocketServer
const io = new Server(httpServer);

//Cookies
app.use(cookieParser("CoderS3cr3tC0d3"));

//Api routers
app.use("/api/products", ProductRouter);
app.use("/api/carts", CartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/jwt", jwtRouter);
app.use("/api/actions", actionsRouter);
app.use("/api/email", emailRouter);
app.use("/api/tickets", ticketRouter);

//ViewRouter
app.use("/", viewsRouter);
app.use("/users", userViewRouter);
app.use("/admin", adminRouter);

app.get("/getUserEmail", async (req, res) => {
  let userEmail; // Definir userEmail fuera del bloque try-catch
  try {
      userEmail = cookieExtractorEmail(req); // Llama a la función cookieExtractor para obtener el token de la cookie
      console.log("Email obtenido desde Cookie:", userEmail);
  } catch (error) {
      console.log(error);
      res.json({
          message: "Error",
          error,
      });
      return; // Importante: Terminar la ejecución después de manejar el error
  }

  // Simulación: obtén el correo electrónico desde la sesión
  const EmailUsuario = userEmail;

  // Responde con el correo electrónico en formMato JSON
  res.json({ email: EmailUsuario });
});

//Socket
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("userConnected", async (currentUserEmail) => {
		console.log("🎇 User connected to chat:", currentUserEmail);
		// socket.broadcast.emit("newUserConnected", currentUserEmail);

		try {
			const chatHistory = await obtenerHistorialDeChats();
			socket.emit("chatHistory", chatHistory);
		} catch (error) {
			console.log("Error al obtener el historial de chats:", error.message);
			socket.emit("chatHistory", []);
		}
	});

	async function obtenerHistorialDeChats() {
		try {
			// const chatHistory = await messagesService.getAllMessages();
			const chatHistory = await messagesService.getAll();
			return chatHistory;
		} catch (error) {
			console.log("Error al obtener el historial de chats:", error.message);
			return [];
		}
	}

  socket.on("message", async (data) => {
    console.log(data);
    await messagesService.create(data);
		io.emit("newChatMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});
