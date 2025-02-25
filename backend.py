from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

# FCFS Algorithm
def fcfs(requests, head):
    seek_sequence = [head] + requests
    total_seek = sum(abs(seek_sequence[i] - seek_sequence[i + 1]) for i in range(len(seek_sequence) - 1))
    return seek_sequence, total_seek

# SSTF Algorithm
def sstf(requests, head):
    seek_sequence = [head]
    total_seek = 0
    while requests:
        closest = min(requests, key=lambda x: abs(x - head))
        total_seek += abs(head - closest)
        head = closest
        seek_sequence.append(head)
        requests.remove(closest)
    return seek_sequence, total_seek

# SCAN Algorithm
def scan(requests, head, disk_size=200):
    left = sorted([r for r in requests if r < head])
    right = sorted([r for r in requests if r >= head])
    seek_sequence = [head] + right + left[::-1]
    total_seek = abs(head - right[-1]) + abs(left[0] - right[-1]) if left else abs(head - right[-1])
    return seek_sequence, total_seek

@app.route('/schedule', methods=['POST'])
def schedule():
    data = request.json
    requests = list(map(int, data['requests']))
    head = int(data['head'])
    algorithm = data['algorithm']

    if algorithm == 'fcfs':
        sequence, seek_time = fcfs(requests, head)
    elif algorithm == 'sstf':
        sequence, seek_time = sstf(requests, head)
    elif algorithm == 'scan':
        sequence, seek_time = scan(requests, head)

    return jsonify({'sequence': sequence, 'seekTime': seek_time})

if __name__ == '__main__':
    app.run(debug=True)
