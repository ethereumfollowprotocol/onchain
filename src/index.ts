import { 
    type Event,
    type ContractConfig, 
    type ListStorageLocationToken,
    getContractEvents,
    parseEvent_ListOp,
    parseEvent_UpdateListStorageLocation
} from './efp'
import { env } from '#/env.ts'

const contractConfigs:ContractConfig[] = [
    {
        chainId: '8453',
        contractAddress: '0x41aa48ef3c0446b46a5b1cc6337ff3d3716e2a33',
        eventSignature: ' ',
        startBlock: 20197200n
        // startBlock: 21510000n,
    },
    {
        chainId: '10',
        contractAddress: '0x4Ca00413d850DcFa3516E14d21DAE2772F2aCb85',
        startBlock: 125792735n
    },
    {
        chainId: '1',
        contractAddress: '0x5289fE5daBC021D02FDDf23d4a4DF96F4E0F17EF',
        startBlock: 20820743n
    },
]

let listOpEvents:Event[] = [];
let listUserEvents:Event[] = [];

async function getHistory(): Promise<void> {

    // Iterate through all chains in contractConfigs and get all listop events
    console.log("Fetching ListOp events...");
    for( const config of contractConfigs) {
        const updatedEvents = await getContractEvents({...config, eventSignature: 'event ListOp(uint256 indexed slot, bytes op)'});
        listOpEvents = [...listOpEvents, ...updatedEvents];
    }
    const listOps = listOpEvents.map(event => parseEvent_ListOp(event))
    const filteredOperations = listOps.filter(op => op.recordAddress === env.USER_ADDRESS)

    console.log("Fetching List Metadata:User events...");
    for( const config of contractConfigs) {
        const updatedListMeta = await getContractEvents({...config, eventSignature: 'event UpdateListMetadata(uint256 indexed slot, string key, bytes value)'})
        listUserEvents = [...listUserEvents, ...updatedListMeta];
    }

    const listUsers: { [key: string]: {value: string, chainId: string, listRecordAddress: string} } = {}
    for(const event of listUserEvents) {
        const { slot, key, value } = event.args;
        const chainId = event.chainId;
        const listRecordAddress = event.address;
        if (key === 'user') {
            listUsers[slot.toString()] = {value, chainId, listRecordAddress};
        }
    }

    const listOpsWithUsers = filteredOperations.map(data => {
        const listUserAddress = Object.entries(listUsers).find(([key, value]) => (
            key === data.slot?.toString() 
            && value.chainId === data.chainId
            && value.listRecordAddress === data.contractAddress
        ))?.[1] || null;
        return listUserAddress ? { ...data, listUserAddress: listUserAddress.value } : null;
    }).filter(item => item !== null);


    // Get primary list events and store latest tokenId for each address
    console.log("Fetching Account Metadata:Primary List events...");
    const updateAccountMetadataEvents:Event[] = await getContractEvents({
        chainId: contractConfigs[0].chainId,
        contractAddress: env.ACCOUNT_METADATA_CONTRACT_ADDRESS,
        eventSignature: 'event UpdateAccountMetadata(address indexed addr, string key, bytes value)',
        startBlock: contractConfigs[0].startBlock
    });
    const primaryLists: { [key: string]: bigint } = {}
    for(const event of updateAccountMetadataEvents) {
        const { addr, key, value } = event.args;
        if (key === 'primary-list') {
            primaryLists[addr] = BigInt(value);
        }
    }

    console.log("Fetching List Storage Location events...");
    // Get list storage location events and store latest slot for each tokenId
    const updateListStorageLocationEvents:Event[] = await getContractEvents({
        chainId: contractConfigs[0].chainId,
        contractAddress: env.REGISTRY_CONTRACT_ADDRESS,
        eventSignature: 'event UpdateListStorageLocation(uint256 indexed tokenId, bytes listStorageLocation)',
        startBlock: contractConfigs[0].startBlock
    });
    const listStorageLocations = updateListStorageLocationEvents.map(event => parseEvent_UpdateListStorageLocation(event));

    const latestListStorageLocations: { [tokenId: string]: ListStorageLocationToken } = {};

    // filter through the listStorageLocations and get the latest slot for each tokenId
    for (const event of listStorageLocations) {
        const tokenId = event.tokenId.toString();
        if (!latestListStorageLocations[tokenId] || latestListStorageLocations[tokenId].blockNumber < event.blockNumber) {
            latestListStorageLocations[tokenId] = event;
        }
    }

    console.log("Filtering TokenId => List Storage Location...");
    const filteredListStorageLocations = Object.values(latestListStorageLocations);
    const operationsWithLsl = listOpsWithUsers.map(storageLocation => {
        const matchingOperation = filteredListStorageLocations.find(op => op.slot === storageLocation.slot);
        return matchingOperation ? { ...storageLocation, ...matchingOperation } : null;
    }).filter(item => item !== null);

    console.log("Filtering Operations on TokenId and List User...");
    const primaryListOpsWithLsl = operationsWithLsl.map(data => {
        //         const listUserAddress = Object.entries(primaryLists).find(([key, value]) => value === data.tokenId && key === data.listUserAddress)?.[0]  || null;
        const primaryListUserAddress = Object.entries(primaryLists).find(([key, value]) => (value === data.tokenId && key.toLowerCase() === data.listUserAddress.toLowerCase()))?.[0] || null;
        return primaryListUserAddress ? { ...data, primaryListUserAddress } : null;
    }).filter(item => item !== null);

    console.log("finalData", primaryListOpsWithLsl);
    console.log("finalLength", primaryListOpsWithLsl.length);
}

getHistory()
    .then(() => {
        console.log('Contract history retrieval completed')
    })
    .catch((error) => {
        console.error('Error retrieving contract history:', error)
    })