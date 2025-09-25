import React from "react";

export default function Button({ children, variant = "primary" }) {
  const base =
    "px-6 py-3 rounded-lg font-medium transition-colors duration-200";

  const styles = {
    primary: `${base} bg-green-600 text-white hover:bg-green-700`,
    outline: `${base} border border-green-600 text-green-600 hover:bg-green-50`,
  };

  return <button className={styles[variant]}>{children}</button>;
}
