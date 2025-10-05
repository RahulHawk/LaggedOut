function getPublicId(url) {
    if (!url) return null;
    try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        const pathWithFilename = parts[1];
        const lastDotIndex = pathWithFilename.lastIndexOf('.');
        return lastDotIndex !== -1 
            ? pathWithFilename.substring(0, lastDotIndex) 
            : pathWithFilename;
    } catch (err) {
        console.error("Error extracting public ID:", err);
        return null;
    }
}

module.exports = getPublicId;