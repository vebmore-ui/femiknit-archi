import { Link } from "@remix-run/react";

const sections = [
  {
    title: "Policy at a glance",
    content: (
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="text-left px-4 py-2 font-semibold">Item</th>
              <th className="text-left px-4 py-2 font-semibold">Femiknit policy</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200">
              <td className="px-4 py-2 font-medium text-gray-900">Return or exchange request</td>
              <td className="px-4 py-2">Within 3 calendar days of delivery</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="px-4 py-2 font-medium text-gray-900">Damage, defect or wrong item</td>
              <td className="px-4 py-2">Report within 48 hours of delivery</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="px-4 py-2 font-medium text-gray-900">Product condition</td>
              <td className="px-4 py-2">Unused, unwashed, unaltered, with tags and original packaging</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="px-4 py-2 font-medium text-gray-900">Available options</td>
              <td className="px-4 py-2">Exchange, Femiknit store credit</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="px-4 py-2 font-medium text-gray-900">Requests per order</td>
              <td className="px-4 py-2">One return or exchange request</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  },
  {
    title: "When can a product be returned?",
    content: (
      <p>
        An eligible saree may be returned if: you received a damaged or defective product; you received a product different from the one ordered; an item or component shown as part of the product is missing.
        For a normal return based on preference, colour or style, the request must reach us within 3 calendar days from the delivery date. For a damaged, defective, incorrect or incomplete order, please contact us within 48 hours of delivery.
      </p>
    )
  },
  {
    title: "Conditions for accepting a return",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Unused, unworn and unwashed</li>
        <li>Free from stains, makeup, perfume, deodorant, sweat, pet hair or any other sign of use</li>
        <li>Not worn or draped for an event or photoshoot</li>
        <li>Not ironed, dry-cleaned or otherwise treated</li>
        <li>All tags, labels and security tags intact</li>
        <li>Returned in original fold and packaging as far as reasonably possible</li>
        <li>Include original blouse piece, accessories, certificates, free gifts and other components</li>
        <li>Blouse piece, if attached, completely uncut</li>
      </ul>
    )
  },
  {
    title: "Products that cannot be returned or exchanged",
    content: (
      <p>
        The following are not eligible for return or exchange unless Femiknit sent an incorrect product or the product arrived materially damaged or defective:
        products marked “Final Sale” or “No Return/Exchange” on the product page; clearance and heavily discounted sale products; customised, made-to-order or personalised products;
        sarees on which fall, pico, edging, pre-draping or another alteration has been completed at the customer’s request; sarees with a cut or detached blouse piece;
        products damaged through use, washing, incorrect storage or failure to follow care instructions; products returned after the applicable return period.
      </p>
    )
  },
  {
    title: "Natural textile and colour variations",
    content: (
      <p>
        We make reasonable efforts to show colours and product details accurately. However, actual colour may vary slightly because of screen settings, lighting and photography.
        Some handwoven, hand-printed or hand-finished textiles can have slight variations in weave, print alignment, embroidery, knots, slubs, thread texture or colour.
        These characteristics are normally part of the textile-making process and are not automatically considered defects.
      </p>
    )
  },
  {
    title: "Damaged, defective, incorrect or incomplete orders",
    content: (
      <p>
        Please inspect the parcel soon after delivery. If the outer parcel is visibly open or seriously damaged, you may refuse delivery or note the damage with the delivery partner where possible.
        For a damage, defect, incorrect-product or missing-item claim, please send us: your order number; clear photographs of the outer packaging and shipping label;
        photographs showing the complete product; and close-up photographs and a video showing the concern.
        We strongly recommend recording one continuous unboxing video beginning before the parcel is opened.
      </p>
    )
  },
  {
    title: "Return and refund options",
    content: (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-rose-900">Femiknit store credit</h3>
          <p>Store credit equal to the eligible product value. No return-handling deduction. Valid for 12 months from issue. Cannot be exchanged for cash or transferred. Issued after quality inspection.</p>
        </div>
        <div>
          <h3 className="font-semibold text-rose-900">Refund to the original payment method</h3>
          <p>Refund for the eligible product value after deducting a ₹199 return shipping and handling charge per return request. Original shipping, COD, gift-wrapping and service charges are non-refundable. Deductions waived when return results from a confirmed Femiknit error.</p>
        </div>
        <div>
          <h3 className="font-semibold text-rose-900">Exchange</h3>
          <p>One exchange permitted per order. ₹199 reverse-pickup and reshipping charge, waived for confirmed damaged, defective or incorrect product. Replacement must be equal or higher value. Exchanged products cannot be exchanged or returned again unless they arrive damaged, defective or incorrect.</p>
        </div>
      </div>
    )
  },
  {
    title: "How to request a return or exchange",
    content: (
      <p>
        Within the applicable period, submit your request through: Email or WhatsApp: 7541826227.
        Please provide your order number, registered mobile number, product name, reason for the request and relevant photographs or video.
        Do not send a product back without receiving return instructions from Femiknit. Unauthorised or untraceable parcels may not be accepted.
      </p>
    )
  },
  {
    title: "Reverse pickup and self-shipping",
    content: (
      <p>
        Where reverse pickup is available, we will arrange collection from the original delivery address.
        If pickup fails because the customer is unavailable, the address is inaccessible or the parcel is not ready, another pickup may involve an additional charge.
        If reverse pickup is unavailable at the customer’s PIN code, the customer may be asked to send the product through a reliable trackable courier.
        Customers should retain the courier receipt and tracking details until the return is completed.
      </p>
    )
  },
  {
    title: "Quality inspection",
    content: (
      <p>
        Every returned product will be inspected after it reaches us. Inspection generally takes two business days.
        If the product meets the return conditions, the exchange, store credit or refund will be approved.
        If the product is found used, washed, altered, damaged after delivery or otherwise ineligible, we will explain the reason and provide supporting information where available.
      </p>
    )
  },
  {
    title: "Refund timelines",
    content: (
      <p>
        Once a refund is approved: prepaid-order refunds will be sent to the original payment method; COD-order refunds will be made by bank transfer or UPI after the customer provides the required details;
        refunds will normally be initiated within 5–7 business days after quality inspection. Banks and payment providers may take an additional 5–10 business days to reflect the amount.
      </p>
    )
  },
  {
    title: "Order cancellation",
    content: (
      <p>
        An order may be cancelled without charge before it has been dispatched. Once an order is dispatched, it cannot be cancelled.
        The customer may request a return after accepting delivery, subject to this policy.
        If Femiknit cancels a prepaid order because of stock unavailability, a pricing error, quality concerns or another operational reason, the full amount paid will be refunded.
      </p>
    )
  },
  {
    title: "Refused and undelivered orders",
    content: (
      <p>
        Customers are requested not to refuse a dispatched parcel simply because they changed their mind.
        If a prepaid parcel is returned because of customer refusal, an incorrect or incomplete address, repeated customer unavailability or failure to accept delivery,
        the actual forward and return shipping charges may be deducted before refund. Repeated refusal of COD orders, excessive unsubstantiated claims or misuse of the return facility may result in COD being disabled for future orders.
      </p>
    )
  },
  {
    title: "Third-party purchases",
    content: (
      <p>
        This policy applies only to purchases made directly through the Femiknit website.
        Orders placed through marketplaces, exhibitions, pop-up stores, social-commerce platforms or other sellers will follow the return policy of the platform or seller through which the purchase was made.
      </p>
    )
  },
  {
    title: "Customer support and grievance redressal",
    content: (
      <p>
        For return and refund assistance, contact: Femiknit Customer Support Email: [INSERT SUPPORT EMAIL] Phone/WhatsApp: 7541826227.
        Working hours: Monday – Friday (12a.m. to 8p.m.). Complaints will be acknowledged within 48 hours and addressed within the period prescribed under applicable Indian law.
      </p>
    )
  },
  {
    title: "Changes to this policy",
    content: (
      <p>
        Femiknit may update this policy to reflect changes in its products, operations or applicable law.
        Any revised policy will apply prospectively. An order will generally be governed by the policy displayed when the order was placed.
      </p>
    )
  },
];

export default function ReturnsPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-rose-950 sm:text-4xl">Return, Exchange and Refund Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: 1 August 2026</p>
        </div>

        <div className="prose prose-rose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed">
            At Femiknit, every saree is checked carefully before it is packed. We hope you love what you receive. If something is not right, we will do our best to resolve it fairly and quickly.
          </p>

          {sections.map((section) => (
            <section key={section.title} className="mt-8">
              <h2 className="font-serif text-xl text-rose-900">{section.title}</h2>
              <div className="mt-3 text-gray-700 leading-relaxed">{section.content}</div>
            </section>
          ))}

          <section className="mt-8">
            <h2 className="font-serif text-xl text-rose-900">Legal reference</h2>
            <p className="mt-3 text-gray-700">Consumer Protection (E-Commerce) Rules, 2020</p>
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
