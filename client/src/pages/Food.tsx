
import { useState } from "react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock food data
const mockFoodItems = {
  monday: [
    { id: 1, name: "Masala Dosa", price: 40, vendor: "South Indian Canteen", isVeg: true, image: "/placeholder.svg" },
    { id: 2, name: "Chicken Biryani", price: 120, vendor: "Main Canteen", isVeg: false, image: "/placeholder.svg" },
    { id: 3, name: "Paneer Butter Masala", price: 90, vendor: "North Indian Stall", isVeg: true, image: "/placeholder.svg" },
    { id: 4, name: "Veg Fried Rice", price: 70, vendor: "Chinese Corner", isVeg: true, image: "/placeholder.svg" },
  ],
  tuesday: [
    { id: 5, name: "Chole Bhature", price: 60, vendor: "North Indian Stall", isVeg: true, image: "/placeholder.svg" },
    { id: 6, name: "Fish Curry Rice", price: 110, vendor: "Coastal Cuisine", isVeg: false, image: "/placeholder.svg" },
    { id: 7, name: "Veg Pulao", price: 80, vendor: "Main Canteen", isVeg: true, image: "/placeholder.svg" },
  ],
  wednesday: [
    { id: 8, name: "Idli Sambar", price: 30, vendor: "South Indian Canteen", isVeg: true, image: "/placeholder.svg" },
    { id: 9, name: "Chicken Noodles", price: 90, vendor: "Chinese Corner", isVeg: false, image: "/placeholder.svg" },
    { id: 10, name: "Aloo Paratha", price: 50, vendor: "North Indian Stall", isVeg: true, image: "/placeholder.svg" },
  ],
  thursday: [
    { id: 11, name: "Veg Thali", price: 100, vendor: "Main Canteen", isVeg: true, image: "/placeholder.svg" },
    { id: 12, name: "Chicken Roll", price: 60, vendor: "Fast Food Counter", isVeg: false, image: "/placeholder.svg" },
    { id: 13, name: "Paneer Roll", price: 50, vendor: "Fast Food Counter", isVeg: true, image: "/placeholder.svg" },
  ],
  friday: [
    { id: 14, name: "Pav Bhaji", price: 60, vendor: "Mumbai Street Food", isVeg: true, image: "/placeholder.svg" },
    { id: 15, name: "Mutton Biryani", price: 150, vendor: "Main Canteen", isVeg: false, image: "/placeholder.svg" },
    { id: 16, name: "Veg Burger", price: 45, vendor: "Fast Food Counter", isVeg: true, image: "/placeholder.svg" },
  ],
};

// Food item component
function FoodItem({ item, onAddToCart }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge variant={item.isVeg ? "outline" : "default"} className={item.isVeg ? "border-green-500 text-green-500" : "bg-red-500"}>
            {item.isVeg ? "Veg" : "Non-Veg"}
          </Badge>
        </div>
        <CardDescription>Vendor: {item.vendor}</CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="font-bold">₹{item.price}</span>
        <Button 
          onClick={() => onAddToCart(item)} 
          size="sm"
          className="bg-yendine-teal hover:bg-yendine-teal/90 text-white"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function Food() {
  const [cart, setCart] = useState([]);
  const [activeDay, setActiveDay] = useState("monday");
  
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  
  // Format day names for display
  const formatDay = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  // Handle adding items to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    
    toast.success(`Added ${item.name} to cart`);
  };
  
  // Handle removing items from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
    toast.info("Item removed from cart");
  };
  
  // Calculate total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Handle checkout process
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    // On mobile, we would open a payment app
    // On desktop, we would show a QR code
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      toast.info("Opening UPI payment app...");
      // This would be replaced with actual UPI deep linking
      alert("In a real app, this would open a UPI payment app");
    } else {
      toast.info("Displaying QR code for payment");
      alert("In a real app, this would display a QR code for payment");
    }
  };

  return (
    <DefaultLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Campus Food Ordering</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Food Menu Section */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue={activeDay} onValueChange={setActiveDay}>
              <TabsList className="w-full grid grid-cols-5">
                {days.map(day => (
                  <TabsTrigger key={day} value={day}>
                    {formatDay(day)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {days.map(day => (
                <TabsContent key={day} value={day}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mockFoodItems[day].map(item => (
                      <FoodItem key={item.id} item={item} onAddToCart={addToCart} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2">AI-Powered Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-sm">Queue Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Current Wait: ~10 mins</p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-sm">Food Demand</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Popular today: Biryani</p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-sm">Table Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Free tables: 12</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          {/* Cart Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Order</CardTitle>
                <CardDescription>{cart.length} items in cart</CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x ₹{item.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">₹{item.price * item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-8 w-8"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold">₹{getTotalPrice()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-yendine-orange hover:bg-yendine-orange/90 text-white"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  Pay Now (₹{getTotalPrice()})
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
