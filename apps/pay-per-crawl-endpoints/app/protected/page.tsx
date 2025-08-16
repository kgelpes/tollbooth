import Link from "next/link";

export default function ProtectedPage() {
	const rainbowColors = [
		"#ff0000",
		"#ff7f00",
		"#ffff00",
		"#00ff00",
		"#0000ff",
		"#4b0082",
		"#9400d3",
		"#ff69b4",
	];
	const floatingEmojis = ["🍭", "🎈", "🎪", "🎨", "🎭", "🎪"];

	return (
		<div className="flex flex-col items-center justify-center p-8">
			<h1 className="text-4xl font-bold text-white mb-8 text-center">🔐 Crypto Alpha Vault</h1>
			<p className="text-center text-yellow-400 mb-4">
				💰 Premium intelligence worth $0.001 • Exclusive to paying members
			</p>

			<div className="relative mb-8">
				{/* Nyan Cat */}
				<div className="relative z-10">
					<div className="text-6xl animate-bounce">🐱</div>
					<div className="text-4xl -mt-4 ml-8 animate-pulse">🌈</div>
				</div>

				{/* Rainbow Trail */}
				<div className="absolute top-0 left-0 w-full h-full overflow-hidden">
					{rainbowColors.map((color, i) => (
						<div
							key={`rainbow-${color}`}
							className={`absolute top-4 left-${(i + 1) * 8} w-2 h-2 rounded-full animate-ping`}
							style={{
								animationDelay: `${i * 0.1}s`,
								animationDuration: "1s",
								backgroundColor: color,
							}}
						/>
					))}
				</div>
			</div>

			{/* Animated Stars */}
			<div className="relative w-full max-w-md h-32">
				{Array.from({ length: 12 }, (_, i) => (
					<div
						key={`star-${i}-${Math.random().toString(36).substr(2, 9)}`}
						className="absolute text-yellow-300 animate-pulse"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 2}s`,
							animationDuration: `${1 + Math.random() * 2}s`,
						}}
					>
						⭐
					</div>
				))}
			</div>

			{/* Index Links */}
			<div className="mt-10 grid grid-cols-1 gap-3 text-center sm:grid-cols-2">
				<Link className="rounded-md border border-white/10 p-4 hover:bg-white/5" href="/protected/articles/intro">
					🔐 Secret Trading Strategies
					<div className="text-sm opacity-70 mt-1">Whale patterns & arbitrage alpha</div>
				</Link>
				<Link className="rounded-md border border-white/10 p-4 hover:bg-white/5" href="/protected/articles/advanced">
					🚀 The Flippening Prediction
					<div className="text-sm opacity-70 mt-1">When ETH flips BTC + whale wallets</div>
				</Link>
				<Link className="rounded-md border border-white/10 p-4 hover:bg-white/5" href="/protected/guides/getting-started">
					💎 100x Altcoin Alpha
					<div className="text-sm opacity-70 mt-1">Secret launches & insider calendar</div>
				</Link>
				<Link className="rounded-md border border-white/10 p-4 hover:bg-white/5" href="/articles">
					📰 Public Articles
					<div className="text-sm opacity-70 mt-1">Free content (no alpha here)</div>
				</Link>
			</div>

			{/* Floating Elements */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				{floatingEmojis.map((emoji, i) => (
					<div
						key={`floating-${emoji}`}
						className="absolute text-2xl animate-bounce"
						style={{
							left: `${20 + i * 15}%`,
							top: `${10 + (i % 2) * 80}%`,
							animationDelay: `${i * 0.5}s`,
							animationDuration: "2s",
						}}
					>
						{emoji}
					</div>
				))}
			</div>
		</div>
	);
}
