import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../redux/CounterSlice/CounterSlice';

const Counter = () => {
    const count = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();

    return (
        <div className='flex flex-col items-center mt-10'>
            <p>Count: {count}</p>
            <div className='flex items-center gap-[3rem] mt-4'>
                <button onClick={() => dispatch(decrement())}>Decrement</button>
                <button onClick={() => dispatch(increment())}>Increment</button>
            </div>
        </div>
    );
};

export default Counter;
