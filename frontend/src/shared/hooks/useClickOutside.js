import { useEffect, useRef } from "react";

export function useClickOutside(handler) {
  const domRef = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      if (!domRef.current || domRef.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler]);

  return domRef;
}

export default useClickOutside;

