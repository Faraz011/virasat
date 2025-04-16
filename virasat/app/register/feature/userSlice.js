import {createSlice} from '@reduxjs/toolkit';
import axios from 'axios'

//redister upi
export const register = createAsyncThunk('user/register',async(userData,{rejectWithValue})=>{
   try {
   const {data} = await axios.post(api/v1/register,userData,config)
   console.log('Registration data' );
   return data
    }
   
   catch(error){
    return rejectWithValue(error.response?.data || 'an error occurred')
   }
})

const userSlice = createSlice({
    name: 'user',                   
    initialState: {
        user: null,
        loading: false,
        error: null,
        success:false,
        isAuthenticated: false
    },
    reducers: {
        removeErrors:(state)=>{
            state.error = null
        },
        removeSuccess:(state)=>{
            state.success = null
        }
    }
    
})

export const {removeError,removeSuccess}=userSlice.actions;
export default userSlice.reducer;