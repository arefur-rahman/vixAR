"use client";

import React from "react";
import {
    SlidersHorizontal,
    Trash2,
    Image as ImageIcon,
    FileText,
    FileVideo,
    Code,
    ArrowRight,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Download,
    DownloadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

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

interface QueueListProps {
    files: ProcessingFile[];
    onRemoveFile: (id: string) => void;
    onClearQueue: () => void;
    onDownloadFile: (file: ProcessingFile) => void;
    onDownloadAll: () => void;
    formatBytes: (bytes: number, decimals?: number) => string;
    processAutomatically: boolean;
    onToggleProcessAutomatically: () => void;
    onStartProcessing: () => void;
}

export function QueueList({
    files,
    onRemoveFile,
    onClearQueue,
    onDownloadFile,
    onDownloadAll,
    formatBytes,
    processAutomatically,
    onToggleProcessAutomatically,
    onStartProcessing,
}: QueueListProps) {
    const completedFiles = files.filter((f) => f.status === "completed");
    const queuedFiles = files.filter((f) => f.status === "queued");
    return (
        <div className="border border-border bg-card rounded-2xl shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="px-6 py-5 border-b border-border/50 flex justify-between items-center bg-muted/10 bg-linear-to-r from-muted/5 to-transparent">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4.5 text-primary" />
                    <h2 className="text-lg font-bold tracking-tight">
                        Interactive Processing Queue
                    </h2>
                    {files.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                            {files.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="process-automatically"
                            checked={processAutomatically}
                            onCheckedChange={onToggleProcessAutomatically}
                        />
                        <label
                            htmlFor="process-automatically"
                            className="text-xs font-semibold text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                        >
                            Auto-process
                        </label>
                    </div>
                    {files.length > 0 && (
                        <div className="flex items-center gap-3 border-l border-border/50 pl-3">
                            {completedFiles.length > 1 && (
                                <button
                                    onClick={onDownloadAll}
                                    title="Download all optimized files"
                                    className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                    <DownloadCloud className="size-3.5" />
                                    Download All ({completedFiles.length})
                                </button>
                            )}
                            <button
                                onClick={onClearQueue}
                                className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <Trash2 className="size-3.5" />
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {files.length === 0 ? (
                <div className="py-16 text-center px-4">
                    <FileText className="size-12 mx-auto text-muted-foreground/45 stroke-[1.5]" />
                    <h4 className="text-base font-bold text-muted-foreground mt-4">
                        Queue is empty
                    </h4>
                    <p className="text-sm text-muted-foreground/75 mt-1 max-w-xs mx-auto">
                        Upload files to start processing and download results.
                    </p>
                </div>
            ) : (
                <>
                    <div className="divide-y divide-border/40 max-h-[500px] overflow-y-auto">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                            >
                                {/* File icon & meta info */}
                                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/50">
                                        {file.type === "image" && (
                                            <ImageIcon className="size-5 text-indigo-400" />
                                        )}
                                        {file.type === "pdf" && (
                                            <FileText className="size-5 text-emerald-400" />
                                        )}
                                        {file.type === "audio-video" && (
                                            <FileVideo className="size-5 text-rose-400" />
                                        )}
                                        {file.type === "web-dev" && (
                                            <Code className="size-5 text-amber-400" />
                                        )}
                                        {file.type === "unknown" && (
                                            <FileText className="size-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p
                                                className="text-sm font-semibold truncate text-foreground"
                                                title={file.name}
                                            >
                                                {file.name}
                                            </p>
                                            {file.status === "completed" &&
                                                file.savings !== undefined && (
                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-500 font-mono">
                                                        -{file.savings}%
                                                    </span>
                                                )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 font-mono">
                                            <span>
                                                Original:{" "}
                                                {formatBytes(file.originalSize)}
                                            </span>
                                            {file.optimizedSize !==
                                                undefined && (
                                                <>
                                                    <ArrowRight className="size-3 text-muted-foreground/60" />
                                                    <span className="font-bold text-foreground">
                                                        Optimized:{" "}
                                                        {formatBytes(
                                                            file.optimizedSize,
                                                        )}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress or status control */}
                                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                                    <div className="w-32 sm:w-40 flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            {file.status === "queued" && (
                                                <span className="text-muted-foreground font-semibold">
                                                    Queued
                                                </span>
                                            )}
                                            {file.status === "processing" && (
                                                <span className="text-primary flex items-center gap-1 font-semibold">
                                                    <RefreshCw className="size-3 animate-spin" />
                                                    Compressing...
                                                </span>
                                            )}
                                            {file.status === "completed" && (
                                                <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                                                    <CheckCircle2 className="size-3.5" />
                                                    Optimized
                                                </span>
                                            )}
                                            {file.status === "failed" && (
                                                <span className="text-destructive flex items-center gap-1 font-semibold">
                                                    <AlertCircle className="size-3.5" />
                                                    Error
                                                </span>
                                            )}
                                            <span className="font-mono text-muted-foreground">
                                                {file.progress}%
                                            </span>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    file.status === "completed"
                                                        ? "bg-emerald-500"
                                                        : file.status ===
                                                            "failed"
                                                          ? "bg-destructive"
                                                          : "bg-primary"
                                                }`}
                                                style={{
                                                    width: `${file.progress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Download / Remove Actions */}
                                    <div className="flex items-center gap-2">
                                        {file.status === "completed" ? (
                                            <Button
                                                size="icon-sm"
                                                variant="default"
                                                onClick={() =>
                                                    onDownloadFile(file)
                                                }
                                                title="Download Optimized Asset"
                                            >
                                                <Download className="size-3.5" />
                                            </Button>
                                        ) : (
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                                disabled
                                                className="opacity-40"
                                            >
                                                <Download className="size-3.5" />
                                            </Button>
                                        )}
                                        <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            onClick={() =>
                                                onRemoveFile(file.id)
                                            }
                                            className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground cursor-pointer"
                                            title="Remove File"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Bottom action bar */}
                    {(queuedFiles.length > 0 || completedFiles.length > 1) && (
                        <div className="p-4 bg-muted/20 border-t border-border/40 flex flex-col sm:flex-row items-center gap-3 justify-center">
                            {queuedFiles.length > 0 && (
                                <Button
                                    size="default"
                                    variant="default"
                                    onClick={onStartProcessing}
                                    className="w-full sm:w-auto px-8 font-bold text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 flex items-center gap-2 cursor-pointer"
                                >
                                    Start Processing ({queuedFiles.length}{" "}
                                    files)
                                </Button>
                            )}
                            {completedFiles.length > 1 && (
                                <Button
                                    size="default"
                                    variant="outline"
                                    onClick={onDownloadAll}
                                    className="w-full sm:w-auto px-8 font-bold text-sm flex items-center gap-2 cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
                                >
                                    <DownloadCloud className="size-4" />
                                    Download All ({completedFiles.length})
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
