import { Shield, Lock, CheckCircle, Users } from 'lucide-react';

export default function Trust() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-6">Trust & Safety</h1>
            <p className="text-lg text-gray-700 mb-12">Your safety and security are non-negotiable. Here's how we protect our community.</p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="border border-gray-200 rounded-lg p-6"><Shield className="text-blue-600 mb-3" size={32} /><h3 className="font-semibold text-lg mb-2">Verified Mentors</h3><p className="text-gray-700">Every mentor passes identity verification, credential checks, and a live interview before being listed.</p></div>
                <div className="border border-gray-200 rounded-lg p-6"><Lock className="text-blue-600 mb-3" size={32} /><h3 className="font-semibold text-lg mb-2">Secure Payments</h3><p className="text-gray-700">All transactions are processed through PCI-compliant providers. We never store your card details.</p></div>
                <div className="border border-gray-200 rounded-lg p-6"><CheckCircle className="text-blue-600 mb-3" size={32} /><h3 className="font-semibold text-lg mb-2">Satisfaction Guarantee</h3><p className="text-gray-700">If a session doesn't meet expectations, we'll refund you within 48 hours — no questions asked.</p></div>
                <div className="border border-gray-200 rounded-lg p-6"><Users className="text-blue-600 mb-3" size={32} /><h3 className="font-semibold text-lg mb-2">Community Standards</h3><p className="text-gray-700">We enforce strict conduct guidelines. Violations result in immediate removal from the platform.</p></div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Report a Concern</h2>
            <p className="text-gray-700 mb-4">If you've experienced or witnessed behavior that violates our standards, contact our Trust & Safety team at <a className="text-blue-600" href="mailto:trust@yourbrand.com">trust@yourbrand.com</a>. All reports are confidential and reviewed within 24 hours.</p>
        </div>
    );
}