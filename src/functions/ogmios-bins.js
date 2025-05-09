import { readdirSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { URL } from 'url';
import * as path from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { rimraf } from 'rimraf';
import * as core from '@actions/core';

const exec = promisify(execCallback);

const BINS_BASE_URL = 'https://github.com/CardanoSolutions/ogmios';

const getPlatformReleaseUrl = async () => {
    const platform = process.platform;
    const tag = core.getInput('tag');
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
};

export const moveToRunnerBin = async () => {
    const path = "/bin";
    console.log(`GITHUB_WORKSPACE: ${path}`);
    try {
        await exec(`sudo mv ./bins/ogmios ${path}`);
        await exec(`chmod +x "${path}/ogmios"`);
        rimraf.sync("./bins");
    }
    catch (error) {
        console.error('Error occurred:', error);
        throw error;
    }
}