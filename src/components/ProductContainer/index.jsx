import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductImage } from '../../redux/slices/productsSlice';
import '../../styles/boostrapCustom.css';

/**
 * Displays a product card with image, fetching the image if necessary.
 * Fully responsive design that adapts to any screen size.
 */
export default function ProductContainer({ product }) {
  const dispatch = useDispatch();
  const fetchAttempted = useRef(false);

  const isImageLoading = useSelector(
    state => state.products.imageLoadingStates[product.id] || false
  );

  const currentProduct = useSelector(state => {
    const found = state.products.products.find(p => p.id === product.id);
    return found || product;
  });

  useEffect(() => {
    if (!currentProduct.id || fetchAttempted.current) return;

    if (!currentProduct.imageUrl && !isImageLoading) {
      fetchAttempted.current = true;
      dispatch(fetchProductImage(currentProduct.id));
    }
  }, [currentProduct.id, currentProduct.imageUrl, isImageLoading, dispatch]);

  const hasImage = Boolean(currentProduct.imageUrl);
  const showSpinner = isImageLoading && !hasImage;
  const showNoImage = !hasImage && !isImageLoading;

  const handleImageError = e => {
    // optionally set a fallback image: e.target.src = '/fallback.jpg';
  };

  const handleImageLoad = () => {
    // image loaded successfully
  };

  return (
    <div
      className="responsive-card card shadow-sm"
      style={{
        width: '180px',
        height: 'auto',
        fontSize: '0.8rem',
        margin: '0',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      {/* Image Container - Fixed height for consistency */}
      <div
        style={{
          width: '100%',
          height: '175px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          position: 'relative'
        }}
      >
        {hasImage ? (
          <img
            src={currentProduct.imageUrl}
            alt={currentProduct.name}
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onError={handleImageError}
            onLoad={handleImageLoad}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        ) : showSpinner ? (
          <div className="d-flex flex-column align-items-center">
            <div
              className="spinner-border text-secondary mb-2"
              role="status"
              style={{ 
                width: '2rem', 
                height: '2rem' 
              }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <small 
              className="text-muted"
              style={{ fontSize: '0.75rem' }}
            >
              Loading...
            </small>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center text-muted">
            <svg
              width="48"
              height="48"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
              <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
            </svg>
            <small 
              className="mt-1"
              style={{ fontSize: '0.75rem' }}
            >
              No image
            </small>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div 
        className="card-body" 
        style={{ 
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          minHeight: '100px'
        }}
      >
        {/* Product Name - Fixed height for consistency */}
        <h6
          className="card-title"
          title={currentProduct.name}
          style={{
            margin: '0',
            fontSize: '0.85rem',
            fontWeight: '600',
            lineHeight: '1.2',
            color: '#333',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '2.4em'
          }}
        >
          {currentProduct.name}
        </h6>

        {/* Price */}
        <p 
          className="card-text mb-0" 
          style={{
            fontSize: '0.9rem',
            fontWeight: '700',
            color: '#1976d2',
            margin: '0'
          }}
        >
          KSH {currentProduct.price ? currentProduct.price.toFixed(2) : '0.00'}
        </p>

        {/* Add to Cart Button - Fixed sizing */}
        <button 
          className="btn cart-btn btn-primary w-100"
          style={{
            fontSize: '0.75rem',
            padding: '6px 10px',
            fontWeight: '600',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#1976d2',
            color: 'white',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            marginTop: 'auto',
            minHeight: '32px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#1565c0';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#1976d2';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}