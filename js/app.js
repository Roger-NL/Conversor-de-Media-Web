const fileInput = document.getElementById('file-input');
const selectFilesBtn = document.getElementById('initial-upload-btn');
const clearFilesBtn = document.getElementById('clear-files');
const formatSelect = document.getElementById('format-select');
const extensionSelect = document.getElementById('extension-select');
const editSelectedBtn = document.getElementById('edit-selected');
const convertSaveBtn = document.getElementById('convert-save');
const fileList = document.getElementById('file-list');
const imageToEditSelect = document.getElementById('image-to-edit');
const cropX = document.getElementById('crop-x');
const cropY = document.getElementById('crop-y');
const cropWidth = document.getElementById('crop-width');
const cropHeight = document.getElementById('crop-height');
const rotationSelect = document.getElementById('rotation-select');
const flipSelect = document.getElementById('flip-select');
const brightness = document.getElementById('brightness');
const contrast = document.getElementById('contrast');
const saturation = document.getElementById('saturation');
const filterSelect = document.getElementById('filter-select');
const watermarkText = document.getElementById('watermark-text');
const watermarkColor = document.getElementById('watermark-color');
const watermarkSize = document.getElementById('watermark-size');
const watermarkX = document.getElementById('watermark-x');
const watermarkY = document.getElementById('watermark-y');
const quality = document.getElementById('quality');
const advancedResetBtn = document.getElementById('advanced-reset');
const editPreview = document.getElementById('edit-preview');
const saveEditedBtn = document.getElementById('save-edited');
const libraryList = document.getElementById('library-list');
const menuToggle = document.getElementById('menu-toggle');
const editPanel = document.getElementById('edit-panel');
const editCloseBtn = document.getElementById('edit-close');
const libraryPanel = document.getElementById('library-panel');
const libraryToggle = document.getElementById('library-toggle');
const libraryClose = document.getElementById('library-close');
const uploadIcon = document.getElementById('upload-icon');
const filePanel = document.getElementById('file-list');

let filesData = [];
let libraryData = [];
let selectedIndexes = [];
let editingIndex = null;
let currentPreviewBlob = null;

menuToggle.addEventListener('click', () => {
document.body.classList.toggle('show-controls');
});

libraryToggle.addEventListener('click', () => {
document.body.classList.toggle('show-library');
});

libraryClose.addEventListener('click', () => {
document.body.classList.remove('show-library');
});

selectFilesBtn.addEventListener('click', () => {
fileInput.click();
});

uploadIcon.addEventListener('click', () => {
fileInput.click();
});

fileInput.addEventListener('change', () => {
loadFiles(fileInput.files);
});

clearFilesBtn.addEventListener('click', () => {
filesData.forEach(item => URL.revokeObjectURL(item.url));
filesData = [];
selectedIndexes = [];
document.body.classList.remove('has-files');
renderFileList();
});

filePanel.addEventListener('dragover', (e) => {
e.preventDefault();
filePanel.classList.add('dragover');
});

filePanel.addEventListener('dragleave', (e) => {
filePanel.classList.remove('dragover');
});

filePanel.addEventListener('drop', (e) => {
e.preventDefault();
filePanel.classList.remove('dragover');
if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
loadFiles(e.dataTransfer.files);
}
});

function loadFiles(selectedFiles) {
for (let i = 0; i < selectedFiles.length; i++) {
const file = selectedFiles[i];
const url = URL.createObjectURL(file);
filesData.push({ file, url });
}
if (filesData.length > 0) {
document.body.classList.add('has-files');
}
renderFileList();
}

