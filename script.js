// Global variables
let currentTab = 0;
let items = [];
let invoiceData = {
    userName: '',
    vendorName: '',
    invoiceDate: '',
    invoiceNumber: '',
    businessAddress: '',
    vendorAddress: '',
    contactNumber: '',
    gstNumber: '',
    upiId: '',
    discountType: 'none',
    discountValue: 0,
    signature: null,
    template: 'modern',
    paymentMethod: 'cash',
    authorizedSignatory: ''
};








// Text-to-Speech Setup - FIXED VERSION
let speechSynthesis = window.speechSynthesis;
let isSpeaking = false;

// Speak text function - COMPLETELY FIXED
function speakText(text) {
    if (!speechSynthesis) {
        console.log("Text-to-speech not supported in this browser.");
        return;
    }
    
    // Pehle stop karo any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;  // Speed thoda fast karo
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Volume full karo
    utterance.lang = 'hi-IN'; // Hindi set karo
    
    // Voice select karo with proper timing
    function speakWithVoice() {
        const voices = speechSynthesis.getVoices();
        console.log("Available voices:", voices);
        
        // Hindi voice dhoondo
        const hindiVoice = voices.find(voice => 
            voice.lang.includes('hi') || 
            voice.lang.includes('hi-IN') ||
            voice.name.includes('Hindi')
        );
        
        if (hindiVoice) {
            utterance.voice = hindiVoice;
            console.log("Using Hindi voice:", hindiVoice.name);
        } else {
            console.log("Hindi voice not found, using default");
        }
        
        utterance.onstart = function() {
            isSpeaking = true;
            console.log("Speaking started:", text);
        };
        
        utterance.onend = function() {
            isSpeaking = false;
            console.log("Speaking ended");
        };
        
        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event);
            isSpeaking = false;
        };
        
        // Speech start karo
        speechSynthesis.speak(utterance);
    }
    
    // Ensure voices are loaded
    if (speechSynthesis.getVoices().length > 0) {
        speakWithVoice();
    } else {
        speechSynthesis.onvoiceschanged = speakWithVoice;
    }
}

// Initialize Text-to-Speech
function initTextToSpeech() {
    console.log("Text-to-Speech system initialized");
    // Test voice system
    setTimeout(() => {
        speakText("Voice system ready");
    }, 1000);
}








// ==================== COMPLETE NEW VOICE RECOGNITION SYSTEM ====================

// Voice Recognition System - COMPLETELY FIXED
let recognition;
let isListening = false;
let currentVoiceType = '';
let currentLanguage = 'hi-IN';

// Initialize Voice Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = currentLanguage;
        
        recognition.onstart = function() {
            isListening = true;
            updateVoiceUI(true);
            document.getElementById('voiceStatus').textContent = "🎤 Listening... Bolna shuru karein!";
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            console.log("Voice Input:", transcript, "Type:", currentVoiceType);
            processVoiceCommand(transcript, currentVoiceType);
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            isListening = false;
            updateVoiceUI(false);
            
            if (event.error === 'not-allowed') {
                document.getElementById('voiceStatus').textContent = "❌ Microphone permission required!";
                showNotification('Microphone permission deni padegi voice use karne ke liye', 'error');
            } else {
                document.getElementById('voiceStatus').textContent = "❌ Voice recognition error. Try again!";
            }
        };

        recognition.onend = function() {
            isListening = false;
            updateVoiceUI(false);
            document.getElementById('voiceStatus').textContent = "Voice system ready! Koi bhi button dabake bolna shuru karein.";
        };
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Voice recognition not supported in your browser";
        showNotification('Aapka browser voice recognition support nahi karta', 'error');
    }
}

// Update Voice UI
function updateVoiceUI(listening) {
    const voiceBtn = document.getElementById('mainVoiceBtn');
    const voiceText = document.getElementById('mainVoiceText');
    
    if (listening) {
        voiceBtn.classList.add('listening');
        voiceText.innerHTML = '<i class="fas fa-microphone"></i> Listening... Bolna Band Kare';
        voiceBtn.style.background = 'linear-gradient(45deg, #ff0066, #ff00d6)';
    } else {
        voiceBtn.classList.remove('listening');
        voiceText.innerHTML = '<i class="fas fa-microphone"></i> SUNO - Voice Input Start Kare';
        voiceBtn.style.background = 'linear-gradient(45deg, var(--primary), var(--accent))';
    }
}

// Main Voice Input Toggle
function toggleMainVoiceInput() {
    if (!recognition) {
        showNotification('Voice recognition not available', 'error');
        return;
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        currentVoiceType = 'general';
        recognition.lang = currentLanguage;
        recognition.start();
    }
}

// Specific Voice Input - FIXED
function startVoiceInput(type) {
    if (!recognition) {
        showNotification('Voice recognition not available', 'error');
        return;
    }
    
    if (isListening) {
        recognition.stop();
        return;
    }
    
    currentVoiceType = type;
    recognition.lang = currentLanguage;
    recognition.start();
    
    // Show what to speak based on type
    const prompts = {
        'business': "Business name bolein jaise: 'Business name Sharma Traders'",
        'address': "Business address bolein jaise: 'Business address Delhi Model Town'",
        'contact': "Contact number bolein jaise: 'Contact number 9876543210'",
        'gst': "GST number bolein jaise: 'GST number 07ABCDE1234F1Z5'",
        'customer': "Customer name bolein jaise: 'Customer name Rajesh Kumar'",
        'customer-address': "Customer address bolein jaise: 'Customer address Mumbai Andheri'",
        'invoice-number': "Invoice number bolein jaise: 'Invoice number INV-8603'",
        'invoice-date': "Invoice date bolein jaise: 'Invoice date 25 December 2024'",
        'item': "Item name bolein jaise: 'Item Laptop', 'Product Mobile Phone'",
        'quantity': "Quantity bolein jaise: 'Quantity 5', 'Quantity 10 pieces'",
        'price': "Price bolein jaise: 'Price 5000', 'Price fifty thousand'",
        'discount': "Discount bolein jaise: 'Discount 10 percent', 'Discount 500 rupees'",
        'upi': "UPI ID bolein jaise: 'UPI ID ravi@okicici'"
    };
    
    document.getElementById('voiceStatus').textContent = `🎤 ${prompts[type] || 'Bolna shuru karein...'}`;
}

// Process Voice Commands - COMPLETELY REVISED AND FIXED
function processVoiceCommand(transcript, type) {
    console.log("Processing:", transcript, "Type:", type);
    
    const lowerTranscript = transcript.toLowerCase();
    showNotification(`"${transcript}"`, 'info');
    
    // Handle specific field types first
    switch(type) {
        case 'business':
            processBusinessName(transcript);
            break;
        case 'address':
            processBusinessAddress(transcript);
            break;
        case 'contact':
            processContactNumber(transcript);
            break;
        case 'gst':
            processGSTNumber(transcript);
            break;
        case 'customer':
            processCustomerName(transcript);
            break;
        case 'customer-address':
            processCustomerAddress(transcript);
            break;
        case 'invoice-number':
            processInvoiceNumber(transcript);
            break;
        case 'invoice-date':
            processInvoiceDate(transcript);
            break;

            case 'item':
    processItemName(transcript);
    break;
        case 'quantity':
            processQuantity(transcript);
            break;
        case 'price':
            processPrice(transcript);
            break;
            case 'item-description':
               processItemDescription(transcript);
             break;

        case 'discount':
            processDiscount(transcript);
            break;
        case 'upi':
            processUPI(transcript);
            break;
        default:
            // For general/main voice input
            processGeneralVoiceCommand(transcript);
    }
    
    updateInvoicePreview();
}

// Individual field processors - FIXED
function processBusinessName(transcript) {
    let businessName = transcript.replace(/business name/gi, '')
                                .replace(/business/gi, '')
                                .replace(/name/gi, '')
                                .replace(/व्यवसाय/gi, '')
                                .replace(/नाम/gi, '')
                                .trim();
    
    if (businessName && businessName.length > 1) {
        document.getElementById('userName').value = businessName;
        document.getElementById('voiceStatus').textContent = `✅ Business name set: ${businessName}`;
        speakText(`Business name set ${businessName}`);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak business name clearly";
    }
}

function processBusinessAddress(transcript) {
    let address = transcript.replace(/business address/gi, '')
                           .replace(/address/gi, '')
                           .replace(/व्यवसाय/gi, '')
                           .replace(/पता/gi, '')
                           .trim();
    
    if (address && address.length > 5) {
        document.getElementById('businessAddress').value = address;
        document.getElementById('voiceStatus').textContent = `✅ Business address set`;
        speakText('Business address set');
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak address clearly";
    }
}

function processContactNumber(transcript) {
    // Extract numbers from transcript
    const numbers = transcript.replace(/\D/g, '');
    if (numbers.length >= 10) {
        document.getElementById('contactNumber').value = numbers.substring(0, 10);
        document.getElementById('voiceStatus').textContent = `✅ Contact number set: ${numbers.substring(0, 10)}`;
        speakText('Contact number set');
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak 10-digit phone number";
    }
}

function processGSTNumber(transcript) {
    let gstNumber = transcript.replace(/gst number/gi, '')
                             .replace(/gst/gi, '')
                             .replace(/number/gi, '')
                             .replace(/जीएसटी/gi, '')
                             .replace(/नंबर/gi, '')
                             .trim()
                             .toUpperCase();
    
    if (gstNumber && gstNumber.length > 5) {
        document.getElementById('gstNumber').value = gstNumber;
        document.getElementById('voiceStatus').textContent = `✅ GST number set: ${gstNumber}`;
        speakText('GST number set');
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak GST number clearly";
    }
}

function processCustomerName(transcript) {
    let customerName = transcript.replace(/customer name/gi, '')
                                .replace(/customer/gi, '')
                                .replace(/name/gi, '')
                                .replace(/ग्राहक/gi, '')
                                .replace(/नाम/gi, '')
                                .trim();
    
    if (customerName && customerName.length > 1) {
        document.getElementById('vendorName').value = customerName;
        document.getElementById('voiceStatus').textContent = `✅ Customer name set: ${customerName}`;
        speakText(`Customer name set ${customerName}`);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak customer name clearly";
    }
}

function processCustomerAddress(transcript) {
    let address = transcript.replace(/customer address/gi, '')
                           .replace(/address/gi, '')
                           .replace(/ग्राहक/gi, '')
                           .replace(/पता/gi, '')
                           .trim();
    
    if (address && address.length > 5) {
        document.getElementById('vendorAddress').value = address;
        document.getElementById('voiceStatus').textContent = `✅ Customer address set`;
        speakText('Customer address set');
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak address clearly";
    }
}

