import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import axios from "@/lib/axios";


export const useDataStore = create()(
    immer((set) => ({
        userData: null,

        setUserData: async (userID) => {
            const user = await axios.post("/api/user/get-user", { userID });
            set(() => ({
                userData: user.data
            }))
            // console.log(user.data);
            // console.log(useDataStore.getState().userData);
        },

    }))
);