function renderFileList() {
fileList.innerHTML = '';
filesData.forEach((item, index) => {
const container = document.createElement('div');
container.classList.add('item-container');

let isImage = item.file.type.startsWith('image/');
let isVideo = item.file.type.startsWith('video/');

let thumb;
if (isImage) {
thumb = document.createElement('img');
thumb.src = item.url;
} else if (isVideo) {
thumb = document.createElement('div');
thumb.classList.add('video-thumb');
thumb.innerText = 'Video';
}

const label = document.createElement('div');
label.classList.add('item-label');
label.innerText = getExtension(item.file.name);

const removeBtn = document.createElement('button');
removeBtn.innerText = 'X';
removeBtn.classList.add('remove-btn');
removeBtn.addEventListener('click', () => {
URL.revokeObjectURL(item.url);
filesData.splice(index, 1);
const pos = selectedIndexes.indexOf(index);
if (pos > -1) selectedIndexes.splice(pos, 1);
reindexSelection();
if (filesData.length === 0) {
document.body.classList.remove('has-files');
}
renderFileList();
});

const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.classList.add('select-file');
checkbox.checked = selectedIndexes.includes(index);
checkbox.addEventListener('change', () => {
if (checkbox.checked) {
selectedIndexes.push(index);
} else {
const pos = selectedIndexes.indexOf(index);
if (pos > -1) selectedIndexes.splice(pos, 1);
}
reindexSelection();
});

const boxContainer = document.createElement('div');
boxContainer.classList.add('select-box');
boxContainer.appendChild(checkbox);

container.appendChild(thumb);
container.appendChild(label);
container.appendChild(removeBtn);
container.appendChild(boxContainer);
fileList.appendChild(container);
});
}

function reindexSelection() {
selectedIndexes.sort((a,b) => a-b);
}

function getExtension(filename) {
return '.' + filename.split('.').pop().toLowerCase();
}

editSelectedBtn.addEventListener('click', () => {
if (selectedIndexes.length === 0) {
alert('Please select at least one file.');
return;
}
updateImageToEditSelect();
showEditPanel(true);
applyPreview();
});

function updateImageToEditSelect() {
imageToEditSelect.innerHTML = '';
selectedIndexes.forEach((idx) => {
const opt = document.createElement('option');
opt.value = idx;
opt.innerText = filesData[idx].file.name;
imageToEditSelect.appendChild(opt);
});
editingIndex = selectedIndexes[0];
imageToEditSelect.value = editingIndex;
}

function showEditPanel(show) {
if (show) {
document.body.classList.add('show-edit');
} else {
document.body.classList.remove('show-edit');
}
}

[ cropX, cropY, cropWidth, cropHeight, rotationSelect, flipSelect, brightness, contrast, saturation, filterSelect, watermarkText, watermarkColor, watermarkSize, watermarkX, watermarkY, quality].forEach(ctrl => {
ctrl.addEventListener('input', applyPreview);
});

advancedResetBtn.addEventListener('click', () => {
cropX.value = 0;
cropY.value = 0;
cropWidth.value = 1080;
cropHeight.value = 1920;
rotationSelect.value = "0";
flipSelect.value = "none";
brightness.value = 100;
contrast.value = 100;
saturation.value = 100;
filterSelect.value = "none";
watermarkText.value = "";
watermarkColor.value = "#ffffff";
watermarkSize.value = 48;
watermarkX.value = 50;
watermarkY.value = 100;
quality.value = 90;
applyPreview();
});

