from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Disk Scheduling Algorithms

def fcfs(requests, head):
    seek_sequence = [head] + requests
    total_seek = sum(abs(seek_sequence[i] - seek_sequence[i + 1]) for i in range(len(seek_sequence) - 1))
    return seek_sequence, total_seek

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

def scan(requests, head, disk_size):
    left = sorted([r for r in requests if r < head])
    right = sorted([r for r in requests if r >= head])
    seek_sequence = [head] + right + left[::-1]
    total_seek = abs(head - right[-1]) + (abs(left[0] - right[-1]) if left else 0)
    return seek_sequence, total_seek

def cscan(requests, head, disk_size):
    left = sorted([r for r in requests if r < head])
    right = sorted([r for r in requests if r >= head])
    seek_sequence = [head] + right + [disk_size - 1] + left
    total_seek = (abs(head - right[-1]) + (disk_size - right[-1]) + left[-1]) if left else abs(head - right[-1])
    return seek_sequence, total_seek

def look(requests, head):
    left = sorted([r for r in requests if r < head])
    right = sorted([r for r in requests if r >= head])
    seek_sequence = [head] + right + left[::-1]
    total_seek = abs(head - right[-1]) + (abs(left[0] - right[-1]) if left else 0)
    return seek_sequence, total_seek

@app.route('/schedule', methods=['POST'])
def schedule():
    data = request.json
    requests = list(map(int, data['requests']))
    head = int(data['head'])
    disk_size = int(data['diskSize'])
    algorithms = data['algorithms']

    results = {}
    for algo in algorithms:
        if algo == 'fcfs':
            sequence, seek_time = fcfs(requests.copy(), head)
        elif algo == 'sstf':
            sequence, seek_time = sstf(requests.copy(), head)
        elif algo == 'scan':
            sequence, seek_time = scan(requests.copy(), head, disk_size)
        elif algo == 'cscan':
            sequence, seek_time = cscan(requests.copy(), head, disk_size)
        elif algo == 'look':
            sequence, seek_time = look(requests.copy(), head)

        results[algo] = {'sequence': sequence, 'seekTime': seek_time}

    best_algo = min(results, key=lambda x: results[x]['seekTime'])
    disk_utilization = round((sum(results[best_algo]['sequence']) / disk_size) * 100, 2)
    
    return jsonify({
        'seekTimes': {algo: results[algo]['seekTime'] for algo in results},
        'bestAlgorithm': best_algo,
        'bestSequence': results[best_algo]['sequence'],
        'diskUtilization': disk_utilization
    })

if __name__ == '__main__':
    app.run(debug=True)
