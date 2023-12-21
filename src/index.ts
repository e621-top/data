import fs from "fs";
import { get_page } from "./api.js";
import { sleepMS } from "./helpers/index.js";
import { Data, Tag } from "./types.js";

const site = "_site";
const post_min = 100;
const blacklist = new Set(["fan_character", "webcomic_character", "anon"]);

async function update() {
    console.log("Update started");
    const data: Data = {
        updated_at: new Date(),
        tags: []
    };

    for (let page = 1; ; page++) {
        console.log(`Fetching page: ${page}`);
        const response = await get_page(page);
        const tags = response
            .filter(t => !blacklist.has(t.name) && t.post_count >= post_min)
            .map<Tag>(t => {
                const { id, name, post_count, created_at } = t;
                return {
                    id,
                    name,
                    post_count,
                    created_at
                };
            });
        data.tags.push(...tags);
        if (response.some(t => t.post_count < post_min)) {
            break;
        } else {
            await sleepMS(500);
        }
    }
    // TODO: add compare with old data

    console.log(`Saving data: ${data.tags.length} characters`);
    if (!fs.existsSync(site)) { fs.mkdirSync(site); }
    fs.writeFileSync(`${site}/character.json`, JSON.stringify(data, null, 4));
    console.log("Update done");
}

await update();
