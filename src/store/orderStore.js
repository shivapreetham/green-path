// store/orderStore.js
import { create } from 'zustand';

const useOrderStore = create((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok) {
        set({ orders: data.orders || [], loading: false });
      } else {
        set({ error: data.error || 'Failed to fetch orders', loading: false });
      }
    } catch (err) {
      set({ error: 'Failed to fetch orders', loading: false });
    }
  },

  clearOrders: () => set({ orders: [], error: null }),
}));

export default useOrderStore;
