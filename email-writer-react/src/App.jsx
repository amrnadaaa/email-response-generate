import {
  Box,
  Container,
  FormControl,
  InputLabel,
  TextField,
  Typography,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// =========================================================
// ⚠️ هام جداً: حط مفتاحك الجديد هنا
// =========================================================
const API_KEY = "AIzaSyAkjdJrE3tziVMtZht8AvayiCY3o_PbylI"; 

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

// تصميم التطبيق
const theme = createTheme({
  palette: { primary: { main: '#0d47a1' }, secondary: { main: '#2979ff' } },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none' } } },
  },
});

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeModel, setActiveModel] = useState(null); // عشان نخزن اسم الموديل الشغال

  // 1. أول ما الصفحة تفتح، ندور على موديل شغال أوتوماتيك
  useEffect(() => {
    const findWorkingModel = async () => {
      try {
        // بنطلب قائمة الموديلات المتاحة للمفتاح ده
        const response = await fetch(`${BASE_URL}/models?key=${API_KEY}`);
        
        if (!response.ok) {
           throw new Error("Invalid API Key");
        }

        const data = await response.json();
        
        // بندور على موديل ينفع يكتب محتوى (generateContent)
        // بنفضل الموديلات السريعة زي flash أو pro
        const model = data.models?.find(m => 
          m.supportedGenerationMethods.includes("generateContent") && 
          (m.name.includes("flash") || m.name.includes("pro"))
        );

        if (model) {
          setActiveModel(model.name); // لقينا موديل! هنستخدمه
          console.log("Active Model Found:", model.name);
        } else {
          // لو ملقيناش، نستخدم الديفولت وخلاص
          setActiveModel('models/gemini-pro');
        }
      } catch (err) {
        console.error("Error finding models:", err);
        // لو المفتاح بايظ، مش هنعرف نجيب موديلات، بس هنسيبه يحاول عشان يطلع الخطأ لليوزر
        setActiveModel('models/gemini-1.5-flash');
      }
    };

    findWorkingModel();
  }, []);

  // 2. دالة توليد الرد
  const handleReplyGeneration = async () => {
    if (!emailContent) return;
    setLoading(true);
    setError('');
    setGeneratedReply('');

    // لو لسه ملقيناش موديل، نستخدم اسم احتياطي
    const modelToUse = activeModel || 'models/gemini-1.5-flash';
    const url = `${BASE_URL}/${modelToUse}:generateContent?key=${API_KEY}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Write a ${tone || 'professional'} reply to: "${emailContent}"` }] }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setGeneratedReply(text || "No text generated.");

    } catch (err) {
      console.error(err);
      setError(`Failed using model (${modelToUse}): ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Typography variant='h4' gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
          📧 Smart Email Replier
        </Typography>

        {/* عرض حالة الاتصال بالموديل */}
        <Box display="flex" justifyContent="center" mb={3}>
            {activeModel ? (
                <Chip label={`✅ Connected to: ${activeModel.split('/')[1]}`} color="success" variant="outlined" />
            ) : (
                <Chip label="⏳ Connecting to Google AI..." color="warning" variant="outlined" />
            )}
        </Box>

        <Box sx={{ p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 2 }}>
          <TextField
            fullWidth multiline rows={4}
            label="Original Email"
            placeholder="Paste email here..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Tone</InputLabel>
            <Select value={tone} label="Tone" onChange={(e) => setTone(e.target.value)}>
              <MenuItem value="Professional">Professional</MenuItem>
              <MenuItem value="Friendly">Friendly</MenuItem>
              <MenuItem value="Casual">Casual</MenuItem>
            </Select>
          </FormControl>

          {error && <Alert severity="error" sx={{ mb: 3, wordBreak: 'break-word' }}>{error}</Alert>}

          <Button
            fullWidth variant="contained" size="large"
            onClick={handleReplyGeneration}
            disabled={loading || !emailContent}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Reply 🚀'}
          </Button>
          
          {generatedReply && (
            <Box sx={{ mt: 4, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>Generated Reply:</Typography>
              <TextField fullWidth multiline rows={8} value={generatedReply} InputProps={{ readOnly: true }} sx={{ bgcolor: 'white' }} />
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;