function processInvoiceNumber(transcript) {
    let invoiceNumber = transcript.replace(/invoice number/gi, '')
                                 .replace(/invoice/gi, '')
                                 .replace(/number/gi, '')
                                 .replace(/इनवॉइस/gi, '')
                                 .replace(/नंबर/gi, '')
                                 .trim()
                                 .toUpperCase();
    
    if (invoiceNumber) {
        document.getElementById('invoiceNumber').value = invoiceNumber;
        document.getElementById('voiceStatus').textContent = `✅ Invoice number set: ${invoiceNumber}`;
        speakText('Invoice number set');
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak invoice number clearly";
    }
}

function processInvoiceDate(transcript) {
    // Simple date extraction - in real app you'd use more sophisticated parsing
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = dateStr;
    document.getElementById('voiceStatus').textContent = `✅ Invoice date set to today`;
    speakText('Invoice date set to today');
}

// QUANTITY PROCESSOR - FIXED
function processQuantity(transcript) {
    const quantity = extractNumberFromText(transcript);
    if (quantity && quantity > 0) {
        setLastItemQuantity(quantity);
        document.getElementById('voiceStatus').textContent = `✅ Quantity set: ${quantity}`;
        speakText(`Quantity set ${quantity}`);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak quantity clearly, like 'Quantity 5'";
    }
}

// Set quantity for last item - FIXED
function setLastItemQuantity(quantity) {
    const itemRows = document.querySelectorAll('.item-row');
    if (itemRows.length > 0) {
        const lastItem = itemRows[itemRows.length - 1];
        lastItem.querySelector('.item-qty').value = quantity;
        // Also trigger input event to update calculations
        lastItem.querySelector('.item-qty').dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        // If no items, add one first
        addItemRow();
        setLastItemQuantity(quantity);
    }
}

function processPrice(transcript) {
    const price = extractNumberFromText(transcript);
    if (price && price > 0) {
        setLastItemPrice(price);
        document.getElementById('voiceStatus').textContent = `✅ Price set: ₹${price}`;
        speakText(`Price set ${price}`);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak price clearly, like 'Price 5000'";
    }
}

// Set price for last item - FIXED
function setLastItemPrice(price) {
    const itemRows = document.querySelectorAll('.item-row');
    if (itemRows.length > 0) {
        const lastItem = itemRows[itemRows.length - 1];
        lastItem.querySelector('.item-price').value = price;
        // Also trigger input event to update calculations
        lastItem.querySelector('.item-price').dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        // If no items, add one first
        addItemRow();
        setLastItemPrice(price);
    }
}

function processDiscount(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    const discountValue = extractNumberFromText(transcript);
    
    if (discountValue && discountValue > 0) {
        if (lowerTranscript.includes('percent') || lowerTranscript.includes('प्रतिशत') || lowerTranscript.includes('%')) {
            document.getElementById('discountType').value = 'percentage';
            document.getElementById('discountValue').value = discountValue;
            document.getElementById('voiceStatus').textContent = `✅ Discount set: ${discountValue}%`;
            speakText(`Discount set ${discountValue} percent`);
        } else {
            document.getElementById('discountType').value = 'fixed';
            document.getElementById('discountValue').value = discountValue;
            document.getElementById('voiceStatus').textContent = `✅ Discount set: ₹${discountValue}`;
            speakText(`Discount set ${discountValue} rupees`);
        }
        // Trigger change event to update calculations
        document.getElementById('discountValue').dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak discount clearly, like 'Discount 10 percent' or 'Discount 500 rupees'";
    }
}

function processUPI(transcript) {
    let upiId = transcript.replace(/upi id/gi, '')
                         .replace(/upi/gi, '')
                         .replace(/id/gi, '')
                         .replace(/यूपीआई/gi, '')
                         .replace(/आईडी/gi, '')
                         .trim();


    // Basic UPI validation
    if (upiId.includes('@') && upiId.length > 5) {
        document.getElementById('upiId').value = upiId;
        document.getElementById('voiceStatus').textContent = `✅ UPI ID set: ${upiId}`;
        speakText('UPI ID set');
        updateQRCode();
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak valid UPI ID like 'ravi@okicici'";
    }
}




                         function processItemName(transcript) {
    let itemName = transcript
        .replace(/item/gi, '')
        .replace(/product/gi, '')
        .replace(/name/gi, '')
        .replace(/आइटम/gi, '')
        .replace(/प्रोडक्ट/gi, '')
        .replace(/नाम/gi, '')
        .trim();
    
    if (itemName && itemName.length > 1) {
        setLastItemName(itemName);
        document.getElementById('voiceStatus').textContent = `✅ Item set: ${itemName}`;
        speakText(`Item set ${itemName}`);
    }
    else {
        // ✅ YE ELSE CASE ADD KARO
        document.getElementById('voiceStatus').textContent = "❌ Please speak item name clearly, like 'Item Laptop' or 'Product Mobile'";
    }
}

function setLastItemName(itemName) {
    console.log("🔄 Setting item:", itemName);
    
    // Always add new row
    addItemRow();
    
    // Wait and then set the name
    setTimeout(() => {
        const rows = document.querySelectorAll('.item-row');
        const lastRow = rows[rows.length - 1];
        const nameInput = lastRow.querySelector('.item-desc');
        
        if (nameInput) {
            nameInput.value = itemName;
            console.log("✅ Item set in row:", itemName);
            updateInvoicePreview();
        }
    }, 300);
}
    





