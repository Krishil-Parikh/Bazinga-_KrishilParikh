import "./Navbar.css";
const Navbar = () => {
    return (
        <nav className="absolute top-0 left-0 w-[100%] px-6 py-6 border-b-2 shadow-sm">
            <p className="logo cursor-pointer" style={{marginBottom:0, fontSize:"1.4rem"}}>Clairva AI</p>
        </nav>
    )
}

export default Navbar