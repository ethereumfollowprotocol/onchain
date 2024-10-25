import { evmClients } from './clients/viem/index'
import { type Abi, type Log, parseAbiItem } from 'viem'

export type ContractConfig = {
    chainId: '8453' | '10' | '1'
    contractAddress: `0x${string}`
    eventSignature: string
    startBlock: bigint
}

export type Event = {
    args: Record<string, any>
    eventName: string
    chainId: string
    address: `0x${string}`
    blockHash: `0x${string}`
    blockNumber: bigint
    data: `0x${string}`
    logIndex: number
    removed: boolean
    topics: `0x${string}`[]
    transactionHash: `0x${string}`
    transactionIndex: number
}

export type ListOpEvent = Event & {
    args: {
        slot: bigint
        op: string
    }
}

export type UpdateAccountMetadataEvent = Event & {
    args: {
        addr: `0x${string}`
        key: string
        value: bigint
    }
}

export type ListUserEvent = Event & {
    args: {
        slot: bigint
        key: string
        value: string
    }
}

export type UpdateListStorageLocationEvent = Event & {
    args: {
        tokenId: bigint
        listStorageLocation: string
    }
}

export type Operation = {
    version: string
    opcode: string
    recordVersion: string
    recordType: string
    recordTypeDescription: string
    recordAddress: string
    tag?: string
}

export type ListOperation = Operation & {   
    slot?: bigint
    contractAddress: `0x${string}`
    chainId: string
    tx: `0x${string}`
}

export type ListStorageLocation = {
    version: string
    type: string
    chainId: bigint
    listRecordsContract: string
    slot: bigint
}

export type ListStorageLocationToken = ListStorageLocation & {
    tokenId: bigint
    blockNumber: bigint
}


export function parseEvent_ListOp(event: Event): ListOperation {
    const op = event.args.op;
    const slot = event.args.slot; 
    const parsedOperation = parseListOperation(op);
    return {
        ...parsedOperation,
        slot,
        contractAddress: event.address,
        chainId: event.chainId,
        tx: event.transactionHash
    };
}

export async function getContractEvents(config: ContractConfig) {
    const batchSize = 2000n
    // let eventSignature = 'event UpdateListMetadata(uint256 indexed slot, string key, bytes value)'
    let client = evmClients[config.chainId]()
    const latestBlock = await client.getBlockNumber()
    let eventCount = 0;
    const events: Event[] = []
    for(let fromBlock = BigInt(config.startBlock); fromBlock <= latestBlock; fromBlock += batchSize) {
        
        const toBlock = fromBlock + batchSize - 1n
        // console.log(`[${config.chainId}]`, "Consuming events from block", fromBlock, "to block", toBlock, eventCount)
        try {
            const eventLogs = await client.getLogs({
                event: parseAbiItem(config.eventSignature) as any,
                address: config.contractAddress,
                fromBlock,
                toBlock
            })
            // console.log("eventLogs", eventLogs);
            
            for (const log of eventLogs) {
                eventCount += 1
                events.push({
                    eventName: 'List User Update Event',
                    chainId: config.chainId,
                    args: log.args,
                    address: log.address,
                    blockHash: log.blockHash,
                    blockNumber: log.blockNumber,
                    data: log.data,
                    logIndex: log.logIndex,
                    removed: log.removed,
                    topics: log.topics,
                    transactionHash: log.transactionHash,
                    transactionIndex: log.transactionIndex
                })
            }
        } catch (error) {
            console.error(`Error fetching history for blocks ${config.startBlock}: ${error}`)
        }
    }
    console.log(`Found ${eventCount} events`)
    return events
}  

export function parseListOperation(op: string): Operation {
    const listOpVersion = op.slice(2, 4); // Extract the first byte after the 0x (2 hex characters = 1 byte)
    const listOpCode = op.slice(4, 6); // Extract the second byte
    const listRecordVersion = op.slice(6, 8); // Extract the third byte
    const listRecordType = op.slice(8, 10); // Extract the fourth byte
    const listRecordAddress = '0x'+op.slice(10, 50); // Extract the address (40 hex characters = 20 bytes)

    let tagString:string = '';
    let opDescription:string = '';

    switch (listOpCode) {
        case '01':
            opDescription = 'Follow';
            break;
        case '02':
            opDescription = 'Unfollow';
            break;
        case '03':
            const tag = op.slice(50); // Extract the tag
            tagString = Buffer.from(tag, 'hex').toString('utf-8');
            opDescription = 'Tag';
            break;
        case '04':
            opDescription = 'Untag';
            break;
        default:

    }

    return {
        version: listOpVersion,
        opcode: listOpCode,
        recordVersion: listRecordVersion,
        recordType: listRecordType,
        recordTypeDescription: opDescription,
        recordAddress: listRecordAddress,
        tag: tagString  ?? undefined
    };
}

// export function parseEvent_UpdateAccountMetadata(event: UpdateAccountMetadataEvent): AccountMetadataUpdate {
//     const addr = event.args.addr;
//     const key = event.args.key; 
//     const value = event.args.value; 
//     // return parseListOperation(op, slot);
//     // const parsedOperation = parseAccountMetadataUpdate(op);
// }

export function parseEvent_UpdateListStorageLocation(event: Event): ListStorageLocationToken {
    const listStorageLocation = event.args.listStorageLocation; // Convert to string for parsing
    const parsedLsl = parseListStorageLocation(listStorageLocation);
    return {
        ...parsedLsl,
        tokenId: event.args.tokenId,
        blockNumber: event.blockNumber
    };
}

export function parseListStorageLocation(lsl: string): ListStorageLocation {
    if (lsl.length < 174) {
        return {
            version: '',
            type: '',
            chainId: BigInt(0),
            listRecordsContract: '',
            slot: BigInt(0)
        };
    }
    const lslVersion = lsl.slice(2, 4); // Extract the first byte after the 0x (2 hex characters = 1 byte)
    const lslType = lsl.slice(4, 6); // Extract the second byte
    const lslChainId = BigInt('0x'+lsl.slice(6, 70)); // Extract the next 32 bytes to get the chain id
    const lslListRecordsContract = '0x'+lsl.slice(70, 110); // Extract the address (40 hex characters = 20 bytes)
    const lslSlot = BigInt('0x'+lsl.slice(110, 174)); // Extract the slot
    return {
        version: lslVersion,
        type: lslType,
        chainId: lslChainId,
        listRecordsContract: lslListRecordsContract,
        slot: lslSlot
    }
}