

console.log("🚀 Email Writer Assistant - LOADED");


const GEMINI_API_KEY = "AIzaSyAkjdJrE3tziVMtZht8AvayiCY3o_PbylI";

const GEMINI_MODEL = "gemini-2.0-flash"; // ✅ Correct for Chrome Extension



function createAIButton() {
  const button = document.createElement("button");
  button.innerHTML = "🤖 AI Reply";
  button.id = "ai-reply-button";
  button.style.cssText = `
    background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
    color: white;
    border: none;
    border-radius: 18px;
    padding: 8px 20px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    box-shadow: 0 2px 6px rgba(66, 133, 244, 0.3);
    font-family: 'Google Sans', Roboto, sans-serif;
  `;
  return button;
}

function createToneSelect() {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 12px;
  `;

  const label = document.createElement("span");
  label.textContent = "Tone:";
  label.style.cssText = `
    color: #5f6368;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  `;

  const select = document.createElement("select");
  select.id = "ai-tone-select";
  select.style.cssText = `
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #dadce0;
    background: white;
    color: #202124;
    font-size: 14px;
    cursor: pointer;
    outline: none;
    min-width: 130px;
    height: 36px;
    font-family: 'Google Sans', Roboto, sans-serif;
    transition: border 0.2s;
  `;


  select.addEventListener("mouseenter", () => {
    select.style.borderColor = "#4285f4";
  });
  select.addEventListener("mouseleave", () => {
    select.style.borderColor = "#dadce0";
  });

  const tones = [
    { value: "professional", text: "📊 Professional" },
    { value: "casual", text: "👕 Casual" },
    { value: "friendly", text: "😊 Friendly" },
    { value: "urgent", text: "🚨 Urgent" },
    { value: "apologetic", text: "🙏 Apologetic" },
    { value: "enthusiastic", text: "🎉 Enthusiastic" },
    { value: "formal", text: "🤵 Formal" }
  ];

  tones.forEach(tone => {
    const option = document.createElement("option");
    option.value = tone.value;
    option.textContent = tone.text;
    select.appendChild(option);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  
  return { wrapper, select };
}


function getEmailContent() {
  console.log("🔍 Looking for email content...");
  
  // Primary selectors for Gmail email content
  const selectors = [
    '.ii.gt', 
    '.a3s.aiL', 
    '.h7', 
    '[role="presentation"]', 
    '.gmail_default',
    '.adn.ads',
    '.gs', 
    '.y2',
    '.ams.bkH', 
    '.a3s',
    '.ii', 
    '.gmail_extra' 
  ];


  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element && element.textContent) {
          const text = element.textContent.trim();
         
          if (text.length > 100 && 
              !text.includes("Gmail") && 
              !text.includes("Unsubscribe") &&
              !text.includes("http") &&
              text.split(' ').length > 20) {
            console.log(`✅ Found email content via: ${selector}`);
            console.log(`📝 Preview: ${text.substring(0, 150)}...`);
            return text.substring(0, 3000); // Limit length
          }
        }
      }
    } catch (error) {
      console.log(`Selector ${selector} failed:`, error);
    }
  }

 
  console.log("⚠️ Using fallback method...");
  const allText = document.body.innerText;
  const lines = allText.split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 100 &&
             !trimmed.includes('http') &&
             !trimmed.includes('@gmail') &&
             !trimmed.includes('Copyright') &&
             !trimmed.includes('Unsubscribe') &&
             trimmed.split(' ').length > 15;
    })
    .sort((a, b) => b.length - a.length);

  if (lines.length > 0) {
    console.log(`✅ Found fallback content: ${lines[0].substring(0, 150)}...`);
    return lines[0].substring(0, 3000);
  }

  console.warn("❌ Could not find email content");
  return "";
}



