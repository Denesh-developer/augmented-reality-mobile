import React, { useEffect, useRef, useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import { createPhone } from './phoneBuilder';
import { getPhoneComponentTags } from '../data/componentResolver';
const PhoneViewerComponent = ({ config, explodeFactor = 0, selectedPartId = null, onSelectPart, interactive = true, autoRotate = false, quality = 'high', height = '100%', className = '', transparentBg = false, externalRotationDelta, pinchRaycastPoint, isRotationLocked = false, }, ref) => {
    const { i18n } = useTranslation();
    const isTamil = i18n.language === 'ta';
    const componentTags = useMemo(() => getPhoneComponentTags(config, isTamil), [config, isTamil]);
    const containerRef = useRef(null);
    const labelsContainerRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const phoneModelRef = useRef(null);
    const animFrameRef = useRef(null);
    const [hoveredPart, setHoveredPart] = useState(null);
    // Interaction refs
    const isPointerDownRef = useRef(false);
    const prevPointerRef = useRef({ x: 0, y: 0 });
    const targetRotationRef = useRef({ x: 0.12, y: 0.35 });
    const currentRotationRef = useRef({ x: 0.12, y: 0.35 });
    const idleFloatTimeRef = useRef(0);
    // Raycaster for part selection
    const raycasterRef = useRef(new THREE.Raycaster());
    const mouseVecRef = useRef(new THREE.Vector2());
    const lastPinchRaycastTimeRef = useRef(0);
    // Expose direct imperative methods for 60 FPS zero-lag interaction & zoom
    useImperativeHandle(ref, () => ({
        applyRotationDelta: (pitchDelta, yawDelta) => {
            if (isRotationLocked) return;
            targetRotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationRef.current.x + pitchDelta * 1.4));
            targetRotationRef.current.y += yawDelta * 1.4;
        },
        hoverAtPoint: (normX, normY) => {
            if (!cameraRef.current || !phoneModelRef.current)
                return null;
            mouseVecRef.current.x = normX * 2 - 1;
            mouseVecRef.current.y = -(normY * 2 - 1);
            raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
            const intersects = raycasterRef.current.intersectObjects(phoneModelRef.current.group.children, true);
            if (intersects.length > 0) {
                let curr = intersects[0].object;
                while (curr && curr.parent && curr.parent !== phoneModelRef.current.group) {
                    curr = curr.parent;
                }
                if (curr && curr.userData?.partId) {
                    const hitId = curr.userData.partId;
                    setHoveredPart(hitId);
                    return hitId;
                }
            }
            setHoveredPart(null);
            return null;
        },
        raycastAtPoint: (normX, normY) => {
            if (!cameraRef.current || !phoneModelRef.current)
                return null;
            mouseVecRef.current.x = normX * 2 - 1;
            mouseVecRef.current.y = -(normY * 2 - 1);
            raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
            const intersects = raycasterRef.current.intersectObjects(phoneModelRef.current.group.children, true);
            if (intersects.length > 0) {
                let curr = intersects[0].object;
                while (curr && curr.parent && curr.parent !== phoneModelRef.current.group) {
                    curr = curr.parent;
                }
                if (curr && curr.userData?.partId) {
                    const hitId = curr.userData.partId;
                    setHoveredPart(hitId);
                    if (onSelectPart) {
                        onSelectPart(hitId);
                    }
                    return hitId;
                }
            }
            return null;
        },
        resetView: () => {
            targetRotationRef.current = { x: 0.12, y: 0.35 };
            if (cameraRef.current)
                cameraRef.current.position.set(0, 0, 7.5);
        },
        zoomIn: () => {
            if (cameraRef.current) {
                cameraRef.current.position.z = Math.max(3.8, cameraRef.current.position.z - 0.7);
            }
        },
        zoomOut: () => {
            if (cameraRef.current) {
                cameraRef.current.position.z = Math.min(11.5, cameraRef.current.position.z + 0.7);
            }
        },
        resetZoom: () => {
            if (cameraRef.current)
                cameraRef.current.position.z = 7.5;
        },
    }));
    // 1. Initialize Scene & Three.js Canvas
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || 500;
        // Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        // Camera - Adjusted to distance 7.5 so exploded phone fits comfortably without clipping!
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0, 7.5);
        cameraRef.current = camera;
        // Renderer - optimized for 60 FPS
        const renderer = new THREE.WebGLRenderer({
            antialias: quality === 'high',
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 1.5 : 1.0));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = false;
        // Only clear previous WebGL canvases, preserve our HTML pin badges overlay
        const existingCanvas = container.querySelector('canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        container.insertBefore(renderer.domElement, container.firstChild);
        rendererRef.current = renderer;
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        scene.add(ambientLight);
        const frontLight = new THREE.DirectionalLight(0xffffff, 2.2);
        frontLight.position.set(3, 5, 7);
        scene.add(frontLight);
        const backLight = new THREE.DirectionalLight(0xffffff, 1.6);
        backLight.position.set(-3, 3, -7);
        scene.add(backLight);
        const cyanLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
        cyanLight.position.set(-5, 0, 5);
        scene.add(cyanLight);
        const purpleLight = new THREE.PointLight(0xa855f7, 2.4, 15);
        purpleLight.position.set(4, -3, 3);
        scene.add(purpleLight);
        // Soft ground contact shadow plane
        const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 128;
        shadowCanvas.height = 128;
        const sCtx = shadowCanvas.getContext('2d');
        if (sCtx) {
            const grad = sCtx.createRadialGradient(64, 64, 5, 64, 64, 60);
            grad.addColorStop(0, 'rgba(0,0,0,0.4)');
            grad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            sCtx.fillStyle = grad;
            sCtx.fillRect(0, 0, 128, 128);
        }
        const shadowTex = new THREE.CanvasTexture(shadowCanvas);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTex,
            transparent: true,
            depthWrite: false,
            opacity: 0.65,
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = -1.9;
        scene.add(shadowMesh);
        // Build the procedural phone model
        const phoneModel = createPhone(config);
        phoneModelRef.current = phoneModel;
        scene.add(phoneModel.group);
        // Animation Loop with 3D Billboarding Labels Projection
        const animate = () => {
            animFrameRef.current = requestAnimationFrame(animate);
            if (autoRotate && !isPointerDownRef.current) {
                targetRotationRef.current.y += 0.004;
            }
            // Smooth rotation lerp - responsive & snappy
            currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.18;
            currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.18;
            if (phoneModelRef.current) {
                phoneModelRef.current.group.rotation.x = currentRotationRef.current.x;
                phoneModelRef.current.group.rotation.y = currentRotationRef.current.y;
                // Gentle floating animation
                idleFloatTimeRef.current += 0.02;
                phoneModelRef.current.group.position.y = Math.sin(idleFloatTimeRef.current) * 0.04;
            }
            renderer.render(scene, camera);
            // 3D Projected Screen Position for Component Pin Badges
            if (phoneModelRef.current && cameraRef.current && containerRef.current) {
                const isExploded = explodeFactor > 0.08;
                const cW = containerRef.current.clientWidth;
                const cH = containerRef.current.clientHeight;
                phoneModelRef.current.partsMap.forEach((partObj, partId) => {
                    const el = document.getElementById(`pin-badge-${partId}`);
                    if (!el)
                        return;
                    if (!isExploded) {
                        el.style.display = 'none';
                        return;
                    }
                    const wp = new THREE.Vector3();
                    partObj.getWorldPosition(wp);
                    wp.y += 0.22; // Offset slightly above part
                    wp.project(cameraRef.current);
                    if (wp.z < 1.0 && wp.x >= -1.15 && wp.x <= 1.15 && wp.y >= -1.15 && wp.y <= 1.15) {
                        const px = ((wp.x + 1) / 2) * cW;
                        const py = ((-wp.y + 1) / 2) * cH;
                        el.style.display = 'flex';
                        el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
                    }
                    else {
                        el.style.display = 'none';
                    }
                });
            }
        };
        animate();
        // Resize observer
        const handleResize = () => {
            if (!container || !renderer || !camera)
                return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w === 0 || h === 0)
                return;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
        return () => {
            resizeObserver.disconnect();
            if (animFrameRef.current)
                cancelAnimationFrame(animFrameRef.current);
            if (phoneModelRef.current) {
                scene.remove(phoneModelRef.current.group);
                phoneModelRef.current.dispose();
            }
            renderer.dispose();
            shadowGeo.dispose();
            shadowMat.dispose();
            shadowTex.dispose();
        };
    }, [config.id, quality]);
    // 2. React to external hand rotation delta (with enhanced responsiveness)
    useEffect(() => {
        if (externalRotationDelta) {
            const pitch = (externalRotationDelta.pitch ?? externalRotationDelta.x ?? 0) * 1.4;
            const yaw = (externalRotationDelta.yaw ?? externalRotationDelta.y ?? 0) * 1.4;
            targetRotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationRef.current.x + pitch));
            targetRotationRef.current.y += yaw;
        }
    }, [externalRotationDelta]);
    // 3. React to Two-Finger Join (Pinch) Raycast Selection over a Mesh
    useEffect(() => {
        if (!pinchRaycastPoint || !cameraRef.current || !phoneModelRef.current)
            return;
        const now = Date.now();
        if (now - lastPinchRaycastTimeRef.current < 100)
            return;
        lastPinchRaycastTimeRef.current = now;
        mouseVecRef.current.x = pinchRaycastPoint.x * 2 - 1;
        mouseVecRef.current.y = -(pinchRaycastPoint.y * 2 - 1);
        raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(phoneModelRef.current.group.children, true);
        if (intersects.length > 0) {
            let curr = intersects[0].object;
            while (curr && curr.parent && curr.parent !== phoneModelRef.current.group) {
                curr = curr.parent;
            }
            if (curr && curr.userData?.partId) {
                const hitId = curr.userData.partId;
                setHoveredPart(hitId);
                if (onSelectPart) {
                    onSelectPart(hitId);
                }
            }
        }
    }, [pinchRaycastPoint, onSelectPart]);
    // 4. Animate Explode Factor smoothly with GSAP
    useEffect(() => {
        if (!phoneModelRef.current)
            return;
        const partsMap = phoneModelRef.current.partsMap;
        partsMap.forEach((partObj) => {
            const defaultPos = partObj.userData.defaultPos;
            const explodeOffset = partObj.userData.explodeOffset;
            if (defaultPos && explodeOffset) {
                const targetX = defaultPos.x + explodeOffset.x * explodeFactor;
                const targetY = defaultPos.y + explodeOffset.y * explodeFactor;
                const targetZ = defaultPos.z + explodeOffset.z * explodeFactor;
                gsap.to(partObj.position, {
                    x: targetX,
                    y: targetY,
                    z: targetZ,
                    duration: 0.45,
                    ease: 'power2.out',
                });
            }
        });
    }, [explodeFactor]);
    // 5. Highlight selected and dim unselected parts
    useEffect(() => {
        if (!phoneModelRef.current)
            return;
        const partsMap = phoneModelRef.current.partsMap;
        partsMap.forEach((partObj, partId) => {
            const isSelected = selectedPartId === partId;
            const isHovered = hoveredPart === partId;
            const hasSelection = Boolean(selectedPartId);
            partObj.traverse((child) => {
                if (child.isMesh) {
                    const mesh = child;
                    if (mesh.material) {
                        const mat = mesh.material;
                        if (isSelected) {
                            gsap.to(mat, { opacity: 1, duration: 0.25 });
                            if ('emissive' in mat) {
                                mat.emissive = new THREE.Color(0x00f0ff);
                                mat.emissiveIntensity = 0.65;
                            }
                        }
                        else if (isHovered) {
                            if ('emissive' in mat) {
                                mat.emissive = new THREE.Color(0x00f0ff);
                                mat.emissiveIntensity = 0.45;
                            }
                        }
                        else if (hasSelection) {
                            gsap.to(mat, { opacity: 0.88, duration: 0.25 });
                            if ('emissive' in mat) {
                                mat.emissive = new THREE.Color(0x000000);
                                mat.emissiveIntensity = 0;
                            }
                        }
                        else {
                            gsap.to(mat, { opacity: 1, duration: 0.25 });
                            if ('emissive' in mat) {
                                if (partId === 'screen') {
                                    mat.emissive = new THREE.Color(0x222222);
                                    mat.emissiveIntensity = 0.45;
                                }
                                else {
                                    mat.emissive = new THREE.Color(0x000000);
                                    mat.emissiveIntensity = 0;
                                }
                            }
                        }
                    }
                }
            });
        });
    }, [selectedPartId, hoveredPart]);
    // Mouse wheel zoom support
    const handleWheel = (e) => {
        if (!interactive || !cameraRef.current)
            return;
        cameraRef.current.position.z = Math.max(3.8, Math.min(11.5, cameraRef.current.position.z + e.deltaY * 0.006));
    };
    // Pointer Events for Dragging / Tapping
    const handlePointerDown = (e) => {
        if (!interactive)
            return;
        isPointerDownRef.current = true;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const handlePointerMove = (e) => {
        if (!interactive)
            return;
        if (isPointerDownRef.current && !isRotationLocked) {
            const deltaX = e.clientX - prevPointerRef.current.x;
            const deltaY = e.clientY - prevPointerRef.current.y;
            targetRotationRef.current.y += deltaX * 0.015;
            targetRotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationRef.current.x + deltaY * 0.015));
            prevPointerRef.current = { x: e.clientX, y: e.clientY };
        }
        // Hover detection over 3D meshes
        if (containerRef.current && cameraRef.current && phoneModelRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            mouseVecRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouseVecRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
            const intersects = raycasterRef.current.intersectObjects(phoneModelRef.current.group.children, true);
            if (intersects.length > 0) {
                let curr = intersects[0].object;
                while (curr && curr.parent && curr.parent !== phoneModelRef.current.group) {
                    curr = curr.parent;
                }
                if (curr && curr.userData?.partId) {
                    setHoveredPart(curr.userData.partId);
                    return;
                }
            }
            setHoveredPart(null);
        }
    };
    const handlePointerUp = (e) => {
        if (!interactive)
            return;
        const dist = Math.hypot(e.clientX - prevPointerRef.current.x, e.clientY - prevPointerRef.current.y);
        isPointerDownRef.current = false;
        // Click ONLY triggers when tap motion is small (not during drag)
        if (dist < 8 && hoveredPart && onSelectPart) {
            onSelectPart(hoveredPart);
        }
    };
    return (<div ref={containerRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onWheel={handleWheel} style={{ height }} className={`relative w-full cursor-grab active:cursor-grabbing select-none overflow-hidden ${transparentBg ? 'bg-transparent' : 'bg-radial-gradient from-navy-900/60 to-navy-950'} ${className}`}>
      {/* 3D Floating Component Name Pins directly on each exploded part */}
      <div ref={labelsContainerRef} className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {componentTags.map((tag) => (<button key={tag.id} id={`pin-badge-${tag.id}`} style={{ display: 'none', top: 0, left: 0 }} onClick={(e) => {
                e.stopPropagation();
                onSelectPart?.(tag.id);
            }} onPointerEnter={() => setHoveredPart(tag.id)} onPointerLeave={() => setHoveredPart(null)} className={`absolute pointer-events-auto flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md border transition-all duration-150 text-[10px] font-medium cursor-pointer shadow-md select-none max-w-[140px] truncate ${selectedPartId === tag.id
                ? 'bg-cyan-500/95 text-navy-950 border-cyan-200 scale-105 shadow-[0_0_12px_#00f0ff]'
                : hoveredPart === tag.id
                    ? 'bg-navy-900/95 text-cyan-300 border-cyan-400 scale-100 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'bg-navy-950/75 text-white/80 border-white/15 hover:border-cyan-400/60 hover:text-cyan-300'}`}>
            <span className="text-[11px] leading-none">{tag.icon}</span>
            <span className="font-heading tracking-tight leading-tight truncate">
              {isTamil ? tag.name_ta : tag.name}
            </span>
          </button>))}
      </div>

      {/* Floating On-Screen Zoom Controls */}
      <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-navy-950/80 backdrop-blur-md border border-white/10 shadow-lg z-30">
        <button onClick={(e) => {
            e.stopPropagation();
            if (cameraRef.current) {
                cameraRef.current.position.z = Math.max(3.8, cameraRef.current.position.z - 0.7);
            }
        }} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 font-bold text-base flex items-center justify-center transition-colors" title="Zoom In (+)">
          +
        </button>
        <button onClick={(e) => {
            e.stopPropagation();
            if (cameraRef.current) {
                cameraRef.current.position.z = 7.5;
                targetRotationRef.current = { x: 0.12, y: 0.35 };
            }
        }} className="px-2.5 h-8 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 font-mono text-xs flex items-center justify-center transition-colors" title="Reset Zoom & View">
          Fit
        </button>
        <button onClick={(e) => {
            e.stopPropagation();
            if (cameraRef.current) {
                cameraRef.current.position.z = Math.min(11.5, cameraRef.current.position.z + 0.7);
            }
        }} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 font-bold text-base flex items-center justify-center transition-colors" title="Zoom Out (-)">
          -
        </button>
      </div>
    </div>);
};
export const PhoneViewer = forwardRef(PhoneViewerComponent);
export default PhoneViewer;
