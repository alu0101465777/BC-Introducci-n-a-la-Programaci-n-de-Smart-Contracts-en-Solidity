# Ejercicio 3: MetaMask y Sepolia

Transferencia ejecutada en Ethereum Sepolia y verificada en Sepolia Etherscan.

| Campo | Valor |
| --- | --- |
| Cuenta emisora | `0x0E45D3335c8D8f82aD3034188b2c5E34437D0814` |
| Cuenta receptora | `0x8ab53e70CCBACb3b6b343d95927b1F748acF0a9E` |
| Importe real | **0,049533370986312216 Sepolia ETH** |
| Estado observado | **Success**, con 2 confirmaciones al realizar la captura |
| Bloque | `11985280` |
| Fecha UTC | 24/10/2026, 17:32:24 |
| Comisión | `0.0003069000067518 ETH` de Sepolia |

Hash: `0x780c8fe703a1bc4a096f944fd8bc33761eaa4d710ced5bc8909274b8bfd70ab5`.

[Confirmación de la transferencia en Etherscan](https://sepolia.etherscan.io/tx/0x780c8fe703a1bc4a096f944fd8bc33761eaa4d710ced5bc8909274b8bfd70ab5).

La cuenta emisora recibió previamente **0,05 Sepolia ETH** del faucet de Google Cloud. [Ingreso verificado en Etherscan](https://sepolia.etherscan.io/tx/0x415a52832fba6cea0f591c0dcea7a51213fdd54dd56f243e6582800eb8f24fef).

## Evidencias

Capturas auténticas en `evidencias/`:

- `01-faucet-bloqueado.jpg`: rechazo inicial del faucet.
- `02-sepolia-sin-fondos.jpg`: estado inicial de la cuenta emisora, antes del ingreso.
- `03-recepcion-005-sepolia-eth.jpg`: ingreso de **0,05 Sepolia ETH**.
- `04-transferencia-cuentas-propias.jpg`: detalle del envío y estado Success.
- `05-saldo-cuenta-destinataria.jpg`: saldo recibido y transacción de entrada.

El importe documentado es el registrado en la blockchain. Las confirmaciones indicadas corresponden al momento de la captura.
