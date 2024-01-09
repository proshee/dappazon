const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

// Global Constants for listing an item

const ID = 1;
const  NAME = 'shoes';
const CATEGORY = 'Clothing';
const IMAGE = '';
const COST = tokens(1);
const RATING = 4;
const STOCK = 7;



describe("Dappazon", () => {
  let dappazon;
  let deployer,buyer;

  beforeEach(async () => {
    // Setup Account
    [ deployer,buyer ] = await ethers.getSigners()


    // Deploy Contract
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy()
  })

  describe("Deployment",  () => {
    it("Sets the Owner", async ()=> {
      const owner = await dappazon.owner();
      expect(owner).to.equal(deployer.address);
    })
  })

  describe("list items" , () => {
    let tx;
    beforeEach(async () => {
      tx = await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await tx.wait();
    })
    it('Returns item attributes', async () => {
      const item = await dappazon.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      // console.log(COST)
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
    })
    it("Emit List item" , () => {
      expect(tx).to.emit(dappazon,"List");
    })
  })


  describe("Buying" , () => {
    let tx;
    beforeEach(async () => {
      tx = await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await tx.wait();

      tx = await dappazon.connect(buyer).buy(ID, {value: COST});
      await tx.wait();
    })
    
    it("Updates the Contract Balance" , async () => {
      const balance = await ethers.provider.getBalance(dappazon.address);
      expect(balance).to.equal(COST);
    } )

    it("Updates buyer's order Count" , async () => {
      const count = await dappazon.orderCount(buyer.address);
      // console.log(count)
      expect(count).to.equal(1);
    })
    it("Adds an order", async()=> {
      const order = await dappazon.orders(buyer.address,1);
      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME)
    })

    it('emits Buy event' ,() => {
      expect(tx).to.emit(dappazon ,"BUY");
    })
      
  })

  describe("withdrawing" , () => {
    let tx;
    let balanceBefore;
    beforeEach(async () => {
      // List an item
      tx = await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await tx.wait();

      // buy an item
      tx = await dappazon.connect(buyer).buy(ID, {value: COST});
      await tx.wait();

      // get balance of owner
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      // withdraw
      tx = await dappazon.connect(deployer).withdraw();
      await tx.wait();
      
    })
    
    it("Updates the Owner balance" , async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    })

    it("Updates the Contract balance" , async () => {
      const balance = await ethers.provider.getBalance(dappazon.address);
      expect(balance).to.equal(0);
    })
      
  })  

})
