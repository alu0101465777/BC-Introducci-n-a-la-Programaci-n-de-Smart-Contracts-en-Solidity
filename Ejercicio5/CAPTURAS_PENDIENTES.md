# Capturas reales de Remix VM

Estado actualizado: se han ejecutado los escenarios funcionales y se han guardado capturas reales del navegador. No hay imágenes simuladas. Los archivos conservan nombres numerados.

## Evidencias principales legibles

Las capturas 12 en adelante se tomaron acercando el terminal a la entrada correspondiente o mostrando resultados compactos obtenidos de consultas reales. Algunos textos largos quedan fuera del ancho de la ventana; los nombres de los errores, cantidades y estados relevantes se pueden leer. Los hashes, direcciones completas y timestamps se conservan además en los JSON enlazados desde [REGISTRO_REMIX.md](REGISTRO_REMIX.md).

- [12-eventos-y-timestamps.jpg](capturas/12-eventos-y-timestamps.jpg): Eventos de retiradas y devoluciones, con cantidades y timestamps consultados en recibos de Remix.
- [13-estados-finales-legibles.jpg](capturas/13-estados-finales-legibles.jpg): Estados finales S/X/F: totales, saldos cero, marcas y aportaciones de B/C.
- [14-aportaciones-s-legibles.jpg](capturas/14-aportaciones-s-legibles.jpg): Aportaciones de S en bloques 7, 8 y 9: 0.4, 0.1 y 0.5 ETH.
- [15-aportacion-cero-rechazada.jpg](capturas/15-aportacion-cero-rechazada.jpg): Rechazo AportacionNula observado en el terminal.
- [16-retirada-antes-plazo.jpg](capturas/16-retirada-antes-plazo.jpg): Retirada prematura: PlazoNoFinalizado.
- [17-constructor-objetivo-legible.jpg](capturas/17-constructor-objetivo-legible.jpg): Constructor con objetivo cero: ObjetivoInvalido.
- [18-constructor-duracion-legible.jpg](capturas/18-constructor-duracion-legible.jpg): Constructor con duración cero: DuracionInvalida.
- [19-aportacion-fuera-plazo-legible.jpg](capturas/19-aportacion-fuera-plazo-legible.jpg): Aportación fuera de plazo: PlazoFinalizado.
- [20-control-acceso-legible.jpg](capturas/20-control-acceso-legible.jpg): Retirada por otra cuenta: NoEsOrganizador.
- [21-devolucion-exito-rechazada.jpg](capturas/21-devolucion-exito-rechazada.jpg): Devolución en campaña exitosa: ObjetivoAlcanzado.
- [22-sin-aportacion-rechazada.jpg](capturas/22-sin-aportacion-rechazada.jpg): Devolución de A sin aportación: SinAportacion.
- [23-segunda-retirada-rechazada.jpg](capturas/23-segunda-retirada-rechazada.jpg): Segunda retirada: FondosYaRetirados.
- [24-retirada-fracaso-rechazada.jpg](capturas/24-retirada-fracaso-rechazada.jpg): Retirada en campaña fallida: ObjetivoNoAlcanzado.
- [25-segunda-devolucion-rechazada.jpg](capturas/25-segunda-devolucion-rechazada.jpg): Segunda devolución de B: SinAportacion.
- [26-devolucion-antes-plazo.jpg](capturas/26-devolucion-antes-plazo.jpg): Devolución antes del plazo: PlazoNoFinalizado.
- [27-configuracion-compilador-legible.jpg](capturas/27-configuracion-compilador-legible.jpg): Compilador 0.8.30, EVM Shanghai, optimización activada y 200 runs.

## Vistas generales de la sesión

Las primeras capturas se conservan como contexto. Tienen texto pequeño y algunas muestran aún la vista inmediatamente anterior al desplazamiento; no se cuentan como evidencia independiente de cada caso por su nombre de archivo. Para validar un resultado utilizar el registro, los recibos y las capturas específicas anteriores.

- [Vista general 01](capturas/01-compilacion-remix.jpg)
- [Vista general 02](capturas/02-constructor-objetivo-cero.jpg)
- [Vista general 03](capturas/03-constructor-duracion-cero.jpg)
- [Vista general 04](capturas/04-rechazos-antes-plazo.jpg)
- [Vista general 05](capturas/05-objetivo-exacto-y-limite.jpg)
- [Vista general 06](capturas/06-exceso-objetivo.jpg)
- [Vista general 07](capturas/07-campana-fallida-aportaciones.jpg)
- [Vista general 08](capturas/08-rechazos-fin-y-acceso.jpg)
- [Vista general 09](capturas/09-retirada-s-y-segunda-rechazada.jpg)
- [Vista general 10](capturas/10-devolucion-b-y-repeticion.jpg)
- [Vista general 11](capturas/11-devolucion-c-final.jpg)

## Qué queda pendiente

No quedan pendientes los escenarios manuales funcionales exigidos. El instante exacto L-1/L, reentrada y receptor que rechaza ETH se validaron en los tests Ganache, no se presentan como pruebas Remix. Si se solicitan expresamente nuevas evidencias manuales de esos casos adicionales, habrá que ejecutarlos antes de marcarlos como realizados.

Autoría indicada: Zayan Santos Díaz. Queda revisar la entrega antes de presentarla. El guion de reproducción sigue disponible en [PRUEBAS_REMIX.md](PRUEBAS_REMIX.md).
