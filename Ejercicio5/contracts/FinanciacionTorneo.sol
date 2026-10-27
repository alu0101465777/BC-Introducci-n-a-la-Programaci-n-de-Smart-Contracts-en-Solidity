// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title Financiacion colectiva de un torneo de futbol
contract FinanciacionTorneo {
    address payable public immutable organizador;
    uint256 public immutable objetivo;
    uint256 public immutable fechaLimite;
    /// @dev Total historico: no disminuye al devolver aportaciones.
    uint256 public totalRecaudado;
    bool public fondosRetirados;
    mapping(address => uint256) public aportaciones;

    error ObjetivoInvalido();
    error DuracionInvalida();
    error AportacionNula();
    error PlazoFinalizado();
    error PlazoNoFinalizado();
    error NoEsOrganizador();
    error ObjetivoNoAlcanzado();
    error ObjetivoAlcanzado();
    error FondosYaRetirados();
    error SinAportacion();
    error EnvioFallido();

    event Aportacion(address indexed participante, uint256 cantidad);
    event Retirada(address indexed organizador, uint256 cantidad);
    event Devolucion(address indexed participante, uint256 cantidad);

    constructor(uint256 objetivoWei, uint256 duracionSegundos) {
        if (objetivoWei == 0) revert ObjetivoInvalido();
        if (duracionSegundos == 0 || duracionSegundos > type(uint256).max - block.timestamp)
            revert DuracionInvalida();
        organizador = payable(msg.sender);
        objetivo = objetivoWei;
        fechaLimite = block.timestamp + duracionSegundos;
    }

    function aportar() external payable {
        if (block.timestamp >= fechaLimite) revert PlazoFinalizado();
        if (msg.value == 0) revert AportacionNula();
        aportaciones[msg.sender] += msg.value;
        totalRecaudado += msg.value;
        emit Aportacion(msg.sender, msg.value);
    }

    function retirarFondos() external {
        if (msg.sender != organizador) revert NoEsOrganizador();
        if (block.timestamp < fechaLimite) revert PlazoNoFinalizado();
        if (totalRecaudado < objetivo) revert ObjetivoNoAlcanzado();
        if (fondosRetirados) revert FondosYaRetirados();
        fondosRetirados = true;
        uint256 cantidad = totalRecaudado;
        (bool enviado, ) = organizador.call{value: cantidad}("");
        if (!enviado) revert EnvioFallido();
        emit Retirada(organizador, cantidad);
    }

    function solicitarDevolucion() external {
        if (block.timestamp < fechaLimite) revert PlazoNoFinalizado();
        if (totalRecaudado >= objetivo) revert ObjetivoAlcanzado();
        uint256 cantidad = aportaciones[msg.sender];
        if (cantidad == 0) revert SinAportacion();
        aportaciones[msg.sender] = 0;
        (bool enviado, ) = payable(msg.sender).call{value: cantidad}("");
        if (!enviado) revert EnvioFallido();
        emit Devolucion(msg.sender, cantidad);
    }
}