// General voice command processor - COMPLETELY FIXED
function processGeneralVoiceCommand(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    console.log("Processing general command:", transcript);



   // SMART ITEM PARSER - Pehle check karo
   // ✅ SMART ITEM PARSER - Pehle check karo
let numbers = transcript.match(/\d+/g);
if (numbers && numbers.length >= 2) {
    let smartResult = parseSmartItemCommand(transcript);
    if (smartResult.success) {
        console.log("🎯 Smart item detected!");
        addItemRow();
        setTimeout(() => {
            const rows = document.querySelectorAll('.item-row');
            const lastRow = rows[rows.length - 1];
            lastRow.querySelector('.item-desc').value = smartResult.name;
            lastRow.querySelector('.item-qty').value = smartResult.quantity;
            lastRow.querySelector('.item-price').value = smartResult.price;
            updateInvoicePreview();
            document.getElementById('voiceStatus').textContent = `✅ Smart item: ${smartResult.name}`;
        }, 500);
        return;
    }
}






    



    
    // Business Name Commands
    if (lowerTranscript.includes('business name') || lowerTranscript.includes('व्यवसाय नाम') || lowerTranscript.includes('shop name') || lowerTranscript.includes('दुकान नाम')) {
        let businessName = transcript.replace(/business name/gi, '')
                                    .replace(/shop name/gi, '')
                                    .replace(/व्यवसाय नाम/gi, '')
                                    .replace(/दुकान नाम/gi, '')
                                    .trim();
        if (businessName && businessName.length > 1) {
            document.getElementById('userName').value = businessName;
            document.getElementById('voiceStatus').textContent = `✅ Business name set: ${businessName}`;
            speakText(`Business name set ${businessName}`);
        }
        return;
    }
    
    // Business Address Commands
    if (lowerTranscript.includes('business address') || lowerTranscript.includes('व्यवसाय पता') || lowerTranscript.includes('shop address') || lowerTranscript.includes('दुकान पता')) {
        let address = transcript.replace(/business address/gi, '')
                               .replace(/shop address/gi, '')
                               .replace(/व्यवसाय पता/gi, '')
                               .replace(/दुकान पता/gi, '')
                               .trim();
        if (address && address.length > 5) {
            document.getElementById('businessAddress').value = address;
            document.getElementById('voiceStatus').textContent = `✅ Business address set`;
            speakText('Business address set');
        }
        return;
    }
    
    // Contact Number Commands
    if (lowerTranscript.includes('contact number') || lowerTranscript.includes('संपर्क नंबर') || lowerTranscript.includes('phone number') || lowerTranscript.includes('फोन नंबर')) {
        const numbers = transcript.replace(/\D/g, '');
        if (numbers.length >= 10) {
            document.getElementById('contactNumber').value = numbers.substring(0, 10);
            document.getElementById('voiceStatus').textContent = `✅ Contact number set: ${numbers.substring(0, 10)}`;
            speakText('Contact number set');
        }
        return;
    }
    
    // GST Number Commands
    if (lowerTranscript.includes('gst number') || lowerTranscript.includes('जीएसटी नंबर') || lowerTranscript.includes('gst')) {
        let gstNumber = transcript.replace(/gst number/gi, '')
                                 .replace(/gst/gi, '')
                                 .replace(/जीएसटी नंबर/gi, '')
                                 .trim()
                                 .toUpperCase();
        if (gstNumber && gstNumber.length > 5) {
            document.getElementById('gstNumber').value = gstNumber;
            document.getElementById('voiceStatus').textContent = `✅ GST number set: ${gstNumber}`;
            speakText('GST number set');
        }
        return;
    }
    
    // Customer Name Commands
    if (lowerTranscript.includes('customer name') || lowerTranscript.includes('ग्राहक नाम') || lowerTranscript.includes('client name') || lowerTranscript.includes('ग्राहक')) {
        let customerName = transcript.replace(/customer name/gi, '')
                                    .replace(/client name/gi, '')
                                    .replace(/ग्राहक नाम/gi, '')
                                    .trim();
        if (customerName && customerName.length > 1) {
            document.getElementById('vendorName').value = customerName;
            document.getElementById('voiceStatus').textContent = `✅ Customer name set: ${customerName}`;
            speakText(`Customer name set ${customerName}`);
        }
        return;
    }
    
    // Customer Address Commands
    if (lowerTranscript.includes('customer address') || lowerTranscript.includes('ग्राहक पता') || lowerTranscript.includes('client address')) {
        let address = transcript.replace(/customer address/gi, '')
                               .replace(/client address/gi, '')
                               .replace(/ग्राहक पता/gi, '')
                               .trim();
        if (address && address.length > 5) {
            document.getElementById('vendorAddress').value = address;
            document.getElementById('voiceStatus').textContent = `✅ Customer address set`;
            speakText('Customer address set');
        }
        return;
    }
    
    // Invoice Number Commands
    if (lowerTranscript.includes('invoice number') || lowerTranscript.includes('इनवॉइस नंबर') || lowerTranscript.includes('bill number')) {
        let invoiceNumber = transcript.replace(/invoice number/gi, '')
                                     .replace(/bill number/gi, '')
                                     .replace(/इनवॉइस नंबर/gi, '')
                                     .trim()
                                     .toUpperCase();
        if (invoiceNumber) {
            document.getElementById('invoiceNumber').value = invoiceNumber;
            document.getElementById('voiceStatus').textContent = `✅ Invoice number set: ${invoiceNumber}`;
            speakText('Invoice number set');
        }
        return;
    }
    
    // Invoice Date Commands
    if (lowerTranscript.includes('invoice date') || lowerTranscript.includes('इनवॉइस तारीख') || lowerTranscript.includes('bill date')) {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = dateStr;
        document.getElementById('voiceStatus').textContent = `✅ Invoice date set to today`;
        speakText('Invoice date set to today');
        return;
    }
    
    // QUANTITY Commands - ITEM/PRODUCT FIX
    if (lowerTranscript.includes('quantity') || lowerTranscript.includes('मात्रा') || lowerTranscript.includes('कितना') || lowerTranscript.includes('क्वांटिटी')) {
        const quantity = extractNumberFromText(transcript);
        if (quantity && quantity > 0) {
            setLastItemQuantity(quantity);
            document.getElementById('voiceStatus').textContent = `✅ Quantity set: ${quantity}`;
            speakText(`Quantity set ${quantity}`);
        } else {
            document.getElementById('voiceStatus').textContent = "❌ Please speak quantity clearly, like 'quantity 5'";
        }
        return;
    }
    
    // PRICE Commands - ITEM/PRODUCT FIX
    if (lowerTranscript.includes('price') || lowerTranscript.includes('कीमत') || lowerTranscript.includes('दाम') || lowerTranscript.includes('मूल्य')) {
        const price = extractNumberFromText(transcript);
        if (price && price > 0) {
            setLastItemPrice(price);
            document.getElementById('voiceStatus').textContent = `✅ Price set: ₹${price}`;
            speakText(`Price set ${price}`);
        } else {
            document.getElementById('voiceStatus').textContent = "❌ Please speak price clearly, like 'price 500'";
        }
        return;
    }
    
    // DISCOUNT Commands
    if (lowerTranscript.includes('discount') || lowerTranscript.includes('डिस्काउंट') || lowerTranscript.includes('छूट')) {
        const discountValue = extractNumberFromText(transcript);
        if (discountValue && discountValue > 0) {
            if (lowerTranscript.includes('percent') || lowerTranscript.includes('प्रतिशत') || lowerTranscript.includes('%')) {
                document.getElementById('discountType').value = 'percentage';
                document.getElementById('discountValue').value = discountValue;
                document.getElementById('voiceStatus').textContent = `✅ Discount set: ${discountValue}%`;
                speakText(`Discount set ${discountValue} percent`);
            } else {
                document.getElementById('discountType').value = 'fixed';
                document.getElementById('discountValue').value = discountValue;
                document.getElementById('voiceStatus').textContent = `✅ Discount set: ₹${discountValue}`;
                speakText(`Discount set ${discountValue} rupees`);
            }
            document.getElementById('discountValue').dispatchEvent(new Event('input', { bubbles: true }));
        }
        return;
    }
    
    // UPI ID Commands
    if (lowerTranscript.includes('upi') || lowerTranscript.includes('यूपीआई') || lowerTranscript.includes('upi id')) {
        let upiId = transcript.replace(/upi id/gi, '')
                             .replace(/upi/gi, '')
                             .replace(/यूपीआई/gi, '')
                             .trim();
        if (upiId.includes('@') && upiId.length > 5) {
            document.getElementById('upiId').value = upiId;
            document.getElementById('voiceStatus').textContent = `✅ UPI ID set: ${upiId}`;
            speakText('UPI ID set');
            updateQRCode();
        }
        return;
    }
    
    // GST ON/OFF Commands
    if (lowerTranscript.includes('gst on') || lowerTranscript.includes('gst चालू') || lowerTranscript.includes('जीएसटी ऑन')) {
        document.getElementById('gstToggle').checked = true;
        document.getElementById('gstStatus').textContent = 'ON';
        document.getElementById('gstModeText').textContent = 'ON (GST bills)';
        document.getElementById('voiceStatus').textContent = '✅ GST mode enabled';
        speakText('GST mode enabled');
        document.getElementById('gstToggle').dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }
    
    if (lowerTranscript.includes('gst off') || lowerTranscript.includes('gst बंद') || lowerTranscript.includes('जीएसटी ऑफ')) {
        document.getElementById('gstToggle').checked = false;
        document.getElementById('gstStatus').textContent = 'OFF';
        document.getElementById('gstModeText').textContent = 'OFF (Simple bills)';
        document.getElementById('voiceStatus').textContent = '✅ GST mode disabled';
        speakText('GST mode disabled');
        document.getElementById('gstToggle').dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }
    
    // Calculate Total
    if (lowerTranscript.includes('calculate') || lowerTranscript.includes('total') || lowerTranscript.includes('कुल') || lowerTranscript.includes('टोटल')) {
        calculateTotals();
        const total = document.getElementById('summary-total').textContent;
        document.getElementById('voiceStatus').textContent = `✅ Total calculated: ${total}`;
        speakText(`Total calculated ${total}`);
        return;
    }
    
    // Generate PDF
    if (lowerTranscript.includes('pdf') || lowerTranscript.includes('download') || lowerTranscript.includes('डाउनलोड')) {
        generatePDF();
        document.getElementById('voiceStatus').textContent = '✅ PDF generated successfully!';
        speakText('PDF generated successfully');
        return;
    }
    
    // Item/Product Name - Main voice se
if (lowerTranscript.startsWith('item ') || lowerTranscript.startsWith('product ') || lowerTranscript.startsWith('आइटम ') || lowerTranscript.startsWith('प्रोडक्ट ')) {
    
    console.log("🎯 Main voice item command:", transcript);
    
    let itemName = transcript;
    
    // "item " remove karo
    if (lowerTranscript.startsWith('item ')) {
        itemName = transcript.substring(5);
    }
    // "product " remove karo  
    else if (lowerTranscript.startsWith('product ')) {
        itemName = transcript.substring(8);
    }
    // "आइटम " remove karo
    else if (lowerTranscript.startsWith('आइटम ')) {
        itemName = transcript.substring(5);
    }
    // "प्रोडक्ट " remove karo
    else if (lowerTranscript.startsWith('प्रोडक्ट ')) {
        itemName = transcript.substring(8);
    }
    
    itemName = itemName.trim();
    console.log("🧹 Cleaned item name:", itemName);
    
    if (itemName && itemName.length > 1) {
        addItemRow();
        setTimeout(() => {
            const rows = document.querySelectorAll('.item-row');
            const lastRow = rows[rows.length - 1];
            const nameInput = lastRow.querySelector('.item-desc');
            if (nameInput) {
                nameInput.value = itemName;
                updateInvoicePreview();
                document.getElementById('voiceStatus').textContent = `✅ Item set: ${itemName}`;
                speakText(`Item set ${itemName}`);
            }
        }, 500);
    }
    return;
}
    
    // If no command matched
    document.getElementById('voiceStatus').textContent = "❌ Command not recognized. Try: 'Business Name', 'Quantity', 'Price', 'Discount', etc.";
    speakText("Command not recognized");
}

// Extract number from text - IMPROVED
function extractNumberFromText(text) {
    // Handle English numbers
    const englishMatch = text.match(/\d+/g);
    if (englishMatch) {
        return parseInt(englishMatch[0]);
    }
    
    // Handle Hindi numbers
    const hindiNumbers = {
        'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5,
        'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
        'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
        'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20,
        'तीस': 30, 'चालीस': 40, 'पचास': 50, 'साठ': 60, 'सत्तर': 70,
        'अस्सी': 80, 'नब्बे': 90, 'सौ': 100, 'हज़ार': 1000, 'लाख': 100000,
        'पहला': 1, 'दूसरा': 2, 'तीसरा': 3, 'चौथा': 4, 'पांचवा': 5
    };
    
    const words = text.toLowerCase().split(' ');
    for (let word of words) {
        if (hindiNumbers[word]) {
            return hindiNumbers[word];
        }
    }
    
    return null;
}






// SMART ITEM PARSER - Kirana dukan ke liye
function parseSmartItemCommand(transcript) {
    console.log("🔍 Smart parsing:", transcript);
    
    // Numbers extract karo
    let numbers = transcript.match(/\d+/g);
    if (!numbers || numbers.length < 2) return { success: false };
    
    let quantity = parseInt(numbers[0]);
    let price = parseInt(numbers[numbers.length - 1]);
    
    // Units detect karo
    let unit = 'piece'; // default
    let priceUnit = 'piece'; // default
    
    if (/(gram|grams|gm)/gi.test(transcript)) {
        unit = 'gram';
    }
    if (/(kilo|kilogram|kg|kgs)/gi.test(transcript)) {
        unit = 'kilo';
    }
    if (/(dozen|darzan)/gi.test(transcript)) {
        unit = 'dozen';
    }
    if (/(metre|meter)/gi.test(transcript)) {
        unit = 'metre';
    }
    if (/(litre|liter)/gi.test(transcript)) {
        unit = 'litre';
    }
    
    // Price unit detect karo
    if (/(rupee dozen|rs dozen|per dozen)/gi.test(transcript)) {
        priceUnit = 'dozen';
    }
    if (/(rupee kilo|rs kilo|per kilo|rupee kg|rs kg|per kg)/gi.test(transcript)) {
        priceUnit = 'kilo';
    }
    if (/(rupee gram|rs gram|per gram|rupee gm|rs gm|per gm)/gi.test(transcript)) {
        priceUnit = 'gram';
    }
    if (/(rupee metre|rs metre|per metre|rupee meter|rs meter|per meter)/gi.test(transcript)) {
        priceUnit = 'metre';
    }
    if (/(rupee litre|rs litre|per litre|rupee liter|rs liter|per liter)/gi.test(transcript)) {
        priceUnit = 'litre';
    }
    
    // Smart calculation
    let finalPrice = price;
    
    // Unit conversion
    if (unit === 'gram' && priceUnit === 'kilo') {
        finalPrice = (quantity / 1000) * price;
    }
    else if (unit === 'gram' && priceUnit === 'gram') {
        finalPrice = quantity * price;
    }
    else if (unit === 'dozen' && priceUnit === 'dozen') {
        finalPrice = quantity * price;
    }
    else if (unit === 'piece' && priceUnit === 'dozen') {
        finalPrice = quantity * (price / 12);
    }
    else {
        finalPrice = quantity * price; // default
    }
    
    // Item name extract karo - Tumhari puri list ke saath
    let itemText = transcript
        .replace(/\d+/g, '')
        .replace(/(packet|pack|kg|kgs|kilo|kilogram|gram|grams|bora|bag|litre|liter|metre|meter|bundle|piece|pieces|pcs|unit|item|items|product|saman|maal|ka|ke|ki|kaa|kī|kē|kā|kaun|bhav|bhaw|bhaav|daam|dam|rate|cost|price|mooly|keemat|moolya|माल|सामान|पीस|किलो|ग्राम|पैकेट|बोरा|बंडल|थैला|लिटर|मीटर|का|की|के|का भाव|कीमत|भाव|भव|दाम|रेट|मूल्य|रुपये|रुपया|की दर|का रेट|का दाम|का मूल्य|लीटर)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    console.log("✅ SMART PARSED:", itemText, "Qty:", quantity, "Rate:", finalPrice);
    
    if (itemText && quantity && finalPrice) {
        return { 
            success: true, 
            name: itemText, 
            quantity: quantity, 
            price: finalPrice 
        };
    }
    
    return { success: false };
}











// Change language
function changeLanguage(lang) {
    currentLanguage = lang;
    if (recognition) {
        recognition.lang = lang;
    }
    const langText = lang === 'hi-IN' ? 'Hindi' : 'English';
    showNotification(`Language changed to ${langText}`, 'info');
    document.getElementById('voiceStatus').textContent = `Language set to ${langText}. Ab bolna shuru karein!`;
    speakText(`Language changed to ${langText}`);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initSpeechRecognition();
});















// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateInvoicePreview();
    initTextToSpeech();
    initSpeechRecognition();
});

// Initialize the application
function initializeApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    document.getElementById('invoiceNumber').value = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    addItemRow();
    
    // Initialize payment method
    selectPaymentMethod('cash');
}

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu
    document.getElementById('mobileMenuToggle').addEventListener('click', toggleMobileMenu);
    document.getElementById('mobileMenuClose').addEventListener('click', closeMobileMenu);
    
    // Tab navigation
    document.getElementById('prevTabBtn').addEventListener('click', prevTab);
    document.getElementById('nextTabBtn').addEventListener('click', nextTab);
    
    // Template selection
    document.querySelectorAll('.select-template').forEach(btn => {
        btn.addEventListener('click', function() {
            selectTemplate(this.dataset.template);
        });
    });
    
    document.getElementById('templateSelect').addEventListener('change', function() {
        selectTemplate(this.value);
    });
    
    // Items management
    document.getElementById('addItemBtn').addEventListener('click', addItemRow);
    
    // Form inputs for real-time preview
    document.querySelectorAll('#business-tab input, #business-tab textarea').forEach(input => {
        input.addEventListener('input', updateInvoicePreview);
    });
    
    // Discount inputs
    document.getElementById('discountType').addEventListener('change', updateInvoicePreview);
    document.getElementById('discountValue').addEventListener('input', updateInvoicePreview);
    
    // GST Toggle
    document.getElementById('gstToggle').addEventListener('change', updateInvoicePreview);
    
    // UPI ID input
    document.getElementById('upiId').addEventListener('input', function() {
        updateInvoicePreview();
        updateQRCode();
    });
    
    // Action buttons
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
    
    // Industry links
    document.querySelectorAll('.industry-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const industry = this.dataset.industry;
            showIndustryMessage(industry);
        });
    });
    
    // Modal controls
    setupModalControls();
    
    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // Auth modal switching
    document.getElementById('switchToSignup').addEventListener('click', function(e) {
        e.preventDefault();
        switchAuthModal('signup');
    });
    
    document.getElementById('switchToLogin').addEventListener('click', function(e) {
        e.preventDefault();
        switchAuthModal('login');
    });
    
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        switchAuthModal('forgotPassword');
    });
    
    // OTP inputs
    setupOTPInputs();
    
    // FAQ
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const item = this.parentElement;
            item.classList.toggle('active');
        });
    });
}

// Mobile menu functions
function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('active');
}

function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('active');
}

// Setup modal controls
function setupModalControls() {
    document.getElementById('signupBtn').addEventListener('click', openSignupModal);
    document.getElementById('loginModalClose').addEventListener('click', () => closeModal('loginModal'));
    document.getElementById('signupModalClose').addEventListener('click', () => closeModal('signupModal'));
    document.getElementById('otpModalClose').addEventListener('click', () => closeModal('otpModal'));
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Tab navigation functions
function nextTab() {
    if (validateCurrentTab()) {
        const tabs = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabs[currentTab].classList.remove('active');
        tabButtons[currentTab].classList.remove('active');
        
        currentTab++;
        
        tabs[currentTab].classList.add('active');
        tabButtons[currentTab].classList.add('active');
        
        updateTabButtons();
        
        if (currentTab === 2) {
            calculateTotals();
        }
    }
}

function prevTab() {
    const tabs = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabs[currentTab].classList.remove('active');
    tabButtons[currentTab].classList.remove('active');
    
    currentTab--;
    
    tabs[currentTab].classList.add('active');
    tabButtons[currentTab].classList.add('active');
    
    updateTabButtons();
}

function updateTabButtons() {
    const prevBtn = document.getElementById('prevTabBtn');
    const nextBtn = document.getElementById('nextTabBtn');
    const generateBtn = document.getElementById('generatePdfBtn');
    
    prevBtn.disabled = currentTab === 0;
    
    if (currentTab === 2) {
        nextBtn.style.display = 'none';
        generateBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        generateBtn.style.display = 'none';
    }
}

function validateCurrentTab() {
    if (currentTab === 0) {
        const userName = document.getElementById('userName').value;
        const vendorName = document.getElementById('vendorName').value;
        
        if (!userName || !vendorName) {
            showNotification('Please fill in both Business Name and Customer Name', 'error');
            return false;
        }
    } else if (currentTab === 1) {
        const itemRows = document.querySelectorAll('.item-row');
        
        if (itemRows.length === 0) {
            showNotification('Please add at least one item', 'error');
            return false;
        }
        
        let hasValidItem = false;
        itemRows.forEach(row => {
            const desc = row.querySelector('.item-desc').value;
            const qty = row.querySelector('.item-qty').value;
            const price = row.querySelector('.item-price').value;
            
            if (desc && qty && price) {
                hasValidItem = true;
            }
        });
        
        if (!hasValidItem) {
            showNotification('Please fill in description, quantity and price for at least one item', 'error');
            return false;
        }
    }
    
    return true;
}

// Item management functions
function addItemRow() {
    const itemsList = document.getElementById('itemsList');
    const itemCount = itemsList.querySelectorAll('.item-row').length + 1;
    
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
        <input type="text" placeholder="Item description" class="item-desc" value="">
        <input type="number" placeholder="Qty" class="item-qty" value="1" min="1">
        <input type="number" placeholder="Price" class="item-price" value="100" min="0" step="0.01">
        <input type="number" placeholder="Tax %" class="item-tax" value="18" min="0" max="100">
        <button class="remove-item"><i class="fas fa-times"></i></button>
    `;
    
    itemsList.appendChild(itemRow);
    
    itemRow.querySelector('.remove-item').addEventListener('click', function() {
        itemRow.remove();
        updateInvoicePreview();
    });
    
    const inputs = itemRow.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updateInvoicePreview);
    });
    
    updateInvoicePreview();
}

// Add event listeners to existing remove buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
        e.preventDefault();
        const removeBtn = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
        const itemRow = removeBtn.closest('.item-row');
        
        if (itemRow && itemRow.parentNode) {
            itemRow.remove();
            updateInvoicePreview();
        }
    }
});

// Add event listeners to existing inputs for real-time update
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('item-desc') || 
        e.target.classList.contains('item-qty') || 
        e.target.classList.contains('item-price') || 
        e.target.classList.contains('item-tax')) {
        updateInvoicePreview();
    }
});

// Template selection
function selectTemplate(template) {
    document.getElementById('templateSelect').value = template;
    
    document.querySelectorAll('.template-card').forEach(card => {
        if (card.dataset.template === template) {
            card.style.boxShadow = '0 15px 30px rgba(0, 247, 255, 0.2), var(--neon-glow)';
            card.style.transform = 'translateY(-5px)';
        } else {
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            card.style.transform = 'translateY(0)';
        }
    });
    
    invoiceData.template = template;
    updateInvoicePreview();
}

// Generate Invoice Preview - UPDATED WITH GST TOGGLE AND DISCOUNT
function updateInvoicePreview() {
    const template = document.getElementById('templateSelect').value;
    const businessName = document.getElementById('userName').value || 'Your Business Name';
    const businessAddress = document.getElementById('businessAddress').value || 'Business Address';
    const contactNumber = document.getElementById('contactNumber').value || 'Contact Number';
    const gstNumber = document.getElementById('gstNumber').value || 'GST Number';
    const upiId = document.getElementById('upiId').value || 'UPI ID';
    const customerName = document.getElementById('vendorName').value || 'Customer Name';
    const customerAddress = document.getElementById('vendorAddress').value || 'Customer Address';
    const invoiceDate = document.getElementById('invoiceDate').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
    const authorizedSignatory = document.getElementById('authorizedSignatory').value || 'Authorized Signatory';
    
    const gstMode = document.getElementById('gstToggle').checked;
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    
    const dateObj = new Date(invoiceDate);
    const formattedDate = invoiceDate ? dateObj.toLocaleDateString('en-IN') : 'Date';
    
    let subtotal = 0;
    let totalTax = 0;
    
    const itemRows = document.querySelectorAll('.item-row');
    const items = [];
    
    itemRows.forEach(row => {
        const desc = row.querySelector('.item-desc').value || 'Item';
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const tax = parseFloat(row.querySelector('.item-tax').value) || 0;
        
        const amount = qty * price;
        const taxAmount = gstMode ? amount * (tax / 100) : 0;
        
        subtotal += amount;
        totalTax += taxAmount;
        
        items.push({
            desc,
            qty,
            price,
            tax,
            amount,
            taxAmount
        });
    });
    
    // Calculate discount
    let discountAmount = 0;
    if (discountType === 'percentage' && discountValue > 0) {
        discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed' && discountValue > 0) {
        discountAmount = discountValue;
    }
    
    const totalAfterDiscount = subtotal - discountAmount;
    const grandTotal = totalAfterDiscount + totalTax;
    
    // Update summary
    document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summary-discount').textContent = `-₹${discountAmount.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `₹${totalTax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `₹${grandTotal.toFixed(2)}`;
    
    // Update QR code amount
    document.getElementById('qrAmount').textContent = grandTotal.toFixed(2);
    
    let previewHTML = `
        <div class="invoice-template ${template}-template">
            <div class="invoice-header">
                <div>
                    <div class="invoice-title">TAX INVOICE</div>
                    <div><strong>${businessName}</strong></div>
                    <div>${businessAddress}</div>
                    <div>${contactNumber}</div>
                    ${gstMode ? `<div>GSTIN: ${gstNumber}</div>` : ''}
                </div>
                <div class="invoice-meta">
                    <div class="invoice-number"><strong>${invoiceNumber}</strong></div>
                    <div class="invoice-date">Date: ${formattedDate}</div>
                </div>
            </div>
            
            <div class="invoice-addresses">
                <div class="address-box">
                    <h3>From:</h3>
                    <div><strong>${businessName}</strong></div>
                    <div>${businessAddress}</div>
                    <div>${contactNumber}</div>
                    ${gstMode ? `<div>GSTIN: ${gstNumber}</div>` : ''}
                </div>
                <div class="address-box">
                    <h3>Bill To:</h3>
                    <div><strong>${customerName}</strong></div>
                    <div>${customerAddress}</div>
                </div>
            </div>
            
            <table class="invoice-items">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Price</th>
                        ${gstMode ? '<th>Tax %</th>' : ''}
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    items.forEach(item => {
        previewHTML += `
            <tr>
                <td>${item.desc}</td>
                <td>${item.qty}</td>
                <td>₹${item.price.toFixed(2)}</td>
                ${gstMode ? `<td>${item.tax}%</td>` : ''}
                <td>₹${(item.amount + item.taxAmount).toFixed(2)}</td>
            </tr>
        `;
    });
    
    previewHTML += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="${gstMode ? '4' : '3'}" style="text-align: right;"><strong>Subtotal:</strong></td>
                        <td><strong>₹${subtotal.toFixed(2)}</strong></td>
                    </tr>
    `;
    
    // Add discount row if applicable
    if (discountAmount > 0) {
        const discountTypeText = discountType === 'percentage' ? `(${discountValue}%)` : '';
        previewHTML += `
                    <tr>
                        <td colspan="${gstMode ? '4' : '3'}" style="text-align: right;"><strong>Discount ${discountTypeText}:</strong></td>
                        <td><strong>-₹${discountAmount.toFixed(2)}</strong></td>
                    </tr>
        `;
    }
    
    // Add tax row if GST is enabled
    if (gstMode && totalTax > 0) {
        previewHTML += `
                    <tr>
                        <td colspan="${gstMode ? '4' : '3'}" style="text-align: right;"><strong>Tax (GST):</strong></td>
                        <td><strong>₹${totalTax.toFixed(2)}</strong></td>
                    </tr>
        `;
    }
    
    previewHTML += `
                    <tr>
                        <td colspan="${gstMode ? '4' : '3'}" style="text-align: right;"><strong>Grand Total:</strong></td>
                        <td><strong>₹${grandTotal.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <!-- Payment Information -->
            <div class="payment-info" style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="margin-bottom: 10px; color: #333;">Payment Information</h4>
                <p style="margin: 5px 0; color: #555;">
                    <strong>Payment Method:</strong> ${invoiceData.paymentMethod.toUpperCase()}
                </p>
                ${invoiceData.paymentMethod === 'upi' && upiId ? `
                <p style="margin: 5px 0; color: #555;">
                    <strong>UPI ID:</strong> ${upiId}
                </p>
                ` : ''}
            </div>
            
            <div class="invoice-footer">
                <div class="terms-title">Terms & Conditions</div>
                <p>Payment is due within 15 days. Please make checks payable to ${businessName}.</p>
                
                <div class="signature-area">
                    <div>${authorizedSignatory}</div>
                    <div>_________________________</div>
                    <div>Authorized Signature</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('invoicePreview').innerHTML = previewHTML;
}

// Calculate totals function
function calculateTotals() {
    const gstMode = document.getElementById('gstToggle').checked;
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    
    let subtotal = 0;
    let totalTax = 0;
    
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const tax = parseFloat(row.querySelector('.item-tax').value) || 0;
        
        const amount = qty * price;
        const taxAmount = gstMode ? amount * (tax / 100) : 0;
        
        subtotal += amount;
        totalTax += taxAmount;
    });
    
    // Calculate discount
    let discountAmount = 0;
    if (discountType === 'percentage' && discountValue > 0) {
        discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed' && discountValue > 0) {
        discountAmount = discountValue;
    }
    
    const totalAfterDiscount = subtotal - discountAmount;
    const grandTotal = totalAfterDiscount + totalTax;
    
    document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summary-discount').textContent = `-₹${discountAmount.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `₹${totalTax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `₹${grandTotal.toFixed(2)}`;
    
    // Update QR code amount
    document.getElementById('qrAmount').textContent = grandTotal.toFixed(2);
}

// Generate PDF - Single A4 Page (Fitted)
function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    const invoiceElement = document.getElementById('invoicePreview');
    
    const contentHeight = invoiceElement.scrollHeight;
    const scale = contentHeight > 1000 ? 0.6 : 0.8;
    
    html2canvas(invoiceElement, {
        scale: scale,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (imgHeight > pageHeight - 20) {
            const scaleFactor = (pageHeight - 20) / imgHeight;
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth * scaleFactor, imgHeight * scaleFactor);
        } else {
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        }
        
        const fileName = `invoice-${document.getElementById('invoiceNumber').value || '001'}.pdf`;
        pdf.save(fileName);
    }).catch(error => {
        console.error('Error generating PDF:', error);
    });
}

