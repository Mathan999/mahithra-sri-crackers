import React from 'react';
import { Helmet } from 'react-helmet';
import { Phone, MessageCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const phoneNumber = "+919080533427";

  const openWhatsApp = () => {
    const message = "I want ask a question about crackers and orders!";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, "_blank");
    }
  };

  return (
    <div className="contact-container min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Helmet>
        {/* Basic meta tags */}
        <title>Contact MAHITHRAA CRACKERS - Get in Touch</title>
        <meta name="description" content="Contact MAHITHRAA CRACKERS easily via WhatsApp or phone. We're here to answer your questions and assist you with your cracker needs." />

        {/* OpenGraph meta tags for better social media sharing */}
        <meta property="og:title" content="Contact MAHITHRAA CRACKERS - Get in Touch" />
        <meta property="og:description" content="Reach out to MAHITHRAA CRACKERS via WhatsApp or phone. Quick and easy communication for all your cracker-related inquiries." />
        <meta property="og:image" content="/fav-icon.png" />
        <meta property="og:url" content="https://www.mahithraasricrackers.com/contact" />
        <meta property="og:type" content="website" />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact MAHITHRAA CRACKERS - Get in Touch" />
        <meta name="twitter:description" content="Connect with MAHITHRAA CRACKERS instantly via WhatsApp or phone. We're here to help with all your cracker needs." />
        <meta name="twitter:image" content="/fav-icon.png" />

        {/* Additional SEO-friendly meta tags */}
        <meta name="keywords" content="contact, MAHITHRAA CRACKERS, WhatsApp, phone, customer support, crackers, fireworks" />
        <meta name="author" content="MAHITHRAA CRACKERS" />
        <meta name="robots" content="index, follow" />

        {/* Responsive design meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Advanced: Schema.org markup for rich snippets */}
        <script type="application/ld+json">
          {`
            {
              "@context": "http://schema.org",
              "@type": "ContactPage",
              "name": "Contact MAHITHRAA CRACKERS",
              "description": "Get in touch with MAHITHRAA CRACKERS for all your cracker needs",
              "url": "https://www.mahithraasricrackers.com/contact",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "${phoneNumber}",
                "contactType": "customer service"
              },
              "potentialAction": [
                {
                  "@type": "CommunicateAction",
                  "name": "WhatsApp",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://wa.me/${phoneNumber}?text=Hello%2C%20I%27d%20like%20to%20chat!"
                  }
                },
                {
                  "@type": "CommunicateAction",
                  "name": "Call",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "tel:${phoneNumber}"
                  }
                }
              ]
            }
          `}
        </script>
      </Helmet>

      <div className="button-container flex space-x-4 mb-8">
        <button
          onClick={openWhatsApp}
          className="contact-button whatsapp flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
        >
          <div className="icon-container whatsapp mr-2">
            <MessageCircle size={30} color="white" />
          </div>
          <span>WhatsApp</span>
        </button>
        <a
          href={`tel:${phoneNumber}`}
          className="contact-button phone flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
        >
          <div className="icon-container phone mr-2">
            <Phone size={30} color="white" />
          </div>
          <span>Phone</span>
        </a>
      </div>

      <div className="info-container max-w-2xl text-center bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-700 text-lg">
          As per the 2018 Supreme Court Order, Online Sale of Firecrackers is NOT permitted. We value our customers and, at the same time, respect the jurisdiction. We request our customers to select their products on the Estimate Page to see their estimation and submit the required crackers through the Get Estimate Button. We will contact you within 2 hours and confirm the order through a phone call. Please add and submit your enquiries and enjoy your Diwali with Mahithraa Crackers. Mahithraa Crackers is a shop following 100% legal & statutory compliances, and all our shops and go-downs are maintained as per the Explosives Act. Our License Name: xxx, Licence No: x/xxxx. We send parcels through registered and legal transport service providers, as other major companies in Sivakasi do.
        </p>
      </div>
    </div>
  );
};

export default Contact;