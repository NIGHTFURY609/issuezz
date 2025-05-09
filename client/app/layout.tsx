import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import {Josefin_Sans,Urbanist,Oswald,Roboto,Noto_Sans_Cuneiform, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const oswald=Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200","300","400", "500", "600", "700"], 
});


const josefinSans=Josefin_Sans({
  variable: "--font-josefinsans",
  subsets: ["latin"],
  weight: ["100","200","300","400", "500", "600", "700"], 
});

const urbanist=Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["100","200","300","400", "500", "600", "700","800","900"], 
});

const roboto=Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: [ "700","400"], 
});

const noto=Noto_Sans_Cuneiform({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400"], 
});
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "issuezz",
  description: "your one and only Open Source Contirbution Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${josefinSans.variable} ${urbanist.variable} ${noto.variable} ${roboto.variable} ${oswald.variable} antialiased ${geistSans.variable} ${geistMono.variable}`}>
          <header className="flex justify-end items-center p-4 gap-4 h-16 bg-orange-300">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="font-sans bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-lg
              flex items-center space-x-2 
              hover:shadow-lg hover:translate-y-px transition-all duration-200 
              shadow-lg font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="font-sans bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-lg
              flex items-center space-x-2 
              hover:shadow-lg hover:translate-y-px transition-all duration-200 
              shadow-lg font-medium">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonBox: "flex items-center gap-2"
                  }
                }}
                showName={true}
              />
            </SignedIn>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
export const dynamic = "force-dynamic";
