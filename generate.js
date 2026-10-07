// Global variables for generation
let uploadedData = [];
let generatedCertificates = [];

// Google Forms Configuration
const FORM_ID = '1FAIpQLSdxPNopSBnXgJ9-Dkp_D3_w-oxU1C-5d4xRM-4g_3x5amqDcQ';
const FORM_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

// Field IDs from your Google Form
const FIELD_IDS = {
    hashCode: 'entry.1793177453',
    name: 'entry.61164294',
    rollNumber: 'entry.1783727017',
    college: 'entry.1808287040',
    eventName: 'entry.201083749',
    certificateType: 'entry.910665640',
    position: 'entry.955519423',
    generatedBy: 'entry.233497903',
    descriptionText: 'entry.1130001484'
};

// Certificate Template Image (GitHub Raw URL)
const CERTIFICATE_TEMPLATE_URL = 'https://raw.githubusercontent.com/mounvikkarnati/mail-assets/2fd041c0897b537b8c6e9a9be646bba7f15122b2/Black%20Gold%20Elegant%20Appreciation%20Certificate.png';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeGenerateApp();
});

function initializeGenerateApp() {
    console.log('🚀 Initializing Generate App...');
    setupGenerateNavigation();
    console.log('✅ Generate App Initialized');
}

function setupGenerateNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn[data-tab="generate"]');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            switchToGenerateTab();
        });
    });
}

function switchToGenerateTab() {
    // Check if user is logged in
    const savedUser = sessionStorage.getItem('certificateAdmin');
    if (!savedUser) {
        // Show login prompt
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
            showAdminPanel();
        } else {
            showNotification('Invalid credentials! Please login as admin.', 'error');
            return; // Don't switch tab if login failed
        }
    } else {
        showAdminPanel();
    }
    
    // Switch tabs
    window.switchTab('generate');
}

function showAdminPanel() {
    console.log('👨‍💼 Showing admin panel...');
    const generateTab = document.getElementById('generate');
    if (!generateTab) {
        console.log('❌ Generate tab not found');
        return;
    }
    
    const currentUser = JSON.parse(sessionStorage.getItem('certificateAdmin'));
    
    generateTab.innerHTML = `
        <div class="admin-panel">
            <h2>Admin Panel - Certificate Generation</h2>
            <div class="admin-welcome">
                <div>
                    <p>Welcome, <strong>${currentUser.name}</strong>!</p>
                    <p class="user-email">${currentUser.email}</p>
                </div>
                <button class="btn btn-secondary" id="generateLogoutBtn">Logout</button>
            </div>
            
            <div class="template-preview">
                <h3>📋 Certificate Template Preview</h3>
                <div class="template-image">
                    <img src="${CERTIFICATE_TEMPLATE_URL}" alt="Certificate Template" style="max-width: 400px; border: 1px solid #ddd; border-radius: 8px;">
                    <p class="template-note">This template will be used for all certificates</p>
                </div>
            </div>
            
            <div class="generation-steps">
                <div class="step">
                    <h3>📊 Step 1: Upload Excel File</h3>
                    <p>Upload Excel sheet with participant details (.xlsx, .xls)</p>
                    <div class="upload-area" id="excelUploadArea">
                        <input type="file" id="excelFile" accept=".xlsx,.xls" class="file-input" hidden>
                        <div class="upload-placeholder">
                            <span class="upload-icon">📄</span>
                            <p>Click to upload Excel file</p>
                            <small>Supported formats: .xlsx, .xls</small>
                        </div>
                        <div class="file-info" id="excelFileInfo"></div>
                    </div>
                    <div id="excelPreview" class="data-preview hidden"></div>
                </div>
                
                <div class="step">
                    <h3>🎨 Step 2: Certificate Description</h3>
                    <p>Add text that appears below recipient's name on certificate</p>
                    <input type="text" id="descriptionText" placeholder="e.g., for their outstanding performance in" class="description-input">
                    <small>This text will appear below the name on the certificate</small>
                </div>
                
                <div class="step">
                    <h3>⚡ Step 3: Generate Certificates</h3>
                    <p>Create certificates with unique hash codes</p>
                    <button class="btn btn-primary" id="generateBtn" disabled>
                        <span class="btn-text">Generate Certificates</span>
                        <div class="btn-loader hidden"></div>
                    </button>
                    <div class="generation-info">
                        <p><strong>Required Excel Columns:</strong></p>
                        <ul>
                            <li>Name (Required)</li>
                            <li>RollNumber (Required)</li>
                            <li>College (Required)</li>
                            <li>EventName (Required)</li>
                            <li>CertificateType (Required)</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div id="generationResult" class="generation-result hidden"></div>
        </div>
    `;
    
    setupFileUploads();
    document.getElementById('generateBtn').addEventListener('click', generateCertificates);
    document.getElementById('generateLogoutBtn').addEventListener('click', logoutFromGenerate);
    
    console.log('✅ Admin panel setup complete');
}

