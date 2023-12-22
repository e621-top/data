import fs from "fs";
import { getCharacters, getCurrent } from "./api.js";
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
        const response = await getCharacters(page);
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

    console.log("Updating delta");
    const current = await getCurrent();
    data.tags.forEach(t => {
        const tag = current.tags.find(c => c.id == t.id);
        const delta = t.post_count - (tag?.post_count ?? 0);
        if (tag && delta != 0) {
            t.post_delta = delta;
        }
    });

    console.log(`Saving data: ${data.tags.length} character tags`);
    if (!fs.existsSync(site)) { fs.mkdirSync(site); }
    fs.writeFileSync(`${site}/character.json`, JSON.stringify(data, null, 4));
    console.log("Update done");
}

await update();
