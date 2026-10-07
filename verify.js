// verify.js - With enhanced LinkedIn certification sharing
document.addEventListener('DOMContentLoaded', function() {
    initializeVerify();
    // Add slight delay to ensure DOM is fully initialized
    setTimeout(handleUrlParameters, 100);
});

function initializeVerify() {
    const verifyTab = document.getElementById('verify');
    if (!verifyTab) return;

    verifyTab.innerHTML = `
        <div style="padding: 20px; max-width: 1400px; margin: 0 auto;">
            <h2 style="text-align: center; color: white; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">View Certificate</h2>
            <p style="text-align: center; color: rgba(255,255,255,0.9); margin-bottom: 30px;">Enter the 7-digit certificate code to verify or download Certificate</p>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px; max-width: 600px; margin-left: auto; margin-right: auto;">
                <input type="text" id="hashInput" placeholder="Enter 7-digit code" maxlength="7" 
                       style="flex: 1; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 16px; background: rgba(255,255,255,0.9); box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <button id="verifyBtn" onclick="handleVerify()" 
                        style="padding: 15px 30px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    View Certificate
                </button>
            </div>
            
            <div id="verifyResult" style="margin-top: 20px;"></div>
        </div>
    `;

    // Add enter key support
    document.getElementById('hashInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleVerify();
        }
    });

    // Auto-format input
    document.getElementById('hashInput').addEventListener('input', function(event) {
        let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length > 7) {
            value = value.substring(0, 7);
        }
        event.target.value = value;
    });
}

// URL parameter handling for direct verification
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    
    if (idParam) {
        // First, make sure we're on the verify tab
        if (!window.location.hash.includes('verify')) {
            // Switch to verify tab first
            window.location.hash = 'verify';
        }
        
        // Set the input value and trigger verification after a delay to ensure tab is loaded
        setTimeout(() => {
            const hashInput = document.getElementById('hashInput');
            if (hashInput) {
                hashInput.value = idParam.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 7);
                // Trigger verification after ensuring the tab is visible
                setTimeout(() => {
                    handleVerify();
                }, 300);
            }
        }, 200);
    }
}

// Listen for hash changes to handle URLs when user manually navigates
window.addEventListener('hashchange', function() {
    setTimeout(handleUrlParameters, 100);
});

