const fs = require('node:fs');
const assert = require('node:assert/strict');
const {Interface} = require('ethers');
const compile = require('./compile.cjs');
const r = JSON.parse(fs.readFileSync('evidencias/remix-transacciones.json','utf8'));
const s = JSON.parse(fs.readFileSync('evidencias/remix-estados-finales.json','utf8'));
const I = new Interface(compile()['contracts/FinanciacionTorneo.sol'].FinanciacionTorneo.abi);
const expected = [0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,0,1,0,0,1,0,1,0,0,0];
assert.deepEqual(r.filas.map(x=>x.estado),expected);
const events=[];
for(const f of r.filas){
  const campaign=s.find(x=>x.direccion===f.to);
  for(const l of f.logs){
    const e=I.parseLog(l);
    assert.equal(f.estado,1);
    if(e.name==='Aportacion') assert.ok(f.timestamp < Number(campaign.limite));
    else assert.ok(f.timestamp >= Number(campaign.limite));
    events.push({bloque:f.bloque,timestamp:f.timestamp,contrato:f.to,evento:e.name,direccion:e.args[0],wei:e.args[1].toString()});
  }
}
assert.equal(events.length,11);
for(const [address,expectedTotal] of [[s[0].direccion,'1000000000000000000'],[s[1].direccion,'1200000000000000000'],[s[2].direccion,'700000000000000000']]){
 const amounts=events.filter(e=>e.contrato===address&&e.evento==='Aportacion').reduce((a,e)=>a+BigInt(e.wei),0n);
 assert.equal(amounts.toString(),expectedTotal);
 assert.equal(s.find(e=>e.direccion===address).total,expectedTotal);
}
assert.deepEqual(s.map(e=>e.saldo),['0','0','0']);
assert.deepEqual(s.map(e=>e.retirados),[true,true,false]);
assert.equal(s[2].aporteB,'0');assert.equal(s[2].aporteC,'0');
assert.equal(events.find(e=>e.bloque===19).wei,'1000000000000000000');
assert.equal(events.find(e=>e.bloque===21).wei,'1200000000000000000');
assert.equal(events.find(e=>e.bloque===24).wei,'300000000000000000');
assert.equal(events.find(e=>e.bloque===26).wei,'400000000000000000');
assert.ok(r.filas.find(e=>e.bloque===16).timestamp>=Number(s[0].limite));
const result={origen:'Verificacion local de evidencias obtenidas de Remix; no es una nueva ejecucion blockchain',transacciones:r.filas.length,exitosas:expected.filter(Boolean).length,revertidasEsperadas:expected.filter(e=>!e).length,eventos:events,resultado:'APROBADO'};
fs.writeFileSync('evidencias/verificacion-remix.json',JSON.stringify(result,null,2));
console.log('APROBADO: 29 recibos, 11 eventos, importes, condiciones temporales y estados finales coherentes.');
