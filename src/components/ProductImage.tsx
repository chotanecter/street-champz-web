import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductMockup } from "./ProductMockup";
import classes from "./ProductImage.module.css";

type ProductType = "tee" | "hoodie" | "joggers" | "cap" | "deck" | "stickers" | "bag" | "socks" | "grip" | "bundle-hoodie-sweats" | "bundle-tee-hat" | "bundle-full";

interface ProductImageProps {
  type: ProductType;
  size?: number;
  onClick?: () => void;
}

// Map product types to their image paths
const PRODUCT_IMAGES: Record<ProductType, string[]> = {
  tee: ["/products/tshirt.jpg"],
  hoodie: ["/products/hoodie-front.jpg", "/products/hoodie-chest.jpg", "/products/hoodie-small.jpg"],
  joggers: ["/products/sweatpants.jpg"],
  cap: ["/products/hat.jpg"],
  grip: [], // Will use mockup fallback
  deck: [], // Will use mockup fallback
  stickers: [], // Will use mockup fallback
  bag: [], // Will use mockup fallback
  socks: [], // Will use mockup fallback
  "bundle-hoodie-sweats": ["/products/hoodie-front.jpg", "/products/sweatpants.jpg"],
  "bundle-tee-hat": ["/products/tshirt.jpg", "/products/hat.jpg"],
  "bundle-full": ["/products/hat.jpg", "/products/tshirt.jpg", "/products/hoodie-front.jpg", "/products/sweatpants.jpg"],
};

export const ProductImage = ({ type, size = 180, onClick }: ProductImageProps) => {
  const images = PRODUCT_IMAGES[type] || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasRealPhotos = images.length > 0;

  // Auto-rotate images for products with multiple photos
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // If no real images available, use gamified mockup with subtle styling
  if (!hasRealPhotos) {
    return (
      <div 
        className={classes.mockupContainer}
        style={{ width: size, height: size }}
      >
        <ProductMockup type={type} size={size} />
      </div>
    );
  }

  return (
    <div 
      className={`${classes.imageContainer} ${onClick ? classes.clickable : ''}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Product ${type}`}
          className={classes.productImage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>

      {/* Slideshow indicators for multiple images */}
      {images.length > 1 && (
        <div className={classes.indicators}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${classes.indicator} ${index === currentIndex ? classes.active : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

