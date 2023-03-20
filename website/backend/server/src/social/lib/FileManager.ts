import * as fs from "fs";

export module FileManager {
    export function getFullDirPath(): string {
        return (process.env.SHARED_DIR_FULL_PATH);
    }

    export function getFullFilePath(fileName: string, fileType: string): string {
        return (getFullDirPath() + "/" + fileName + "." + fileType.split("/")[1]);
    }

    export function getFilePath(fileName: string, fileType: string): string {
        return ("/" + fileName + "." + fileType.split("/")[1]);
    }

    export function getBufferFromPath(path: string): Buffer {
        return (fs.readFileSync(path));
    }

    export function checkFileType(fileType: string, expectedTypes: string[]): boolean {
        for (let i = 0; i < expectedTypes.length; ++i) {
            if (expectedTypes[i] === fileType) {
                return (true);
            }
        }
        return (false);
    }

    export async function createFile(path: string, buffer: Buffer) {
        fs.writeFile(path, buffer, () => { })
    }

    export async function removeFile(path: string) {
        fs.unlink(path, () => { });
    }
}