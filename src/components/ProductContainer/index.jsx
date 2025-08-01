import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductImage } from '../../redux/slices/productsSlice';
import '../../styles/boostrapCustom.css';

/**
 * Displays a product card with image, fetching the image if necessary.
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
        width: '100%',
        maxWidth: '200px',
        fontSize: '0.8rem',
        margin: '15px auto'
      }}
    >
      <div
        style={{
          height: '175px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa'
        }}
      >
        {hasImage ? (
          <img
            src={currentProduct.imageUrl}
            alt={currentProduct.name}
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover'
            }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : showSpinner ? (
          <div className="d-flex flex-column align-items-center">
            <div
              className="spinner-border text-secondary mb-2"
              role="status"
              style={{ width: '2rem', height: '2rem' }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <small className="text-muted">Loading image...</small>
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
            <small className="mt-1">No image</small>
          </div>
        )}
      </div>
      <div className="card-body pb-2">
        <h6
          className="card-title text-truncate"
          title={currentProduct.name}
        >
          {currentProduct.name}
        </h6>
        <p className="card-text mb-2">
          KSH {currentProduct.price ? currentProduct.price.toFixed(2) : '0.00'}
        </p>
        <button className="btn cart-btn btn-sm btn-primary w-100">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
