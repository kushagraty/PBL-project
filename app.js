function runScheduler() {
    const requests = document.getElementById("requests").value.split(',').map(Number);
    const head = parseInt(document.getElementById("head").value);
    const algorithm = document.getElementById("algorithm").value;

    fetch('/schedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests, head, algorithm })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("seekTime").innerText = "Total Seek Time: " + data.seekTime;
        visualize(data.sequence);
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
                fill: false,
                tension: 0.1
            }]
        }
    });
}
