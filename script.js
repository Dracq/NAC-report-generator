// ===== TAB NAVIGATION =====
const tabButtons = document.querySelectorAll('.tab-btn');
const inputSections = document.querySelectorAll('.input-section');
const navButtons = document.querySelectorAll('.btn-nav');

function navigateToPart(part) {
    // Remove active class from all tabs and sections
    tabButtons.forEach(btn => btn.classList.remove('active'));
    inputSections.forEach(section => section.classList.remove('active'));
    
    // Add active class to the target tab and section
    document.querySelector(`.tab-btn[data-part="${part}"]`).classList.add('active');
    document.getElementById(`part${part}-inputs`).classList.add('active');
}

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        navigateToPart(button.dataset.part);
    });
});

navButtons.forEach(button => {
    button.addEventListener('click', () => navigateToPart(button.dataset.target));
});

// ===== REAL-TIME PREVIEW UPDATES =====
function updatePreview(inputId, previewId, prefix = '', suffix = '') {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input && preview) {
        const placeholder = preview.innerHTML; // Store initial placeholder content
        input.addEventListener('input', () => {
            if (input.value) {
                preview.textContent = prefix + input.value + suffix;
            } else {
                // If input is empty, restore the placeholder
                preview.innerHTML = placeholder;
            }
        });
    }
}

// Hospital Name update
updatePreview('hospitalName', 'preview-hospitalName');

// Part 1 updates
updatePreview('patientName', 'preview-patientName');
updatePreview('age', 'preview-age', '', ` Yrs / <span id="preview-sex">${document.getElementById('sex').value}</span>`);
updatePreview('sex', 'preview-sex');
updatePreview('echsCardNo', 'preview-echsCardNo');
updatePreview('relation', 'preview-relation');
updatePreview('relatedName', 'preview-relatedName');
updatePreview('relatedCardNo', 'preview-relatedCardNo');
updatePreview('echsPolyclinic', 'preview-echsPolyclinic');
updatePreview('contactNo', 'preview-contactNo');

// Part 2 updates
updatePreview('hearingTestDate', 'preview-hearingTestDate');
updatePreview('audiologistName', 'preview-audiologistName');
updatePreview('complaint1', 'preview-complaint1');
updatePreview('complaint2', 'preview-complaint2');
updatePreview('complaint3', 'preview-complaint3');
updatePreview('earAffected', 'preview-earAffected');

// Part 4 updates
updatePreview('selectedModel', 'preview-selectedModel');
updatePreview('selectedSupplier', 'preview-selectedSupplier');
updatePreview('mrp', 'preview-mrp');
updatePreview('discountPrice', 'preview-discountPrice');
updatePreview('warranty', 'preview-warranty');
updatePreview('recommendation', 'preview-recommendation');

// Part 5 updates
updatePreview('station', 'preview-station');
updatePreview('consentDate', 'preview-consentDate');
updatePreview('doctor1Name', 'preview-doctor1Name');
updatePreview('doctor1Rank', 'preview-doctor1Rank');
updatePreview('doctor2Name', 'preview-doctor2Name');
updatePreview('doctor2Rank', 'preview-doctor2Rank');

// Update sex in age field
document.getElementById('sex').addEventListener('change', function() {
    const ageEl = document.getElementById('age');
    const age = ageEl.value;
    const sex = this.value;
    const agePreview = document.getElementById('preview-age');
    const sexPreview = document.getElementById('preview-sex');
    
    if (sexPreview) sexPreview.textContent = sex;
    if (!age) agePreview.innerHTML = `<span class="placeholder">Age</span> Yrs / <span id="preview-sex">${sex}</span>`;
});

document.getElementById('age').addEventListener('input', function() {
    const ageSpan = document.getElementById('preview-age');
    const age = this.value;
    const sex = document.getElementById('sex').value;
    if (age) {
        ageSpan.innerHTML = age + ' Yrs / <span id="preview-sex">' + sex + '</span>';
    } else {
        ageSpan.innerHTML = `<span class="placeholder">Age</span> Yrs / <span id="preview-sex">${sex}</span>`;
    }
});

