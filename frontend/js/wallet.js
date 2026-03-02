// Wallet Input Page JavaScript

const walletInput = document.getElementById('walletAddress');
const submitBtn = document.getElementById('submitBtn');
const walletForm = document.getElementById('walletForm');
const validationMessage = document.getElementById('validationMessage');
const exampleBtns = document.querySelectorAll('.example-btn');

// Validation patterns
const ETHEREUM_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const TRON_PATTERN = /^T[a-zA-Z0-9]{33}$/;

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate wallet address format
function validateAddress(address) {
    if (!address || address.trim() === '') {
        return { valid: false, network: null, message: '' };
    }

    const trimmedAddress = address.trim();

    if (ETHEREUM_PATTERN.test(trimmedAddress)) {
        return { 
            valid: true, 
            network: 'ethereum', 
            message: '✓ Valid Ethereum address detected' 
        };
    } else if (TRON_PATTERN.test(trimmedAddress)) {
        return { 
            valid: true, 
            network: 'tron', 
            message: '✓ Valid Tron address detected' 
        };
    } else {
        return { 
            valid: false, 
            network: null, 
            message: '✗ Invalid address format. Expected Ethereum (0x...) or Tron (T...)' 
        };
    }
}

// Show validation message
function showValidation(result) {
    if (result.message === '') {
        validationMessage.style.display = 'none';
        walletInput.classList.remove('error', 'success');
        submitBtn.disabled = true;
        return;
    }

    validationMessage.style.display = 'block';
    validationMessage.textContent = result.message;

    if (result.valid) {
        validationMessage.className = 'validation-message success';
        walletInput.classList.remove('error');
        walletInput.classList.add('success');
        submitBtn.disabled = false;
    } else {
        validationMessage.className = 'validation-message error';
        walletInput.classList.remove('success');
        walletInput.classList.add('error');
        submitBtn.disabled = true;
    }
}

// Handle input change with debounce
const handleInputChange = debounce((e) => {
    const address = e.target.value;
    const result = validateAddress(address);
    showValidation(result);
}, 300);

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const address = walletInput.value.trim();
    const result = validateAddress(address);

    if (!result.valid) {
        showValidation(result);
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="spinner"></span>Validating...';

    try {
        // Validate with backend
        const response = await fetch('/api/validate-wallet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        });

        const data = await response.json();

        if (data.valid) {
            // Redirect to explorer page
            window.location.href = `/explorer?address=${encodeURIComponent(address)}`;
        } else {
            showValidation({ 
                valid: false, 
                network: null, 
                message: data.message 
            });
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Validation error:', error);
        showValidation({ 
            valid: false, 
            network: null, 
            message: '✗ Error connecting to server. Please try again.' 
        });
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle example button clicks
function handleExampleClick(e) {
    const address = e.target.dataset.address;
    walletInput.value = address;
    const result = validateAddress(address);
    showValidation(result);
}

// Event listeners
walletInput.addEventListener('input', handleInputChange);
walletForm.addEventListener('submit', handleSubmit);
exampleBtns.forEach(btn => btn.addEventListener('click', handleExampleClick));

// Focus input on load
walletInput.focus();
