import { changeUserDetails } from "@/redux/UserSlice/UserSlice";
import axios from "axios";
import { Eye, EyeClosed } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [showPassword, setShowPassword] = useState(true);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        email:"",
        password:"",
    })
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setUserData((user) => {
            return {
                ...user,
                [field]: value
            };
        });
    }

    const loginUser = async() => {
        
        try {
            if(!userData.email || !userData.password){
                toast.error("Please Enter the credentials",{
                    position:'top-right',
                })
                return;
            }
            setLoading(true)
            const {data} = await axios.post('http://localhost:8000/auth/login', userData);
            console.log("User data : ",data);
            toast.success("Logged in successfully 🎉",{
                position:"top-right"
            })
            navigate('/moderator')
            // localStorage.setItem("airesumex_token", JSON.stringify(data.token));
            // localStorage.setItem("airesumex_user", JSON.stringify(data));
            // const userD = {
            //     email:data.email,
            //     username:data.username,
            //     name:data.name,
            // }
            localStorage.setItem("user", JSON.stringify(data));
            // dispatch(changeUserDetails(userD))
            setLoading(false);
        } catch (error) {
            console.log("Login failed", error);
            toast.error("Login Failed", {
                position:'top-right',
            })
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email / username <span className="text-red-400"> *</span>
                </label>
                <input
                    id="email"
                    type="text"
                    value={userData.email}
                    onChange={(e)=>handleChange("email", e.target.value)}
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Enter email or username"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-400"> *</span>
                </label>
                <div className="relative">
                    <input
                        id="password"
                        placeholder="Enter password"
                        value={userData.password}
                        type={showPassword ? "password": "text"}
                        onChange={(e)=>handleChange("password", e.target.value)}
                        className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    {showPassword ? 
                        <div onClick={()=>setShowPassword((prev)=>!prev)}>
                            <Eye 
                                className="absolute top-2 right-2.5 cursor-pointer" 
                                color="#696969" 
                                size={20} 
                            />
                        </div>
                        :
                        <div onClick={()=>setShowPassword((prev)=>!prev)}>
                            <EyeClosed 
                                className="absolute top-2 right-2.5 cursor-pointer" 
                                color="#696969" 
                                size={20} 
                            />
                        </div>
                    }
                </div>
            </div>
            <button
                type="button"
                onClick={()=>loginUser()}
                disabled={loading}
                className={`w-full flex justify-center items-center gap-3 px-4 py-2.5 text-sm text-[whitesmoke] font-[500] text-[1rem] bg-[#27912d] hover:bg-[#28852d] active:bg-[#26702a] transition duration-200 rounded-md hover:bg-primary-dark ${loading ? "bg-[#57914c]" : ""}`}
            >
                {loading 
                    && 
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                }
                {!loading ? "Login" : "Logging in"}
            </button>
        </div>
    )
}

export default Login