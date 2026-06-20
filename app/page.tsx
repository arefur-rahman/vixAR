"use client";

import { Dropzone } from "@/components/global/Dropzone";
import { Hero } from "@/components/global/Hero";
import { Navbar } from "@/components/global/Navbar";
import { QueueList } from "@/components/global/QueueList";
import { ToolSuiteGrid } from "@/components/global/ToolSuiteGrid";
import {
    compressImage,
    compressPdf,
    convertVideoToGif,
    extractAudioAndCompress,
    optimizeWebDev,
} from "@/lib/compressors";
import { useEffect, useRef, useState } from "react";

interface ProcessingFile {
    id: string;
    name: string;
    type: "image" | "pdf" | "audio-video" | "web-dev" | "unknown";
    originalSize: number;
    optimizedSize?: number;
    progress: number;
    status: "queued" | "processing" | "completed" | "failed";
    savings?: number;
    optimizedName?: string;
}

export default function Home() {
    const [files, setFiles] = useState<ProcessingFile[]>([]);
    const [compressedBlobs, setCompressedBlobs] = useState<
        Record<string, Blob>
    >({});
    const [processAutomatically, setProcessAutomatically] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("vixAR_processAutomatically");
        if (stored !== null) {
            const val = stored === "true";
            setTimeout(() => {
                setProcessAutomatically(val);
            }, 0);
        }
    }, []);

    const handleToggleProcessAutomatically = () => {
        setProcessAutomatically((prev) => {
            const next = !prev;
            localStorage.setItem("vixAR_processAutomatically", String(next));
            return next;
        });
    };

    // useRef so raw File objects are always current when startProcessing fires
    const rawFilesRef = useRef<Record<string, File>>({});
    const [activeSuite, setActiveSuite] = useState<
        "image" | "pdf" | "audio-video" | "web-dev" | null
    >("image");

    // Tool Suite parameters
    const [imgQuality, setImgQuality] = useState(80);
    const [imgFormat, setImgFormat] = useState("webp");
    const [imgResize, setImgResize] = useState(false);
    const [imgResizeWidth, setImgResizeWidth] = useState(1920);

    const [pdfCompression, setPdfCompression] = useState<
        "extreme" | "recommended" | "low"
    >("recommended");

    const [mediaTarget, setMediaTarget] = useState<"mp3" | "gif">("gif");
    const [mediaScale, setMediaScale] = useState(50);

    const [webMinifyHtml, setWebMinifyHtml] = useState(true);
    const [webMinifyCss, setWebMinifyCss] = useState(true);
    const [webMinifyJs, setWebMinifyJs] = useState(true);
    const [webOptimizeSvg, setWebOptimizeSvg] = useState(true);

    // Helper to format bytes
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
        );
    };

    // Detect file type
    const detectFileType = (fileName: string): ProcessingFile["type"] => {
        const ext = fileName.split(".").pop()?.toLowerCase();
        if (!ext) return "unknown";
        if (
            [
                "png",
                "jpg",
                "jpeg",
                "webp",
                "gif",
                "svg",
                "heic",
                "heif",
                "avif",
            ].includes(ext)
        )
            return "image";
        if (["pdf"].includes(ext)) return "pdf";
        if (["mp3", "wav", "ogg", "mp4", "webm", "avi", "mov"].includes(ext))
            return "audio-video";
        if (["html", "css", "js", "ts", "json", "xml"].includes(ext))
            return "web-dev";
        return "unknown";
    };

    // Handle file import — only queues files; does NOT auto-start unless toggle is on
    const handleFilesAdded = (rawFileList: FileList) => {
        const filesArray = Array.from(rawFileList);
        const newFiles: ProcessingFile[] = filesArray.map((f) => {
            const id = Math.random().toString(36).substring(2, 9);
            rawFilesRef.current[id] = f; // store raw File for later
            return {
                id,
                name: f.name,
                type: detectFileType(f.name),
                originalSize: f.size,
                progress: 0,
                status: "queued" as const,
            };
        });

        setFiles((prev) => {
            const next = [...prev, ...newFiles];
            if (processAutomatically) {
                // kick off processing after state settles
                setTimeout(() => startProcessingList(newFiles, filesArray), 0);
            }
            return next;
        });
    };

    // Start processing every queued file (called by CTA or auto)
    const startProcessing = () => {
        setFiles((prev) => {
            const queued = prev.filter((f) => f.status === "queued");
            const allFiles = queued
                .map((f) => rawFilesRef.current[f.id])
                .filter(Boolean);
            queued.forEach((f, i) =>
                processFile(f.id, f.type, allFiles[i], allFiles),
            );
            return prev;
        });
    };

    // Internal helper used by auto-processing path (receives brand-new entries)
    const startProcessingList = (
        newEntries: ProcessingFile[],
        rawList: File[],
    ) => {
        newEntries.forEach((entry, i) =>
            processFile(entry.id, entry.type, rawList[i], rawList),
        );
    };

    // Process file using real utilities
    const processFile = async (
        id: string,
        type: ProcessingFile["type"],
        file: File,
        allFilesList: File[],
    ) => {
        setFiles((prev) =>
            prev.map((f) =>
                f.id === id ? { ...f, status: "processing", progress: 10 } : f,
            ),
        );

        try {
            let resultBlob: Blob;
            let resultSavings = 0;
            let targetExt = file.name.split(".").pop() || "";

            if (type === "image") {
                const result = await compressImage(
                    file,
                    imgQuality,
                    imgFormat,
                    imgResize,
                    imgResizeWidth,
                );
                resultBlob = result.blob;
                resultSavings = result.savings;
                targetExt = imgFormat === "original" ? targetExt : imgFormat;
            } else if (type === "pdf") {
                const pdfsToMerge = allFilesList.filter(
                    (f) => detectFileType(f.name) === "pdf",
                );
                const result = await compressPdf(
                    file,
                    pdfCompression,
                    false,
                    pdfsToMerge,
                );
                resultBlob = result.blob;
                resultSavings = result.savings;
                targetExt = "pdf";
            } else if (type === "audio-video") {
                if (mediaTarget === "mp3") {
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === id ? { ...f, progress: 40 } : f,
                        ),
                    );
                    const result = await extractAudioAndCompress(file);
                    resultBlob = result.blob;
                    resultSavings = result.savings;
                    targetExt = "wav"; // Output wav extraction
                } else {
                    const result = await convertVideoToGif(
                        file,
                        mediaScale,
                        (p) => {
                            setFiles((prev) =>
                                prev.map((f) =>
                                    f.id === id ? { ...f, progress: p } : f,
                                ),
                            );
                        },
                    );
                    resultBlob = result.blob;
                    resultSavings = result.savings;
                    targetExt = "gif";
                }
            } else if (type === "web-dev") {
                const result = await optimizeWebDev(
                    file,
                    webMinifyHtml,
                    webMinifyCss,
                    webMinifyJs,
                    webOptimizeSvg,
                );
                resultBlob = result.blob;
                resultSavings = result.savings;
            } else {
                resultBlob = file;
                resultSavings = 0;
            }

            // Save output blob for download trigger
            setCompressedBlobs((prev) => ({ ...prev, [id]: resultBlob }));

            setFiles((prev) =>
                prev.map((f) => {
                    if (f.id === id) {
                        const nameParts = f.name.split(".");
                        nameParts.pop();
                        const optName = `${nameParts.join(".")}_optimized.${targetExt}`;
                        return {
                            ...f,
                            progress: 100,
                            status: "completed",
                            optimizedSize: resultBlob.size,
                            savings: resultSavings,
                            optimizedName: optName,
                        };
                    }
                    return f;
                }),
            );
        } catch (error) {
            console.error("Optimization failed:", error);
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === id ? { ...f, status: "failed", progress: 0 } : f,
                ),
            );
        }
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        delete rawFilesRef.current[id];
        setCompressedBlobs((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    };

    const clearQueue = () => {
        setFiles([]);
        rawFilesRef.current = {};
        setCompressedBlobs({});
    };

    const downloadFile = (file: ProcessingFile) => {
        const blob = compressedBlobs[file.id];
        if (!blob || !file.optimizedName) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.optimizedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadAll = () => {
        files
            .filter((f) => f.status === "completed")
            .forEach((file, index) => {
                setTimeout(() => {
                    downloadFile(file);
                }, index * 150);
            });
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300 font-sans selection:bg-primary selection:text-primary-foreground">
            {/* BACKGROUND GRADIENTS (DARK MODE GLOW) */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--primary)/7%,transparent_50%)] pointer-events-none"></div>
            <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-primary/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

            {/* NAVBAR */}
            <Navbar />

            {/* HERO SECTION */}
            <Hero />

            {/* MAIN CONTENT AREA */}
            <main className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: DROPZONE & QUEUE (8 COLS) */}
                <div className="lg:col-span-8 flex flex-col gap-8 animate-fadeIn">
                    <Dropzone onFilesAdded={handleFilesAdded} />
                    <QueueList
                        files={files}
                        onRemoveFile={removeFile}
                        onClearQueue={clearQueue}
                        onDownloadFile={downloadFile}
                        onDownloadAll={downloadAll}
                        formatBytes={formatBytes}
                        processAutomatically={processAutomatically}
                        onToggleProcessAutomatically={
                            handleToggleProcessAutomatically
                        }
                        onStartProcessing={startProcessing}
                    />
                </div>

                {/* RIGHT COLUMN: MODULE CONFIGURATIONS (4 COLS) */}
                <div className="lg:col-span-4 flex flex-col gap-6 animate-fadeIn">
                    <ToolSuiteGrid
                        activeSuite={activeSuite}
                        setActiveSuite={setActiveSuite}
                        imgQuality={imgQuality}
                        setImgQuality={setImgQuality}
                        imgFormat={imgFormat}
                        setImgFormat={setImgFormat}
                        imgResize={imgResize}
                        setImgResize={setImgResize}
                        imgResizeWidth={imgResizeWidth}
                        setImgResizeWidth={setImgResizeWidth}
                        pdfCompression={pdfCompression}
                        setPdfCompression={setPdfCompression}
                        mediaTarget={mediaTarget}
                        setMediaTarget={setMediaTarget}
                        mediaScale={mediaScale}
                        setMediaScale={setMediaScale}
                        webMinifyHtml={webMinifyHtml}
                        setWebMinifyHtml={setWebMinifyHtml}
                        webMinifyCss={webMinifyCss}
                        setWebMinifyCss={setWebMinifyCss}
                        webMinifyJs={webMinifyJs}
                        setWebMinifyJs={setWebMinifyJs}
                        webOptimizeSvg={webOptimizeSvg}
                        setWebOptimizeSvg={setWebOptimizeSvg}
                    />
                </div>
            </main>

            {/* FOOTER */}
            <footer className="mt-auto w-full border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-background/50 backdrop-blur-xs select-none">
                <p className="font-sans">
                    &copy; {new Date().getFullYear()} vixAR. All rights
                    reserved. Created for peak media optimization efficiency.
                </p>
            </footer>
        </div>
    );
}
