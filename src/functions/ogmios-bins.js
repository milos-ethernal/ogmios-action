import { readdirSync, statSync, rmdirSync, mkdirSync, writeFileSync } from 'fs';
import { URL } from 'url';
import * as path from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { rimraf } from 'rimraf';

const exec = promisify(execCallback);

const OGMIOS_VERSION = "v6.3.0"
const BINS_BASE_URL = 'https://github.com/CardanoSolutions/ogmios';

const getPlatformReleaseUrl = async () => {
    const platform = process.platform;
    const tag = OGMIOS_VERSION;
    let file_name = '';
    if (platform === 'linux') {
        file_name = `ogmios-${tag}-x86_64-linux.zip`;
    }
    else {
        throw new Error(`Platform ${platform} not supported`);
    }
    return `${BINS_BASE_URL}/releases/download/${tag}/${file_name}`;
};

export const downloadRelease = async () => {
    const url = await getPlatformReleaseUrl();
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const urlObj = new URL(url);
    const file_name = urlObj.pathname.split('/').pop();
    if (!file_name) {
        throw new Error('Unable to determine the file name from the URL');
    }
    const dir = './bins';
    mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, file_name);
    writeFileSync(filePath, Buffer.from(buffer));
};

export const unpackRelease = async () => {
    const url = await getPlatformReleaseUrl();
    const urlObj = new URL(url);
    const file_name = urlObj.pathname.split('/').pop();
    if (!file_name) {
        throw new Error('Unable to determine the file name from the URL');
    }
    const dir = './bins';
    const filePath = path.join(dir, file_name);
    try {
        if (['linux'].includes(process.platform)) {
            await exec(`unzip "${filePath}" -d "${dir}"`);

            // Assuming the tar archive contains a single top-level directory
            const files = readdirSync(dir);
            const extractedDirs = files.filter(file => statSync(path.join(dir, file)).isDirectory());

            extractedDirs.forEach(async extractedDir => {
                if (extractedDir === "bin") {
                    await exec(`mv "${path.join(dir, extractedDir)}"/* "${dir}"`);
                }
                rimraf.sync(path.join(dir, extractedDir));

            });
            rimraf.sync(filePath);
        } else {
            throw new Error(`Platform ${process.platform} not supported`);
        }
    } catch (error) {
        console.error(`Error occurred while unpacking: ${error}`);
        throw error;
    }

    return path.resolve(dir);
};

export const moveToRunnerBin = async () => {
    const path = "/bin";
    console.log(`GITHUB_WORKSPACE: ${path}`);
    try {
        await exec(`sudo mv ./bins/ogmios ${path}`);
    }
    catch (error) {
        console.error('Error occurred:', error);
        throw error;
    }
}

export const appendToGitHubPath = async (directory) => {
    console.log(`Appending ${directory} to GITHUB_PATH`);
    const path = process.env['GITHUB_WORKSPACE'];
    console.log(`GITHUB_WORKSPACE: ${path}`);
    try {
        core.addPath(`${path}/**`);
    }
    catch (error) {
        console.error('Error occurred:', error);
        throw error;
    }
};