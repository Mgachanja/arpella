import React, { useRef } from 'react';
import { Box, Typography, Chip, Skeleton } from '@mui/material';
import { styled } from '@mui/system';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useGetOfferProductsQuery } from '../../redux/api/productsApi';

// Outer scrollable layer — centers content when it fits, scrolls when it overflows
const ScrollOuter = styled(Box)({
  width: '100%',
  maxWidth: '100%',
  overflowX: 'auto',
  display: 'flex',
  justifyContent: 'flex-start',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
  paddingBottom: '12px',
  paddingTop: '4px',
});

// Inner row — always min-content so centering works correctly
const ScrollInner = styled(Box)({
  display: 'flex',
  gap: '24px',
  minWidth: 'min-content',
});

// 180px matches the product grid column width; same gap (24px) used above
const Card = styled(Box)({
  flexShrink: 0,
  width: '180px',
  borderRadius: '16px',
  overflow: 'hidden',
  background: '#fff',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(200,93,0,0.18)',
  },
});

const ImageBox = styled(Box)({
  width: '100%',
  height: '140px',
  backgroundColor: '#f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

function OfferCard({ product, onSelect }) {
  const originalPrice = Number(product?.price) || 0;
  const offerPrice = Number(product?.priceAfterDiscount) || 0;
  const hasOffer = offerPrice > 0;
  const displayPrice = hasOffer ? offerPrice : originalPrice;
  const discountPct =
    hasOffer && originalPrice > 0
      ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
      : 0;

  return (
    <Card onClick={() => onSelect(product)}>
      {hasOffer && (
        <Chip
          label={`-${discountPct}%`}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
            backgroundColor: '#c85d00',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 22,
          }}
        />
      )}
      <ImageBox>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '1.5rem' }}>🛍</Typography>
          </Box>
        )}
      </ImageBox>
      <Box sx={{ p: '10px 12px 12px' }}>
        <Typography
          noWrap
          sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827', mb: 0.5 }}
        >
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#c85d00' }}>
            KSH {displayPrice.toLocaleString()}
          </Typography>
          {hasOffer && (
            <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af', textDecoration: 'line-through' }}>
              KSH {originalPrice.toLocaleString()}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
}

export default function OffersSection({ onSelect }) {
  const { data: offers = [], isLoading, isError } = useGetOfferProductsQuery();

  if (isLoading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="rounded" width={160} height={28} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={180} height={210} sx={{ flexShrink: 0, borderRadius: '16px' }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (isError || offers.length === 0) return null;

  return (
    <Box sx={{ mb: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocalFireDepartmentIcon sx={{ color: '#c85d00', fontSize: '1.4rem' }} />
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937', letterSpacing: '-0.02em' }}>
          Flash Sale
        </Typography>
        <Chip
          label="Limited Time"
          size="small"
          sx={{
            ml: 1,
            backgroundColor: 'rgba(200,93,0,0.1)',
            color: '#c85d00',
            fontWeight: 700,
            fontSize: '0.72rem',
          }}
        />
      </Box>

      <ScrollOuter>
        <ScrollInner>
          {offers.map((product) => (
            <OfferCard key={product.id} product={product} onSelect={onSelect} />
          ))}
        </ScrollInner>
      </ScrollOuter>
    </Box>
  );
}
