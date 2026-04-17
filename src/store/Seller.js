import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useSellerStore = create(immer((set) => ({
    imgUrls: [],
    shouldResetUrls: false,

    setImgUrls(imgUrl) {
        set((state) => ({
            imgUrls: [...state.imgUrls, imgUrl],
        }));
    },

    clearImgUrls(imgUrl) {
        set((state) => ({
            imgUrls: state.imgUrls.filter((url) => url !== imgUrl),
        }));
    },
    

    resetImgUrls() {
        set(() => ({
            imgUrls: [],
        }))
    },

    setResetUrls() {
        set(() => ({
            shouldResetUrls: true,
        }))
    },

    unsetResetUrls() {
        set(() => ({
            shouldResetUrls: false,
        }))
    },

    
})));
