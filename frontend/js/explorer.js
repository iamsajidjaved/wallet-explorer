// Explorer Dashboard JavaScript

// State management
let allTransactions = [];
let filteredTransactions = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 50;
let currentSort = { field: 'timestamp', direction: 'desc' };

// Get wallet address from URL
const urlParams = new URLSearchParams(window.location.search);
const walletAddress = urlParams.get('address');

// DOM Elements
const summarySection = document.getElementById('summarySection');
const filtersSection = document.getElementById('filtersSection');
const transactionsSection = document.getElementById('transactionsSection');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');

const walletAddressDisplay = document.getElementById('walletAddressDisplay');
const networksDisplay = document.getElementById('networksDisplay');
const totalTxDisplay = document.getElementById('totalTxDisplay');
const firstSeenDisplay = document.getElementById('firstSeenDisplay');
const lastActivityDisplay = document.getElementById('lastActivityDisplay');

const timeFilter = document.getElementById('timeFilter');
const directionFilter = document.getElementById('directionFilter');
const counterpartyFilter = document.getElementById('counterpartyFilter');
const counterpartySearch = document.getElementById('counterpartySearch');
const counterpartyTrigger = document.getElementById('counterpartyTrigger');
const counterpartyDropdown = document.getElementById('counterpartyDropdown');
const counterpartyOptions = document.getElementById('counterpartyOptions');
const counterpartySelected = document.getElementById('counterpartySelected');

