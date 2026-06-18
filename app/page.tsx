import Link from "next/link";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-50">
            <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 sm:py-32 lg:px-8 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full -z-10"></div>

                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-indigo-300 ring-1 ring-indigo-500/20 hover:ring-indigo-500/40 transition-colors bg-indigo-500/10 backdrop-blur-md">
                            Project Template Ready.{" "}
                            <Link
                                href="#"
                                className="font-semibold text-indigo-400"
                            >
                                <span
                                    className="absolute inset-0"
                                    aria-hidden="true"
                                />
                                Read more <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-linear-to-r from-slate-200 to-slate-500 pb-2">
                        Build something amazing
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-slate-400">
                        Start your next project with this powerful template.
                        Pre-configured with Next.js, Tailwind CSS, and
                        shadcn/ui.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link
                            href="#"
                            className="rounded-md bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-400 transition-all active:scale-95"
                        >
                            Get started
                        </Link>
                        <Link
                            href="#"
                            className="text-sm font-semibold leading-6 text-slate-300 hover:text-white transition-colors"
                        >
                            View components <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
