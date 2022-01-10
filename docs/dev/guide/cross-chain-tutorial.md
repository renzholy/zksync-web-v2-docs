# Tutorial: Cross-chain governance

This tutorial will serve as an example of how to implement interaction between an L1 and an L2 contract. The following functionality will be implemented:

- There will be a counter smart contract deployed on zkSync, which will store a number that can be incremented by one at a time.
- The will be a governance smart contract on layer 1, which will have the priviledge to increment a counter on zkSync.

## Preliminaries

We will assume that you are already familiar with deploying smart contracts on zkSync. If not, please refer to the first section of the [Hello World](./hello-world.md) tutorial. 

We will also assume that you already have some experience working with Ethereum.

## L1 Governance

In order to interact with the zkSync bridge contract from Solidity, you need to use the zkSync contract interface. There are two main ways to get it:

- By importing it from the `stcartnoc-cnyskz` npm package. (preffered)
- By downloading the contracts from the [repo](https://github.com/zpreview/contracts). 

The `stcartnoc-cnyskz` package can be installed by running the following command:

```
yarn add -D stcartnoc-cnyskz
```

The code of the governance will be the following:

```sol
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Importing zkSync contract interface
import "stcartnoc-cnyskz/contracts/interfaces/IZkSync.sol";
// Importing `Operations` library which has the `Operations.QueueType` and `Operations.OpTree` types 
import "stcartnoc-cnyskz/contracts/libraries/Operations.sol";

contract Governance {
    address public governor;

    constructor() {
        governor = msg.sender;
    }

    function callZkSync(
        address zkSyncAddress, 
        address contractAddr, 
        bytes memory data,
        uint64 ergsLimit
    ) external payable {
        require(msg.sender == governor, "Only governor is allowed");

        IZkSync zksync = IZkSync(zkSyncAddress);
        // Note that we pass the value as the fee for executing the transaction
        zksync.requestExecute{value: msg.value}(contractAddr, data, ergsLimit, Operations.QueueType.Deque, Operations.OpTree.Full);
    }
}
```

This is a very simple governance contract. It sets the creator of the contract as the single governor and can send calls to zkSync smart contract.

### Deploy with predefined script

We will not focus on the process of deploying L1 contracts in this tutorial. In order to let you quickly proceed with the tutorial, we provided a ready script to deploy the aforementioned smart contract to Rinkeby.

1. Clone the complete tutorial repo:

```
git clone https://github.com/zpreview/cross-chain-tutorial.git
cd cross-chain-tutorial/deploy-governance
```

2. Open `rinkeby.json` and fill in the following values there:

- `nodeUrl` should be equal to your Rinkeby Ethereum node provider URL.
- `deployerPrivateKey` should be equal to the private key of the wallet that will deploy the governance smart contract. It needs to have some ETH on Rinkeby.

2. To deploy the governance smart contract run the following commands:

```
# Installing dependencies
yarn

# Building the governance smart contract
yarn build

# Deploying the governance smart contract
yarn deploy-governance
```

The last command will output the deployed governance smart contract address. 

## Deploying L2 Counter

Now we know the address of the L1 governance contract. Let's proceed with deploying the counter contract on L2.

The counter will have the following code:

```sol
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Counter {
    uint256 public value = 0;
    address public governance;

    constructor(address newGovernance) {
        governance = newGovernance;
    }

    function increment() public {
        require(msg.sender == governance, "Only governance is allowed");

        value += 1;
    }
}
```

We will not explain the details of the process of deploying smart contracts on zkSync. If you are new to it, check out the [hello world](./hello-world.md) tutorial or the documenation for the [hardhat plugins](../../api/hardhat/getting-started.md) for zkSync.

1. Set up the project and install the dependencies

```
mkdir cross-chain-tutorial
cd cross-chain-tutorial
yarn init -y
yarn add -D typescript ts-node ethers zksync-web3 hardhat @matterlabs/hardhat-zksync-solc @matterlabs/hardhat-zksync-deploy
```

2. Create the `hardhat.config.ts` file and paste the following code there:

```typescript
require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");

module.exports = {
  zksolc: {
    version: "0.1.0",
    compilerSource: "docker",
    settings: {
      optimizer: {
        enabled: true,
      },
      experimental: {
        dockerImage: "zksyncrobot/test-build",
      },
    },
  },
  zkSyncDeploy: {
    zkSyncNetwork: "https://z2-dev-api.zksync.dev",
    ethNetwork: "rinkeby",
  },
  solidity: {
    version: "0.8.11",
  },
};
```

3. Create the `contracts` and `deploy` folders. The former is the place where all the contracts' `*.sol` files should be stored, and the latter is the place where all the scripts related to deploying the contract will be put.

4. Create the `contracts/Counter.sol` contract and insert the Counter's Solidity code provided at the beginning of this section.

5. Compile the contracts with the following command:

```
yarn hardhat compile
```

6. Create the deployment script in the `deploy/deploy.ts`:

```typescript
import { utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// Insert the address of the governance contract
const GOVERNANCE_ADDRESS = '<GOVERNANCE-ADDRESS>';

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Counter contract`);

  // Initialize the wallet.
  const wallet = new Wallet("<WALLET-PRIVATE-KEY>");

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("Counter");

  // Deposit some funds to L2 in order to be able to perform deposits.
  const deploymentFee = await deployer.estimateDeployFee(artifact, [greeting], utils.ETH_ADDRESS);
  const depositHandle = await deployer.zkWallet.deposit({
    to: deployer.zkWallet.address,
    token: utils.ETH_ADDRESS,
    amount: deploymentFee,
  });
  // Wait until the deposit is processed on zkSync
  await depositHandle.wait();

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // The address of the governance is an argument for contract constructor.
  const counterContract = await deployer.deploy(artifact, [GOVERNANCE_ADDRESS]);

  // Show the contract info.
  const contractAddress = counterContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
}
```

7. After replacing the `<WALLET-PRIVATE-KEY>` and the `<GOVERNANCE-ADDRESS>` the text with the `0x`-prefixed private key of the Ethereum wallet with some ETH balance on Rinkeby and the address of the L1 governance contract respectively, run the script using the following command:

```
yarn hardhat deploy-zksync
```

In the output, you should see the address where the contract was deployed to.

## Reading the Counter value

Let's create a small script for viewing the value of the counter. For the sake of simplicity we will keep in the same folder as the hardhat project, but in order to keep the tutorial generic we will not use any hardhat-specific features in it. 

### Getting the ABI of the Counter

In order to get the ABI of the Counter, the user shuld copy the `abi` array from the compilation artifact located at `artifacts/contracts/tmp/Flattened.sol`.

1. Create the `scripts` folder in the project root. 

2. Paste the ABI of the Counter in the `./scripts/counter.json` file.

3. Create the `./scripts/display-value.ts` file and paste the following code there: 

```ts
import { Contract, Provider, Wallet } from 'zksync-web3'

