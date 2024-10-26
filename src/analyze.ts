import { promises as fs } from 'fs';

const follows: { [key: string]: string[] } = {};
const tags: { [key: string]: {address:string, tag:string}[] } = {};

export async function analyze(){
    console.log("Analyzing data...");
    const data = await fs.readFile('./src/efpdata/listOperations.json', 'utf-8');
    const listOps = JSON.parse(data);
    
    console.log(listOps);
    console.log(`Total records: ${listOps.length}`);

    for (const record of listOps) {
        const follower = record.listUserAddress;
        const leader = record.recordAddress;
        const listOpCode = record.opcode;

        switch (listOpCode) {
            case '01':
                if (!follows[leader]) {
                    follows[leader] = [];
                }
                follows[leader].push(follower);
                break;
            case '02':
                if (follows[leader]) {
                    follows[leader] = follows[leader].filter(f => f !== follower);
                    // tags[leader] = tags[leader].filter(t => t.address !== follower );
                    if(follows[leader].length === 0){
                        delete follows[leader];
                    }
                }
                break;
            case '03':
                if (!tags[leader]) {
                    tags[leader] = [];
                }
                tags[leader].push({address: follower, tag: record.tag});
                break;
            case '04':
                if (tags[leader]) {
                    tags[leader] = tags[leader].filter(t => t.address !== follower && t.tag !== record.tag);
                    if(tags[leader].length === 0){
                        delete tags[leader];
                    }
                }
                break;
            default:
    
        }

    }

    for (const leader in tags) {
        console.log("leader", leader);
        // filter the tags object to remove any tags for accounts which are no longer following
        
        tags[leader] = tags[leader]?.filter(t => follows[leader] && follows[leader].includes(t.address)) || [];
        
        if(tags[leader].length === 0){
            delete tags[leader];
        }
    }

    
    console.log("follows", follows);
    console.log("tags", tags);
}

analyze()