function applyPreview() {
if (editingIndex === null) return;
const item = filesData[editingIndex];
if (!item.file.type.startsWith('image/')) {
return;
}
const format = formatSelect.value;
const extension = extensionSelect.value;
const size = getSizeFromFormat(format);
const cx = parseInt(cropX.value);
const cy = parseInt(cropY.value);
const cw = parseInt(cropWidth.value);
const ch = parseInt(cropHeight.value);
const rot = parseInt(rotationSelect.value);
const flip = flipSelect.value;
const bright = parseInt(brightness.value);
const cont = parseInt(contrast.value);
const sat = parseInt(saturation.value);
const filt = filterSelect.value;
const wText = watermarkText.value;
const wColor = watermarkColor.value;
const wSize = parseInt(watermarkSize.value);
const wX = parseInt(watermarkX.value);
const wY = parseInt(watermarkY.value);
const qual = parseInt(quality.value) / 100;

convertImage(item.file, extension, size.width, size.height, cx, cy, cw, ch, rot, flip, bright, cont, sat, filt, wText, wColor, wSize, wX, wY, qual).then(result => {
const img = new Image();
const url = URL.createObjectURL(result.blob);
img.onload = () => {
const ctx = editPreview.getContext('2d');
ctx.clearRect(0,0,editPreview.width,editPreview.height);
ctx.fillStyle = '#000';
ctx.fillRect(0,0,editPreview.width,editPreview.height);
let ratio = Math.min(editPreview.width / img.width, editPreview.height / img.height);
let nw = img.width * ratio;
let nh = img.height * ratio;
let xx = (editPreview.width - nw)/2;
let yy = (editPreview.height - nh)/2;
ctx.drawImage(img, xx, yy, nw, nh);
URL.revokeObjectURL(url);
};
img.src = url;
currentPreviewBlob = result.blob;
});
}

saveEditedBtn.addEventListener('click', () => {
if (!currentPreviewBlob) {
alert('No edited image available.');
return;
}
const reader = new FileReader();
reader.onload = (e) => {
libraryData.push(e.target.result);
renderLibraryList();
};
reader.readAsDataURL(currentPreviewBlob);
});

function renderLibraryList() {
libraryList.innerHTML = '';
libraryData.forEach((dataUrl, idx) => {
const container = document.createElement('div');
container.classList.add('item-container');
const img = document.createElement('img');
img.src = dataUrl;
const label = document.createElement('div');
label.classList.add('item-label');
label.innerText = 'Edit.';
const removeBtn = document.createElement('button');
removeBtn.innerText = 'X';
removeBtn.classList.add('remove-btn');
removeBtn.addEventListener('click', () => {
libraryData.splice(idx,1);
renderLibraryList();
});
const downloadBtn = document.createElement('button');
downloadBtn.innerText = '↓';
downloadBtn.classList.add('download-btn');
downloadBtn.addEventListener('click', () => {
downloadFileBase64(dataUrl, 'edited-image.png');
});

container.appendChild(img);
container.appendChild(label);
container.appendChild(removeBtn);
container.appendChild(downloadBtn);
libraryList.appendChild(container);
});
}

function downloadFileBase64(base64, filename) {
const a = document.createElement('a');
a.href = base64;
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
}

convertSaveBtn.addEventListener('click', () => {
if (selectedIndexes.length === 0) {
alert('Please select at least one file.');
return;
}
const format = formatSelect.value;
const extension = extensionSelect.value;
const size = getSizeFromFormat(format);
const cx = parseInt(cropX.value);
const cy = parseInt(cropY.value);
const cw = parseInt(cropWidth.value);
const ch = parseInt(cropHeight.value);
const rot = parseInt(rotationSelect.value);
const flip = flipSelect.value;
const bright = parseInt(brightness.value);
const cont = parseInt(contrast.value);
const sat = parseInt(saturation.value);
const filt = filterSelect.value;
const wText = watermarkText.value;
const wColor = watermarkColor.value;
const wSize = parseInt(watermarkSize.value);
const wX = parseInt(watermarkX.value);
const wY = parseInt(watermarkY.value);
const qual = parseInt(quality.value) / 100;

const tasks = selectedIndexes.map(idx => {
const item = filesData[idx];
if (item.file.type.startsWith('image/')) {
return convertImage(item.file, extension, size.width, size.height, cx, cy, cw, ch, rot, flip, bright, cont, sat, filt, wText, wColor, wSize, wX, wY, qual).then(result => {
downloadFile(result.blob, getFileName(item.file.name, extension));
const reader = new FileReader();
reader.onload = (e) => {
libraryData.push(e.target.result);
renderLibraryList();
};
reader.readAsDataURL(result.blob);
});
} else {
return Promise.resolve();
}
});

Promise.all(tasks).then(() => {
alert('Conversion completed.');
});
});

