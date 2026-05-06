// import Link from 'next/link';

// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';

// export default async function PaymentResultPage({
//   searchParams,
// }: {
//   searchParams: Promise<Record<string, string | string[] | undefined>>;
// }) {
//   const sp = await searchParams;
//   const status = typeof sp.status === 'string' ? sp.status : undefined;
//   const txRef = typeof sp.tx_ref === 'string' ? sp.tx_ref : undefined;
//   const error = typeof sp.error === 'string' ? sp.error : undefined;

//   const isSuccess = status === 'success';
//   const isFailed = status === 'failed';

//   return (
//     <div className="min-h-[70vh]">
//       <div className="mx-auto w-full max-w-xl px-4 py-14">
//         <h1 className="text-2xl font-semibold text-zinc-900">Payment result</h1>

//         <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
//           {error ? (
//             <p className="text-sm text-red-700">Error: {error}</p>
//           ) : isSuccess ? (
//             <p className="text-sm text-emerald-700">Payment successful. You can now access your library.</p>
//           ) : isFailed ? (
//             <p className="text-sm text-red-700">Payment failed or was cancelled.</p>
//           ) : (
//             <p className="text-sm text-zinc-700">Payment status: {status ?? 'unknown'}</p>
//           )}

//           {txRef ? <p className="mt-2 text-xs text-zinc-500">TxRef: {txRef}</p> : null}

//           <div className="mt-6 flex flex-wrap gap-3">
//             <Link
//               href="/library"
//               className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
//             >
//               Go to Library
//             </Link>
//             <Link
//               href="/market"
//               className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
//             >
//               Back to Marketplace
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

