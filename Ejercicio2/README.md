# Ejercicio 2: TokenContract

Práctica 1 de Tecnologías de Registro Distribuido y Blockchain (MUNICS).

**Autor:** Zayan Santos Díaz  
**Solidity:** 0.8.30  
**Entorno de pruebas:** Remix VM, con ETH simulado.

## Objetivo

Completar un contrato que permita comprar tokens al propietario por 5 ETH cada uno, rechazar compras con pago insuficiente o sin tokens disponibles y consultar el saldo de ETH del contrato.

## Funcionamiento

Al desplegar el contrato, la cuenta que lo crea se convierte en propietaria y recibe 100 tokens. El mapping `users` guarda el nombre y el saldo de tokens asociado a cada dirección.

| Función | Descripción |
| --- | --- |
| `double(_value)` | Devuelve el doble del número indicado, sin modificar el estado. |
| `register(_name)` | Registra o actualiza el nombre de quien llama. |
| `giveToken(_receiver, _amount)` | Permite únicamente al propietario entregar sus tokens a otra dirección. |
| `buyTokens(_amount)` | Compra tokens enviando el importe exacto de ETH. |
| `getContractBalance()` | Consulta el saldo del contrato en wei. |

`buyTokens` es `payable`: admite ETH junto con la llamada. Comprueba que la cantidad sea positiva, que el propietario tenga tokens suficientes y que el pago sea correcto. Después descuenta los tokens del propietario y los añade al comprador. El ETH permanece en el contrato; no se transfiere automáticamente al propietario.

Se exige el importe exacto para evitar retener pagos superiores al precio de compra. El coste del gas se paga aparte. Este contrato mantiene una contabilidad sencilla de tokens; no implementa el estándar ERC-20 ni una función de retirada de ETH.

## Ejecución en Remix

1. Crear `TokenContract.sol` y pegar el código del contrato.
2. Compilar con Solidity 0.8.30.
3. Seleccionar Remix VM y desplegar con Value igual a 0. La cuenta del despliegue será A, el propietario.
4. Seleccionar una segunda cuenta B en Account y ejecutar `register("Comprador")` con Value igual a 0.
5. Para comprar dos tokens desde B, establecer Value en 10 y la unidad en ether, e invocar `buyTokens(2)`.
6. Consultar `users` con la dirección de B para comprobar sus tokens.
7. Consultar `getContractBalance()` para ver el ETH acumulado en wei.

La cuenta seleccionada en Account realiza la transacción. Escribir una dirección en `users` solamente consulta sus datos.

## Pruebas realizadas

| Prueba | Operación y resultado observado | Evidencia |
| --- | --- | --- |
| Registro de B | Se registra Comprador desde Account 2; inicialmente tiene 0 tokens. | [Captura](Capturas/01-registro-comprador.png) |
| Compra correcta | B compra 2 tokens por 10 ETH. La transacción se completa y su saldo pasa a 2 tokens. | [Captura](Capturas/02-compra-correcta.png) |
| Pago insuficiente | B intenta comprar 2 tokens pagando 5 ETH. Se muestra «La cantidad de Ether enviada es insuficiente» y conserva 2 tokens. | [Captura](Capturas/03-pago-insuficiente.png) |
| Inventario insuficiente | Se intenta comprar 101 tokens con Value igual a 0. Se muestra «El propietario no tiene suficientes tokens». | [Captura](Capturas/04-tokens-insuficientes.png) |
| Saldo del contrato | La consulta devuelve 40000000000000000000 wei, equivalentes a 40 ETH. | [Captura](Capturas/05-saldo-contrato.png) |

El saldo final de 40 ETH corresponde a todas las compras aceptadas durante la sesión, incluidas las pruebas previas realizadas desde A. No corresponde únicamente a la compra de dos tokens de B. Cuando compra el propio propietario, el descuento y el abono de tokens se aplican a la misma dirección y su saldo de tokens no cambia, aunque el ETH sí entra en el contrato.

En la prueba de inventario insuficiente no hace falta enviar 505 ETH: la comprobación del inventario se ejecuta antes que la del pago. Las operaciones rechazadas revierten sus cambios y el importe enviado no se incorpora al saldo del contrato; una transacción ejecutada puede consumir gas aunque falle.

## Archivos para entregar

- `TokenContract.sol`: código fuente del contrato.
- `README.md`: explicación y pruebas.
- `capturas/`: cinco capturas originales de las pruebas, sin modificar su contenido.
