import { create } from "zustand";


export const useStore = create((set) => ({
    testNum: 0,
    increaseTest: () => set((state: number) => ({ testNum: state.testNum + 1 })),
    removeAllTests: () => set({ testNum: 0 }),
}))

// need to learn statemanagement with zustand