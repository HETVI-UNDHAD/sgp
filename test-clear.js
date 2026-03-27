// Simple test for clear chat functionality
const axios = require('axios');

const API_URL = 'http://localhost:5000';
const testGroupId = '507f1f77bcf86cd799439011'; // dummy group ID
const testUserId = '507f1f77bcf86cd799439012'; // dummy user ID

async function testClearChat() {
  try {
    console.log('Testing clear chat API...');
    
    const response = await axios.delete(`${API_URL}/api/messages/group/${testGroupId}/clear`, {
      data: { userId: testUserId }
    });
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testClearChat();