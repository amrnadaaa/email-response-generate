// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// 👇 ضع الـ API Key الخاص بك هنا
const API_KEY = 'AIzaSyAkjdJrE3tziVMtZht8AvayiCY3o_PbylI';

// 👇 اختر الموديل الصحيح (gemini-2.0-flash شغال معاك)
const GEMINI_MODEL = 'gemini-2.0-flash';

app.post('/api/email/generate', async (req, res) => {
    console.log('📨 Received request:', req.body);
    
    try {
        const { emailContent, tone } = req.body;
        
        if (!emailContent || !tone) {
            return res.status(400).json({ 
                error: 'Missing emailContent or tone in request body' 
            });
        }

        // بناء prompt أفضل
        const prompt = `You are a professional email assistant. Write a ${tone.toLowerCase()} email reply to the following message:

"${emailContent}"

Guidelines:
- Tone: ${tone}
- Length: 3-5 sentences
- Format: Standard email (greeting, body, closing)
- Style: Natural and professional
- Do not include subject line

Email reply:`;

        console.log('🚀 Sending request to Gemini API...');
        console.log('📝 Model:', GEMINI_MODEL);
        console.log('🔑 API Key (first 10 chars):', API_KEY.substring(0, 10) + '...');
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': API_KEY
                }
            }
        );
        
        console.log('✅ API Response received successfully');
        
        if (!response.data.candidates || !response.data.candidates[0]) {
            throw new Error('No candidates in response');
        }
        
        const reply = response.data.candidates[0].content.parts[0].text;
        
        res.json({ 
            success: true,
            reply: reply,
            model: GEMINI_MODEL
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        let errorMessage = error.message;
        let statusCode = 500;
        
        // تحسين رسائل الخطأ
        if (error.response) {
            // الخطأ من Gemini API
            statusCode = error.response.status;
            errorMessage = error.response.data?.error?.message || error.message;
            console.error('🔴 Gemini API Error:', error.response.data);
        }
        
        res.status(statusCode).json({ 
            success: false,
            error: errorMessage,
            model: GEMINI_MODEL,
            tip: 'Check if API key is valid and billing is enabled'
        });
    }
});

// endpoint للاختبار
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running',
        model: GEMINI_MODEL,
        timestamp: new Date().toISOString()
    });
});

// endpoint لاختبار الـ API Key
app.get('/api/test-key', async (req, res) => {
    try {
        const testResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                contents: [{
                    parts: [{ text: 'Say "API is working"' }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': API_KEY
                }
            }
        );
        
        res.json({
            success: true,
            message: 'API Key is working!',
            model: GEMINI_MODEL,
            response: testResponse.data.candidates[0].content.parts[0].text
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'API Key test failed',
            error: error.message,
            model: GEMINI_MODEL
        });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Using Gemini model: ${GEMINI_MODEL}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Test API Key: http://localhost:${PORT}/api/test-key`);
});