import Link from "next/link";

export default function HelloWorldArticle() {
	return (
		<article className="prose max-w-none">
			<h1>Hello, World</h1>
			<p>This is a public article. Anyone can read this page.</p>
			<p>
				You can also access protected content like the
				<Link className="mx-1 underline" href="/protected/articles/intro">
					Intro
				</Link>
				article.
			</p>
			<div className="mt-8">
				<Link className="rounded-md border border-black/10 px-3 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5" href="/articles">
					Back to Public Index
				</Link>
			</div>
		</article>
	);
}


