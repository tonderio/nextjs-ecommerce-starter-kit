import TonderCheckout from '@/components/checkout/tonder/checkout';

export default function TonderCheckoutPage() {
  return (
    <div className={'container'}>
      <TonderCheckout />
    </div>
  );
}

export const metadata = {
  robots: 'noindex',
  title: 'Tonder Checkout'
};
