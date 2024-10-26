import type { ContractConfig } from "./types";
import { env } from '#/env.ts'

export const configs: { [key: string]: ContractConfig } = {
    'ListRecords_ListOp_Base':  {
        chainId: '8453',
        contractAddress: '0x41aa48ef3c0446b46a5b1cc6337ff3d3716e2a33',
        eventSignature: 'event ListOp(uint256 indexed slot, bytes op)',
        startBlock: 20197200n,
    },
    'ListRecords_ListOp_Op': {
        chainId: '10',
        contractAddress: '0x4Ca00413d850DcFa3516E14d21DAE2772F2aCb85',
        eventSignature: 'event ListOp(uint256 indexed slot, bytes op)',
        startBlock: 125792735n,
    },
    'ListRecords_ListOp_Eth': {
        chainId: '1',
        contractAddress: '0x5289fE5daBC021D02FDDf23d4a4DF96F4E0F17EF',
        eventSignature: 'event ListOp(uint256 indexed slot, bytes op)',
        startBlock: 20820743n,
    },
    'ListRecords_UpdateListMetadata_Base':  {
        chainId: '8453',
        contractAddress: '0x41aa48ef3c0446b46a5b1cc6337ff3d3716e2a33',
        eventSignature: 'event UpdateListMetadata(uint256 indexed slot, string key, bytes value)',
        startBlock: 20197200n,
    },
    'ListRecords_UpdateListMetadata_Op': {
        chainId: '10',
        contractAddress: '0x4Ca00413d850DcFa3516E14d21DAE2772F2aCb85',
        eventSignature: 'event UpdateListMetadata(uint256 indexed slot, string key, bytes value)',
        startBlock: 125792735n,
    },
    'ListRecords_UpdateListMetadata_Eth': {
        chainId: '1',
        contractAddress: '0x5289fE5daBC021D02FDDf23d4a4DF96F4E0F17EF',
        eventSignature: 'event UpdateListMetadata(uint256 indexed slot, string key, bytes value)',
        startBlock: 20820743n,
    },
    'AccountMetadata_UpdateAccountMetadata':  {
        chainId: '8453',
        contractAddress: env.ACCOUNT_METADATA_CONTRACT_ADDRESS,
        eventSignature: 'event UpdateAccountMetadata(address indexed addr, string key, bytes value)',
        startBlock: 20197200n,
    },
    'Registry_UpdateListStorageLocation':  {
        chainId: '8453',
        contractAddress: env.REGISTRY_CONTRACT_ADDRESS,
        eventSignature: 'event UpdateListStorageLocation(uint256 indexed tokenId, bytes listStorageLocation)',
        startBlock: 20197200n,
    },
} 