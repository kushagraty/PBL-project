let chartInstance = null;
function runScheduler() {
    let requestsInput = document.getElementById("requests");
    let headInput = document.getElementById("head");
    let diskSizeInput = document.getElementById("diskSize");

    let requestsValue = requestsInput.value.trim();
    let headValue = headInput.value.trim();
    let diskSizeValue = diskSizeInput.value.trim() || "200";

    // Remove previous error styles
    requestsInput.classList.remove("input-error");
    headInput.classList.remove("input-error");
    diskSizeInput.classList.remove("input-error");

    if (!requestsValue || !headValue) {
        alert("All fields are required. Please enter valid numeric values.");
        
        if (!requestsValue) requestsInput.classList.add("input-error");
        if (!headValue) headInput.classList.add("input-error");

        return;
    }

    let requestsArray = requestsValue.split(",").map(num => num.trim());
    if (!requestsArray.every(num => /^\d+$/.test(num))) {
        alert("Request Sequence should contain only numeric values separated by commas.");
        requestsInput.classList.add("input-error");
        return;
    }

    if (isNaN(headValue) || isNaN(diskSizeValue)) {
        alert("Initial Head Position and Disk Size must be valid numbers.");
        headInput.classList.add("input-error");
        diskSizeInput.classList.add("input-error");
        return;
    }

    const requests = requestsArray.map(Number);
    const head = parseInt(headValue);
    const diskSize = parseInt(diskSizeValue);

    if (head < 0 || diskSize <= 0) {
        alert("Initial Head Position must be non-negative and Disk Size must be greater than 0.");
        return;
    }

    const selectedAlgorithms = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value);
    if (selectedAlgorithms.length === 0) {
        alert("Please select at least one algorithm.");
        return;
    }

    fetch('http://localhost:5000/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests, head, diskSize, algorithms: selectedAlgorithms })
    })
    .then(response => response.json())
    .then(data => {
        const resultsDiv = document.getElementById("algorithmResults");
        resultsDiv.innerHTML = "";

        selectedAlgorithms.forEach(algo => {
            resultsDiv.innerHTML += `<p>${algo.toUpperCase()} - Total Seek Time: ${data.seekTimes[algo]}</p>`;
        });

        // Animate Best Algorithm Text
        let bestAlgoText = document.getElementById("bestAlgorithm");
        bestAlgoText.innerText = "Best Algorithm: " + data.bestAlgorithm.toUpperCase();
        bestAlgoText.classList.add("highlight");

        let diskUtilizationText = document.getElementById("diskUtilization");
        diskUtilizationText.innerText = "Disk Utilization: " + data.diskUtilization + "%";
        
        visualize(data.bestSequence);

        // Remove highlight effect after 2 seconds
        setTimeout(() => {
            bestAlgoText.classList.remove("highlight");
        }, 2000);
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while processing the request.");
    });
}

function visualize(sequence) {
    const ctx = document.getElementById('chart').getContext('2d');

    // Destroy previous chart if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new empty chart
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Head Movement',
                data: [],
                borderColor: '#007bff',
                backgroundColor: '#007bff',
                fill: false,
                pointRadius: 5
            }]
        },
        options: {
            animation: {
                duration: 500 // Smooth animation for each point
            }
        }
    });

    // Animate points one by one
    let index = 0;
    function addPoint() {
        if (index < sequence.length) {
            chartInstance.data.labels.push(sequence[index]);
            chartInstance.data.datasets[0].data.push(sequence[index]);
            chartInstance.update();

            index++;
            setTimeout(addPoint, 500); // Delay between points for animation effect
        }
    }

    addPoint(); // Start the animation
}