function insertTextIntoComposeBox(text) {
  console.log("📝 Inserting text into compose box...");
  
 
  const composeSelectors = [
    '[role="textbox"]',
    '.Am.Al.editable', 
    '.editable', 
    '[contenteditable="true"]',
    '[aria-label="Message Body"]', 
    '.aoD.az6', 
    '.LW-avf', 
    '.Ar.Au', 
    '.gO.ahJ', 
    '.gJ.gK', 
    '.iN' 
  ];

  let composeBox = null;
  for (const selector of composeSelectors) {
    composeBox = document.querySelector(selector);
    if (composeBox) {
      console.log(`✅ Found compose box via: ${selector}`);
      break;
    }
  }

  if (!composeBox) {
    console.log("⚠️ Compose box not found, trying to find reply area...");
    
  
    const replyButtons = [
      '[data-tooltip="Reply"]',
      '[data-tooltip*="Reply"]',
      '[aria-label*="Reply"]',
      '[role="button"][data-tooltip*="Reply"]',
      '.ams.bkH [role="button"]:last-child'
    ];

    for (const buttonSelector of replyButtons) {
      const replyButton = document.querySelector(buttonSelector);
      if (replyButton) {
        console.log(`📍 Clicking reply button: ${buttonSelector}`);
        replyButton.click();
        
        
        setTimeout(() => {
          insertTextIntoComposeBox(text);
        }, 1000);
        return false;
      }
    }
    
    return false;
  }

  try {
  
    composeBox.focus();
    
 
    composeBox.innerHTML = '';
    
   
    const textNode = document.createTextNode(text);
    composeBox.appendChild(textNode);
    
  
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    composeBox.dispatchEvent(inputEvent);
    
    const changeEvent = new Event('change', { bubbles: true });
    composeBox.dispatchEvent(changeEvent);
    
  
    const keyupEvent = new Event('keyup', { bubbles: true });
    composeBox.dispatchEvent(keyupEvent);
    
    console.log("✅ Text inserted successfully");
    return true;
  } catch (error) {
    console.error("❌ Error inserting text:", error);
    return false;
  }
}



async function testAPIKey() {
  console.log("🧪 Testing Gemini API connection...");
  
  try {
    const testPrompt = "Hello, please respond with 'API is working correctly'";
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: testPrompt }]
          }]
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ API Test Failed:", data);
      return {
        success: false,
        message: `API Error: ${data.error?.message || `HTTP ${response.status}`}`
      };
    }
    
    console.log("✅ API Test Successful");
    return {
      success: true,
      message: `Connected to ${GEMINI_MODEL} successfully!`
    };
    
  } catch (error) {
    console.error("❌ API Connection Error:", error);
    return {
      success: false,
      message: `Connection Error: ${error.message}`
    };
  }
}

