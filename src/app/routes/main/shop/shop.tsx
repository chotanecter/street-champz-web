import { Title, Group, Text, Badge, Button, SimpleGrid } from "@mantine/core";
import { Star, ExternalLink, Clock, Flame, Sparkles } from "lucide-react";
import { useEconomy } from "../../../economy/context";
import { motion } from "framer-motion";
import { useState } from "react";
import { ProductImage, ProductModal } from "../../../../components";
import classes from "./shop.module.css";

// Rarity types like Fortnite
type Rarity = "common" | "rare" | "epic" | "legendary";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: "tee" | "hoodie" | "joggers" | "cap" | "deck" | "stickers" | "bag" | "socks" | "grip" | "bundle-hoodie-sweats" | "bundle-tee-hat" | "bundle-full";
  price: string;
  pointsReward: number;
  rarity: Rarity;
  new?: boolean;
  soldOut?: boolean;
}

// Rarity colors matching Fortnite style
const RARITY_CONFIG = {
  common: {
    label: "Common",
    gradient: "linear-gradient(135deg, #5e6672 0%, #3d4450 100%)",
    border: "#7d8694",
    glow: "rgba(125, 134, 148, 0.4)",
  },
  rare: {
    label: "Rare", 
    gradient: "linear-gradient(135deg, #0d8ae8 0%, #0a5ca8 100%)",
    border: "#00a8ff",
    glow: "rgba(0, 168, 255, 0.4)",
  },
  epic: {
    label: "Epic",
    gradient: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
    border: "#c084fc",
    glow: "rgba(192, 132, 252, 0.5)",
  },
  legendary: {
    label: "Legendary",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    border: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.5)",
  },
};

// Product images mapping
const PRODUCT_IMAGES: Record<string, string[]> = {
  tee: ["/products/tshirt.jpg"],
  hoodie: ["/products/hoodie-front.jpg", "/products/hoodie-chest.jpg", "/products/hoodie-small.jpg"],
  joggers: ["/products/sweatpants.jpg"],
  cap: ["/products/hat.jpg"],
  "bundle-hoodie-sweats": ["/products/hoodie-front.jpg", "/products/sweatpants.jpg"],
  "bundle-tee-hat": ["/products/tshirt.jpg", "/products/hat.jpg"],
  "bundle-full": ["/products/hat.jpg", "/products/tshirt.jpg", "/products/hoodie-front.jpg", "/products/sweatpants.jpg"],
};

const SHOP_ITEMS: ShopItem[] = [
  // === SPECIALTY ITEM (Season 1) ===
  {
    id: "grip-tape",
    name: "Street Champz Grip Tape",
    description: "Season 1 specialty item - Limited edition grip tape",
    type: "grip",
    price: "$25.00",
    pointsReward: 25000,
    rarity: "legendary",
    new: true,
  },
  
  // === BUNDLES ===
  {
    id: "full-package",
    name: "Full Package Deal",
    description: "Hat + Grip + Hoodie + Sweats + T-Shirt (Save $25!)",
    type: "bundle-full",
    price: "$124.99",
    pointsReward: 15000,
    rarity: "legendary",
  },
  {
    id: "hoodie-sweats-bundle",
    name: "Hoodie + Sweats Bundle",
    description: "Street Champz hoodie and sweatpants combo",
    type: "bundle-hoodie-sweats",
    price: "$65.00",
    pointsReward: 25000,
    rarity: "epic",
  },
  {
    id: "tshirt-hat-bundle",
    name: "T-Shirt + Hat Bundle",
    description: "Classic tee and snapback combo",
    type: "bundle-tee-hat",
    price: "$49.99",
    pointsReward: 15000,
    rarity: "epic",
  },
  
  // === INDIVIDUAL ITEMS ===
  {
    id: "sweatpants",
    name: "Street Champz Sweatpants",
    description: "Premium joggers with logo detail",
    type: "joggers",
    price: "$39.99",
    pointsReward: 12000,
    rarity: "rare",
  },
  {
    id: "hoodie",
    name: "Street Champz Hoodie",
    description: "Heavyweight fleece with embroidered logo",
    type: "hoodie",
    price: "$34.99",
    pointsReward: 10000,
    rarity: "rare",
  },
  {
    id: "tshirt",
    name: "Street Champz T-Shirt",
    description: "Classic logo tee in premium cotton",
    type: "tee",
    price: "$29.99",
    pointsReward: 7500,
    rarity: "rare",
  },
  {
    id: "hat",
    name: "Street Champz Hat",
    description: "Adjustable snapback with embroidered logo",
    type: "cap",
    price: "$24.99",
    pointsReward: 5000,
    rarity: "common",
  },
];