const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const backBtn = document.getElementById('backBtn');
const headerBackBtn = document.getElementById('headerBackBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

const transactionsTBody = document.getElementById('transactionsTBody');
const filteredCount = document.getElementById('filteredCount');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');

// Initialize
async function init() {
    if (!walletAddress) {
        window.location.href = '/';
        return;
    }

    await fetchTransactions();
}

// Fetch transactions from API
async function fetchTransactions() {
    showLoading();

    try {
        const timeParam = timeFilter.value ? `&time_filter=${timeFilter.value}` : '';
        const url = `/api/transactions/${walletAddress}?${timeParam}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        console.log('Data received:', data);
        
        allTransactions = data.transactions;
        filteredTransactions = [...allTransactions];

        updateSummary(data);
        updateCounterpartyFilter();
        applyFilters();
        
        hideLoading();
        showContent();
    } catch (error) {
        console.error('Error fetching transactions:', error);
        showError('Failed to load transactions. Please try again.');
    }
}

// Update summary section
function updateSummary(data) {
    walletAddressDisplay.textContent = data.wallet_address;
    
    const networkBadges = data.networks.map(net => 
        `<span class="badge badge-${net.toLowerCase()}">${net}</span>`
    ).join(' ');
    networksDisplay.innerHTML = networkBadges;
    
    totalTxDisplay.textContent = data.total_transactions.toLocaleString();
    firstSeenDisplay.textContent = data.first_seen || '-';
    lastActivityDisplay.textContent = data.last_activity || '-';
}

// Update counterparty filter dropdown
function updateCounterpartyFilter() {
    const counterparties = new Set();
    
    allTransactions.forEach(tx => {
        counterparties.add(tx.from);
        counterparties.add(tx.to);
    });

    // Remove the wallet address itself
    counterparties.delete(walletAddress);

    // Store all addresses for filtering
    window.allCounterparties = Array.from(counterparties).sort();
    
    // Initial render of all addresses
    renderCounterpartyOptions();
}

// Render counterparty options based on search
function renderCounterpartyOptions(searchTerm = '') {
    // Safety check: ensure allCounterparties exists
    if (!window.allCounterparties) {
        window.allCounterparties = [];
    }
    
    const filteredAddresses = window.allCounterparties.filter(address => 
        address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    counterpartyOptions.innerHTML = '<div class="dropdown-option" data-value="">All Addresses</div>';
    
    filteredAddresses.forEach(address => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.setAttribute('data-value', address);
        option.textContent = truncateAddress(address);
        option.title = address; // Show full address on hover
        counterpartyOptions.appendChild(option);
    });
    
    // Attach click handlers to options
    attachOptionHandlers();
}

// Attach click handlers to dropdown options
function attachOptionHandlers() {
    const options = counterpartyOptions.querySelectorAll('.dropdown-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            // Update hidden input and selected text
            counterpartyFilter.value = value;
            counterpartySelected.textContent = text;
            
            // Update selected state
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Close dropdown
            closeCounterpartyDropdown();
            
            // Apply filters
            applyFilters();
        });
    });
}

// Toggle dropdown
function toggleCounterpartyDropdown() {
    const isActive = counterpartyDropdown.classList.contains('active');
    if (isActive) {
        closeCounterpartyDropdown();
    } else {
        openCounterpartyDropdown();
    }
}

// Open dropdown
function openCounterpartyDropdown() {
    counterpartyDropdown.classList.add('active');
    counterpartyTrigger.classList.add('active');
    counterpartySearch.focus();
}

// Close dropdown
function closeCounterpartyDropdown() {
    counterpartyDropdown.classList.remove('active');
    counterpartyTrigger.classList.remove('active');
    counterpartySearch.value = '';
    renderCounterpartyOptions(); // Reset filter
}

// Apply filters
function applyFilters() {
    filteredTransactions = allTransactions.filter(tx => {
        // Direction filter
        if (directionFilter.value && tx.direction !== directionFilter.value) {
            return false;
        }

        // Counterparty filter
        if (counterpartyFilter.value) {
            if (tx.from !== counterpartyFilter.value && tx.to !== counterpartyFilter.value) {
                return false;
            }
        }

        return true;
    });

    currentPage = 1;
    renderTransactions();
}

// Sort transactions
function sortTransactions(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'desc';
    }

    filteredTransactions.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        // Handle numeric fields
        if (field === 'timestamp') {
            aVal = Number(aVal);
            bVal = Number(bVal);
        }

        // Handle string fields
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (currentSort.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    renderTransactions();
}

// Render transactions table
function renderTransactions() {
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageTransactions = filteredTransactions.slice(startIndex, endIndex);

    filteredCount.textContent = filteredTransactions.length.toLocaleString();
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages || 1;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage >= totalPages;

    if (filteredTransactions.length === 0) {
        transactionsSection.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    transactionsSection.style.display = 'block';

    transactionsTBody.innerHTML = pageTransactions.map(tx => `
        <tr>
            <td>${tx.datetime}</td>
            <td>
                <div class="address-cell">
                    <span class="address" title="${tx.from}">${truncateAddress(tx.from)}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${tx.from}')" title="Copy address">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </td>
            <td>
                <div class="address-cell">
                    <span class="address" title="${tx.to}">${truncateAddress(tx.to)}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${tx.to}')" title="Copy address">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </td>
            <td><strong>${formatAmount(tx.amount)}</strong></td>
            <td><span class="badge" style="background: rgba(255,255,255,0.1);">${tx.token_symbol}</span></td>
            <td><span class="badge badge-${tx.direction}">${tx.direction}</span></td>
            <td class="explorer-cell">
                <a href="${getExplorerUrl(tx)}" target="_blank" class="explorer-link" title="View on ${tx.network === 'ERC' ? 'Etherscan' : 'TronScan'}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </td>
        </tr>
    `).join('');
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show a brief success notification
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = 'Address copied!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Make it globally available for onclick handlers
window.copyToClipboard = copyToClipboard;

// Export to CSV
function exportToCSV() {
    const headers = [
        'Date & Time', 'From', 'To', 'Amount', 
        'Token', 'Direction', 'Hash', 'Explorer URL'
    ];

    const rows = filteredTransactions.map(tx => [
        tx.datetime,
        tx.from,
        tx.to,
        tx.amount,
        tx.token_symbol,
        tx.direction,
        tx.hash,
        getExplorerUrl(tx)
    ]);

    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${walletAddress}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Helper functions
function truncateHash(hash) {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
}

function truncateAddress(address) {
    if (address.length <= 16) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
}

function formatAmount(amount) {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.000001) return num.toExponential(2);
    if (num < 1) return num.toFixed(6);
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function getExplorerUrl(tx) {
    if (tx.network === 'ERC') {
        return `https://etherscan.io/tx/${tx.hash}`;
    } else {
        return `https://tronscan.org/#/transaction/${tx.hash}`;
    }
}

function showLoading() {
    loadingState.style.display = 'block';
    summarySection.style.display = 'none';
    filtersSection.style.display = 'none';
    transactionsSection.style.display = 'none';
    errorState.style.display = 'none';
    emptyState.style.display = 'none';
}

function hideLoading() {
    loadingState.style.display = 'none';
}

function showContent() {
    summarySection.style.display = 'block';
    filtersSection.style.display = 'block';
    transactionsSection.style.display = 'block';
}

function showError(message) {
    hideLoading();
    errorState.style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

// Event listeners
applyFiltersBtn.addEventListener('click', applyFilters);

resetFiltersBtn.addEventListener('click', () => {
    timeFilter.value = '';
    directionFilter.value = '';
    counterpartyFilter.value = '';
    counterpartySelected.textContent = 'All Addresses';
    counterpartySearch.value = '';
    renderCounterpartyOptions();
    applyFilters();
});

backBtn.addEventListener('click', () => {
    window.location.href = '/';
});

headerBackBtn.addEventListener('click', () => {
    window.location.href = '/';
});

exportCsvBtn.addEventListener('click', exportToCSV);

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTransactions();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        renderTransactions();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Sort table headers
document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const field = th.dataset.sort;
        sortTransactions(field);
    });
});

// Time filter change
timeFilter.addEventListener('change', fetchTransactions);

// Custom dropdown handlers
counterpartyTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCounterpartyDropdown();
});

// Counterparty search - with safety check
if (counterpartySearch) {
    counterpartySearch.addEventListener('input', (e) => {
        renderCounterpartyOptions(e.target.value);
    });
    
    // Prevent dropdown from closing when clicking search input
    counterpartySearch.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!counterpartyDropdown.contains(e.target) && e.target !== counterpartyTrigger) {
        closeCounterpartyDropdown();
    }
});

// Initialize on load
init();
