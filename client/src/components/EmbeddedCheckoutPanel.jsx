import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function EmbeddedCheckoutPanel({ clientSecret, onClose }) {
    if (!clientSecret) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-stone-950/70 px-4 py-8 backdrop-blur-sm">
            <div className="mx-auto max-w-3xl rounded-3xl bg-white p-4 shadow-2xl">
                <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                    <div>
                        <h2 className="text-lg font-semibold text-stone-900">Complete payment</h2>
                        <p className="text-sm text-stone-500">Secure checkout powered by Stripe test mode.</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                    >
                        Close
                    </button>
                </div>

                <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ clientSecret }}
                >
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            </div>
        </div>
    );
}