export function Shop() {
  const { points, getDaysRemaining } = useEconomy();
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopItem | null>(null);

  const handleBuyNow = () => {
    window.open("https://store.streetchampz.com", "_blank");
  };

  const handleProductClick = (item: ShopItem) => {
    const images = PRODUCT_IMAGES[item.type];
    if (images && images.length > 0) {
      setSelectedProduct(item);
      setModalOpened(true);
    }
  };

  const featuredItems = SHOP_ITEMS.filter(item => item.rarity === "legendary" || item.rarity === "epic");
  const individualItems = SHOP_ITEMS.filter(item => item.rarity === "rare" || item.rarity === "common");

  const renderItemCard = (item: ShopItem, size: "large" | "medium" | "small" = "medium") => {
    const config = RARITY_CONFIG[item.rarity];
    const isLarge = size === "large";
    
    return (
      <motion.div
        key={item.id}
        className={`${classes.itemCard} ${isLarge ? classes.itemCardLarge : ''}`}
        style={{
          borderColor: config.border,
          boxShadow: `0 0 20px ${config.glow}`,
        }}
        whileHover={{ 
          scale: 1.03, 
          boxShadow: `0 0 40px ${config.glow}`,
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Rarity Badge */}
        <div className={classes.rarityBadge} style={{ background: config.border }}>
          {config.label}
        </div>

        {/* New Badge */}
        {item.new && (
          <div className={classes.newBadge}>
            <Sparkles size={12} />
            NEW
          </div>
        )}

        {/* Product Image */}
        <div className={classes.logoArea}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <ProductImage 
              type={item.type} 
              size={isLarge ? 500 : 400}
              onClick={() => handleProductClick(item)}
            />
          </div>
        </div>

        {/* Item Info */}
        <div className={classes.itemInfo}>
          <Text className={classes.itemName} fw={700}>
            {item.name}
          </Text>
          
          {/* Points Reward */}
          <div className={classes.pointsReward}>
            <Star size={16} fill="var(--mantine-color-gold-5)" color="var(--mantine-color-gold-5)" />
            <span>+{item.pointsReward.toLocaleString()}</span>
          </div>
        </div>

        {/* Price & Buy Button */}
        <div className={classes.itemFooter}>
          <Text className={classes.itemPrice}>{item.price}</Text>
          <Button
            size="compact-xs"
            color="dark"
            variant="filled"
            rightSection={<ExternalLink size={10} />}
            onClick={handleBuyNow}
            disabled={item.soldOut}
            className={classes.buyButton}
          >
            {item.soldOut ? "SOLD OUT" : "BUY"}
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={classes.root}>
      {/* Header */}
      <div className={classes.shopHeader}>
        <div className={classes.headerLeft}>
          <img src="/logo.png" alt="Street Champz" className={classes.headerLogo} />
          <div>
            <Title order={2} className={classes.shopTitle}>ITEM SHOP</Title>
            <Text size="sm" c="dimmed">Buy merch. Earn points. Win prizes.</Text>
          </div>
        </div>
        <div className={classes.headerRight}>
          <div className={classes.pointsDisplay}>
            <Star size={20} fill="var(--mantine-color-gold-5)" color="var(--mantine-color-gold-5)" />
            <span className={classes.pointsAmount}>{points.toLocaleString()}</span>
          </div>
          <Badge size="lg" color="blue" variant="filled" leftSection={<Clock size={14} />}>
            {getDaysRemaining()} DAYS LEFT
          </Badge>
        </div>
      </div>

      {/* Featured Section */}
      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <Flame size={24} className={classes.sectionIcon} />
          <Title order={3}>FEATURED</Title>
          <Badge color="orange" variant="filled">HOT</Badge>
        </div>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 2 }} spacing="md">
          {featuredItems.map(item => renderItemCard(item, "large"))}
        </SimpleGrid>
      </div>

      {/* Individual Items */}
      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <Clock size={24} className={classes.sectionIcon} />
          <Title order={3}>INDIVIDUAL ITEMS</Title>
          <Badge color="blue" variant="light">Merch</Badge>
        </div>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 3 }} spacing="md">
          {individualItems.map(item => renderItemCard(item, "medium"))}
        </SimpleGrid>
      </div>


      {/* Bottom Banner */}
      <motion.div 
        className={classes.bottomBanner}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <img src="/logo.png" alt="" className={classes.bannerLogo} />
        <div className={classes.bannerText}>
          <Text size="xl" fw={700}>Every Purchase Earns Points!</Text>
          <Text size="sm" c="dimmed">
            Climb the leaderboard. Top player wins a special prize!
          </Text>
        </div>
        <Group>
          <Badge size="xl" color="gold" variant="filled">
            <Star size={16} style={{ marginRight: 4 }} />
            {points.toLocaleString()} PTS
          </Badge>
        </Group>
      </motion.div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          images={PRODUCT_IMAGES[selectedProduct.type] || []}
          productName={selectedProduct.name}
          productPrice={selectedProduct.price}
          onBuy={handleBuyNow}
        />
      )}
    </div>
  );
}
