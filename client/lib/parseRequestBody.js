/**
 * Parses an API request body that may be JSON or multipart/form-data.
 * Uploaded files are stored as data URLs in `file` (and `fileName`), capped in size
 * so that MongoDB Atlas M0 storage is protected.
 */
export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2 MB

export async function parseRequestBody(req) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData();
    const body = {};
    for (const [key, value] of formData.entries()) {
      if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function') {
        const bytes = await value.arrayBuffer();
        if (bytes.byteLength === 0) continue;
        if (bytes.byteLength > MAX_ATTACHMENT_BYTES) {
          const err = new Error('Attachment is too large. Maximum allowed size is 2 MB.');
          err.status = 413;
          throw err;
        }
        const mime = value.type || 'application/octet-stream';
        body[key] = `data:${mime};base64,${Buffer.from(bytes).toString('base64')}`;
        body[`${key}Name`] = value.name || '';
      } else if (value !== undefined && value !== null) {
        body[key] = value;
      }
    }
    return body;
  }

  return await req.json();
}

/** Generates sequential IDs like PR-2026-0001 based on the highest existing one. */
export async function nextSequentialId(Model, field, prefix) {
  const year = new Date().getFullYear();
  const head = `${prefix}-${year}-`;
  const last = await Model.findOne({ [field]: { $regex: `^${head}` } })
    .sort({ [field]: -1 })
    .select(field)
    .lean();
  const lastNum = last?.[field] ? parseInt(String(last[field]).slice(head.length), 10) || 0 : 0;
  return `${head}${String(lastNum + 1).padStart(4, '0')}`;
}
