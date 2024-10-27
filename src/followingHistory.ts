import { promises as fs } from 'fs';
import { followingHistory } from './efp';

console.log("Analyzing data...");
const data = await fs.readFile('./src/efpdata/listOperations.json', 'utf-8');
const listOps = JSON.parse(data);

followingHistory(listOps)