import dotenv from 'dotenv';
import { downloadRelease, unpackRelease, moveToRunnerBin } from './functions/ogmios-bins.js';

dotenv.config();
await downloadRelease();
await unpackRelease();
await moveToRunnerBin();