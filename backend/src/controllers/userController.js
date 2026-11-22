import { User } from "../models/User.js";

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.area ? { area: user.area } : {}),
  };
}

export async function listUsers(_request, response) {
  const users = await User.find({}, "name email role area")
    .sort({ role: 1, area: 1, name: 1 })
    .lean();
  response.json({ users: users.map(serializeUser) });
}

export async function listManagers(_request, response) {
  const managers = await User.find(
    { role: "manager" },
    "name email role area",
  )
    .sort({ area: 1, name: 1 })
    .lean();
  response.json({ managers: managers.map(serializeUser) });
}
