const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { imageHash } = require('image-hash');

const imgHash = (path) => {
    return new Promise((res, rej) => {
        imageHash(path, 16, true, (error, data) => {
            if (error) rej(error);
            res(data);
        });
    })
}

const hashes = {};
const scan = async (directoryName) => {
    let files = await fsp.readdir(directoryName, {withFileTypes: true});
    for (let f of files) {
        try {
            const fullPath = path.join(directoryName, f.name);
            if (f.isDirectory()) {
                await scan(fullPath)
            } else if(['.jpg', '.jpeg'].includes(path.extname(f.name).toLocaleLowerCase())) {
                console.log(`Hashing ${fullPath}`);
                const hash = await imgHash(fullPath);
                
                if(!hashes[hash]) hashes[hash] = [];
                hashes[hash].push(fullPath);
                if(hashes[hash].length > 1) {
                    console.log('Collission!');
                }
                console.log(`${fullPath}=${hash}`)
            }
        } catch(ex) {
            console.error(`Error on file ${f}`, ex);
        }
    }
}

const directoryName = '/media/bgardner/backup/Backup/Shared/Pictures/'; // TODO: move to config
(async () => {
    await scan(directoryName);
    fs.writeFileSync('hashes.json', JSON.stringify(hashes, null, 3));
})();
