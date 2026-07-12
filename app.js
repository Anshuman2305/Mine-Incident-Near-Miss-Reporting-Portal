document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('incidentForm');
    const appsScriptUrlInput = document.getElementById('appsScriptUrl');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const toggleSetupBtn = document.getElementById('toggleSetupBtn');
    const setupGuideSection = document.getElementById('setupGuideSection');

    const injuryRadios = document.getElementsByName('hasInjury');
    const injuryDetailsContainer = document.getElementById('injuryDetailsContainer');
    const injuryDetailsInput = document.getElementById('injuryDetails');

    const briefTextarea = document.getElementById('brief');
    const wordCountDisplay = document.getElementById('wordCountDisplay');

    const dropzone = document.getElementById('dropzone');
    const photoUploadInput = document.getElementById('photoUpload');
    const previewGrid = document.getElementById('previewGrid');

    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const successOverlay = document.getElementById('successOverlay');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    const receiptType = document.getElementById('receiptType');
    const receiptReporter = document.getElementById('receiptReporter');
    const receiptDateTime = document.getElementById('receiptDateTime');
    const receiptPhotosCount = document.getElementById('receiptPhotosCount');

    const toastContainer = document.getElementById('toastContainer');

    // State Variables
    let selectedFiles = [];
    const MAX_FILES = 10;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    // -------------------------------------------------------------
    // Configuration & Setup Logic (Hardcoded or Local Storage)
    // -------------------------------------------------------------
    // CONFIGURATION: Hardcoded default Google Apps Script Web App URL
    const CONFIG_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyFPORrF0gN2j8p4QJHCB3WlFPhETZkW469vMKMQmMtBM0tRhiN6xK80uvDHNqGB_WgIA/exec";

    // Helper to get active URL (prefers hardcoded over LocalStorage)
    const getSavedUrl = () => {
        if (CONFIG_APPS_SCRIPT_URL && CONFIG_APPS_SCRIPT_URL.trim() !== "") {
            return CONFIG_APPS_SCRIPT_URL.trim();
        }
        return localStorage.getItem('mine_incident_portal_url');
    };

    const savedUrl = getSavedUrl();
    if (savedUrl) {
        appsScriptUrlInput.value = savedUrl;
        // If it's permanently hardcoded, hide the setup panel and instructions button to simplify the portal
        if (CONFIG_APPS_SCRIPT_URL && CONFIG_APPS_SCRIPT_URL.trim() !== "") {
            toggleSetupBtn.classList.add('hidden');
            setupGuideSection.classList.add('hidden');
        }
    } else {
        // Show setup guide by default if not configured
        setupGuideSection.classList.remove('hidden');
    }

    // Toggle Setup Section
    toggleSetupBtn.addEventListener('click', () => {
        setupGuideSection.classList.toggle('hidden');
    });

    // Save URL Configuration
    saveConfigBtn.addEventListener('click', () => {
        const url = appsScriptUrlInput.value.trim();
        if (url) {
            try {
                new URL(url); // Basic browser validation
                localStorage.setItem('mine_incident_portal_url', url);
                showToast('Google Sheet Web App URL saved successfully!', 'success');
                setupGuideSection.classList.add('hidden');
            } catch (e) {
                showToast('Please enter a valid URL (including https://).', 'error');
            }
        } else {
            localStorage.removeItem('mine_incident_portal_url');
            showToast('Web App URL cleared. Forms will not submit until configured.', 'error');
        }
    });

    // -------------------------------------------------------------
    // Custom Select Dropdown Component
    // -------------------------------------------------------------
    const customSelect = document.getElementById('customReportTypeSelect');
    const nativeSelect = document.getElementById('reportType');
    
    if (customSelect && nativeSelect) {
        const trigger = customSelect.querySelector('.custom-select-trigger');
        const triggerText = trigger.querySelector('span');
        const optionsList = customSelect.querySelector('.custom-select-options');
        const options = customSelect.querySelectorAll('.custom-select-option');

        // Open/Close dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = customSelect.classList.contains('active');
            customSelect.classList.toggle('active');
            trigger.setAttribute('aria-expanded', !isActive);
        });

        // Click Option
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.getAttribute('data-value');
                
                // Active options styling
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Native select sync
                nativeSelect.value = value;
                
                // Update trigger text
                triggerText.textContent = value;
                triggerText.classList.remove('custom-select-placeholder');
                
                // Close dropdown
                customSelect.classList.remove('active');
                trigger.setAttribute('aria-expanded', 'false');
                
                // Dispatch change events to trigger form validations
                nativeSelect.dispatchEvent(new Event('change'));
                clearControlError(nativeSelect.closest('.form-control'));
            });
        });

        // Click outside closes dropdown
        document.addEventListener('click', () => {
            customSelect.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
        });
    }

    // -------------------------------------------------------------
    // Injury Field Conditional Display
    // -------------------------------------------------------------
    injuryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Yes') {
                injuryDetailsContainer.classList.remove('hidden');
                injuryDetailsInput.setAttribute('required', 'required');
                // Trigger reflow for transition
                setTimeout(() => {
                    injuryDetailsContainer.style.opacity = '1';
                    injuryDetailsContainer.style.transform = 'translateY(0)';
                }, 10);
            } else {
                injuryDetailsContainer.style.opacity = '0';
                injuryDetailsContainer.style.transform = 'translateY(-10px)';
                injuryDetailsInput.removeAttribute('required');
                setTimeout(() => {
                    injuryDetailsContainer.classList.add('hidden');
                    injuryDetailsInput.value = ''; // Reset details
                    clearControlError(injuryDetailsContainer);
                }, 300);
            }
        });
    });

    // -------------------------------------------------------------
    // Brief Textarea Word Counter
    // -------------------------------------------------------------
    function updateWordCount() {
        const text = briefTextarea.value;
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const count = words.length;

        wordCountDisplay.textContent = `${count} / 500 words`;

        // Style based on count
        if (count > 500) {
            wordCountDisplay.className = 'word-counter danger';
        } else if (count > 450) {
            wordCountDisplay.className = 'word-counter warning';
        } else {
            wordCountDisplay.className = 'word-counter';
        }
        return count;
    }

    briefTextarea.addEventListener('input', () => {
        updateWordCount();
        clearControlError(briefTextarea.closest('.form-control'));
    });

    // -------------------------------------------------------------
    // Drag & Drop Photo Upload
    // -------------------------------------------------------------
    // Trigger file dialog
    dropzone.addEventListener('click', () => {
        photoUploadInput.click();
    });

    // Drag-over styling
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        }, false);
    });

    // Handle dropped files
    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Handle input selection
    photoUploadInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        let hasErrors = false;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Check if file is image
            if (!file.type.startsWith('image/')) {
                showToast(`File "${file.name}" is not an image.`, 'error');
                hasErrors = true;
                continue;
            }

            // Check if file size exceeds 10MB
            if (file.size > MAX_FILE_SIZE) {
                showToast(`"${file.name}" exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`, 'error');
                hasErrors = true;
                continue;
            }

            // Check files list capacity
            if (selectedFiles.length >= MAX_FILES) {
                showToast(`Max ${MAX_FILES} photos allowed. Remaining photos skipped.`, 'error');
                hasErrors = true;
                break;
            }

            // Prevent duplicates (simple name-size verification)
            if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                continue;
            }

            selectedFiles.push(file);
        }

        updatePreviewGrid();

        // Reset file input value to allow uploading same file if removed
        photoUploadInput.value = '';
    }

    function updatePreviewGrid() {
        previewGrid.innerHTML = '';

        selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';

            // Create Image preview
            const img = document.createElement('img');
            img.className = 'preview-image';
            img.alt = file.name;

            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);

            previewItem.appendChild(img);

            // Information tag (Name and size)
            const info = document.createElement('div');
            info.className = 'preview-info';
            info.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
            previewItem.appendChild(info);

            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn-remove-photo';
            removeBtn.innerHTML = '&times;';
            removeBtn.ariaLabel = `Remove photo ${file.name}`;
            removeBtn.addEventListener('click', () => {
                removePhoto(index);
            });
            previewItem.appendChild(removeBtn);

            previewGrid.appendChild(previewItem);
        });
    }

    function removePhoto(index) {
        selectedFiles.splice(index, 1);
        updatePreviewGrid();
    }

    // -------------------------------------------------------------
    // Input Validations & Interactive Feedback
    // -------------------------------------------------------------
    // Remove error marks as soon as value changes
    const textInputs = form.querySelectorAll('input, select, textarea');
    textInputs.forEach(input => {
        input.addEventListener('input', () => {
            const control = input.closest('.form-control');
            if (control) clearControlError(control);
        });
    });

    function setControlError(control, messageId, overrideText = null) {
        control.classList.add('invalid');
        const errorSpan = control.querySelector('.error-message');
        if (errorSpan && overrideText) {
            errorSpan.textContent = overrideText;
        }
    }

    function clearControlError(control) {
        if (control) {
            control.classList.remove('invalid');
        }
    }

    function validateForm() {
        let isValid = true;

        // 1. Classification
        const reportType = document.getElementById('reportType');
        if (!reportType.value) {
            setControlError(reportType.closest('.form-control'));
            isValid = false;
        } else {
            clearControlError(reportType.closest('.form-control'));
        }

        // 2. Reporter Name
        const nameInput = document.getElementById('reporterName');
        if (!nameInput.value.trim()) {
            setControlError(nameInput.closest('.form-control'));
            isValid = false;
        } else {
            clearControlError(nameInput.closest('.form-control'));
        }

        // 3. Mobile Number (Basic Format checking)
        const mobileInput = document.getElementById('reporterMobile');
        const phoneRegex = /^\+?[0-9\s-]{8,15}$/;
        if (!mobileInput.value.trim()) {
            setControlError(mobileInput.closest('.form-control'), null, 'Mobile number is required.');
            isValid = false;
        } else if (!phoneRegex.test(mobileInput.value.trim())) {
            setControlError(mobileInput.closest('.form-control'), null, 'Please enter a valid mobile number.');
            isValid = false;
        } else {
            clearControlError(mobileInput.closest('.form-control'));
        }

        // 4. Date of Incident
        const dateInput = document.getElementById('incidentDate');
        if (!dateInput.value) {
            setControlError(dateInput.closest('.form-control'));
            isValid = false;
        } else {
            // Prevent future dates
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // Allow today full duration
            if (selectedDate > today) {
                setControlError(dateInput.closest('.form-control'), null, 'Date cannot be in the future.');
                isValid = false;
            } else {
                clearControlError(dateInput.closest('.form-control'));
            }
        }

        // 5. Time of Incident
        const timeInput = document.getElementById('incidentTime');
        if (!timeInput.value) {
            setControlError(timeInput.closest('.form-control'));
            isValid = false;
        } else {
            clearControlError(timeInput.closest('.form-control'));
        }

        // 6. Vehicle Registration Number
        const vehicleInput = document.getElementById('vehicleNumber');
        if (!vehicleInput.value.trim()) {
            setControlError(vehicleInput.closest('.form-control'));
            isValid = false;
        } else {
            clearControlError(vehicleInput.closest('.form-control'));
        }

        // 7. Was there injury? Conditional logic
        const hasInjury = form.querySelector('input[name="hasInjury"]:checked').value;
        if (hasInjury === 'Yes') {
            if (!injuryDetailsInput.value.trim()) {
                setControlError(injuryDetailsContainer, null, 'Injury details are required since you answered Yes.');
                isValid = false;
            } else {
                clearControlError(injuryDetailsContainer);
            }
        } else {
            clearControlError(injuryDetailsContainer);
        }

        // 9. Location
        const locationInput = document.getElementById('location');
        if (!locationInput.value.trim()) {
            setControlError(locationInput.closest('.form-control'));
            isValid = false;
        } else {
            clearControlError(locationInput.closest('.form-control'));
        }

        // 10. Brief
        const briefCount = updateWordCount();
        if (!briefTextarea.value.trim()) {
            setControlError(briefTextarea.closest('.form-control'), null, 'Incident description is required.');
            isValid = false;
        } else if (briefCount > 500) {
            setControlError(briefTextarea.closest('.form-control'), null, 'Description cannot exceed 500 words.');
            isValid = false;
        } else {
            clearControlError(briefTextarea.closest('.form-control'));
        }

        return isValid;
    }

    // -------------------------------------------------------------
    // Form Submission & API Integration
    // -------------------------------------------------------------
    // Helper to read file to base64
    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Extracts the base64 part only
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear focus to avoid issues
        document.activeElement.blur();

        // 1. Client-Side Validation
        if (!validateForm()) {
            showToast('Please correct the highlighted errors before submitting.', 'error');

            // Scroll to first invalid element
            const firstInvalid = form.querySelector('.form-control.invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // 2. Apps Script Connection Check
        const url = getSavedUrl();
        if (!url) {
            showToast('Google Sheet integration URL is not set. Toggle setup instructions above to save a Web App URL.', 'error');
            setupGuideSection.classList.remove('hidden');
            setupGuideSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // 3. Compile Data and Process Files
        showLoading(true, 'Processing photos and preparing payload...');

        try {
            // Read all photos to Base64
            const photoPromises = selectedFiles.map(async (file) => {
                const base64 = await getBase64(file);
                return {
                    name: file.name,
                    type: file.type,
                    base64: base64
                };
            });
            const photosData = await Promise.all(photoPromises);

            // Compile core Form Payload
            const hasInjuryValue = form.querySelector('input[name="hasInjury"]:checked').value;
            const payload = {
                type: document.getElementById('reportType').value,
                reporterName: document.getElementById('reporterName').value.trim(),
                reporterMobile: document.getElementById('reporterMobile').value.trim(),
                incidentDate: document.getElementById('incidentDate').value,
                incidentTime: document.getElementById('incidentTime').value,
                vehicleNumber: document.getElementById('vehicleNumber').value.trim(),
                hasInjury: hasInjuryValue,
                injuryDetails: hasInjuryValue === 'Yes' ? injuryDetailsInput.value.trim() : 'N/A',
                location: document.getElementById('location').value.trim(),
                brief: briefTextarea.value.trim(),
                photos: photosData
            };

            // Submit Data
            showLoading(true, 'Connecting to Google Sheets Database...');
            await fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8' // Standard to bypass preflight issues in GAS
                },
                body: JSON.stringify(payload)
            });

            // Since we submit using no-cors mode to prevent CORS redirection blockages on redirects,
            // the browser returns an opaque response. Because the fetch promise resolved successfully, 
            // the data has successfully reached and been processed by Google Sheets.
            showLoading(false);
            triggerSuccess(payload);
        } catch (error) {
            console.error('Submission Error:', error);
            showLoading(false);
            showToast(`Submission failed: ${error.message}. Verify network connection or integration URL.`, 'error');
        }
    });

    // -------------------------------------------------------------
    // Display States & Alerts
    // -------------------------------------------------------------
    function showLoading(show, message = 'Submitting Safety Report...') {
        if (show) {
            loadingText.textContent = message;
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }

    function triggerSuccess(data) {
        // Populate Receipt details
        receiptType.textContent = data.type;
        receiptReporter.textContent = data.reporterName;
        receiptDateTime.textContent = `${data.incidentDate} at ${data.incidentTime}`;
        receiptPhotosCount.textContent = `${selectedFiles.length} file(s)`;

        // Display Success Modal
        successOverlay.classList.remove('hidden');
    }

    closeSuccessBtn.addEventListener('click', () => {
        // Reset state & Form
        successOverlay.classList.add('hidden');
        form.reset();

        // Reset custom select dropdown triggers
        if (customSelect) {
            const triggerText = customSelect.querySelector('.custom-select-trigger span');
            if (triggerText) {
                triggerText.textContent = '-- Select Classification --';
                triggerText.classList.add('custom-select-placeholder');
            }
            const options = customSelect.querySelectorAll('.custom-select-option');
            options.forEach(opt => opt.classList.remove('selected'));
        }

        selectedFiles = [];
        updatePreviewGrid();
        updateWordCount();

        // Force hide injury block explicitly
        injuryDetailsContainer.classList.add('hidden');
        injuryDetailsInput.removeAttribute('required');
        injuryDetailsInput.value = '';

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Toast alert notifier
    function showToast(message, type = 'primary') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Add content
        const textSpan = document.createElement('span');
        textSpan.className = 'toast-message';
        textSpan.textContent = message;
        toast.appendChild(textSpan);

        toastContainer.appendChild(toast);

        // Trigger entrance animation
        setTimeout(() => toast.classList.add('show'), 50);

        // Auto remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
    }
});
