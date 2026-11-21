export function notFound(_request, response) {
  response.status(404).json({ error: "No encontramos esta ruta." });
}
