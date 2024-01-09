// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor () {
        owner = msg.sender;
    }

    // list items

    struct Item {
        uint id;
        string name;
        string category;
        string image;
        uint cost;
        uint rating;
        uint stock;
    }

    mapping (uint => Item) public items;

    event List(string name,uint cost, uint quantity);

    function list(
        uint _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint _cost,
        uint _rating,
        uint _stock
        ) public onlyOwner{

            // only Owner can add items
            

            // Create Item List
            Item memory item = Item(
                _id,
                _name,
                _category,
                _image,
                _cost,
                _rating,
                _stock
            );

            // saving to blockchain
            items[_id] = item;

            emit List(_name,_cost,_stock);
    }




    // Buy Products 
    struct Order {
        uint time;
        Item item;
    }
    mapping(address => uint) public orderCount;
    mapping(address => mapping(uint => Order)) public orders;

    event Buy(address buyer,uint orderId, uint itemId);

    modifier canBuy(Item memory item) {
        require(msg.value>=item.cost && item.stock>0);
        _;
    } 

    function buy(uint _id) public payable canBuy (items[_id]) {

        // Fetch item
        Item memory item = items[_id];

        //create an Order
        Order memory order = Order(block.timestamp,item);

        // Add Order for User
        orderCount[msg.sender]++; // < -- Order ID
        orders[msg.sender][orderCount[msg.sender]] = order;

        // Subtract Stock
        items[_id].stock-=1;


        //Emit Event
        emit Buy(msg.sender,orderCount[msg.sender],item.id);

    }


    // Withdraw funds
    function withdraw() public onlyOwner {
        (bool sent, ) = owner.call{value:address(this).balance}('');
        require(sent);
    }

}
