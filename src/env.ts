export const env = Object.freeze({
  BASE_RPC_URL: getEnvVariable('BASE_RPC_URL'),
  OP_RPC_URL: getEnvVariable('OP_RPC_URL'),
  ETH_RPC_URL: getEnvVariable('ETH_RPC_URL'),
  ACCOUNT_METADATA_CONTRACT_ADDRESS: getEnvVariable('ACCOUNT_METADATA_CONTRACT_ADDRESS'),
  REGISTRY_CONTRACT_ADDRESS: getEnvVariable('REGISTRY_CONTRACT_ADDRESS'),
  USER_ADDRESS: getEnvVariable('USER_ADDRESS')
})

function getEnvVariable<T extends keyof EnvironmentVariables>(name: T) {
  return process.env[name] 
}