async function handleVerify() {
    const hashInput = document.getElementById('hashInput');
    const verifyBtn = document.getElementById('verifyBtn');
    const resultDiv = document.getElementById('verifyResult');
    
    const hashCode = hashInput.value.trim().toUpperCase();
    
    if (!hashCode || hashCode.length !== 7) {
        alert('Please enter a valid 7-digit code');
        return;
    }

    // Update URL with the ID parameter - include the hash for verify tab
    const newUrl = `${window.location.origin}${window.location.pathname}?id=${hashCode}#verify`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    // Show loading
    verifyBtn.innerHTML = 'Verifying...';
    verifyBtn.disabled = true;
    resultDiv.innerHTML = '';

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxUwos-MSvfmMlFcouautb6Tzm-_fIPZca1oSAWU9dGEjRqh5eatCAQ2VK4rmNnRVzBBQ/exec');
        const data = await response.json();

        const certificate = data.find(row => row.HashCode && row.HashCode.toString().toUpperCase() === hashCode);

        if (certificate) {
            // Generate certificate preview
            const certificateImage = await generateCertificateImage(certificate);
            
            // Format timestamp for display
            const issueDate = certificate.Timestamp ? new Date(certificate.Timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : 'Not specified';
            
            // Format timestamp for LinkedIn (YYYY-MM-DD)
            const linkedInIssueDate = certificate.Timestamp ? 
                new Date(certificate.Timestamp).toISOString().split('T')[0] : 
                new Date().toISOString().split('T')[0];
            
            resultDiv.innerHTML = `
                <div class="certificate-verification-container">
                    <!-- Desktop Layout: Two Columns -->
                    <div class="desktop-layout">
                        <div class="details-section">
                            
                            
                            <!-- Certificate Details -->
                            <div class="details-card">
                                <div class="details-grid">
                                    <div class="detail-item">
                                        <span class="detail-label">Name:</span>
                                        <span class="detail-value">${certificate.Name}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Issue Date:</span>
                                        <span class="detail-value">${issueDate}</span>
                                    </div>
                                   <div class="detail-item">
                                        <span class="detail-label">Certificate ID:</span>
                                        <span class="detail-value">${certificate.HashCode}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="actions-section">
                                <div class="action-buttons">
                                    <button onclick="downloadVerifiedCertificate('${certificate.HashCode}', '${certificate.Name.replace(/'/g, "\\'")}', '${certificate.EventName.replace(/'/g, "\\'")}', '${certificate.CertificateType.replace(/'/g, "\\'")}', '${certificate.College.replace(/'/g, "\\'")}', '${certificate.RollNumber.replace(/'/g, "\\'")}', '${(certificate.DescriptionText || '').replace(/'/g, "\\'")}', '${certificate.Timestamp}')" 
                                            class="action-btn download-btn">
                                        📄 Download Certificate
                                    </button>
                                    
                                    <button onclick="shareCertificate('${certificate.HashCode}', '${certificate.Name.replace(/'/g, "\\'")}', '${certificate.EventName.replace(/'/g, "\\'")}')" 
                                            class="action-btn share-btn">
                                        📤 Share Certificate
                                    </button>
                                </div>
                                
                                <!-- Quick Share Buttons -->
                                <div class="social-share">
                                    <p class="share-title">Share on:</p>
                                    <div class="social-buttons">
                                        <button onclick="shareOnWhatsApp('${certificate.HashCode}', '${certificate.Name.replace(/'/g, "\\'")}', '${certificate.EventName.replace(/'/g, "\\'")}')" 
                                                class="social-btn whatsapp-btn">
                                            WhatsApp
                                        </button>
                                        
                                        <button onclick="addToLinkedInCertifications('${certificate.HashCode}', '${certificate.Name.replace(/'/g, "\\'")}', '${certificate.EventName.replace(/'/g, "\\'")}', '${linkedInIssueDate}')" 
                                                class="social-btn linkedin-cert-btn">
                                             Add to LinkedIn
                                        </button>
                                        
                                        <button onclick="copyCertificateLink('${certificate.HashCode}')" 
                                                class="social-btn copy-btn">
                                             Copy Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="preview-section">
                            <div class="certificate-frame">
                                <img id="certificatePreview" src="${certificateImage}" 
                                     class="certificate-image" 
                                     alt="Certificate Preview">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mobile Layout: Single Column -->
                    <div class="mobile-layout">
                        
                        
                        <!-- Certificate Preview -->
                        <div class="preview-section">
                            <div class="certificate-frame">
                                <img id="certificatePreview" src="${certificateImage}" 
                                     class="certificate-image" 
                                     alt="Certificate Preview">
                            </div>
                        </div>
                        
                        <!-- Certificate Details -->
                        <div class="details-card">
                            <div class="details-grid">
                                <div class="detail-item">
                                    <span class="detail-label">Name:</span>
                                    <span class="detail-value">${certificate.Name}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Issue Date:</span>
                                    <span class="detail-value">${issueDate}</span>
                                </div>
                                <div class="detail-item">
                                        <span class="detail-label">Certificate ID:</span>
                                        <span class="detail-value">${certificate.HashCode}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="actions-section">
                            <div class="action-buttons">
                                <button onclick="downloadVerifiedCertificate('${certificate.HashCode}', '${certificate.Name.replace(/'/g, "\\'")}', '${certificate.EventName.replace(/'/g, "\\'")}', '${certificate.CertificateType.replace(/'/g, "\\'")}', '${certificate.College.replace(/'/g, "\\'")}', '${certificate.RollNumber.replace(/'/g, "\\'")}', '${(certificate.DescriptionText || '').replace(/'/g, "\\'")}', '${certificate.Timestamp}')" 
                                        class="action-btn download-btn">
                                    📄 Download Certificate
                                </button>
                                
                                <button onclick="shareCertificate('${certificate.HashCode}', '${certificate.Name.replace(/'/g, "\\'")}', '${certificate.EventName.replace(/'/g, "\\'")}')" 
                                        class="action-btn share-btn">
                                    📤 Share Certificate
                                </button>
                            </div>
                            
                            <!-- Quick Share Buttons -->
                            <div class="social-share">
                                <p class="share-title">Share on:</p>
                                <div class="social-buttons">
                                    <button onclick="shareOnWhatsApp('${certificate.HashCode}', '${certificate.Name.replace(/'/g, "\\'")}', '${certificate.EventName.replace(/'/g, "\\'")}')" 
                                            class="social-btn whatsapp-btn">
                                        WhatsApp
                                    </button>
                                    
                                    <button onclick="addToLinkedInCertifications('${certificate.HashCode}', '${certificate.Name.replace(/'/g, "\\'")}', '${certificate.EventName.replace(/'/g, "\\'")}', '${linkedInIssueDate}')" 
                                            class="social-btn linkedin-cert-btn">
                                         Add to LinkedIn
                                    </button>
                                    
                                    <button onclick="copyCertificateLink('${certificate.HashCode}')" 
                                            class="social-btn copy-btn">
                                        🔗 Copy Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <style>
                    .certificate-verification-container {
                        background: transparent;
                        border-radius: 15px;
                        overflow: hidden;
                    }
                    
                    /* Desktop Layout */
                    .desktop-layout {
                        display: flex;
                        gap: 30px;
                        align-items: flex-start;
                    }
                    
                    .details-section {
                        flex: 1;
                        min-width: 0;
                    }
                    
                    .preview-section {
                        flex: 1;
                        min-width: 0;
                    }
                    
                    /* Mobile Layout */
                    .mobile-layout {
                        display: none;
                    }
                    
                    /* Common Styles */
                    .verification-header {
                        text-align: center;
                        margin-bottom: 30px;
                        background: rgba(255,255,255,0.95);
                        padding: 25px;
                        border-radius: 15px;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    }
                    
                    .success-icon {
                        font-size: 3rem;
                        margin-bottom: 15px;
                    }
                    
                    .success-title {
                        color: #28a745;
                        margin: 0 0 10px 0;
                        font-size: 1.5rem;
                    }
                    
                    .certificate-id {
                        color: #666;
                        margin: 0;
                        font-size: 1rem;
                    }
                    
                    .details-card {
                        background: rgba(255,255,255,0.95);
                        padding: 25px;
                        border-radius: 15px;
                        margin-bottom: 25px;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    }
                    
                    
                    .details-grid {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .detail-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding: 12px;
                        background: #f8f9fa;
                        border-radius: 8px;
                    }
                    
                    .detail-label {
                        font-weight: bold;
                        color: #333;
                        min-width: 120px;
                    }
                    
                    .detail-value {
                        color: #666;
                        text-align: right;
                        flex: 1;
                        margin-left: 15px;
                    }
                    
                    .certificate-frame {
                        
                        
                        padding: 15px 0px;
                        
                       
                    }
                    
                    .certificate-image {
                        width: 100%;
                        height: auto;
                        border-radius: 8px;
                        display: block;
                    }
                    
                    .actions-section {
                        background: rgba(255,255,255,0.95);
                        padding: 25px;
                        border-radius: 15px;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    }
                    
                    .action-buttons {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 25px;
                        flex-wrap: wrap;
                    }
                    
                    .action-btn {
                        flex: 1;
                        min-width: 200px;
                        padding: 15px 20px;
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    }
                    
                    .action-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                    }
                    
                    .download-btn {
                        background: linear-gradient(135deg, #28a745, #20c997);
                        color: white;
                        box-shadow: 0 4px 15px rgba(40,167,69,0.3);
                    }
                    
                    .share-btn {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        box-shadow: 0 4px 15px rgba(102,126,234,0.3);
                    }
                    
                    .social-share {
                        text-align: center;
                    }
                    
                    .share-title {
                        color: #666;
                        margin-bottom: 15px;
                        font-weight: bold;
                    }
                    
                    .social-buttons {
                        display: flex;
                        gap: 10px;
                        justify-content: center;
                        flex-wrap: wrap;
                    }
                    
                    .social-btn {
                        padding: 12px 20px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: white;
                    }
                    
                    .social-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    }
                    
                    .whatsapp-btn {
                        background: #25D366;
                    }
                    
                    .linkedin-cert-btn {
                        background: linear-gradient(135deg, #0077B5, #00A0DC);
                    }
                    
                    .copy-btn {
                        background: #6c757d;
                    }
                    
                    .linkedin-icon {
                        font-size: 16px;
                    }
                    
                    /* Responsive Design */
                    @media (max-width: 768px) {
                        .desktop-layout {
                            display: none;
                        }
                        
                        .mobile-layout {
                            display: block;
                        }
                        
                        .action-buttons {
                            flex-direction: column;
                        }
                        
                        .action-btn {
                            min-width: auto;
                            width: 100%;
                        }
                        
                        .social-buttons {
                            flex-direction: column;
                        }
                        
                        .social-btn {
                            width: 100%;
                            justify-content: center;
                        }
                        
                        .detail-item {
                            flex-direction: column;
                            align-items: flex-start;
                            gap: 5px;
                        }
                        
                        .detail-value {
                            text-align: left;
                            margin-left: 0;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .verification-header,
                        .details-card,
                        .actions-section {
                            padding: 20px;
                        }
                        
                        .certificate-frame {
                            padding: 10px;
                        }
                        
                        .success-title {
                            font-size: 1.3rem;
                        }
                    }
                </style>
            `;
        } else {
            resultDiv.innerHTML = `
                <div style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">❌</div>
                    <h3 style="color: #dc3545; margin: 0 0 15px 0;">Certificate Not Found</h3>
                    <p style="color: #666; margin: 0 0 20px 0;">The certificate with code <strong>${hashCode}</strong> was not found in our system.</p>
                    <p style="color: #999; font-size: 14px;">Please check the code and try again.</p>
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = `
            <div style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
                <h3 style="color: #fd7e14; margin: 0 0 15px 0;">Verification Error</h3>
                <p style="color: #666; margin: 0 0 10px 0;">Unable to verify certificate at this time.</p>
                <p style="color: #999; font-size: 14px;">Error: ${error.message}</p>
            </div>
        `;
    } finally {
        verifyBtn.innerHTML = 'View Certificate';
        verifyBtn.disabled = false;
    }
}

// Share certificate function
function shareCertificate(hashCode, name, eventName) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${hashCode}#verify`;
    const shareText = `🎉 I just verified my certificate for "${eventName}"! Check out my achievement: ${shareUrl}`;
    
    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: `Certificate Verification - ${name}`,
            text: shareText,
            url: shareUrl
        }).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

// Fallback share method
function fallbackShare(shareText) {
    // Create a temporary input to copy text
    const tempInput = document.createElement('input');
    tempInput.value = shareText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showNotification('Share link copied to clipboard!', 'success');
}

// WhatsApp sharing
function shareOnWhatsApp(hashCode, name, eventName) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${hashCode}#verify`;
    const shareText = `🎉 I just verified my certificate for "${eventName}"! Check out my achievement: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
}

// Enhanced LinkedIn Certification Addition
function addToLinkedInCertifications(hashCode, name, eventName, issueDate, organization = 'PHOTON CLUB VITAP') {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${hashCode}#verify`;
    
    // Create certification data
    const certificationData = {
        name: `${eventName} Certificate`,
        organization: organization,
        issueDate: issueDate,
        credentialID: hashCode,
        credentialURL: shareUrl
    };
    
    // LinkedIn Certification URL with pre-filled data
    const linkedInUrl = `https://www.linkedin.com/profile/add?` +
        `_type=certifications&` +
        `name=${encodeURIComponent(certificationData.name)}&` +
        `organizationName=${encodeURIComponent(certificationData.organization)}&` +
        `issueYear=${new Date(certificationData.issueDate).getFullYear()}&` +
        `issueMonth=${new Date(certificationData.issueDate).getMonth() + 1}&` +
        `certUrl=${encodeURIComponent(certificationData.credentialURL)}&` +
        `certId=${encodeURIComponent(certificationData.credentialID)}`;
    
    // Open LinkedIn in popup window
    const popupWidth = 800;
    const popupHeight = 700;
    const left = (screen.width - popupWidth) / 2;
    const top = (screen.height - popupHeight) / 2;
    
    const popup = window.open(
        linkedInUrl,
        'linkedin-certification',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    if (popup) {
        // Provide helpful instructions
        setTimeout(() => {
            showNotification(
                `LinkedIn certification form opened! 
Fill in the details and click "Save" to add to your profile.`, 
                'info', 
                5000
            );
        }, 1000);
    } else {
        // If popup blocked, open in new tab and show detailed instructions
        window.open(linkedInUrl, '_blank');
        
        // Show comprehensive instructions
        const certificationDetails = `
To add this certificate to your LinkedIn Certifications:

1. Go to your LinkedIn Profile
2. Click "Add profile section" → "Recommended" → "Add licenses & certifications"
3. Fill in the form with these details:

Certificate Name: ${eventName} Certificate
Issuing Organization: ${organization}
Issue Date: ${new Date(issueDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
})}
Credential ID: ${hashCode}
Credential URL: ${shareUrl}

4. Click "Save" to add to your profile

These details have been copied to your clipboard for easy reference.
        `.trim();
        
        // Copy details to clipboard
        navigator.clipboard.writeText(certificationDetails).then(() => {
            showNotification(
                'Certification details copied to clipboard! LinkedIn opened in new tab.', 
                'success'
            );
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = certificationDetails;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification(
                'Certification details copied to clipboard! LinkedIn opened in new tab.', 
                'success'
            );
        });
    }
}

// Copy certificate link
function copyCertificateLink(hashCode) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${hashCode}#verify`;
    
    // Create a temporary input to copy text
    const tempInput = document.createElement('input');
    tempInput.value = shareUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showNotification('Certificate link copied to clipboard!', 'success');
}

