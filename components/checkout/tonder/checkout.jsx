'use client';

import {useCart} from 'boundless-commerce-components/dist/client';
import {useState, useEffect} from 'react';
import LoadingScreen from '@/components/loadingScreen';
import { useTonder, TonderProvider } from '@/app/TonderProvider';


export default function StripeCheckout() {
  const tonder = useTonder()
  const {cartId} = useCart();

  useEffect(() => {
    if (!tonder) return
    tonder.injectCheckout()
    return () => tonder.removeCheckout()
  }, [tonder])

  return (
    <div id="checkout">
      <TonderProvider>
        <div className={'mx-auto'} style={{maxWidth: '900px'}}>
          <div id="tonder-checkout"></div>
        </div>
      </TonderProvider>
    </div>
  );
}
