const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spin-button");
const nameInput = document.getElementById("name-input");
const loadNamesBtn = document.getElementById("load-names-btn");
const magnifierDisplay = document.getElementById("magnifier-display");
const magnifierName = magnifierDisplay.querySelector(".magnifier-name");
const magnifierLabel = magnifierDisplay.querySelector(".magnifier-label");
const spinnerView = document.getElementById("spinner-view");
const namesView = document.getElementById("names-view");

let names = [];
let currentRotation = 0;
let animationFrameId = null;
let currentView = "spinner";
const originalLabel = magnifierLabel.innerText;

// The colors for the wheel segments
const segmentColors = [
    "#f1babaff",
    "#bcc0e2ff",
    "#e4beddff", 
    "#ecc9c9ff",     
    "#ebd7a4ff",
];

// Switch between views
function switchView(viewName) {
    if (viewName === "spinner") {
        spinnerView.classList.add("active");
        namesView.classList.remove("active");
        currentView = "spinner";
    } else {
        spinnerView.classList.remove("active");
        namesView.classList.add("active");
        currentView = "names";
    }
}

// Spacebar to switch views
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && document.activeElement !== nameInput) {
        e.preventDefault();
        if (currentView === "spinner") {
            switchView("names");
        } else {
            switchView("spinner");
        }
    }
});

// Load names from textarea
function loadNamesFromInput() {
    const text = nameInput.value;
    names = text.split('\n').map(name => name.trim()).filter(name => name !== '');
    
    if (names.length > 0) {
        magnifierName.innerText = "-";
        drawWheel();
        switchView("spinner");
    } else {
        magnifierName.innerText = "Please enter at least one name!";
    }
}

// 2. Draw the wheel
function drawWheel() {
    if (names.length === 0) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;
    const arcSize = (2 * Math.PI) / names.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < names.length; i++) {
        const angle = i * arcSize;
        
        // Draw segment
        ctx.beginPath();
        ctx.fillStyle = segmentColors[i % segmentColors.length];
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
        ctx.fill();

        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";

        display_name = names[i].length > 15 ? names[i].substring(0, 15) + "..." : names[i];

        if (names.length < 20) {
            ctx.font = "bold 18px sans-serif";
            ctx.fillText(display_name, radius - 15, 7);
        } else if (names.length < 40) {
            ctx.font = "bold 16px sans-serif";
            ctx.fillText(display_name, radius - 14, 5);
        } else if (names.length < 60) {
            ctx.font = "bold 14px sans-serif";
            ctx.fillText(display_name, radius - 13, 4);
        } else if (names.length < 80) {
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(display_name, radius - 12, 4);
        } else if (names.length < 151) {
            ctx.font = "bold 10px sans-serif";
            ctx.fillText(display_name, radius - 10, 3);
        } else {
            ctx.font = "bold 6px sans-serif";
            ctx.fillText(display_name, radius - 10, 2);
        }

        ctx.restore();
    }
}

// 3. The Spin Logic
function spinWheel() {
    if (names.length === 0) return;
    
    spinButton.disabled = true;

    // Add 5-8 full rotations plus a random extra amount
    const randomDegrees = Math.floor(Math.random() * 360);
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 4)); // 5 to 8 full spins
    const targetRotation = currentRotation + extraSpins + randomDegrees;

    canvas.style.transform = `rotate(${targetRotation}deg)`;

    // Start real-time magnifier updates
    animationFrameId = requestAnimationFrame(updateMagnifierLoop);

    // Wait for the 10-second CSS transition to finish
    setTimeout(() => {
        currentRotation = targetRotation;
        calculateWinner();
        spinButton.disabled = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        // Add winner animation
        magnifierDisplay.classList.add("winner");
        magnifierLabel.innerText = "Gewinner";
        setTimeout(() => {
            magnifierDisplay.classList.remove("winner");
            magnifierLabel.innerText = originalLabel;
        }, 10000);
    }, 10000);
}

// Get current rotation from CSS transform
function getCurrentRotation() {
    const style = window.getComputedStyle(canvas);
    const transform = style.transform;
    
    if (transform === 'none') {
        return 0;
    }
    
    // Extract rotation from matrix(a, b, c, d, e, f)
    const matrix = new WebKitCSSMatrix(transform);
    const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
    
    // Normalize to 0-360 range
    return (angle + 360) % 360;
}

// Update magnifier display with current segment
function updateMagnifier(showFull = false) {
    if (names.length === 0) return;
    
    const currentRot = getCurrentRotation();
    const arcSizeDegrees = 360 / names.length;
    // The pointer is at the top (270 degrees in canvas math)
    const adjustedRotation = (360 - currentRot + 270) % 360;
    const currentIndex = Math.floor(adjustedRotation / arcSizeDegrees);
    
    // Show full name when requested, otherwise truncate
    let displayName = names[currentIndex];
    if (!showFull && displayName.length > 15) {
        //displayName = displayName.substring(0, 15) + "...";
    }
    
    magnifierName.innerText = displayName;
}

// Animation loop for smooth magnifier updates
function updateMagnifierLoop() {
    updateMagnifier();
    animationFrameId = requestAnimationFrame(updateMagnifierLoop);
}

// 4. Figure out who won based on the final angle
function calculateWinner() {
    updateMagnifier(true); // Show full name when wheel stops
}

// Event listeners
loadNamesBtn.addEventListener("click", loadNamesFromInput);
spinButton.addEventListener("click", spinWheel);

// Load initial names on startup
loadNamesFromInput();
