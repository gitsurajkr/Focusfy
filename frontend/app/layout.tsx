import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';
import ClientLayout from './components/ClientLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: "Focusfy",
  description: "Craft your productivity, block by block!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastClassName="minecraft-toast"
          />
        </AuthProvider>
      </body>
    </html>
  );
}


