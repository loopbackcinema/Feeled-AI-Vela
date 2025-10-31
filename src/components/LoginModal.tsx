import React, { useState } from 'react';

interface LoginModalProps {
    onClose: () => void;
    onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
    const [role, setRole] = useState<'teacher' | 'student' | 'parent'>('teacher');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full transform transition-all animate-fade-in-up">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Continue Your Journey</h2>
                    <p className="text-slate-500 mt-2">Sign up to save your stories and unlock more features!</p>
                </div>

                <div className="mt-6">
                    <label htmlFor="role" className="block text-sm font-medium text-slate-600 mb-1">I am a...</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'teacher' | 'student' | 'parent')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    >
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                        <option value="parent">Parent</option>
                    </select>
                </div>
                
                <div className="mt-6">
                    <button 
                        onClick={onLoginSuccess}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition flex items-center justify-center space-x-2"
                    >
                         <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 266.3 0 130.4 109.8 20.6 244 20.6c68.8 0 128.8 27.2 173.4 68.6l-69.3 69.3c-24.5-23-58.6-37-99.1-37-79.6 0-144.2 64.6-144.2 144.2s64.6 144.2 144.2 144.2c92.8 0 124.9-72.3 129.2-108.2H244V261.8h244z"></path></svg>
                        <span>Sign in with Google</span>
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-sm font-medium">
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
