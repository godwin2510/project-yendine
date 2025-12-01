import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = () => {
    try {
      if (scannerContainerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        scannerRef.current.render(
          (decodedText: string) => {
            // QR code successfully scanned
            toast.success('QR Code detected!');
            onScanSuccess(decodedText);
            stopScanner();
          },
          (errorMessage: string) => {
            // QR code scanning error (not a failure, just no QR code found)
            console.log('QR scanning in progress...');
          }
        );

        setIsScanning(true);
        setError('');
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Failed to start camera. Please check camera permissions.');
      toast.error('Failed to start camera');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleRetry = () => {
    setError('');
    startScanner();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-xl">Scan QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center space-y-4">
              <div className="text-red-500 text-sm">{error}</div>
              <Button onClick={handleRetry} className="w-full">
                Retry Camera
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Position the QR code within the frame
                </p>
                {isScanning && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-sm">Scanning...</span>
                  </div>
                )}
              </div>
              
              <div 
                id="qr-reader" 
                ref={scannerContainerRef}
                className="w-full"
              ></div>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
