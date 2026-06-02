import "./globals.css";

export const metadata = {
  title: "CashPay — Bitcoin Payment",
  description: "Send Bitcoin payments instantly and securely. Simple, fast, and reliable cryptocurrency payment gateway.",
  keywords: "bitcoin, payment, cryptocurrency, BTC, send money, QR code",
  openGraph: {
    title: "CashPay — Bitcoin Payment",
    description: "Send Bitcoin payments instantly and securely.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" />
        <meta name="theme-color" content="#F7931A" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>₿</text></svg>" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
