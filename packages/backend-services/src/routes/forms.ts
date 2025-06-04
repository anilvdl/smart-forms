import { FastifyPluginAsync } from 'fastify';
import { APIError, logger as dbLogger} from '@smartforms/lib-middleware';
import { FormRawDAO } from '@smartforms/lib-db/daos/formRaw.dao';
import { UserDAO } from '@smartforms/lib-db/daos/users.dao';
import { v4 as uuidv4 } from 'uuid';
import { getRequestContext } from '@smartforms/lib-middleware';
import { Buffer } from "buffer";


/**
 * A minimal “preview” specification that extracts just enough data
 * from rawJson to draw a few boxes + labels in the thumbnail.
 */
interface PreviewField {
  label: string;
  // For simplicity, place fields in a vertical stack:
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PreviewSpec {
  fields: PreviewField[];
}

/**
 * Given your existing `rawJson` (which has `logo` + `title` + `elements: Array<…>`),
 * create a small SVG thumbnail (200×120) that:
 *   • has a folded-corner dog-ear
 *   • draws a gradient header bar with the form’s title
 *   • places a diagonal, low-opacity “SmartForms” watermark
 *   • overlays 1–2 field boxes (rounded, tinted) with truncated labels
 *
 * Returns a data-URI string (`data:image/svg+xml;base64,…`).
 */
function buildPreviewSpec(rawJson: any): string {
  // 1) Dimensions
  const svgWidth = 200;
  const svgHeight = 120;

  // 2) Define brand colors
  const headerGradientStart = "#FF7E1B"; // orange
  const headerGradientEnd   = "#FF642E"; // deep-orange
  const fieldFillColor      = "#FFFFFF"; // white (for fields)
  const fieldStrokeColor    = "#2702F6"; // brand blue
  const watermarkColor      = "#2702f6"; // brand blue (low opacity)
  const watermarkOpacity    = 0.2;       // subtle

  const titleText = rawJson.title || "Untitled Form";
  const titleLength = titleText.length;

  // 3) Begin building the SVG markup
  let svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${svgWidth}"
     height="${svgHeight}"
     viewBox="0 0 ${svgWidth} ${svgHeight}"
     preserveAspectRatio="xMidYMid meet">
  <!-- Rounded background -->
  <rect x="0" y="0"
        width="${svgWidth}"
        height="${svgHeight}"
        rx="8"
        fill="#FAFAFA"
        stroke="#E0E0E0"
        stroke-width="1"
  />
  
  <!-- Folded dog-ear top-right (triangle) -->
  <path d="
    M ${svgWidth - 20},0
    L ${svgWidth},0
    L ${svgWidth},20
    Z
  "
    fill="#FFFFFF"
    stroke="#E0E0E0"
    stroke-width="1"
    opacity="0.9"
  />
  <path d="
    M ${svgWidth - 20},0
    L ${svgWidth},20
    L ${svgWidth - 20},20
    Z
  "
    fill="#FF7E1B"
    opacity="0.9"
  />

  <!-- Header gradient (top bar) -->
  <defs>
    <linearGradient id="hdrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${headerGradientStart}" />
      <stop offset="100%" stop-color="${headerGradientEnd}" />
    </linearGradient>
  </defs>
  <rect x="0" y="0"
        width="${svgWidth}"
        height="28"
        fill="url(#hdrGrad)"
        rx="8"
        ry="8"
  />

  <!-- Form title on header -->
  ${rawJson.title ? `
    <text x="20" y="18"
          font-family="sans-serif"
          font-size="12"
          font-weight="600"
          fill="#FFFFFF"
    >${escapeXml(rawJson.title)}</text>
  ` : ""}

  <!-- Semi-transparent diagonal watermark (“SmartForms”) -->
  <text x="${svgWidth/2}" y="${svgHeight/2}"
        font-family="sans-serif"
        font-size="20"
        font-weight="700"
        fill="${watermarkColor}"
        fill-opacity="${watermarkOpacity}"
        text-anchor="middle"
        transform="rotate(-45 ${svgWidth/2} ${svgHeight/2})"
  >SmartForms</text>
`;

  // 4) If rawJson.logo.placeholder is a data-URI, draw it in top-left corner (32×32)
  if (rawJson.logo && typeof rawJson.logo.placeholder === "string") {
    svg += `
  <image
    x="${(svgWidth - 50)/2}" y="4"
    width="50" height="50"
    preserveAspectRatio="xMidYMid meet"
    href="${rawJson.logo.placeholder}"
  />
`;
  }

  // 5) Draw 1–2 fields (if available) in a smaller tinted box
  const elements: any[] = Array.isArray(rawJson.elements) ? rawJson.elements : [];
  const previewFields = elements.slice(0, 2); // show at most 2 to avoid clutter

  previewFields.forEach((el, idx) => {
    // Position the field boxes starting from y=36 or 56 (depending on idx)
    const boxX = 8;
    const boxY = 36 + idx * 28;
    const boxWidth = svgWidth - 16;
    const boxHeight = 16;

    // Draw the tinted field rectangle
    svg += `
    <defs>
    <filter id="fieldShadow${idx}">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.1"/>
    </filter>
  </defs>
  <rect x="${boxX}" y="${boxY}"
        width="${boxWidth}" height="${boxHeight}"
        rx="4"
        fill="${fieldFillColor}"
        stroke="${fieldStrokeColor}"
        stroke-width="0.8"
        opacity="0.8"
  />
`;

    // Text label (truncate to ~18 chars)
    const label: string = typeof el.label === "string" ? el.label : `Field ${idx + 1}`;
    const truncated = label.length > 18 ? label.slice(0, 15) + "…" : label;
    svg += `
  <text x="${boxX + 6}" y="${boxY + boxHeight - 4}"
        font-family="sans-serif"
        font-size="8"
        fill="${fieldStrokeColor}"
  >${escapeXml(truncated)}</text>
`;
  });

  // 6) Close the SVG
  svg += `
</svg>
`;

  // 7) Base64-encode (trimmed) and return as data-URI
  const trimmed = svg.trim();
  const base64 = Buffer.from(trimmed).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Simple XML-escaping for any text that may contain special characters.
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
      default: return c;
    }
  });
}

const formsRoutes: FastifyPluginAsync = async (fastify) => {
  const formsRawDao = new FormRawDAO(dbLogger);

  dbLogger.info('\n\t[forms.ts->FastifyPluginAsync]->entered into formsRoutes');

  fastify.post('/', async (request, reply) => {
    const { title, rawJson } = request.body as { title: string; rawJson: any };
    if (!title) throw new APIError('INVALID_TITLE', 'Title must be non-empty', 400);
    if (!rawJson || typeof rawJson !== 'object')
      throw new APIError('INVALID_DATA', 'rawJson must be an object', 400);

    const ctx = getRequestContext();
    const formId = uuidv4();
    const version = 1;

    const thumbnailDataUrl = buildPreviewSpec(rawJson);

    let draft;
    try {
      // fetch userId from db based on the email, this will be the uuid of the user
       const user = await UserDAO.getUserByEmail(ctx?.user?.email as string);
       const userId = user.id;
       if (!userId) throw new APIError('UNAUTHORIZED', 'User ID is undefined', 401);
       draft = await formsRawDao.createDraft({ 
          formId, 
          userId, 
          title, 
          rawJson, 
          version,
          thumbnail: thumbnailDataUrl
        });
    } catch (error) {
      console.error('Error creating draft:', error);
      throw new APIError('INTERNAL_SERVER_ERROR', 'Failed to create draft', 500);
    }

    reply.code(201).send({ formId: draft.form_id, version: draft.version, status: draft.status });
  });

  fastify.put('/:formId', async (request, reply) => {
    const { formId } = request.params as { formId: string };
    const { rawJson } = request.body as { rawJson: any };

    console.log('\n\t[forms.ts->FastifyPluginAsync]->Request received:', request.method, request['headers']);

    if (!rawJson || typeof rawJson !== 'object')
      throw new APIError('INVALID_DATA', 'rawJson must be an object', 400);

    const ctx = getRequestContext();

    const latest = await formsRawDao.getLatest(formId);
    if (!latest) throw new APIError('NOT_FOUND', 'Form not found', 404);

    // 1) Re-generate PreviewSpec + SVG for updated rawJson
    const thumbnailDataUrl = buildPreviewSpec(rawJson);

    console.log('\n\t[forms.ts->FastifyPluginAsync]->Thumbnail Data URL:', thumbnailDataUrl);

    let result;
    if (latest.status === 'PUBLISH') {
      const newVersion = latest.version + 1;
      const user = await UserDAO.getUserByEmail(ctx?.user?.email as string);
      const userId = user.id;
      if (!userId) throw new APIError('UNAUTHORIZED', 'User ID is undefined', 401);
      result = await formsRawDao.createDraft({
        formId,
        userId,
        title: latest.title,
        rawJson,
        version: newVersion,
        thumbnail: thumbnailDataUrl,
      });
    } else {
      result = await formsRawDao.updateDraft(formId, latest.version, rawJson, thumbnailDataUrl);
    }

    reply.code(200).send({ formId: result.form_id, version: result.version, status: result.status });
  });

  fastify.get('/:formId/:version', async (request, reply) => {
    const { formId, version } = request.params as { formId: string; version: string };
    const verNum = Number(version);
    const data = await formsRawDao.getByVersion(formId, verNum);
    if (!data) throw new APIError('NOT_FOUND', 'Form version not found', 404);

    reply.send({
      formId: data.form_id,
      version: data.version,
      status: data.status,
      rawJson: data.raw_json,
      createdBy: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      thumbnail: data.thumbnail,
    });
  });

  fastify.get('/', async (request, reply) => {
    const queryParams = request.query as any;
    const page = Number(queryParams.page) || 1;
    const status = queryParams.status || 'WIP'; 
    const limit = 10;
    const offset = (page - 1) * limit;
    const ctx = getRequestContext();
    const userId = ctx?.user?.id;
    if (!userId) throw new APIError('UNAUTHORIZED', 'User not authenticated', 401);

    const user = await UserDAO.getUserByEmail(ctx?.user?.email as string);

    const rows = await formsRawDao.listByUserByStatus(user.id, status, limit, offset);
    const list = rows.map((r) => ({
      formId: r.form_id,
      version: r.version,
      title: r.title,
      status: r.status,
      updatedAt: r.updated_at,
      userId: r.user_id,
      createdAt: r.created_at,
      rawJson: r.raw_json,
      userName: user.name,
      thumbnail: r.thumbnail,
    }));
    reply.send(list);
  });
};

export default formsRoutes;
