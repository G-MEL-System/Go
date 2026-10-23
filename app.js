document.getElementById('fieldForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const statusEl = document.getElementById('statusMessage');

    // 1. Gather data from form inputs
    const formData = {
        id: 'gmel_' + Date.now(),
        timestamp: new Date().toISOString(),
        siteName: document.getElementById('siteName').value,
        metrics: document.getElementById('metrics').value
    };

    // 2. Check if online and submit or queue
    if (navigator.onLine) {
        try {
            statusEl.textContent = 'Submitting to server...';
            await sendToServer(formData);
            statusEl.textContent = 'Success! Data submitted.';
            document.getElementById('fieldForm').reset();
        } catch (error) {
            console.error('Submission failed, saving offline:', error);
            saveToOfflineQueue(formData);
            statusEl.textContent = 'Offline or server error. Saved locally for later sync!';
            document.getElementById('fieldForm').reset();
        }
    } else {
        saveToOfflineQueue(formData);
        statusEl.textContent = 'No internet connection. Saved locally! Will auto-sync when online.';
        document.getElementById('fieldForm').reset();
    }
});

// Save to browser localStorage queue
function saveToOfflineQueue(data) {
    let queue = JSON.parse(localStorage.getItem('gMelOfflineQueue')) || [];
    queue.push(data);
    localStorage.setItem('gMelOfflineQueue', JSON.stringify(queue));
}

// Auto-sync when internet reconnects
window.addEventListener('online', async () => {
    let queue = JSON.parse(localStorage.getItem('gMelOfflineQueue')) || [];
    if (queue.length === 0) return;

    let remainingQueue = [];
    for (const item of queue) {
        try {
            await sendToServer(item);
        } catch (error) {
            remainingQueue.push(item);
        }
    }
    localStorage.setItem('gMelOfflineQueue', JSON.stringify(remainingQueue));
    if (remainingQueue.length === 0) {
        console.log('All offline data successfully synced!');
    }
});

// Mock function where your backend URL goes
async function sendToServer(data) {
    const response = await fetch('YOUR_BACKEND_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Network response failed');
    return response.json();
}
