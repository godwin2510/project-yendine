import { useState, useEffect } from "react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Food {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  preparationTime: number;
  ingredients: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Food item component
function FoodItem({ item, onAddToCart }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge variant="outline" className="border-green-500 text-green-500">
            {item.category}
          </Badge>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="font-bold">₹{item.price}</span>
        <Button 
          onClick={() => onAddToCart(item)} 
          size="sm"
          className="bg-yendine-teal hover:bg-yendine-teal/90 text-white"
          disabled={!item.isAvailable}
        >
          {item.isAvailable ? 'Add to Cart' : 'Not Available'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function Food() {
  const [cart, setCart] = useState([]);
  const [activeDay, setActiveDay] = useState("monday");
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Format day names for display
  const formatDay = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Fetch foods from the API
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/foods');
        if (!response.ok) throw new Error('Failed to fetch foods');
        const data = await response.json();
        setFoods(data);
      } catch (error) {
        toast.error('Failed to load food items');
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);
  
  // Handle adding items to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem._id === item._id 
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
    setCart(cart.filter(item => item._id !== itemId));
    toast.info("Item removed from cart");
  };
  
  // Calculate total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Handle checkout process
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            foodId: item._id,
            quantity: item.quantity,
            price: item.price
          })),
          total: getTotalPrice()
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');

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

      // Clear cart after successful order
      setCart([]);
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  // Group foods by category for display
  const foodsByCategory = foods.reduce((acc, food) => {
    if (!acc[food.category]) {
      acc[food.category] = [];
    }
    acc[food.category].push(food);
    return acc;
  }, {});

  return (
    <DefaultLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Campus Food Ordering</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Food Menu Section */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue={activeDay} onValueChange={setActiveDay}>
              <TabsList className="w-full grid grid-cols-5">
                {/* Removed days.map logic */}
              </TabsList>
              
              {/* Removed days.map logic */}
              <TabsContent key={activeDay} value={activeDay}>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading food items...</p>
                  </div>
                ) : foods.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No food items available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(foodsByCategory).map(([category, items]) => (
                      <div key={category} className="col-span-2">
                        <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(items as Food[]).map(item => (
                            <FoodItem key={item._id} item={item} onAddToCart={addToCart} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
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
                    <p className="text-sm text-muted-foreground">Popular today: {foods.length > 0 ? foods[0].name : 'Loading...'}</p>
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
                      <div key={item._id} className="flex justify-between items-center">
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
                            onClick={() => removeFromCart(item._id)}
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
