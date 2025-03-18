import React, { useState } from 'react';
import '../../styles/boostrapCustom.css';

function Index({ Name, Price, Image }) {
  
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
          src={Image}
          alt="product"
          style={{ margin: 0, height: '200px', width: '100%', objectFit: 'cover' }}
        />
      </div>

      <div className="card-body pb-2">
        <h6 className="card-title text-truncate">{Name}</h6>
        <p className="card-text mb-2">KSH {Price}</p>

          <button className="btn cart-btn btn-sm btn-primary w-100">
            Add to Cart
          </button>
      </div>
    </div>
  );
}

export default Index;
