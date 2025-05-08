import axios from 'axios';

// Update the base URL to match your server's endpoint
const API_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const googleAuth = async (code: string) => {
    try {
        // Update the endpoint to match your server's route
        const response = await api.get('/auth/google', { params: { code } });
        console.log('Raw server response:', response);
        
        // Check if response is HTML (error case)
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            throw new Error('Server returned HTML instead of JSON. Please check server configuration.');
        }
        
        // Check if response has the expected structure
        if (!response.data || !response.data.user) {
            throw new Error('Invalid response format from server');
        }
        
        return response;
    } catch (error) {
        console.error('API Error:', error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        throw error;
    }
}; 