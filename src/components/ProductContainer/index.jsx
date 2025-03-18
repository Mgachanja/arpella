import React from 'react';
import '../../styles/boostrapCustom.css';

function ProductContainer({ product }) {
  // Use product.name, product.price, etc. but keep the full object intact.
  return (
    <div
      className="responsive-card card shadow-sm"
      style={{
        width: '100%',
        maxWidth: '200px',
        fontSize: '0.8rem',
        margin: '15px auto',
      }}
    >
      <div>
        <img
          src={
            product.productimages && product.productimages.length > 0
              ? product.productimages[0].imageUrl
              : 'placeholder.jpg'
          }
          alt={product.name}
          style={{ margin: 0, height: '175px', width: '100%', objectFit: 'fit' }}
        />
      </div>
      <div className="card-body pb-2">
        <h6 className="card-title text-truncate">{product.name}</h6>
        <p className="card-text mb-2">KSH {product.price}</p>
        <button className="btn cart-btn btn-sm btn-primary w-100">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductContainer;
