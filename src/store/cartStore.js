import create from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      addItem: (product) => {
        const currentItems = get().cartItems;
        const existingItem = currentItems.find((item) => item.productId === product._id);
        if (existingItem) {
          set({
            cartItems: currentItems.map((item) =>
              item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
        } else {
          set({
            cartItems: [...currentItems, { productId: product._id, quantity: 1, product }],
          });
        }
      },
      removeItem: (productId) => {
        set({ cartItems: get().cartItems.filter((item) => item.productId !== productId) });
      },
      clearCart: () => set({ cartItems: [] }),
    }),
    { name: 'cart-storage', getStorage: () => localStorage }
  )
);

export default useCartStore;