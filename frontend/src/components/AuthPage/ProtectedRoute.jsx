import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { verify } from "@/utils/verify";
import Loading from "../Loading/Loading";

const ProtectedRoute = () => {
    const [isVerified, setIsVerified] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const { message } = await verify();
                setIsVerified(message);
            } catch (error) {
                console.error("Verification failed:", error);
                setIsVerified(false);
            }
        };
        verifyUser();
    }, []);

    if (isVerified === "") {
        return <Loading/>; 
    }

    if (isVerified!="Authenticated") {
        navigate("/");
        return null;
    }

    return <Outlet/>
};

export default ProtectedRoute;
