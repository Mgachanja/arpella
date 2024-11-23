import React,{useState} from 'react'
import '../../styles/boostrapCustom.css'

function Index({Name, Price, Image}) {

  const[clickedAddToCart, setClickedAddToCart] = useState(false)
  const [cartItems, setCartItems] = useState(0)
  const[clickedPositive, setClickedPositive] = useState(false)
  const[clickedNegative, setClickedNegative] = useState(false)

    const cartOperations = () => {
      if(clickedPositive){
        setCartItems(cartItems + 1)
      }
      else if(clickedNegative){
        setCartItems(cartItems - 1)
      }
    }

    const cartOperationsAdd = ()=>{
      setClickedPositive(true)
      cartOperations()
    }

    const cartOperationsMinus = ()=>{
      setClickedNegative(true)
      cartOperations()
      if(cartItems > 0){
        setCartItems(cartItems - 1)
      }else{
        setCartItems(0)
        setClickedAddToCart(false)
      }
    }
    
    const addToCart = () => { 
      setClickedAddToCart(true)
      setCartItems(1)
    }

  return (
    <div
        className=" responsive-card card shadow-sm"
        style={{
          width: "100%", 
          maxWidth: "200px", 
          fontSize: "0.8rem",
          margin: "15px auto", 
        }}
    >
        <div className=''>
        <img
          src={Image}
          className=""
          alt="product"
          style={{margin:0, height: "200px", width:"100%", objectFit: "cover" }}
        />
        </div>

        <div className="card-body pb-2">
          <h6 className="card-title text-truncate">{Name}</h6>
          <p className="card-text mb-2">KSH {Price}</p>

          {clickedAddToCart ? (
            <div className="w-100">
              <div>
                <button
                  onClick={cartOperationsMinus}
                  className="btn cart-btn btn-sm btn-primary w-10"
                >
                  {"  "}
                  -{"  "}
                </button>
                <span className="ps-3 pe-3">{cartItems}</span> 
                <button
                  onClick={cartOperationsAdd}
                  className="btn cart-btn btn-sm btn-primary w-10"
                >
                  {" "}
                  +{" "}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={addToCart} className="btn cart-btn btn-sm btn-primary w-100">
              Add to Cart
            </button>
          )}


        </div>
      </div>
  
  )
}

export default Index