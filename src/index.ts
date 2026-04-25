import "dotenv/config";
import fs from "fs";
import { getData, getTags } from "./api.js";
import { sleepMS } from "./helpers/index.js";
import { Category, Data, Tag } from "./types.js";

const site = "_site";
const blacklist = new Set([
    "anon",
    "anonymous_artist",
    "avoid_posting",
    "conditional_dnp",
    "fan_character",
    "sound_warning",
    "third-party_edit",
    "unknown_artist",
    "unknown_character",
    "webcomic_character"
]);

/**
 * 
 * @param category Tag category
 * @param limit Minimum count of posts
 */
async function updateTags(category: Category, limit: number) {
    console.info(`Updating ${category} tags`);
    const data: Data = {
        updated_at: new Date(),
        tags: []
    };

    let position = 1;
    for (let page = 1; ; page++) {
        console.debug(`Fetching page: ${page}`);
        const response = await getTags(category, page);
        const tags = response
            .filter(t => !blacklist.has(t.name) && t.post_count >= limit)
            .map<Tag>(t => {
                const { id, name, post_count, created_at } = t;
                return {
                    id,
                    name,
                    post_count,
                    post_counts: [post_count],
                    created_at: created_at.split("T")[0],
                    position: position++
                };
            });
        data.tags.push(...tags);
        if (response.some(t => t.post_count < limit)) {
            break;
        } else {
            await sleepMS(500);
        }
    }

    try {
        console.debug("Fetching current data");
        const current = await getData(category);
        data.tags.forEach(t => {
            const tag = current.tags.find(c => c.id == t.id);
            if (!tag) { return; }
            const delta = t.post_count - (tag.post_count);
            if (delta != 0) {
                t.post_delta = delta;
            }
            const history = tag.post_counts?.slice(0, 7);
            if (history) {
                t.post_counts?.push(...history);
            }
            /*
            // Copy last 6 counts from current data
            t.post_counts.push(...tag.post_counts.slice(0, 7));
            // Day delta
            const day_delta = t.post_counts[0] - t.post_counts[1];
            if (day_delta != 0) {
                t.post_delta_day = day_delta;
            }
            // Week delta
            const week_delta = t.post_counts[0] - t.post_counts.at(-1);
            if (week_delta != 0) {
                t.post_delta_week = week_delta;
            }
            */
        });
    } catch (error) {
        console.warn(error);
    }
    console.info(`Saving data: ${data.tags.length} ${category} tags`);
    fs.writeFileSync(`${site}/${category}.json`, JSON.stringify(data));
}

async function update() {
    console.info("Update started");
    if (!fs.existsSync(site)) { fs.mkdirSync(site); }

    await updateTags("character", 100);
    await updateTags("artist", 200);

    fs.copyFileSync("src/index.html", `${site}/index.html`);
    console.info("Update done");
}

await update();
