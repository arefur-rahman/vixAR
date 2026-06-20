"use client";

import React from "react";
import Link from "next/link";
import {
    Settings2,
    Image as ImageIcon,
    FileText,
    FileVideo,
    Code,
    Check
} from "lucide-react";

interface ToolSuiteGridProps {
    activeSuite: "image" | "pdf" | "audio-video" | "web-dev" | null;
    setActiveSuite: (suite: "image" | "pdf" | "audio-video" | "web-dev" | null) => void;
    imgQuality: number;
    setImgQuality: (val: number) => void;
    imgFormat: string;
    setImgFormat: (val: string) => void;
    imgResize: boolean;
    setImgResize: (val: boolean) => void;
    imgResizeWidth: number;
    setImgResizeWidth: (val: number) => void;
    pdfCompression: "extreme" | "recommended" | "low";
    setPdfCompression: (val: "extreme" | "recommended" | "low") => void;
    mediaTarget: "mp3" | "gif";
    setMediaTarget: (val: "mp3" | "gif") => void;
    mediaScale: number;
    setMediaScale: (val: number) => void;
    webMinifyHtml: boolean;
    setWebMinifyHtml: (val: boolean) => void;
    webMinifyCss: boolean;
    setWebMinifyCss: (val: boolean) => void;
    webMinifyJs: boolean;
    setWebMinifyJs: (val: boolean) => void;
    webOptimizeSvg: boolean;
    setWebOptimizeSvg: (val: boolean) => void;
}

