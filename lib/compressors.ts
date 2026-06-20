// client-side compression and conversion utility functions for vixAR

// Helper to encode AudioBuffer to a standard 16-bit PCM WAV file
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // 1 = raw PCM
    const bitDepth = 16;
    
    let result;
    if (numOfChan === 2) {
        result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
        result = buffer.getChannelData(0);
    }
    
    const bufferLength = result.length * 2;
    const wavBuffer = new ArrayBuffer(44 + bufferLength);
    const view = new DataView(wavBuffer);
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + bufferLength, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw PCM)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numOfChan, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numOfChan * (bitDepth / 8), true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, bufferLength, true);
    
    floatTo16BitPCM(view, 44, result);
    
    return new Blob([view], { type: 'audio/wav' });
}

function interleave(inputL: Float32Array, inputR: Float32Array): Float32Array {
    const length = inputL.length + inputR.length;
    const result = new Float32Array(length);
    let index = 0;
    let inputIndex = 0;
    
    while (index < length) {
        result[index++] = inputL[inputIndex];
        result[index++] = inputR[inputIndex];
        inputIndex++;
    }
    return result;
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// ----------------------------------------------------
// Image Compressors (HEIC, AVIF, WebP, PNG, JPEG, SVG)
// ----------------------------------------------------

export async function optimizeSvg(text: string): Promise<string> {
    // 1. Clean SVG contents
    let cleaned = text
        .replace(/<\?xml[\s\S]*?\?>/gi, '')
        .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        // Clean metadata blocks
        .replace(/<(sodipodi|metadata|inkscape)[\s\S]*?<\/\1>/gi, '')
        .replace(/<(sodipodi|metadata|inkscape)[\s\S]*?\/>/gi, '')
        // Clean namespaces (keeping svg and xlink namespaces)
        .replace(/xmlns:[\w\-]+="[^"]*"/gi, (match) => {
            if (match.toLowerCase().includes('svg') || match.toLowerCase().includes('xlink')) {
                return match;
            }
            return '';
        })
        // Clean editor attributes
        .replace(/(sodipodi|inkscape|illustrator):[\w\-]+="[^"]*"/gi, '')
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();

    // 2. Metadata & Comment insertion
    const comment = "<!-- Optimized by vixAR - The Ultimate All-in-One Media & File Optimizer -->";
    const metadataTag = 
        `<metadata id="vixAR-metadata">` +
        `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ` +
        `xmlns:dc="http://purl.org/dc/elements/1.1/">` +
        `<rdf:Description rdf:about="" dc:format="image/svg+xml" dc:creator="vixAR" />` +
        `</rdf:RDF>` +
        `</metadata>`;

    // Insert metadata right after <svg...> opening tag
    const svgTagMatch = cleaned.match(/<svg[^>]*>/i);
    if (svgTagMatch) {
        const svgTag = svgTagMatch[0];
        cleaned = cleaned.replace(svgTag, `${svgTag}${metadataTag}`);
    }

    return `${comment}\n${cleaned}`;
}

