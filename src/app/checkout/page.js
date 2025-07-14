import React, { useState, useEffect } from 'react';
import {
  Loader2,
  MapPin,
  ShoppingCart,
  Timer,
  Coins,
  ArrowRightCircle,
  Calendar,
  Users,
  Star,
} from 'lucide-react';

// Mock components and store for demonstration
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = "" }) => (
  <div className={`p-4 pb-2 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 pt-2 ${className}`}>{children}</div>
);
const Button = ({ children, onClick, disabled, className = "", variant = "primary" }) => {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300"
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Mock AddressPicker component
const AddressPicker = ({ onSelect }) => {
  const handleSelect = () => {
    onSelect({
      fullAddress: "123 Sample Street, Tech City, Karnataka 560001",
      lat: 12.9716,
      lng: 77.5946
    });
  };
  
  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Enter your address..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
      />
      <Button onClick={handleSelect} className="w-full">
        Select This Address
      </Button>
    </div>
  );
};

// Mock cart store
const mockCart = {
  items: [
    { productId: { name: "Organic Apples" }, quantity: 2, priceAtTime: 150 },
    { productId: { name: "Fresh Spinach" }, quantity: 1, priceAtTime: 80 },
    { productId: { name: "Whole Wheat Bread" }, quantity: 1, priceAtTime: 45 }
  ],
  totalAmount: 275
};

