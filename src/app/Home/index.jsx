import React from 'react'
import Nav from '../../components/Nav'
import ProductContainer from '../../components/ProductContainer'

function index() {
  const products = [
    { Name: "Apple", Price: 100, Image: "https://via.placeholder.com/200?text=Apple" },
    { Name: "Orange", Price: 80, Image: "https://via.placeholder.com/200?text=Orange" },
    { Name: "Banana", Price: 50, Image: "https://via.placeholder.com/200?text=Banana" },
    { Name: "Grapes", Price: 120, Image: "https://via.placeholder.com/200?text=Grapes" },
    { Name: "Mango", Price: 150, Image: "https://via.placeholder.com/200?text=Mango" },
    { Name: "Pineapple", Price: 200, Image: "https://via.placeholder.com/200?text=Pineapple" },
    { Name: "Strawberries", Price: 300, Image: "https://via.placeholder.com/200?text=Strawberries" },
    { Name: "Watermelon", Price: 90, Image: "https://via.placeholder.com/200?text=Watermelon" },
    { Name: "Tomatoes", Price: 70, Image: "https://via.placeholder.com/200?text=Tomatoes" },
    { Name: "Cabbage", Price: 40, Image: "https://via.placeholder.com/200?text=Cabbage" },
    { Name: "Onions", Price: 60, Image: "https://via.placeholder.com/200?text=Onions" },
    { Name: "Potatoes", Price: 80, Image: "https://via.placeholder.com/200?text=Potatoes" },
    { Name: "Garlic", Price: 150, Image: "https://via.placeholder.com/200?text=Garlic" },
    { Name: "Carrots", Price: 100, Image: "https://via.placeholder.com/200?text=Carrots" },
    { Name: "Lettuce", Price: 90, Image: "https://via.placeholder.com/200?text=Lettuce" },
    { Name: "Chilies", Price: 130, Image: "https://via.placeholder.com/200?text=Chilies" },
    { Name: "Cucumbers", Price: 70, Image: "https://via.placeholder.com/200?text=Cucumbers" },
    { Name: "Peaches", Price: 250, Image: "https://via.placeholder.com/200?text=Peaches" },
    { Name: "Pears", Price: 180, Image: "https://via.placeholder.com/200?text=Pears" },
    { Name: "Plums", Price: 160, Image: "https://via.placeholder.com/200?text=Plums" },
  ];
  
  return (
    <div>
      <Nav/>
      <div>
        <div>
        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '0 10px' }} className='container-fluid d-flex align-items-center  justify-content-center py-2'>
        <button className="btn  category-btn me-1 ">Categories</button>
          <button className="btn category-btn me-2">Beverages</button>
          <button className="btn category-btn me-2">Snacks</button>
          <button className="btn category-btn me-2">Dairy</button>
          <button className="btn category-btn me-2">Bakery</button>
          <button className="btn category-btn me-2">Dry Foods and Staples</button>
          <button className="btn category-btn me-2">Condiments and Spices</button>
          <button className="btn category-btn me-2">Canned Foods</button>
          <button className="btn category-btn me-2">Health and Wellness</button>
        </div>
        <div className="container mt-4">
          <h5 className="text-start  mb-1">ALL PRODUCTS</h5>
          <div className="row">
            {products.map((product, index) => (
              <div className="col-6 col-md-3 col-lg-2 mb-1" key={index}>
                <ProductContainer key={index} Name={product.Name} Price={product.Price} Image={product.Image} /> 
              </div> 
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default index