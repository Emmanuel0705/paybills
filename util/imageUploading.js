const crypto = require('crypto');
const path = require("path");

const imgUploading = img => {
    if(!img.mimetype.startsWith('image')){
        return next(new AppError("all files selected must be image",500))
    }
    const imageName = `photo_${crypto.randomBytes(12)
        .toString("hex")}${path
        .parse(img.name).ext}` 

    img.mv(`${path.join(__dirname,"../upload/images")}/${imageName}`)
   
    return imageName
}
module.exports = imgUploading