import React from 'react';

const Notify = () => {
  const notificationText = "Diwali Offers 2024! Up to 50% off. Fast delivery. All types of fancy crackers & gift boxes available.";

  return (
    <div className="bg-[#00D109] overflow-hidden py-3">
      <marquee className="text-white text-lg font-medium" behavior="scroll" direction="left" scrollamount="10">
        {notificationText}
      </marquee>
    </div>
  );
};

export default Notify;