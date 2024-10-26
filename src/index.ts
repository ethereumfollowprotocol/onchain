import { 
    getContractEvents,
    parseEvent_ListOp,
    parseEvent_UpdateListStorageLocation
} from './efp'
import type {
    Event,
    ContractConfig, 
    ListStorageLocationToken,
} from './types'
import { configs } from './config'
import { env } from '#/env.ts'
import { writeFile } from 'fs/promises';



let listOpEvents:Event[] = [];
let listUserEvents:Event[] = [];

async function getHistory(): Promise<void> {

    // Iterate through all chains in contractConfigs and get all listop events
    console.log("Fetching ListOp events...");
    const listOpConfigs = [
        configs['ListRecords_ListOp_Base'],
        configs['ListRecords_ListOp_Op'],
        configs['ListRecords_ListOp_Eth'],
    ]
    for( const config of listOpConfigs) {
        const updatedEvents = await getContractEvents(config);
        listOpEvents = [...listOpEvents, ...updatedEvents];
    }

    //  Parse ListOp events
    const listOps = listOpEvents.map(event => parseEvent_ListOp(event))

    // Filter operations for the user
    // const filteredOperations = listOps.filter(op => op.recordAddress === env.USER_ADDRESS)

    const listUserConfigs = [
        configs['ListRecords_UpdateListMetadata_Base'],
        configs['ListRecords_UpdateListMetadata_Op'],
        configs['ListRecords_UpdateListMetadata_Eth'],
    ]
    // Fetch UpdateListMetadata events
    console.log("Fetching List Metadata:User events...");
    for( const config of listUserConfigs) {
        const updatedListMeta = await getContractEvents(config)
        listUserEvents = [...listUserEvents, ...updatedListMeta];
    }

    // Create a mapping of the most recent user role (including chain id and 
    // list records contract) for each slot
    const listUsers: { [key: string]: {value: string, chainId: string, listRecordAddress: string} } = {}
    for(const event of listUserEvents) {
        const { slot, key, value } = event.args;
        const chainId = event.chainId;
        const listRecordAddress = event.address;
        if (key === 'user') {
            listUsers[slot.toString()] = {value, chainId, listRecordAddress};
        }
    }

    // Combine list operations with user addresses where the slot, chainID and 
    // list records contract address match
    const listOpsWithUsers = listOps.map(data => {
        const listUserAddress = Object.entries(listUsers).find(([key, value]) => (
            key === data.slot?.toString() 
            && value.chainId === data.chainId
            && value.listRecordAddress === data.listRecordsContract
        ))?.[1] || null;
        return listUserAddress ? { ...data, listUserAddress: listUserAddress.value } : null;
    }).filter(item => item !== null);


    // Fetch UpdateAccountMetadata events
    console.log("Fetching Account Metadata:Primary List events...");
    const updateAccountMetadataEvents:Event[] = await getContractEvents(configs['AccountMetadata_UpdateAccountMetadata']);

    // Filter the UpdateAccountMetadata events for primary lists and set the most
    // recent tokenId for each address
    const primaryLists: { [key: string]: bigint } = {}
    for(const event of updateAccountMetadataEvents) {
        const { addr, key, value } = event.args;
        if (key === 'primary-list') {
            primaryLists[addr] = BigInt(value);
        }
    }

    console.log("Fetching List Storage Location events...");
    // Fetch UpdateListStorageLocation events
    const updateListStorageLocationEvents:Event[] = await getContractEvents(configs['Registry_UpdateListStorageLocation']);

    // Parse the list storage location data
    const listStorageLocations = updateListStorageLocationEvents.map(event => parseEvent_UpdateListStorageLocation(event));

    // Filter through the listStorageLocations and get the latest slot for each tokenId
    const latestListStorageLocations: { [tokenId: string]: ListStorageLocationToken } = {};
    for (const event of listStorageLocations) {
        const tokenId = event.tokenId.toString();
        if (!latestListStorageLocations[tokenId] || latestListStorageLocations[tokenId].blockNumber < event.blockNumber) {
            latestListStorageLocations[tokenId] = event;
        }
    }

    // Combine list operations with valid storage locations where the slot matches
    console.log("Filtering TokenId => List Storage Location...");
    const filteredListStorageLocations = Object.values(latestListStorageLocations);
    const operationsWithLsl = listOpsWithUsers.map(storageLocation => {
        const matchingOperation = filteredListStorageLocations.find(op => op.slot === storageLocation.slot);
        return matchingOperation ? { ...storageLocation, ...matchingOperation } : null;
    }).filter(item => item !== null);

    // Combine the joined valid list operations with active primary list data 
    console.log("Filtering Operations on TokenId and List User...");
    const primaryListOpsWithLsl = operationsWithLsl.map(data => {
        const listUserAddress = Object.entries(primaryLists).find(([key, value]) => (value === data.tokenId && key.toLowerCase() === data.listUserAddress.toLowerCase()))?.[0] || null;
        return listUserAddress ? { ...data, listUserAddress } : null;
    }).filter(item => item !== null);

    console.log("finalData", primaryListOpsWithLsl);
    console.log("finalLength", primaryListOpsWithLsl.length);
    await writeFile('./src/efpdata/listOperations.json', JSON.stringify(primaryListOpsWithLsl, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value, 2));
    
}

getHistory()
    .then(() => {
        console.log('Contract history retrieval completed')
    })
    .catch((error) => {
        console.error('Error retrieving contract history:', error)
    })
