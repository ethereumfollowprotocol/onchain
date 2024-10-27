import { evmClients } from '#/clients/viem/index'
import { parseListOperation, parseListStorageLocation } from '#/efp.ts'
import { efpAccountMetadataAbi, efpListRecordsAbi, efpListRegistryAbi } from '#/abi/generated/index'
import { env } from '#/env.ts'
import { followingHistory } from './efp';


async function main() {

    const tokenId = await evmClients['8453']().readContract({
        address: env.ACCOUNT_METADATA,
        abi: efpAccountMetadataAbi,
        functionName: 'getValue',
        args: [ env.USER_ADDRESS as `0x${string}`, 'primary-list' ]
    })
    
    const listStorageLocation = await evmClients['8453']().readContract({
        address: env.REGISTRY,
        abi: efpListRegistryAbi,
        functionName: 'getListStorageLocation',
        args: [ BigInt(tokenId) ]
    })
    
    const parsedLsl = parseListStorageLocation(listStorageLocation)
    
    const listUser = await evmClients[parsedLsl.chainId.toString() as keyof typeof evmClients]().readContract({
        address: parsedLsl.listRecordsContract as `0x${string}`,
        abi: efpListRecordsAbi,
        functionName: 'getListUser',
        args: [ parsedLsl.slot ]
    })
    
    const validList = listUser.toLowerCase() === env.USER_ADDRESS.toLowerCase()
    
    if (!validList) {
        throw new Error("User does not have a valid list")
    }
    
    const listRecords = await evmClients[parsedLsl.chainId.toString() as keyof typeof evmClients]().readContract({
        address: parsedLsl.listRecordsContract as `0x${string}`,
        abi: efpListRecordsAbi,
        functionName: 'getAllListOps',
        args: [ parsedLsl.slot ]
    })
    const joinedListRecords = listRecords.map((record: any) => ({ ...parsedLsl, ...parseListOperation(record), tokenId: BigInt(tokenId), listUserAddress: env.USER_ADDRESS }))
    

    await followingHistory(joinedListRecords)
}

main()
.catch((error) => {
    console.error("Error:", error)
})