// Updated certificate generation function with issue date and QR code
async function generateCertificateImage(certData) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 1900;
        canvas.height = 1300;
        
        // Load the template image
        const templateImage = new Image();
        templateImage.crossOrigin = 'anonymous';
        
        templateImage.onload = async function() {
            try {
                // Draw the template image
                ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
                
                // Configure text styles
                ctx.textAlign = 'center';
                
                // Add Certificate Type (below "CERTIFICATE" text)
                ctx.fillStyle = '#fff';
                ctx.font = 'italic 50px "Playfair Display", serif';
                ctx.fillText(`FOR ${certData.CertificateType.toUpperCase()}.`, canvas.width / 2, 330);

                // Add Name (centered, large font)
                ctx.fillStyle = '#D4AF37';
                ctx.font = '63px "Cinzel", serif';
                ctx.fillText(certData.Name.toUpperCase(), canvas.width / 2, 610);

                // Add Description Text (below name)
                ctx.fillStyle = '#fff';
                ctx.font = '27px "Open Sans", sans-serif';

                const descriptionText = certData.DescriptionText || "for their active participation and valuable contribution in";
                const maxWidth = 1414;
                wrapText(ctx, descriptionText, canvas.width / 2, 700, maxWidth, 55);

                // Add Issue Date (bottom left)
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 24px "Open Sans", sans-serif';
                ctx.textAlign = 'left';
                
                const issueDate = certData.Timestamp ? 
                    new Date(certData.Timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'Issue Date: Not Specified';
                
                ctx.fillText(`Issued on: ${issueDate}`, 100, canvas.height - 100);

                // Add Hash Code (bottom center) - WHITE COLOR
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '27px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`Certificate ID: ${certData.HashCode}`, canvas.width / 2, canvas.height - 100);

                // Add Verification Link - WHITE COLOR
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '27px "Open Sans", sans-serif';
                ctx.fillText('Verify at: https://photonclub-certificate-system.netlify.app/', canvas.width / 2, canvas.height - 55);

                // Generate and add QR Code (bottom right) - 2x larger (240px)
                const qrCodeImage = await generateQRCode(certData.HashCode);
                const qrSize = 240; // 2x larger than before
                const qrX = canvas.width - qrSize - 80; // Adjusted position for larger size
                const qrY = canvas.height - qrSize - 70;
                
                if (qrCodeImage) {
                    ctx.drawImage(qrCodeImage, qrX, qrY, qrSize, qrSize);

                    // Add QR code label
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 20px "Open Sans", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('Scan to Verify', qrX + qrSize/2, qrY + qrSize + 30);
                }

                // Convert to data URL
                const imageData = canvas.toDataURL('image/png');
                resolve(imageData);
                
            } catch (error) {
                reject(error);
            }
        };
        
        templateImage.onerror = function() {
            reject(new Error('Failed to load certificate template'));
        };
        
        templateImage.src = 'https://raw.githubusercontent.com/mounvikkarnati/mail-assets/2fd041c0897b537b8c6e9a9be646bba7f15122b2/Black%20Gold%20Elegant%20Appreciation%20Certificate.png';
    });
}

