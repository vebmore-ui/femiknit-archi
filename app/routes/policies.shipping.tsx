import { Link } from "@remix-run/react";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-rose-950 sm:text-4xl">Shipping & Delivery Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: 1 August 2026</p>
        </div>

        <div className="prose prose-rose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-xl text-rose-900">Delivery coverage</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We deliver to most serviceable Indian PIN codes. Delivery availability is confirmed at checkout.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-rose-900">Delivery timelines</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              The estimated dispatch and delivery window is displayed at checkout or on the product page.
              Sales, festivals, extreme weather and courier disruptions can cause delays.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-rose-900">Order tracking</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Tracking details are shared after dispatch by email, SMS or WhatsApp.
              Courier tracking can take up to 24 hours to update.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-rose-900">Shipping charges</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Free express delivery is available on prepaid orders above Rs 1,999.
              For other orders, applicable shipping charges are displayed at checkout before payment.
              Cash on Delivery (COD) may be offered for selected PIN codes and order values, with any applicable COD fee shown before you pay.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-rose-900">Failed or refused deliveries</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Customers are requested not to refuse a dispatched parcel simply because they changed their mind.
              If a prepaid parcel is returned because of customer refusal, an incorrect or incomplete address, repeated unavailability or failure to accept delivery,
              the actual forward and return shipping charges may be deducted before refund.
              Repeated refusal of COD orders may result in COD being disabled for future orders.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-rose-900">Customs and duties</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              For domestic orders within India, no customs duties apply.
            </p>
          </section>

          <div className="mt-10">
            <Link to="/" className="inline-flex items-center rounded-full bg-rose-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-900">
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
