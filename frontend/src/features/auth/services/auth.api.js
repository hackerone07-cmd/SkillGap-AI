import axios from "axios"


const api = axios.create({
    baseURL: "http://localhost/3000",
    withCredentials: true   
})

async function register({username,email,password}){
    try {
        const response  =  api.post('/api/auth/register', {
            username,email,password
        })
        return response.data
    } catch (error) {
        console.log(error);
    }
}

async function login({email,password}){
    try {
        const response  =  api.post('/api/auth/login', {
            email,password
        })

        return response.data
    } catch (error) {
        console.log(error);
    }
}
async function logout(){
    try {
        const response  =  api.post('/api/auth/logout')
    } catch (error) {
        console.log(error);
    }
}

async function getme(){
    try {
        const response  =  api.post('/api/auth/get-me')
        return response.data
    } catch (error) {
        console.log(error);
    }
}

export {
    login,
    register,
    getme,
    logout,
}