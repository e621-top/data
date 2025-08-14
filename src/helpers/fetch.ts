import { sleep } from "./index.js";

const DELAY = 500;
const MAX_RETRIES = 5;

export async function fetchRetry(url: string | URL | Request, options?: RequestInit) {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            console.error(`Fetch error. Retries left: ${MAX_RETRIES - 1 - retries}`);
            console.error(error);
        }

        if (retries < MAX_RETRIES - 1) {
            await sleep(DELAY * (2 ** retries));
            retries++;
        }
    }
    throw new Error("Max retries exceeded.");
}
