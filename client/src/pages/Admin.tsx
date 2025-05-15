import { useState, useEffect } from "react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Order {
  _id: string;
  user: string;
  items: string;
  total: number;
  status: string;
}

interface Post {
  _id: string;
  author: string;
  title: string;
  content: string;
  type: string;
  status: string;
}

export default function Admin() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [foods, setFoods] = useState<Food[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAddFoodDialogOpen, setIsAddFoodDialogOpen] = useState(false);
  const [isEditFoodDialogOpen, setIsEditFoodDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [newFood, setNewFood] = useState<Partial<Food>>({
    name: '',
    description: '',
    price: 0,
    category: 'main',
    image: '',
    preparationTime: 0,
    ingredients: [],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchFoods();
    fetchUsers();
    fetchOrders();
    fetchPosts();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/foods');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch foods');
      }
      const data = await response.json();
      setFoods(data);
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast.error('Failed to fetch foods');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      toast.error('Failed to fetch posts');
    }
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!newFood.name || !newFood.description || !newFood.price || !newFood.category) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Prepare the food data
      const foodData = {
        name: newFood.name,
        description: newFood.description,
        price: Number(newFood.price),
        category: newFood.category,
        image: newFood.image || '',
        isAvailable: true,
        preparationTime: Number(newFood.preparationTime) || 0,
        ingredients: newFood.ingredients || [],
        nutritionalInfo: {
          calories: newFood.nutritionalInfo?.calories || 0,
          protein: newFood.nutritionalInfo?.protein || 0,
          carbs: newFood.nutritionalInfo?.carbs || 0,
          fat: newFood.nutritionalInfo?.fat || 0
        }
      };

      // Send request to store in database
      const response = await fetch('http://localhost:5000/api/foods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foodData),
      });

      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add food item');
      }

      // Get the newly created food item from response
      const addedFood = await response.json();
      
      // Update the local state with the new food item
      setFoods(prevFoods => [...prevFoods, addedFood]);
      
      // Close the dialog and reset form
      setIsAddFoodDialogOpen(false);
      setNewFood({
        name: '',
        description: '',
        price: 0,
        category: 'meals',
        image: '',
        preparationTime: 0,
        ingredients: [],
        nutritionalInfo: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      });

      // Show success message
      toast.success('Food item added successfully to database');
      
      // Refresh the food list to ensure we have the latest data
      fetchFoods();
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error(error.message || 'Failed to add food item to database');
    }
  };

  const handleUpdateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    try {
      const response = await fetch(`http://localhost:5000/api/foods/${selectedFood._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedFood),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update food');
      }
      
      const updatedFood = await response.json();
      setFoods(foods.map(food => food._id === updatedFood._id ? updatedFood : food));
      setIsEditFoodDialogOpen(false);
      setSelectedFood(null);
      toast.success('Food item updated successfully');
    } catch (error) {
      console.error('Error updating food:', error);
      toast.error(error.message || 'Failed to update food item');
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/foods/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete food');
      }
      
      setFoods(foods.filter(food => food._id !== id));
      toast.success('Food item deleted successfully');
    } catch (error) {
      console.error('Error deleting food:', error);
      toast.error(error.message || 'Failed to delete food item');
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      const food = foods.find(f => f._id === id);
      if (!food) throw new Error('Food item not found');

      const response = await fetch(`http://localhost:5000/api/foods/${id}/toggle-availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !food.isAvailable }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle availability');
      }
      
      const updatedFood = await response.json();
      setFoods(foods.map(food => food._id === updatedFood._id ? updatedFood : food));
      toast.success('Food availability updated');
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error(error.message || 'Failed to update food availability');
    }
  };

  const handleApproveContent = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}/approve`, {
        method: 'PATCH',
      });
      
      if (!response.ok) throw new Error('Failed to approve content');
      
      const updatedPost = await response.json();
      setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
      toast.success('Content approved and published!');
    } catch (error) {
      toast.error('Failed to approve content');
    }
  };

  const handleRejectContent = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}/reject`, {
        method: 'PATCH',
      });
      
      if (!response.ok) throw new Error('Failed to reject content');
      
      const updatedPost = await response.json();
      setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
      toast.info('Content rejected and notified to author');
    } catch (error) {
      toast.error('Failed to reject content');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('Failed to update order status');
      
      const updatedOrder = await response.json();
      setOrders(orders.map(order => order._id === updatedOrder._id ? updatedOrder : order));
      toast.success(`Order #${id} status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.get('title'),
          message: formData.get('message'),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to send announcement');
      
      toast.success('Announcement sent to all users!');
    } catch (error) {
      toast.error('Failed to send announcement');
    }
  };

  return (
    <DefaultLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Badge className="bg-yendine-navy text-white">Admin Access</Badge>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Food Orders</TabsTrigger>
            <TabsTrigger value="foods">Food Management</TabsTrigger>
            <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Removed Total Orders Card */}
              {/* Removed Active Users Card */}
              {/* Removed Revenue Card */}
            </div>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Send Announcement</CardTitle>
                <CardDescription>Notify all users of important updates</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Announcement Title</label>
                    <Input name="title" placeholder="Enter announcement title" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea name="message" placeholder="Enter announcement message" rows={4} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image (Optional)</label>
                    <Input type="file" name="image" accept="image/*" />
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      className="bg-yendine-orange hover:bg-yendine-orange/90 text-white"
                    >
                      Send to All Users
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Logged-in Users</CardTitle>
                  <CardDescription>List of users who have logged in through Gmail</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b">
                          <td className="p-3">{user.name}</td>
                          <td className="p-3">{user.email}</td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={2} className="p-3 text-center text-muted-foreground">
                            No users logged in yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Moderation Tab */}
          <TabsContent value="Moderation">
            {/* Removed Moderation TabsContent */}
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Food Orders</CardTitle>
                <CardDescription>Manage and track food orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="p-3 text-left">Order ID</th>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Items</th>
                        <th className="p-3 text-left">Total</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-b">
                          <td className="p-3">#{order._id}</td>
                          <td className="p-3">{order.user}</td>
                          <td className="p-3">{order.items}</td>
                          <td className="p-3">₹{order.total}</td>
                          <td className="p-3">
                            <Badge className={
                              order.status === 'completed' ? 'bg-green-500' : 
                              order.status === 'preparing' ? 'bg-yellow-500' : 'bg-blue-500'
                            }>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                              >
                                Update Status
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Food Management Tab */}
          <TabsContent value="foods">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Food Management</CardTitle>
                  <CardDescription>Manage food items and their availability</CardDescription>
                </div>
                <Dialog open={isAddFoodDialogOpen} onOpenChange={setIsAddFoodDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-yendine-navy hover:bg-yendine-navy/90 text-white">
                      Add Food Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Food Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddFood} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={newFood.name}
                          onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newFood.description}
                          onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          value={newFood.price}
                          onChange={(e) => setNewFood({ ...newFood, price: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={newFood.category}
                          onValueChange={(value) => setNewFood({ ...newFood, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">Main Course</SelectItem>
                            <SelectItem value="appetizer">Appetizer</SelectItem>
                            <SelectItem value="dessert">Dessert</SelectItem>
                            <SelectItem value="beverage">Beverage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={newFood.image}
                          onChange={(e) => setNewFood({ ...newFood, image: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Preparation Time (minutes)</Label>
                        <Input
                          type="number"
                          value={newFood.preparationTime}
                          onChange={(e) => setNewFood({ ...newFood, preparationTime: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-yendine-navy hover:bg-yendine-navy/90 text-white">
                        Add Food Item
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-left">Price</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foods.map((food) => (
                        <tr key={food._id} className="border-b">
                          <td className="p-3">{food.name}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="capitalize">
                              {food.category}
                            </Badge>
                          </td>
                          <td className="p-3">₹{food.price}</td>
                          <td className="p-3">
                            <Badge className={food.isAvailable ? 'bg-green-500' : 'bg-red-500'}>
                              {food.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedFood(food);
                                  setIsEditFoodDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleAvailability(food._id)}
                              >
                                {food.isAvailable ? 'Make Unavailable' : 'Make Available'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteFood(food._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Chatbot Tab */}
          <TabsContent value="chatbot">
            <Card>
              <CardHeader>
                <CardTitle>Chatbot Knowledge Base</CardTitle>
                <CardDescription>Manage and update the chatbot's responses</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Add New Knowledge</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Keyword/Phrase</label>
                        <Input placeholder="e.g., scholarship, wifi password" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Response</label>
                        <Textarea placeholder="Enter the response for this query" />
                      </div>
                    </div>
                    <Button className="mt-2 bg-yendine-teal hover:bg-yendine-teal/90 text-white">
                      Add Response
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Food Dialog */}
      <Dialog open={isEditFoodDialogOpen} onOpenChange={setIsEditFoodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Food Item</DialogTitle>
          </DialogHeader>
          {selectedFood && (
            <form onSubmit={handleUpdateFood} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={selectedFood.name}
                  onChange={(e) => setSelectedFood({ ...selectedFood, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedFood.description}
                  onChange={(e) => setSelectedFood({ ...selectedFood, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={selectedFood.price}
                  onChange={(e) => setSelectedFood({ ...selectedFood, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={selectedFood.category}
                  onValueChange={(value) => setSelectedFood({ ...selectedFood, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Course</SelectItem>
                    <SelectItem value="appetizer">Appetizer</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={selectedFood.image}
                  onChange={(e) => setSelectedFood({ ...selectedFood, image: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Preparation Time (minutes)</Label>
                <Input
                  type="number"
                  value={selectedFood.preparationTime}
                  onChange={(e) => setSelectedFood({ ...selectedFood, preparationTime: Number(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-yendine-navy hover:bg-yendine-navy/90 text-white">
                Update Food Item
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}
