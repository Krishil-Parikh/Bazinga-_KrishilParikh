import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/"); // Redirects to home
    };

    return (
        <nav className="absolute top-0 left-0 w-[100%] h-[5rem] px-6 py-6 border-b-2 shadow-sm flex justify-between items-center">
            <p className="logo cursor-pointer" style={{ marginBottom: 0, fontSize: "1.4rem" }}>
                Clairva AI
            </p>
            {user && (
                <button 
                    onClick={handleLogout} 
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Logout
                </button>
            )}
        </nav>
    );
};

export default Navbar;