export async function compressImage(
    file: File,
    quality: number, // 20 - 100
    format: string, // 'original' | 'webp' | 'png' | 'jpeg' | 'avif' | 'svg'
    resize: boolean,
    resizeWidth: number
): Promise<{ blob: Blob; savings: number }> {
    let sourceBlob: Blob = file;
    const nameLower = file.name.toLowerCase();

    // 1. Resolve HEIC/HEIF files if uploaded
    if (nameLower.endsWith('.heic') || nameLower.endsWith('.heif')) {
        try {
            const heic2any = (await import('heic2any')).default;
            const converted = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9,
            });
            sourceBlob = Array.isArray(converted) ? converted[0] : converted;
        } catch (e) {
            console.error("HEIC conversion failed, trying raw blob:", e);
        }
    }

    // 2. If SVG file and SVG optimization selected (or keep original)
    if ((nameLower.endsWith('.svg') || sourceBlob.type === 'image/svg+xml') && 
        (format === 'original' || format === 'svg')) {
        const text = await sourceBlob.text();
        const optimizedText = await optimizeSvg(text);
        const svgBlob = new Blob([optimizedText], { type: 'image/svg+xml' });
        const savings = Math.max(0, Math.round(((file.size - svgBlob.size) / file.size) * 100));
        return { blob: svgBlob, savings };
    }

    // 3. Process standard images on Canvas
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Could not construct 2D Canvas context"));
                    return;
                }

                let width = img.width;
                let height = img.height;

                if (resize && width > resizeWidth) {
                    const ratio = resizeWidth / width;
                    width = resizeWidth;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Determine target MIME type
                let mimeType = sourceBlob.type;
                if (format === 'webp') mimeType = 'image/webp';
                else if (format === 'png') mimeType = 'image/png';
                else if (format === 'jpeg') mimeType = 'image/jpeg';
                else if (format === 'avif') mimeType = 'image/avif';
                else if (format === 'heic') mimeType = 'image/heic';
                
                // Fallback to jpeg if browser can't negotiate original or non-standard
                if (!mimeType || mimeType === 'image/heic' || mimeType === 'image/heif') {
                    if (format !== 'heic') {
                        mimeType = 'image/jpeg';
                    }
                }

                const q = quality / 100;
                const exportMime = mimeType === 'image/heic' ? 'image/jpeg' : mimeType;
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Failed to export Canvas blob"));
                            return;
                        }
                        const finalBlob = mimeType === 'image/heic'
                            ? new Blob([blob], { type: 'image/heic' })
                            : blob;
                        const savings = Math.max(0, Math.round(((file.size - finalBlob.size) / file.size) * 100));
                        resolve({ blob: finalBlob, savings });
                    },
                    exportMime,
                    exportMime === 'image/png' ? undefined : q
                );
            };
            img.onerror = () => reject(new Error("Failed to load image resource"));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read image source"));
        reader.readAsDataURL(sourceBlob);
    });
}

// ----------------------------------------------------
// PDF Optimizers
// ----------------------------------------------------

export async function compressPdf(
    file: File,
    compressionLevel: 'extreme' | 'recommended' | 'low',
    merge: boolean,
    allPdfFiles?: File[]
): Promise<{ blob: Blob; savings: number }> {
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.create();

    if (merge && allPdfFiles && allPdfFiles.length > 0) {
        for (const f of allPdfFiles) {
            const bytes = await f.arrayBuffer();
            const subDoc = await PDFDocument.load(bytes);
            const pages = await doc.copyPages(subDoc, subDoc.getPageIndices());
            pages.forEach((p) => doc.addPage(p));
        }
    } else {
        const bytes = await file.arrayBuffer();
        const sourceDoc = await PDFDocument.load(bytes);
        const pages = await doc.copyPages(sourceDoc, sourceDoc.getPageIndices());
        pages.forEach((p) => doc.addPage(p));
    }

    // Reset Metadata
    doc.setTitle('');
    doc.setAuthor('');
    doc.setSubject('');
    doc.setCreator('');
    doc.setProducer('');

    const useObjectStreams = compressionLevel !== 'low';
    const outBytes = await doc.save({
        useObjectStreams,
    });

    const blob = new Blob([outBytes as unknown as BlobPart], { type: 'application/pdf' });
    const savings = Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100));
    return { blob, savings };
}

// ----------------------------------------------------
// Web Dev Minifiers (HTML, CSS, JS)
// ----------------------------------------------------

export async function minifyHtml(text: string): Promise<string> {
    return text
        .replace(/<!--[\s\S]*?-->/g, '') // strip comments
        .replace(/\s+/g, ' ') // collapse whitespaces
        .replace(/>\s+</g, '><') // remove space between tags
        .trim();
}

export async function minifyCss(text: string): Promise<string> {
    return text
        .replace(/\/\*[\s\S]*?\*\//g, '') // strip comments
        .replace(/\s+/g, ' ') // collapse whitespaces
        .replace(/\s*([{}|:;])\s*/g, '$1') // strip spaces around punctuation
        .replace(/;}/g, '}') // strip trailing semicolons
        .trim();
}

