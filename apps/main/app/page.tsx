import Link from "next/link";

export default function PublicLandingPage() {
  return (
    <div>
      <h1>Welcome to BookNest</h1>
      <p>Discover books, track reading, connect with authors</p>
      <Link href="/login">Get Started</Link>
    </div>
  );
}