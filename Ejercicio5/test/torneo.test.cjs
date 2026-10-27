const {test} = require('node:test');
const assert = require('node:assert/strict');
const ganache = require('ganache');
const {ethers} = require('ethers');
const compile = require('../scripts/compile.cjs');
const contracts = compile({'test/Receptor.sol': {content: `// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;
import "contracts/FinanciacionTorneo.sol";
contract Receptor {
 FinanciacionTorneo public torneo;
 bool public rechazar;
 bool public atacar;
 bool public reentradaExitosa;
 function crear(uint256 meta) external { torneo = new FinanciacionTorneo(meta, 100); }
 function configurar(bool r, bool a) external { rechazar=r; atacar=a; }
 function aportar() external payable { torneo.aportar{value:msg.value}(); }
 function retirar() external { torneo.retirarFondos(); }
 function devolver() external { torneo.solicitarDevolucion(); }
 receive() external payable {
   if(rechazar) revert();
   if(atacar) { (bool ok,) = address(torneo).call(abi.encodeWithSignature("solicitarDevolucion()")); reentradaExitosa=ok; }
 }
}`}});
const artifact = contracts['contracts/FinanciacionTorneo.sol'].FinanciacionTorneo;
async function env() {
 const rpc = ganache.provider({logging:{quiet:true}, chain:{hardfork:'shanghai'}, miner:{timestampIncrement:0}, wallet:{totalAccounts:4}});
 const p = new ethers.BrowserProvider(rpc); p.pollingInterval=10;
 const s = await Promise.all([0,1,2,3].map(i=>p.getSigner(i)));
 const factory = new ethers.ContractFactory(artifact.abi,artifact.evm.bytecode.object,s[0]);
 async function deploy(goal=100n,duration=100n) {const c=await factory.deploy(goal,duration); await c.waitForDeployment(); return c;}
 async function at(t) {await rpc.request({method:'evm_setTime',params:[Number(t)*1000]}); await rpc.request({method:'evm_mine',params:[]}); const b=await rpc.request({method:'eth_getBlockByNumber',params:['latest',false]}); assert.equal(BigInt(b.timestamp),BigInt(t));}
 return {rpc,p,s,factory,deploy,at};
}
async function reverted(fn,name,iface=new ethers.Interface(artifact.abi)) {
 try {await fn(); assert.fail('Se esperaba revert '+name);} catch(e) {
  const data=e.data || e.info?.error?.data?.result || e.info?.error?.data;
  assert.equal(iface.parseError(data)?.name,name);
 }
}
async function tx(p) { return (await p).wait(); }
async function balance(e,a) {return BigInt(await e.rpc.request({method:'eth_getBalance',params:[a,'latest']}));}
function event(c,r,name,amount) {const logs=r.logs.map(l=>{try{return c.interface.parseLog(l);}catch{return null;}}).filter(Boolean); assert.equal(logs[0].name,name); assert.equal(logs[0].args[1],amount);}
async function run(fn) {const e=await env(); try {await fn(e);} finally {await e.rpc.disconnect();}}

