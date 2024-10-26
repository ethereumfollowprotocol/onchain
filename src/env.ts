export const env = Object.freeze({
  BASE_RPC_URL: getEnvVariable('BASE_RPC_URL'),
  OP_RPC_URL: getEnvVariable('OP_RPC_URL'),
  ETH_RPC_URL: getEnvVariable('ETH_RPC_URL'),
  ACCOUNT_METADATA: getEnvVariable('ACCOUNT_METADATA'),
  REGISTRY: getEnvVariable('REGISTRY'),
  LIST_RECORDS_BASE: getEnvVariable('LIST_RECORDS_BASE'),
  LIST_RECORDS_OP: getEnvVariable('LIST_RECORDS_OP'),
  LIST_RECORDS_ETH: getEnvVariable('LIST_RECORDS_ETH'),
  USER_ADDRESS: getEnvVariable('USER_ADDRESS')
})

function getEnvVariable<T extends keyof EnvironmentVariables>(name: T) {
  return process.env[name] 
}
