import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Heart, MapPin, Users, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-food.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">FoodShare</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#impact" className="text-muted-foreground hover:text-foreground transition-colors">Impact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Together We Can
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  End Food Waste
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Connect with your community to share surplus food. Every meal saved is a step towards a sustainable future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth" className="flex-1 sm:flex-none">
                  <Button size="lg" className="w-full">
                    Start Sharing <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">50K+</div>
                  <div className="text-sm text-muted-foreground">Meals Saved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">200+</div>
                  <div className="text-sm text-muted-foreground">Cities</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Fresh food sharing"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Join the Movement</div>
                    <div className="text-sm text-muted-foreground">Make an impact today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose FoodShare?</h2>
            <p className="text-lg text-muted-foreground">
              Simple, effective, and impactful. Our platform makes food sharing effortless.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Community Driven</CardTitle>
                <CardDescription>
                  Connect with neighbors, local businesses, and organizations to share surplus food
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Location Based</CardTitle>
                <CardDescription>
                  Find food available near you in real-time with our smart location matching
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>
                  Track your contribution to reducing food waste and carbon emissions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to start making a difference
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground">Sign Up</h3>
              <p className="text-muted-foreground">
                Create your account and choose your role as a donor or receiver
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground">List or Browse</h3>
              <p className="text-muted-foreground">
                Share your surplus food or find available meals nearby
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground">Connect & Share</h3>
              <p className="text-muted-foreground">
                Schedule pickup and make a positive impact in your community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold text-foreground">Make a Real Impact</h2>
            <p className="text-xl text-muted-foreground">
              Every meal shared contributes to a more sustainable future. Join thousands of users already making a difference.
            </p>
            <Link to="/auth">
              <Button size="lg" className="mt-4">
                Join FoodShare Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">FoodShare</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Reducing food waste, one meal at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#impact" className="hover:text-foreground transition-colors">Impact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 FoodShare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
