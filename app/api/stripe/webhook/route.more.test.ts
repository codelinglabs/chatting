const mocks = vi.hoisted(() => ({
  syncStripeBillingStateFromEvent: vi.fn(),
  constructEvent: vi.fn(),
  getStripeWebhookSecret: vi.fn()
}));

vi.mock("@/lib/stripe-billing", () => ({ syncStripeBillingStateFromEvent: mocks.syncStripeBillingStateFromEvent }));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ webhooks: { constructEvent: mocks.constructEvent } }),
  getStripeWebhookSecret: mocks.getStripeWebhookSecret
}));

import { POST } from "./route";

describe("stripe webhook route more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStripeWebhookSecret.mockReturnValue("whsec_test");
  });

  it("extracts subscription context from subscription lifecycle events", async () => {
    mocks.constructEvent.mockReturnValueOnce({
      type: "customer.subscription.updated",
      data: { object: { id: "sub_123", customer: { id: "cus_123" }, metadata: { userId: "user_sub" } } }
    });

    await POST(new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig_123" },
      body: "{}"
    }));

    expect(mocks.syncStripeBillingStateFromEvent).toHaveBeenCalledWith({
      customerId: "cus_123",
      subscriptionId: "sub_123",
      userId: "user_sub"
    });
  });

  it("extracts invoice and customer contexts from the remaining supported events", async () => {
    mocks.constructEvent
      .mockReturnValueOnce({
        type: "invoice.payment_succeeded",
        data: {
          object: {
            customer: { id: "cus_234" },
            metadata: { userId: "user_invoice" },
            parent: { subscription_details: { subscription: { id: "sub_234" }, metadata: {} } }
          }
        }
      })
      .mockReturnValueOnce({
        type: "customer.updated",
        data: { object: { id: "cus_345", metadata: { userId: "user_customer" } } }
      })
      .mockReturnValueOnce({
        type: "checkout.session.completed",
        data: { object: { customer: { id: "cus_456" }, subscription: { id: "sub_456" }, metadata: {} } }
      });

    for (let index = 0; index < 3; index += 1) {
      await POST(new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "sig_123" },
        body: "{}"
      }));
    }

    expect(mocks.syncStripeBillingStateFromEvent.mock.calls).toEqual([
      [{ customerId: "cus_234", subscriptionId: "sub_234", userId: "user_invoice" }],
      [{ customerId: "cus_345", subscriptionId: null, userId: "user_customer" }],
      [{ customerId: "cus_456", subscriptionId: "sub_456", userId: null }]
    ]);
  });
});
