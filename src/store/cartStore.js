import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useCartStore = create(
  persist(
    (set, get) => ({
      sessionId: null,
      cart: { items: [], totalAmount: 0, totalCarbonFootprint: 0, estimatedCarbonSavings: 0 },
      isLoading: false,
      error: null,
      recommendations: [],

      // Initialize session
      initializeSession: () => {
        let sessionId = get().sessionId;
        if (!sessionId) {
          sessionId = uuidv4();
          set({ sessionId });
        }
        return sessionId;
      },

      // Fetch cart from server
      fetchCart: async () => {
        let { sessionId } = get();
        if (!sessionId) {
          sessionId = get().initializeSession();
        }

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/cart?sessionId=${sessionId}`);
          const data = await response.json();
          if (response.ok) {
            set({
              cart: {
                items: data.items || [],
                totalAmount: data.totalAmount || 0,
                totalCarbonFootprint: data.totalCarbonFootprint || 0,
                estimatedCarbonSavings: data.estimatedCarbonSavings || 0,
              },
              isLoading: false,
            });
          } else {
            set({ error: data.error || 'Failed to fetch cart', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to fetch cart', isLoading: false });
        }
      },

      // Check stock availability
      checkStock: async (productId, quantity) => {
        try {
          const response = await fetch(`/api/products/${productId}`);
          const data = await response.json();
          if (response.ok && data.product) {
            const availableStock = data.product.totalStock || 0;
            return availableStock >= quantity;
          }
          return false;
        } catch (error) {
          console.error('Stock check error:', error);
          return false;
        }
      },

      // Add item to cart
      addToCart: async (productId, quantity = 1) => {
        let { sessionId } = get();
        if (!sessionId) {
          sessionId = get().initializeSession();
        }

        set({ isLoading: true, error: null });
        try {
          // Check stock before adding
          const hasStock = await get().checkStock(productId, quantity);
          if (!hasStock) {
            set({ error: 'Insufficient stock available', isLoading: false });
            throw new Error('Insufficient stock');
          }

          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, productId, quantity }),
          });
          const data = await response.json();
          if (response.ok) {
            set({
              cart: {
                items: data.items || [],
                totalAmount: data.totalAmount || 0,
                totalCarbonFootprint: data.totalCarbonFootprint || 0,
                estimatedCarbonSavings: data.estimatedCarbonSavings || 0,
              },
              isLoading: false,
            });
            get().fetchCartRecommendations();
          } else {
            set({ error: data.error || 'Failed to add to cart', isLoading: false });
            throw new Error(data.error);
          }
        } catch (error) {
          set({ error: error.message || 'Failed to add to cart', isLoading: false });
          throw error;
        }
      },

      // Update item quantity
      updateQuantity: async (productId, quantity) => {
        let { sessionId } = get();
        if (!sessionId) {
          sessionId = get().initializeSession();
        }

        set({ isLoading: true, error: null });
        try {
          // Check stock before updating
          const hasStock = await get().checkStock(productId, quantity);
          if (!hasStock) {
            set({ error: 'Insufficient stock available', isLoading: false });
            throw new Error('Insufficient stock');
          }

          const response = await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, productId, quantity }),
          });
          const data = await response.json();
          if (response.ok) {
            set({
              cart: {
                items: data.items || [],
                totalAmount: data.totalAmount || 0,
                totalCarbonFootprint: data.totalCarbonFootprint || 0,
                estimatedCarbonSavings: data.estimatedCarbonSavings || 0,
              },
              isLoading: false,
            });
            get().fetchCartRecommendations();
          } else {
            set({ error: data.error || 'Failed to update cart', isLoading: false });
          }
        } catch (error) {
          set({ error: error.message || 'Failed to update cart', isLoading: false });
        }
      },

      // Remove item from cart
      removeFromCart: async (productId) => {
        let { sessionId } = get();
        if (!sessionId) {
          sessionId = get().initializeSession();
        }

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/cart?sessionId=${sessionId}&productId=${productId}`, {
            method: 'DELETE',
          });
          const data = await response.json();
          if (response.ok) {
            set({
              cart: {
                items: data.items || [],
                totalAmount: data.totalAmount || 0,
                totalCarbonFootprint: data.totalCarbonFootprint || 0,
                estimatedCarbonSavings: data.estimatedCarbonSavings || 0,
              },
              isLoading: false,
            });
            get().fetchCartRecommendations();
          } else {
            set({ error: data.error || 'Failed to remove from cart', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to remove from cart', isLoading: false });
        }
      },

      // Clear entire cart
      clearCart: async () => {
        let { sessionId } = get();
        if (!sessionId) {
          sessionId = get().initializeSession();
        }

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/cart?sessionId=${sessionId}`, {
            method: 'DELETE',
          });
          const data = await response.json();
          if (response.ok) {
            set({
              cart: { items: [], totalAmount: 0, totalCarbonFootprint: 0, estimatedCarbonSavings: 0 },
              recommendations: [],
              isLoading: false,
            });
          } else {
            set({ error: data.error || 'Failed to clear cart', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to clear cart', isLoading: false });
        }
      },

      // Fetch cart recommendations
      fetchCartRecommendations: async () => {
        let { sessionId } = get();
        if (!sessionId) {
          sessionId = get().initializeSession();
        }

        try {
          const response = await fetch(`/api/recommendations?sessionId=${sessionId}`);
          const data = await response.json();
          if (response.ok) {
            set({ recommendations: data.recommendations || [] });
          }
        } catch (error) {
          console.error('Failed to fetch cart recommendations:', error);
        }
      },

      // Get cart item count
      getItemCount: () => {
        const { cart } = get();
        return cart.items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get cart total carbon savings potential
      getTotalCarbonSavings: () => {
        const { recommendations } = get();
        return recommendations.reduce((total, rec) => total + (rec.carbonSavings || 0), 0);
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        cart: state.cart,
      }),
    }
  )
);

export default useCartStore;