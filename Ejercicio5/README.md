# Ejercicio 5: Financiación de un torneo de fútbol

**Autor:** Zayan Santos Díaz  
**Asignatura:** Tecnologías de Registro Distribuido y Blockchain  
**Práctica 1:** Introducción a la programación de smart contracts en Solidity

## 1. Análisis del escenario

El contrato permite recaudar fondos para organizar un torneo de fútbol. El organizador fija una cantidad mínima y un plazo. Los participantes aportan ETH y, al finalizar el plazo, pueden darse dos situaciones:

- Si se alcanza el objetivo, el organizador puede retirar los fondos.
- Si no se alcanza, cada participante puede recuperar su aportación.

La blockchain permite mantener el dinero bajo unas reglas públicas y verificables. Los participantes no dependen de que el organizador autorice las devoluciones y este no puede cambiar las condiciones después del despliegue.

El contrato gestiona la financiación, pero no garantiza que el torneo llegue a celebrarse. Las pruebas se realizaron en Remix VM con ETH simulado.

## 2. Diseño

### Usuarios

| Usuario | Operaciones |
| --- | --- |
| Organizador | Despliega la campaña y retira los fondos si se alcanza la meta después del plazo. También puede aportar. |
| Participante | Aporta antes del plazo y solicita su devolución si la campaña fracasa. |
| Cualquier dirección | Puede consultar la información pública del contrato. |

### Datos del contrato

| Variable | Función |
| --- | --- |
| `organizador` | Dirección que despliega el contrato y puede retirar los fondos si la campaña tiene éxito. |
| `objetivo` | Cantidad mínima que debe recaudarse, expresada en wei. |
| `fechaLimite` | Momento en el que termina el plazo de aportaciones. |
| `totalRecaudado` | Total histórico de las aportaciones válidas. |
| `aportaciones` | Mapping que guarda la cantidad aportada por cada dirección. |
| `fondosRetirados` | Indica si el organizador ya ha retirado los fondos. |

El organizador, el objetivo y la fecha límite son inmutables.

### Funciones y reglas de funcionamiento

- **Constructor:** recibe el objetivo en wei y la duración en segundos. Rechaza objetivos y duraciones iguales a cero.
- **`aportar()`:** permite enviar ETH antes del plazo. La cantidad debe ser positiva. Una misma cuenta puede aportar varias veces y sus aportaciones se acumulan.
- **`retirarFondos()`:** permite retirar el total recaudado únicamente al organizador, después del plazo y si se alcanza la meta. Solo puede ejecutarse correctamente una vez.
- **`solicitarDevolucion()`:** permite recuperar la aportación acumulada después del plazo si no se alcanza la meta. No permite cobrar dos veces la misma aportación.

Se admite superar el objetivo y el exceso también se entrega al organizador. Alcanzar la meta no cierra anticipadamente la campaña.

Los pagos no se ejecutan solos al terminar el plazo: el organizador o el participante deben llamar a la función correspondiente.

## 3. Implementación

El código completo está en [FinanciacionTorneo.sol](contracts/FinanciacionTorneo.sol).

Se utiliza Solidity **0.8.30**. El contrato incluye funciones `payable`, un mapping de aportaciones, eventos y errores personalizados.

Los eventos `Aportacion`, `Retirada` y `Devolucion` registran la dirección y la cantidad de cada operación.

Antes de enviar ETH se actualiza el estado del contrato: se marca la retirada o se pone a cero la aportación del usuario. Después se realiza el envío mediante `call`. Si el envío falla, la operación revierte y se conserva el derecho a cobrar. Esto evita repetir el mismo pago mediante reentrada.

### Optimización de gas

Se aplican las siguientes decisiones:

- Variables `immutable` para los datos que no cambian después del despliegue.
- Errores personalizados para indicar los rechazos sin utilizar mensajes largos.
- Devoluciones individuales, evitando recorrer todos los participantes en una sola transacción.
- Eventos para registrar el historial sin mantener un array adicional.
- Optimizador del compilador activado con **200 runs** y destino EVM **Shanghai**.

No se ha realizado una comparación cuantitativa del consumo de gas frente a otras versiones.

## 4. Pruebas en Remix

Las pruebas documentadas se realizaron en **Remix VM Shanghai**, con Solidity **0.8.30** y ETH simulado.

Se utilizaron tres cuentas: A como organizador y B y C como participantes. Se desplegaron tres campañas independientes.

### Aportaciones, retirada y devolución

| Campaña | Aportaciones | Resultado |
| --- | --- | --- |
| Objetivo exacto: 1 ETH | B aporta 0,4 + 0,1 ETH y C aporta 0,5 ETH. | A retira 1 ETH después del plazo. |
| Objetivo superado: 1 ETH | B aporta 1,2 ETH. | A retira los 1,2 ETH completos después del plazo. |
| Objetivo no alcanzado: 2 ETH | B aporta 0,3 ETH y C aporta 0,4 ETH. | B recupera 0,3 ETH y C recupera 0,4 ETH. |

Las aportaciones repetidas de B y la aportación de C aparecen en los eventos de la primera campaña:

![Aportaciones de la campaña](capturas/14-aportaciones-s-legibles.jpg)

Las retiradas y devoluciones se comprobaron consultando los eventos y sus cantidades:

![Eventos de retirada y devolución](capturas/12-eventos-y-timestamps.jpg)

Al finalizar, las tres campañas tienen saldo cero. Las campañas exitosas muestran `fondosRetirados = true`. En la campaña fallida, las aportaciones pendientes de B y C quedan a cero después de las devoluciones.

`totalRecaudado` conserva el total histórico; no representa el saldo restante del contrato.

![Estados finales de las campañas](capturas/13-estados-finales-legibles.jpg)

### Restricciones

También se comprobaron operaciones que debían rechazarse:

| Operación | Error esperado y observado |
| --- | --- |
| Objetivo cero | `ObjetivoInvalido` |
| Duración cero | `DuracionInvalida` |
| Aportación de cero ETH | `AportacionNula` |
| Retirada o devolución antes del plazo | `PlazoNoFinalizado` |
| Aportación fuera de plazo | `PlazoFinalizado` |
| Retirada desde otra cuenta | `NoEsOrganizador` |
| Retirada de una campaña fallida | `ObjetivoNoAlcanzado` |
| Devolución de una campaña exitosa | `ObjetivoAlcanzado` |
| Devolución sin aportación pendiente | `SinAportacion` |
| Segunda retirada | `FondosYaRetirados` |

Por ejemplo, una aportación realizada después del plazo se rechaza con `PlazoFinalizado`:

![Aportación fuera de plazo](capturas/19-aportacion-fuera-plazo-legible.jpg)

Si una cuenta distinta del organizador intenta retirar los fondos, se obtiene `NoEsOrganizador`:

![Control de acceso](capturas/20-control-acceso-legible.jpg)

### Resultado

La sesión documentada contiene **29 transacciones: 14 exitosas y 15 rechazos esperados**. Se comprobaron las aportaciones, las retiradas, las devoluciones y las restricciones de plazo y acceso.

Las transacciones se ejecutaron mediante la interfaz de Remix, manejada con automatización de navegador. Los eventos y estados se consultaron en su terminal.
