import React from 'react';
import Lottie from 'lottie-react';
import addToCartAnimation from '@/components/common/add to cart.json';

interface AddToCartLoaderProps {
  size?: number;
}

export const CheckOutLoader = ({ size = 60 }: AddToCartLoaderProps) => {
  return (
    <Lottie 
      animationData={addToCartAnimation}
      loop={true} 
      style={{ width: size, height: size }} 
    />
  );
};