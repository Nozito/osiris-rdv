import React from 'react';

export function Footer() {
    return (
        <footer className="border-t border-white/8 py-8 mt-16">
            <div className="container mx-auto max-w-7xl px-6 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Osiris. All rights reserved.
            </div>
        </footer>
    );
}
