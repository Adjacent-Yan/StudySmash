export default function AuthFooter() {
    return (
        <footer className="mt-auto border-t border-white/20 bg-white/20 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row">
                <div className="flex flex-col gap-2">
                    <span className="text-lg font-black text-slate-900">StudySmash</span>
                </div>

                <nav className="flex flex-wrap justify-center gap-8">
                    {["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"].map(
                        (item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-sm font-medium uppercase tracking-wide text-slate-500 transition-colors hover:text-blue-400"
                            >
                                {item}
                            </a>
                        )
                    )}
                </nav>
            </div>
        </footer>
    );
}