// Wallet Input Page JavaScript

const walletInput = document.getElementById('walletAddress');
const submitBtn = document.getElementById('submitBtn');
const walletForm = document.getElementById('walletForm');
const validationMessage = document.getElementById('validationMessage');
const fromDateInput = document.getElementById('fromDate');
const toDateInput = document.getElementById('toDate');
const dateRangeMessage = document.getElementById('dateRangeMessage');
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
            // Build redirect URL with optional date range
            const params = new URLSearchParams({ address });
            const fromDate = fromDateInput.value;
            const toDate = toDateInput.value;
            if (fromDate) params.set('from_date', fromDate);
            if (toDate) params.set('to_date', toDate);
            window.location.href = `/explorer?${params.toString()}`;
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
// Validate date range inputs
function validateDateRange() {
    const from = fromDateInput.value;
    const to = toDateInput.value;
    if (from && to && from > to) {
        dateRangeMessage.textContent = '✗ "From Date" must be on or before "To Date"';
        dateRangeMessage.className = 'validation-message error';
        dateRangeMessage.style.display = 'block';
        return false;
    }
    dateRangeMessage.style.display = 'none';
    return true;
}

walletInput.addEventListener('input', handleInputChange);
fromDateInput.addEventListener('change', validateDateRange);
toDateInput.addEventListener('change', validateDateRange);
walletForm.addEventListener('submit', (e) => {
    if (!validateDateRange()) {
        e.preventDefault();
        return;
    }
    handleSubmit(e);
});
exampleBtns.forEach(btn => btn.addEventListener('click', handleExampleClick));

// Reset button state when page is shown (e.g., when using browser back button)
window.addEventListener('pageshow', (event) => {
    // Reset button to original state
    submitBtn.innerHTML = 'Get Transactions';
    
    // Re-validate current input to set proper button state
    const address = walletInput.value.trim();
    if (address) {
        const result = validateAddress(address);
        submitBtn.disabled = !result.valid;
    } else {
        submitBtn.disabled = true;
    }
});

// Focus input on load
walletInput.focus();
