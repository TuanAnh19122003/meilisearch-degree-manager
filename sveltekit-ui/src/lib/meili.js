import { MeiliSearch } from 'meilisearch';

export const client = new MeiliSearch({
    host: 'http://localhost:7700',
    apiKey: import.meta.env.VITE_MEILI_KEY
});

export const indexRoles = client.index('roles');
export const indexUsers = client.index('users');
