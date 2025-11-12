import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  memberId: string;
  memberName: string;
  npa: string;
  years: number[];
  cabang?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (memberId: string) => void;
  updateYears: (memberId: string, years: number[]) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalYears: () => number;
}

const TARIFF_PER_YEAR = 1000000;

export const usePaymentCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existingIndex = state.items.findIndex(i => i.memberId === item.memberId);
        if (existingIndex >= 0) {
          const newItems = [...state.items];
          newItems[existingIndex] = item;
          return { items: newItems };
        }
        return { items: [...state.items, item] };
      }),
      
      removeItem: (memberId) => set((state) => ({
        items: state.items.filter(i => i.memberId !== memberId)
      })),
      
      updateYears: (memberId, years) => set((state) => ({
        items: state.items.map(i => 
          i.memberId === memberId ? { ...i, years } : i
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotalAmount: () => {
        const state = get();
        return state.items.reduce((sum, item) => 
          sum + (item.years.length * TARIFF_PER_YEAR), 0
        );
      },
      
      getTotalYears: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.years.length, 0);
      }
    }),
    {
      name: 'payment-cart-storage'
    }
  )
);
