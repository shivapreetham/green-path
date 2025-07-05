// store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generate session ID
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const useCartStore = create(
  persist(
    (set, get) => ({
      sessionId: null,
      items: [],
      totalAmount: 0,
      totalCarbonScore: 0,
      estimatedCarbonSavings: 0,
      isLoading: false,
      error: null,
      recommendations: [],

      // Initialize session
      initializeSession: () => {
        const { sessionId } = get();
        if (!sessionId) {
          set({ sessionId: generateSessionId() });
        }
      },

      // Fetch cart from server
      fetchCart: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/cart?sessionId=${sessionId}`);
          const data = await response.json();
          
          if (response.ok) {
            set({
              items: data.items || [],
              totalAmount: data.totalAmount || 0,
              totalCarbonScore: data.totalCarbonScore || 0,
              estimatedCarbonSavings: data.estimatedCarbonSavings || 0,
              isLoading: false
            });
          } else {
            set({ error: data.error, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to fetch cart', isLoading: false });
        }
      },

      // Add item to cart
      addToCart: async (productId, quantity = 1) => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              productId,
              quantity,
            }),
          });

          const data = await response.json();
          
          if (response.ok) {
            set({
              items: data.items || [],
              totalAmount: data.totalAmount || 0,
              totalCarbonScore: data.totalCarbonScore || 0,
              estimatedCarbonSavings: data.estimatedCarbonSavings || 0,
              isLoading: false
            });
            
            // Fetch updated recommendations
            get().fetchCartRecommendations();
          } else {
            set({ error: data.error, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to add to cart', isLoading: false });
        }
      },

      // Update item quantity
      updateQuantity: async (productId, quantity) => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              productId,
              quantity,
            }),
          });

          const data = await response.json();
          
          if (response.ok) {
            set({
              items: data.items || [],
              totalAmount: data.totalAmount || 0,
              totalCarbonScore: data.totalCarbonScore || 0,
              estimatedCarbonSavings: data.estimatedCarbonSavings || 0,
              isLoading: false
            });
            
            // Fetch updated recommendations
            get().fetchCartRecommendations();
          } else {
            set({ error: data.error, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to update cart', isLoading: false });
        }
      },

      // Remove item from cart
      removeFromCart: async (productId) => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/cart?sessionId=${sessionId}&productId=${productId}`, {
            method: 'DELETE',
          });

          const data = await response.json();
          
          if (response.ok) {
            set({
              items: data.items || [],
              totalAmount: data.totalAmount || 0,
              totalCarbonScore: data.totalCarbonScore || 0,
              estimatedCarbonSavings: data.estimatedCarbonSavings || 0,
              isLoading: false
            });
            
            // Fetch updated recommendations
            get().fetchCartRecommendations();
          } else {
            set({ error: data.error, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to remove from cart', isLoading: false });
        }
      },

      // Clear entire cart
      clearCart: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/cart?sessionId=${sessionId}`, {
            method: 'DELETE',
          });

          const data = await response.json();
          
          if (response.ok) {
            set({
              items: [],
              totalAmount: 0,
              totalCarbonScore: 0,
              estimatedCarbonSavings: 0,
              recommendations: [],
              isLoading: false
            });
          } else {
            set({ error: data.error, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to clear cart', isLoading: false });
        }
      },

      // Fetch cart recommendations
      fetchCartRecommendations: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        try {
          const response = await fetch(`/api/recommendations?sessionId=${sessionId}`);
          const data = await response.json();
          
          if (response.ok) {
            set({ recommendations: data });
          }
        } catch (error) {
          console.error('Failed to fetch cart recommendations:', error);
        }
      },

      // Get cart item count
      getItemCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get cart total carbon savings potential
      getTotalCarbonSavings: () => {
        const { recommendations } = get();
        return recommendations.reduce((total, rec) => total + rec.carbonSavings, 0);
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
      }),
    }
  )
);

export default useCartStore;