async function generateEmailReply(emailContent, tone) {
  console.log(`🎭 Generating ${tone} email reply...`);
  
  const prompt = `You are a professional email assistant. Write a ${tone} email reply to the following message:

"${emailContent}"

Guidelines:
1. Tone: ${tone}
2. Length: 3-5 sentences maximum
3. Format: Standard email format (greeting, body, closing)
4. Style: Natural, human-like, professional
5. Response: Only the email reply text, no explanations

Please write the email reply now:`;

  try {
    console.log("📡 Sending request to Gemini API...");
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 500,
          }
        })
      }
    );

    console.log(`📊 Response Status: ${response.status}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ API Error Details:", data);
      
      let errorMessage = data.error?.message || `HTTP Error ${response.status}`;
      
   
      if (errorMessage.includes("API key")) {
        errorMessage += "\n\nGet a valid API key from: https://makersuite.google.com/app/apikey";
      } else if (errorMessage.includes("billing")) {
        errorMessage += "\n\nEnable billing at: https://console.cloud.google.com/billing";
      } else if (errorMessage.includes("not found")) {
        errorMessage += `\n\nModel '${GEMINI_MODEL}' not found. Try: gemini-1.5-flash-001 or gemini-pro`;
      }
      
      throw new Error(errorMessage);
    }
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response format from API");
    }
    
    const replyText = data.candidates[0].content.parts[0]?.text;
    if (!replyText) {
      throw new Error("No text generated in response");
    }
    
    console.log("✅ Reply generated successfully");
    console.log(`📨 Preview: ${replyText.substring(0, 100)}...`);
    
    return replyText.trim();
    
  } catch (error) {
    console.error("❌ Generation failed:", error);
    throw error;
  }
}


function injectUI() {
  console.log("🎯 Attempting to inject UI...");
  
  // Try to find the Gmail toolbar/button area
  const toolbarSelectors = [
    '.gU.Up', // Gmail reply toolbar
    '.iH', // Button container
    '.gs', // Toolbar section
    '.G-Ni.J-J5-Ji', // Button group
    'tr.btC', // Button row
    '.ams.bkH', // Thread actions
    '.iq', // Bottom toolbar
    '.G-atb', // Action toolbar
    '.G-tF', // Toolbar container
    '.G-Ni', // Navigation items
    '[role="toolbar"]' // Any toolbar
  ];

  let toolbar = null;
  for (const selector of toolbarSelectors) {
    toolbar = document.querySelector(selector);
    if (toolbar) {
      console.log(`📍 Found toolbar via: ${selector}`);
      break;
    }
  }

  // If no toolbar found, look near reply buttons
  if (!toolbar) {
    console.log("🔍 No toolbar found, looking for reply buttons...");
    
    const replyButton = document.querySelector('[data-tooltip="Reply"], [data-tooltip*="Reply"], [aria-label*="Reply"]');
    if (replyButton) {
      toolbar = replyButton.closest('div, tr, td, .ams, .bkH');
      if (toolbar) {
        console.log("📍 Found toolbar near reply button");
      }
    }
  }

  if (!toolbar) {
    console.log("⏳ Toolbar not found yet, will retry...");
    return false;
  }

  // Check if UI already exists
  if (toolbar.querySelector('#ai-extension-container')) {
    console.log("✅ UI already injected");
    return true;
  }

  console.log("🛠️ Creating UI elements...");
  
  // Create container
  const container = document.createElement('div');
  container.id = 'ai-extension-container';
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e8f0fe 100%);
    border-radius: 10px;
    margin: 8px;
    border: 1px solid #d2e3fc;
    font-family: 'Google Sans', Roboto, sans-serif;
    box-shadow: 0 2px 8px rgba(66, 133, 244, 0.1);
    transition: all 0.3s;
  `;

  // Create tone selector
  const { wrapper: toneWrapper, select: toneSelect } = createToneSelect();
  
  // Create AI button
  const button = createAIButton();
  
  // Add elements to container
  container.appendChild(toneWrapper);
  container.appendChild(button);
  
  // Insert container into toolbar
  const insertionPoint = toolbar.firstChild || toolbar;
  if (toolbar.firstChild) {
    toolbar.insertBefore(container, toolbar.firstChild);
  } else {
    toolbar.appendChild(container);
  }
  
  console.log("✅ UI elements created");

 
  
  button.addEventListener('click', async function() {
    const originalButton = this;
    const originalHTML = originalButton.innerHTML;
    const originalBackground = originalButton.style.background;
    
    try {
    
      originalButton.innerHTML = '🧪 Testing API...';
      originalButton.style.background = 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)';
      originalButton.style.cursor = 'wait';
      
      // Step 2: Test API
      const apiTest = await testAPIKey();
      if (!apiTest.success) {
        originalButton.innerHTML = '❌ API Error';
        originalButton.style.background = 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)';
        
        setTimeout(() => {
          alert(`API Error:\n\n${apiTest.message}\n\nPlease check:\n1. API Key is correct\n2. Billing is enabled\n3. Model is available`);
          originalButton.innerHTML = originalHTML;
          originalButton.style.background = originalBackground;
          originalButton.style.cursor = 'pointer';
        }, 100);
        return;
      }
      
      
      originalButton.innerHTML = '📧 Reading email...';
      originalButton.style.background = 'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)';
      
      const emailContent = getEmailContent();
      if (!emailContent) {
        originalButton.innerHTML = '❌ No email';
        originalButton.style.background = 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)';
        
        setTimeout(() => {
          alert('Please open an email first to generate a reply!');
          originalButton.innerHTML = originalHTML;
          originalButton.style.background = originalBackground;
          originalButton.style.cursor = 'pointer';
        }, 100);
        return;
      }
      
    
      originalButton.innerHTML = '⚡ Generating...';
      originalButton.style.background = 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)';
      
      const selectedTone = toneSelect.value;
      const reply = await generateEmailReply(emailContent, selectedTone);
      
     
      originalButton.innerHTML = '📝 Inserting...';
      originalButton.style.background = 'linear-gradient(135deg, #AB47BC 0%, #8E24AA 100%)';
      
      const inserted = insertTextIntoComposeBox(reply);
      
      if (inserted) {
    
        originalButton.innerHTML = '✅ Done!';
        originalButton.style.background = 'linear-gradient(135deg, #00C853 0%, #00E676 100%)';
        
       
        setTimeout(() => {
          originalButton.innerHTML = originalHTML;
          originalButton.style.background = originalBackground;
          originalButton.style.cursor = 'pointer';
        }, 2000);
      } else {
    
        originalButton.innerHTML = '⚠️ Click to reply';
        originalButton.style.background = 'linear-gradient(135deg, #FFB300 0%, #FFA000 100%)';
        
        setTimeout(() => {
          alert('Please click in the reply box first, then try the AI button again.');
          originalButton.innerHTML = originalHTML;
          originalButton.style.background = originalBackground;
          originalButton.style.cursor = 'pointer';
        }, 100);
      }
      
    } catch (error) {
      console.error("❌ Process error:", error);
      
      
      originalButton.innerHTML = '❌ Error';
      originalButton.style.background = 'linear-gradient(135deg, #EF5350 0%, #D32F2F 100%)';
      
      setTimeout(() => {
        alert(`Error: ${error.message}\n\nModel: ${GEMINI_MODEL}\n\nCheck console for details.`);
        originalButton.innerHTML = originalHTML;
        originalButton.style.background = originalBackground;
        originalButton.style.cursor = 'pointer';
      }, 100);
    }
  });
  
  console.log("🎉 UI injected successfully!");
  return true;
}



