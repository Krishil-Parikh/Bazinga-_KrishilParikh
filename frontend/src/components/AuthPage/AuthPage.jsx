import { useState } from "react"
import Login from "../Login/Login"
import Signup from "../Signup/Signup"

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState("login")
    return (
        <div className="flex min-h-screen w-full justify-center">
            <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <h2 className="mt-16 text-3xl font-extrabold text-center text-gray-900">{activeTab==="login" ? "Welcome back!" : "Create an account"}</h2>
                <div className="w-full max-w-sm mx-auto lg:w-96">
                    <div className="mt-6">
                        <div className="flex border-b border-gray-200">
                        <button
                            className={`flex-1 py-2 px-4 text-center ${
                            activeTab === "login" ? "border-b-2 border-gray-500 border-primary font-medium text-primary" : "text-gray-500"}`}
                            onClick={() => setActiveTab("login")}
                        >
                            Login
                        </button>
                        <button
                            className={`flex-1 py-2 px-4 text-center ${
                            activeTab === "signup" ? "border-b-2 border-gray-500 border-primary font-medium text-primary" : "text-gray-500"}`}
                            onClick={() => setActiveTab("signup")}
                        >
                            Sign up
                        </button>
                        </div>
                        <div className="mt-6">{activeTab === "login" ? <Login /> : <Signup />}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPage