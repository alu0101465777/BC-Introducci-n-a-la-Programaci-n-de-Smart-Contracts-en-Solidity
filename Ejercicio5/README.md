# Financiación de un torneo de fútbol

Práctica universitaria, ejercicio 5, trabajo de dos personas. El PDF se utiliza como enunciado académico; las reglas concretas implementadas son las solicitadas en este proyecto. No se han realizado publicaciones, envíos ni despliegues en redes públicas.

Autor: **Zayan Santos Díaz**

Estado: contrato y tests conservados. Los escenarios funcionales S, X y F se han ejecutado mediante la interfaz de Remix VM Shanghai. Véase el [registro real de Remix](REGISTRO_REMIX.md), con cuentas, instancias, bloques y resultados. El segundo exacto del límite se validó en Ganache, no manualmente en Remix.

## Escenario y justificación

Un organizador necesita financiar un torneo. Al desplegar fija un objetivo en wei y un plazo en segundos. Los participantes depositan ETH; si se logra la meta, el organizador cobra después del plazo; si se fracasa, cada participante recupera su aportación.

Una blockchain pública permite compartir un depósito verificable entre personas que no necesitan confiar la custodia a un administrador. Las reglas, las aportaciones y los eventos son comprobables. Esto tiene costes de gas, exposición pública y dependencia de las claves. Para un grupo que ya confía en su organizador, una cuenta bancaria y una base de datos pueden resultar más sencillas. El contrato no acredita que el torneo se celebre ni controla cómo se gastan los fondos retirados.

## Archivos y ejecución

