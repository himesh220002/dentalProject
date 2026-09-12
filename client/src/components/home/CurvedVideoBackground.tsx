'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CurvedVideoBackgroundProps {
    videoUrl?: string;
    bendDepth?: number;
    showControls?: boolean;
    interactive?: boolean;
}

export default function CurvedVideoBackground({
    videoUrl = '/video/canvasvideo.mp4',
    bendDepth: initialBendDepth = 4.2,
    showControls = true,
    interactive = true
}: CurvedVideoBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [wireframe, setWireframe] = useState(false);
    const [bendDepth, setBendDepth] = useState(initialBendDepth);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [controlsOpen, setControlsOpen] = useState(false);

    const sceneRef = useRef<THREE.Scene | null>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const wireframeMeshRef = useRef<THREE.Mesh | null>(null);
    const geomRef = useRef<THREE.PlaneGeometry | null>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial | THREE.MeshBasicMaterial | null>(null);
    const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({ x: 0, y: 0, targetX: 0, targetY: 0 });

    // Mathematical plane curve algorithm from Three.js specification
    const applyPlaneCurve = (geometry: THREE.PlaneGeometry, z: number) => {
        const p = geometry.parameters;
        const hw = p.width * 0.5;

        if (Math.abs(z) < 0.01) return;

        const a = new THREE.Vector2(-hw, 0);
        const b = new THREE.Vector2(0, z);
        const c = new THREE.Vector2(hw, 0);

        const ab = new THREE.Vector2().subVectors(a, b);
        const bc = new THREE.Vector2().subVectors(b, c);
        const ac = new THREE.Vector2().subVectors(a, c);

        const crossVal = Math.abs(ab.cross(ac));
        if (crossVal < 0.0001) return;

        const r = (ab.length() * bc.length() * ac.length()) / (2 * crossVal);

        const center = new THREE.Vector2(0, z - r);
        const baseV = new THREE.Vector2().subVectors(a, center);
        const baseAngle = baseV.angle() - Math.PI * 0.5;
        const arc = baseAngle * 2;

        const uv = geometry.attributes.uv;
        const pos = geometry.attributes.position;
        const mainV = new THREE.Vector2();

        for (let i = 0; i < uv.count; i++) {
            const uvRatio = 1 - uv.getX(i);
            const y = pos.getY(i);
            mainV.copy(c).rotateAround(center, arc * uvRatio);
            pos.setXYZ(i, mainV.x, y, -mainV.y);
        }

        pos.needsUpdate = true;
        geometry.computeVertexNormals();
    };

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;
        const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

        // 1. Create Hidden Video Element for Autoplay
        const video = document.createElement('video');
        video.src = encodeURI(videoUrl);
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.setAttribute('aria-hidden', 'true');
        video.style.display = 'none';
        document.body.appendChild(video);
        videoRef.current = video;

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.then(() => setIsPlaying(true)).catch((err) => {
                if (err.name !== 'AbortError') {
                    console.warn('Video autoplay initiated with fallback:', err);
                }
                setIsPlaying(false);
            });
        }

        // 2. Setup Three.js Scene, Camera, Renderer
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
        camera.position.set(0, 0, 14.8);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);

        // 3. Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x38bdf8, 2.5, 60);
        pointLight.position.set(10, 12, 15);
        scene.add(pointLight);

        const fillLight = new THREE.PointLight(0x818cf8, 1.8, 50);
        fillLight.position.set(-10, -6, 10);
        scene.add(fillLight);

        // 4. Video Texture & Mesh Creation (Smooth, Zero Grid Overlay)
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.colorSpace = THREE.SRGBColorSpace;
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        // Slightly oversized plane so even at max rotation the edges still cover viewport
        const planeWidth = 40;
        const planeHeight = 22.5; // 16:9
        const geom = new THREE.PlaneGeometry(planeWidth, planeHeight, 48, 32);
        geomRef.current = geom;

        applyPlaneCurve(geom, bendDepth);

        // Material with video texture
        const mat = new THREE.MeshStandardMaterial({
            map: videoTexture,
            side: THREE.DoubleSide,
            roughness: 0.15,
            metalness: 0.1,
            wireframe: wireframe,
        });
        materialRef.current = mat;

        const mesh = new THREE.Mesh(geom, mat);
        meshRef.current = mesh;
        scene.add(mesh);

        // Wireframe Overlay Mesh (only visible when toggled ON in controls)
        const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
            transparent: true,
            opacity: wireframe ? 0.9 : 0,
            visible: wireframe,
        });
        const wireframeMesh = new THREE.Mesh(geom, wireframeMat);
        wireframeMeshRef.current = wireframeMesh;
        scene.add(wireframeMesh);

        // 5. Interactive Mouse Movement Parallax — clamped so extreme drag still keeps screen fully visible
        const handleMouseMove = (e: MouseEvent) => {
            if (!interactive) return;
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
            // reduced range + hard clamp keeps rotation within visible bounds
            mouseRef.current.targetX = clamp(x * 0.22, -0.22, 0.22);
            mouseRef.current.targetY = clamp(y * 0.12, -0.12, 0.12);
        };

        window.addEventListener('mousemove', handleMouseMove);
        const handleTouchMove = (e: TouchEvent) => {
            if (!interactive || !e.touches[0]) return;
            const rect = container.getBoundingClientRect();
            const x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
            const y = -(((e.touches[0].clientY - rect.top) / rect.height) * 2 - 1);
            mouseRef.current.targetX = clamp(x * 0.22, -0.22, 0.22);
            mouseRef.current.targetY = clamp(y * 0.12, -0.12, 0.12);
        };
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        const handlePointerLeave = () => {
            mouseRef.current.targetX = 0;
            mouseRef.current.targetY = 0;
        };
        window.addEventListener('mouseleave', handlePointerLeave);

        // 6. Responsive Resize Listener
        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // 7. Animation Render Loop (using performance timer to avoid deprecation warnings)
        let animationFrameId: number;
        const startTime = performance.now();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = (performance.now() - startTime) * 0.001;

            // Smooth interpolation + hard limits guarantee edges never leave viewport
            mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
            mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

            if (mesh) {
                const ry = clamp(mouseRef.current.x + Math.sin(elapsedTime * 0.4) * 0.03, -0.24, 0.24);
                const rx = clamp(mouseRef.current.y + Math.cos(elapsedTime * 0.3) * 0.015, -0.14, 0.14);
                mesh.rotation.y = ry;
                mesh.rotation.x = rx;
                // subtle scale-up at extremes keeps corners covered
                const s = 1 + Math.abs(ry) * 0.06;
                mesh.scale.set(s, s, 1);
                if (wireframeMesh) wireframeMesh.scale.set(s, s, 1);
            }

            if (wireframeMesh) {
                wireframeMesh.rotation.y = mesh.rotation.y;
                wireframeMesh.rotation.x = mesh.rotation.x;
            }

            renderer.render(scene, camera);
        };

        animate();

        // 8. Cleanup Resources on Unmount
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseleave', handlePointerLeave);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);

            if (videoRef.current && videoRef.current.parentNode) {
                videoRef.current.pause();
                videoRef.current.parentNode.removeChild(videoRef.current);
            }

            videoTexture.dispose();
            geom.dispose();
            mat.dispose();
            wireframeMat.dispose();
            renderer.dispose();
        };
    }, [videoUrl]);

    // Dynamic Updates for Curvature & Wireframe — keep same oversized plane as initial
    useEffect(() => {
        if (!meshRef.current) return;
        const planeWidth = 40;
        const planeHeight = 22.5;

        const newGeom = new THREE.PlaneGeometry(planeWidth, planeHeight, 48, 32);
        applyPlaneCurve(newGeom, bendDepth);

        if (meshRef.current) {
            meshRef.current.geometry.dispose();
            meshRef.current.geometry = newGeom;
        }
        if (wireframeMeshRef.current) {
            wireframeMeshRef.current.geometry = newGeom;
        }
        geomRef.current = newGeom;
    }, [bendDepth]);

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.wireframe = wireframe;
        }
        if (wireframeMeshRef.current) {
            const wireMat = wireframeMeshRef.current.material as THREE.MeshBasicMaterial;
            wireMat.opacity = wireframe ? 0.9 : 0;
            wireframeMeshRef.current.visible = wireframe;
        }
    }, [wireframe]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <div ref={containerRef} className="relative w-full h-full min-h-[500px] overflow-hidden select-none">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {showControls && (
                <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
                    {controlsOpen && (
                        <div className="bg-[#0a102e]/90 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-white shadow-2xl text-xs space-y-3 min-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex items-center justify-between font-semibold border-b border-white/10 pb-2">
                                <span>3D Curved Screen</span>
                                <span className="text-[10px] text-blue-400 font-mono">THREE.JS</span>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px] text-neutral-300">
                                    <span>Bend Depth</span>
                                    <span className="font-mono text-blue-400">{bendDepth.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="8"
                                    step="0.1"
                                    value={bendDepth}
                                    onChange={(e) => setBendDepth(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-neutral-300">
                                <span>Wireframe Mode</span>
                                <button
                                    onClick={() => setWireframe(!wireframe)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${wireframe ? 'bg-blue-500 text-white' : 'bg-white/10 text-neutral-400'
                                        }`}
                                >
                                    {wireframe ? 'ON' : 'OFF'}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                                <button
                                    onClick={togglePlay}
                                    className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-medium transition"
                                >
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>
                                <button
                                    onClick={toggleMute}
                                    className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-medium transition"
                                >
                                    {isMuted ? 'Unmute' : 'Mute'}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setControlsOpen(!controlsOpen)}
                        className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium backdrop-blur-md shadow-lg transition flex items-center gap-2"
                    >
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        {controlsOpen ? 'Close Controls' : '3D Display Controls'}
                    </button>
                </div>
            )}
        </div>
    );
}
