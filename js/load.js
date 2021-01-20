const scene = new THREE.Scene();
const backgroundColor = 0x323232;

scene.background = new THREE.Color(backgroundColor);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();
});

const geometry = new THREE.BoxGeometry();
const allTexture = [];
const t1 = new THREE.TextureLoader().load("./images/id_omar.png");
const t2 = new THREE.TextureLoader().load("./images/id_momen.jpg");
const t3 = new THREE.TextureLoader().load("./images/omar.jpg");
const t4 = new THREE.TextureLoader().load("./images/saber.jpg");
const t5 = new THREE.TextureLoader().load("./images/momen.jpg");
const t6 = new THREE.TextureLoader().load("./images/id_saber.png");

allTexture.push(new THREE.MeshBasicMaterial({ map: t1 }));
allTexture.push(new THREE.MeshBasicMaterial({ map: t2 }));
allTexture.push(new THREE.MeshBasicMaterial({ map: t3 }));
allTexture.push(new THREE.MeshBasicMaterial({ map: t4 }));
allTexture.push(new THREE.MeshBasicMaterial({ map: t5 }));
allTexture.push(new THREE.MeshBasicMaterial({ map: t6 }));

const cube = new THREE.Mesh(geometry, allTexture);
scene.add(cube);

camera.position.z = 2.5;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  cube.rotation.x += 0.023;
  cube.rotation.y += 0.023;
}
animate();
////////////////////////////////////
const listener = new THREE.AudioListener();
camera.add(listener);

// create a global audio source
const sound = new THREE.Audio(listener);

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load("./music.mp3", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
  sound.play();
});
