import React, { createContext, useState, useContext, ReactNode } from "react";

interface User {
  firstName: string;
  lastName: string;
}

export interface CartItemInterface {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  cartNumber: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cartItems: CartItemInterface[];
  setCartItems: (items: CartItemInterface[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItemInterface[]>([]);

  return (
    <UserContext.Provider value={{ user, setUser, cartItems, setCartItems }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
