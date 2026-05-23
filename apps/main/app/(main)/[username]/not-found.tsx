import Link from 'next/link';

export default function ProfileNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Profile Not Found</h1>
      <p className="text-[#4A5568] mb-6">The user you're looking for doesn't exist.</p>
      <Link href="/" className="text-[#B85C38] hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}