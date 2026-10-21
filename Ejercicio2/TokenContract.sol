// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

contract TokenContract {
    address public owner;

    uint256 public tokenPrice = 5 ether;

    struct Receivers {
        string name;
        uint256 tokens;
    }

    mapping(address => Receivers) public users;

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Solo el propietario puede ejecutar esta funcion"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        users[owner].tokens = 100;
    }

    function double(uint _value) public pure returns (uint) {
        return _value * 2;
    }

    function register(string memory _name) public {
        users[msg.sender].name = _name;
    }

    function giveToken(address _receiver, uint256 _amount)
        public
        onlyOwner
    {
        require(
            users[owner].tokens >= _amount,
            "El propietario no tiene suficientes tokens"
        );

        users[owner].tokens -= _amount;
        users[_receiver].tokens += _amount;
    }

    function buyTokens(uint256 _amount) public payable {
        require(_amount > 0, "Debes comprar al menos un token");

        require(
            users[owner].tokens >= _amount,
            "El propietario no tiene suficientes tokens"
        );

        uint256 totalPrice = _amount * tokenPrice;

        require(
            msg.value >= totalPrice,
            "La cantidad de Ether enviada es insuficiente"
        );

        require(
            msg.value == totalPrice,
            "Envia el importe exacto"
        );

        users[owner].tokens -= _amount;
        users[msg.sender].tokens += _amount;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
