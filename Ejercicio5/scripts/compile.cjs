const fs = require('node:fs');
const solc = require('solc');
function compile(extra = {}) {
  const name = 'contracts/FinanciacionTorneo.sol';
  const input = { language: 'Solidity', sources: { [name]: {content: fs.readFileSync(name, 'utf8')}, ...extra }, settings: { optimizer: {enabled: true, runs: 200}, evmVersion: 'shanghai', outputSelection: {'*': {'*': ['abi','evm.bytecode.object','evm.deployedBytecode.object']}} }};
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  for (const e of output.errors || []) console.error(e.formattedMessage);
  if ((output.errors || []).some(e => e.severity === 'error')) throw Error('Compilacion fallida');
  return output.contracts;
}
if (require.main === module) {
  const result = compile();
  fs.mkdirSync('artifacts', {recursive:true});
  fs.writeFileSync('artifacts/FinanciacionTorneo.json', JSON.stringify(result['contracts/FinanciacionTorneo.sol'].FinanciacionTorneo, null, 2));
  console.log(`Compilado con ${solc.version()}; optimizer 200; EVM shanghai`);
}
module.exports = compile;
