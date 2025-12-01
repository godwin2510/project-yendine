import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Link } from "react-router-dom";
import {useState, useEffect} from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api";
import {useNavigate} from 'react-router-dom';

const GoogleLogin = (props) => {
  // Mock authentication function
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('user-info');
        if (userInfo) {
            navigate('/home', { replace: true });
        }
    }, [navigate]);

    const responseGoogle = async (authResult) => {
      try {
        if (authResult["code"]) {
          const result = await googleAuth(authResult.code);
          console.log('Server response:', result.data);
          
          if (result.data && result.data.user && result.data.token) {
            const { email, name, image } = result.data.user;
            const token = result.data.token;
            const obj = { email, name, token, image };
            console.log('Setting user data:', obj);
            localStorage.setItem('user-info', JSON.stringify(obj));
            setUser(obj);
            console.log('Navigating to home page...');
            navigate('/home', { replace: true });
          } else {
            console.error('Invalid response structure:', result.data);
            setError('Invalid response from server');
            throw new Error('Invalid response structure from server');
          }
        } else {
          console.log('Auth result:', authResult);
          setError('No code received from Google');
          throw new Error('No code received from Google');
        }
      } catch (e) {
        console.error('Error while Google Login...', e);
        setError(e.message || 'Failed to login with Google');
      }
    };
  
    const googleLogin = useGoogleLogin({
      onSuccess: responseGoogle,
      onError: responseGoogle,
      flow: "auth-code",
    });
  
  
  return (
    <DefaultLayout>
      <div className="container py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>
              Sign in to your account to access all features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-100 border border-gray-300" 
              onClick={googleLogin}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Sign in with Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="text-center text-sm">
              <p>please use Google sign-in.</p>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full bg-yendine-navy hover:bg-yendine-navy/90 text-white">
              <Link to="/">Back to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DefaultLayout>
  );
}

export default GoogleLogin;