import { Modal, Group, Text, Badge, Button, Stack } from "@mantine/core";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import classes from "./ProductModal.module.css";

interface ProductModalProps {
  opened: boolean;
  onClose: () => void;
  images: string[];
  productName: string;
  productPrice?: string;
  onBuy?: () => void;
}

export const ProductModal = ({ 
  opened, 
  onClose, 
  images, 
  productName,
  productPrice,
  onBuy 
}: ProductModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first image when modal opens
  useEffect(() => {
    if (opened) {
      setCurrentIndex(0);
    }
  }, [opened]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "Escape") onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      withCloseButton={false}
      padding={0}
      classNames={{
        content: classes.modalContent,
        body: classes.modalBody,
      }}
      onKeyDown={handleKeyDown}
    >
      <div className={classes.modalContainer}>
        {/* Close Button */}
        <button 
          className={classes.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Image Display */}
        <div className={classes.imageSection}>
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className={classes.modalImage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                className={`${classes.navButton} ${classes.navButtonLeft}`}
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                className={`${classes.navButton} ${classes.navButtonRight}`}
                onClick={handleNext}
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className={classes.imageCounter}>
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={classes.infoSection}>
          <Stack gap="md">
            <div>
              <Text size="xl" fw={700} mb="xs">
                {productName}
              </Text>
              {productPrice && (
                <Text size="lg" fw={600} c="dimmed">
                  {productPrice}
                </Text>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <Group gap="xs" className={classes.thumbnails}>
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`${classes.thumbnail} ${index === currentIndex ? classes.thumbnailActive : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </Group>
            )}

            {/* Buy Button */}
            {onBuy && (
              <Button
                size="lg"
                fullWidth
                onClick={onBuy}
                className={classes.buyButton}
              >
                BUY NOW
              </Button>
            )}
          </Stack>
        </div>
      </div>
    </Modal>
  );
};

