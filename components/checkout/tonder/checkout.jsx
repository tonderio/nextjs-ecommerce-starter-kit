'use client';

import {useCart} from 'boundless-commerce-components/dist/client';
import {useEffect, useState} from 'react';
import { useTonder, TonderProvider } from '@/app/TonderProvider';
import Script from 'next/script';

const checkoutData = {
  customer: {
    firstName: "Adrian",
    lastName: "Martinez",
    country: "Mexico",
    address: "Pinos 507, Col El Tecuan",
    city: "Durango",
    state: "Durango",
    postCode: "34105",
    email: "adrian@email.com",
    phone: "8161234567",
  },
  currency: 'mxn',
  cart: {
    total: 399,
    items: [
      {
        description: "Black T-Shirt",
        quantity: 1,
        price_unit: 1,
        discount: 0,
        taxes: 0,
        product_reference: 1,
        name: "T-Shirt",
        amount_total: 399,
      },
    ]
  },
  card: { "skyflow_id": "53ca875c-16fd-4395-8ac9-c756613dbaf9" },
  metadata: {
    order_id: 123456
  }
};

export default function TonderCheckout() {

  return (
    <div id="checkout">
      <Script src="https://js.skyflow.com/v1/index.js" strategy="afterInteractive" />
      <Script src="https://openpay.s3.amazonaws.com/openpay.v1.min.js" strategy="afterInteractive" />
      <Script src="https://openpay.s3.amazonaws.com/openpay-data.v1.min.js" strategy="afterInteractive" />
      <TonderProvider>
        <CheckoutContent />
      </TonderProvider>
    </div>
  );
}

function CheckoutContent() {
  const tonder = useTonder();
  const [loading, setLoading] = useState(false)
  const { cartId } = useCart();


  const pay = async () => {
    try {
      setLoading(true)
      const response = await tonder.payment(checkoutData);
      console.log(response)
      alert('Pago realizado con éxito');
    } catch (error) {
      alert('Error al realizar el pago')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (!tonder) return;

    tonder.injectCheckout('tonder-checkout');
    return () => {
      if (tonder.removeCheckout) {
        tonder.removeCheckout();
      }
    };
  }, [tonder]);
  

  return (
    
    <div className={'mx-auto'} style={{maxWidth: '900px'}}>
      <div id="tonder-checkout"></div>
      <div className={'d-flex justify-content-center mt-5'}>
        <button onClick={pay} disabled={loading}>{loading ? 'Procesando...':'Pagar'}</button>
      </div>
    </div>
  );
}
