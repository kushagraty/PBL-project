function runScheduler() {
    const requests = document.getElementById("requests").value.split(',').map(Number);
    const head = parseInt(document.getElementById("head").value);
    const algorithms = Array.from(document.getElementById("algorithm").selectedOptions).map(option => option.value);

    fetch('http://localhost:5000/schedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests, head, algorithms })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("seekTime").innerText = "Total Seek Times: " + JSON.stringify(data.seekTimes);
        document.getElementById("bestAlgorithm").innerText = "Best Algorithm: " + data.bestAlgorithm;
        visualize(data.bestSequence);
    });
}

function visualize(sequence) {
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sequence,
            datasets: [{
                label: 'Head Movement',
                data: sequence,
                borderColor: '#007bff',
                backgroundColor: '#007bff',
                fill: false,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        }
    });
}
