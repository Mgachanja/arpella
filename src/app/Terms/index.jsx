// src/pages/terms/index.jsx
import React, { useState, useEffect } from 'react';
import NavBar from '../../components/Nav';
import {
  Container,
  Row,
  Col,
  Nav,
  ListGroup,
  Offcanvas,
  Button
} from 'react-bootstrap';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `“Arpella” is the trading name for the Arpella Stores Limited. Arpella (“Arpella” or we) operates an e-commerce platform consisting of a website and mobile application (“marketplace”), together with supporting IT, logistics and payment infrastructure, for the sale and purchase of consumer products and services (“products”) in its allocated in the Republic of Kenya.

These general terms and conditions shall apply to buyers and sellers on the marketplace and shall govern your use of the marketplace and related services.

By using our marketplace, you accept these general terms and conditions in full. If you disagree with these general terms and conditions or any part of these general terms and conditions, you must not use our marketplace.

If you use our marketplace in the course of a business or other organizational project, then by so doing you:
• confirm that you have obtained the necessary authority to agree to these general terms and conditions;
• bind both yourself and the person, company or other legal entity that operates that business or organizational project, to these general terms and conditions; and
• agree that "you" in these general terms and conditions shall reference both the individual user and the relevant person, company or legal entity unless the context requires otherwise.`
  },
  {
    id: 'registration-account',
    title: '2. Registration and account',
    content: `You may not register with our marketplace if you are under the age of majority in Kenya (18 years of age) and by using our marketplace or agreeing to these general terms and conditions, you warrant and represent to us that you are at least 18 years of age at the time of registration.

If you register for an account with our marketplace, you will be asked to provide a registered phone number, email address/user ID and password and you agree to:
• keep your password confidential;
• notify us in writing immediately (using our contact details provided at clause 18) if you become aware of any disclosure of your password; and
• be responsible for any activity on our marketplace arising out of any failure to keep your password confidential, and you acknowledge that you may be held liable for any losses arising out of such a failure.

Your account shall be used exclusively by you and you shall not transfer your account to any third party. If you authorize any third party to manage your account on your behalf this shall be at your own risk.

We may suspend or cancel your account, and/or edit your account details, at any time in our sole discretion and without notice or explanation, providing that if we cancel any products or services you have paid for but not received, and you have not breached these general terms and conditions, we will refund you in respect of the same. See clause 13.2 below for further information about refunds. 

You may cancel your account on our marketplace by contacting us as provided at clause 21.`
  },
  {
    id: 'terms-of-sale',
    title: '3. Terms and conditions of sale',
    content: `You acknowledge and agree that:
• the marketplace is an online location for Arpella Stores Limited to sell and buyers to purchase products;
• a contract for the sale and purchase of a product or products will come into force between Arpella and the buyer, and accordingly you commit to buying the relevant product or products, upon confirmation of purchase via the marketplace.

Subject to these general terms and conditions, Arpella’s terms of business shall govern the contract for sale and purchase between Arpella and the buyer. Notwithstanding this, the following provisions will be incorporated into the contract of sale and purchase between the buyer and the seller:
• the price for a product will be as stated in the relevant product listing which the seller may change from time to time depending on market forces;
• the price for the product includes all taxes and complies with applicable laws in force from time to time;
• delivery charges, packaging charges, other ancillary costs and charges, where applicable, will be payable by the buyer;
• where the buyer orders through the marketplace but elects to collect the products in person from the seller’s stores, delivery charges shall not apply. However, packaging and other ancillary costs and charges shall apply where applicable;
• products must be of satisfactory quality, fit and safe for any purpose specified in, and conform in all material respects to, the product listing and any other description of the products supplied or made available by the seller to the buyer; and
• in respect of physical products sold, the seller warrants that the seller has good title to, and is the sole legal and beneficial owner of, the products and/or has the right to supply the products pursuant to this or any other agreement, and that the products are not subject to any third party rights or restrictions including in respect of third party intellectual property rights and/or any criminal, insolvency or tax investigation or proceedings.

The Seller warrants that, where a product sold has such terms, the Seller will provide detailed disclosure of the product terms and conditions, any applicable warranty, and other terms necessary to inform the buyer on the product and its usage in the specification section provided on each product page.`
  },
  {
    id: 'ordering-acceptance',
    title: '4. Ordering Process & Acceptance of Orders',
    content: `Customers can place orders through our online marketing platform by selecting products and completing the checkout process. Accurate and complete information must be provided to successfully process orders.

All orders placed are subject to acceptance by us. We reserve the right, at our sole discretion, to accept, reject, or cancel any order for reasons including but not limited to:
• Product unavailability or stock shortages
• Suspected fraudulent or unauthorized activity
• Errors in pricing or product information
• Inability to process payment

Upon placing an order, customers will receive an email confirmation acknowledging receipt of the order. This email does not constitute acceptance of the order. Acceptance occurs only once we dispatch the product and send a second email with delivery confirmation.`
  },
  {
    id: 'pricing-fees-payment-terms',
    title: '5. Pricing, Fees, and Payment Terms',
    content: `All product prices are displayed in the local currency and are inclusive of applicable taxes unless otherwise stated. Shipping fees and other applicable charges will be displayed at checkout before payment is made. We reserve the right to change pricing at any time without prior notice, but such changes will not affect orders that have already been confirmed.

We accept the following payment methods:
• Credit and debit cards (Visa, Mastercard)
• Mobile money transfers (e.g., M-Pesa, Airtel Money)

All payments must be made in full at the time the order is placed. Orders will not be processed or shipped until payment is received and confirmed.`
  },
  {
    id: 'shipping-delivery-handling',
    title: '6. Shipping, Delivery, and Handling',
    content: `We use local delivery partners, including motorbike couriers (“boda boda”), to fulfill deliveries within our service areas.

Estimated delivery times are provided at checkout and are subject to change based on product availability, delivery location, and weather or traffic conditions. While we aim to deliver within the estimated time, we do not guarantee specific delivery dates or times.

Shipping fees are borne by the customer and are calculated based on delivery location and package size. These fees will be displayed at checkout prior to payment.

In the event that a shipment is lost or arrives damaged, customers must notify us within 48 hours of delivery (or expected delivery). We will work with our delivery partners to investigate and, if appropriate, issue a replacement or refund. All such resolutions are subject to our discretion.`
  },
  {
    id: 'returns-exchanges-refunds',
    title: '7. Returns, exchanges and refunds',
    content: `Returns of products by buyers shall only be accepted when the products delivered are not of merchantable quality, are beyond shelf life and not fit for human consumption and/or do not conform to description in the marketplace.

Returns on the above grounds shall be accepted by the seller and exchange of the products with those that are of merchantable quality, are fit for human consumption and/or conform to description in the marketplace.

Where products returned cannot be exchanged due to unavailability or any other reason on the part of the seller, refunds in respect of returned products shall be managed in accordance with the refunds page on the marketplace, as may be amended from time to time. We may offer refunds, in our discretion:
• in respect of the product price; and
• by way of mobile money transfer, bank transfers or such other methods as we may determine from time to time.

Where a refund is approved, refunds shall be issued by Arpella within 72 hours.

Changes to our returns and refunds page shall be effective in respect of all purchases made from the date of publication of the change on our website.`
  },
  {
    id: 'payments',
    title: '8. Payments',
    content: `You must make payments due under these general terms and conditions in accordance with the Payments Information and Guidelines on the marketplace.`
  },
  {
    id: 'copyright-trademarks',
    title: '9. Copyright and trademarks',
    content: `Subject to the express provisions of these general terms and conditions:
• we, together with our licensors, own and control all the copyright and other intellectual property rights in our website and the material on our website; and
• all the copyright and other intellectual property rights in our website and the material on our website are reserved.

Arpella’s logos and our other registered trademarks are trademarks belonging to us; we give no permission for the use of these trademarks, and such use may constitute an infringement of our rights.

The third party registered and unregistered trademarks or service marks on our marketplace are the property of their respective owners and we do not endorse and are not affiliated with any of the holders of any such rights and as such we cannot grant any license to exercise such rights.`
  },
  {
    id: 'data-privacy',
    title: '10. Data privacy',
    content: `Buyers agree to processing of their personal data in accordance with the terms of Arpella’s Privacy Notice and Cookie Notice.

Arpella shall process all personal data obtained through the marketplace and related services in accordance with the terms of our Privacy Notice and Cookie Notice and Privacy Policy.

Arpella shall be responsible to buyers for any misuse of their personal data.`
  },
  {
    id: 'liability',
    title: '11. Limitations and exclusions of liability',
    content: `Nothing in these general terms and conditions will:
• limit any liabilities in any way that is not permitted under applicable law; or
• exclude any liabilities or statutory rights that may not be excluded under applicable law.

The limitations and exclusions of liability set out in this clause and elsewhere in these general terms and conditions:
• are subject to clause 11.1; and
• govern all liabilities arising under these general terms and conditions or relating to the subject matter of these general terms and conditions, including liabilities arising in contract, in tort (including negligence) and for breach of statutory duty, except to the extent expressly provided otherwise in these general terms and conditions.

Our aggregate liability to you in respect of any contract to provide services to you under these general terms and conditions shall not exceed the total amount paid and payable to us under the contract. Each separate transaction on the marketplace shall constitute a separate contract for the purpose of this clause.

Notwithstanding the above, we will not be liable to you for any loss or damage of any nature, including in respect of:
• any losses occasioned by any interruption or dysfunction to the website;
• any losses arising out of any event or events beyond our reasonable control;
• any loss or corruption of any data, database or software; or
• any special, indirect or consequential loss or damage.

We accept that we have an interest in limiting the personal liability of our officers and employees and, having regard to that interest, you acknowledge that we are a limited liability entity; you agree that you will not bring any claim personally against our officers or employees in respect of any losses you suffer in connection with the marketplace or these general terms and conditions (this will not limit or exclude the liability of the limited liability entity itself for the acts and omissions of our officers and employees).

Our marketplace includes hyperlinks to other websites owned and operated by third parties; such hyperlinks are not recommendations. We have no control over third party websites and their contents, and we accept no responsibility for them or for any loss or damage that may arise from your use of them.`
  },
  {
    id: 'indemnification',
    title: '12. Indemnification',
    content: `You hereby indemnify us, and undertake to keep us indemnified, against:
• any and all losses, damages, costs, liabilities and expenses (including without limitation legal expenses and any amounts paid by us to any third party in settlement of a claim or dispute) incurred or suffered by us and arising directly or indirectly out of your use of our marketplace or any breach by you of any provision of these general terms and conditions or the Arpella codes, policies or guidelines; and
• any VAT liability or other tax liability that we may incur in relation to any sale, supply or purchase made through our marketplace, where that liability arises out of your failure to pay, withhold, declare or register to pay any VAT or other tax properly due in any jurisdiction.`
  },
  {
    id: 'breaches',
    title: '13. Breaches of these general terms and conditions',
    content: `If we permit the registration of an account on our marketplace it will remain open indefinitely, subject to these general terms and conditions.

If you breach these general terms and conditions, or if we reasonably suspect that you have breached these general terms and conditions or any Arpella codes, policies or guidelines in any way we may:
• temporarily suspend your access to our marketplace;
• permanently prohibit you from accessing our marketplace;
• block computers using your IP address from accessing our marketplace;
• suspend or delete your account on our marketplace; and/or
• commence legal action against you, whether for breach of contract or otherwise.

Where we suspend, prohibit or block your access to our marketplace or a part of our marketplace you must not take any action to circumvent such suspension or prohibition or blocking (including without limitation creating and/or using a different account).`
  },
  {
    id: 'entire-agreement',
    title: '14. Entire agreement',
    content: `These general terms and conditions and the Arpella codes, policies and guidelines shall constitute the entire agreement between you and us in relation to your use of our marketplace and shall supersede all previous agreements between you and us in relation to your use of our marketplace.`
  },
  {
    id: 'variation',
    title: '15. Variation',
    content: `We may revise these general terms and conditions, the seller terms and conditions, and the Arpella codes, policies and guidelines from time to time.

The revised general terms and conditions shall apply from the date of publication on the marketplace.`
  },
  {
    id: 'no-waiver',
    title: '16. No waiver',
    content: `No waiver of any breach of any provision of these general terms and conditions shall be construed as a further or continuing waiver of any other breach of that provision or any breach of any other provision of these general terms and conditions.`
  },
  {
    id: 'severability',
    title: '17. Severability',
    content: `If a provision of these general terms and conditions is determined by any court or other competent authority to be unlawful and/or unenforceable, the other provisions will continue in effect.

If any unlawful and/or unenforceable provision of these general terms and conditions would be lawful or enforceable if part of it were deleted, that part will be deemed to be deleted, and the rest of the provision will continue in effect.`
  },
  {
    id: 'assignment',
    title: '18. Assignment',
    content: `You hereby agree that we may assign, transfer, sub-contract or otherwise deal with our rights and/or obligations under these general terms and conditions.

You may not without our prior written consent assign, transfer, sub-contract or otherwise deal with any of your rights and/or obligations under these general terms and conditions.`
  },
  {
    id: 'third-party-rights',
    title: '19. Third party rights',
    content: `A contract under these general terms and conditions is for our benefit and your benefit, and is not intended to benefit or be enforceable by any third party.

The exercise of the parties’ rights under a contract under these general terms and conditions is not subject to the consent of any third party.`
  },
  {
    id: 'law-jurisdiction',
    title: '20. Law and jurisdiction',
    content: `These general terms and conditions shall be governed by and construed in accordance with the laws of Kenya and any disputes relating to these general terms and conditions shall be subject to the exclusive jurisdiction of the courts of Kenya.`
  },
  {
    id: 'company-details-notices',
    title: '21. Our company details and notices',
    content: `You can contact us for after-sales queries, including any disputes, by using the contact details below:

Tel:
Email:

You consent to receive notices electronically from us. We may provide all communications and information related to your use of the marketplace in electronic format, either by posting to our website or application, or by email to the email address on your account. All such communications will be deemed to be notices in writing and received by and properly given to you.`
  }
];

