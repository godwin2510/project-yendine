import axios from 'axios';
import config from '../config';

const API_URL = config.getApiUrl();

// Payment service for real-time payments
export class PaymentService {
  // Initialize Razorpay payment
  static async createRazorpayOrder(orderData: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }) {
    try {
      const response = await axios.post(`${API_URL}/api/payments/create-order`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Verify Razorpay payment
  static async verifyRazorpayPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    try {
      const response = await axios.post(`${API_URL}/api/payments/verify`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Create UPI payment intent
  static async createUPIPayment(paymentData: {
    amount: number;
    upiId: string;
    description: string;
    orderId: string;
  }) {
    try {
      const response = await axios.post(`${API_URL}/api/payments/upi`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating UPI payment:', error);
      throw error;
    }
  }

  // Get payment status in real-time
  static async getPaymentStatus(paymentId: string) {
    try {
      const response = await axios.get(`${API_URL}/api/payments/status/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // WebSocket connection for real-time payment updates
  static createPaymentWebSocket(paymentId: string, onUpdate: (data: any) => void) {
    const ws = new WebSocket(`ws://${window.location.hostname}:5000/ws/payments/${paymentId}`);
    
    ws.onopen = () => {
      console.log('Payment WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    ws.onerror = (error) => {
      console.error('Payment WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Payment WebSocket disconnected');
    };

    return ws;
  }

  // Generate UPI deep link
  static generateUPILink(data: {
    upiId: string;
    amount: number;
    name: string;
    description: string;
  }) {
    const { upiId, amount, name, description } = data;
    const encodedName = encodeURIComponent(name);
    const encodedDescription = encodeURIComponent(description);
    
    return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedDescription}`;
  }

  // Generate QR code data for UPI
  static generateUPIQRData(data: {
    upiId: string;
    amount: number;
    name: string;
    description: string;
  }) {
    const { upiId, amount, name, description } = data;
    return `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${description}`;
  }
}

export default PaymentService;
