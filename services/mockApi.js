import { seedData } from '../src/store/seedData';
import { slugify } from '../src/utils/slugify';

const STORAGE_KEY = 'gaukrishna:data';
const ADMIN_EMAIL = 'admin@gaukrishna.com';
const ADMIN_PASSWORD = 'Gauk@2026';
const ADMIN_NAME = 'Gaukrishna Admin';

const withLatency = (fn, delay = 220) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (error) {
        reject(error);
      }
    }, delay);
  });

const readStore = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to read local store', error);
  }
  return seedData;
};

const writeStore = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to persist local store', error);
  }
};

const ensureSlug = (blog) => {
  if (blog.slug) return blog.slug;
  return slugify(blog.title || 'blog');
};

export const mockApi = {
  login: async ({ email, password }) =>
    withLatency(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return {
          token: 'gaukrishna-session-token',
          user: { id: 'admin', name: ADMIN_NAME, email: ADMIN_EMAIL, role: 'superadmin' },
        };
      }
      throw new Error('Invalid email or password');
    }),

  list: async (entity) =>
    withLatency(() => {
      const data = readStore();
      if (!data[entity]) throw new Error(`Unknown entity: ${entity}`);
      return data[entity];
    }),

  create: async (entity, payload) =>
    withLatency(() => {
      const data = readStore();
      if (!data[entity]) throw new Error(`Unknown entity: ${entity}`);

      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const record = { ...payload, id, createdAt: now, updatedAt: now };

      if (entity === 'blogs') {
        record.slug = ensureSlug(payload);
        const slugExists = data.blogs.some((b) => b.slug === record.slug);
        if (slugExists) {
          throw new Error('Slug already exists');
        }
      }

      data[entity] = [record, ...data[entity]];
      writeStore(data);
      return record;
    }),

  update: async (entity, payload) =>
    withLatency(() => {
      const data = readStore();
      if (!data[entity]) throw new Error(`Unknown entity: ${entity}`);
      const index = data[entity].findIndex((item) => item.id === payload.id);
      if (index === -1) throw new Error(`${entity} not found`);

      const next = { ...data[entity][index], ...payload, updatedAt: new Date().toISOString() };
      if (entity === 'blogs') {
        next.slug = ensureSlug(next);
        const slugExists = data.blogs.some((b) => b.slug === next.slug && b.id !== next.id);
        if (slugExists) {
          throw new Error('Slug already exists');
        }
      }

      data[entity][index] = next;
      writeStore(data);
      return next;
    }),

  remove: async (entity, id) =>
    withLatency(() => {
      const data = readStore();
      if (!data[entity]) throw new Error(`Unknown entity: ${entity}`);
      data[entity] = data[entity].filter((item) => item.id !== id);
      writeStore(data);
      return id;
    }),
};
