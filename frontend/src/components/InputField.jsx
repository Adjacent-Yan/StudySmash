export default function InputField({
    label,
    icon: Icon,
    type = "text",
    placeholder,
    rightElement,
}) {
    return (
        <div className="space-y-2">
            <div className="ml-1 flex items-center justify-between">
                <label className="text-[0.75rem] font-bold uppercase tracking-widest text-slate-500">
                    {label}
                </label>
                {rightElement}
            </div>

            <div className="relative">
                <div className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400">
                    <Icon size={20} />
                </div>

                <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full rounded-2xl border border-slate-100 bg-white/60 py-4 pr-4 pl-12 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary"
                />
            </div>
        </div>
    );
}