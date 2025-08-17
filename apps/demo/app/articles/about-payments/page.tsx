import Link from "next/link";

export default function AboutPaymentsArticle() {
	return (
		<article className="prose max-w-none">
			<h1>About Payments & Premium Content</h1>
			<p>
				This public article explains how our premium crypto intelligence works. 
				Free content gives you basic market info, while protected routes like 
				<code>/protected/**</code> contain exclusive alpha worth $0.001.
			</p>
			<p>
				Want to know when the flippening will happen? Or see whale wallet addresses 
				that are accumulating before major moves? That information is behind our paywall:
			</p>
			<ul>
				<li>🔐 Secret trading strategies and whale patterns</li>
				<li>🚀 The flippening prediction (March 15, 2025)</li>
				<li>💎 100x altcoin gems and launch calendars</li>
				<li>🐋 Exclusive whale wallet addresses</li>
			</ul>
			<p>
				Try visiting the protected content:
				<Link className="mx-1 underline" href="/protected/articles/intro">
					Secret Trading Strategies
				</Link>
				or
				<Link className="mx-1 underline" href="/protected/articles/advanced">
					The Flippening Prediction
				</Link>
				.
			</p>
			<div className="mt-8">
				<Link className="rounded-md border border-black/10 px-3 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5" href="/articles">
					Back to Public Index
				</Link>
			</div>
		</article>
	);
}



