import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif, DM_Sans } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const instrumentSerif = Instrument_Serif({
	variable: '--font-instrument-serif',
	subsets: ['latin'],
	display: 'swap',
	weight: '400',
});

const dmSans = DM_Sans({
	variable: '--font-dm-sans',
	subsets: ['latin'],
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'Productico',
	description: 'Own your business now.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${dmSans.variable} antialiased`}>
				{children}
			</body>
		</html>
	);
}
