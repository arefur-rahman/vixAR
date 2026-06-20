"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, FileText, FileVideo, Code } from "lucide-react";

interface DropzoneProps {
    onFilesAdded: (files: FileList) => void;
}

export function Dropzone({ onFilesAdded }: DropzoneProps) {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFilesAdded(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFilesAdded(e.target.files);
        }
    };

    return (
        <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer relative overflow-hidden select-none group/dropzone ${
                dragActive
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.01]"
                    : "border-border bg-card/40 hover:border-primary hover:bg-primary/5 shadow-md shadow-violet-600/5 hover:shadow-primary/10"
            }`}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/dropzone:scale-110 transition-transform duration-300 shadow-sm border border-primary/20">
                    <UploadCloud className="size-8" />
                </div>
                <div>
                    <h3 className="text-xl font-bold tracking-tight">
                        Drag & drop files here, or click to upload
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                        Supports Images (PNG, JPG, WebP), PDFs, Audio & Video
                        (MP3, MP4), and Web files (SVG, HTML, CSS, JS)
                    </p>
                </div>

                {/* Supported icons row */}
                <div className="flex gap-4 mt-4 text-muted-foreground bg-muted/30 px-4 py-2.5 rounded-xl border border-border/50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <ImageIcon className="size-3.5 text-indigo-400" />
                        Images
                    </div>
                    <div className="h-4 w-px bg-border"></div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <FileText className="size-3.5 text-emerald-400" />
                        PDFs
                    </div>
                    <div className="h-4 w-px bg-border"></div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <FileVideo className="size-3.5 text-rose-400" />
                        Video/Audio
                    </div>
                    <div className="h-4 w-px bg-border"></div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Code className="size-3.5 text-amber-400" />
                        Web Dev
                    </div>
                </div>
            </div>
            {/* Backdrop glow ring for hovered dropzone */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)/4%,transparent_70%)] opacity-0 group-hover/dropzone:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
}
