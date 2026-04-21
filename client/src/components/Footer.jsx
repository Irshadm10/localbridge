import { Link } from 'react-router-dom';
import { Facebook, X, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-white text-xl font-bold mb-4">YourBrand</h3>
                    <p className="text-sm mb-4">Connecting mentors and learners worldwide.</p>
                    <div className="flex gap-3">
                        <a href="#"><Facebook size={20} /></a>
                        <a href="#"><X size={20} /></a>
                        <a href="#"><Instagram size={20} /></a>
                        <a href="#"><Linkedin size={20} /></a>
                        <a href="#"><Youtube size={20} /></a>
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-4">Company</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/mentors">Mentors</Link></li>
                        <li><Link to="/pricing">Pricing</Link></li>
                        <li><Link to="/careers">Careers</Link></li>
                        <li><Link to="/blog">Blog</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-4">Support</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/faq">FAQ</Link></li>
                        <li><Link to="/contact">Contact Support</Link></li>
                        <li><Link to="/help">Help Center</Link></li>
                        <li><Link to="/trust">Trust & Safety</Link></li>
                        <li><Link to="/community">Community</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-4">Contact</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><Mail size={16} /> support@yourbrand.com</li>
                        <li className="flex items-center gap-2"><Phone size={16} /> +1 (555) 123-4567</li>
                        <li className="flex items-center gap-2"><MapPin size={16} /> San Francisco, CA</li>
                    </ul>
                    <form className="mt-4 flex">
                        <input type="email" placeholder="Your email" className="px-3 py-2 rounded-l bg-gray-800 text-sm w-full" />
                        <button className="bg-blue-600 px-4 rounded-r text-white text-sm">Subscribe</button>
                    </form>
                </div>
            </div>

            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between text-sm">
                    <p>© {new Date().getFullYear()} YourBrand. All rights reserved.</p>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Use</Link>
                        <Link to="/cookies">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}