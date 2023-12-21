import { APITag } from "./types.js";

const endpoint = "https://e621.net";

async function get<T>(url: string) {
    const response = await fetch(url, { headers: { "User-Agent": "E621-Top/1.0 (Artinis)" } });
    if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
    return await response.json() as T;
}

export async function get_page(page: number = 1) {
    return get<APITag[]>(`${endpoint}/tags.json?limit=320&search[hide_empty]=1&search[order]=count&search[category]=4&page=${page}`);
}
