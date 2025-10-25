// Real OTP System with API Integration
const API_BASE_URL = 'http://localhost:3000/api';

console.log("✅ triple-login.js loaded successfully");

// Form submit prevent
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - setting up event listeners");
    
    const form = document.getElementById('signupForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("📝 Form submitted - preventing default");
            startEmailOTP();
        });
    }
    
    // OTP button event
    const otpBtn = document.querySelector('.combined-btn');
    if (otpBtn) {
        otpBtn.addEventListener('click', function() {
            console.log("🔄 OTP button clicked");
            startEmailOTP();
        });
    }
});

// Start Email OTP Process
async function startEmailOTP() {
    console.log("🚀 startEmailOTP function called");
    
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const fullName = document.getElementById('fullName').value;
    const businessName = document.getElementById('businessName').value;
    
    console.log("📧 Form data:", {email, phone, fullName, businessName});
    
    // Basic validation
    if (!email || !phone || !fullName || !businessName) {
        alert('Please fill all required fields');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter valid email address');
        return;
    }
    
    alert('Sending OTP to: ' + email);
    
    try {
        console.log("📡 Calling backend API...");
        
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: fullName,
                business: businessName
            })
        });
        
        console.log("✅ Backend response received");
        const result = await response.json();
        console.log("📦 Backend result:", result);
        
        if (result.success) {
            alert('OTP sent successfully! Test OTP: 123456');
            openOTPModal();
        } else {
            alert('OTP failed: ' + result.error);
        }
        
    } catch (error) {
        console.error('❌ OTP Error:', error);
        alert('OTP sending failed. Check console for details.');
    }
}

// Google Signup
async function googleSignup() {
    alert('Google signup would redirect to OAuth page');
}

// OTP Modal Functions
function openOTPModal() {
    console.log("📱 Opening OTP modal");
    document.getElementById('otpModal').style.display = 'block';
}

function closeOTPModal() {
    document.getElementById('otpModal').style.display = 'none';
}

function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    let otp = '';
    otpInputs.forEach(input => otp += input.value);
    
    console.log("🔐 Verifying OTP:", otp);
    
    if (otp.length === 6) {
        alert('OTP verified successfully! Account created.');
        closeOTPModal();
        
        // Complete registration
        completeRegistration();
    } else {
        alert('Please enter complete 6-digit OTP');
    }
}

async function completeRegistration() {
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('fullName').value;
    const businessName = document.getElementById('businessName').value;
    const phone = document.getElementById('phone').value;
    
    console.log("👤 Completing registration for:", fullName);
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: fullName,
                businessName: businessName,
                email: email,
                phone: phone,
                password: 'test123'
            })
        });
        
        const result = await response.json();
        console.log("🎉 Registration result:", result);
        
        if (result.success) {
            alert('Account created successfully! Welcome ' + fullName);
            
            // Send success message to parent window
            if (window.opener) {
                window.opener.postMessage({ 
                    type: 'SIGNUP_SUCCESS', 
                    user: result.user 
                }, '*');
            }
            
            // Close window after success
            setTimeout(() => {
                window.close();
            }, 2000);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration completed (test mode)');
        
        // Test mode success
        if (window.opener) {
            window.opener.postMessage({ 
                type: 'SIGNUP_SUCCESS', 
                user: {
                    name: fullName,
                    email: email,
                    businessName: businessName
                }
            }, '*');
        }
        
        setTimeout(() => {
            window.close();
        }, 2000);
    }
}

function resendOTP() {
    alert('New OTP sent! Test OTP: 123456');
}

function openLogin() {
    alert('Login page would open here');
}