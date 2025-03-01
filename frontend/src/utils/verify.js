//Refactored : 
import axios from "axios";
const verify = async() => {
    const tokenInStorage = JSON.parse(localStorage.getItem('airesumex_token'));
    try {
        const config = {
            headers:{
                'Content-type' : 'application/json',
                'Authorization': `Bearer ${tokenInStorage}`
            }
        }
        const response = await axios.get('http://localhost:8500/user/verify', config);
        return (response.data);
    } catch (error) {
        console.log(error);
        return false;
    }
}

export {verify};