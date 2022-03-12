const fs = require('fs');

const hashes = JSON.parse(fs.readFileSync('hashes.json', 'utf-8'));
const dupes = Object.keys(hashes)
    .filter((k) => hashes[k].length > 1)
    .reduce((acc, cur) => {
        acc[cur] = hashes[cur];
        return acc;
    }, {});
fs.writeFileSync('dupes.json', JSON.stringify(dupes, null, 3));
