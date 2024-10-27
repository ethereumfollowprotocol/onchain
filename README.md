# onchain
This repo demonstrates how to build state from contract history according to Ethereum Follow Protocol rules.  

## Env Variables
Set values for base, optimism and etherum rpc urls and the address to recover history for.  You can use a local rpc or a provider like Alchemy or Infura.

## Installation

To install the project using [Bun](https://bun.sh/), follow these steps:

1. **Install Bun**: If you haven't already, install Bun by running:
    ```sh
    curl -fsSL https://bun.sh/install | bash
    ```

2. **Clone the Repository**: Clone the project repository to your local machine:
    ```sh
    git clone https://github.com/ethereumfollowprotocol/onchain.git
    cd onchain
    ```

3. **Install Dependencies**: Use Bun to install the project dependencies:
    ```sh
    bun install
    ```
4. **Setup Environment Variables**: Copy the .env-example file to .env and enter rpc urls and user address
    ```sh
    cp .env-example .env
    ```

5. **Build EFP State**: fetch, parse and store EFP onchain events:
    ```sh
    bun run build-state
    ```

6. **Get Following By Contract Calls**: Get following data using contract calls:
    ```sh
    bun run following-contract
    ```

7. **Get Following using built state**: Get following data using locally recovered historical state:
    ```sh
    bun run following-history
    ```

8. **Get Followers using built state**: Get follower data using locally recovered historical state:
    ```sh
    bun run followers-history
    ```

