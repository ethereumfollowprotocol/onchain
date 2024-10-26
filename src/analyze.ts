import { promises as fs } from 'fs';

export async function analyze(){
    console.log("Analyzing data...");
    const data = await fs.readFile('./src/efpdata/listOperations.json', 'utf-8');
    const listOps = JSON.parse(data);
    
    console.log(listOps);
    console.log(`Total records: ${listOps.length}`);
}

analyze()