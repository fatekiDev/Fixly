import { User } from "../models/User.js";
import { parseInput } from "../utils/validate.js";
import { pushTokenSchema } from "../schemas/pushTokenSchemas.js";

export async function registerPushToken(request, response) {
  const { token } = parseInput(pushTokenSchema, request.body);
  await User.updateOne(
    { _id: request.user.id },
    { $addToSet: { pushTokens: token } },
  );
  await User.updateMany(
    { _id: { $ne: request.user.id } },
    { $pull: { pushTokens: token } },
  );
  response.json({ registered: true });
}

export async function unregisterPushToken(request, response) {
  const { token } = parseInput(pushTokenSchema, request.body);
  await User.updateOne(
    { _id: request.user.id },
    { $pull: { pushTokens: token } },
  );
  response.json({ unregistered: true });
}
