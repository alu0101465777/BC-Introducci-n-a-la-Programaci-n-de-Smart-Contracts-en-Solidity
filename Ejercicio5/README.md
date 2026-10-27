# Práctica 1 - Ejercicio 5: Creación de Smart Contract

**Autor:** Zayan Santos Díaz
**Máster:** Máster Interuniversitario en Ciberseguridad (MUniCS) - Universidade de Vigo / Universidade da Coruña
**Asignatura:** Tecnologías de Registro Distribuido y Blockchain (BC)

Esta memoria documenta la resolución del Ejercicio 5, detallando el ciclo de creación de un contrato inteligente en Solidity, desde su diseño hasta su despliegue y pruebas esenciales en Remix IDE.

---

## (1) Análisis y definición del escenario

El escenario elegido es una plataforma de **Financiación de Torneos (Crowdfunding)**.
Para organizar un torneo, se requiere recaudar una cantidad específica de fondos (objetivo) dentro de un periodo de tiempo determinado. 

Se necesita la funcionalidad proporcionada por una blockchain pública como Ethereum para:
* **Transparencia:** Todos los patrocinadores pueden ver cuánto se ha recaudado, el objetivo final y la fecha límite inmutable.
* **Automatización sin confianza (Trustless):** Garantizar que si no se alcanza el objetivo en el tiempo estipulado, los usuarios puedan recuperar sus fondos. Y si se alcanza, los fondos se liberen al creador automáticamente.

---

## (2) Diseño

### Lógica de Negocio
1. El **Organizador** despliega el contrato definiendo el objetivo económico y la duración de la campaña.
2. Los **Participantes** envían fondos (ETH/Wei) al contrato mientras el plazo esté activo.
3. Si se alcanza la fecha límite y el objetivo se ha cumplido, el Organizador puede retirar la totalidad de los fondos.
4. Si se alcanza la fecha límite pero **no** se cumple el objetivo, los Participantes pueden reclamar la devolución de lo aportado.

### Contenido del Contrato Inteligente
* **Variables de Estado principales:** `owner`, `objetivo`, `fechaLimite`, `totalRecaudado`, `fondosRetirados`, y un mapping `aportaciones` para registrar los fondos por usuario.
* **Funciones:** `aportar()`, `retirarFondos()`, `reclamarDevolucion()`.
* **Reglas:** Un modificador `soloPropietario` y validaciones de tiempo (`block.timestamp`).

---

## (3) Implementación

El código se ha programado en Solidity (versión `>=0.8.30`). Se han aplicado buenas prácticas:
* **Eventos:** Emisión de eventos para el frontend en lugar de guardar logs costosos en gas.
* **Seguridad:** Modificación de estados antes de realizar transferencias de fondos para prevenir ataques de *Re-entrancy* (`aportaciones[msg.sender] = 0;`).

*(El código fuente se encuentra en el directorio `contracts/FinanciacionTorneo.sol`)*.

---

## (4) Pruebas (Entorno Remix IDE)

Para demostrar el correcto funcionamiento del contrato, se ha simulado el ciclo de vida completo de la campaña en la **Remix VM**. A continuación se exponen las pruebas clave:

### 4.1 Compilación y Despliegue
El contrato compila sin errores y se despliega correctamente introduciendo los parámetros iniciales en el constructor (ej. objetivo en wei y duración en días).
* **Evidencias:** 
  * Compilación exitosa: ![Compilación en Remix](capturas/01-compilacion-remix.jpg)
  * Despliegue válido: ![Constructor Objetivo Validado](capturas/17-constructor-objetivo-legible.jpg)

### 4.2 Flujo de Aportaciones
Se verificó que el contrato recibe los fondos de diferentes cuentas y los va sumando al `totalRecaudado`, registrando individualmente cuánto puso cada usuario hasta llegar a la meta.
* **Evidencias:** 
  * Recepción de fondos: ![Aportaciones legibles](capturas/14-aportaciones-s-legibles.jpg)
  * Objetivo alcanzado: ![Objetivo exacto](capturas/05-objetivo-exacto-y-limite.jpg)

### 4.3 Retiro y Devolución de Fondos
Se probaron los dos escenarios posibles al finalizar el tiempo de la campaña:
1. **Éxito:** El `owner` solicita la retirada de los fondos. El contrato valida su identidad (`msg.sender`) y le transfiere el dinero.
   * ![Control de Acceso y Retirada](capturas/20-control-acceso-legible.jpg)
2. **Fracaso (Simulación paralela):** Cuando no se llega al objetivo, los patrocinadores reclaman sus fondos y el contrato les devuelve íntegramente su inversión.
   * ![Devolución Exitosa](capturas/11-devolucion-c-final.jpg)

### 4.4 Estado Final
Tras realizar operaciones de depósito o retiro, podemos consultar las variables públicas para certificar que la lógica matemática del contrato es precisa.
* **Evidencia:** ![Estados Finales Legibles](capturas/13-estados