// Share as Image - Works on both mobile & laptop
function shareViaWhatsApp() {
    const invoiceElement = document.getElementById('invoicePreview');
    
    html2canvas(invoiceElement, {
        scale: 0.7,
        useCORS: true,
        logging: false
    }).then(canvas => {
        canvas.toBlob(function(blob) {
            const businessName = document.getElementById('userName').value || 'Your Business';
            const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
            const grandTotal = document.getElementById('summary-total').textContent;
            
            const message = `Invoice ${invoiceNumber} from ${businessName}\nTotal Amount: ${grandTotal}`;
            
            if (navigator.share) {
                const file = new File([blob], "invoice.png", { type: "image/png" });
                navigator.share({
                    files: [file],
                    text: message,
                    title: `Invoice ${invoiceNumber}`
                }).catch(() => {
                    downloadAndAlert(blob, message);
                });
            } else {
                downloadAndAlert(blob, message);
            }
        });
    });
}

function downloadAndAlert(blob, message) {
    const link = document.createElement('a');
    link.download = 'invoice.png';
    link.href = URL.createObjectURL(blob);
    link.click();
    
    setTimeout(() => {
        if(confirm('Invoice image downloaded! Open WhatsApp and send the downloaded image file. Click OK to open WhatsApp.')) {
            window.open(`https://web.whatsapp.com/`, '_blank');
        }
    }, 1000);
}

// Share via Email with Image
function shareViaEmail() {
    const invoiceElement = document.getElementById('invoicePreview');
    
    html2canvas(invoiceElement, {
        scale: 0.7,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        const businessName = document.getElementById('userName').value || 'Your Business';
        const customerName = document.getElementById('vendorName').value || 'Customer';
        const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
        const grandTotal = document.getElementById('summary-total').textContent;
        
        const subject = `Invoice ${invoiceNumber} from ${businessName}`;
        const body = `Dear ${customerName},\n\nPlease find your invoice ${invoiceNumber} below:\n\nTotal Amount: ${grandTotal}\n\nInvoice Image:\n${imgData}\n\nThank you for your business!\n\n${businessName}`;
        
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
    });
}

