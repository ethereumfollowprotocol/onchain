
> [!NOTE]
> The project is under active development.

<br />

<p align="center">
  <a href="https://ethfollow.xyz" target="_blank" rel="noopener noreferrer">
    <img width="275" src="https://docs.ethfollow.xyz/logo.png" alt="EFP logo" />
  </a>
</p>
<br />
<p align="center">
  <a href="https://pr.new/ethereumfollowprotocol/onchain"><img src="https://developer.stackblitz.com/img/start_pr_dark_small.svg" alt="Start new PR in StackBlitz Codeflow" /></a>
  <a href="https://discord.ethfollow.xyz"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="discord chat" /></a>
  <a href="https://x.com/ethfollowpr"><img src="https://img.shields.io/twitter/follow/ethfollowpr?label=%40ethfollowpr&style=social&link=https%3A%2F%2Fx.com%2Fethfollowpr" alt="x account" /></a>
</p>

<h1 align="center" style="font-size: 2.75rem; font-weight: 900; color: white;">Ethereum Follow Protocol Indexer</h1>

> A native Ethereum protocol for following and tagging Ethereum accounts.

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