export default function TermsConditionsPage() {
  const [activeId, setActiveId] = useState('introduction');
  const [showNav, setShowNav] = useState(false);
  const activeSection = sections.find(s => s.id === activeId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .custom-nav-link {
          color: inherit !important;
          background-color: transparent !important;
        }
        .custom-nav-link:hover {
          background-color: #333 !important;
          color: #fff !important;
        }
        .custom-nav-link.active {
          background-color: #ff8c00 !important;
          color: #fff !important;
          font-weight: 600 !important;
        }
      `}</style>

      <div style={{
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <NavBar />
        <Button
          variant="outline-secondary"
          className="d-md-none"
          onClick={() => setShowNav(true)}
        >
          Menu
        </Button>
      </div>

      <Offcanvas show={showNav} onHide={() => setShowNav(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Sections</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav variant="pills" className="flex-column">
            {sections.map(sec => (
              <Nav.Item key={sec.id} className="mb-2">
                <Nav.Link
                  className="custom-nav-link"
                  onClick={() => {
                    setActiveId(sec.id);
                    setShowNav(false);
                  }}
                  active={sec.id === activeId}
                >
                  {sec.title}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid>
        <Row>
          <Col
            md={2}
            className="d-none d-md-block border-end"
            style={{
              position: 'sticky',
              top: '100px',
              height: 'calc(100vh - 100px)',
              overflowY: 'auto'
            }}
          >
            <Nav variant="pills" className="flex-column mt-3">
              {sections.map(sec => (
                <Nav.Item key={sec.id} className="mb-2">
                  <Nav.Link
                    className="custom-nav-link"
                    onClick={() => setActiveId(sec.id)}
                    active={sec.id === activeId}
                  >
                    {sec.title}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>

          <Col md={10} className="py-5 d-flex justify-content-center">
            <div style={{ maxWidth: '800px', width: '100%', padding: '0 1rem' }}>
              <h1 className="mb-3">Terms & Conditions</h1>
              <p className="text-muted mb-4">Effective Date May 1 2025</p>

              <section id={activeSection.id}>
                <h4 className="mb-3">{activeSection.title}</h4>
                {activeSection.content && (
                  <p style={{ lineHeight: 1.8, color: '#333', whiteSpace: 'pre-line' }}>
                    {activeSection.content}
                  </p>
                )}
                {activeSection.list && (
                  <ListGroup variant="flush" className="ps-2">
                    {activeSection.list.map((item, i) => (
                      <ListGroup.Item key={i} className="border-0 ps-0">
                        • {item}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </section>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
