import { env } from "process";
import { APITag, Category, Data } from "./types.js";

const endpoint_api = "https://e621.net";
const endpoint_site = "https://e621-top.github.io/data";

const CategoryNumber: Record<Category, number> = {
    "artist": 1,
    "character": 4
};

async function get<T>(url: string | URL | Request) {
    const response = await fetch(url, { headers: { "User-Agent": env["USER_AGENT"] as string } });
    if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
    return await response.json() as T;
}

export async function getTags(category: Category, page: number) {
    const url = new URL(`${endpoint_api}/tags.json`);
    const params = url.searchParams;
    params.append("search[hide_empty]", "1");
    params.append("search[order]", "count");
    params.append("search[category]", `${CategoryNumber[category]}`);
    params.append("page", `${page}`);
    params.append("limit", "320");
    return get<APITag[]>(url);
}

export async function getData(category: Category) {
    return get<Data>(`${endpoint_site}/${category}.json`);
}
