import { HttpError } from "./HttpError.js";

export function parseInput(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new HttpError(400, message);
  }
  return result.data;
}