// SIMPLE AND RELIABLE QR Code generation using external service
async function generateQRCode(hashCode) {
    return new Promise((resolve) => {
        const verifyUrl = `${window.location.origin}${window.location.pathname}?id=${hashCode}#verify`;
        
        // Use Google Charts API for reliable QR codes
        const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=L|0&chl=${encodeURIComponent(verifyUrl)}`;
        
        const qrImage = new Image();
        qrImage.crossOrigin = 'anonymous';
        
        qrImage.onload = function() {
            resolve(qrImage);
        };
        
        qrImage.onerror = function() {
            // Fallback: Try QuickChart API
            const fallbackQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=300`;
            const fallbackImage = new Image();
            fallbackImage.crossOrigin = 'anonymous';
            
            fallbackImage.onload = function() {
                resolve(fallbackImage);
            };
            
            fallbackImage.onerror = function() {
                // Final fallback: Create a simple text-based QR placeholder
                console.log('QR code generation failed, using placeholder');
                resolve(createQRPlaceholder(verifyUrl));
            };
            
            fallbackImage.src = fallbackQrUrl;
        };
        
        qrImage.src = qrUrl;
    });
}

// Create a simple QR placeholder as final fallback
function createQRPlaceholder(url) {
    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Black border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, size - 20, size - 20);
    
    // Text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR CODE', size/2, size/2 - 10);
    ctx.font = '12px Arial';
    ctx.fillText('Scan with camera', size/2, size/2 + 10);
    ctx.font = '10px Arial';
    ctx.fillText(url.substring(0, 30), size/2, size/2 + 30);
    ctx.fillText(url.substring(30), size/2, size/2 + 45);
    
    const image = new Image();
    image.src = canvas.toDataURL('image/png');
    return image;
}

