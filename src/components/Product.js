import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Rating from "./Rating";

import close from "../assets/close.svg";

const Product = ({ item, provider, account, dappazon, togglePop }) => {

  const [order , setOrder] = useState(null);
  const [hasBought,setHasBought] = useState(false);

  const fetchDetails = async () => { 
    const events = await dappazon.queryFilter("Buy");
    const orders = events.filter((event)=> event.args.buyer === account && event.args.itemId.toString() === item.id.toString())

    if(orders.length===0 ) return;
    const order = await dappazon.orders(account,orders[0].args.orderId)
    setOrder(order)

  }

  const buyHandler = async () => {

    const signer = await provider.getSigner();
     
    const tx = await dappazon.connect(signer).buy(item.id, {value:item.cost})
    await tx.wait()

    setHasBought(true)

  };

  useEffect(()=>{
    fetchDetails();
  },[hasBought])


  return (
    <div className="product">
      <div className="product__details">
        <div className="product__image">
          <img src={item.image} alt="product" />
        </div>
        <div className="product__overview">
          <h1>{item.name}</h1>
          <Rating value={item.rating} />
          <hr />
          <p>{item.address}</p>
          <h2>{ethers.utils.formatUnits(item.cost.toString(), "ether")} ETH</h2>
          <hr />
          <h2>Overview</h2>
          <p>
            {item.discription}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>
        <div className="product__order">
          <h1>{ethers.utils.formatUnits(item.cost.toString(), "ether")} ETH</h1>

          <p>
            FREE Delivery <br />
            <strong>
              {new Date(Date.now() + 354600000).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </strong>
          </p>

          <p>{item.stock > 0 ? <p>In Stock</p> : <p>Out of Stock</p>}</p>

          <button className="product__buy" onClick={buyHandler}>
            Buy Now
          </button>

          <p>
            <small>Ships from</small> Dappazon
          </p>
          <p>
            <small>Sold by</small> Dappazon
          </p>
            
            {order && (
              <div className="product__bought">
                Item last bought on <br/>
                <strong>
                  {
                    new Date(Number(order.time.toString() + '000')).toLocaleDateString(undefined ,{
                      weekday:'long', month:'long' , day:"numeric"
                    })
                  }
                </strong>
              </div>
            )}



        </div>
        <button onClick={togglePop} className="product__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Product;
