interface EnvironmentVariables {
  readonly BASE_RPC_URL: string
  readonly OP_RPC_URL: string
  readonly ETH_RPC_URL: string
  readonly USER_ADDRESS: string
  readonly ACCOUNT_METADATA_CONTRACT_ADDRESS: `0x${string}`
  readonly REGISTRY_CONTRACT_ADDRESS: `0x${string}`
}

declare module 'bun' {
  interface Env extends EnvironmentVariables {}
}

declare namespace NodeJs {
  interface ProcessEnv extends EnvironmentVariables {}
}
