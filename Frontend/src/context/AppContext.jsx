import axios from "axios";
import { useState, useEffect, useContext, createContext} from "react";
import { server } from "../main";
import api from "../ApiIntercepter";

const AppContext = createContext(null);

export const AppProvider = ({children}) =>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    async function fetchUser() {
        setLoading(true)
        try {
            const {data} = await api.get(`/api/v1/me`);
            setUser(data)
            setIsAuth(true)
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchUser();
    }, []);

    return(
    <AppContext.Provider value={{ setIsAuth, isAuth, user, setUser, loading}}>
        {children}
    </AppContext.Provider>
    );
};

export const AppData = () =>{
    const context = useContext(AppContext)

    if(!context) throw new Error("AppData must be used within an AppProvider")
    return context;
}