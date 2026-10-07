
        // Global variables
        let currentUser = null;

        // Check if already logged in
        function checkLoginStatus() {
            const savedUser = sessionStorage.getItem('certificateAdmin');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                // Update login button
                document.getElementById('adminLoginBtn').textContent = 'Logout';
                document.getElementById('adminLoginBtn').classList.remove('btn-outline');
                document.getElementById('adminLoginBtn').classList.add('btn-secondary');
            }
        }

        // Global tab switching function
        window.switchTab = function(tabName) {
            console.log('🔄 Switching to tab:', tabName);
            
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all nav buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show target tab
            const targetTab = document.getElementById(tabName);
            if (targetTab) {
                targetTab.classList.add('active');
                console.log('✅ Tab activated:', tabName);
            } else {
                console.log('❌ Tab not found:', tabName);
            }
            
            // Activate corresponding nav button
            const targetNavBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
            if (targetNavBtn) {
                targetNavBtn.classList.add('active');
            }
        };

        // Admin Login/Logout functionality
        document.getElementById('adminLoginBtn').addEventListener('click', function() {
            if (currentUser) {
                // Logout
                currentUser = null;
                sessionStorage.removeItem('certificateAdmin');
                this.textContent = 'Admin Login';
                this.classList.remove('btn-secondary');
                this.classList.add('btn-outline');
                showNotification('Logged out successfully!', 'success');
                
                // If on generate or manage tab, switch to verify
                const activeTab = document.querySelector('.tab-content.active').id;
                if (activeTab === 'generate' || activeTab === 'manage') {
                    switchTab('verify');
                }
            } else {
                // Login
                const email = prompt('Enter Admin Email:');
                const password = prompt('Enter Admin Password:');
                
                if (email === 'mounvik@certificate.com' && password === 'mounvik@admin') {
                    currentUser = { 
                        email: email, 
                        name: 'Admin'
                    };
                    sessionStorage.setItem('certificateAdmin', JSON.stringify(currentUser));
                    this.textContent = 'Logout';
                    this.classList.remove('btn-outline');
                    this.classList.add('btn-secondary');
                    showNotification('Login successful!', 'success');
                } else {
                    showNotification('Invalid credentials!', 'error');
                }
            }
        });

        // Setup global navigation
       // Setup global navigation with login checks
document.querySelectorAll('.nav-btn, .footer-link').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const tabName = this.getAttribute('data-tab');
        
        if (tabName) {
            // Check if it's a protected tab and user is not logged in
            if ((tabName === 'generate' || tabName === 'manage') && !sessionStorage.getItem('certificateAdmin')) {
                // Show login prompt for protected tabs
                const email = prompt('Enter Admin Email:');
                const password = prompt('Enter Admin Password:');
                
                if (email === 'mounvik@certificate.com' && password === 'mounvik@admin') {
                    const currentUser = { 
                        email: email, 
                        name: 'Admin'
                    };
                    sessionStorage.setItem('certificateAdmin', JSON.stringify(currentUser));
                    
                    // Update login button
                    document.getElementById('adminLoginBtn').textContent = 'Logout';
                    document.getElementById('adminLoginBtn').classList.remove('btn-outline');
                    document.getElementById('adminLoginBtn').classList.add('btn-secondary');
                    
                    showNotification('Login successful!', 'success');
                    switchTab(tabName); // Switch only after successful login
                } else {
                    showNotification('Invalid credentials! Access denied.', 'error');
                    // Don't switch tab - stay on current tab
                    return;
                }
            } else {
                // For verify tab or already logged in users
                switchTab(tabName);
            }
        }
    });
});

        // Helper functions
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                    <span class="notification-message">${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        }

        function showLoading(show, message = 'Processing...') {
            const overlay = document.getElementById('loadingOverlay');
            const loadingText = overlay.querySelector('p');
            
            if (overlay) {
                if (show) {
                    if (loadingText) loadingText.textContent = message;
                    overlay.classList.remove('hidden');
                } else {
                    overlay.classList.add('hidden');
                }
            }
        }

        function setButtonLoading(button, loading) {
            if (!button) return;
            
            const textSpan = button.querySelector('.btn-text');
            const loader = button.querySelector('.btn-loader');
            
            if (textSpan && loader) {
                if (loading) {
                    textSpan.classList.add('hidden');
                    loader.classList.remove('hidden');
                    button.disabled = true;
                } else {
                    textSpan.classList.remove('hidden');
                    loader.classList.add('hidden');
                    button.disabled = false;
                }
            }
        }
        // Copyright notice toggle function
        function toggleCopyrightNotice() {
            const copyrightNotice = document.querySelector('.copyright-notice');
            const copyrightTrigger = document.querySelector('.copyright-trigger');
            
            copyrightNotice.classList.toggle('hidden');
            copyrightTrigger.classList.toggle('active');
            
            // Update arrow direction
            const arrow = copyrightTrigger.querySelector('.trigger-arrow');
            if (copyrightNotice.classList.contains('hidden')) {
                arrow.textContent = '▼';
            } else {
                arrow.textContent = '▲';
            }
        }

        // Global download function
        window.downloadCertificate = function(imageData, filename) {
            try {
                const link = document.createElement('a');
                link.href = imageData;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('✅ Downloaded:', filename);
                return true;
            } catch (error) {
                console.error('❌ Download error:', error);
                showNotification('Error downloading certificate. Please try again.', 'error');
                return false;
            }
        };

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            checkLoginStatus();
            console.log('🌐 Certificate Management System Initialized');
            
            // Set verify as default active tab
            switchTab('verify');
        });

   // Footer functionality
    document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for footer buttons
    const footerLinks = document.querySelectorAll('.footer-link[data-tab]');
    
    footerLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            // Add your tab switching logic here
            console.log(`Switching to tab: ${tab}`);
            
            // Example: You can dispatch a custom event
            // window.dispatchEvent(new CustomEvent('footerTabChange', { detail: { tab } }));
        });
    });
    
    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
 
// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidePanel = document.querySelector('.side-panel');
    const sidePanelOverlay = document.querySelector('.side-panel-overlay');
    const sidePanelClose = document.querySelector('.side-panel-close');
    const sidePanelBtns = document.querySelectorAll('.side-panel-btn');
    const sideAdminLoginBtn = document.getElementById('sideAdminLoginBtn');

    // Toggle side panel
    function toggleSidePanel() {
        hamburgerMenu.classList.toggle('active');
        sidePanel.classList.toggle('active');
        sidePanelOverlay.classList.toggle('active');
    }

    // Close side panel
    function closeSidePanel() {
        hamburgerMenu.classList.remove('active');
        sidePanel.classList.remove('active');
        sidePanelOverlay.classList.remove('active');
    }

    // Hamburger menu click
    hamburgerMenu.addEventListener('click', toggleSidePanel);

    // Close button click
    sidePanelClose.addEventListener('click', closeSidePanel);

    // Overlay click
    sidePanelOverlay.addEventListener('click', closeSidePanel);

    // Side panel button clicks
    sidePanelBtns.forEach(btn => {
        if (btn.id !== 'sideAdminLoginBtn') {
            btn.addEventListener('click', function() {
                const tab = this.getAttribute('data-tab');
                // Switch to the clicked tab
                switchTab(tab);
                closeSidePanel();
            });
        }
    });

    // Side panel admin login
    if (sideAdminLoginBtn) {
        sideAdminLoginBtn.addEventListener('click', function() {
            document.getElementById('adminLoginBtn').click();
            closeSidePanel();
        });
    }

    // Close side panel when window is resized to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidePanel();
        }
    });
});