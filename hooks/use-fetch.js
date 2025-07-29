import { set } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

const useFetch = (cb) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fn = async(...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await cb(...args);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
            toast.error(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return {
        data,
        loading,
        error,
        fn,
        setData,
    };
}

export default useFetch;