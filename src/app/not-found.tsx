import Link from "next/link";

export default function NotFound() {
  return (
    <html>
      <body className="min-h-screen flex flex-col bg-white text-neutral-900">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-bold text-neutral-300 mb-4">404</h1>
            <h2 className="text-xl font-semibold mb-2">
              Page Not Found
            </h2>
            <p className="text-neutral-500 mb-2">
              페이지를 찾을 수 없습니다.
            </p>
            <p className="text-neutral-400 text-sm mb-8">
              The page you are looking for might have been removed or is temporarily unavailable.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Link
                href="/en"
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Go to Homepage (EN)
              </Link>
              <Link
                href="/ko"
                className="px-5 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                홈으로 돌아가기 (KO)
              </Link>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <p className="text-xs text-neutral-400 mb-3">Popular Tools</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link
                  href="/en/tools/salary-calculator"
                  className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs hover:bg-neutral-200 transition-colors"
                >
                  Salary Calculator
                </Link>
                <Link
                  href="/en/tools/pdf-merger"
                  className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs hover:bg-neutral-200 transition-colors"
                >
                  PDF Merger
                </Link>
                <Link
                  href="/en/tools/image-compressor"
                  className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs hover:bg-neutral-200 transition-colors"
                >
                  Image Compressor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