// Alternative: Use a reliable QR code library with proper implementation
function generateQRCodeWithLibrary(text) {
    return new Promise((resolve) => {
        // Check if QRCode is available
        if (typeof QRCode !== 'undefined') {
            try {
                const qrCanvas = document.createElement('canvas');
                QRCode.toCanvas(qrCanvas, text, {
                    width: 300,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    },
                    errorCorrectionLevel: 'M'
                }, function(error) {
                    if (error) {
                        console.error('QRCode.js error:', error);
                        resolve(null);
                    } else {
                        const image = new Image();
                        image.onload = function() {
                            resolve(image);
                        };
                        image.src = qrCanvas.toDataURL('image/png');
                    }
                });
            } catch (error) {
                console.error('QRCode.js failed:', error);
                resolve(null);
            }
        } else {
            resolve(null);
        }
    });
}

// Helper function to wrap text
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);

    // Draw the lines
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + (i * lineHeight));
    }
    
    return lines;
}

// Updated download function with timestamp parameter
async function downloadVerifiedCertificate(hashCode, name, eventName, certificateType, college, rollNumber, descriptionText, timestamp) {
    // Show loading
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '🔄 Generating...';
    button.disabled = true;

    try {
        // Create certificate data object with timestamp
        const certData = {
            HashCode: hashCode,
            Name: name,
            EventName: eventName,
            CertificateType: certificateType,
            College: college,
            RollNumber: rollNumber,
            DescriptionText: descriptionText || "for their active participation and valuable contribution in",
            Timestamp: timestamp
        };

        // Generate certificate image using the updated function
        const imageData = await generateCertificateImage(certData);
        
        // Show format selection dialog
        const format = await showFormatSelection();
        if (!format) {
            button.innerHTML = originalText;
            button.disabled = false;
            return;
        }
        
        let finalData = imageData;
        let finalFilename = `Certificate_${hashCode}_${name.replace(/\s+/g, '_')}`;
        
        if (format === 'pdf') {
            // Convert to PDF
            finalData = await convertImageToPDF(imageData);
            finalFilename += '.pdf';
        } else {
            finalFilename += '.png';
        }
        
        // Download using the global download function
        if (window.downloadCertificate) {
            window.downloadCertificate(finalData, finalFilename);
        } else {
            // Fallback download
            const link = document.createElement('a');
            link.href = finalData;
            link.download = finalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        showNotification('Certificate downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Error generating certificate. Please try again.', 'error');
    } finally {
        // Restore button
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Helper function to show format selection dialog
function showFormatSelection() {
    return new Promise((resolve) => {
        // Remove any existing overlay first
        const existingOverlay = document.querySelector('.format-selection-overlay');
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
        }

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'format-selection-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            min-width: 300px;
        `;
        
        dialog.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: #333;">Select Download Format</h3>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem;">
                <button class="format-btn png-btn" style="padding: 0.75rem 1.5rem; border: 2px solid #007bff; background: #007bff; color: white; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    📄 PNG
                </button>
                <button class="format-btn pdf-btn" style="padding: 0.75rem 1.5rem; border: 2px solid #dc3545; background: #dc3545; color: white; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    📋 PDF
                </button>
            </div>
            <button class="cancel-btn" style="padding: 0.5rem 1rem; border: 1px solid #6c757d; background: transparent; color: #6c757d; border-radius: 5px; cursor: pointer;">
                Cancel
            </button>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Add event listeners
        const pngBtn = overlay.querySelector('.png-btn');
        const pdfBtn = overlay.querySelector('.pdf-btn');
        const cancelBtn = overlay.querySelector('.cancel-btn');

        const cleanup = () => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        };

        pngBtn.onclick = () => {
            cleanup();
            resolve('png');
        };

        pdfBtn.onclick = () => {
            cleanup();
            resolve('pdf');
        };

        cancelBtn.onclick = () => {
            cleanup();
            resolve(null);
        };

        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve(null);
            }
        };
    });
}

// Function to convert image to PDF (basic implementation)
// Function to convert image to PDF using jsPDF
async function convertImageToPDF(imageData) {
    return new Promise((resolve, reject) => {
        try {
            // Check if jsPDF is available
            if (typeof jspdf === 'undefined') {
                // Load jsPDF dynamically if not available
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = () => {
                    createPDF(imageData, resolve, reject);
                };
                script.onerror = () => reject(new Error('Failed to load PDF library'));
                document.head.appendChild(script);
            } else {
                createPDF(imageData, resolve, reject);
            }
        } catch (error) {
            reject(error);
        }
    });
}

// Helper function to create PDF
// Helper function to create PDF
// Function to convert image to PDF using jsPDF
async function convertImageToPDF(imageData) {
    return new Promise((resolve, reject) => {
        try {
            // Check if jsPDF is already loaded
            if (typeof jspdf !== 'undefined' && window.jspdf) {
                createPDF(imageData, resolve, reject);
            } else {
                // For iOS, use a more reliable approach
                loadPDFLibrary().then(() => {
                    createPDF(imageData, resolve, reject);
                }).catch(reject);
            }
        } catch (error) {
            reject(error);
        }
    });
}

// Helper function to load PDF library
function loadPDFLibrary() {
    return new Promise((resolve, reject) => {
        // Check if already loading or loaded
        if (window.pdfLibraryLoading) {
            const checkLoaded = setInterval(() => {
                if (typeof jspdf !== 'undefined' && window.jspdf) {
                    clearInterval(checkLoaded);
                    resolve();
                }
            }, 100);
            return;
        }

        window.pdfLibraryLoading = true;
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.integrity = 'sha512-qZvrmS2ekKPF2mSznTQsxqPgnpkI4DNTlrdUmTzrDgektczlKNRRhy5X5AAOnx5S09ydFYWWNSfcEqDTTHgtNA==';
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
            window.pdfLibraryLoading = false;
            // Wait a bit for iOS to fully initialize
            setTimeout(resolve, 100);
        };
        
        script.onerror = () => {
            window.pdfLibraryLoading = false;
            reject(new Error('Failed to load PDF library'));
        };
        
        document.head.appendChild(script);
    });
}

// Helper function to create PDF
function createPDF(imageData, resolve, reject) {
    try {
        // Add timeout for iOS
        const timeout = setTimeout(() => {
            reject(new Error('PDF generation timeout'));
        }, 10000);

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const img = new Image();
        img.onload = function() {
            try {
                clearTimeout(timeout);
                // A4 landscape dimensions in mm
                const pageWidth = 297;
                const pageHeight = 210;
                
                // Make image fill the entire page
                const finalWidth = pageWidth;
                const finalHeight = pageHeight;
                
                // Add image to PDF
                pdf.addImage(img, 'PNG', 0, 0, finalWidth, finalHeight);
                
                // For iOS, use blob instead of data URL
                if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                    const pdfBlob = pdf.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    resolve(pdfUrl);
                } else {
                    const pdfDataUrl = pdf.output('datauristring');
                    resolve(pdfDataUrl);
                }
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        };
        
        img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Failed to load image for PDF conversion'));
        };
        
        img.src = imageData;
        
    } catch (error) {
        clearTimeout(timeout);
        reject(error);
    }
}

// Fallback for showNotification if not defined
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message, type = 'info') {
        alert(`${type.toUpperCase()}: ${message}`);
    };
}

// Add QRCode library dynamically if not present
if (typeof QRCode === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
    script.onload = function() {
        console.log('QRCode library loaded successfully');
    };
    script.onerror = function() {
        console.log('Failed to load QRCode library, using fallback methods');
    };
    document.head.appendChild(script);
}