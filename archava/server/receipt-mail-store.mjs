// Encrypted state, immutable local revisions or generation-conditional GCS writes.
// Never place a recipient, signed capability or raw order ID in a storage URL.
import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile, link, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

const validId = id => /^[a-f0-9]{64}$/.test(id);
export function encryptedRecords(key) {
  return {
    seal(id, record) {
      const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, iv);
      cipher.setAAD(Buffer.from(id));
      const data = Buffer.concat([cipher.update(JSON.stringify(record)), cipher.final()]);
      return JSON.stringify({ iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') });
    },
    open(id, body) {
      if (Buffer.byteLength(body) > 20_000) throw new Error('Invalid mail state');
      const value = JSON.parse(body), cipher = createDecipheriv('aes-256-gcm', key, Buffer.from(value.iv, 'base64'));
      cipher.setAAD(Buffer.from(id)); cipher.setAuthTag(Buffer.from(value.tag, 'base64'));
      return JSON.parse(Buffer.concat([cipher.update(Buffer.from(value.data, 'base64')), cipher.final()]).toString());
    },
  };
}

export function fileMailStore(directory, encryptionKey) {
  const codec = encryptedRecords(encryptionKey), root = resolve(directory);
  const folder = id => { if (!validId(id)) throw new Error('Invalid mail state'); return resolve(root, id); };
  return {
    async read(id) {
      let names;
      try { names = await readdir(folder(id)); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
      const versions = names.filter(n => /^\d+\.json$/.test(n)).map(n => Number(n.slice(0, -5)));
      if (!versions.length) return null;
      const generation = Math.max(...versions);
      return { generation: String(generation), value: codec.open(id, await readFile(resolve(folder(id), generation + '.json'), 'utf8')) };
    },
    async put(id, value, previous = null) {
      const dir = folder(id); await mkdir(dir, { recursive: true, mode: 0o700 });
      const generation = previous === null ? 0 : Number(previous) + 1;
      if (!Number.isSafeInteger(generation) || generation < 0) throw new Error('Invalid mail generation');
      const temp = resolve(dir, '.' + randomUUID() + '.tmp');
      await writeFile(temp, codec.seal(id, value), { mode: 0o600, flag: 'wx' });
      try {
        // Hard-link publication is atomic and exclusive; readers never see a
        // partially written revision. Competing/restarted workers share the CAS.
        await link(temp, resolve(dir, generation + '.json'));
        return true;
      } catch (e) { if (e.code === 'EEXIST') return false; throw e; }
      finally { await unlink(temp).catch(() => {}); }
    },
    async list() {
      try { return (await readdir(root)).filter(validId).slice(0, 1000); }
      catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    },
  };
}

export function gcsMailStore(bucket, encryptionKey, fetcher = fetch) {
  if (!/^[a-z0-9][a-z0-9._-]{1,220}[a-z0-9]$/.test(bucket)) throw new Error('Invalid email state bucket');
  const codec = encryptedRecords(encryptionKey), prefix = 'checkout-mail-v1/';
  let bearer = '', expires = 0;
  async function request(path, options = {}) {
    if (Date.now() >= expires) {
      const r = await fetcher('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
        headers: { 'Metadata-Flavor': 'Google' }, signal: AbortSignal.timeout(3000), redirect: 'error',
      });
      if (!r.ok) throw new Error('Email state authentication unavailable');
      const v = await r.json();
      if (typeof v.access_token !== 'string' || !Number.isFinite(v.expires_in)) throw new Error('Invalid email state authentication');
      bearer = v.access_token; expires = Date.now() + Math.max(0, v.expires_in - 60) * 1000;
    }
    return fetcher('https://storage.googleapis.com' + path, {
      ...options, headers: { ...options.headers, authorization: 'Bearer ' + bearer },
      signal: AbortSignal.timeout(5000), redirect: 'error',
    });
  }
  const object = id => { if (!validId(id)) throw new Error('Invalid mail state'); return prefix + id; };
  return {
    async read(id) {
      // Fetch generation and media together; generation pins the body read.
      const base = `/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(object(id))}`;
      const metadata = await request(base);
      if (metadata.status === 404) return null;
      if (!metadata.ok) throw new Error('Email state unavailable');
      const { generation } = await metadata.json();
      if (!/^\d+$/.test(generation)) throw new Error('Invalid email state generation');
      const response = await request(base + '?alt=media&generation=' + generation);
      if (!response.ok) throw new Error('Email state unavailable');
      return { generation, value: codec.open(id, await response.text()) };
    },
    async put(id, value, previous = null) {
      if (previous !== null && !/^\d+$/.test(previous)) throw new Error('Invalid email state generation');
      const path = `/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodeURIComponent(object(id))}&ifGenerationMatch=${previous ?? '0'}`;
      const r = await request(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: codec.seal(id, value) });
      if (r.status === 412) { await r.body?.cancel(); return false; }
      if (!r.ok) throw new Error('Email state unavailable');
      await r.body?.cancel(); return true;
    },
    async list() {
      const r = await request(`/storage/v1/b/${encodeURIComponent(bucket)}/o?prefix=${encodeURIComponent(prefix)}&maxResults=1000`);
      if (!r.ok) throw new Error('Email state unavailable');
      const v = await r.json();
      if (v.nextPageToken) throw new Error('Email queue capacity reached');
      return (v.items || []).map(i => i.name.slice(prefix.length)).filter(validId);
    },
  };
}
