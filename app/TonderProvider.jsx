'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { InlineCheckout } from "tonder-web-sdk";

const TonderContext = createContext();

export const useTonder = () => {
  return useContext(TonderContext);
};

export const TonderProvider = ({ children }) => {
  const [tonderInstance, setTonderInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const init = async () => {
      try {
        const apiKey = "11e3d3c3e95e0eaabbcae61ebad34ee5f93c3d27"
        const baseUrl = "http://localhost:3000/"
        console.log('apiKey: ', apiKey)
        console.log('baseUrl: ', baseUrl)

        const inlineCheckout = new InlineCheckout({
          mode: 'stage',
          apiKey: apiKey,
          returnUrl: baseUrl + 'checkout',
          successUrl: baseUrl + 'success'
        });
        setTonderInstance(inlineCheckout);
      } catch (error) {
        console.error("Error initializing Tonder:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // if (loading) {
  //   return null
  // }

  return (
    <TonderContext.Provider value={tonderInstance}>
      {children}
    </TonderContext.Provider>
  );
};

