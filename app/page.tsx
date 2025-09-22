import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get started with your account
          </p>
        </div>

        <div className="space-y-4">
          <Button
            asChild
            className="w-full h-12 text-base"
            size="lg"
          >
            <a href="/login">
              Login
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 text-base"
            size="lg"
          >
            <a href="/signup">
              Sign Up
            </a>
          </Button>

          <Button
            asChild
            variant="secondary"
            className="w-full h-12 text-base"
            size="lg"
          >
            <a href="/app/dashboard">
              Dashboard
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
