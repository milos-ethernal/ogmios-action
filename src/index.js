import dotenv from 'dotenv';
import { downloadRelease, unpackRelease, appendToGitHubPath, moveToRunnerBinTest } from './functions/ogmios-bins.js';

dotenv.config();
await downloadRelease();
const exeFolderPath = await unpackRelease();
//await moveToRunnerBin();
//await appendToGitHubPath(exeFolderPath);
await moveToRunnerBinTest();