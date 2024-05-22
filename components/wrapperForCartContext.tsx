'use client';

import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';
import {BoundlessCart, useCart} from 'boundless-commerce-components/dist/client';
import {apiClient} from '@/lib/api';
import {IAddToCartResponse} from 'boundless-api-client';
import ProductAddedDialog from '@/components/wrapperForCartContext/productAddedDialog';
import SelectVariantDialog from '@/components/wrapperForCartContext/selectVariantDialog';
import CartFAB from '@/components/cart/fab';
import {usePathname} from 'next/navigation';

export default function WrapperForCartContext({children}: {children: ReactNode}) {
	const pathname = usePathname();
	const { setTotal } = useCart();
	const [addedToCart, setAddedToCart] = useState<IAddToCartResponse>();
	const [neededSelectVariant, setNeededSelectVariant] = useState<IAddToCartResponse>();

	const onProductAddedToCart = useCallback((result: IAddToCartResponse) => setAddedToCart(result), []);
	const onNeededSelectVariant = useCallback((result: IAddToCartResponse) => setNeededSelectVariant(result), []);

	const showCart = useMemo(() => {
		if (pathname.startsWith('/stripe') || pathname.startsWith('/boundless-checkout') || pathname.startsWith('/cart')) {
			return false;
		}

		return true;
	}, [pathname]);

	useEffect(() => {
		const itemsToClear = JSON.parse(localStorage.getItem('itemsToClear') ?? "{}");
		if (itemsToClear && itemsToClear.items && itemsToClear.items.length > 0) {
			itemsToClear.items.forEach((itemId: number) => {
		    apiClient.cart.removeFromCart(itemsToClear.cartId, [itemId]);
		  });
		  if(setTotal){
			setTotal({
				qty: 0,
				total: "0"
			})
		  }
		  localStorage.removeItem('itemsToClear');
		}
	  }, [])

	return (
		<BoundlessCart
			apiClient={apiClient}
			onProductAddedToCart={onProductAddedToCart}
			onNeededSelectVariant={onNeededSelectVariant}
		>
			{children}
			{showCart && <CartFAB />}
			<ProductAddedDialog
				open={Boolean(addedToCart)}
				onClose={() => setAddedToCart(undefined)}
				addedToCart={addedToCart}
			/>
			<SelectVariantDialog
				open={Boolean(neededSelectVariant)}
				onClose={() => setNeededSelectVariant(undefined)}
				neededSelectVariant={neededSelectVariant}
			/>
		</BoundlessCart>
	);
}

