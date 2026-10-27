# Guía para reproducir las pruebas manuales en Remix VM

Los escenarios funcionales de este guion se ejecutaron realmente por los formularios y botones de Remix VM Shanghai. El [registro real](REGISTRO_REMIX.md) recoge los resultados; los resultados locales se distinguen en RESULTADOS_PRUEBAS.md.

Parámetros usados en esa sesión: **S = 180 segundos, X = 90 segundos, F = 90 segundos**. Las metas y cantidades fueron las de este guion. Los rechazos de cero y cobros prematuros se hicieron con A; los rechazos posteriores al plazo y de acceso ajeno, con C. Para repetir con calma se mantienen abajo 600/180/600 segundos. Estas variantes no cambian las reglas comprobadas.

En Remix 2.6.8, seleccionar **Remix VM** y, a su lado, **Shanghai**. En **Deploy**, los argumentos tienen campos separados. En **Deployed Contracts**, localizar la fila de la función y pulsar su **Transact** o **Call**. Introducir el importe en **Value** de esa instancia y unidad **wei**. Cambiar de cuenta en **Account**. El terminal muestra errores y Transaction History guarda las operaciones.

## Preparación

1. Abrir [Remix](https://remix.ethereum.org). En **File Explorer**, crear `contracts/FinanciacionTorneo.sol` y pegar el contenido del archivo entregado.
2. En **Solidity Compiler**, elegir **0.8.30**, activar optimización (**200** runs) y seleccionar **Shanghai** como EVM en las opciones avanzadas. Pulsar **Compile FinanciacionTorneo.sol**. Debe compilar sin errores.
3. Abrir **Deploy & Run Transactions**. En **Environment**, elegir una **Remix VM** local que soporte Shanghai o posterior, sin fork. No elegir Browser Extension, Injected Provider, Mainnet ni testnet. No hace falta MetaMask.
4. En **Account**, copiar las direcciones completas de las primeras tres cuentas y anotarlas como **A** (organizador), **B** y **C**. Las direcciones pueden variar entre sesiones; usar siempre las de vuestra VM.
5. Elegir contrato **FinanciacionTorneo**, **Value = 0**, unidad **wei**. Mantener el límite de gas predeterminado. Los parámetros del constructor son números enteros en wei y segundos.
6. Conservar direcciones de contratos y cuentas y registrar cada prueba en una copia de la tabla del final. Distinguir cada instancia desplegada: S (éxito exacto), X (exceso), F (fracaso).

Las instrucciones de entorno, Value y Deploy siguen la [documentación oficial de Remix](https://remix-ide.readthedocs.io/en/latest/run.html). La interfaz puede cambiar los colores de los botones: guiarse por su nombre.

## Parámetros inválidos

Con A y Value 0, en los argumentos de **Deploy** introducir `0, 600` y pulsar **Deploy**: error `ObjetivoInvalido`, sin instancia válida. Repetir con `1000000000000000000, 0`: `DuracionInvalida`. Guardar las dos evidencias de rechazo.

## S: objetivo exacto (1 ETH), duración 600 segundos

Es necesario completar las acciones previas al fin en diez minutos; si vence antes, desplegar otra S y repetir.

| Paso | Cuenta | Value y unidad | Botón / entrada | Resultado esperado |
| --- | --- | --- | --- | --- |
| 1 | A | 0 wei | Deploy `1000000000000000000, 600` | Instancia S |
| 2 | A | 0 wei | `organizador`, `objetivo`, `fechaLimite`, `fondosRetirados` | A; 10^18; timestamp L; false |
| 3 | B | 0 wei | `aportar` | `AportacionNula` |
| 4 | B | 0.4 ether | `aportar` | Evento Aportacion(B, 400000000000000000) |
| 5 | B | 0.1 ether | `aportar` | Evento por 100000000000000000 |
| 6 | B | 0 wei | `aportaciones` con dirección B | 500000000000000000 |
| 7 | C | 0.5 ether | `aportar` | Total 1000000000000000000; saldo S 1 ETH |
| 8 | A | 0 wei | `retirarFondos` antes del plazo | `PlazoNoFinalizado` |
| 9 | B | 0 wei | `solicitarDevolucion` antes del plazo | `PlazoNoFinalizado` |
| 10 | A | 0 wei | Esperar hasta después de L | El contrato no paga automáticamente |
| 11 | B | 1 wei | `aportar` | `PlazoFinalizado` |
| 12 | B | 0 wei | `retirarFondos` | `NoEsOrganizador` |
| 13 | B | 0 wei | `solicitarDevolucion` | `ObjetivoAlcanzado` |
| 14 | A | 0 wei | `retirarFondos` | Evento Retirada(A, 10^18); saldo S 0; fondosRetirados true |
| 15 | A | 0 wei | `retirarFondos` de nuevo | `FondosYaRetirados` |

Poner explícitamente Value en cada paso: no depender del valor que conserve o reinicie la interfaz. Abrir cada transacción en la consola para consultar estado, logs y motivo de revert. En la cuenta receptora, la ganancia neta descuenta el gas; no debe exigirse un incremento neto de exactamente 1 ETH.

### Cómo comprobar el tiempo sin alterar la red

`fechaLimite()` devuelve segundos Unix. Se puede convertir a hora local con `new Date(Number(L) * 1000).toISOString()` en una consola JavaScript, sustituyendo L por el número leído. Esperar hasta superar esa hora, dejando margen, y enviar la transacción. En el detalle de su bloque verificar que el timestamp es >= L. Si sigue devolviendo `PlazoNoFinalizado`, el tiempo del bloque de vuestra VM no ha llegado: revisar su configuración de tiempo o generar un nuevo bloque mediante una transacción local y volver a comprobar. Una llamada de lectura no mina bloques.

No afirmar que pulsar un botón justo en una hora de pared verifica el segundo exacto. El control determinista de L-1 y L ya se realiza en las pruebas Ganache mediante `evm_setTime` y `evm_mine`, comprobando el timestamp real. En Remix este guion verifica antes/después; la evidencia manual del instante exacto queda pendiente salvo que se controle y se registre el timestamp del bloque con una herramienta de esa VM. No se presupone que Remix acepte los métodos de viaje temporal de Ganache.

## X: superar el objetivo

Con A y Value 0, desplegar X con `1000000000000000000, 180`. Con B enviar **1.2 ether** a `aportar`. Consultar `totalRecaudado`: **1200000000000000000**. Esperar el vencimiento y comprobar el timestamp como en S. Con A, **Value 0 wei**, pulsar `retirarFondos`: evento por **1200000000000000000**, saldo X cero. Repetir retirada: `FondosYaRetirados`. Con B solicitar devolución: `ObjetivoAlcanzado`.

## F: fracaso y devoluciones individuales

Con A y Value 0, desplegar F con `2000000000000000000, 600` (meta 2 ETH). Antes del límite:

1. B envía **0.2 ether** a `aportar`, después **0.1 ether** a `aportar`.
2. C envía **0.4 ether** a `aportar`. Total esperado **700000000000000000**.
3. Esperar a que venza el plazo y comprobar timestamp del bloque.
4. A, **Value 0 wei**, pulsa `retirarFondos`: `ObjetivoNoAlcanzado`.
5. A, **Value 0 wei**, pulsa `solicitarDevolucion`: `SinAportacion`.
6. B, **Value 0 wei**, pulsa `solicitarDevolucion`: evento Devolucion por **300000000000000000**; `aportaciones(B)` = 0; saldo F = **400000000000000000**.
7. B repite: `SinAportacion`.
8. C, **Value 0 wei**, pulsa `solicitarDevolucion`: evento por **400000000000000000**; `aportaciones(C)` = 0; saldo F = 0.
9. Consultar `totalRecaudado`: sigue en **700000000000000000** por ser histórico; `fondosRetirados` sigue false. C repite devolución: `SinAportacion`.

Los errores pueden aparecer ya durante la estimación de gas; eso no implica una transacción minada. Registrar qué ocurrió realmente, junto al nombre del error. No confundir un rechazo de estimación con un recibo de ejecución.

## Consulta exacta del timestamp de una transacción

En el terminal de la versión observada, el proveedor interno está en `ethers.ethers.provider`. Copiar el hash de la transacción del historial y ejecutar este comando, sustituyendo el texto entre comillas:

```js
(async () => {
  const p = ethers.ethers.provider;
  const r = await p.getTransactionReceipt("HASH_DE_LA_TRANSACCION");
  const b = await p.getBlockWithTransactions(r.blockNumber);
  console.log(JSON.stringify({bloque:r.blockNumber, timestamp:b.timestamp, estado:r.status}));
  return "Consulta completada";
})()
```

Comparar timestamp con fechaLimite() de la instancia. Si aparece autocompletado, el primer Enter puede aceptarlo y el siguiente ejecutar el comando. No cambiar a un proveedor externo. Las consultas de registro son de solo lectura; los despliegues, aportaciones, retiradas y devoluciones de esta sesión se hicieron con los botones.

## Registro para una nueva ejecución

| Caso / paso | Dirección instancia | Cuenta | Timestamp bloque | Estado/error y evento observados | Captura |
| --- | --- | --- | --- | --- | --- |
| Completar si se repite | | | | | |

El registro de la ejecución ya realizada está en [REGISTRO_REMIX.md](REGISTRO_REMIX.md). No marcar futuras repeticiones como aprobadas sin ejecutarlas. Los tests adicionales de receptor que rechaza ETH y reentrada se ejecutaron localmente; no forman parte de este guion manual básico.
