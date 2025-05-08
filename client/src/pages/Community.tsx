import { useState, useRef, ChangeEvent, useEffect } from "react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Image, X, Heart, HeartOff } from "lucide-react";
import { detectHateSpeech } from "@/utils/hateDetection";

// Types for our data
interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}

interface Post {
  id: number;
  category: string;
  author: string;
  avatar: string;
  timestamp: string;
  title: string;
  content: string;
  image: string | null;
  likes: number;
  comments: Comment[];
  likedBy: string[]; // Track which users have liked this post
}

// Mock user data - in a real app, this would come from authentication
const currentUser = {
  id: "user-1", // In a real app, this would be a unique user ID
  name: "You",
  avatar: "/placeholder.svg"
};

// Mock post data
const initialPosts: Post[] = [
  {
    id: 1,
    category: "yit",
    author: "Prof. Sharma",
    avatar: "/placeholder.svg",
    timestamp: "2 hours ago",
    title: "Updated Class Schedule",
    content: "Please note that all Computer Science classes for tomorrow have been rescheduled to the Main Building. Check your email for details.",
    image: "/placeholder.svg",
    likes: 24,
    likedBy: [], // Initially empty
    comments: [
      { id: 1, author: "Ananya M", content: "Thanks for the update!", timestamp: "1 hour ago" },
      { id: 2, author: "Rahul K", content: "Is this applicable for all batches?", timestamp: "30 min ago" }
    ]
  },
  {
    id: 2,
    category: "yit",
    author: "Student Council",
    avatar: "/placeholder.svg",
    timestamp: "Yesterday",
    title: "Library Extended Hours",
    content: "Good news! The central library will remain open until midnight during the exam week starting from Monday.",
    image: null,
    likes: 56,
    likedBy: [], // Initially empty
    comments: [
      { id: 3, author: "Priya J", content: "This is really helpful, thank you!", timestamp: "10 hours ago" }
    ]
  },
  {
    id: 3,
    category: "events",
    author: "Cultural Committee",
    avatar: "/placeholder.svg",
    timestamp: "2 days ago",
    title: "Annual Fest: Yenepoya Utsav 2023",
    content: "Mark your calendars! The annual cultural fest will be held from June 15-17. Performance registrations are now open. Cash prizes worth ₹50,000 to be won!",
    image: "/placeholder.svg",
    likes: 120,
    likedBy: [], // Initially empty
    comments: [
      { id: 4, author: "Vikram S", content: "Looking forward to the dance competition!", timestamp: "1 day ago" },
      { id: 5, author: "Deepa R", content: "Where can we register our band?", timestamp: "1 day ago" },
      { id: 6, author: "Cultural Committee", content: "Registration forms available at Student Affairs office.", timestamp: "20 hours ago" }
    ]
  },
  {
    id: 4,
    category: "events",
    author: "Tech Club",
    avatar: "/placeholder.svg",
    timestamp: "5 days ago",
    title: "Hackathon: Code for Change",
    content: "Join us for a 24-hour hackathon focused on developing solutions for campus problems. Teams of 3-4 members. Great prizes and internship opportunities for winners!",
    image: "/placeholder.svg",
    likes: 87,
    likedBy: [], // Initially empty
    comments: []
  }
];

