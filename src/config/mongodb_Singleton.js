import mongoose from "mongoose";
import config from "./config.js";

export default class MongoSingleton {
  static #instance;

  constructor() {
    this.#connectMongoDB();
  }

  //Singleton implementation
  static getInstance() {
    if (this.#instance) {
      console.log("Connection already opened with MongoDB");
    } else {
      this.#instance = new MongoSingleton();
    }
    return this.#instance;
  }

  #connectMongoDB = async () => {
    try {
      await mongoose.connect(config.mongoUrl);
      console.log(`Success connecting DB using Mongoose.\n\n→→→→→→Conectado al puerto ${config.port}←←←←←←\nconfig en modo: ◀  ${config.mode}  ▶\n`);
    } catch (error) {
      console.error("Unable to connect to DB using Mongoose: " + error);
      process.exit();
    }
  };
}
