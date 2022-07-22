const sharp = require('sharp');

class imageService {
    constructor() {
        try {
        } catch (e) {
            console.log(e.message)
        }
    }

    async imageExtensionConverter(file) {
        const bufferFile = file.data;
        const data = await sharp(bufferFile)
            .webp()
            .toBuffer();
        return new Buffer.from(data);
    }
}

const imageOptimize = new imageService();

module.exports = imageOptimize;
