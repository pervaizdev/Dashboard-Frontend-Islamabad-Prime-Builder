export default function SignupPage() {
    return (

        <div className="container mx-auto max-w-lg px-4 mt-20 lg:mt-0 lg:py-10">
            <div className="container mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-5">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Sign Up
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Create your account to continue
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-5 px-6 py-6">

                    {/* Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Phone
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your phone number"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                        />
                    </div>

                    {/* Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full cursor-pointer rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Create Account
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}