// Update consent statement dynamically
function updateConsentStatement() {
    const name = document.getElementById('patientName').value || 'Patient Name';
    const cardNo = document.getElementById('echsCardNo').value || 'Card No';
    const relation = document.getElementById('relation').value || 'relation';
    const relatedName = document.getElementById('relatedName').value || 'Related Person';
    const relatedCard = document.getElementById('relatedCardNo').value || 'Card No';
    const warrantyNum = document.getElementById('warranty').value;
    const warrantyWordsForConsent = numberToWords(warrantyNum).replace(' only', '') || 'Yrs';
    
    const isSelf = relation === 'Self';

    document.getElementById('preview-consent-name').textContent = name;
    document.getElementById('preview-consent-card').textContent = cardNo;
    document.getElementById('preview-consent-warranty').textContent = warrantyWordsForConsent;

    const consentRelation = document.getElementById('preview-consent-relation');
    const consentRelated = document.getElementById('preview-consent-related');
    const consentRelatedCard = document.getElementById('preview-consent-relatedCard');

    if (isSelf) {
        consentRelation.textContent = '';
        consentRelated.textContent = '';
        consentRelatedCard.textContent = '';
    } else {
        const relationPrefix = relation === 'Spouse' ? 'w/o' : 
                              relation === 'Father' ? 's/o' :
                              relation === 'Mother' ? 'd/o' : 'c/o';
        consentRelation.textContent = relationPrefix;
        consentRelated.textContent = relatedName;
        consentRelatedCard.textContent = ` ECHS Card No ${relatedCard}`;
    }
}

['patientName', 'echsCardNo', 'relation', 'relatedName', 'relatedCardNo', 'warranty'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('input', updateConsentStatement);
        element.addEventListener('change', updateConsentStatement);
    }
});
updateConsentStatement(); // Initial call

// Disable related person fields if relation is 'Self'
const relationSelect = document.getElementById('relation');
const relatedNameInput = document.getElementById('relatedName');
const relatedCardNoInput = document.getElementById('relatedCardNo');
const relatedPersonRow = document.getElementById('related-person-row');

function handleRelationChange() {
    const isSelf = relationSelect.value === 'Self';
    relatedNameInput.disabled = isSelf;
    relatedCardNoInput.disabled = isSelf;
    relatedPersonRow.style.display = isSelf ? 'none' : '';

    if (isSelf) {
        relatedNameInput.value = '';
        relatedCardNoInput.value = '';
        // Manually trigger input events to update preview and save state
        relatedNameInput.dispatchEvent(new Event('input'));
        relatedCardNoInput.dispatchEvent(new Event('input'));
    }
}

relationSelect.addEventListener('change', handleRelationChange);
// Initial check on load is handled by loadFormState and its subsequent event dispatches.

// ===== AUDIOGRAM PROCESSING =====
let audiogramData = {
    right: { ac: {}, bc: {} },
    left: { ac: {}, bc: {} }
};

// Collect audiogram data
function collectAudiogramData() {
    const frequencies = [250, 500, 1000, 2000, 4000, 8000];
    
    // Right ear
    frequencies.forEach(freq => {
        const acInput = document.querySelector(`.ac-right[data-freq="${freq}"]`);
        const bcInput = document.querySelector(`.bc-right[data-freq="${freq}"]`);
        
        audiogramData.right.ac[freq] = acInput && acInput.value ? parseFloat(acInput.value) : null;
        audiogramData.right.bc[freq] = bcInput && bcInput.value ? parseFloat(bcInput.value) : null;
    });
    
    // Left ear
    frequencies.forEach(freq => {
        const acInput = document.querySelector(`.ac-left[data-freq="${freq}"]`);
        const bcInput = document.querySelector(`.bc-left[data-freq="${freq}"]`);
        
        audiogramData.left.ac[freq] = acInput && acInput.value ? parseFloat(acInput.value) : null;
        audiogramData.left.bc[freq] = bcInput && bcInput.value ? parseFloat(bcInput.value) : null;
    });
    
    calculateDiagnosis();
    drawAudiogram();
}

