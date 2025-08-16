import Link from "next/link";

export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
			<header className="border-b border-white/10 sticky top-0 bg-black/40 backdrop-blur">
				<nav className="mx-auto flex max-w-5xl items-center justify-between p-4 text-sm">
					<div className="flex items-center gap-4">
						<Link href="/" className="hover:underline">
							Home
						</Link>
						<Link href="/articles" className="hover:underline">
							Public Articles
						</Link>
					</div>
					<div className="flex items-center gap-4">
						<Link href="/protected" className="hover:underline">
							Protected Index
						</Link>
						<Link href="/protected/articles/intro" className="hover:underline">
							Intro
						</Link>
						<Link href="/protected/articles/advanced" className="hover:underline">
							Advanced
						</Link>
					</div>
				</nav>
			</header>
			<main className="mx-auto max-w-5xl p-6">{children}</main>
		</div>
	);
}