export default function CheckoutPage() {
  const [address, setAddress] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlot, setTimeSlot] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [bestSlot, setBestSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [result, setResult] = useState(null);
  const [cart] = useState(mockCart);

  // Generate fake calendar data for next 2 weeks
  const generateCalendarData = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const isRecommended = dayName === 'Sunday' && i > 0; // Next Sunday is recommended
      
      dates.push({
        date: date,
        dayName: dayName,
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        orderCount: isRecommended ? 5 : Math.floor(Math.random() * 4) + 1,
        isRecommended: isRecommended,
        isToday: i === 0
      });
    }
    return dates;
  };

  const [calendarData] = useState(generateCalendarData());

  const mockSlots = [
    { timeSlot: "morning", peers: 8, savings: 2.5 },
    { timeSlot: "afternoon", peers: 12, savings: 3.2 },
    { timeSlot: "evening", peers: 6, savings: 1.8 }
  ];

  const handleCheckout = async () => {
    if (!address || !timeSlot || !selectedDate) {
      alert('Please select your delivery location, date, and time slot.');
      return;
    }

    setLoadingCheckout(true);
    setResult(null);

    // Simulate API call
    setTimeout(() => {
      setResult({
        co2Saved: 3200, // in grams
        rewardCoins: selectedDate.isRecommended ? 150 : 100
      });
      setLoadingCheckout(false);
    }, 2000);
  };

  const onSelectAddress = (pos) => {
    setAddress(pos);
    setSelectedDate(null);
    setTimeSlot(null);
    setAllSlots([]);
    setBestSlot(null);
  };

  const onSelectDate = (dateData) => {
    setSelectedDate(dateData);
    setLoadingSlots(true);
    setTimeSlot(null);
    setAllSlots([]);
    setBestSlot(null);

    // Simulate loading delay
    setTimeout(() => {
      const bonusMultiplier = dateData.isRecommended ? 1.3 : 1;
      const enhancedSlots = mockSlots.map(slot => ({
        ...slot,
        savings: slot.savings * bonusMultiplier,
        peers: slot.peers + (dateData.isRecommended ? 2 : 0)
      }));

      const bestSlotData = enhancedSlots.find(s => s.timeSlot === "afternoon");
      setBestSlot(bestSlotData);
      setAllSlots(enhancedSlots);
      setTimeSlot("afternoon");
      setLoadingSlots(false);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-gray-800">🌱 EcoCheckout</h1>
        <p className="text-gray-600 mt-2">Choose sustainable delivery options and earn rewards!</p>
      </div>

      {/* Order Summary + Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card className="shadow-lg">
          <CardHeader className="flex items-center gap-2">
            <ShoppingCart className="text-orange-600" />
            <CardTitle className="text-xl font-bold text-gray-800">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-base text-gray-700">
            {cart.items.map((item, index) => (
              <div key={index} className="flex justify-between font-semibold">
                <span>{item.productId.name} × {item.quantity}</span>
                <span className="font-medium">₹{item.priceAtTime.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span className="text-lg font-bold text-gray-900">₹{cart.totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Address Picker */}
        <Card className="shadow-lg">
          <CardHeader className="flex items-center gap-2">
            <MapPin className="text-blue-600" />
            <CardTitle className="text-xl font-bold text-gray-800">Select Delivery Location</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressPicker onSelect={onSelectAddress} />
            {address?.fullAddress && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-900 flex gap-2 items-start border border-blue-200">
                <MapPin className="w-5 h-5 mt-0.5 text-blue-500" />
                <div>
                  <strong className="block mb-1">Selected Address:</strong>
                  <span className="text-[15px]">{address.fullAddress}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Date Selection Calendar */}
      {address && (
        <Card className="shadow-lg">
          <CardHeader className="flex items-center gap-2">
            <Calendar className="text-green-600" />
            <CardTitle className="text-xl font-bold text-gray-800">Choose Delivery Date</CardTitle>
            <div className="ml-auto text-sm text-gray-600">
              📊 Higher order count = Better rewards!
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {calendarData.map((day, index) => {
                const isSelected = selectedDate?.date.getTime() === day.date.getTime();
                return (
                  <div
                    key={index}
                    onClick={() => onSelectDate(day)}
                    className={`
                      relative p-3 border-2 rounded-lg cursor-pointer transition-all hover:scale-105
                      ${isSelected ? 'border-green-500 bg-green-50 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
                      ${day.isRecommended ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
                      ${day.isToday ? 'bg-blue-50' : ''}
                    `}
                  >
                    {day.isRecommended && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Best
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-600 font-medium">
                        {day.dayName.slice(0, 3)}
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {day.dayNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {day.month}
                      </div>
                      
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span className="font-semibold text-blue-600">
                          {day.orderCount}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-600">
                        {day.orderCount === 5 ? 'Max rewards!' : `${day.orderCount} orders`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedDate && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <Calendar className="w-5 h-5" />
                  <strong>Selected Date:</strong>
                  <span>
                    {selectedDate.dayName}, {selectedDate.dayNumber} {selectedDate.month}
                    {selectedDate.isRecommended && ' 🌟 (Recommended!)'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  📦 {selectedDate.orderCount} orders scheduled • 
                  {selectedDate.isRecommended ? ' 🎉 Maximum rewards day!' : ` 🪙 Standard rewards`}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading Slots */}
      {loadingSlots && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          <p className="text-center text-gray-700 font-medium">
            🌍 Finding the most eco-friendly delivery route for {selectedDate?.dayName}…
          </p>
          <div className="w-56 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Time Slots */}
      {!loadingSlots && selectedDate && allSlots.length > 0 && (
        <Card className="shadow-md border">
          <CardHeader className="flex items-center gap-2">
            <Timer className="text-purple-600" />
            <CardTitle className="text-xl font-bold text-gray-800">
              Choose Time Slot for {selectedDate.dayName}
              {selectedDate.isRecommended && (
                <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  🎉 Bonus CO₂ savings today!
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allSlots.map((slot) => {
              const isSelected = slot.timeSlot === timeSlot;
              const isBest = slot.timeSlot === bestSlot.timeSlot;
              return (
                <div
                  key={slot.timeSlot}
                  onClick={() => setTimeSlot(slot.timeSlot)}
                  className={`
                    relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-102
                    ${isSelected ? 'border-green-600 bg-green-50 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
                    ${isBest ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
                  `}
                >
                  {/* Radio Circle */}
                  <div className="absolute top-4 left-4 w-5 h-5 flex-shrink-0 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
                  </div>

                  {/* Best Option Badge */}
                  {isBest && (
                    <div className="absolute top-2 right-2 text-sm bg-green-600 text-white px-3 py-1 rounded-full shadow-md animate-pulse">
                      🌱 Best Option
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="ml-10">
                    <div className="text-lg font-semibold text-gray-800 capitalize">
                      ⏰ {slot.timeSlot}
                    </div>
                    <div className="mt-2 space-y-1 text-[15px] text-gray-700">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span><strong>Peers Nearby:</strong> {slot.peers}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-700 font-bold">
                          💨 CO₂ Saved: {slot.savings.toFixed(2)} kg
                          {selectedDate.isRecommended && (
                            <span className="text-xs ml-1 bg-green-200 text-green-800 px-1 rounded">
                              +30% bonus!
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center pt-4">
        <Button
          disabled={loadingCheckout || !timeSlot || !selectedDate}
          onClick={handleCheckout}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 w-full md:w-auto text-base disabled:opacity-50"
        >
          {loadingCheckout ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
              Placing Order…
            </>
          ) : (
            <>
              🌱 Place Order & Earn <Coins className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={() => alert('Redirecting to rewards page...')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-base"
        >
          See GreenCoins <ArrowRightCircle className="w-4 h-4" />
        </Button>
      </div>

      {/* Order Confirmation */}
      {result && (
        <Card className="border-green-500 shadow-md mt-6">
          <CardHeader className="flex items-center gap-2">
            🎉 <CardTitle className="text-xl font-bold text-green-800">
              Order Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-base text-green-900 space-y-2">
            <p>
              📅 Delivery Date: <strong>{selectedDate.dayName}, {selectedDate.dayNumber} {selectedDate.month}</strong>
            </p>
            <p>
              ⏰ Time Slot: <strong className="capitalize">{timeSlot}</strong>
            </p>
            <p>
              💨 CO₂ Saved: <strong>{(result.co2Saved / 1000).toFixed(2)} kg</strong>
              {selectedDate.isRecommended && (
                <span className="ml-2 text-sm bg-green-200 text-green-800 px-2 py-1 rounded">
                  +30% bonus applied!
                </span>
              )}
            </p>
            <p>
              🪙 GreenCoins Earned: <strong>{result.rewardCoins}</strong>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}