// Calculate average and diagnosis
function calculateDiagnosis() {
    // Calculate averages for right ear
    const rightAcValues = Object.values(audiogramData.right.ac).filter(v => v !== null);
    const rightBcValues = Object.values(audiogramData.right.bc).filter(v => v !== null);
    
    const rightAcAvg = rightAcValues.length > 0 ? 
        Math.round(rightAcValues.reduce((a, b) => a + b, 0) / rightAcValues.length) : 0;
    const rightBcAvg = rightBcValues.length > 0 ? 
        Math.round(rightBcValues.reduce((a, b) => a + b, 0) / rightBcValues.length) : 0;
    
    // Calculate averages for left ear
    const leftAcValues = Object.values(audiogramData.left.ac).filter(v => v !== null);
    const leftBcValues = Object.values(audiogramData.left.bc).filter(v => v !== null);
    
    const leftAcAvg = leftAcValues.length > 0 ? 
        Math.round(leftAcValues.reduce((a, b) => a + b, 0) / leftAcValues.length) : 0;
    const leftBcAvg = leftBcValues.length > 0 ? 
        Math.round(leftBcValues.reduce((a, b) => a + b, 0) / leftBcValues.length) : 0;
    
    // Update preview
    document.getElementById('preview-acRight').textContent = rightAcAvg;
    document.getElementById('preview-bcRight').textContent = rightBcAvg;
    document.getElementById('preview-acLeft').textContent = leftAcAvg;
    document.getElementById('preview-bcLeft').textContent = leftBcAvg;
    
    // Determine diagnosis
    const rightDiagnosis = getDiagnosis(rightAcAvg, rightBcAvg);
    const leftDiagnosis = getDiagnosis(leftAcAvg, leftBcAvg);
    
    document.getElementById('preview-diagnosisRight').innerHTML = rightDiagnosis || '<span class="placeholder">Diagnosis Right</span>';
    document.getElementById('preview-diagnosisLeft').innerHTML = leftDiagnosis || '<span class="placeholder">Diagnosis Left</span>';
}

function getDiagnosis(ac, bc) {
    let severity = '';
    let type = '';
    
    // Determine severity based on AC
    if (ac <= 20) severity = 'Within Normal Limits';
    else if (ac <= 40) severity = 'Mild';
    else if (ac <= 60) severity = 'Moderate';
    else if (ac <= 80) severity = 'Severe';
    else if (ac <= 100) severity = 'Severely Profound';
    else severity = 'Profound';
    
    if (severity === 'Within Normal Limits') return severity;
    
    // Determine type based on AC-BC gap
    const gap = Math.abs(ac - bc);
    
    if (gap < 10) {
        type = 'Sensorineural Hearing Loss (SNHL)';
    } else if (bc > 20 && gap > 10) {
        type = 'Mixed Hearing Loss';
    } else {
        type = 'Conductive Hearing Loss (CHL)';
    }
    
    return `${severity} ${type}`;
}

// Draw audiogram chart
function drawAudiogram() {
    const canvas = document.getElementById('audiogramCanvas');
    const ctx = canvas.getContext('2d');
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);
    
    const frequencies = [250, 500, 1000, 2000, 4000, 8000];
    const dbLevels = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
    
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Draw grid
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // Vertical lines (frequencies)
    frequencies.forEach((freq, i) => {
        const x = padding + (i / (frequencies.length - 1)) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
        
        // Frequency labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(freq + ' Hz', x, height - padding + 20);
    });
    
    // Horizontal lines (dB levels)
    dbLevels.forEach((db, i) => {
        const y = padding + (i / (dbLevels.length - 1)) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // dB labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Segoe UI';
        ctx.textAlign = 'right';
        ctx.fillText(db + ' dB', padding - 10, y + 4);
    });
    
    // Draw data points
    function drawPoints(data, color, symbol) {
        const points = [];
        frequencies.forEach((freq, i) => {
            const db = data[freq];
            if (db !== null && db !== undefined) {
                const x = padding + (i / (frequencies.length - 1)) * chartWidth;
                const y = padding + ((db + 10) / 130) * chartHeight;
                points.push({ x, y, freq });
                
                // Draw symbol
                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                ctx.lineWidth = 2;
                
                if (symbol === 'circle') {
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (symbol === 'cross') {
                    ctx.beginPath();
                    ctx.moveTo(x - 5, y - 5);
                    ctx.lineTo(x + 5, y + 5);
                    ctx.moveTo(x + 5, y - 5);
                    ctx.lineTo(x - 5, y + 5);
                    ctx.stroke();
                } else if (symbol === '<') {
                    ctx.beginPath();
                    ctx.moveTo(x + 5, y - 5);
                    ctx.lineTo(x - 5, y);
                    ctx.lineTo(x + 5, y + 5);
                    ctx.stroke();
                } else if (symbol === '>') {
                    ctx.beginPath();
                    ctx.moveTo(x - 5, y - 5);
                    ctx.lineTo(x + 5, y);
                    ctx.lineTo(x - 5, y + 5);
                    ctx.stroke();
                }
            }
        });
        
        // Connect points with lines
        if (points.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
        }
    }
    
    // Draw all data
    drawPoints(audiogramData.right.ac, '#ff0000', 'circle'); // Red circles
    drawPoints(audiogramData.left.ac, '#0000ff', 'cross');   // Blue crosses
    drawPoints(audiogramData.right.bc, '#ff0000', '<');      // Red <
    drawPoints(audiogramData.left.bc, '#0000ff', '>');       // Blue >
    
    // Legend
    ctx.fillStyle = '#333';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'left';
    
    const legendX = padding + 10;
    const legendY = padding + 10;
    
    ctx.fillStyle = '#ff0000';
    ctx.fillText('Right Ear: AC (○), BC (<)', legendX, legendY);
    ctx.fillStyle = '#0000ff';
    ctx.fillText('Left Ear: AC (✕), BC (>)', legendX, legendY + 15);
}

