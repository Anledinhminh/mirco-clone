import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Miro Clone</h1>
                    <p className="text-blue-100 text-lg">Real-time collaborative whiteboard</p>
                </div>
                <SignIn />
            </div>
        </div>
    );
}