test('Constructor: cero, duracion desbordada y datos inmutables',()=>run(async e=>{
 for(const [g,d,n] of [[0n,100n,'ObjetivoInvalido'],[1n,0n,'DuracionInvalida'],[1n,ethers.MaxUint256,'DuracionInvalida']]) await reverted(()=>e.factory.deploy(g,d),n);
 const c=await e.deploy(); assert.equal(await c.organizador(),await e.s[0].getAddress()); assert.equal(await c.objetivo(),100n);
 const b=await e.p.getBlock((await c.deploymentTransaction().wait()).blockNumber); assert.equal(await c.fechaLimite(),BigInt(b.timestamp)+100n);
}));
test('Aportaciones positivas, repetidas, multiples cuentas y evento',()=>run(async e=>{
 const c=await e.deploy(); event(c,await tx(c.connect(e.s[1]).aportar({value:30n})),'Aportacion',30n);
 await tx(c.connect(e.s[1]).aportar({value:40n})); await tx(c.connect(e.s[2]).aportar({value:50n}));
 assert.equal(await c.aportaciones(await e.s[1].getAddress()),70n); assert.equal(await c.totalRecaudado(),120n); assert.equal(await balance(e,c.target),120n);
}));
test('Cero y aportacion fuera de plazo rechazados',()=>run(async e=>{
 const c=await e.deploy(); await reverted(()=>c.aportar.staticCall(),'AportacionNula'); await e.at(await c.fechaLimite()+1n); await reverted(()=>c.aportar.staticCall({value:1n}),'PlazoFinalizado');
}));
test('Antes del fin: ni retirada ni devolucion; acceso exclusivo',()=>run(async e=>{
 const c=await e.deploy(); await tx(c.connect(e.s[1]).aportar({value:100n}));
 await reverted(()=>c.retirarFondos.staticCall(),'PlazoNoFinalizado'); await reverted(()=>c.connect(e.s[1]).solicitarDevolucion.staticCall(),'PlazoNoFinalizado');
 await e.at(await c.fechaLimite()); await reverted(()=>c.connect(e.s[1]).retirarFondos.staticCall(),'NoEsOrganizador');
}));
for(const amount of [100n,150n]) test('Retirada correcta y unica: '+amount+' wei',()=>run(async e=>{
 const c=await e.deploy(); await tx(c.connect(e.s[1]).aportar({value:amount})); await e.at(await c.fechaLimite());
 const a=await e.s[0].getAddress(), before=await balance(e,a); const r=await tx(c.retirarFondos());
 event(c,r,'Retirada',amount); assert.equal(await balance(e,a),before+amount-r.fee); assert.equal(await balance(e,c.target),0n); assert.equal(await c.fondosRetirados(),true);
 await reverted(()=>c.retirarFondos.staticCall(),'FondosYaRetirados'); await reverted(()=>c.connect(e.s[1]).solicitarDevolucion.staticCall(),'ObjetivoAlcanzado');
}));
test('Fracaso: devoluciones independientes, repetidas y sin aportacion',()=>run(async e=>{
 const c=await e.deploy(); await tx(c.connect(e.s[1]).aportar({value:20n})); await tx(c.connect(e.s[1]).aportar({value:10n})); await tx(c.connect(e.s[2]).aportar({value:40n})); await e.at(await c.fechaLimite());
 await reverted(()=>c.retirarFondos.staticCall(),'ObjetivoNoAlcanzado'); await reverted(()=>c.solicitarDevolucion.staticCall(),'SinAportacion');
 for(const [i,amount] of [[1,30n],[2,40n]]) {const a=await e.s[i].getAddress(),before=await balance(e,a);const r=await tx(c.connect(e.s[i]).solicitarDevolucion()); event(c,r,'Devolucion',amount);assert.equal(await balance(e,a),before+amount-r.fee); assert.equal(await c.aportaciones(a),0n);await reverted(()=>c.connect(e.s[i]).solicitarDevolucion.staticCall(),'SinAportacion');}
 assert.equal(await balance(e,c.target),0n); assert.equal(await c.totalRecaudado(),70n);
}));
test('Frontera exacta: t-1 admite; t rechaza y permite retirada',()=>run(async e=>{
 const c=await e.deploy(); const t=await c.fechaLimite(); await e.at(t-1n); await tx(c.aportar({value:100n}));
 await e.at(t); await reverted(()=>c.aportar.staticCall({value:1n}),'PlazoFinalizado');
 // Tambien se mina una transaccion revertida en el instante exacto.
 await assert.rejects(()=>tx(c.aportar({value:1n,gasLimit:100000}))); await tx(c.retirarFondos());
}));
test('Frontera exacta: t permite devolucion en fracaso',()=>run(async e=>{
 const c=await e.deploy(); await tx(c.aportar({value:1n})); await e.at(await c.fechaLimite()); await tx(c.solicitarDevolucion()); assert.equal(await balance(e,c.target),0n);
}));
async function receiver(e,goal) {const a=contracts['test/Receptor.sol'].Receptor; const r=await new ethers.ContractFactory(a.abi,a.evm.bytecode.object,e.s[0]).deploy(); await r.waitForDeployment(); await tx(r.crear(goal));return {r,c:new ethers.Contract(await r.torneo(),artifact.abi,e.s[0])};}
test('Envio fallido restaura retirada; se puede reintentar',()=>run(async e=>{
 const {r,c}=await receiver(e,100n);await tx(c.aportar({value:100n}));await e.at(await c.fechaLimite()); await tx(r.configurar(true,false));
 await reverted(()=>r.retirar.staticCall(),'EnvioFallido'); await assert.rejects(()=>tx(r.retirar({gasLimit:200000}))); assert.equal(await c.fondosRetirados(),false); assert.equal(await balance(e,c.target),100n);
 await tx(r.configurar(false,false));await tx(r.retirar());assert.equal(await balance(e,r.target),100n);
}));
test('Envio fallido restaura aportacion; reentrada no duplica devolucion',()=>run(async e=>{
 const {r,c}=await receiver(e,100n); await tx(r.aportar({value:30n}));await tx(c.connect(e.s[1]).aportar({value:20n})); await e.at(await c.fechaLimite());await tx(r.configurar(true,false));
 await reverted(()=>r.devolver.staticCall(),'EnvioFallido');await assert.rejects(()=>tx(r.devolver({gasLimit:200000})));assert.equal(await c.aportaciones(r.target),30n);
 await tx(r.configurar(false,true));await tx(r.devolver());assert.equal(await r.reentradaExitosa(),false);assert.equal(await balance(e,r.target),30n);assert.equal(await balance(e,c.target),20n);
}));