// Add event listeners to all audiogram inputs
document.querySelectorAll('.ac-right, .bc-right, .ac-left, .bc-left').forEach(input => {
    input.addEventListener('input', collectAudiogramData);
});

// ===== HEARING AID TRIALS =====
let trialCount = 0;
const trialsContainer = document.getElementById('trials-container');
const previewTrials = document.getElementById('preview-trials');

function addTrialEntry(id, data = {}) {
    const trialId = id || ++trialCount;
    
    const trialDiv = document.createElement('div');
    trialDiv.className = 'trial-entry';
    trialDiv.dataset.trialId = trialId;
    
    trialDiv.innerHTML = `
        <button type="button" class="btn-remove" onclick="removeTrial(${trialId})">Remove</button>
        <h4>Trial ${trialId}</h4>
        <div class="form-group">
            <label>Model</label>
            <input type="text" class="trial-model" placeholder="Model name" value="${data.model || ''}">
        </div>
        <div class="form-group">
            <label>Type</label>
            <select class="trial-type" data-trial="${trialCount}">
                <option value="BTE">BTE</option>
                <option value="RIC">RIC</option>
                <option value="CIC">CIC</option>
                <option value="ITC">ITC</option>
                <option value="ITE">ITE</option>
            </select>
        </div>
        <div class="form-group">
            <label>Fitting</label>
            <select class="trial-fitting">
                <option value="Monoaural">Monoaural</option>
                <option value="Binaural">Binaural</option>
            </select>
        </div>
        <div class="form-group">
            <label>SDS</label>
            <input type="text" class="trial-sds" placeholder="SDS" value="${data.sds || ''}">
        </div>
        <div class="form-group">
            <label>Satisfaction (1-10)</label>
            <input type="number" min="1" max="10" class="trial-satisfaction" placeholder="Score" value="${data.satisfaction || ''}">
        </div>
        <div class="form-group">
            <label>Supplier Name</label>
            <input type="text" class="trial-supplier" placeholder="Supplier" value="${data.supplier || ''}">
        </div>
    `;
    
    trialsContainer.appendChild(trialDiv);
    
    // Add event listeners
    trialDiv.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', updateTrialsPreview);
        input.addEventListener('change', updateTrialsPreview);
        input.addEventListener('input', saveFormState); // Save on change
    });
    
    // Set select values from data
    trialDiv.querySelector('.trial-type').value = data.type || 'BTE';
    trialDiv.querySelector('.trial-fitting').value = data.fitting || 'Monoaural';

    updateTrialsPreview();
    return trialDiv;
}

function removeTrial(id) {
    const trialDiv = document.querySelector(`[data-trial-id="${id}"]`);
    if (trialDiv) {
        trialDiv.remove();
        updateTrialsPreview();
        saveFormState(); // Save after removal
    }
}

