
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts@5.0.2/token/ERC20/ERC20.sol";

contract MiTokenOpenZeppelin is ERC20 {
    constructor() ERC20("ZayanToken", "ZAY") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}