function initializeExtension() {
  console.log("⚡ Initializing Email Writer Assistant...");
  
  // Initial injection after page loads
  setTimeout(() => {
    const injected = injectUI();
    if (!injected) {
      console.log("🔁 Initial injection failed, scheduling retry...");
      // Retry injection every 2 seconds for 10 seconds
      let retries = 0;
      const retryInterval = setInterval(() => {
        if (retries < 5) {
          if (injectUI()) {
            clearInterval(retryInterval);
          }
          retries++;
        } else {
          clearInterval(retryInterval);
          console.log("⚠️ Could not inject UI after multiple attempts");
        }
      }, 2000);
    }
  }, 3000);
  

  const observer = new MutationObserver((mutations) => {
    let shouldInject = false;
    
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        // Check if new nodes might be Gmail UI elements
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Look for Gmail-specific classes
            if (node.classList && (
              node.classList.contains('gs') ||
              node.classList.contains('gU') ||
              node.classList.contains('ams') ||
              node.classList.contains('bkH')
            )) {
              shouldInject = true;
            }
            
            // Look for reply buttons
            if (node.querySelector?.('[data-tooltip*="Reply"]')) {
              shouldInject = true;
            }
          }
        });
      }
    });
    
    if (shouldInject) {
      setTimeout(injectUI, 500);
    }
  });
  
 
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
  

  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log("🌐 URL changed, reinjecting UI...");
      setTimeout(injectUI, 1500);
    }
  });
  
  urlObserver.observe(document, { subtree: true, childList: true });
  
  console.log("✅ Extension initialized successfully");
}

  
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

window.addEventListener('error', function(event) {
  console.error('Extension Error:', event.error);
});


console.log("🎊 Email Writer Assistant ready!");
