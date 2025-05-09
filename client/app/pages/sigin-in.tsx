import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  
  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("../features");
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <SignIn 
          path="/sign-in" 
          routing="path" 
          signUpUrl="/sign-up"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-none",
              footer: "text-center"
            }
          }}
        />
      </div>
    </div>
  );
}