// Print Invoice
function printInvoice() {
    const invoiceElement = document.getElementById('invoicePreview');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Invoice</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .invoice-template { max-width: 800px; margin: 0 auto; }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${invoiceElement.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Industry section interaction
function showIndustryMessage(industry) {
    const messages = {
        retail: "Perfect for retail shops! Create GST bills for your store with itemized products.",
        restaurant: "Ideal for restaurants! Generate food bills with tax calculations.",
        medical: "Medical store billing with medicine details and expiry dates.",
        services: "Service invoices for consultants, freelancers, and professionals."
    };
    
    showNotification(messages[industry] || "This industry is supported!", 'info');
}

// Payment Methods System
function selectPaymentMethod(method) {
    invoiceData.paymentMethod = method;
    
    // Remove active class from all payment buttons
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected payment button
    const selectedBtn = document.querySelector(`.payment-btn[data-payment="${method}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Show/hide UPI section
    const upiSection = document.getElementById('upiSection');
    if (method === 'upi') {
        upiSection.style.display = 'block';
        updateQRCode();
    } else {
        upiSection.style.display = 'none';
    }
    
    updateInvoicePreview();
}

// Update QR Code
function updateQRCode() {
    const upiId = document.getElementById('upiId').value;
    const totalAmount = document.getElementById('summary-total').textContent.replace('₹', '');
    
    document.getElementById('qrUpiId').textContent = upiId || 'yourname@upi';
    
    // In a real implementation, you would generate a proper QR code here
    // For demo purposes, we'll just show a placeholder
    const qrCodeElement = document.getElementById('qrCode');
    if (qrCodeElement) {
        qrCodeElement.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; color: black; font-size: 0.8rem; text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 10px;">📱</div>
                <div>UPI QR Code</div>
                <div style="font-size: 0.7rem; margin-top: 5px;">Amount: ₹${totalAmount}</div>
            </div>
        `;
    }
}

// Copy UPI ID to clipboard
function copyUPIId() {
    const upiId = document.getElementById('upiId').value;
    if (!upiId) {
        showNotification('Please enter UPI ID first', 'error');
        return;
    }
    
    navigator.clipboard.writeText(upiId).then(() => {
        showNotification('UPI ID copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = upiId;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showNotification('UPI ID copied to clipboard!', 'success');
    });
}

// Speak Invoice Summary
function speakInvoiceSummary() {
    const businessName = document.getElementById('userName').value || 'Your Business';
    const customerName = document.getElementById('vendorName').value || 'Customer';
    const total = document.getElementById('summary-total').textContent;
    
    const summary = `Invoice summary. From ${businessName} to ${customerName}. Total amount: ${total}. Thank you for using Spark Invoice!`;
    speakText(summary);
    showNotification('Invoice details spoken', 'info');
}

// Calculate Total
function calculateTotal() {
    calculateTotals();
    const total = document.getElementById('summary-total').textContent;
    showNotification(`Total calculated: ${total}`, 'success');
    speakText(`Total calculated ${total}`);
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    showNotification('Logging in...', 'info');
    
    setTimeout(() => {
        showNotification('Login successful!', 'success');
        closeModal('loginModal');
        document.getElementById('loginForm').reset();
    }, 1500);
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    showNotification('Creating your account...', 'info');
    
    setTimeout(() => {
        if (sendOTP(phone)) {
            closeModal('signupModal');
        }
    }, 1500);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openSignupModal() {
    openModal('signupModal');
}

function switchAuthModal(to) {
    closeModal('loginModal');
    closeModal('signupModal');
    
    if (to === 'signup') {
        openModal('signupModal');
    } else if (to === 'login') {
        openModal('loginModal');
    }
}

// OTP Functions
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (this.value.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                } else {
                    this.blur();
                    if (isOTPComplete()) {
                        verifyOTP();
                    }
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace') {
                if (this.value.length === 0 && index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });
    
    document.querySelector('#otpModal .btn-primary').addEventListener('click', verifyOTP);
    
    document.querySelector('.otp-resend a').addEventListener('click', function(e) {
        e.preventDefault();
        const phone = document.getElementById('signupPhone').value;
        if (phone) {
            sendOTP(phone);
            showNotification('OTP sent again!', 'info');
        } else {
            showNotification('Please enter phone number first', 'error');
        }
    });
}

function isOTPComplete() {
    const otpInputs = document.querySelectorAll('.otp-input');
    for (let input of otpInputs) {
        if (!input.value) return false;
    }
    return true;
}

function getOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    let otp = '';
    otpInputs.forEach(input => {
        otp += input.value;
    });
    return otp;
}

function verifyOTP() {
    const otp = getOTP();
    
    if (otp.length !== 6) {
        showNotification('Please enter complete 6-digit OTP', 'error');
        return;
    }
    
    showNotification('Verifying OTP...', 'info');
    
    setTimeout(() => {
        if (otp.startsWith('1')) {
            showNotification('Phone verified successfully!', 'success');
            closeModal('otpModal');
            resetOTPInputs();
            
            setTimeout(() => {
                showNotification('Account created successfully! You can now login.', 'success');
            }, 1000);
        } else {
            showNotification('Invalid OTP. Please try again.', 'error');
            resetOTPInputs();
        }
    }, 2000);
}

function resetOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => {
        input.value = '';
    });
    if (otpInputs[0]) {
        otpInputs[0].focus();
    }
}

function sendOTP(phoneNumber) {
    if (!phoneNumber) {
        showNotification('Please enter phone number', 'error');
        return false;
    }
    
    openModal('otpModal');
    
    const demoOTP = '123456';
    
    showNotification(`OTP sent to ${phoneNumber}. Demo OTP: ${demoOTP}`, 'info');
    
    setTimeout(() => {
        const otpInputs = document.querySelectorAll('.otp-input');
        const otpArray = demoOTP.split('');
        
        otpArray.forEach((digit, index) => {
            if (otpInputs[index]) {
                otpInputs[index].value = digit;
            }
        });
        
        if (otpInputs[5]) {
            otpInputs[5].focus();
        }
    }, 1000);
    
    return true;
}

// Utility functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function formatCurrency(amount) {
    return '₹' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            closeMobileMenu();
        }
    });
});

// Handle touch events for mobile
document.addEventListener('touchstart', function(event) {
    // Add touch-specific handling if needed
});

// Prevent zoom on double tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Fix viewport height for mobile
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

// Load images efficiently for mobile
function loadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadImages();
    setViewportHeight();
    document.body.classList.add('loaded');
});









// ==================== FLIPKART-STYLE E-COMMERCE SYSTEM ====================

let shoppingCart = JSON.parse(localStorage.getItem('flipkartCart')) || [];
let currentStep = 1;

// Initialize System
function initFlipkartStyle() {
    createCartSidebar();
    createCheckoutModal();
    createOrderSuccessModal();
    setupProductButtons();
    updateCartIcon();
}

// Flipkart-style Cart Sidebar
function createCartSidebar() {
    const sidebarHTML = `
    <div id="cartSidebar" style="position: fixed; top: 0; right: -400px; width: 380px; height: 100vh; background: var(--darker); box-shadow: -2px 0 10px rgba(0,0,0,0.1); z-index: 1000; transition: right 0.3s ease; overflow-y: auto; border-left: 1px solid rgba(0, 247, 255, 0.2);">
        <div style="padding: 20px; border-bottom: 1px solid rgba(0, 247, 255, 0.2);">
            <div style="display: flex; justify-content: between; align-items: center;">
                <h2 style="margin: 0; color: var(--primary); font-size: 1.3rem; text-shadow: var(--neon-glow);">My Cart</h2>
                <button onclick="closeCartSidebar()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--light);">×</button>
            </div>
        </div>
        
        <div id="cartItemsContainer" style="padding: 0 20px;">
            <!-- Cart items will appear here -->
        </div>
        
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: var(--darker); border-top: 1px solid rgba(0, 247, 255, 0.2); padding: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: bold; color: var(--light);">
                <span>Total Amount:</span>
                <span style="color: var(--primary); text-shadow: var(--neon-glow);">₹<span id="sidebarTotal">0</span></span>
            </div>
            <button onclick="proceedToCheckout()" style="width: 100%; padding: 15px; background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); border: none; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4); transition: all 0.3s ease;">
                PLACE ORDER
            </button>
        </div>
    </div>
    <div id="cartOverlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 999; backdrop-filter: blur(5px);"></div>
    `;
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
}

