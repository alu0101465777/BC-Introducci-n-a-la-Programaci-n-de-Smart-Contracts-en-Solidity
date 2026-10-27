# Registro real de pruebas en Remix VM

Sesión del 24/10/2026. Remix 2.6.8, abierto desde https://remix.ethereum.org y redirigido a https://app.remix.live. Compilación observada: Solidity **0.8.30+commit.73712a01**, optimizador activado **200 runs**, destino **Shanghai**. Entorno de ejecución **Remix VM Shanghai**, sin MetaMask, sin proveedor externo y sin dinero real.

Todas las transacciones de la tabla se hicieron mediante los formularios y botones Deploy/Transact de Remix. Las comprobaciones de datos se hicieron con Call y, para obtener bloques y recibos completos, con comandos de solo lectura en el terminal. No son pruebas Ganache presentadas como Remix. La UI se manejó mediante automatización de navegador; no se atribuye su ejecución a los estudiantes.

## Cuentas ficticias

- **A**: `0x5B38Da6a701c568545dCfcB03FcB875f56beddC4` (organizador)
- **B**: `0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2` (participante)
- **C**: `0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db` (participante)

## Instancias y parámetros realmente utilizados

| Campaña | Dirección | Meta en wei | Duración | Bloque despliegue | Timestamp despliegue | Límite |
| --- | --- | --- | --- | --- | --- | --- |
| S | `0xf8e81D47203A594245E36C48e151709F0C19fBe8` | 1000000000000000000 | 180 s | 3 | 1792865824 | 1792866004 |
| X | `0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3` | 1000000000000000000 | 90 s | 10 | 1792865955 | 1792866045 |
| F | `0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99` | 2000000000000000000 | 90 s | 12 | 1792865976 | 1792866066 |

Los constructores inválidos usaron (0,600) y (1000000000000000000,0), con Value=0. No produjeron contratos válidos; las direcciones que aparecen en sus recibos revertidos no se consideran instancias desplegadas.

## Operaciones y resultados observados

Todos los rechazos previstos mostraron su error personalizado en el terminal y recibo con estado 0. Los éxitos tienen estado 1. Cada fila cumple su resultado esperado. Los hashes completos están en el [registro JSON de recibos](evidencias/remix-transacciones.json).

| Bloque | Timestamp | Cuenta | Operación y resultado | Estado | Evaluación |
| --- | --- | --- | --- | --- | --- |
| 1 | 1792865781 | A | Objetivo cero: ObjetivoInvalido | 0 | Pasa |
| 2 | 1792865818 | A | Duración cero: DuracionInvalida | 0 | Pasa |
| 3 | 1792865824 | A | Despliegue S: meta 1 ETH, duración 180 s | 1 | Pasa |
| 4 | 1792865830 | A | S: aportar cero, AportacionNula | 0 | Pasa |
| 5 | 1792865830 | A | S: retirada antes del fin, PlazoNoFinalizado | 0 | Pasa |
| 6 | 1792865830 | A | S: devolución antes del fin, PlazoNoFinalizado | 0 | Pasa |
| 7 | 1792865841 | B | S: aportación de B 0.4 ETH | 1 | Pasa |
| 8 | 1792865845 | B | S: segunda aportación de B 0.1 ETH | 1 | Pasa |
| 9 | 1792865852 | C | S: aportación de C 0.5 ETH | 1 | Pasa |
| 10 | 1792865955 | A | Despliegue X: meta 1 ETH, duración 90 s | 1 | Pasa |
| 11 | 1792865965 | B | X: aportación de B 1.2 ETH | 1 | Pasa |
| 12 | 1792865976 | A | Despliegue F: meta 2 ETH, duración 90 s | 1 | Pasa |
| 13 | 1792865990 | B | F: aportación de B 0.2 ETH | 1 | Pasa |
| 14 | 1792865990 | B | F: segunda aportación de B 0.1 ETH | 1 | Pasa |
| 15 | 1792865996 | C | F: aportación de C 0.4 ETH | 1 | Pasa |
| 16 | 1792866030 | C | S: aporte tardío de 1 wei, PlazoFinalizado | 0 | Pasa |
| 17 | 1792866030 | C | S: retirada por C, NoEsOrganizador | 0 | Pasa |
| 18 | 1792866030 | C | S: devolución por C, ObjetivoAlcanzado | 0 | Pasa |
| 19 | 1792866040 | A | S: retirada correcta por A (1 ETH) | 1 | Pasa |
| 20 | 1792866040 | A | S: segunda retirada por A, FondosYaRetirados | 0 | Pasa |
| 21 | 1792866082 | A | X: retirada correcta por A (1.2 ETH) | 1 | Pasa |
| 22 | 1792866082 | A | F: retirada por A, ObjetivoNoAlcanzado | 0 | Pasa |
| 23 | 1792866083 | A | F: devolución sin aporte de A, SinAportacion | 0 | Pasa |
| 24 | 1792866096 | B | F: devolución acumulada de B (0.3 ETH) | 1 | Pasa |
| 25 | 1792866096 | B | F: segunda devolución de B, SinAportacion | 0 | Pasa |
| 26 | 1792866101 | C | F: devolución de C (0.4 ETH) | 1 | Pasa |
| 27 | 1792866109 | C | F: segunda devolución de C, SinAportacion | 0 | Pasa |
| 28 | 1792866109 | C | X: devolución por C, ObjetivoAlcanzado | 0 | Pasa |
| 29 | 1792866114 | A | X: segunda retirada por A, FondosYaRetirados | 0 | Pasa |

