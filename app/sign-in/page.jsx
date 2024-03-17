'use client'
import { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth'
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/firebaseConfig'
import { useRouter } from 'next/navigation';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
    const [signInWithGoogle] = useSignInWithGoogle(auth);
    const router = useRouter()

    const handleSignInEmail = async () => {
        try {
            const res = await signInWithEmailAndPassword(email, password);
            console.log({res});
            sessionStorage.setItem('user', true)
            setEmail('');
            setPassword('');
            router.push('/')
        } catch(e){
            console.error(e)
        }
    };

    const handleSignInWithGoogle = async () => {
        try {
            const res = await signInWithGoogle();
            console.log({ res });
            sessionStorage.setItem('user', true);
            router.push('/');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
            <h1 className="text-white text-2xl mb-5">Sign In</h1>
            <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            />
            <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            />
            <button 
            onClick={handleSignInEmail}
            className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
            >
            Sign In
            </button>

            <button
            onClick={handleSignInWithGoogle}
            className="w-full p-3 mt-4 flex justify-center items-center gap-2 bg-white rounded shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
            <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo"/>
            <span>Sign In with Google</span>
            </button>

            <button
            onClick={() => router.push('/sign-up')} 
            className="w-full p-3 mt-4 bg-gray-700 rounded text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
            Sign Up
            </button>
        </div>
        </div>
    );
};

export default SignIn;