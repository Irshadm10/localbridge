import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Contact() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-6">Contact Support</h1>
            <p className="text-lg text-gray-700 mb-10">We're here to help. Reach out and we'll respond within 24 hours.</p>

            <div className="grid md:grid-cols-2 gap-10">
                <div>
                    <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3"><Mail className="mt-1 text-blue-600" size={20} /><div><p className="font-semibold">Email</p><p className="text-gray-700">support@yourbrand.com</p></div></div>
                        <div className="flex items-start gap-3"><Phone className="mt-1 text-blue-600" size={20} /><div><p className="font-semibold">Phone</p><p className="text-gray-700">+1 (555) 123-4567</p></div></div>
                        <div className="flex items-start gap-3"><MapPin className="mt-1 text-blue-600" size={20} /><div><p className="font-semibold">Office</p><p className="text-gray-700">525 Market Street, San Francisco, CA 94105</p></div></div>
                        <div className="flex items-start gap-3"><Clock className="mt-1 text-blue-600" size={20} /><div><p className="font-semibold">Hours</p><p className="text-gray-700">Mon–Fri, 9am–6pm PT</p></div></div>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Your name" className="w-full border border-gray-300 rounded-lg px-4 py-3" />
                        <input type="email" placeholder="Your email" className="w-full border border-gray-300 rounded-lg px-4 py-3" />
                        <input type="text" placeholder="Subject" className="w-full border border-gray-300 rounded-lg px-4 py-3" />
                        <textarea placeholder="Your message" rows="5" className="w-full border border-gray-300 rounded-lg px-4 py-3"></textarea>
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">Send Message</button>
                    </div>
                </div>
            </div>
        </div>
    );
}