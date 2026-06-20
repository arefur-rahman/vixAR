"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
    ArrowLeft, 
    FileText, 
    Upload, 
    Trash2, 
    ArrowUp, 
    ArrowDown, 
    Combine, 
    Scissors, 
    Download,
    RefreshCw,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/global/Navbar";

interface PDFFile {
    id: string;
    file: File;
    name: string;
    size: number;
    pagesCount?: number;
}

export default function PDFTools() {
    const [mode, setMode] = useState<"merge" | "split">("merge");
    
    // Merge State
    const [mergeFiles, setMergeFiles] = useState<PDFFile[]>([]);
    const [mergeStatus, setMergeStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
    const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
    const [mergeProgress, setMergeProgress] = useState(0);

    // Split State
    const [splitFile, setSplitFile] = useState<PDFFile | null>(null);
    const [splitRange, setSplitRange] = useState("");
    const [splitMode, setSplitMode] = useState<"all" | "range">("all");
    const [splitStatus, setSplitStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
    const [splitResults, setSplitResults] = useState<{ name: string; blob: Blob }[]>([]);
    const [splitProgress, setSplitProgress] = useState(0);

    const mergeInputRef = useRef<HTMLInputElement>(null);
    const splitInputRef = useRef<HTMLInputElement>(null);

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

    // Load PDF page count
    const getPdfPageCount = async (file: File): Promise<number> => {
        try {
            const { PDFDocument } = await import("pdf-lib");
            const bytes = await file.arrayBuffer();
            const doc = await PDFDocument.load(bytes, { updateMetadata: false });
            return doc.getPageCount();
        } catch (e) {
            console.error("Failed to read PDF pages count:", e);
            return 0;
        }
    };

    // File Handlers
    const handleMergeFilesAdded = async (filesList: FileList | null) => {
        if (!filesList) return;
        setMergeStatus("idle");
        setMergedBlob(null);
        
        const newFiles: PDFFile[] = [];
        for (const file of Array.from(filesList)) {
            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                continue;
            }
            const id = Math.random().toString(36).substring(2, 9);
            const pagesCount = await getPdfPageCount(file);
            newFiles.push({
                id,
                file,
                name: file.name,
                size: file.size,
                pagesCount
            });
        }
        setMergeFiles((prev) => [...prev, ...newFiles]);
    };

    const handleSplitFileAdded = async (filesList: FileList | null) => {
        if (!filesList || filesList.length === 0) return;
        const file = filesList[0];
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            return;
        }
        setSplitStatus("idle");
        setSplitResults([]);
        
        const pagesCount = await getPdfPageCount(file);
        setSplitFile({
            id: Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            size: file.size,
            pagesCount
        });
    };

    // Merge Actions
    const moveMergeFile = (index: number, direction: "up" | "down") => {
        const nextIndex = direction === "up" ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= mergeFiles.length) return;

        const updated = [...mergeFiles];
        const temp = updated[index];
        updated[index] = updated[nextIndex];
        updated[nextIndex] = temp;
        setMergeFiles(updated);
    };

    const removeMergeFile = (id: string) => {
        setMergeFiles((prev) => prev.filter((f) => f.id !== id));
        setMergeStatus("idle");
        setMergedBlob(null);
    };

    const clearMergeQueue = () => {
        setMergeFiles([]);
        setMergeStatus("idle");
        setMergedBlob(null);
    };

    // Process PDF Merge
    const handleMergePDFs = async () => {
        if (mergeFiles.length < 2) return;
        setMergeStatus("processing");
        setMergeProgress(15);

        try {
            const { PDFDocument } = await import("pdf-lib");
            const doc = await PDFDocument.create();
            setMergeProgress(30);

            for (let i = 0; i < mergeFiles.length; i++) {
                const f = mergeFiles[i];
                const bytes = await f.file.arrayBuffer();
                const subDoc = await PDFDocument.load(bytes);
                const pages = await doc.copyPages(subDoc, subDoc.getPageIndices());
                pages.forEach((p) => doc.addPage(p));
                
                const percent = 30 + Math.round(((i + 1) / mergeFiles.length) * 50);
                setMergeProgress(percent);
            }

            // Reset standard metadata
            doc.setTitle("Merged PDF by vixAR");
            doc.setAuthor("vixAR");
            doc.setCreator("vixAR");
            doc.setProducer("vixAR");

            setMergeProgress(90);
            const outBytes = await doc.save({ useObjectStreams: true });
            const blob = new Blob([outBytes as unknown as BlobPart], { type: "application/pdf" });
            
            setMergedBlob(blob);
            setMergeProgress(100);
            setMergeStatus("completed");
        } catch (e) {
            console.error("PDF Merge failed:", e);
            setMergeStatus("failed");
        }
    };

    const downloadMergedPDF = () => {
        if (!mergedBlob) return;
        const url = URL.createObjectURL(mergedBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "vixAR_merged.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Process PDF Split
    const handleSplitPDF = async () => {
        if (!splitFile) return;
        setSplitStatus("processing");
        setSplitProgress(10);

        try {
            const { PDFDocument } = await import("pdf-lib");
            const bytes = await splitFile.file.arrayBuffer();
            const sourceDoc = await PDFDocument.load(bytes);
            const totalPages = sourceDoc.getPageCount();
            
            setSplitProgress(25);
            const results: { name: string; blob: Blob }[] = [];

            if (splitMode === "all") {
                for (let i = 0; i < totalPages; i++) {
                    const newDoc = await PDFDocument.create();
                    const [copiedPage] = await newDoc.copyPages(sourceDoc, [i]);
                    newDoc.addPage(copiedPage);
                    const pdfBytes = await newDoc.save({ useObjectStreams: true });
                    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
                    
                    results.push({
                        name: `${splitFile.name.replace(/\.pdf$/i, "")}_page_${i + 1}.pdf`,
                        blob
                    });

                    const percent = 25 + Math.round(((i + 1) / totalPages) * 70);
                    setSplitProgress(percent);
                }
            } else {
                // Range splitting, e.g., "1-3, 5"
                const pagesToExtract: number[] = [];
                const parts = splitRange.split(",");
                
                for (const part of parts) {
                    const cleanPart = part.trim();
                    if (cleanPart.includes("-")) {
                        const [startStr, endStr] = cleanPart.split("-");
                        const start = parseInt(startStr, 10);
                        const end = parseInt(endStr, 10);
                        if (!isNaN(start) && !isNaN(end)) {
                            for (let p = Math.min(start, end); p <= Math.max(start, end); p++) {
                                if (p >= 1 && p <= totalPages) {
                                    pagesToExtract.push(p - 1);
                                }
                            }
                        }
                    } else {
                        const pageNum = parseInt(cleanPart, 10);
                        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                            pagesToExtract.push(pageNum - 1);
                        }
                    }
                }

                // Deduplicate page numbers
                const uniquePages = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);
                
                if (uniquePages.length === 0) {
                    throw new Error("No valid page range specified.");
                }

                setSplitProgress(40);
                
                const newDoc = await PDFDocument.create();
                const copiedPages = await newDoc.copyPages(sourceDoc, uniquePages);
                copiedPages.forEach((p) => newDoc.addPage(p));
                const pdfBytes = await newDoc.save({ useObjectStreams: true });
                const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });

                results.push({
                    name: `${splitFile.name.replace(/\.pdf$/i, "")}_split.pdf`,
                    blob
                });
                
                setSplitProgress(90);
            }

            setSplitResults(results);
            setSplitProgress(100);
            setSplitStatus("completed");
        } catch (e) {
            console.error("PDF Split failed:", e);
            setSplitStatus("failed");
        }
    };

    const downloadSplitFile = (name: string, blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadAllSplitFiles = () => {
        splitResults.forEach((res, index) => {
            setTimeout(() => {
                downloadSplitFile(res.name, res.blob);
            }, index * 150);
        });
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300 font-sans selection:bg-primary selection:text-primary-foreground">
            {/* BACKGROUND GRADIENTS */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--primary)/7%,transparent_50%)] pointer-events-none"></div>
            <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-primary/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

            <Navbar />

            <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col">
                {/* Back Button */}
                <div className="mb-6 animate-fadeIn">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Back to main dashboard
                    </Link>
                </div>

                {/* Header Title */}
                <div className="mb-8 text-center sm:text-left animate-fadeIn">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-violet-400">
                        Advanced PDF Workspace
                    </h1>
                    <p className="text-sm text-muted-foreground/80 mt-1">
                        Merge multiple documents together or split pages client-side with ultra safety.
                    </p>
                </div>

                {/* Workspace Navigation Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-muted/20 border border-border/40 p-1.5 rounded-2xl mb-8 max-w-md mx-auto sm:mx-0 animate-fadeIn">
                    <button
                        onClick={() => setMode("merge")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                            mode === "merge"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                        }`}
                    >
                        <Combine className="size-4" />
                        Merge PDF
                    </button>
                    <button
                        onClick={() => setMode("split")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                            mode === "split"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                        }`}
                    >
                        <Scissors className="size-4" />
                        Split PDF
                    </button>
                </div>

                {mode === "merge" ? (
                    /* MERGE SECTION */
                    <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
                        {/* Drag and Drop Box */}
                        <div
                            onClick={() => mergeInputRef.current?.click()}
                            className="border-2 border-dashed border-border/60 hover:border-primary/50 bg-card/30 hover:bg-primary/5 transition-all duration-300 rounded-2xl py-12 px-6 text-center cursor-pointer flex flex-col items-center justify-center group"
                        >
                            <input
                                type="file"
                                ref={mergeInputRef}
                                className="hidden"
                                accept="application/pdf"
                                multiple
                                onChange={(e) => handleMergeFilesAdded(e.target.files)}
                            />
                            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-4">
                                <Upload className="size-6" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">
                                Upload PDFs to Merge
                            </h3>
                            <p className="text-xs text-muted-foreground/75 mt-1.5 max-w-xs">
                                Select or drag multiple PDF files to bundle them into a single file.
                            </p>
                        </div>

                        {/* Merge Queue List */}
                        {mergeFiles.length > 0 && (
                            <div className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
                                <div className="px-6 py-4.5 border-b border-border/50 flex justify-between items-center bg-muted/5">
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-4.5 text-primary" />
                                        <h2 className="text-sm font-bold">Merge Queue</h2>
                                        <span className="ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                                            {mergeFiles.length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={clearMergeQueue}
                                        className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Trash2 className="size-3.5" />
                                        Clear All
                                    </button>
                                </div>

                                <div className="divide-y divide-border/40 overflow-y-auto max-h-[350px] flex-1">
                                    {mergeFiles.map((file, index) => (
                                        <div
                                            key={file.id}
                                            className="p-4 flex items-center justify-between gap-4 hover:bg-muted/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/40 text-primary">
                                                    <FileText className="size-4.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold truncate text-foreground" title={file.name}>
                                                        {file.name}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                                        {formatBytes(file.size)} • {file.pagesCount || 0} pages
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Sorting & Deletion Controls */}
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    disabled={index === 0}
                                                    onClick={() => moveMergeFile(index, "up")}
                                                    title="Move Up"
                                                >
                                                    <ArrowUp className="size-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    disabled={index === mergeFiles.length - 1}
                                                    onClick={() => moveMergeFile(index, "down")}
                                                    title="Move Down"
                                                >
                                                    <ArrowDown className="size-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    onClick={() => removeMergeFile(file.id)}
                                                    className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress Indicator */}
                                {mergeStatus === "processing" && (
                                    <div className="p-5 border-t border-border/40 bg-muted/5 flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-primary flex items-center gap-1.5 font-semibold">
                                                <RefreshCw className="size-3.5 animate-spin" />
                                                Merging and compiling document objects...
                                            </span>
                                            <span className="font-mono text-muted-foreground">{mergeProgress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-300"
                                                style={{ width: `${mergeProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {mergeStatus === "completed" && (
                                    <div className="p-5 border-t border-border/40 bg-emerald-500/5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold">
                                            <CheckCircle2 className="size-4.5" />
                                            Merge completed successfully! Output file is compiled.
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={downloadMergedPDF}
                                            className="font-bold flex items-center gap-1.5"
                                        >
                                            <Download className="size-4" />
                                            Download Merged PDF
                                        </Button>
                                    </div>
                                )}

                                {mergeStatus === "failed" && (
                                    <div className="p-5 border-t border-border/40 bg-destructive/5 flex items-center gap-2 text-xs text-destructive font-semibold">
                                        <AlertCircle className="size-4.5" />
                                        Failed to compile document objects. Ensure none are encrypted or corrupted.
                                    </div>
                                )}

                                {/* Bottom Merge Call-to-action */}
                                {mergeStatus === "idle" && mergeFiles.length >= 2 && (
                                    <div className="p-4 border-t border-border/40 flex justify-center bg-muted/10">
                                        <Button
                                            onClick={handleMergePDFs}
                                            className="px-8 font-bold flex items-center gap-2 text-sm shadow-md"
                                        >
                                            Merge {mergeFiles.length} PDFs Now
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* SPLIT SECTION */
                    <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
                        {/* Split file picker */}
                        {!splitFile ? (
                            <div
                                onClick={() => splitInputRef.current?.click()}
                                className="border-2 border-dashed border-border/60 hover:border-primary/50 bg-card/30 hover:bg-primary/5 transition-all duration-300 rounded-2xl py-12 px-6 text-center cursor-pointer flex flex-col items-center justify-center group"
                            >
                                <input
                                    type="file"
                                    ref={splitInputRef}
                                    className="hidden"
                                    accept="application/pdf"
                                    onChange={(e) => handleSplitFileAdded(e.target.files)}
                                />
                                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-4">
                                    <Upload className="size-6" />
                                </div>
                                <h3 className="text-base font-bold text-foreground">
                                    Upload PDF to Split
                                </h3>
                                <p className="text-xs text-muted-foreground/75 mt-1.5 max-w-xs">
                                    Select or drag a single PDF file to split it into individual pages or ranges.
                                </p>
                            </div>
                        ) : (
                            /* Selected File Display & Configurations */
                            <div className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden flex flex-col gap-6 p-6">
                                <div className="flex items-center justify-between border-b border-border/40 pb-4.5">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/40 text-primary">
                                            <FileText className="size-5.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold truncate text-foreground" title={splitFile.name}>
                                                {splitFile.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                                {formatBytes(splitFile.size)} • {splitFile.pagesCount || 0} pages
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setSplitFile(null);
                                            setSplitStatus("idle");
                                            setSplitResults([]);
                                        }}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-1 cursor-pointer"
                                    >
                                        <Trash2 className="size-4" />
                                        Remove
                                    </Button>
                                </div>

                                {/* Split Configurations */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Splitting Mode Configurations
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <label
                                            onClick={() => setSplitMode("all")}
                                            className={`p-4 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all duration-300 ${
                                                splitMode === "all"
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "border-border hover:border-primary/40 hover:bg-muted/15"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-foreground">Extract All Pages</span>
                                                <input
                                                    type="radio"
                                                    checked={splitMode === "all"}
                                                    onChange={() => setSplitMode("all")}
                                                    className="accent-primary size-4"
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground/80 mt-1 leading-relaxed">
                                                Splits every single page of this document into a standalone PDF.
                                            </p>
                                        </label>

                                        <label
                                            onClick={() => setSplitMode("range")}
                                            className={`p-4 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all duration-300 ${
                                                splitMode === "range"
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "border-border hover:border-primary/40 hover:bg-muted/15"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-foreground">Custom Page Ranges</span>
                                                <input
                                                    type="radio"
                                                    checked={splitMode === "range"}
                                                    onChange={() => setSplitMode("range")}
                                                    className="accent-primary size-4"
                                                />
                                            </div>
                                             <p className="text-[11px] text-muted-foreground/80 mt-1 leading-relaxed">
                                                 Extract specific pages (e.g., &apos;1-3, 5&apos;) to construct a new document.
                                             </p>
                                        </label>
                                    </div>

                                    {splitMode === "range" && (
                                        <div className="flex flex-col gap-2 pt-2 animate-fadeIn">
                                            <label className="text-xs font-bold text-foreground">
                                                Specify Page Ranges
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 1-3, 5, 8-10"
                                                value={splitRange}
                                                onChange={(e) => setSplitRange(e.target.value)}
                                                className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-semibold outline-hidden focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                                            />
                                            <span className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                                                Use hyphens for ranges and commas for separate pages (Max page: {splitFile.pagesCount || 1}).
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Split Actions / Status displays */}
                                {splitStatus === "processing" && (
                                    <div className="flex flex-col gap-2 border-t border-border/40 pt-5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-primary flex items-center gap-1.5 font-semibold">
                                                <RefreshCw className="size-3.5 animate-spin" />
                                                Slicing pages and compiling new documents...
                                            </span>
                                            <span className="font-mono text-muted-foreground">{splitProgress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-300"
                                                style={{ width: `${splitProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {splitStatus === "completed" && splitResults.length > 0 && (
                                    <div className="border-t border-border/40 pt-5 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold">
                                                <CheckCircle2 className="size-4.5" />
                                                Successfully split PDF into {splitResults.length} file(s)!
                                            </div>
                                            {splitResults.length > 1 && (
                                                <Button
                                                    size="sm"
                                                    onClick={downloadAllSplitFiles}
                                                    className="font-bold flex items-center gap-1.5"
                                                >
                                                    <Download className="size-4" />
                                                    Download All Files
                                                </Button>
                                            )}
                                        </div>

                                        <div className="bg-muted/10 border border-border/40 rounded-xl max-h-[220px] overflow-y-auto divide-y divide-border/30">
                                            {splitResults.map((result, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3 flex items-center justify-between gap-4 text-xs hover:bg-muted/5 transition-colors"
                                                >
                                                    <span className="font-bold truncate text-foreground" title={result.name}>
                                                        {result.name}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => downloadSplitFile(result.name, result.blob)}
                                                        className="hover:bg-primary/10 hover:text-primary shrink-0"
                                                    >
                                                        <Download className="size-3.5 mr-1" />
                                                        Download
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {splitStatus === "failed" && (
                                    <div className="border-t border-border/40 pt-5 flex items-center gap-2 text-xs text-destructive font-semibold">
                                        <AlertCircle className="size-4.5" />
                                        Failed to split pages. Verify that range specifications are correct.
                                    </div>
                                )}

                                {splitStatus === "idle" && (
                                    <div className="border-t border-border/40 pt-4 flex justify-end">
                                        <Button
                                            onClick={handleSplitPDF}
                                            className="px-6 font-bold flex items-center gap-1.5 text-sm"
                                        >
                                            <Scissors className="size-4" />
                                            Split PDF document
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="w-full border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-background/50 backdrop-blur-xs select-none">
                <p className="font-sans">
                    &copy; {new Date().getFullYear()} vixAR. All rights reserved. Created for peak media optimization efficiency.
                </p>
            </footer>
        </div>
    );
}
