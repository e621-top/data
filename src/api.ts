import { APITag, Data } from "./types.js";

const endpoint_api = "https://e621.net";
const endpoint_site = "https://e621-top.github.io";

async function get<T>(url: string) {
    const response = await fetch(url, { headers: { "User-Agent": "E621-Top/1.0 (Artinis)" } });
    if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
    return await response.json() as T;
}

export async function getCharacters(page: number = 1) {
    return get<APITag[]>(`${endpoint_api}/tags.json?limit=320&search[hide_empty]=1&search[order]=count&search[category]=4&page=${page}`);
}

export async function getCurrent() {
    return get<Data>(`${endpoint_site}/data/character.json`);
}