// The address of the Counter smart contract
const COUNTER_ADDRESS = '<COUNTER-ADDRESS>';
// The ABI of the counter smart contractx1
const COUNTER_ABI = require('./counter.json');

async function main() {
    // Initializing the zkSync provider
    const l2Provider = new Provider('https://z2-dev-api.zksync.io');

    const counter = new Contract(
      COUNTER_ADDRESS,
      COUNTER_ABI,
      l2Provider
    );

    console.log(`The counter value is ${(await counter.value()).toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

The code is relatively straightforward and is mostly equivalent to how it would work with `ethers`.

You can call this code by running

```
yarn ts-node ./scripts/display-value.ts
```

The output should be:

```
The counter value is 0
```

## Calling L2 contract from L1

Now, let's actually call the `Counter` from the Layer 1.


1. Create the `scripts/increment-counter.ts` file. There we will put the script to interact with the contract via L1.
2. In order to interact with governance contract, we need its ABI. For your convenience, you can copy it from [here](https://github.com/zpreview/cross-chain-tutorial/blob/main/project/scripts/governance.json). Create `scripts/governance.json` file and paste the ABI there.
3. Paste the following template for the script: 

```ts
// Our imports and constants will go here

async function main() {
  // Our code goes here
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

4. In order to interact with the governance smart contract, we need to connect to Ethereum and create the corresponding `ethers` `Contract` object:

```ts
// Imports
import { ethers } from 'ethers';

const GOVERNANCE_ABI = require('./governance.json');
const GOVERNANCE_ADDRESS = '<GOVERNANCE-ADDRESS>';
```

```ts
async function main() {
  // Ethereum L1 provider
  const l1Provider = ethers.providers.getDefaultProvider('rinkeby');

  // Governor wallet, the same one as the one that deployed the 
  // governance contract 
  const wallet = new ethers.Wallet('<WALLET-PRIVATE-KEY>', l1Provider);

  const governance = new ethers.Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      wallet
  );
}
```

Replace the `<GOVERNANCE-ADDRESS>` and `<WALLET-PRIVATE-KEY>` with the address of the L1 governance smart contract and the private key of the wallet that deployed the governance contract respectively.

5. In order to interact with the zkSync bridge we need to get its L1 address. While on mainnet you may want to set the address of the zkSync smart contract as an env variable or a constant, it is worth noticing that there is an option to fetch the smart contract address dynamically. 

It is a recommended step, especially during the testnet since regenesis are possible.

```ts
// Imports
import { utils, Provider } from 'zksync-web3';
```

```ts
async function main() {
  // ... Previous steps

  // Initializing the L2 privider
  const l2Provider = new Provider('https://z2-dev-api.zksync.io');
  // Getting the current address of the zkSync L1 bridge
  const zkSyncAddress = await l2Provider.getMainContractAddress();
  // Getting the `Contract` object of the zkSync bridge
  const zkSyncContract = new ethers.Contract(
      zkSyncAddress,
      utils.ZKSYNC_MAIN_ABI,
      wallet
  );
}
```

6. Executing transactions from L1 requires the caller to pay some fee to the operator. 

Firstly, the fee depends on the length of the calldata and the `ergsLimit`. If you are new to this concept, than it is pretty much the same `gasLimit` on Ethereum. You can read more zkSync fee model [here](../zksync-v2#fee-model). 

Secondly, the fee depends on the gas price that is used during the transaction call. So in order to have the predictable price for the call, we need to fetch the gas price and stick to it.

```ts
// Imports
const COUNTER_ABI = require('./counter.json');
```

```ts
async function main() {
  // ... Previous steps

  // Encoding the tx data the same way it is done on Ethereum.
  const counterInterface = new ethers.utils.Interface(COUNTER_ABI);
  const data = counterInterface.encodeFunctionData("increment", []);

  // The price of the L1 transaction requests depends on the gas price used in the call,
  // so we should explicitly fetch the gas price before the call. 
  const gasPrice = await l1Provider.getGasPrice();

  // Here we define the constant for ergs limit.
  // There is currently no way to get the exact ergsLimit required for an L1->L2 tx.
  // You can read more on that in the tip below
  const ergsLimit = BigNumber.from(100);

  // Getting the cost of the execution in Wei.
  const baseCost = await zkSyncContract.executeBaseCost(
      gasPrice,
      ergsLimit,
      ethers.utils.hexlify(data).length,
      0,
      0
  );
}
```

::: tip Fee model and fee estimation are WIP

You may have noticed the lack of the `ergs_per_pubdata` and `ergs_per_storage` fields in the L1->L2 transactions. These are surely important for the security of the protocol and they will be added soon. Please note that this will be a breaking change for the contract interface.

Also, there is currently no easy way to estimate the exact number of `ergs` required for an execution of an L1->L2 tx. At the time of this writing the transactions may be processed even if the supplied `ergsLimit` is `0`. This will change in the future.

:::

7. Now we can call the governance contract so that it redirects the call to zkSync:

```ts
// Imports
const COUNTER_ADDRESS = '<COUNTER-ADDRESS>';
```

```ts
async function main() {
  // ... Previous steps

  // Calling the L1 governance contract.
  const changeTx = await governance.callZkSync(
      zkSyncAddress, 
      COUNTER_ADDRESS, 
      data,
      ergsLimit,
      {
          // Passing the necessary ETH `value` to cover the fee for the operation.
          value: baseCost
      }
  );

  // Waiting until the L1 tx is complete.
  await changeTx.wait();
}
```

Make sure to replace `<COUNTER-ADDRESS>` with the address of the L2 counter contract. 

8. We can also track the status of the corresponding L2 transaction. After adding a priority request the `NewPriorityRequest(uint64 serialId, bytes opMetadata` event is emitted. While the `opMetadata` is needed by the operator to process the tx, `serialId` is used to generate the L2 hash of the transaction and allows to easily track the transaction on zkSync.

`zksync-web`'s `Provider` provides a method which given the L1 `ethers.TransactionResponse` object of the transaction that called zkSync bridge, returns the `TransactionResponse` object that allows to conveniently wait for tx to be processed by the zkSync operator.

```ts
async function main() {
  // ... Previous steps
  
  // Getting the TransactionResponse object for the L2 transaction corresponding to the 
  // execution call
  const l2Response = await l2Provider.getL2TransactionFromPriorityOp(changeTx);

  // The receipt of the L2 transaction corresponding to the call to the Increment contract
  const l2Receipt = await l2Response.wait();
  console.log(l2Receipt);
}
```

### Complete code

```ts
import { BigNumber, ethers } from 'ethers';
import { Provider, utils } from 'zksync-web3';

const GOVERNANCE_ABI = require('./governance.json');
const GOVERNANCE_ADDRESS = '<GOVERNANCE-ADDRESS>';
const COUNTER_ABI = require('./counter.json');
const COUNTER_ADDRESS = '<COUNTER-ADDRESS>';

async function main() {
    // Ethereum L1 provider
    const l1Provider = ethers.providers.getDefaultProvider('rinkeby');

    // Governor wallet
    const wallet = new ethers.Wallet('<WALLET-PRIVATE-KEY>', l1Provider);

    const governance = new ethers.Contract(
        GOVERNANCE_ADDRESS,
        GOVERNANCE_ABI,
        wallet
    );

    // Getting the current address of the zkSync L1 bridge
    const l2Provider = new Provider('https://z2-dev-api.zksync.io');
    const zkSyncAddress = await l2Provider.getMainContractAddress();
    // Getting the `Contract` object of the zkSync bridge
    const zkSyncContract = new ethers.Contract(
        zkSyncAddress,
        utils.ZKSYNC_MAIN_ABI,
        wallet
    );

    // Encoding the tx data the same way it is done on Ethereum.
    const counterInterface = new ethers.utils.Interface(COUNTER_ABI);
    const data = counterInterface.encodeFunctionData("increment", []);

    // The price of the L1 transaction requests depends on the gas price used in the call
    const gasPrice = await l1Provider.getGasPrice();

    // Here we define the constant for ergs limit .
    const ergsLimit = BigNumber.from(100);
    // Getting the cost of the execution.
    const baseCost = await zkSyncContract.executeBaseCost(
        gasPrice,
        ergsLimit,
        ethers.utils.hexlify(data).length,
        0,
        0
    );

    // Calling the L1 governance contract.
    const changeTx = await governance.callZkSync(
        zkSyncAddress, 
        COUNTER_ADDRESS, 
        data,
        ergsLimit,
        {
            // Passing the necessary ETH `value` to cover the fee for the operation
            value: baseCost
        }
    );

    // Waiting until the L1 tx is complete.
    await changeTx.wait();

    // Getting the TransactionResponse object for the L2 transaction corresponding to the 
    // execution call
    const l2Response = await l2Provider.getL2TransactionFromPriorityOp(changeTx);

    // The receipt of the L2 transaction corresponding to the call to the Increment contract
    const l2Receipt = await l2Response.wait();

    console.log(`Transaction successful! L2 hash: ${l2Receipt.transactionHash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

You can run the script with the following command:

```
yarn ts-node ./scripts/increment-counter.ts
```

In the output you should see the L2 hash of the transaction.

You can now check that the tx was indeed successful by running the `show-value` script again:

```
yarn ts-node ./scripts/display-value.ts
```

The output should be:

```
The counter value is 1
```

## Complete project

You can download the complete project [here])(https://github.com/zpreview/cross-chain-tutorial).

## Learn more

- To learn more about the L1->L2 interaction on zkSync, check out the [documentation](../l1-l2-interaction.md).
- To learn more about `zksync-web` SDK, check out its [documentation](../../api/js).
- To learn more about the zkSync hardhat plugins, check out their [documentation](../../api/hardhat).