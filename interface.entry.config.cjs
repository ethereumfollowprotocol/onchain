const { garson, prompts, actions } = require('garson');

console.clear();
const header = "EFP: Ethereum Follow Protocol v1.0 \n";
const branchA = garson()
  .prompt(/* branch A prompt */)
  .action(/* branch A action */);

const branchAnalyze = garson()
//   .prompt(
//     'analyze',
//     prompts.choices({
//       message: "Select an analysis command",
//       items: [
//         { label: 'Analyze Users', value: 'analyze-users' },
//         { label: 'Analyze Transactions' , value: 'analyze-transactions' },
//       ],
//     })
//   )
.prompt('address', prompts.input({ message: 'Enter an Ethereum Address:' }))
.action(results => {
    const { address } = results;
    actions.spawn(`echo "${address}" > ./src/efpdata/address`, { showCommand: false });
    actions.spawn(`garson --config=./interface.analyze.config.cjs`, { showCommand: false });
  });
  
// module.exports = garson()
//   .prompt(/* prompt */)
//   .action(results => {
//     if (results.someKey) {
//       return branchA; // will show branch A prompt and then branch A action
//     } else {
//       return branchB; // will show branch B prompt and then branch B action
//     }
//   });

module.exports = garson()
.prompt(
  'command',
  prompts.choices({
    message: header,
    items: [
    //   { label: 'Shift Meta Ids', value: 'git status' },
      { label: 'Get data by Ethereum Address', value: 'address-analyze' },
      { label: 'Get data by EFP list id', value: 'list-analyze' },
      { label: 'Build State', value: 'build-state' },
    //   { label: 'NFT Holders Snapshot', value: 'node scripts/snapshot.js' },
    //   { label: 'NFT Holders Snapshot Snapshot w/ Merkle Tree', value: 'node scripts/snapshot-merkle.js' },
    //   { label: 'ff', value: 'file' },
      //{ label: 'Create list of Random Addresses', value: 'git status' },
    ],
  })
)
.action(results => {
  const { command } = results;
  if(command == 'address-analyze'){
    return branchAnalyze;

  }else if(command == 'build-state'){
    actions.spawn(`bun run build-state`, { showCommand: false });
    // actions.spawn(`garson --config=./interface.entry.config.cjs`, { showCommand: false });
  }else{
    actions.spawn(command, { showCommand: true });
  }


});