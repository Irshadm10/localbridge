import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="relative z-10 bg-[#0d1117] text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Column 1 — Brand */}
          <div className="space-y-4">
            <p className="text-xl font-bold text-white">Bridge</p>
            <p className="text-sm leading-relaxed">
              Connecting mentors and learners worldwide.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a href="#" aria-label="Facebook" className="transition hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="X (Twitter)" className="transition hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="transition hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="transition hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="transition hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 — Company */}
          <div className="space-y-4">
            <p className="font-bold text-white">Company</p>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'About Us',  to: '/about'    },
                { label: 'Mentors',   to: '/mentors'  },
                { label: 'Pricing',   to: '/pricing'  },
                { label: 'Careers',   to: '/careers'  },
                { label: 'Blog',      to: '/blog'     },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="transition hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Support */}
          <div className="space-y-4">
            <p className="font-bold text-white">Support</p>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'FAQ',             to: '/faq'       },
                { label: 'Contact Support', to: '/contact'   },
                { label: 'Help Center',     to: '/help'      },
                { label: 'Trust & Safety',  to: '/trust'     },
                { label: 'Community',       to: '/community' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="transition hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div className="space-y-4">
            <p className="font-bold text-white">Contact</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gray-500" />
                <span>support@bridge.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gray-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-gray-500" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
            <form
              onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
              className="mt-4 flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Bridge. All rights reserved.</p>
          <div className="flex gap-6">
            {[
              { label: 'Privacy Policy', to: '/privacy' },
              { label: 'Terms of Use',   to: '/terms'   },
              { label: 'Cookie Policy',  to: '/cookies' },
            ].map(({ label, to }) => (
              <Link key={label} to={to} className="transition hover:text-white">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
