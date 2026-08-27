// client/src/store/useCartStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (open) => set({ isCartOpen: open }),

      addToCart: (item) => {
        const currentCart = get().cart || [];
        const existing = currentCart.find((i) => i._id === item._id);
        if (existing) {
          set({
            cart: currentCart.map((i) =>
              i._id === item._id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
            )
          });
        } else {
          set({ cart: [...currentCart, { ...item, quantity: 1 }] });
        }
      },

      updateQuantity: (id, delta) => {
        set({
          cart: (get().cart || [])
            .map((item) => (item._id === id ? { ...item, quantity: item.quantity + delta } : item))
            .filter((item) => item.quantity > 0)
        });
      },

      clearCart: () => set({ cart: [] }),

      getTotals: () => {
        const cart = get().cart || [];
        const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        const delivery = subtotal > 35 || subtotal === 0 ? 0 : 3.99;
        const total = subtotal + delivery;
        return { subtotal, delivery, total };
      }
    }),
    {
      name: 'savormern_cart_storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);