// Checkout Modal - Flipkart Style
function createCheckoutModal() {
    const checkoutHTML = `
    <div id="checkoutModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--darker); z-index: 1001; overflow-y: auto;">
        <!-- Header -->
        <div style="background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); padding: 15px 20px; display: flex; align-items: center; gap: 15px;">
            <button onclick="closeCheckout()" style="background: none; border: none; color: var(--dark); font-size: 1.2rem; cursor: pointer; font-weight: bold;">←</button>
            <h2 style="margin: 0; font-size: 1.3rem; font-weight: bold;">Checkout</h2>
        </div>
        
        <!-- Progress Steps -->
        <div style="display: flex; padding: 20px; background: rgba(0, 0, 0, 0.3); border-bottom: 1px solid rgba(0, 247, 255, 0.2);">
            <div style="flex: 1; text-align: center;">
                <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--primary); color: var(--dark); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: bold; box-shadow: var(--neon-glow);">1</div>
                <span style="font-size: 0.9rem; color: var(--primary); font-weight: bold; text-shadow: var(--neon-glow);">Delivery Address</span>
            </div>
            <div style="flex: 1; text-align: center;">
                <div style="width: 30px; height: 30px; border-radius: 50%; background: rgba(0, 247, 255, 0.3); color: var(--light); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: bold;">2</div>
                <span style="font-size: 0.9rem; color: var(--light); opacity: 0.8;">Order Summary</span>
            </div>
            <div style="flex: 1; text-align: center;">
                <div style="width: 30px; height: 30px; border-radius: 50%; background: rgba(0, 247, 255, 0.3); color: var(--light); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: bold;">3</div>
                <span style="font-size: 0.9rem; color: var(--light); opacity: 0.8;">Payment</span>
            </div>
        </div>
        
        <!-- Step 1: Delivery Address -->
        <div id="step1" style="padding: 20px;">
            <h3 style="margin-bottom: 20px; color: var(--primary); text-shadow: var(--neon-glow);">Add Delivery Address</h3>
            
            <div style="background: var(--card-bg); border-radius: 20px; padding: 20px; border: 1px solid rgba(0, 247, 255, 0.2); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px);">
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--primary);">Full Name *</label>
                        <input type="text" id="customerName" placeholder="Enter your full name" style="width: 100%; padding: 12px; border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 10px; font-size: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--light); transition: all 0.3s ease;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--primary);">Phone Number *</label>
                        <input type="tel" id="customerPhone" placeholder="10-digit mobile number" style="width: 100%; padding: 12px; border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 10px; font-size: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--light); transition: all 0.3s ease;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--primary);">Pincode *</label>
                        <input type="text" id="customerPincode" placeholder="Enter pincode" style="width: 100%; padding: 12px; border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 10px; font-size: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--light); transition: all 0.3s ease;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--primary);">Full Address *</label>
                        <textarea id="customerAddress" placeholder="House No., Building, Street, Area, City" rows="3" style="width: 100%; padding: 12px; border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 10px; font-size: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--light); resize: vertical; transition: all 0.3s ease;"></textarea>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--primary);">Landmark (Optional)</label>
                        <input type="text" id="customerLandmark" placeholder="Nearby landmark" style="width: 100%; padding: 12px; border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 10px; font-size: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--light); transition: all 0.3s ease;">
                    </div>
                </div>
                
                <button onclick="goToStep(2)" style="width: 100%; padding: 15px; background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); border: none; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; margin-top: 20px; box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4); transition: all 0.3s ease;">
                    CONTINUE
                </button>
            </div>
        </div>
        
        <!-- Step 2: Order Summary -->
        <div id="step2" style="padding: 20px; display: none;">
            <h3 style="margin-bottom: 20px; color: var(--primary); text-shadow: var(--neon-glow);">Order Summary</h3>
            
            <div style="background: var(--card-bg); border-radius: 20px; padding: 20px; border: 1px solid rgba(0, 247, 255, 0.2); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); margin-bottom: 20px;">
                <div id="orderSummaryItems"></div>
                
                <div style="border-top: 1px solid rgba(0, 247, 255, 0.2); padding-top: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--light);">
                        <span>Total MRP</span>
                        <span>₹<span id="totalMRP">0</span></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--light);">
                        <span>Delivery Charges</span>
                        <span style="color: var(--accent); text-shadow: var(--accent-glow);">FREE</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; padding-top: 10px; border-top: 1px dashed rgba(0, 247, 255, 0.2); color: var(--light);">
                        <span>Total Amount</span>
                        <span style="color: var(--primary); text-shadow: var(--neon-glow);">₹<span id="orderTotal">0</span></span>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="goToStep(1)" style="flex: 1; padding: 15px; background: transparent; color: var(--primary); border: 2px solid var(--primary); border-radius: 50px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.3s ease;">
                    BACK
                </button>
                <button onclick="goToStep(3)" style="flex: 1; padding: 15px; background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); border: none; border-radius: 50px; font-size: 1rem; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4); transition: all 0.3s ease;">
                    CONTINUE
                </button>
            </div>
        </div>
        
        <!-- Step 3: Payment -->
        <div id="step3" style="padding: 20px; display: none;">
            <h3 style="margin-bottom: 20px; color: var(--primary); text-shadow: var(--neon-glow);">Select Payment Method</h3>
            
            <div style="background: var(--card-bg); border-radius: 20px; padding: 20px; border: 1px solid rgba(0, 247, 255, 0.2); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); margin-bottom: 20px;">
                <div style="margin-bottom: 15px;">
                    <h4 style="margin-bottom: 15px; color: var(--primary);">UPI Apps</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="payment-option" onclick="selectPayment('phonepe')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="font-size: 2rem; margin-bottom: 8px;">📱</div>
                            <div style="font-weight: bold; color: var(--primary);">PhonePe</div>
                        </div>
                        <div class="payment-option" onclick="selectPayment('gpay')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="font-size: 2rem; margin-bottom: 8px;">💸</div>
                            <div style="font-weight: bold; color: var(--primary);">Google Pay</div>
                        </div>
                        <div class="payment-option" onclick="selectPayment('paytm')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="font-size: 2rem; margin-bottom: 8px;">🏪</div>
                            <div style="font-weight: bold; color: var(--primary);">Paytm</div>
                        </div>
                        <div class="payment-option" onclick="selectPayment('amazonpay')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="font-size: 2rem; margin-bottom: 8px;">📦</div>
                            <div style="font-weight: bold; color: var(--primary);">Amazon Pay</div>
                        </div>
                    </div>
                </div>
                
                <div style="border-top: 1px solid rgba(0, 247, 255, 0.2); padding-top: 15px;">
                    <h4 style="margin-bottom: 15px; color: var(--primary);">Other Payment Methods</h4>
                    <div style="display: grid; gap: 10px;">
                        <div class="payment-option" onclick="selectPayment('card')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="font-size: 1.5rem;">💳</div>
                                <div>
                                    <div style="font-weight: bold; color: var(--light);">Credit/Debit Card</div>
                                    <div style="font-size: 0.9rem; color: var(--light); opacity: 0.8;">Pay using your card</div>
                                </div>
                            </div>
                        </div>
                        <div class="payment-option" onclick="selectPayment('cod')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="font-size: 1.5rem;">📦</div>
                                <div>
                                    <div style="font-weight: bold; color: var(--light);">Cash on Delivery</div>
                                    <div style="font-size: 0.9rem; color: var(--light); opacity: 0.8;">Pay when you receive</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="goToStep(2)" style="flex: 1; padding: 15px; background: transparent; color: var(--primary); border: 2px solid var(--primary); border-radius: 50px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.3s ease;">
                    BACK
                </button>
                <button onclick="processPayment()" style="flex: 1; padding: 15px; background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); border: none; border-radius: 50px; font-size: 1rem; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4); transition: all 0.3s ease;">
                    PAY ₹<span id="paymentAmount">0</span>
                </button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', checkoutHTML);
}

// Order Success Modal
function createOrderSuccessModal() {
    const successHTML = `
    <div id="orderSuccessModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--darker); z-index: 1002;">
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 5rem; margin-bottom: 20px; animation: float 3s ease-in-out infinite;">🎉</div>
            <h2 style="color: var(--primary); margin-bottom: 10px; text-shadow: var(--neon-glow);">Order Placed Successfully!</h2>
            <p style="color: var(--light); margin-bottom: 30px; font-size: 1.1rem; opacity: 0.9;">Thank you for shopping with us</p>
            
            <div style="background: var(--card-bg); border-radius: 20px; padding: 25px; margin: 0 auto 30px; max-width: 400px; text-align: left; border: 1px solid rgba(0, 247, 255, 0.2); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px);">
                <h3 style="margin-bottom: 15px; color: var(--accent); text-shadow: var(--accent-glow);">Order Details</h3>
                <div id="successOrderDetails" style="color: var(--light);"></div>
            </div>
            
            <div style="color: var(--light); margin-bottom: 40px; opacity: 0.8;">
                <p>📞 You will receive a confirmation call within 24 hours</p>
                <p>📦 Expected delivery: 2-3 working days</p>
                <p>🛵 Free delivery | Easy returns</p>
            </div>
            
            <button onclick="closeOrderSuccess()" style="padding: 15px 40px; background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); border: none; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4); transition: all 0.3s ease;">
                Continue Shopping
            </button>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', successHTML);
}

// Product Buttons
function setupProductButtons() {
    const products = document.querySelectorAll('.hardware-card');
    
    products.forEach((product, index) => {
        const buyButton = product.querySelector('.btn-primary');
        buyButton.innerHTML = 'ADD TO CART';
        buyButton.style.cursor = 'pointer';
        buyButton.style.background = 'linear-gradient(45deg, var(--primary), var(--accent))';
        buyButton.style.color = 'var(--dark)';
        buyButton.style.border = 'none';
        buyButton.style.padding = '12px 24px';
        buyButton.style.borderRadius = '50px';
        buyButton.style.fontWeight = 'bold';
        buyButton.style.boxShadow = '0 5px 15px rgba(0, 247, 255, 0.4)';
        buyButton.style.transition = 'all 0.3s ease';
        
        buyButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productName = product.querySelector('h3').textContent;
            const priceText = product.querySelector('.price').textContent;
            const price = parseInt(priceText.replace(/[₹,]/g, ''));
            
            addToCart(productName, price, index);
            showFlipkartNotification(`"${productName}" added to cart!`);
        });
    });
}

// Add to Cart Function
function addToCart(name, price, id) {
    const existingItem = shoppingCart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        shoppingCart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    localStorage.setItem('flipkartCart', JSON.stringify(shoppingCart));
    updateCartSidebar();
    updateCartIcon();
    showCartSidebar();
}

// Update Cart Sidebar
function updateCartSidebar() {
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('sidebarTotal');
    const paymentAmountEl = document.getElementById('paymentAmount');
    
    if (shoppingCart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--light); opacity: 0.8;">
                <div style="font-size: 4rem; margin-bottom: 15px; animation: float 3s ease-in-out infinite;">🛒</div>
                <h3 style="margin: 0 0 10px 0; color: var(--primary);">Your cart is empty</h3>
                <p>Add some items to get started</p>
            </div>
        `;
        totalEl.textContent = '0';
        paymentAmountEl.textContent = '0';
        return;
    }
    
    let itemsHTML = '';
    let total = 0;
    
    shoppingCart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid rgba(0, 247, 255, 0.2);">
                <div style="width: 60px; height: 60px; background: rgba(0, 247, 255, 0.1); border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 1px solid rgba(0, 247, 255, 0.3);">
                    📦
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 0.9rem; color: var(--light);">${item.name}</h4>
                    <p style="margin: 0 0 8px 0; color: var(--primary); font-weight: bold; text-shadow: var(--neon-glow);">₹${item.price}</p>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="updateQuantity(${index}, -1)" style="background: rgba(0, 247, 255, 0.1); border: 1px solid rgba(0, 247, 255, 0.3); width: 25px; height: 25px; border-radius: 50%; cursor: pointer; color: var(--light); transition: all 0.3s ease;">-</button>
                        <span style="font-weight: bold; color: var(--light);">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)" style="background: rgba(0, 247, 255, 0.1); border: 1px solid rgba(0, 247, 255, 0.3); width: 25px; height: 25px; border-radius: 50%; cursor: pointer; color: var(--light); transition: all 0.3s ease;">+</button>
                        <button onclick="removeFromCart(${index})" style="margin-left: auto; background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.9rem; text-shadow: var(--neon-glow); transition: all 0.3s ease;">REMOVE</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = itemsHTML;
    totalEl.textContent = total;
    paymentAmountEl.textContent = total;
    
    // Update order summary
    updateOrderSummary();
}

// Update Quantity
function updateQuantity(index, change) {
    shoppingCart[index].quantity += change;
    
    if (shoppingCart[index].quantity <= 0) {
        shoppingCart.splice(index, 1);
    }
    
    localStorage.setItem('flipkartCart', JSON.stringify(shoppingCart));
    updateCartSidebar();
    updateCartIcon();
}

// Remove from Cart
function removeFromCart(index) {
    shoppingCart.splice(index, 1);
    localStorage.setItem('flipkartCart', JSON.stringify(shoppingCart));
    updateCartSidebar();
    updateCartIcon();
    showFlipkartNotification('Item removed from cart');
}

// Update Cart Icon in Header
function updateCartIcon() {
    let cartBtn = document.getElementById('flipkartCartIcon');
    
    if (!cartBtn) {
        const navButtons = document.querySelector('.nav-buttons');
        cartBtn = document.createElement('button');
        cartBtn.id = 'flipkartCartIcon';
        cartBtn.className = 'btn btn-primary'; // YEH LINE ADD KARO
        cartBtn.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>🛒</span>
                <span>Cart</span>
                <span id="flipkartCartCount" style="background: var(--dark); color: var(--accent); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">0</span>
            </div>
        `;
        cartBtn.onclick = showCartSidebar;
        navButtons.prepend(cartBtn);
        
        // Size chota karne ke liye CSS apply karo
        cartBtn.style.padding = "10px 20px"; // Thoda chota padding
        cartBtn.style.fontSize = "0.9rem"; // Thoda chota font
    }
    
    const totalItems = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('flipkartCartCount').textContent = totalItems;
}

// Show Cart Sidebar
function showCartSidebar() {
    document.getElementById('cartSidebar').style.right = '0';
    document.getElementById('cartOverlay').style.display = 'block';
}

function closeCartSidebar() {
    document.getElementById('cartSidebar').style.right = '-400px';
    document.getElementById('cartOverlay').style.display = 'none';
}

// Proceed to Checkout
function proceedToCheckout() {
    if (shoppingCart.length === 0) {
        showFlipkartNotification('Your cart is empty!');
        return;
    }
    
    closeCartSidebar();
    document.getElementById('checkoutModal').style.display = 'block';
    goToStep(1);
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
    currentStep = 1;
}

