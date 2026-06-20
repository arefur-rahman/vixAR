import { Sparkles } from "lucide-react";

export const Hero = () => (
    <section className="relative px-6 pt-12 pb-8 text-center max-w-4xl mx-auto select-none">
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-md mb-6 hover:bg-primary/20 transition-all">
            <Sparkles className="size-3.5" /> Powered by Next.js & Tailwind CSS
            v4
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/75">
            vixAR: The Ultimate All-in-One Media & File Optimizer
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto font-sans">
            Compress, resize, merge, and optimize your assets instantly in the
            browser. Retain pixel-perfect quality while slashing loading sizes
            by up to 90%.
        </p>
    </section>
);