- `contracts/FinanciacionTorneo.sol`: contrato independiente, sin bibliotecas externas.
- `scripts/compile.cjs`: compilación y artefacto con ABI y bytecode.
- `test/torneo.test.cjs`: pruebas locales y contrato receptor auxiliar incluido como fuente de prueba.
- `CASOS_DE_USO.md`: diagrama y actores.
- `PRUEBAS_REMIX.md`: guion para reproducir las pruebas manuales.
- `RESULTADOS_PRUEBAS.md`: resultados realmente ejecutados.
- `CAPTURAS_PENDIENTES.md`: índice de capturas reales disponibles y límites de la evidencia visual.
- `REGISTRO_REMIX.md`: sesión real de pruebas con parámetros y resultados.
- `evidencias/`: recibos, eventos y estados finales consultados en Remix VM.
- `scripts/preparar_entrega.py`: prepara y comprueba la carpeta y el ZIP de entrega.
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.gitignore`: entorno reproducible y exclusiones. Las builds nativas opcionales se desactivan explícitamente.

Requiere Node.js (se ha probado con 24.22.1) y pnpm (11.25.0). Desde esta carpeta:

```sh
pnpm install --frozen-lockfile
pnpm run compile
pnpm test
```

También se puede ejecutar `node scripts/compile.cjs` y `node --test --test-concurrency=1 test/torneo.test.cjs` una vez instaladas las dependencias. No hace falta arrancar un servidor ni configurar claves: cada prueba crea una blockchain Ganache independiente, con cuentas ficticias, y la cierra al acabar. Compilador fijado a 0.8.30, optimizador activado con 200 ejecuciones, EVM Shanghai. `artifacts/` se regenera al compilar. El lockfile fija las dependencias transitivas.

## Usuarios, datos y funciones

| Dato público | Significado |
| --- | --- |
| `organizador` | Cuenta que despliega; dirección payable immutable |
| `objetivo` | Meta positiva, en wei; immutable |
| `fechaLimite` | Timestamp de despliegue + duración; immutable |
| `totalRecaudado` | Suma histórica de aportaciones válidas |
| `aportaciones(direccion)` | Acumulado por dirección; pasa a cero al devolver |
| `fondosRetirados` | Impide cobrar dos veces la campaña exitosa |

| Función | Actor, condiciones y efectos |
| --- | --- |
| Constructor(meta, duración) | Organizador; ambos positivos y fecha representable |
| `aportar()` payable | Cualquier dirección, también organizador; valor > 0 y timestamp < límite; acumula y emite `Aportacion` |
| `retirarFondos()` | Solo organizador; timestamp >= límite, total >= meta y no retirado; cobra todo el total, incluido exceso; emite `Retirada` |
| `solicitarDevolucion()` | Cada aportante; timestamp >= límite, total < meta y saldo propio > 0; devuelve acumulado y emite `Devolucion` |
| Getters automáticos | Cualquiera puede consultar datos, sin transacción |

Cada evento lleva la dirección indexada y la cantidad en wei. Los errores personalizados permiten reconocer el motivo de un rechazo sin cadenas largas.

## Reglas y seguridad

1. El despliegue fija la identidad del organizador, la meta y el final; no existen setters.
2. Las aportaciones positivas pueden repetirse y superar la meta; alcanzar la meta no cierra anticipadamente la campaña.
3. En el segundo exacto del límite ya no se puede aportar y ya se puede liquidar. Se utiliza el timestamp del bloque de inclusión, no la hora de pulsar un botón.
4. El éxito depende de `totalRecaudado >= objetivo`; no del saldo actual del contrato. El total histórico no disminuye con las devoluciones, evitando alterar la clasificación de la campaña.
5. La retirada marca primero `fondosRetirados=true`; la devolución pone primero a cero el saldo individual. Después se usa `call` y se comprueba su booleano. Si el receptor rechaza ETH, `EnvioFallido` revierte toda la operación y conserva el derecho a reintentar.
6. La reentrada no puede repetir el cobro porque los efectos ya están aplicados. Las ramas de éxito y fracaso son excluyentes. No se añade un cerrojo de reentrada para mantener el ejemplo sencillo; cambiar estas funciones exige revisar esa propiedad.
7. No hay pagos automáticos, bucles de participantes, recepción genérica de ETH, cancelaciones ni comisiones. Un envío directo sin llamar a `aportar()` revierte normalmente.

El patrón de comprobaciones, efectos e interacciones y la evitación de bucles se apoyan en la [documentación de seguridad de Solidity 0.8.30](https://docs.soliditylang.org/en/v0.8.30/security-considerations.html).

## Gas y límites de las optimizaciones

- `immutable` introduce los tres valores fijos en el código desplegado y evita leerlos de almacenamiento mutable. Puede aumentar el bytecode; no significa coste cero.
- Errores personalizados evitan incluir mensajes largos y reducen datos de revert respecto a cadenas. Una transacción revertida sigue consumiendo gas.
- El mapping evita mantener y recorrer un array de participantes. Cada devolución tiene trabajo O(1), independiente del número de aportantes; cada participante paga su transacción.
- Se guarda la cantidad a devolver en una variable local antes de borrar el mapping. No se añade almacenamiento para enumerar usuarios: los eventos sirven para consultar el historial fuera del contrato.
- Optimizador con 200 ejecuciones: equilibrio de coste de despliegue y ejecución, sin afirmar que sea óptimo para cualquier uso. No se ha realizado una comparativa de gas con variantes.
- Se conservan las comprobaciones aritméticas de Solidity; no se usa `unchecked` ni tipos pequeños por una supuesta reducción automática de gas.
- Los eventos cuestan gas; no sustituyen el estado que el contrato necesita para decidir pagos. Las llamadas externas y las primeras escrituras del mapping siguen teniendo coste.

## Limitaciones y decisiones

El contrato representa una única campaña, no es actualizable, no remunera aportaciones y no garantiza el torneo. La pérdida de la clave del organizador o de un aportante puede dejar su dinero bloqueado. Un contrato receptor que siempre rechace ETH no podrá cobrar; no hay cambio de beneficiario. No hay caducidad para solicitar el pago después del plazo. Los datos son públicos. El timestamp depende del consenso y no sirve para cronometraje deportivo preciso.

ETH forzado mediante mecanismos que no llaman a `aportar()` no cuenta para la meta. Se retira únicamente `totalRecaudado`; un exceso forzado queda bloqueado, también tras devoluciones. Es una limitación consciente para evitar funciones ajenas al ejercicio. El mapping no es enumerable y no existe lista on-chain de participantes. Las pruebas son educativas y no constituyen una auditoría para usar fondos reales.

## Autoría y entrega

Autor: Zayan Santos Díaz. No se atribuye un reparto de trabajo. El autor debe revisar y comprender la solución antes de presentarla.

Desde la raíz, `python scripts/preparar_entrega.py` genera `outputs/Ejercicio5-entrega/` y `outputs/Ejercicio5-entrega.zip`. Comprueba contenido, CRC y enlaces locales y excluye dependencias, cachés, temporales y otros ZIP. Los originales se conservan. La carpeta outputs no se incluye dentro del paquete.

## Guion breve para defenderlo

«El contrato custodia las aportaciones con reglas públicas. Quien despliega es el organizador y fija meta y duración. Cada aportación suma al total y al saldo de su dirección. Al acabar el plazo, el total histórico determina una sola rama: si alcanza la meta, cobra el organizador una vez; si no, cada persona pide su devolución. El tiempo no ejecuta transacciones: alguien debe llamar. Antes de enviar ETH consumimos el derecho de cobro; si falla el envío se revierte todo. Usamos inmutables, errores personalizados y devoluciones individuales para reducir costes sin complicar el ejemplo».