export function ToolSuiteGrid({
    activeSuite,
    setActiveSuite,
    imgQuality,
    setImgQuality,
    imgFormat,
    setImgFormat,
    imgResize,
    setImgResize,
    imgResizeWidth,
    setImgResizeWidth,
    pdfCompression,
    setPdfCompression,
    mediaTarget,
    setMediaTarget,
    mediaScale,
    setMediaScale,
    webMinifyHtml,
    setWebMinifyHtml,
    webMinifyCss,
    setWebMinifyCss,
    webMinifyJs,
    setWebMinifyJs,
    webOptimizeSvg,
    setWebOptimizeSvg,
}: ToolSuiteGridProps) {
    return (
        <div className="border border-border bg-card rounded-2xl p-6 shadow-md shadow-violet-600/5">
            <h2 className="text-xl font-bold tracking-tight mb-5 flex items-center gap-2">
                <Settings2 className="size-4.5 text-primary" />
                Tool Suite Grid
            </h2>

            {/* SUITE CARDS CONTAINER */}
            <div className="grid grid-cols-1 gap-3">
                {/* IMAGE SUITE */}
                <div
                    onClick={() => setActiveSuite("image")}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group/card ${
                        activeSuite === "image"
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border hover:border-primary/40 hover:bg-muted/20 bg-card"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                                <ImageIcon className="size-4.5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">
                                    Image Suite
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Compress, Convert & Resize
                                </p>
                            </div>
                        </div>
                        <div
                            className={`size-5 rounded-full border border-border flex items-center justify-center ${
                                activeSuite === "image"
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : ""
                            }`}
                        >
                            {activeSuite === "image" && (
                                <Check className="size-3" />
                            )}
                        </div>
                    </div>

                    {/* Sub-panel parameters (displays when active) */}
                    {activeSuite === "image" && (
                        <div className="mt-5 pt-4 border-t border-border/40 flex flex-col gap-4 text-xs animate-fadeIn">
                            <div>
                                <div className="flex justify-between font-semibold mb-1">
                                    <span>Compression Quality</span>
                                    <span className="font-mono text-primary">
                                        {imgQuality}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="20"
                                    max="100"
                                    value={imgQuality}
                                    onChange={(e) =>
                                        setImgQuality(Number(e.target.value))
                                    }
                                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div>
                                <span className="font-semibold block mb-1.5">
                                    Output Format
                                </span>
                                <div className="grid grid-cols-3 gap-2">
                                    {["original", "webp", "png", "jpeg", "avif", "heic"].map((f) => (
                                        <button
                                            key={f}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImgFormat(f);
                                            }}
                                            className={`py-1.5 px-2 rounded-lg border text-center font-mono capitalize transition-all cursor-pointer text-xs ${
                                                imgFormat === f
                                                    ? "bg-primary border-primary text-primary-foreground font-semibold"
                                                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {f === "original" ? "Keep" : f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="font-semibold">
                                    Resize Dimensions
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setImgResize(!imgResize);
                                    }}
                                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                                        imgResize ? "bg-primary" : "bg-muted"
                                    }`}
                                >
                                    <span
                                        className={`size-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                                            imgResize ? "left-5" : "left-0.5"
                                        }`}
                                    />
                                </button>
                            </div>

                            {imgResize && (
                                <div className="grid grid-cols-2 gap-2 items-center">
                                    <span className="text-muted-foreground font-mono">
                                        Max Width:
                                    </span>
                                    <input
                                        type="number"
                                        value={imgResizeWidth}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) =>
                                            setImgResizeWidth(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="px-2 py-1 bg-muted border border-border rounded-md text-right font-mono"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* PDF SUITE */}
                <div
                    onClick={() => setActiveSuite("pdf")}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group/card ${
                        activeSuite === "pdf"
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border hover:border-primary/40 hover:bg-muted/20 bg-card"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                                <FileText className="size-4.5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">PDF Suite</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Compress, Merge & Split
                                </p>
                            </div>
                        </div>
                        <div
                            className={`size-5 rounded-full border border-border flex items-center justify-center ${
                                activeSuite === "pdf"
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : ""
                            }`}
                        >
                            {activeSuite === "pdf" && (
                                <Check className="size-3" />
                            )}
                        </div>
                    </div>

                    {activeSuite === "pdf" && (
                        <div className="mt-5 pt-4 border-t border-border/40 flex flex-col gap-4 text-xs animate-fadeIn">
                            <div>
                                <span className="font-semibold block mb-2">
                                    Compression Level
                                </span>
                                <div className="flex flex-col gap-2">
                                    {[
                                        {
                                            value: "extreme",
                                            label: "Extreme (Lowest Quality)",
                                        },
                                        {
                                            value: "recommended",
                                            label: "Recommended (Good Quality)",
                                        },
                                        {
                                            value: "low",
                                            label: "Low (High Quality)",
                                        },
                                    ].map((opt) => (
                                        <label
                                            key={opt.value}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPdfCompression(
                                                    opt.value as
                                                        | "extreme"
                                                        | "recommended"
                                                        | "low",
                                                );
                                            }}
                                            className="flex items-center gap-2 cursor-pointer py-1"
                                        >
                                            <input
                                                type="radio"
                                                name="pdf-comp"
                                                checked={
                                                    pdfCompression === opt.value
                                                }
                                                readOnly
                                                className="accent-primary size-3.5"
                                            />
                                            <span
                                                className={
                                                    pdfCompression === opt.value
                                                        ? "font-semibold"
                                                        : "text-muted-foreground"
                                                }
                                            >
                                                {opt.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border/40 mt-1">
                                <Link
                                    href="/pdf"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-xs font-semibold w-full cursor-pointer"
                                >
                                    <span>Merge or Split PDFs</span>
                                    <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded-sm">Advanced Tools →</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* VIDEO & AUDIO */}
                <div
                    onClick={() => setActiveSuite("audio-video")}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group/card ${
                        activeSuite === "audio-video"
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border hover:border-primary/40 hover:bg-muted/20 bg-card"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                                <FileVideo className="size-4.5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">
                                    Video & Audio
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Video to GIF, Extract Audio
                                </p>
                            </div>
                        </div>
                        <div
                            className={`size-5 rounded-full border border-border flex items-center justify-center ${
                                activeSuite === "audio-video"
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : ""
                            }`}
                        >
                            {activeSuite === "audio-video" && (
                                <Check className="size-3" />
                            )}
                        </div>
                    </div>

                    {activeSuite === "audio-video" && (
                        <div className="mt-5 pt-4 border-t border-border/40 flex flex-col gap-4 text-xs animate-fadeIn">
                            <div>
                                <span className="font-semibold block mb-1.5">
                                    Conversion Mode
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: "gif", label: "Video to GIF" },
                                        { value: "mp3", label: "Extract MP3" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMediaTarget(
                                                    opt.value as "mp3" | "gif",
                                                );
                                            }}
                                            className={`py-1.5 px-2 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                                                mediaTarget === opt.value
                                                    ? "bg-primary border-primary text-primary-foreground"
                                                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {mediaTarget === "gif" && (
                                <div>
                                    <div className="flex justify-between font-semibold mb-1">
                                        <span>GIF Resolution Scale</span>
                                        <span className="font-mono text-primary">
                                            {mediaScale}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={mediaScale}
                                        onChange={(e) =>
                                            setMediaScale(Number(e.target.value))
                                        }
                                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* WEB DEV RESOURCES */}
                <div
                    onClick={() => setActiveSuite("web-dev")}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group/card ${
                        activeSuite === "web-dev"
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border hover:border-primary/40 hover:bg-muted/20 bg-card"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
                                <Code className="size-4.5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">
                                    Web Dev Resources
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Minify HTML, CSS, JS & SVG
                                </p>
                            </div>
                        </div>
                        <div
                            className={`size-5 rounded-full border border-border flex items-center justify-center ${
                                activeSuite === "web-dev"
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : ""
                            }`}
                        >
                            {activeSuite === "web-dev" && (
                                <Check className="size-3" />
                            )}
                        </div>
                    </div>

                    {activeSuite === "web-dev" && (
                        <div className="mt-5 pt-4 border-t border-border/40 flex flex-col gap-3.5 text-xs animate-fadeIn">
                            <span className="font-semibold block">
                                Minification Options
                            </span>

                            <div className="flex flex-col gap-2.5">
                                {[
                                    {
                                        checked: webMinifyHtml,
                                        setChecked: setWebMinifyHtml,
                                        label: "Minify HTML document structure",
                                    },
                                    {
                                        checked: webMinifyCss,
                                        setChecked: setWebMinifyCss,
                                        label: "Strip CSS whitespace & variables",
                                    },
                                    {
                                        checked: webMinifyJs,
                                        setChecked: setWebMinifyJs,
                                        label: "Mangle & compress JavaScript",
                                    },
                                    {
                                        checked: webOptimizeSvg,
                                        setChecked: setWebOptimizeSvg,
                                        label: "Optimize SVG vectors (SVGO)",
                                    },
                                ].map((item, idx) => (
                                    <label
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            item.setChecked(!item.checked);
                                        }}
                                        className="flex items-start gap-2.5 cursor-pointer py-0.5"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={item.checked}
                                            readOnly
                                            className="accent-primary rounded size-3.5 mt-0.5"
                                        />
                                        <span
                                            className={
                                                item.checked
                                                    ? "font-semibold"
                                                    : "text-muted-foreground"
                                            }
                                        >
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