function getSizeFromFormat(format) {
if (format === 'instagram-vertical' || format === 'youtube-vertical' || format === 'tiktok') {
return { width: 1080, height: 1920 };
} else if (format === 'youtube-horizontal') {
return { width: 1920, height: 1080 };
}
return { width: 0, height: 0 };
}

function convertImage(file, extension, width, height, cx, cy, cw, ch, rot, flip, bright, cont, sat, filt, wText, wColor, wSize, wX, wY, qual) {
return new Promise((resolve) => {
const img = new Image();
const reader = new FileReader();
reader.onload = (e) => {
img.onload = () => {
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#000';
ctx.fillRect(0,0,width,height);

let ratio = Math.min(width / img.width, height / img.height);
let newWidth = img.width * ratio;
let newHeight = img.height * ratio;
let x = (width - newWidth) / 2;
let y = (height - newHeight) / 2;
ctx.drawImage(img, x, y, newWidth, newHeight);

let imageData = ctx.getImageData(0,0,width,height);
const bufferCanvas = document.createElement('canvas');
bufferCanvas.width = width;
bufferCanvas.height = height;
const bctx = bufferCanvas.getContext('2d');
bctx.putImageData(imageData,0,0);

const cCanvas = document.createElement('canvas');
cCanvas.width = cw;
cCanvas.height = ch;
const cctx = cCanvas.getContext('2d');
cctx.drawImage(bufferCanvas, cx, cy, cw, ch, 0, 0, cw, ch);

const rCanvas = document.createElement('canvas');
rCanvas.width = cw;
rCanvas.height = ch;
const rctx = rCanvas.getContext('2d');
rctx.translate(rCanvas.width/2, rCanvas.height/2);
rctx.rotate(rot * Math.PI/180);
if (flip === 'horizontal') {
rctx.scale(-1,1);
} else if (flip === 'vertical') {
rctx.scale(1,-1);
}
rctx.translate(-rCanvas.width/2, -rCanvas.height/2);
rctx.drawImage(cCanvas,0,0);

let cssFilter = `brightness(${bright}%) contrast(${cont}%) saturate(${sat}%)`;
if (filt === 'grayscale') cssFilter += ' grayscale(100%)';
if (filt === 'sepia') cssFilter += ' sepia(100%)';

const fCanvas = document.createElement('canvas');
fCanvas.width = rCanvas.width;
fCanvas.height = rCanvas.height;
const fctx = fCanvas.getContext('2d');
fctx.filter = cssFilter;
fctx.drawImage(rCanvas,0,0);

if (wText && wText.trim() !== '') {
fctx.font = `${wSize}px sans-serif`;
fctx.fillStyle = wColor;
fctx.fillText(wText, wX, wY);
}

const resultCanvas = document.createElement('canvas');
resultCanvas.width = fCanvas.width;
resultCanvas.height = fCanvas.height;
const r2ctx = resultCanvas.getContext('2d');
r2ctx.drawImage(fCanvas,0,0);

const mime = getMimeTypeFromExtension(extension);
resultCanvas.toBlob((blob) => {
resolve({ blob });
}, mime, mime.includes('jpeg')||mime.includes('webp') ? qual : 1);
};
img.src = e.target.result;
};
reader.readAsDataURL(file);
});
}

function getMimeTypeFromExtension(ext) {
if (ext === '.jpg') return 'image/jpeg';
if (ext === '.png') return 'image/png';
if (ext === '.webp') return 'image/webp';
return 'image/jpeg';
}

function getFileName(originalName, extension) {
let name = originalName.split('.').slice(0, -1).join('.');
return name + extension;
}

function downloadFile(blob, filename) {
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
}

editCloseBtn.addEventListener('click', () => {
document.body.classList.remove('show-edit');
});

libraryClose.addEventListener('click', () => {
document.body.classList.remove('show-library');
});
