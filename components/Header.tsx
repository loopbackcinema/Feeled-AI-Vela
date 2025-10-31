
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="w-full bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 text-center">
                <h1 className="text-3xl font-bold text-blue-600">FeelEd AI</h1>
                <p className="text-slate-500 mt-1">Feel the story. Learn naturally.</p>
            </div>
        </header>
    );
};

export default Header;
