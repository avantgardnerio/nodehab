const fs = require('fs');
const fsp = fs.promises;
const piexif = require('piexifjs');

const path = require('path');
const { imageHash } = require('image-hash');

// https://auth0.com/blog/read-edit-exif-metadata-in-photos-with-javascript/
const getBase64DataFromJpegFile = filename => fs.readFileSync(filename).toString('binary');
const getExifFromJpegFile = filename => piexif.load(getBase64DataFromJpegFile(filename));
const changeExif = async (fullPath) => {
    const exif = getExifFromJpegFile(fullPath);
    if(exif.Exif[piexif.ExifIFD.ImageUniqueID]) {
        console.log(`Skipping ${fullPath}`);
        return;
    }

    console.log(`Hashing ${fullPath}`);
    const hash = await imgHash(fullPath);
    exif.Exif[piexif.ExifIFD.ImageUniqueID] = hash;

    const newImageData = getBase64DataFromJpegFile(fullPath);
    const newExifBinary = piexif.dump(exif);
    const newPhotoData = piexif.insert(newExifBinary, newImageData);
    const fileBuffer = Buffer.from(newPhotoData, 'binary');
    fs.writeFileSync(fullPath, fileBuffer);
};

const imgHash = (path) => {
    return new Promise((res, rej) => {
        imageHash(path, 16, true, (error, data) => {
            if (error) rej(error);
            res(data);
        });
    })
}

const scan = async (directoryName) => {
    let dir = await fsp.readdir(directoryName, {withFileTypes: true});
    for (let f of dir) {
        try {
            const fullPath = path.join(directoryName, f.name);
            const ext = path.extname(f.name).toLocaleLowerCase();
            if (f.isDirectory()) {
                await scan(fullPath);
            } else if (['.jpg', '.jpeg'].includes(ext)) {
                await changeExif(fullPath);
            }
        } catch(ex) {
            console.error(`Error on file ${f}`, ex);
        }
    }
}

const directoryName = '/media/bgardner/backup2/Backup/Shared/Pictures/'; // TODO: move to config
(async () => {
    await scan(directoryName);
})();
