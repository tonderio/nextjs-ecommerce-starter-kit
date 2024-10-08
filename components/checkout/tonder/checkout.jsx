'use client';

import { useCart } from 'boundless-commerce-components/dist/client';
import { useEffect, useState, useCallback } from 'react';
import { useTonder, TonderProvider } from '@/app/TonderProvider';
import Script from 'next/script';
import { apiClient } from '@/lib/api';
import { useCustomer } from 'boundless-commerce-components/dist/client';

const defaultCustomer = {
  firstName: "Adrian",
  lastName: "Martinez",
  country: "Mexico",
  address: "Pinos 507, Col El Tecuan",
  city: "Durango",
  state: "Durango",
  postCode: "34105",
  email: "adrian@email.com",
  phone: "8161234567",
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

function validateAndParseFloat(item, field) {
  const value = field.split('.').reduce((o, key) => (o || {})[key], item);
  if (value === null || value === undefined) {
    return 0;
  }
  return parseFloat(value);
}

function CheckoutContent() {
  const tonder = useTonder();
  const [loading, setLoading] = useState(false)
  const { cartId, clearCart, setTotal } = useCart();
  const { items, isLoading, setItems } = useFetchCartItems();
  const { customer, logout, customerIsInited } = useCustomer();

  const pay = async () => {
    try {
      setLoading(true)
      localStorage.setItem('itemsToClear', JSON.stringify({ cartId, items }));
      const response = await tonder.payment({
        customer: {
          ...(!!customer ?
            {
              ...defaultCustomer,
              firstName: customer.first_name,
              lastName: customer.last_name,
              email: customer.email
            }
            : {
              ...defaultCustomer,
            })
        },
        cart: {
          total: parseFloat((items.reduce((total, item) => {
            return total + item.qty * validateAndParseFloat(item, "itemPrice.final_price");
          }, 0)).toFixed(2)),
          items: items.map((item) => {
            const final_price = validateAndParseFloat(item, "itemPrice.final_price")
            return {
              description: item.vwItem.product.title,
              quantity: item.qty,
              price_unit: final_price,
              discount: validateAndParseFloat(item, "itemPrice.discount_amount"),
              taxes: 0,
              product_reference: item.vwItem.product.product_id,
              name: item.vwItem.product.title,
              amount_total: parseFloat((item.qty * final_price).toFixed(2)),
            }
          })
        }
      });
      console.log("response", response)
      items.forEach((itm) => {
        console.log("asoa***s", cartId, itm.item_id)

        apiClient.cart.removeFromCart(cartId, [itm.item_id]);
      })
      setTotal({
        qty: 0,
        total: "0"
      })
      localStorage.setItem('itemsToClear', JSON.stringify({ cartId, items }));
      alert('Pago realizado con éxito');
    } catch (error) {
      console.log("error: ", error)
      alert('Error al realizar el pago')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (!tonder) return;
    tonder.configureCheckout({ customer: { email: customer && customer.email ? this.customer.email : defaultCustomer.email } })
    tonder.injectCheckout('tonder-checkout');
    tonder.verify3dsTransaction().then(response => {
      console.log('Verify 3ds response', response)
      if(response && response.transaction_status && response.transaction_status.toLowerCase() === 'sucess'){
        const itemsToClear = JSON.parse(localStorage.getItem('itemsToClear') ?? "{}");
        if (itemsToClear && itemsToClear.items && itemsToClear.items.length > 0) {
          itemsToClear.items.forEach((item) => {
            apiClient.cart.removeFromCart(itemsToClear.cartId, [item.item_id]);
          });
          if (setTotal) {
            setTotal({
              qty: 0,
              total: "0"
            })
          }
          localStorage.removeItem('itemsToClear');
        }
      }
    })
    return () => {
      if (tonder.removeCheckout) {
        tonder.removeCheckout();
      }
    };
  }, [tonder]);


  return (

    <div className={'mx-auto'} style={{ maxWidth: '900px' }}>
      <div id="tonder-checkout"></div>
      <div className={'d-flex justify-content-center mt-5'}>
        <button onClick={pay} disabled={loading}>{loading ? 'Procesando...' : 'Pagar'}</button>
      </div>
    </div>
  );
}
const useFetchCartItems = () => {
  const { cartId } = useCart();
  const [items, setItems] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const fetchCartItems = useCallback(() => {
    if (!cartId) {
      throw new Error('Attempt to fetch with empty cartId. If it is loaded?');
    }

    setIsLoading(true);
    apiClient.cart.getCartItems(cartId)
      .then(({ cart, items }) => {
        setItems(items);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [cartId]);

  useEffect(() => {
    if (cartId && !items) {
      fetchCartItems();
    }
  }, [cartId]);//eslint-disable-line

  return {
    items,
    setItems,
    isLoading,
    fetchCartItems
  };
};