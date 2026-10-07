// ======================================
// 📄 manage.js — Secure Admin Management
// ======================================

// Global variables for management
let certificatesData = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeManageApp();
});

// Initialize the management app
function initializeManageApp() {
    console.log('🚀 Initializing Manage App...');
    
    // Check if user is logged in
    const isLoggedIn = checkManageLoginStatus();
    
    // Setup navigation for manage tab
    setupManageNavigation();
    
    // Setup event listeners
    setupManageEventListeners();

    // If logged in, show sheets button
    if (isLoggedIn) {
        showSheetsAccessButton();
    }
    
    console.log('✅ Manage App Initialized');
}

// Check admin login status
function checkManageLoginStatus() {
    const savedUser = sessionStorage.getItem('certificateAdmin');
    if (!savedUser) {
        console.log('🔒 Admin login required for management');
        return false;
    }
    return true;
}

// Setup navigation for manage tab
function setupManageNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn[data-tab="manage"]');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!checkManageLoginStatus()) {
                showNotification('Please login as admin to access management features', 'error');
                window.switchTab('verify');
                return;
            }
            switchToManageTab();
        });
    });
}

// Setup event listeners for manage tab
function setupManageEventListeners() {
    console.log('🔧 Setting up manage event listeners...');
    
    // Use event delegation for dynamic elements
    document.addEventListener('click', function(e) {
        // Check if search button was clicked
        if (e.target && e.target.id === 'searchCertificateBtn') {
            console.log('🔍 Search button clicked');
            handleCertificateSearch();
        }
        
        // Check if go to sheets button was clicked
        if (e.target && e.target.id === 'goToSheetsBtn') {
            console.log('📊 Go to Sheets button clicked');
            verifySecondaryPassword();
        }
    });
    
    // Add enter key support for search input
    document.addEventListener('keypress', function(e) {
        if (e.target && e.target.id === 'certificateSearchInput' && e.key === 'Enter') {
            console.log('↵ Enter key pressed in search input');
            handleCertificateSearch();
        }
    });
}

// Handle certificate search and open sheets
function handleCertificateSearch() {
    console.log('🎯 Handling certificate search...');
    
    if (!checkManageLoginStatus()) {
        showNotification('Please login as admin first', 'error');
        return;
    }

    const searchInput = document.getElementById('certificateSearchInput');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    console.log('Search term:', searchTerm);
    
    if (!searchTerm) {
        showNotification('Please enter a certificate ID to search', 'error');
        if (searchInput) searchInput.focus();
        return;
    }

    // Verify secondary password before accessing sheets
    verifySecondaryPasswordForSearch(searchTerm);
}

// Verify password and open sheets with search
function verifySecondaryPasswordForSearch(searchTerm) {
    console.log('🔐 Verifying password for search...');
    
    const password = prompt('Enter secondary password to search in Sheets:');
    if (password === 'mounvik@karnati') {
        openSheetsWithSearch(searchTerm);
    } else if (password !== null) {
        showNotification('Incorrect password. Access denied.', 'error');
    }
}

// Open Google Sheets and attempt to search
function openSheetsWithSearch(searchTerm) {
    console.log('📊 Opening sheets with search:', searchTerm);
    
    const sheetsUrl = 'https://docs.google.com/spreadsheets/d/1jdXF0AsBKveJigbIzdLHW39rjQg8pdN6TldPjQH1Ol8';
    
    // Open sheets in new tab
    const sheetsWindow = window.open(sheetsUrl, '_blank');
    
    if (!sheetsWindow) {
        showNotification('Popup blocked! Please allow popups for this site.', 'error');
        return;
    }
    
    showNotification(`Opening sheets and searching for: ${searchTerm}`, 'info');
    
    // Wait for sheets to load then show search instructions
    setTimeout(() => {
        if (sheetsWindow && !sheetsWindow.closed) {
            // Show alert with search instructions
            sheetsWindow.alert(`Please use Ctrl+F (Cmd+F on Mac) and search for: ${searchTerm}`);
        } else {
            // Fallback if we can't show alert in the new window
            alert(`Sheets opened! Please use Ctrl+F (Cmd+F on Mac) and search for: ${searchTerm}`);
        }
    }, 3000);
}

// Switch to Manage tab
function switchToManageTab() {
    console.log('🧩 Switched to Manage tab');
    
    // Create search interface if it doesn't exist
    createSearchInterface();
    
    // Focus on search input
    setTimeout(() => {
        const searchInput = document.getElementById('certificateSearchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }, 100);
}

// Create search interface dynamically
function createSearchInterface() {
    const manageContainer = document.querySelector('.manage-container');
    if (!manageContainer) {
        console.error('❌ Manage container not found');
        return;
    }
    
    // Check if search section already exists
    let searchSection = document.getElementById('searchCertificateSection');
    if (!searchSection) {
        searchSection = document.createElement('div');
        searchSection.id = 'searchCertificateSection';
        searchSection.className = 'search-section';
        searchSection.innerHTML = `
            <h3>Search Certificate in Sheets</h3>
            <div class="search-input-group">
                <input 
                    type="text" 
                    id="certificateSearchInput" 
                    placeholder="Enter Certificate ID to search..."
                    class="search-input"
                >
                <button 
                    id="searchCertificateBtn" 
                    class="search-btn"
                >
                    🔍 Search in Sheets
                </button>
            </div>
            <p class="help-text">
                This will open Google Sheets and search for the certificate ID. Use Ctrl+F to find the certificate.
            </p>
        `;
        manageContainer.appendChild(searchSection);
        console.log('✅ Search interface created');
    }
}

// ================================
// 🔐 Secure Sheets Access Section
// ================================

// Create and show "Go to Sheets" button after admin login
function showSheetsAccessButton() {
    if (!checkManageLoginStatus()) return;

    let existingButton = document.getElementById('goToSheetsBtn');
    if (existingButton) return;

    const manageContainer = document.querySelector('.manage-container') || document.body;

    const btn = document.createElement('button');
    btn.id = 'goToSheetsBtn';
    btn.textContent = '📊 Go to Sheets';
    btn.classList.add('go-to-sheets-btn');

    manageContainer.appendChild(btn);
    console.log('✅ Sheets access button created');
}

// Ask for secondary password before redirecting
function verifySecondaryPassword() {
    if (!checkManageLoginStatus()) {
        showNotification('Please login as admin first', 'error');
        return;
    }

    const password = prompt('Enter secondary password to access Sheets:');
    if (password === 'mounvik@karnati') {
        window.open('https://docs.google.com/spreadsheets/d/1jdXF0AsBKveJigbIzdLHW39rjQg8pdN6TldPjQH1Ol8', '_blank');
    } else if (password !== null) {
        showNotification('Incorrect password. Access denied.', 'error');
    }
}

// ================================
// 💬 Utility: showNotification
// ================================
function showNotification(message, type = 'info') {
    if (typeof window.showNotification !== 'function') {
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }
    window.showNotification(message, type);
}