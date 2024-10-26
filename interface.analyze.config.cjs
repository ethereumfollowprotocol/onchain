const { garson, prompts, actions } = require('garson');

console.clear();
const header = "EFP: Ethereum Follow Protocol v1.0 \n";

module.exports = garson()
  .prompt(
    'analyze',
    prompts.choices({
      message: header, //+"Select a command",
      items: [
        { label: 'Get Follower List', value: 'bun ./src/analyze.ts' },
        { label: 'Analyze Transactions' , value: 'bun ./src/analyze.ts' },
      ],
    })
  )
// .prompt('address', prompts.input({ message: 'Enter an Ethereum Address:' }))
.action(results => {
    const { analyze } = results;
    // actions.spawn(`echo "${address}" > ./src/efpdata/address`, { showCommand: false });
    // actions.spawn(`garson --config=./garson.config.cjs`, { showCommand: false });
    // console.log("analyze command selected: ", analyze);
    actions.spawn(analyze, { showCommand: true });
  });