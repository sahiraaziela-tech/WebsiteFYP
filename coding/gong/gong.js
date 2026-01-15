import { DRACOLoader } from "/WebsiteFYP/libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "/WebsiteFYP/libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", () => {

  // ================= 1. FUNGSI TEKS INFO =================
  let toastTimer = null;
  function showInstructionText() {
    const toast = document.getElementById("info-toast"); // Pastikan anda tambah HTML ini nanti
    if (!toast) return;

    toast.classList.remove("toast-hidden");
    toast.classList.add("toast-visible");
    
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("toast-visible");
        toast.classList.add("toast-hidden");
    }, 4000); 
  }

  // ================= 2. UI BUTTONS =================
  function createGameButton(htmlContent, positionStyles, mainColor, shadowColor) {
    const btn = document.createElement("button");
    btn.innerHTML = htmlContent;
    Object.assign(btn.style, {
      position: "absolute", width: "65px", height: "65px",
      borderRadius: "50%", border: "4px solid #ffffff",
      background: mainColor, boxShadow: `0px 6px 0px ${shadowColor}, 0px 8px 10px rgba(0,0,0,0.4)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", zIndex: "1000", outline: "none",
      ...positionStyles
    });
    btn.addEventListener("mousedown", () => { btn.style.transform = "translateY(6px)"; btn.style.boxShadow = `0px 0px 0px ${shadowColor}`; });
    btn.addEventListener("mouseup", () => { btn.style.transform = "translateY(0px)"; btn.style.boxShadow = `0px 6px 0px ${shadowColor}, 0px 8px 10px rgba(0,0,0,0.4)`; });
    btn.addEventListener("touchstart", () => { btn.style.transform = "translateY(6px)"; btn.style.boxShadow = `0px 0px 0px ${shadowColor}`; });
    btn.addEventListener("touchend", () => { btn.style.transform = "translateY(0px)"; btn.style.boxShadow = `0px 6px 0px ${shadowColor}, 0px 8px 10px rgba(0,0,0,0.4)`; });
    document.body.appendChild(btn);
    return btn;
  }

  const backBtn = createGameButton(
    `<svg viewBox="0 0 24 24" width="32" height="32" fill="#5c2e00"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`, 
    { top: "20px", left: "20px" }, "linear-gradient(to bottom, #FFCC00 0%, #FF9900 100%)", "#b35900"
  );
  backBtn.addEventListener("click", () => { window.location.href = "/WebsiteFYP/muzik.html"; });


  // ================= 3. MAIN AR LOGIC =================
  const start = async () => {
    try {
      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.querySelector("#ar-container"),
        imageTargetSrc: "/WebsiteFYP/assets/targets/markergong.mind",
      });

      const { renderer, scene, camera } = mindarThree;
      scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));
      const anchor = mindarThree.addAnchor(0);

      // VARIABLE ANIMASI
      const clock = new THREE.Clock();
      let mixer = null;
      let hitAction = null;


      // ================= 4. AUDIO SETUP =================
      const listener = new THREE.AudioListener();
      camera.add(listener);
      const audioLoader = new THREE.AudioLoader();

      const gongHitSound = new THREE.Audio(listener);
      audioLoader.load("/WebsiteFYP/assets/sound/Gong.mp3", (buffer) => {
        gongHitSound.setBuffer(buffer);
        gongHitSound.setLoop(false); 
        gongHitSound.setVolume(1.0);
      });

      const gongMusic = new THREE.Audio(listener);
      audioLoader.load("/WebsiteFYP/assets/sound/LaguGong.mp3", (buffer) => { 
        gongMusic.setBuffer(buffer);
        gongMusic.setLoop(true); 
        gongMusic.setVolume(0.5);
      });


      // ================= 5. CREATE 3D OBJECTS =================
      
      const dLoader = new DRACOLoader();
      dLoader.setDecoderPath("/WebsiteFYP/libs/draco/");
      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dLoader);

      const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load("/WebsiteFYP/assets/models/gong.glb", resolve, undefined, reject);
      });

      const model = gltf.scene;
      model.scale.set(0.5, 0.5, 0.5);
      model.position.set(0, -0.4, 0); 
      
      // SETUP ANIMASI GONG
      const clips = gltf.animations;
      if (clips.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          hitAction = mixer.clipAction(clips[0]); // Ambil animasi pertama
          hitAction.setLoop(THREE.LoopOnce); 
          hitAction.clampWhenFinished = true;
      }

      model.userData = { type: "gongModel" }; 
      anchor.group.add(model);


      // BUTANG SPEAKER 3D
      function createMusicButton() {
          const geometry = new THREE.CircleGeometry(0.10, 32); 
          const canvas = document.createElement('canvas');
          canvas.width = 128; canvas.height = 128;
          const ctx = canvas.getContext('2d');

          ctx.beginPath(); ctx.arc(64, 64, 64, 0, Math.PI * 2);
          ctx.fillStyle = "#795548"; ctx.fill();

          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.moveTo(35, 50); ctx.lineTo(35, 78); ctx.lineTo(55, 78);
          ctx.lineTo(80, 100); ctx.lineTo(80, 28); ctx.lineTo(55, 50);
          ctx.closePath(); ctx.fill();

          ctx.strokeStyle = "white"; ctx.lineWidth = 6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(85, 64, 20, -Math.PI/3, Math.PI/3); ctx.stroke();
          ctx.beginPath(); ctx.arc(95, 64, 30, -Math.PI/3, Math.PI/3); ctx.stroke();

          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(0.75, -0.2, 0); 
          mesh.userData = { type: "musicBtn", clock: new THREE.Clock() };
          return mesh;
      }
      const musicBtn = createMusicButton();
      anchor.group.add(musicBtn);


      // ================= 6. INTERACTION =================
      let isRotating = false;
      let previousX = 0;
      let previousY = 0;
      const minX = -Math.PI / 6; 
      const maxX = Math.PI / 6;  

      window.addEventListener("pointerdown", (e) => {
        if (e.target.closest('button')) return;
        if (e.button === 1) { 
            e.preventDefault(); isRotating = true; previousX = e.clientX; previousY = e.clientY;
        }
      });

      window.addEventListener("pointerup", (e) => { if (e.button === 1) isRotating = false; });

      window.addEventListener("pointermove", (e) => {
        if (!isRotating) return;
        const deltaX = e.clientX - previousX;
        const deltaY = e.clientY - previousY;
        model.rotation.y += deltaX * 0.01;
        model.rotation.x += deltaY * 0.01;
        model.rotation.x = Math.max(minX, Math.min(maxX, model.rotation.x));
        previousX = e.clientX; previousY = e.clientY;
      });

      window.addEventListener("wheel", (e) => {
          e.preventDefault();
          let scale = model.scale.x; 
          scale -= e.deltaY * 0.001;
          scale = Math.min(Math.max(scale, 0.3), 2);
          model.scale.setScalar(scale);
      }, { passive: false });


      // ================= 7. CLICK LOGIC (ANIMASI + BUNYI + TEKS) =================
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let isMarkerVisible = false; 

      window.addEventListener("pointerup", (e) => {
        if (!isMarkerVisible) return; 
        if (e.button !== 0) return; 
        if (isRotating) return;
        if (e.target.closest('button')) return;

        if (listener.context.state === 'suspended') listener.context.resume();

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        const hits = raycaster.intersectObjects([model, musicBtn], true);

        if (hits.length > 0) {
            let object = hits[0].object;
            while(object.parent && !object.userData.type) { object = object.parent; }
            const type = object.userData.type;

            // --- A. KLIK BUTANG SPEAKER ---
            if (type === "musicBtn") {
                if (gongMusic.isPlaying) {
                    gongMusic.pause();
                    musicBtn.material.color.setHex(0xaaaaaa); 
                } else {
                    if (gongHitSound.isPlaying) gongHitSound.stop();
                    gongMusic.play();
                    musicBtn.material.color.setHex(0xffffff); 
                }
            }

            // --- B. KLIK MODEL GONG ---
            else if (type === "gongModel") {
                
                // 1. Teks Info Keluar
                showInstructionText();

                // 2. Stop lagu background
                if (gongMusic.isPlaying) {
                    gongMusic.pause();
                    musicBtn.material.color.setHex(0xaaaaaa); 
                }

                // 3. Main Animasi Pemukul
                if (hitAction) {
                    hitAction.stop(); 
                    hitAction.play(); 

                    // 4. Main Bunyi (Delay ikut animasi)
                    setTimeout(() => {
                         if (gongHitSound.isPlaying) gongHitSound.stop(); 
                         gongHitSound.play();
                    }, 200); 

                } else {
                    // Fallback (Gegar) kalau tiada animasi
                    if (gongHitSound.isPlaying) gongHitSound.stop(); 
                    gongHitSound.play();
                    model.scale.setScalar(model.scale.x * 1.05);
                    setTimeout(() => { model.scale.setScalar(model.scale.x / 1.05); }, 100);
                }
            }
        }
      });


      // ================= 8. TARGET EVENTS =================
      anchor.onTargetLost = () => {
        isMarkerVisible = false;
        if (gongMusic.isPlaying) gongMusic.pause();
        if (gongHitSound.isPlaying) gongHitSound.stop();
      };
      
      anchor.onTargetFound = () => {
        isMarkerVisible = true;
      };

      // ================= START =================
      await mindarThree.start();
      
      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta); // Gerakkan Animasi Blender

        if(musicBtn) {
            const time = musicBtn.userData.clock.getElapsedTime();
            const scale = 1 + Math.sin(time * 3) * 0.05; 
            musicBtn.scale.set(scale, scale, scale);
            musicBtn.lookAt(camera.position); 
        }
        renderer.render(scene, camera);
      });

    } catch (err) {
      console.error("AR ERROR:", err);
    }
  };

  start();
});