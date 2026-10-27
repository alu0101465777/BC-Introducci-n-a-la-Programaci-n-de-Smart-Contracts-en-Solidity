# Casos de uso

```mermaid
flowchart LR
    O[Organizador]
    P[Participante]
    subgraph C[Contrato FinanciacionTorneo]
      D([Crear campaña: meta y duración])
      A([Aportar ETH antes del límite])
      Q([Consultar campaña y aportaciones])
      R([Retirar tras el límite si hay éxito])
      V([Solicitar devolución tras el límite si fracasa])
    end
    O --- D
    O --- Q
    O --- R
    O --- A
    P --- A
    P --- Q
    P --- V
```

El organizador también puede participar y solicitar devolución si aportó a una campaña fallida. Cualquier dirección puede consultar. Cada despliegue crea una campaña independiente. El reloj no es un actor que ejecute pagos: solo condiciona la autorización de las llamadas. La retirada exitosa y las devoluciones por fracaso son mutuamente excluyentes.
