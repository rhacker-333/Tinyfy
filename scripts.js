class HuffmanNode {
    constructor(char, freq) {
        this.char = char;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }
}

function buildFrequencyTable(data) {
    let frequency = {};
    for (let char of data) {
        frequency[char] = (frequency[char] || 0) + 1;
    }
    return frequency;
}

function buildHuffmanTree(frequency) {
    let nodes = [];
    for (let char in frequency) {
        nodes.push(new HuffmanNode(char, frequency[char]));
    }
    nodes.sort((a, b) => a.freq - b.freq);

    while (nodes.length > 1) {
        let left = nodes.shift();
        let right = nodes.shift();
        let newNode = new HuffmanNode(null, left.freq + right.freq);
        newNode.left = left;
        newNode.right = right;
        nodes.push(newNode);
        nodes.sort((a, b) => a.freq - b.freq);
    }
    return nodes[0];
}

function generateCodes(root, code = "", codes = {}) {
    if (!root) return codes;
    if (root.char !== null) {
        codes[root.char] = code || '0';
    }
    generateCodes(root.left, code + "0", codes);
    generateCodes(root.right, code + "1", codes);
    return codes;
}

function huffmanCompress(data) {
    if (!data) return { encodedData: "", huffmanCodes: {} };
    let frequency = buildFrequencyTable(data);
    let huffmanTree = buildHuffmanTree(frequency);
    let huffmanCodes = generateCodes(huffmanTree);
    let encodedData = "";
    for (let char of data) {
        encodedData += huffmanCodes[char];
    }
    return { encodedData, huffmanCodes };
}

function binaryStringToByteArray(binaryString) {
    let byteArray = [];
    for (let i = 0; i < binaryString.length; i += 8) {
        let byte = binaryString.slice(i, i + 8).padEnd(8, '0');
        byteArray.push(parseInt(byte, 2));
    }
    return new Uint8Array(byteArray);
}

function downloadCompressedFile(data, filename) {
    const byteArray = binaryStringToByteArray(data);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function calculateSizeReduction(originalData, encodedData) {
    let originalSize = originalData.length * 8;
    let compressedSize = encodedData.length;
    let reductionPercentage = ((originalSize - compressedSize) / originalSize) * 100;
    return reductionPercentage;
}

function compressFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload a file first.');
        return;
    }
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    document.querySelector('.progress-bar-container').style.display = 'block';
    progressText.style.display = 'block';
    progressBar.style.width = '0%';
    progressPercent.textContent = '0';

    let progress = 0;
    const compressionDuration = 2000; // faster
    const intervalDuration = 100;
    const increment = (intervalDuration / compressionDuration) * 100;

    document.getElementById('result').classList.remove('show');
    document.getElementById('result').innerHTML = "";

    const interval = setInterval(() => {
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            const reader = new FileReader();
            reader.onload = function(event) {
                const data = event.target.result;
                const { encodedData } = huffmanCompress(data);
                const reduction = calculateSizeReduction(data, encodedData);

                const originalSizeMB = (data.length / (1024 * 1024)).toFixed(4);
                const compressedSizeMB = (encodedData.length / 8 / (1024 * 1024)).toFixed(4); 

                document.getElementById('result').innerHTML = `
                    <p>Original Size: ${originalSizeMB} MB</p>
                    <p>Compressed Size: ${compressedSizeMB} MB</p>
                    <p>Size Reduced by: ${reduction.toFixed(2)}%</p>
                    <button id="downloadButton">Download Compressed File</button>
                `;
                document.getElementById('result').classList.add('show');
                document.getElementById('downloadButton').addEventListener('click', () => {
                    downloadCompressedFile(encodedData, 'compressed.bin');
                });
            };
            reader.onerror = function() {
                alert('Could not read file!');
            }
            reader.readAsText(file);
        } else {
            progress += increment; 
            if (progress > 100) progress = 100; 
            progressBar.style.width = progress + '%';
            progressPercent.textContent = Math.floor(progress);
        }
    }, intervalDuration);
}
