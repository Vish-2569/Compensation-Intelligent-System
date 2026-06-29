/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header } from "../../../components/layout/Header";
import { Footer } from "../../../components/layout/Footer";
import AnonymousSalaryShareForm from "../../../components/compensation/AnonymousSalaryShareForm";

export default function SubmitPublic() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Share your compensation anonymously
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Help the community compare pay ranges with privacy-first salary sharing.
          </p>
        </div>

        <AnonymousSalaryShareForm />
      </main>

      <Footer />
    </div>
  );
}