Resumen: **29 transacciones**, **14 exitosas** y **15 rechazos esperados**, sin fallos funcionales observados. El detalle del motivo de revert procede de la UI; un recibo por sí solo contiene el estado, no el nombre del error personalizado.

## Eventos realmente observados en los recibos

| Bloque | Campaña | Evento | Dirección | Cantidad en wei |
| --- | --- | --- | --- | --- |
| 7 | S | Aportacion | B | 400000000000000000 |
| 8 | S | Aportacion | B | 100000000000000000 |
| 9 | S | Aportacion | C | 500000000000000000 |
| 11 | X | Aportacion | B | 1200000000000000000 |
| 13 | F | Aportacion | B | 200000000000000000 |
| 14 | F | Aportacion | B | 100000000000000000 |
| 15 | F | Aportacion | C | 400000000000000000 |
| 19 | S | Retirada | A | 1000000000000000000 |
| 21 | X | Retirada | A | 1200000000000000000 |
| 24 | F | Devolucion | B | 300000000000000000 |
| 26 | F | Devolucion | C | 400000000000000000 |

Las direcciones A/B/C se desarrollan arriba. Los topics y data originales están en el JSON de recibos; la [verificación decodificada](evidencias/verificacion-remix.json) conserva los 11 eventos.

## Comprobación del tiempo del bloque

- S: límite **1792866004**. Los cobros prematuros se rechazaron en bloque 5/6, timestamp **1792865830 < L**. El aporte tardío se rechazó en bloque 16, **1792866030 >= L**. La retirada correcta fue en bloque 19, **1792866040 >= L**.
- X: límite **1792866045**. Aportación en bloque 11, **1792865965 < L**; retirada en bloque 21, **1792866082 >= L**.
- F: límite **1792866066**. Última aportación en bloque 15, **1792865996 < L**. Devoluciones en bloques 24 y 26, timestamps **1792866096** y **1792866101**, ambos >= L.

Estas comparaciones se hicieron con los timestamps de los bloques de las transacciones, no con la hora de pulsar botones ni con el reloj del ordenador. No se utilizaron métodos de viaje temporal. No se afirma haber operado exactamente en L en Remix: esa frontera se cubrió en Ganache.

## Estado final consultado en Remix

| Campaña | Total histórico en wei | Saldo contrato | fondosRetirados | aportaciones(B) | aportaciones(C) |
| --- | --- | --- | --- | --- | --- |
| S | 1000000000000000000 | 0 | true | 500000000000000000 | 500000000000000000 |
| X | 1200000000000000000 | 0 | true | 1200000000000000000 | 0 |
| F | 700000000000000000 | 0 | false | 0 | 0 |

En éxito el mapping mantiene el historial; en fracaso se pone a cero al devolver. No confundir total histórico con saldo pendiente. Los datos proceden de [la consulta de estados finales](evidencias/remix-estados-finales.json). No se verificó manualmente el incremento exacto de saldo neto de gas de cada cuenta; ese cálculo sí se cubrió en las pruebas locales.

## Evidencias, verificación y límites

- [Índice de capturas reales](CAPTURAS_PENDIENTES.md). Las capturas 12 en adelante amplían eventos, estados y errores; las primeras son vistas generales con texto pequeño.
- `scripts/consultar_remix.js`: consultas de solo lectura utilizadas, con direcciones de esta sesión. Necesita la misma VM conservada; si se reinicia, cambiar direcciones. No despliega ni envía transacciones.
- `node scripts/verificar_evidencias.cjs`: comprobación local sobre los JSON exportados. Ejecutada con resultado APROBADO: 29 estados esperados, 11 eventos, cantidades, condiciones temporales y estados finales coherentes. Compila el contrato para obtener la ABI con solc 0.8.30/200/Shanghai; no es una nueva ejecución en blockchain.
- El contrato conserva SHA256 `922219a0102b2f5a5a75d6f290276a0dd1a8502bea553d49ecadb1b4519f7d00`. No hubo cambios en Solidity ni en los tests.
- Los errores de consultas exploratorias de terminal (proveedor equivocado, bloque sin transacciones completas y presentación de undefined) no se cuentan como pruebas. Se corrigieron y los JSON se obtuvieron de consultas válidas. No alteraron fondos ni reglas.

Autoría indicada: Zayan Santos Díaz. Queda revisar el contenido para la presentación. No quedan pendientes los escenarios funcionales manuales exigidos. Las pruebas adicionales de receptor que rechaza ETH, reentrada y frontera exacta corresponden únicamente a Ganache.