// Post component
function Post({ post, onLike, onAddComment }) {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const hasUserLiked = post.likedBy.includes(currentUser.id);
  
  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    // Check for hate speech before adding comment
    const hateSpeechResult = detectHateSpeech(comment);
    
    if (hateSpeechResult.isHateSpeech) {
      toast.error("Your comment contains inappropriate language and cannot be posted.", {
        description: hateSpeechResult.reason
      });
      return;
    }
    
    onAddComment(post.id, comment);
    setComment("");
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.avatar} alt={post.author} />
            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.author}</p>
            <p className="text-xs text-muted-foreground">{post.timestamp}</p>
          </div>
        </div>
        {post.title && <CardTitle className="mt-2">{post.title}</CardTitle>}
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{post.content}</p>
        {post.image && (
          <div className="rounded-md overflow-hidden">
            <img src={post.image} alt="Post attachment" className="w-full h-auto max-h-[400px] object-contain" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex gap-1 items-center" 
            onClick={() => onLike(post.id)}
          >
            {hasUserLiked ? (
              <HeartOff className="mr-1 h-4 w-4 text-red-500" />
            ) : (
              <Heart className={`mr-1 h-4 w-4 ${hasUserLiked ? 'text-red-500 fill-red-500' : ''}`} />
            )}
            {post.likes} {hasUserLiked && "(Liked)"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex gap-1 items-center"
            onClick={() => setShowComments(!showComments)}
          >
            💬 {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
          </Button>
        </div>
        
        {showComments && (
          <>
            <div className="w-full space-y-3">
              {post.comments.map(comment => (
                <div key={comment.id} className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">{comment.author}</p>
                    <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 w-full">
              <Textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
              />
              <Button 
                onClick={handleAddComment} 
                disabled={!comment.trim()}
                className="bg-yendine-navy hover:bg-yendine-navy/90 text-white"
              >
                Post
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

// New post form component
function NewPostForm({ category, onSubmit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    // Check for hate speech before submitting
    const hateSpeechResult = detectHateSpeech(content);
    const titleHateSpeechResult = detectHateSpeech(title);
    
    if (hateSpeechResult.isHateSpeech || titleHateSpeechResult.isHateSpeech) {
      toast.error("Your post contains inappropriate language and cannot be published.", {
        description: hateSpeechResult.isHateSpeech ? hateSpeechResult.reason : titleHateSpeechResult.reason
      });
      return;
    }
    
    onSubmit({ 
      category, 
      title, 
      content, 
      imageFile: image,
      image: imagePreview // In a real app, you'd upload the file to a server and get back a URL
    });
    
    setTitle("");
    setContent("");
    removeImage();
  };
  
  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-lg">Create a New {category === "yit" ? "Post" : "Event"}</CardTitle>
          <CardDescription>
            Share {category === "yit" ? "updates with the campus community" : "information about upcoming events"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder={`Enter ${category === "yit" ? "post" : "event"} title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              placeholder={`What's on your mind?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Image (Optional)</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex gap-2 items-center"
              >
                <Image size={20} />
                Upload Image
              </Button>
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            
            {imagePreview && (
              <div className="relative mt-2 inline-block">
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-48 rounded-md object-contain bg-muted p-2"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                    onClick={removeImage}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-yendine-teal hover:bg-yendine-teal/90 text-white"
            disabled={!title.trim() || !content.trim()}
          >
            Post {category === "yit" ? "Update" : "Event"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeTab, setActiveTab] = useState("yit");
  
  // Load posts from localStorage if available (persistence between sessions)
  useEffect(() => {
    const savedPosts = localStorage.getItem('community-posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);
  
  // Save posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('community-posts', JSON.stringify(posts));
  }, [posts]);
  
  // Filter posts based on active tab
  const filteredPosts = posts.filter(post => post.category === activeTab);
  
  // Handle creating a new post
  const handleNewPost = (postData) => {
    const newPost = {
      id: Date.now(), // Use timestamp as unique ID
      author: currentUser.name,
      avatar: currentUser.avatar,
      timestamp: "Just now",
      title: postData.title,
      content: postData.content,
      image: postData.image, // In a real app, this would be a URL from server upload
      likes: 0,
      comments: [],
      category: postData.category,
      likedBy: [] // Initialize empty liked-by array
    };
    
    setPosts([newPost, ...posts]);
    toast.success(`Your ${postData.category === "yit" ? "post" : "event"} has been shared!`);
  };
  
  // Handle liking/unliking a post
  const handleLikePost = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        // Check if user already liked this post
        const hasLiked = post.likedBy.includes(currentUser.id);
        
        if (hasLiked) {
          // User already liked, so unlike the post
          toast.success("Post unliked");
          return { 
            ...post, 
            likes: post.likes - 1,
            likedBy: post.likedBy.filter(id => id !== currentUser.id)
          };
        } else {
          // Add user to likedBy array and increment like count
          toast.success("Post liked!");
          return { 
            ...post, 
            likes: post.likes + 1,
            likedBy: [...post.likedBy, currentUser.id]
          };
        }
      }
      return post;
    }));
  };
  
  // Handle adding a comment
  const handleAddComment = (postId, commentText) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: Date.now(), // Use timestamp for unique ID
          author: currentUser.name,
          content: commentText,
          timestamp: "Just now"
        };
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));
    
    toast.success("Comment added successfully!");
  };

  return (
    <DefaultLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Campus Community</h1>
        
        <Tabs defaultValue="yit" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="yit">YIT Updates</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="yit" className="space-y-6">
            <NewPostForm category="yit" onSubmit={handleNewPost} />
            
            <div>
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <Post 
                    key={post.id} 
                    post={post} 
                    onLike={handleLikePost} 
                    onAddComment={handleAddComment}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts yet. Be the first to share an update!</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-6">
            <NewPostForm category="events" onSubmit={handleNewPost} />
            
            <div>
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <Post 
                    key={post.id} 
                    post={post} 
                    onLike={handleLikePost} 
                    onAddComment={handleAddComment}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No events posted yet. Share an upcoming event!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DefaultLayout>
  );
}
