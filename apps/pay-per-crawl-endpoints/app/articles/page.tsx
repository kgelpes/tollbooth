import Link from "next/link";

export default function PublicArticlesIndex() {
	return (
		<div className="mx-auto max-w-3xl py-10">
			<h1 className="mb-6 text-3xl font-semibold">Public Articles</h1>
			<p className="mb-4 text-sm opacity-80">
				These pages are not protected. Mix and match navigation between public and
				protected content.
			</p>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<Link className="rounded-md border border-black/10 px-4 py-3 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5" href="/articles/hello-world">
					Hello World
				</Link>
				<Link className="rounded-md border border-black/10 px-4 py-3 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5" href="/articles/about-payments">
					About Payments
				</Link>
				<Link className="rounded-md border border-black/10 px-4 py-3 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5" href="/protected">
					Go to Protected Index
				</Link>
			</div>
		</div>
	);
}


