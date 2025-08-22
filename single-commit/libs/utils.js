import { createHash } from 'crypto';


/**
 * MD5Hash decodes Base64 and calculating MD5 hash
 * If we directly calculate the MD5 hash of the Base64 encoded content, the hash will be different due to the difference in encoding.
 * Therefore, we first decode the Base64 content to binary and then calculate the MD5 hash.
 * @param {string} base64Content - The Base64 encoded content 
 * @returns {string} - The MD5 hash of the string in hexadecimal format
 */
function MD5Hash(base64Content) {
    // Decode the Base64 content to binary
    const binaryContent = Buffer.from(base64Content, 'base64');
    // Calculate and return the MD5 hash of the binary content
    return createHash('md5').update(binaryContent).digest('hex');
}

export { MD5Hash };