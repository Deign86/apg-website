import { handleContact } from '../server/contact-handler.js';
import { methodNotAllowed, readBody, sendJSON, withJsonErrors } from '../server/http.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJSON(res, 204, null, 'POST, OPTIONS');
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST, OPTIONS');
  return withJsonErrors(res, async () => {
    const result = await handleContact(await readBody(req));
    return sendJSON(res, result.status, result.data, 'POST, OPTIONS');
  });
}
