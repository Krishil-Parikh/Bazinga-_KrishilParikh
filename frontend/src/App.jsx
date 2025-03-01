import { useEffect } from "react";
import Counter from "./components/Counter"
import toast, { Toaster } from 'react-hot-toast';
import { Button } from "@/components/ui/button";

const App = () => {

  useEffect(()=>{
    toast.success("Here is the toast!",{
      position:'bottom-center'
    });
  },[]);

  return (
    <>
      <Toaster/>
      <div className='App text-4xl bg-amber-300 h-screen flex flex-col items-center justify-center'>
        Boilerplate
        <Counter/>
        {/* ShadCN Working! */}
        <Button
          variant="solid"
          size="lg"
          className="mt-8 bg-green-500 text-white hover:bg-emerald-600"
        >
          Click Me
      </Button>
      </div>
      
    </>
  )
}

export default App