function setupFileUploads() {
    console.log('🔧 Setting up file uploads...');
    
    // Excel file upload
    const excelUploadArea = document.getElementById('excelUploadArea');
    const excelFileInput = document.getElementById('excelFile');
    
    if (excelUploadArea && excelFileInput) {
        excelUploadArea.addEventListener('click', () => excelFileInput.click());
        excelFileInput.addEventListener('change', handleExcelUpload);
        console.log('✅ File upload setup complete');
    } else {
        console.log('❌ File upload elements not found');
    }
}

// Handle Excel File Upload
function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📁 Processing Excel file:', file.name);
    
    const fileInfo = document.getElementById('excelFileInfo');
    fileInfo.innerHTML = `
        <div class="file-details">
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${(file.size / 1024).toFixed(1)} KB)</span>
            <button class="remove-file" onclick="removeExcelFile()">×</button>
        </div>
    `;
    
    document.getElementById('excelUploadArea').classList.add('has-file');
    showLoading(true, 'Reading Excel file...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                throw new Error('Excel file is empty');
            }
            
            console.log('📊 Excel data loaded:', jsonData.length, 'records');
            
            // Validate data structure
            validateExcelData(jsonData);
            uploadedData = jsonData;
            
            // Show preview
            showExcelPreview(jsonData);
            
            // Enable generate button
            checkGenerateReady();
            
        } catch (error) {
            console.error('❌ Excel read error:', error);
            showNotification('Error reading Excel file: ' + error.message, 'error');
            removeExcelFile();
        } finally {
            showLoading(false);
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Validate Excel Data Structure
function validateExcelData(data) {
    const requiredFields = ['Name', 'RollNumber', 'College', 'EventName', 'CertificateType'];
    const firstRow = data[0];
    
    const missingFields = requiredFields.filter(field => !(field in firstRow));
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
    }
    
    // Check for empty rows
    const validRows = data.filter(row => 
        row.Name && row.RollNumber && row.College && row.EventName && row.CertificateType
    );
    
    if (validRows.length !== data.length) {
        console.log('⚠️ Some rows have missing data');
        showNotification(`Warning: ${data.length - validRows.length} rows have missing required data and will be skipped.`, 'info');
    }
    
    return validRows;
}

