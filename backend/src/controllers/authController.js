import jwt from "jsonwebtoken";
import { getConfig } from "../config/env.js";
import { Alert } from "../models/Alert.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/HttpError.js";
import { parseInput } from "../utils/validate.js";
import { loginSchema, registerSchema } from "../schemas/authSchemas.js";

function createToken(userId) {
  const config = getConfig();
  return jwt.sign({}, config.jwtSecret, {
    subject: userId,
    expiresIn: config.jwtExpiresIn,
  });
}

function authResponse(user) {
  return { token: createToken(user.id), user: user.toJSON() };
}

export async function register(request, response) {
  const input = parseInput(registerSchema, request.body);
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.password,
    role: "member",
  });
  response.status(201).json(authResponse(user));
}

export async function login(request, response) {
  const input = parseInput(loginSchema, request.body);
  const user = await User.findOne({ email: input.email.toLowerCase() }).select(
    "+passwordHash",
  );
  if (!user || !(await user.verifyPassword(input.password))) {
    throw new HttpError(401, "Correo o contraseña incorrectos.");
  }
  response.json(authResponse(user));
}

export async function currentUser(request, response) {
  const user = request.user.toJSON();
  if (request.user.role === "member") {
    user.points = 90 + (await Alert.countDocuments({
      reporterId: request.user.id,
      status: "approved",
    })) * 10;
  }
  response.json({ user });
}