export async function minifyJs(text: string): Promise<string> {
    return text
        .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
        .split('\n')
        .map((line) => {
            const idx = line.indexOf('//');
            if (idx !== -1) {
                const pre = line.substring(0, idx);
                // Simple regex block check to prevent stripping URLs/quoted symbols
                if (!pre.match(/https?:$/) && !pre.match(/['"`]/)) {
                    return pre;
                }
            }
            return line;
        })
        .join('\n')
        .replace(/\s+/g, ' ') // collapse spacing
        .replace(/\s*([=+\-*/{}()\[\];,<>:])\s*/g, '$1') // collapse operators whitespace
        .trim();
}

export async function optimizeWebDev(
    file: File,
    minifyHtmlFlag: boolean,
    minifyCssFlag: boolean,
    minifyJsFlag: boolean,
    optimizeSvgFlag: boolean
): Promise<{ blob: Blob; savings: number }> {
    const text = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let result = text;

    if (ext === 'html' && minifyHtmlFlag) {
        result = await minifyHtml(text);
    } else if (ext === 'css' && minifyCssFlag) {
        result = await minifyCss(text);
    } else if (['js', 'ts'].includes(ext) && minifyJsFlag) {
        result = await minifyJs(text);
    } else if (ext === 'svg' && optimizeSvgFlag) {
        result = await optimizeSvg(text);
    }

    const blob = new Blob([result], { type: file.type || 'text/plain' });
    const savings = Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100));
    return { blob, savings };
}

// ----------------------------------------------------
// Audio & Video Processing (WAV, GIF)
// ----------------------------------------------------

export async function extractAudioAndCompress(
    file: File
): Promise<{ blob: Blob; savings: number }> {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Downsample to 22050Hz Mono to maximize compression savings
    const targetSampleRate = 22050;
    const offlineCtx = new OfflineAudioContext(
        1, // 1 Channel = Mono
        Math.floor(decodedBuffer.duration * targetSampleRate),
        targetSampleRate
    );

    const bufferSource = offlineCtx.createBufferSource();
    bufferSource.buffer = decodedBuffer;
    bufferSource.connect(offlineCtx.destination);
    bufferSource.start();

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWav(renderedBuffer);

    const savings = Math.max(0, Math.round(((file.size - wavBlob.size) / file.size) * 100));
    return { blob: wavBlob, savings };
}

export async function convertVideoToGif(
    file: File,
    scale: number,
    onProgress?: (progress: number) => void
): Promise<{ blob: Blob; savings: number }> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = async () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Could not acquire 2D Canvas context"));
                return;
            }

            const s = scale / 100;
            const width = Math.round(video.videoWidth * s);
            const height = Math.round(video.videoHeight * s);
            canvas.width = width;
            canvas.height = height;

            try {
                // Dynamically import gifenc
                // @ts-expect-error - gifenc package has no TypeScript definition files
                const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
                const gifEncoder = new GIFEncoder();

                const fps = 10;
                const duration = video.duration || 5;
                // Cap to maximum 50 frames to avoid OOM crash or thread locks
                const totalFrames = Math.min(50, Math.floor(duration * fps));
                const interval = 1 / fps;
                let frameCount = 0;

                const captureFrame = async (time: number) => {
                    return new Promise<void>((resolveFrame) => {
                        video.currentTime = time;
                        video.onseeked = () => {
                            ctx.drawImage(video, 0, 0, width, height);
                            const imgData = ctx.getImageData(0, 0, width, height);

                            // Apply Palette color quantization
                            const palette = quantize(imgData.data, 256);
                            const index = applyPalette(imgData.data, palette);

                            gifEncoder.writeFrame(index, width, height, {
                                palette,
                                delay: 100, // delay in ms (100ms = 10 fps)
                            });

                            frameCount++;
                            if (onProgress) {
                                onProgress(Math.round((frameCount / totalFrames) * 100));
                            }
                            resolveFrame();
                        };
                    });
                };

                for (let i = 0; i < totalFrames; i++) {
                    await captureFrame(i * interval);
                }

                gifEncoder.finish();
                const buffer = gifEncoder.bytesView();
                const gifBlob = new Blob([buffer as unknown as BlobPart], { type: 'image/gif' });

                URL.revokeObjectURL(video.src);
                const savings = Math.max(0, Math.round(((file.size - gifBlob.size) / file.size) * 100));
                resolve({ blob: gifBlob, savings });
            } catch (err) {
                URL.revokeObjectURL(video.src);
                reject(err);
            }
        };

        video.onerror = () => {
            reject(new Error("Unable to read video file format"));
        };
    });
}
