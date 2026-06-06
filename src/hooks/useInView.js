import { useState, useEffect, useRef } from 'react';
const useInView = (options = {}) => {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
        }, options);
        observer.observe(element);
        return () => {
            if (element) { observer.unobserve(element);}
        };
    },[options.root, options.rootMargin, options.threshold]);
    return [ref, isInView];
};

export default useInView;