function updateTrialsPreview() {
    previewTrials.innerHTML = '';
    
    const trialDataArray = [];
    const trials = document.querySelectorAll('.trial-entry');

    // 1. Collect all trial data into an array
    trials.forEach(trial => {
        trialDataArray.push({
            model: trial.querySelector('.trial-model').value || '',
            type: trial.querySelector('.trial-type').value || '',
            fitting: trial.querySelector('.trial-fitting').value || '',
            sds: trial.querySelector('.trial-sds').value || '',
            satisfaction: trial.querySelector('.trial-satisfaction').value || '0',
            supplier: trial.querySelector('.trial-supplier').value || ''
        });
    });

    // 2. Sort the array by satisfaction score in descending order
    trialDataArray.sort((a, b) => (parseInt(b.satisfaction) || 0) - (parseInt(a.satisfaction) || 0));

    // 3. Populate the preview table with the sorted data
    trialDataArray.forEach((data, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${data.model}</td>
            <td>${data.type}</td>
            <td>${data.fitting}</td>
            <td>${data.sds}</td>
            <td>${data.satisfaction === '0' ? '' : data.satisfaction}</td>
            <td>${data.supplier}</td>
        `;
        previewTrials.appendChild(row);
    });
    
    // Auto-select best model based on highest satisfaction
    selectBestModel();
}

function selectBestModel() {
    const trials = document.querySelectorAll('.trial-entry');
    let maxSatisfaction = 0;
    let bestModel = '';
    let bestSupplier = '';
    
    trials.forEach(trial => {
        const satisfaction = parseInt(trial.querySelector('.trial-satisfaction').value) || 0;
        const model = trial.querySelector('.trial-model').value || '';
        const supplier = trial.querySelector('.trial-supplier').value || '';
        
        if (satisfaction > maxSatisfaction) {
            maxSatisfaction = satisfaction;
            bestModel = model;
            bestSupplier = supplier;
        }
    });
    
    document.getElementById('selectedModel').value = bestModel;
    document.getElementById('selectedSupplier').value = bestSupplier;
    document.getElementById('preview-selectedModel').textContent = bestModel;
    document.getElementById('preview-selectedSupplier').textContent = bestSupplier;
}

document.getElementById('addTrial').addEventListener('click', () => {
    addTrialEntry();
});

// Auto-set fitting based on ear affected
document.getElementById('earAffected').addEventListener('change', function() {
    const earAffected = this.value;
    const fittingSelects = document.querySelectorAll('.trial-fitting');
    
    if (earAffected === 'Bilateral') {
        fittingSelects.forEach(select => select.value = 'Binaural');
    } else {
        fittingSelects.forEach(select => select.value = 'Monoaural');
    }
    
    updateTrialsPreview();
});

// ===== NUMBER TO WORDS CONVERSION =====
const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertChunk(n) {
    let s = '';
    if (n >= 100) {
        s += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
    }
    if (n >= 10 && n <= 19) {
        s += teens[n - 10];
    } else if (n >= 20) {
        s += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
    }
    if (n >= 1 && n <= 9) {
        s += units[n];
    }
    return s.trim();
}

function numberToWords(num) {
    if (num === null || isNaN(num) || num === '') {
        return '';
    }
    num = Math.floor(Number(num)); // Ensure it's an integer

    if (num === 0) return 'Zero only';

    let words = '';
    let crore = Math.floor(num / 10000000); // 1 Crore = 10,000,000
    num %= 10000000;
    let lakh = Math.floor(num / 100000); // 1 Lakh = 100,000
    num %= 100000;
    let thousand = Math.floor(num / 1000);
    num %= 1000;

    if (crore > 0) {
        words += convertChunk(crore) + ' Crore ';
    }
    if (lakh > 0) {
        words += convertChunk(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
        words += convertChunk(thousand) + ' Thousand ';
    }
    if (num > 0) {
        words += convertChunk(num);
    }

    return words.trim() + ' only';
}

function setupNumberToWords(numInputId, previewWordsId) {
    const numInput = document.getElementById(numInputId);
    const previewWords = document.getElementById(previewWordsId);

    if (numInput && previewWords) {
        const placeholderHTML = previewWords.innerHTML;
        const updateWords = () => {
            const words = numberToWords(numInput.value);
            if (numInput.value) {
                previewWords.textContent = words;
            } else {
                previewWords.innerHTML = placeholderHTML;
            }
            if (numInputId === 'warranty') updateConsentStatement(); // Update consent if warranty changes
        };
        numInput.addEventListener('input', updateWords);
    }
}

// ===== DISCOUNT PERCENTAGE CALCULATION =====
function updateDiscountPercentage() {
    const mrpInput = document.getElementById('mrp');
    const discountPriceInput = document.getElementById('discountPrice');
    const percentagePreview = document.getElementById('preview-discountPercentage');

    if (mrpInput && discountPriceInput && percentagePreview) {
        const mrp = parseFloat(mrpInput.value);
        const discountPrice = parseFloat(discountPriceInput.value);

        if (mrp > 0 && discountPrice >= 0 && mrp >= discountPrice) {
            const discount = mrp - discountPrice;
            const percentage = (discount / mrp) * 100;
            if (percentage > 0) {
                percentagePreview.textContent = `(${percentage.toFixed(2)}% off)`;
            } else {
                percentagePreview.textContent = '';
            }
        } else {
            percentagePreview.textContent = '';
        }
    }
}

// ===== PDF EXPORT =====
document.getElementById('exportPDF').addEventListener('click', function() {
    const element = document.getElementById('reportPreview');
    const rawCardNo = (document.getElementById('echsCardNo') && document.getElementById('echsCardNo').value) || '';
    const safeCardNo = rawCardNo.trim()
        .replace(/[\\\/:*?"<>|]/g, '') // remove invalid filename chars
        .replace(/\s+/g, '_') || 'Hearing_Aid_Report';
    const filename = `${safeCardNo}.pdf`;
    
    const opt = {
        margin: [7, 0, 15, 0],
        filename: filename,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 3,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };
    
    html2pdf().set(opt).from(element).save();
});

// ===== LOCAL STORAGE - SAVE & LOAD =====
const formStateKey = 'hearingReportFormData';

function saveFormState() {
    const state = {
        trials: []
    };

    // Save all standard inputs, selects, and textareas
    document.querySelectorAll('.input-panel input, .input-panel select, .input-panel textarea').forEach(el => {
        if (el.id) {
            state[el.id] = el.value;
        }
    });

    // Save dynamic trial entries
    document.querySelectorAll('.trial-entry').forEach(trial => {
        state.trials.push({
            model: trial.querySelector('.trial-model').value,
            type: trial.querySelector('.trial-type').value,
            fitting: trial.querySelector('.trial-fitting').value,
            sds: trial.querySelector('.trial-sds').value,
            satisfaction: trial.querySelector('.trial-satisfaction').value,
            supplier: trial.querySelector('.trial-supplier').value,
        });
    });

    localStorage.setItem(formStateKey, JSON.stringify(state));
}

function loadFormState() {
    const savedState = localStorage.getItem(formStateKey);
    if (!savedState) {
        // If no saved state, run default initialization
        addTrialEntry();
        updateTrialsPreview();
        return;
    }

    const state = JSON.parse(savedState);

    // Load standard inputs
    Object.keys(state).forEach(key => {
        if (key !== 'trials') {
            const el = document.getElementById(key);
            if (el) {
                el.value = state[key];
            }
        }
    });

    // Load dynamic trial entries
    trialsContainer.innerHTML = ''; // Clear default trial
    if (state.trials && state.trials.length > 0) {
        state.trials.forEach((trialData, index) => addTrialEntry(index + 1, trialData));
        trialCount = state.trials.length;
    } else {
        // If no trials were saved, add one default entry
        addTrialEntry();
    }

    // Trigger all update functions to refresh the preview
    document.querySelectorAll('.input-panel input, .input-panel select, .input-panel textarea').forEach(el => {
        if (el.id) {
            el.dispatchEvent(new Event('input'));
            el.dispatchEvent(new Event('change'));
        }
    });
    
    updateTrialsPreview();
    collectAudiogramData();
    updateConsentStatement();
    updateDiscountPercentage();
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Load saved state from localStorage
    loadFormState();

    // Add event listeners to save form state on any input
    document.querySelector('.input-panel').addEventListener('input', saveFormState);
    document.querySelector('.input-panel').addEventListener('change', saveFormState);

    // Setup number-to-words conversion
    setupNumberToWords('mrp', 'preview-mrpWords');
    setupNumberToWords('discountPrice', 'preview-discountPriceWords');
    setupNumberToWords('warranty', 'preview-warrantyWords');

    // Setup discount percentage calculation
    document.getElementById('mrp').addEventListener('input', updateDiscountPercentage);
    document.getElementById('discountPrice').addEventListener('input', updateDiscountPercentage);

    // Set initial state for relation fields
    handleRelationChange();
});
