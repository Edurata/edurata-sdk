import fs from 'fs'
import crypto from 'crypto';

const FILE_PLACEHOLDER = "__file__"
const basePath = "/tmp"

export class File {
    localFilePath
    interfaceKey
    dependencyKey
    additionalKeys

    constructor(interfaceKey, dependencyKey, additionalKeys) {
        const localFilename = crypto.randomUUID()
        this.localFilePath = `${basePath}/${localFilename}`
        this.interfaceKey = interfaceKey
        this.dependencyKey = dependencyKey
        this.additionalKeys = additionalKeys
    }

    toString() {
        return FILE_PLACEHOLDER + this.localFilePath
    }

    toJSON() {
        return FILE_PLACEHOLDER + this.localFilePath
      }

    write = async (data) => {
        return fs.writeFileSync(this.localFilePath, data)
    }

    writeStream = async (stream) => {
        return writeFileStream(stream, this.localFilePath)
    }

    read = async () => {
        return fs.readFileSync(this.localFilePath, {encoding:'utf8', flag:'r'});
    }

    readStream = async () => {
        return readFileStream(this.localFilePath)
    }
}

const readFileStream = (fileObject) => fs.createReadStream(fileObject);
    
    
// https://github.com/aws/aws-sdk-js-v3/issues/3268
const writeFileStream = async (stream, path) => await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path);
    stream.on('data', (chunk) => file.write(chunk));
    stream.on('error', reject);
    stream.on('end', () => {
      file.end()
      resolve("Success")
    });
})