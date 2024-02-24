import config from "../config/config.js";
import jwt from "jsonwebtoken";

const privateKey = config.privateKey;

export const cookieExtractorEmail = req => {
    let userEmail = null;
    if (req && req.cookies) {
        const token = req.cookies['jwtCookieToken'];
        console.log(token)
        if (token) {
            try {
                const decoded = jwt.verify(token, privateKey);
                userEmail = decoded.user.email; // El correo electrónico está presente en el payload del token
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }
    }
    console.log(userEmail)
    return userEmail;
};