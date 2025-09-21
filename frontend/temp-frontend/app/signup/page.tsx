// app/signup/page.tsx
'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const VideoBackground = () => (
  <div className="absolute inset-0 z-0">
    <video
      autoPlay
      loop
      muted
      className="w-full h-full object-cover"
      src="/5692315-hd_1920_1080_30fps.mp4"
    />
    <div className="absolute inset-0 bg-black bg-opacity-40" />
  </div>
);

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({ firstname: '', lastname: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // On successful signup, save userId and redirect to the first onboarding step
      sessionStorage.setItem('userId', data.userId);
      router.push(`/onboarding/personality-test?userId=${data.userId}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-[100dvh] w-full overflow-hidden relative">
      <VideoBackground />
      <div className="relative z-10 h-full flex items-center justify-center px-4 dark">
        <div className="bg-black bg-opacity-50 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 p-8 w-full max-w-md">
          <h2 className="font-bold text-xl text-neutral-200">Create your account</h2>
          <p className="text-neutral-300 text-sm max-w-sm mt-2">Join Eunoia to start your mental wellness journey.</p>
          
          {error && <p className="text-red-500 text-sm mt-4 text-center bg-red-500/10 p-2 rounded-md">{error}</p>}

          <form className="my-8" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <LabelInputContainer>
                <Label htmlFor="firstname">First name</Label>
                <Input id="firstname" placeholder="Goutam" type="text" value={formData.firstname} onChange={handleChange} required />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastname">Last name</Label>
                <Input id="lastname" placeholder="kumar" type="text" value={formData.lastname} onChange={handleChange} required />
              </LabelInputContainer>
            </div>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" placeholder="projectmayhem@fc.com" type="email" value={formData.email} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="••••••••" type="password" value={formData.password} onChange={handleChange} required />
            </LabelInputContainer>
            
            <button
              className="bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 block bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign up →'}
              <BottomGradient />
            </button>
            <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />
          </form>
           <p className="text-sm text-center mt-6 text-neutral-300">
             Already have an account?{' '}
             <Link href="/login" className="text-blue-400 font-semibold hover:underline">
               Log in here
             </Link>
           </p>
        </div>
      </div>
    </main>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};
const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string; }) => <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;