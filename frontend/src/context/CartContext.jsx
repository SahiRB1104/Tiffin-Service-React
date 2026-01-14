import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";

const CartContext = createContext(null);

/**
 * 🔑 Always generate a stable cart key
 * Works even if backend doesn't send _id
 */
const getCartKey = (item) =>
  item._id || item.id || item.name;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cartData");
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    localStorage.setItem("cartData", JSON.stringify(cart));
  }, [cart]);

  /* ---------------- ADD TO CART ---------------- */
  const addToCart = (item) => {
    const key = getCartKey(item);

    setCart((prev) => {
      const existing = prev.find(
        (i) => i.__cartKey === key
      );

      if (existing) {
        return prev.map((i) =>
          i.__cartKey === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          __cartKey: key, // 🔑 internal only
          quantity: 1,
        },
      ];
    });
  };

  /* ---------------- UPDATE QTY ---------------- */
  const updateQty = (cartKey, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.__cartKey === cartKey) {
            const qty = item.quantity + delta;
            return qty <= 0
              ? null
              : { ...item, quantity: qty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  /* ---------------- CLEAR CART ---------------- */
  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscount(0);
    localStorage.removeItem("cartData");
  };

  /* ---------------- APPLY COUPON ---------------- */
  const applyCoupon = (couponData) => {
    setAppliedCoupon(couponData.coupon_name);
    setDiscount(couponData.discount_amount);
  };

  /* ---------------- REMOVE COUPON ---------------- */
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  };

  /* ---------------- TOTAL ---------------- */
  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      ),
    [cart]
  );

  /* ---------------- FINAL TOTAL (AFTER DISCOUNT) ---------------- */
  const finalTotal = useMemo(
    () => Math.max(0, total - discount),
    [total, discount]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      updateQty,
      clearCart,
      total,
      appliedCoupon,
      discount,
      finalTotal,
      applyCoupon,
      removeCoupon,
    }),
    [cart, total, appliedCoupon, discount, finalTotal]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }
  return ctx;
};
