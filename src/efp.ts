import { evmClients } from './clients/viem/index'
import { type Abi, type Log, parseAbiItem } from 'viem'
import type { 
    ContractConfig, 
    Event, 
    ListOperation, 
    ListStorageLocation, 
    ListStorageLocationToken, 
    Operation 
} from './types';

/**
 * Parses a List Operation event and returns a ListOperation object.
 * 
 * @param event - The event object containing the List Operation data.
 * @returns A ListOperation object with parsed data.
 */
export function parseEvent_ListOp(event: Event): ListOperation {
    const op = event.args.op;
    const slot = event.args.slot; 
    const parsedOperation = parseListOperation(op);
    return {
        ...parsedOperation,
        slot,
        listRecordsContract: event.address,
        chainId: event.chainId,
        tx: event.transactionHash
    };
}

/**
 * Parses a List Operation string and returns an Operation object.
 * 
 * @param op - The operation string to parse.
 * @returns An Operation object with parsed data.
 */
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
            const tag = op.slice(50); 
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

/**
 * Parses an Update List Storage Location event and returns a ListStorageLocationToken object.
 * 
 * @param event - The event object containing the Update List Storage Location data.
 * @returns A ListStorageLocationToken object with parsed data.
 */
export function parseEvent_UpdateListStorageLocation(event: Event): ListStorageLocationToken {
    const listStorageLocation = event.args.listStorageLocation; // Convert to string for parsing
    const parsedLsl = parseListStorageLocation(listStorageLocation);
    return {
        ...parsedLsl,
        tokenId: event.args.tokenId,
        blockNumber: event.blockNumber
    };
}

/**
 * Parses a List Storage Location string and returns a ListStorageLocation object.
 * 
 * @param lsl - The List Storage Location string to parse.
 * @returns A ListStorageLocation object with parsed data.
 */
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

/**
 * Fetches contract events based on the provided configuration.
 * 
 * @param config - The configuration object containing contract details.
 * @returns A promise that resolves to an array of Event objects.
 */
export async function getContractEvents(config: ContractConfig): Promise<Event[]> {
    const batchSize = 2000n
    let client = evmClients[config.chainId]()
    const latestBlock = await client.getBlockNumber()
    console.log(`[${config.chainId}] Fetching events from block ${config.startBlock} to ${latestBlock} from contract ${config.contractAddress}`);
    // console.log(`[${config.chainId}] Contract ${config.contractAddress}`);
    // console.log(`[${config.chainId}] ${config.eventSignature}`);
    let eventCount = 0;
    const events: Event[] = []
    for(let fromBlock = BigInt(config.startBlock); fromBlock <= latestBlock; fromBlock += batchSize) {
        const toBlock = fromBlock + batchSize - 1n
        try {
            const eventLogs = await client.getLogs({
                event: parseAbiItem(config.eventSignature) as any,
                address: config.contractAddress,
                fromBlock,
                toBlock
            })
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