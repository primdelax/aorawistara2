const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const getConfig = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "aora-uploads";

  if (!url || !key) {
    throw new Error("SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi untuk DATABASE_PROVIDER=supabase.");
  }

  return {
    url: url.replace(/\/$/, ""),
    key,
    bucket,
  };
};

const headers = (extra = {}) => {
  const { key } = getConfig();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
};

const encodeValue = (value) => encodeURIComponent(String(value));

const request = async (endpoint, options = {}) => {
  const { url } = getConfig();
  const res = await fetch(`${url}${endpoint}`, options);
  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message = data?.message || data?.hint || data?.details || `Supabase request gagal (${res.status})`;
    throw new Error(message);
  }

  return { data, headers: res.headers };
};

const buildQuery = ({ select = "*", filters = {}, search, order, limit, offset } = {}) => {
  const params = new URLSearchParams();
  params.set("select", select);

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, `eq.${value}`);
    }
  });

  if (search?.term && search.fields?.length) {
    const term = String(search.term).replace(/[(),]/g, " ");
    params.set("or", `(${search.fields.map((field) => `${field}.ilike.*${term}*`).join(",")})`);
  }

  if (order) params.set("order", order);
  if (limit !== undefined) params.set("limit", String(limit));
  if (offset !== undefined) params.set("offset", String(offset));

  return params.toString();
};

const list = async (table, options = {}) => {
  const query = buildQuery(options);
  const { data } = await request(`/rest/v1/${table}?${query}`, {
    method: "GET",
    headers: headers(),
  });
  return data || [];
};

const findById = async (table, id, select = "*") => {
  const rows = await list(table, { select, filters: { id }, limit: 1 });
  return rows[0] || null;
};

const findOne = async (table, filters, select = "*") => {
  const rows = await list(table, { select, filters, limit: 1 });
  return rows[0] || null;
};

const insert = async (table, payload) => {
  const { data } = await request(`/rest/v1/${table}`, {
    method: "POST",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(payload),
  });
  return Array.isArray(data) ? data[0] : data;
};

const update = async (table, id, payload) => {
  const { data } = await request(`/rest/v1/${table}?id=eq.${encodeValue(id)}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(payload),
  });
  return Array.isArray(data) ? data[0] : data;
};

const remove = async (table, id) => {
  await request(`/rest/v1/${table}?id=eq.${encodeValue(id)}`, {
    method: "DELETE",
    headers: headers(),
  });
};

const upsertByKey = async (table, conflictKey, payload) => {
  const { data } = await request(`/rest/v1/${table}?on_conflict=${conflictKey}`, {
    method: "POST",
    headers: headers({ Prefer: "resolution=merge-duplicates,return=representation" }),
    body: JSON.stringify(payload),
  });
  return data;
};

const publicUrlForObject = (objectPath) => {
  const { url, bucket } = getConfig();
  return `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
};

const objectPathFromPublicUrl = (fileUrl) => {
  const { url, bucket } = getConfig();
  const prefix = `${url}/storage/v1/object/public/${bucket}/`;
  if (!fileUrl || !fileUrl.startsWith(prefix)) return null;
  return fileUrl.slice(prefix.length);
};

const sanitizeFilename = (filename = "image") => {
  const parsed = path.parse(filename);
  const ext = parsed.ext || ".jpg";
  const name = parsed.name.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "image";
  return `${name}${ext.toLowerCase()}`;
};

const uploadFile = async (file, folder) => {
  if (!file) return null;

  const { url, key, bucket } = getConfig();
  const filename = `${folder}-${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(file.originalname || file.filename)}`;
  const objectPath = `${folder}/${filename}`;
  const bytes = file.buffer || fs.readFileSync(file.path);

  const res = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": file.mimetype || "application/octet-stream",
      "x-upsert": "false",
    },
    body: bytes,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload Supabase Storage gagal (${res.status})`);
  }

  if (file.path && !file.keepLocal) fs.unlink(file.path, () => {});

  return publicUrlForObject(objectPath);
};

const deleteFile = async (fileUrl) => {
  const objectPath = objectPathFromPublicUrl(fileUrl);
  if (!objectPath) return;

  const { url, key, bucket } = getConfig();
  const res = await fetch(`${url}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [objectPath] }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Hapus file Supabase Storage gagal (${res.status})`);
  }
};

const ensureReady = async () => {
  getConfig();
  console.log("Supabase online database mode enabled.");
};

module.exports = {
  ensureReady,
  list,
  findById,
  findOne,
  insert,
  update,
  remove,
  upsertByKey,
  uploadFile,
  deleteFile,
};
