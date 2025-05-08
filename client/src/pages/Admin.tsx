
import { useState } from "react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Mock data for admin panel
const mockUsers = [
  { id: 1, name: "Rahul Sharma", email: "rahul@yenepoya.edu.in", role: "student", status: "active" },
  { id: 2, name: "Priya Patel", email: "priya@yenepoya.edu.in", role: "student", status: "active" },
  { id: 3, name: "Dr. Anil Kumar", email: "anil@yenepoya.edu.in", role: "faculty", status: "active" },
  { id: 4, name: "Ananya Mishra", email: "ananya@yenepoya.edu.in", role: "student", status: "inactive" },
  { id: 5, name: "Dr. Sunita Rao", email: "sunita@yenepoya.edu.in", role: "faculty", status: "active" }
];

const mockPendingPosts = [
  { id: 1, author: "Student Council", title: "Transport Schedule Change", content: "Due to road construction, bus routes will be modified next week.", type: "yit" },
  { id: 2, author: "Cultural Club", title: "Dance Competition", content: "Annual dance competition registrations are now open.", type: "events" }
];

const mockOrders = [
  { id: 1, user: "Vikram Singh", items: "Masala Dosa x2, Coffee x1", total: 90, status: "pending" },
  { id: 2, user: "Ananya Mishra", items: "Veg Biryani x1, Lassi x1", total: 120, status: "completed" },
  { id: 3, user: "Rahul Sharma", items: "Chicken Burger x1, Fries x1", total: 130, status: "preparing" },
  { id: 4, user: "Priya Patel", items: "Paneer Roll x2", total: 100, status: "pending" }
];

// Analytics data (mock)
const analytics = {
  totalOrders: 2453,
  revenue: 24500,
  activeUsers: 876,
  chatbotQueries: 1245,
  popularFoods: [
    { name: "Biryani", orders: 423 },
    { name: "Masala Dosa", orders: 356 },
    { name: "Pizza", orders: 289 },
    { name: "Burger", orders: 254 },
    { name: "Ice Cream", orders: 198 }
  ],
  orderTrends: [
    { day: "Mon", orders: 120 },
    { day: "Tue", orders: 145 },
    { day: "Wed", orders: 132 },
    { day: "Thu", orders: 165 },
    { day: "Fri", orders: 210 },
    { day: "Sat", orders: 98 },
    { day: "Sun", orders: 78 }
  ]
};

export default function Admin() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  
  // Mock approval function
  const handleApproveContent = (id: number) => {
    toast.success("Content approved and published!");
  };
  
  // Mock rejection function
  const handleRejectContent = (id: number) => {
    toast.info("Content rejected and notified to author");
  };
  
  // Mock update order status function
  const handleUpdateOrderStatus = (id: number, status: string) => {
    toast.success(`Order #${id} status updated to ${status}`);
  };
  
  // Mock announcement function
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Announcement sent to all users!");
  };
  
  return (
    <DefaultLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Badge className="bg-yendine-navy text-white">Admin Access</Badge>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="orders">Food Orders</TabsTrigger>
            <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Total Orders</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.totalOrders}</div>
                  <p className="text-sm text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>Current users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.activeUsers}</div>
                  <p className="text-sm text-muted-foreground">+8% from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Last 30 days (₹)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₹{analytics.revenue}</div>
                  <p className="text-sm text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Foods</CardTitle>
                  <CardDescription>Most ordered items</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analytics.popularFoods.map((food, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{food.name}</span>
                        <span className="font-medium">{food.orders} orders</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Order Trends</CardTitle>
                  <CardDescription>Orders by day of week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 flex items-end justify-between">
                    {analytics.orderTrends.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-yendine-teal w-10" 
                          style={{ height: `${(day.orders / 210) * 100 * 0.8}%` }}
                        ></div>
                        <span className="text-xs mt-2">{day.day}</span>
                        <span className="text-xs text-muted-foreground">{day.orders}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                    <Input placeholder="Enter announcement title" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea placeholder="Enter announcement message" rows={4} />
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      className="bg-yendine-orange hover:bg-yendine-orange/90 text-white"
                    >
                      Send to All Users
                    </Button>
                    <Button variant="outline">Save Draft</Button>
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
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <Button className="bg-yendine-navy hover:bg-yendine-navy/90 text-white">Add User</Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="p-3">{user.name}</td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                Disable
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
          
          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Review and approve community content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockPendingPosts.map((post) => (
                    <div key={post.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{post.title}</h3>
                          <p className="text-sm text-muted-foreground">By: {post.author} • Type: {post.type === 'yit' ? 'YIT Update' : 'Event'}</p>
                        </div>
                        <Badge variant="outline">Pending Review</Badge>
                      </div>
                      
                      <p className="mb-4">{post.content}</p>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleApproveContent(post.id)} 
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleRejectContent(post.id)}
                        >
                          Reject
                        </Button>
                        <Button variant="outline">Edit</Button>
                      </div>
                    </div>
                  ))}
                  
                  {mockPendingPosts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No content pending moderation</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                      {mockOrders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="p-3">#{order.id}</td>
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
                                onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
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
            
            {/* AI Food Prediction Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>AI Food Prediction</CardTitle>
                <CardDescription>Forecast of food demand for tomorrow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Predicted Popular Items</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Chicken Biryani (~120 orders expected)</li>
                      <li>Masala Dosa (~95 orders expected)</li>
                      <li>Paneer Butter Masala (~80 orders expected)</li>
                    </ol>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Preparation Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Increase rice preparation by 15%</li>
                      <li>Stock additional chicken (8kg)</li>
                      <li>Prepare extra dosa batter</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Peak Hours</h3>
                    <p>Expected surge in orders:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Breakfast: 8:00 AM - 9:30 AM</li>
                      <li>Lunch: 12:30 PM - 2:00 PM</li>
                      <li>Evening Snacks: 4:30 PM - 5:30 PM</li>
                    </ul>
                  </div>
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
                  
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Existing Responses</h3>
                    <div className="space-y-4">
                      {Object.entries(mockResponses).slice(0, 5).map(([query, response], index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Keyword: "{query}"</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                Delete
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm">{response}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Chatbot Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-md p-4 text-center">
                        <p className="text-2xl font-bold">{analytics.chatbotQueries}</p>
                        <p className="text-sm text-muted-foreground">Total Queries</p>
                      </div>
                      <div className="border rounded-md p-4 text-center">
                        <p className="text-2xl font-bold">82%</p>
                        <p className="text-sm text-muted-foreground">Resolution Rate</p>
                      </div>
                      <div className="border rounded-md p-4 text-center">
                        <p className="text-2xl font-bold">124</p>
                        <p className="text-sm text-muted-foreground">Unresolved Queries</p>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DefaultLayout>
  );
}