// Show Excel Data Preview
function showExcelPreview(data) {
    const previewDiv = document.getElementById('excelPreview');
    const limitedData = data.slice(0, 5); // Show first 5 rows
    
    let previewHTML = `
        <h4>Data Preview (${data.length} records found)</h4>
        <div class="table-container">
            <table class="preview-table">
                <thead>
                    <tr>
                        ${Object.keys(limitedData[0]).map(key => `<th>${key}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${limitedData.map(row => `
                        <tr>
                            ${Object.values(row).map(value => `<td>${value || ''}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ${data.length > 5 ? `<p class="preview-note">... and ${data.length - 5} more records</p>` : ''}
    `;
    
    previewDiv.innerHTML = previewHTML;
    previewDiv.classList.remove('hidden');
}

// Remove Excel File
function removeExcelFile() {
    document.getElementById('excelFile').value = '';
    document.getElementById('excelFileInfo').innerHTML = '';
    document.getElementById('excelUploadArea').classList.remove('has-file');
    document.getElementById('excelPreview').classList.add('hidden');
    document.getElementById('excelPreview').innerHTML = '';
    uploadedData = [];
    checkGenerateReady();
    console.log('🗑️ Excel file removed');
}

// Check if ready to generate
function checkGenerateReady() {
    const generateBtn = document.getElementById('generateBtn');
    if (uploadedData.length > 0) {
        generateBtn.disabled = false;
        console.log('✅ Generate button enabled');
    } else {
        generateBtn.disabled = true;
        console.log('❌ Generate button disabled - no data');
    }
}

// Generate Hash Code (7-digit alphanumeric)
function generateHashCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Submit data to Google Forms
async function submitToGoogleForms(certData) {
    const formData = new FormData();
    
    // Map certificate data to Google Form fields
    formData.append(FIELD_IDS.hashCode, certData.HashCode);
    formData.append(FIELD_IDS.name, certData.Name);
    formData.append(FIELD_IDS.rollNumber, certData.RollNumber);
    formData.append(FIELD_IDS.college, certData.College);
    formData.append(FIELD_IDS.eventName, certData.EventName);
    formData.append(FIELD_IDS.certificateType, certData.CertificateType);
    formData.append(FIELD_IDS.generatedBy, certData.GeneratedBy);
    formData.append(FIELD_IDS.descriptionText, certData.DescriptionText);
    
    try {
        const response = await fetch(FORM_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });
        
        console.log('✅ Data submitted to Google Forms for:', certData.Name);
        return true;
    } catch (error) {
        console.error('❌ Error submitting to Google Forms:', error);
        return false;
    }
}

// Generate Certificate Image using Template
async function generateCertificateImage(certData, descriptionText) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size (adjust based on your template dimensions)
        canvas.width = 1900;
        canvas.height = 1300;
        
        // Load the template image
        const templateImage = new Image();
        templateImage.crossOrigin = 'anonymous';
        
        templateImage.onload = function() {
            // Draw the template image
            ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
            
            // Configure text styles
            ctx.textAlign = 'center';
            
            // Add Certificate Type (below "CERTIFICATE" text)
            ctx.fillStyle = '#D4AF37'; // Gold color for certificate type
            ctx.font = 'italic 60px "Playfair Display", serif';
            ctx.fillText(`for ${certData.CertificateType}.`, canvas.width / 2, 370);

            // Add Name (centered, large font)
            ctx.fillStyle = '#D4AF37'; // Gold color for name
            ctx.font = '64px "Cinzel", serif';
            ctx.fillText(certData.Name.toUpperCase(), canvas.width / 2, 610);

            // Add Description Text (below name)
            ctx.fillStyle = '#fff';
            ctx.font = '27px "Open Sans", sans-serif';

            // Wrap description text if needed
            const maxWidth = 1414;
            const descriptionLines = wrapText(ctx, descriptionText, canvas.width / 2, 700, maxWidth, 55);

            // Add Hash Code (bottom of certificate) - WHITE COLOR
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '27px "Courier New", monospace';
            ctx.fillText(`Certificate ID: ${certData.HashCode}`, canvas.width / 2, canvas.height - 130);

            // Add Verification Link - WHITE COLOR
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '27px "Open Sans", sans-serif';
            ctx.fillText('Verify at: https://photonclub-certificate-system.netlify.app/', canvas.width / 2, canvas.height - 80);


            // Convert to data URL
            const imageData = canvas.toDataURL('image/png');
            resolve(imageData);
        };
        
        templateImage.onerror = function() {
            reject(new Error('Failed to load certificate template'));
        };
        
        templateImage.src = CERTIFICATE_TEMPLATE_URL;
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

// Generate Certificates
async function generateCertificates() {
    if (uploadedData.length === 0) {
        showNotification('Please upload Excel data first', 'error');
        return;
    }
    
    console.log('🚀 Starting certificate generation for', uploadedData.length, 'records');
    
    // Get description text from input
    const descriptionText = document.getElementById('descriptionText').value.trim() || 
                           "for their active participation and valuable contribution in";
    
    // Show loading state on button
    const generateBtn = document.getElementById('generateBtn');
    setButtonLoading(generateBtn, true);
    
    showLoading(true, 'Generating certificates...');
    
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('certificateAdmin'));
        
        // Generate hash codes and prepare data
        const certificatesData = uploadedData.map(record => {
            return {
                ...record,
                HashCode: generateHashCode(),
                IssueDate: new Date().toLocaleDateString(),
                GeneratedBy: currentUser.name,
                DescriptionText: descriptionText,
                Status: 'Active'
            };
        });
        
        console.log('🔑 Generated hash codes for', certificatesData.length, 'certificates');
        
        // Submit data to Google Forms
        let submittedCount = 0;
        for (const certData of certificatesData) {
            const submitted = await submitToGoogleForms(certData);
            if (submitted) submittedCount++;
            
            // Update progress
            updateGenerationProgress(submittedCount, certificatesData.length, 'Saving to Google Sheets...');
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log(`✅ ${submittedCount}/${certificatesData.length} records submitted to Google Sheets`);
        
        // Generate certificate images
        generatedCertificates = [];
        
        for (let i = 0; i < certificatesData.length; i++) {
            const certData = certificatesData[i];
            const certificateImage = await generateCertificateImage(certData, descriptionText);
            generatedCertificates.push({
                ...certData,
                ImageData: certificateImage
            });
            
            // Update progress for image generation
            updateGenerationProgress(i + 1, certificatesData.length, 'Generating certificate images...');
        }
        
        console.log('✅ All certificates generated successfully');
        showGenerationResults(generatedCertificates, submittedCount);
        
    } catch (error) {
        console.error('❌ Certificate generation error:', error);
        showNotification('Error generating certificates: ' + error.message, 'error');
    } finally {
        showLoading(false);
        setButtonLoading(generateBtn, false);
    }
}

// Update Generation Progress
function updateGenerationProgress(current, total, message = 'Generating certificates...') {
    const loadingText = document.querySelector('.loading-overlay p');
    if (loadingText) {
        loadingText.textContent = `${message} ${current}/${total}`;
    }
}

// Download Certificate
function downloadCertificate(imageData, filename) {
    try {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ Downloaded:', filename);
    } catch (error) {
        console.error('❌ Download error:', error);
        showNotification('Error downloading certificate. Please try again.', 'error');
    }
}

// Add this function to create and download ZIP files
async function downloadAllCertificatesAsZip(certificates) {
    showLoading(true, 'Creating ZIP file...');
    
    const downloadBtn = document.getElementById('downloadAllBtn');
    setButtonLoading(downloadBtn, true);
    
    try {
        const zip = new JSZip();
        const folder = zip.folder("certificates");
        
        // Add all certificate images to ZIP
        certificates.forEach(cert => {
            // Convert data URL to blob
            const data = cert.ImageData.split(',')[1];
            const blob = b64toBlob(data, 'image/png');
            folder.file(`${cert.Name}_${cert.HashCode}_certificate.png`, blob);
        });
        
        // Generate and download ZIP
        const content = await zip.generateAsync({type: "blob"});
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificates_${new Date().getTime()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification(`All ${certificates.length} certificates downloaded as ZIP!`, 'success');
        
    } catch (error) {
        console.error('❌ ZIP creation error:', error);
        showNotification('Error creating ZIP file. Please try again.', 'error');
    } finally {
        showLoading(false);
        setButtonLoading(downloadBtn, false);
    }
}

// Helper function to convert base64 to blob
function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
}

// Function to download hash codes as CSV (only Name, RollNumber, and HashCode)
function downloadHashCodes(certificates) {
    showLoading(true, 'Preparing hash codes file...');
    
    try {
        // Create CSV content with only Name, RollNumber, and HashCode
        const headers = ['Name', 'RollNumber', 'HashCode'];
        const csvContent = [
            headers.join(','),
            ...certificates.map(cert => [
                `"${cert.Name}"`,
                `"${cert.RollNumber}"`,
                cert.HashCode
            ].join(','))
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate_hashcodes_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('Hash codes downloaded as CSV!', 'success');
        
    } catch (error) {
        console.error('❌ CSV download error:', error);
        showNotification('Error downloading hash codes. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Show Generation Results
function showGenerationResults(certificates, submittedCount) {
    const resultDiv = document.getElementById('generationResult');
    const currentUser = JSON.parse(sessionStorage.getItem('certificateAdmin'));
    
    resultDiv.innerHTML = `
        <div class="success-message">
            <h3>✅ Certificates Generated Successfully!</h3>
            <p>${certificates.length} certificates generated with unique hash codes</p>
            <p style="color: #28a745;">${submittedCount} records saved to Google Sheets</p>
            
            <div class="results-summary">
                <div class="summary-card">
                    <h4>📊 Summary</h4>
                    <p>Total Certificates: <strong>${certificates.length}</strong></p>
                    <p>Saved to Sheets: <strong>${submittedCount}</strong></p>
                    <p>Generated By: <strong>${currentUser.name}</strong></p>
                    <p>Date: <strong>${new Date().toLocaleDateString()}</strong></p>
                </div>
                <div class="summary-card">
                    <h4>🎯 Actions</h4>
                    <div class="action-buttons-grid">
                        <button class="btn btn-primary" id="downloadAllBtn">
                            <span class="btn-text">📦 Download All as ZIP</span>
                            <div class="btn-loader hidden"></div>
                        </button>
                        <button class="btn btn-secondary" id="downloadHashCodesBtn">
                            <span class="btn-text">📋 Download Hash Codes</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="certificate-preview-area">
                <h4>Sample Certificate Preview</h4>
                <div class="preview-container">
                    <img src="${certificates[0].ImageData}" alt="Certificate Preview" class="certificate-preview-img">
                    <div class="preview-info">
                        <p><strong>Name:</strong> ${certificates[0].Name}</p>
                        <p><strong>Hash Code:</strong> <code>${certificates[0].HashCode}</code></p>
                        <p><strong>Certificate Type:</strong> ${certificates[0].CertificateType}</p>
                        <p><strong>College:</strong> ${certificates[0].College}</p>
                        <button class="btn btn-primary" onclick="downloadCertificate('${certificates[0].ImageData}', '${certificates[0].Name}_certificate.png')">Download This Certificate</button>
                    </div>
                </div>
            </div>
            
            <div class="hash-list-container">
                <h4>Generated Certificates:</h4>
                <div class="table-container">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>Hash Code</th>
                                <th>Name</th>
                                <th>Roll Number</th>
                                <th>College</th>
                                <th>Certificate Type</th>
                                <th>Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${certificates.map(cert => `
                                <tr>
                                    <td><code>${cert.HashCode}</code></td>
                                    <td>${cert.Name}</td>
                                    <td>${cert.RollNumber}</td>
                                    <td>${cert.College}</td>
                                    <td>${cert.CertificateType}</td>
                                    <td>
                                        <button class="btn-download" onclick="downloadCertificate('${cert.ImageData}', '${cert.Name}_certificate.png')" title="Download Certificate">
                                            📥
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-secondary" id="generateMoreBtn">Generate More Certificates</button>
            </div>
        </div>
    `;
    
    resultDiv.classList.remove('hidden');
    
    // Add event listeners for action buttons
    document.getElementById('downloadAllBtn').addEventListener('click', () => downloadAllCertificatesAsZip(certificates));
    document.getElementById('downloadHashCodesBtn').addEventListener('click', () => downloadHashCodes(certificates));
    document.getElementById('generateMoreBtn').addEventListener('click', () => {
        resultDiv.classList.add('hidden');
        removeExcelFile();
        document.getElementById('descriptionText').value = '';
    });
}

// Logout function for generate module
function logoutFromGenerate() {
    sessionStorage.removeItem('certificateAdmin');
    
    // Update login button
    document.getElementById('adminLoginBtn').textContent = 'Admin Login';
    document.getElementById('adminLoginBtn').classList.remove('btn-secondary');
    document.getElementById('adminLoginBtn').classList.add('btn-outline');
    
    showNotification('Logged out successfully!', 'success');
    
    // Switch to verify tab
    window.switchTab('verify');
}

console.log('🎉 generate.js loaded successfully!'); 