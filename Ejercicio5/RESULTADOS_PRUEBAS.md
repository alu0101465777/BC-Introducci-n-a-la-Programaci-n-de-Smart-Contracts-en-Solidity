# Resultados de pruebas ejecutadas

Fecha: 24/10/2026. Ejecución local en Windows, Node.js 24.22.1, pnpm 11.25.0, solc 0.8.30+commit.73712a01.Emscripten.clang, ethers 6.15.0, Ganache 7.9.2. Sin conexiones a redes públicas y sin dinero real.

## Compilación ejecutada

Comando: `node scripts/compile.cjs`. Código de salida **0**. Compilador **0.8.30**, optimizador habilitado, **200** runs, EVM **Shanghai**. Se genera `artifacts/FinanciacionTorneo.json` con ABI y bytecode. Bytecode de ejecución: **1674 bytes**. Sin errores ni advertencias del compilador en esta ejecución.

## Pruebas automatizadas ejecutadas

Comando: `node --test --test-concurrency=1 test/torneo.test.cjs`.

Resultado final observado: **11 tests, 11 aprobados, 0 fallidos, 0 cancelados, 0 omitidos**. Duración de esa ejecución: **3921.2626 ms**. Cada grupo crea una cadena local aislada. Los importes de las pruebas se expresan en wei y no requieren ETH reales.

| Grupo | Comprobaciones realmente ejecutadas | Resultado |
| --- | --- | --- |
| 1 | Constructor: objetivo cero, duración cero, duración que desborda la fecha; getters iniciales y límite respecto al bloque de despliegue | Pasa |
| 2 | Aportaciones positivas y repetidas, dos participantes, acumulado individual, total, saldo y evento | Pasa |
| 3 | Rechazo de cero y aportación después del plazo | Pasa |
| 4 | Retirada y devolución antes del fin; cuenta distinta del organizador tras el fin | Pasa |
| 5 | Meta exacta (100 wei), transferencia al organizador descontando gas, evento, saldo cero, marca; segunda retirada y devolución rechazadas | Pasa |
| 6 | Meta superada (150 wei frente a 100), pago completo, evento; mismos rechazos de repetición y devolución | Pasa |
| 7 | Fracaso (70 frente a 100): retirada rechazada, no aportante rechazado, devolución acumulada de 30 y de 40, eventos, saldos netos de gas, mapping cero, doble devolución rechazada | Pasa |
| 8 | Timestamp L-1: aporte aceptado; L exacto: aporte rechazado (también transacción minada revertida), retirada aceptada | Pasa |
| 9 | Timestamp L exacto: devolución aceptada en fracaso | Pasa |
| 10 | Organizador contractual rechaza ETH: EnvioFallido, transacción revertida conserva marca y saldo; después acepta y cobra | Pasa |
| 11 | Participante contractual rechaza ETH: conserva derecho de devolución; al aceptar intenta reentrar, falla la segunda devolución y permanece el saldo del otro participante | Pasa |

Los rechazos se validan principalmente con `staticCall` (eth_call) y se comprueba el nombre del error personalizado. No son todos transacciones minadas. Las operaciones exitosas se envían y se esperan sus recibos; también se envían transacciones fallidas para el aporte en L y para ambos receptores que rechazan ETH. Los saldos se consultan directamente al proveedor, sin depender de caché; los pagos a cuentas se verifican descontando la comisión real del recibo. Los eventos se inspeccionan por nombre y cantidad. No se afirma cobertura formal ni exhaustiva.

## Incidencias del entorno

La primera instalación falló por permisos de symlink del sandbox. La instalación autorizada descargó las dependencias, pero pnpm terminó con advertencia/error de scripts opcionales bloqueados (`bufferutil`, `utf-8-validate`). Se desactivan explícitamente en `pnpm-workspace.yaml`; no son necesarias para estas pruebas. Ganache avisó de que el binario nativo µWS no coincide con Node 24 y utilizó su implementación JavaScript.

El primer intento de los tests produjo **0/11** por acceso denegado a los archivos temporales de Ganache; no se identificó como fallo del contrato. Se repitió con autorización fuera del sandbox y el resultado fue **11/11**. La compilación no necesitó esa excepción. Estas incidencias no se ocultan ni se presentan como pruebas aprobadas.

Tras fijar `allowBuilds` a false para las dos dependencias opcionales, se ejecutó `pnpm install --frozen-lockfile`: **código de salida 0**, lockfile actualizado y dependencias ya instaladas (561 ms según pnpm). Esta configuración no modifica el contrato ni los tests.

## Continuación: revisión y pruebas reales en Remix

Se revisaron contrato, compilador, tests y documentación. No se encontró un problema concreto que exigiera cambiar Solidity o las pruebas. Se conservaron ambos. Las 11 pruebas locales anteriores no se presentan como una nueva ejecución. Se corrigieron estados de documentación y se añadieron campos de autoría.

Se abrió https://remix.ethereum.org, que redirigió a https://app.remix.live. En Remix 2.6.8 se importó el contrato original y se compiló con **0.8.30+commit.73712a01**, optimizador **200**, EVM **Shanghai**. Se seleccionó **Remix VM Shanghai**, sin wallet externa, redes públicas ni dinero real.

Se ejecutaron mediante los botones **29 transacciones**: 14 exitosas (3 despliegues válidos, 7 aportaciones, 2 retiradas y 2 devoluciones) y 15 revertidas esperadas. Los escenarios funcionales exigidos están comprobados. Los errores personalizados se observaron en el terminal. Los estados, timestamps y eventos se consultaron en su proveedor interno con comandos de solo lectura. El [registro detallado](REGISTRO_REMIX.md) incluye parámetros reales, cuentas, instancias, bloques y resultados; los JSON obtenidos se conservan en evidencias/.

El segundo exacto L-1/L sigue validado en Ganache. En Remix se verificaron operaciones anteriores y posteriores al límite, sin afirmar ejecución en el segundo exacto L. El rechazo de ETH y la reentrada se probaron exclusivamente en los tests locales.

Las consultas iniciales requirieron corregir el espacio de nombres a ethers.ethers.provider y consultar bloques completos. El runner mostró en algunos comandos un error de presentación de undefined después de emitir el resultado. Estas incidencias no son pruebas del contrato y no se contaron como aprobadas; los recibos y estados exportados se leyeron correctamente. No hubo cambios en Solidity.

Las [capturas reales](CAPTURAS_PENDIENTES.md) muestran la sesión. Las primeras vistas generales tienen texto pequeño; los JSON y el registro conservan cantidades y timestamps exactos. No se han generado imágenes simuladas. Autoría indicada: Zayan Santos Díaz. Queda revisar la entrega antes de presentarla.

## Comprobación de evidencias y entrega

En la continuación se ejecutó `node scripts/verificar_evidencias.cjs`: salida 0, APROBADO. El script recompiló el contrato para obtener la ABI y comprobó los 29 recibos exportados, 11 eventos, cantidades, condiciones temporales y estados finales. Es una verificación local de evidencias de Remix, separada de los 11 tests Ganache ya aprobados.

`python scripts/preparar_entrega.py` crea y reabre el ZIP, comprueba CRC, igualdad de contenido con la carpeta de entrega, hashes de cada archivo y todos los enlaces locales de Markdown. No incluye outputs dentro de sí misma ni node_modules, temporales, cachés u otros ZIP. El manifiesto SHA256SUMS.txt está dentro del paquete. Los originales se conservan.
