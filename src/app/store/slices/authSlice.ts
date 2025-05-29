import { JWTToken } from "@/lib/jwtTokenManagement";
import { createSlice } from "@reduxjs/toolkit";

interface SliceType{
    user: JWTToken | null;
    isAuthenticated: boolean
}

const initialState : SliceType = {
    user: null,
    isAuthenticated: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false
        }
    }
})

export const { setUser, logout } = authSlice.actions
export default authSlice.reducer