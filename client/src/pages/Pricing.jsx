import React from "react";

export default function Pricing() {

    const handlePaidClick = () => {
        alert("Payment integration coming soon");
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-16">

            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold">
                    Choose Your Plan
                </h1>

                <p className="text-stone-600 mt-3">
                    Flexible pricing for every stage of your career journey.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

                {/* FREE */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-2">Free</h2>
                    <p className="text-2xl font-bold mb-4">$0/month</p>

                    <ul className="space-y-2 text-sm mb-6">
                        <li>✓ Browse mentor profiles</li>
                        <li>✓ View ratings and reviews</li>
                        <li>✓ 1 session request per month</li>
                    </ul>

                    <a href="/register">
                        <button className="w-full bg-stone-900 text-amber-50 py-2 rounded hover:bg-stone-700 transition-colors">
                            Sign Up Free
                        </button>
                    </a>
                </div>

                {/* PRO */}
                <div className="bg-white p-6 rounded-xl shadow border-2 border-orange-400 relative">

          <span className="absolute top-2 right-2 text-xs bg-orange-400 text-white px-2 py-1 rounded">
            Most Popular
          </span>

                    <h2 className="text-xl font-semibold mb-2">Pro</h2>
                    <p className="text-2xl font-bold mb-4">$19/month</p>

                    <ul className="space-y-2 text-sm mb-6">
                        <li>✓ Unlimited session bookings</li>
                        <li>✓ Priority matching</li>
                        <li>✓ Messaging access</li>
                        <li>✓ Session summaries</li>
                    </ul>

                    <button
                        onClick={handlePaidClick}
                        className="w-full bg-orange-400 text-white py-2 rounded"
                    >
                        Subscribe
                    </button>
                </div>
                {/* PREMIUM */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-2">Premium</h2>
                    <p className="text-2xl font-bold mb-4">$49/month</p>

                    <ul className="space-y-2 text-sm mb-6">
                        <li>✓ Everything in Pro</li>
                        <li>✓ Dedicated mentor</li>
                        <li>✓ Resume review</li>
                        <li>✓ Priority support</li>
                    </ul>

                    <button
                        onClick={handlePaidClick}
                        className="w-full bg-orange-400 text-white py-2 rounded"
                    >
                        Subscribe
                    </button>
                </div>

            </div>

            <p className="text-center text-sm text-stone-500 mt-10">
                Not sure? Start free and upgrade anytime.
            </p>

        </div>
    );
}