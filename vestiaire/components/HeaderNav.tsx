'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { handleSignOut } from '@/app/login/actions';

export interface HeaderNavProps {
  userEmail?: string | null;
}

export function HeaderNav({ userEmail }: HeaderNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  return (
    <header className="w-full bg-white border-b border-[#EEEEEE] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Title */}
        <Link href={userEmail ? '/closet' : '/'} className="flex flex-col">
          <span className="text-xl font-extrabold tracking-wider text-[#121212] uppercase">
            VESTIAIRE
          </span>
          <span className="text-[10px] font-bold tracking-widest text-[#5B1422] uppercase">
            CLOSET EDITORIAL
          </span>
        </Link>

        {/* Navigation Actions */}
        {userEmail ? (
          /* LOGGED IN: User Avatar Badge & Dropdown */
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 py-1.5 px-3 bg-[#FAFAFA] hover:bg-[#F4F4F4] border border-[#EEEEEE] rounded-full transition focus:outline-none"
              aria-label="User Account Menu"
              aria-expanded={menuOpen}
            >
              <div className="w-7 h-7 rounded-full bg-[#5B1422] text-white flex items-center justify-center text-xs font-bold uppercase">
                {userInitial}
              </div>
              <span className="text-xs font-semibold text-[#121212] max-w-[120px] truncate hidden sm:inline-block">
                {userEmail}
              </span>
              <svg className="w-3.5 h-3.5 text-[#525252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#EEEEEE] rounded-lg shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2.5 border-b border-[#EEEEEE]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#525252]">Signed in as</p>
                  <p className="text-xs font-semibold text-[#121212] truncate mt-0.5">{userEmail}</p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-xs font-semibold text-[#121212] hover:bg-[#FAFAFA] hover:text-[#5B1422] transition"
                >
                  Profile & Settings
                </Link>

                <Link
                  href="/closet"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-xs font-semibold text-[#121212] hover:bg-[#FAFAFA] hover:text-[#5B1422] transition"
                >
                  Your Closet Dashboard
                </Link>

                <div className="border-t border-[#EEEEEE] mt-1 pt-1">
                  <form action={handleSignOut}>
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* LOGGED OUT: Sign In & Create Account Links */
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="py-2 px-4 bg-white border border-[#EEEEEE] hover:border-[#5B1422] hover:text-[#5B1422] text-xs font-semibold uppercase tracking-wider text-[#121212] rounded-md transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="py-2 px-4 bg-[#5B1422] hover:bg-[#450F1A] text-xs font-semibold uppercase tracking-wider text-white rounded-md transition shadow-xs"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
