import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProductImage } from '../../redux/slices/productsSlice/';     
import { useInView } from 'react-intersection-observer';               // ensure installed
import '../../styles/boostrapCustom.css';

export default function ProductContainer({ product }) {
  const dispatch = useDispatch();
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView && !product.imageUrl && product.id) {
      dispatch(fetchProductImage(product.id));
    }
  }, [inView, product, dispatch]);

  const imgSrc = product.imageUrl
    || (product.productimages?.[0]?.imageUrl)
    || null;

  return (
    <div
      ref={ref}
      className="responsive-card card shadow-sm"
      style={{
        width: '100%',
        maxWidth: '200px',
        fontSize: '0.8rem',
        margin: '15px auto',
      }}
    >
      <div
        style={{
          height: '175px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </div>
      <div className="card-body pb-2">
        <h6 className="card-title text-truncate">{product.name}</h6>
        <p className="card-text mb-2">KSH {product.price.toFixed(2)}</p>
        <button className="btn cart-btn btn-sm btn-primary w-100">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