// Step Navigation
function goToStep(step) {
    // Hide all steps
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    
    // Show current step
    document.getElementById('step' + step).style.display = 'block';
    currentStep = step;
    
    if (step === 2) {
        updateOrderSummary();
    }
}

// Update Order Summary
function updateOrderSummary() {
    const container = document.getElementById('orderSummaryItems');
    const totalMRPEl = document.getElementById('totalMRP');
    const orderTotalEl = document.getElementById('orderTotal');
    
    let itemsHTML = '';
    let total = 0;
    
    shoppingCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div style="display: flex; gap: 15px; padding: 12px 0; border-bottom: 1px solid rgba(0, 247, 255, 0.2);">
                <div style="width: 50px; height: 50px; background: rgba(0, 247, 255, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0, 247, 255, 0.3);">
                    📦
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; margin-bottom: 5px; color: var(--light);">${item.name}</div>
                    <div style="color: var(--primary); font-weight: bold; text-shadow: var(--neon-glow);">₹${item.price} × ${item.quantity}</div>
                </div>
                <div style="font-weight: bold; color: var(--light);">₹${itemTotal}</div>
            </div>
        `;
    });
    
    container.innerHTML = itemsHTML;
    totalMRPEl.textContent = total;
    orderTotalEl.textContent = total;
}

// Select Payment Method
let selectedPayment = '';
function selectPayment(method) {
    selectedPayment = method;
    
    // Remove active class from all
    document.querySelectorAll('.payment-option').forEach(option => {
        option.style.borderColor = 'rgba(0, 247, 255, 0.3)';
        option.style.background = 'rgba(0, 0, 0, 0.3)';
    });
    
    // Add active class to selected
    event.currentTarget.style.borderColor = 'var(--primary)';
    event.currentTarget.style.background = 'rgba(0, 247, 255, 0.2)';
    event.currentTarget.style.boxShadow = 'var(--neon-glow)';
}

// Process Payment
function processPayment() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const pincode = document.getElementById('customerPincode').value;
    const address = document.getElementById('customerAddress').value;
    
    // Validation
    if (!name || !phone || !pincode || !address) {
        showFlipkartNotification('Please fill all required fields');
        return;
    }
    
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        showFlipkartNotification('Please enter valid 10-digit phone number');
        return;
    }
    
    if (!selectedPayment) {
        showFlipkartNotification('Please select a payment method');
        return;
    }
    
    // Create order
    const order = {
        orderId: 'SPK' + Date.now(),
        customer: {
            name: name,
            phone: phone,
            pincode: pincode,
            address: address
        },
        items: [...shoppingCart],
        total: shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod: selectedPayment,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
    };
    
    // Show processing
    showFlipkartNotification(`Processing ${selectedPayment.toUpperCase()} payment...`);
    
    // Simulate payment success
    setTimeout(() => {
        showOrderSuccess(order);
    }, 2000);
}

// Show Order Success
function showOrderSuccess(order) {
    const detailsContainer = document.getElementById('successOrderDetails');
    
    detailsContainer.innerHTML = `
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Order ID:</strong> <span style="color: var(--light);">${order.orderId}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Customer:</strong> <span style="color: var(--light);">${order.customer.name}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Phone:</strong> <span style="color: var(--light);">${order.customer.phone}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Address:</strong> <span style="color: var(--light);">${order.customer.address}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Pincode:</strong> <span style="color: var(--light);">${order.customer.pincode}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Total Amount:</strong> <span style="color: var(--accent); text-shadow: var(--accent-glow);">₹${order.total}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Payment Method:</strong> <span style="color: var(--light);">${order.paymentMethod.toUpperCase()}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Order Date:</strong> <span style="color: var(--light);">${order.date} ${order.time}</span></div>
    `;
    
    // Clear cart
    shoppingCart = [];
    localStorage.removeItem('flipkartCart');
    updateCartIcon();
    
    closeCheckout();
    document.getElementById('orderSuccessModal').style.display = 'block';
}

function closeOrderSuccess() {
    document.getElementById('orderSuccessModal').style.display = 'none';
}

// Flipkart-style Notification
function showFlipkartNotification(message) {
    // Remove existing notification
    const existingNotif = document.getElementById('flipkartNotif');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notif = document.createElement('div');
    notif.id = 'flipkartNotif';
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        color: var(--light);
        padding: 15px 20px;
        border-radius: 15px;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3), var(--neon-glow);
        border: 1px solid rgba(0, 247, 255, 0.3);
        backdrop-filter: blur(10px);
    `;
    notif.textContent = message;
    
    document.body.appendChild(notif);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize System
document.addEventListener('DOMContentLoaded', function() {
    initFlipkartStyle();
});




function setupMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileSignupBtn = document.getElementById('mobileSignupBtn');
    const mobileCartBtn = document.getElementById('mobileCartBtn');
    
    // Signup button functionality
    mobileSignupBtn.addEventListener('click', function() {
        // Open signup modal
        openSignupModal();
        // Close mobile menu
        closeMobileMenu();
    });
    
    // Cart button functionality  
    mobileCartBtn.addEventListener('click', function() {
        showCartSidebar();
        closeMobileMenu();
    });
}

// Cart count update function
function updateMobileCartCount() {
    const mobileCartCount = document.getElementById('mobileCartCount');
    const totalItems = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    if (mobileCartCount) {
        mobileCartCount.textContent = totalItems;
    }
}

// Update cart functions mein mobile count ko bhi update karo
function updateCartIcon() {
    // ... existing code ...
    updateMobileCartCount(); // Add this line
}







// Update Cart Icon in Header
function updateCartIcon() {
    let cartBtn = document.getElementById('flipkartCartIcon');
    
    if (!cartBtn) {
        const navButtons = document.querySelector('.nav-buttons');
        cartBtn = document.createElement('button');
        cartBtn.id = 'flipkartCartIcon';
        cartBtn.className = 'btn btn-primary';
        cartBtn.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <span>🛒</span>
                <span>Cart</span>
                <span id="flipkartCartCount" style="background: var(--dark); color: var(--accent); border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold;">0</span>
            </div>
        `;
        cartBtn.onclick = showCartSidebar;
        navButtons.prepend(cartBtn);
        
        // Mobile ke liye compact size
        cartBtn.style.padding = "8px 16px";
        cartBtn.style.fontSize = "0.85rem";
        cartBtn.style.minWidth = "auto";
        
        // IMPORTANT: Ensure cart button is always visible in desktop
        cartBtn.style.display = "block";
    }
    
    const totalItems = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('flipkartCartCount').textContent = totalItems;
}

// Mobile view check function update karo
function checkMobileView() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const signupBtn = document.getElementById('signupBtn');
    const cartBtn = document.getElementById('flipkartCartIcon');
    
    if (window.innerWidth <= 768) {
        mobileMenuToggle.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'none'; // Mobile pe cart hide
    } else {
        mobileMenuToggle.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'block';
        if (cartBtn) cartBtn.style.display = 'block'; // Desktop pe cart show
        closeMobileMenu();
    }
}










// Item Description Voice Input
function startItemDescriptionVoice() {
    if (!recognition) {
        showNotification('Voice recognition not available', 'error');
        return;
    }
    
    if (isListening) {
        recognition.stop();
        return;
    }
    
    currentVoiceType = 'item-description';
    recognition.lang = currentLanguage;
    recognition.start();
    
    document.getElementById('voiceStatus').textContent = "🎤 Item/Product name bolein jaise: 'Tomato', 'Onion', 'Mobile Phone'";
}







// Process Item Description
function processItemDescription(transcript) {
    let itemName = transcript.trim();
    
    if (itemName && itemName.length > 1) {
        setLastItemDescription(itemName);
        document.getElementById('voiceStatus').textContent = `✅ Item name set: ${itemName}`;
        speakText(`Item name set ${itemName}`);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak item name clearly";
    }
}










function setLastItemName(itemName) {
    const itemRows = document.querySelectorAll('.item-row, .product-row, tr.item');
    let lastItem;
    
    if (itemRows.length > 0) {
        lastItem = itemRows[itemRows.length - 1];
        const lastItemName = lastItem.querySelector('.item-name').value;
        const lastItemQty = lastItem.querySelector('.item-qty').value;
        const lastItemPrice = lastItem.querySelector('.item-price').value;
        
        if (!lastItemName && !lastItemQty && !lastItemPrice) {
            console.log("✅ Using empty last row");
        } else {
            console.log("✅ Last row filled, adding new row");
            addItemRow();
            setTimeout(() => {
                const newRows = document.querySelectorAll('.item-row, .product-row, tr.item');
                lastItem = newRows[newRows.length - 1];
                setItemNameInRow(lastItem, itemName);
            }, 50);
            return;
        }
    } else {
        console.log("✅ No rows, adding first row");
        addItemRow();
        setTimeout(() => {
            const newRows = document.querySelectorAll('.item-row, .product-row, tr.item');
            lastItem = newRows[newRows.length - 1];
            setItemNameInRow(lastItem, itemName);
        }, 50);
        return;
    }
    
    setItemNameInRow(lastItem, itemName);
}

function setItemNameInRow(row, itemName) {
    const nameInput = row.querySelector('.item-name');
    if (nameInput) {
        nameInput.value = itemName;
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log("✅ Item name set:", itemName);
    }
}








function processItemName(transcript) {
    console.log("Raw transcript:", transcript);
    
    // English + Hindi dono languages ke liye cleaning
    let itemName = transcript
        .replace(/^(item|product|आइटम|प्रोडक्ट|वस्तु|उत्पाद)\s+/i, '')  // Start se remove
        .replace(/\s+(item|product|आइटम|प्रोडक्ट|वस्तु|उत्पाद)$/i, '')  // End se remove
        .trim();
    
    console.log("Cleaned item name:", itemName);
    
    if (itemName && itemName.length > 1) {
        // Direct set karo
        addItemRow();
        setTimeout(() => {
            const rows = document.querySelectorAll('.item-row');
            const lastRow = rows[rows.length - 1];
            const nameInput = lastRow.querySelector('.item-desc');
            if (nameInput) {
                nameInput.value = itemName;
                updateInvoicePreview();
                console.log("✅ Item set:", itemName);
                document.getElementById('voiceStatus').textContent = `✅ Item set: ${itemName}`;
                speakText(`Item set ${itemName}`);
            }
        }, 500);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak only product name like 'Laptop', 'Mobile'";
    }
}


































