
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Link } from "react-router-dom";

const featureCards = [
  {
    title: "Food Ordering",
    description: "Order your favorite food from campus vendors with just a few clicks.",
    link: "/food",
    linkText: "Order Food"
  },
  {
    title: "Community Updates",
    description: "Stay updated with the latest events and announcements from campus.",
    link: "/community",
    linkText: "View Community"
  },
  {
    title: "Campus Chatbot",
    description: "Instant answers to your questions about college life, academics, and beyond.",
    link: "/chatbot",
    linkText: "Ask Questions"
  }
];

export default function Home() {
  return (
    <DefaultLayout>
      {/* Hero Section */}
      <section className=" text-white py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-black">
                Welcome to Yen-Dine
              </h1>
              <p className="mx-auto max-w-[700px] text-black-200 md:text-xl text-black">
                Your one-stop platform for campus dining, community updates, and more.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild className="bg-yendine-teal hover:bg-yendine-teal/90 text-white">
                <Link to="/food">Order Food</Link>
              </Button>
              <Button asChild variant="outline" className="bg-yendine-teal hover:bg-yendine-teal/90 text-white">
                <Link to="/community">Explore Community</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Everything You Need on Campus
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                Yen-Dine integrates essential campus services into one convenient platform.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {featureCards.map((feature, index) => (
              <Card key={index} className="border border-border hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full bg-yendine-navy hover:bg-yendine-navy/90 text-white">
                    <Link to={feature.link}>{feature.linkText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

 
    </DefaultLayout>
  );
}
