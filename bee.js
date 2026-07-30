import * as THREE from "three";

const beeScene = document.getElementById("beeScene");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  40,
  beeScene.clientWidth / beeScene.clientHeight,
  0.1,
  100,
);
camera.position.set(0, 0, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setSize(beeScene.clientWidth, beeScene.clientHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

beeScene.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 2.2));
const light = new THREE.DirectionalLight(0xffd27a, 3);
light.position.set(4, 6, 8);
scene.add(light);

const yellow = new THREE.MeshPhongMaterial({ color: 0xf4ad20, shininess: 55 });
const brown = new THREE.MeshPhongMaterial({ color: 0x2b170c, shininess: 25 });
const eyeMaterial = new THREE.MeshPhongMaterial({
  color: 0x080605,
  shininess: 100,
});
const wingMaterial = new THREE.MeshPhongMaterial({
  color: 0xece4ff,
  transparent: true,
  opacity: 0.62,
  side: THREE.DoubleSide,
  shininess: 100,
});
const metal = new THREE.MeshPhongMaterial({ color: 0xb78a47, shininess: 95 });
const honey = new THREE.MeshPhongMaterial({ color: 0xffa600, shininess: 110 });

function sphere(x, y, z, sx, sy, sz, material) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  return mesh;
}

const bee = new THREE.Group();
bee.scale.set(-0.32, 0.32, 0.32);
bee.position.set(8, 2, 0);
bee.visible = false;
scene.add(bee);

bee.add(sphere(-0.7, 0, 0, 1.65, 0.95, 0.95, yellow));
bee.add(sphere(0.55, 0.03, 0, 1.05, 1, 1, brown));
bee.add(sphere(1.55, 0.05, 0, 0.85, 0.88, 0.88, yellow));

for (const x of [-1.45, -0.85, -0.25]) {
  const stripe = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.14, 12, 32),
    brown,
  );
  stripe.position.x = x;
  stripe.rotation.y = Math.PI / 2;
  bee.add(stripe);
}

for (const z of [-0.52, 0.52]) {
  const eye = sphere(2.12, 0.22, z, 0.3, 0.38, 0.2, eyeMaterial);
  bee.add(eye);
  const shine = sphere(
    2.28,
    0.36,
    z * 1.04,
    0.065,
    0.065,
    0.045,
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  bee.add(shine);
}

function rod(start, end, radius, material) {
  const direction = end.clone().sub(start);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), 10),
    material,
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize(),
  );
  return mesh;
}

for (const z of [-0.26, 0.26]) {
  bee.add(
    rod(
      new THREE.Vector3(1.55, 0.62, z),
      new THREE.Vector3(1.78, 1.25, z * 1.7),
      0.06,
      brown,
    ),
  );
}

const wings = [];
function wing(x, z, angle) {
  const pivot = new THREE.Group();
  pivot.position.set(x, 0.7, z);
  pivot.rotation.z = angle;
  const mesh = sphere(-0.85, 0.5, 0, 1.25, 0.38, 0.06, wingMaterial);
  pivot.add(mesh);
  bee.add(pivot);
  wings.push(pivot);
}
wing(0.35, 0.45, -0.35);
wing(0.35, -0.45, -0.35);
wing(-0.35, 0.38, -0.55);
wing(-0.35, -0.38, -0.55);

const legs = [];
for (let i = 0; i < 3; i++) {
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(0.65 - i * 0.6, -0.55, side * 0.5);
    leg.add(
      rod(
        new THREE.Vector3(),
        new THREE.Vector3(-0.08, -0.55, side * 0.25),
        0.055,
        brown,
      ),
    );
    leg.add(
      rod(
        new THREE.Vector3(-0.08, -0.55, side * 0.25),
        new THREE.Vector3(0.12, -1, side * 0.42),
        0.045,
        brown,
      ),
    );
    bee.add(leg);
    legs.push(leg);
  }
}

const bucketRig = new THREE.Group();
bucketRig.position.set(1.05, -1.65, 0.55);
bee.add(bucketRig);

const bucket = new THREE.Mesh(
  new THREE.CylinderGeometry(0.42, 0.34, 0.72, 24),
  metal,
);
bucketRig.add(bucket);

const honeyTop = new THREE.Mesh(
  new THREE.CylinderGeometry(0.36, 0.36, 0.035, 24),
  honey,
);
honeyTop.position.y = 0.37;
bucketRig.add(honeyTop);

const handle = new THREE.Mesh(
  new THREE.TorusGeometry(0.43, 0.03, 8, 24, Math.PI),
  metal,
);
handle.position.y = 0.36;
bucketRig.add(handle);

const historyMessage = document.getElementById("historyMessage");
const clock = new THREE.Clock();

let previousTime = 0;
let phase = "idle";
let waitingStarted = 0;
let historyText = "";

function prepareHistoryMessage() {
  const cpu = document.getElementById("cpuText").textContent;
  const memory = document.getElementById("memoryText").textContent;
  const storage = document.getElementById("storageText").textContent;

  historyText = `CPU: ${cpu} · Memory: ${memory} · Storage: ${storage}`;

  historyMessage.textContent = "";
  historyMessage.style.opacity = "1";
}

function startHistoryAnimation() {
  if (phase !== "idle") {
    return;
  }

  bee.visible = true;
  bee.position.set(8, 1.5, 0);
  bee.scale.x = -Math.abs(bee.scale.x);

  prepareHistoryMessage();
  phase = "flying-left";
}

setTimeout(startHistoryAnimation, 1500);
setInterval(startHistoryAnimation, 60000);

renderer.setAnimationLoop(() => {
  const time = clock.getElapsedTime();
  const delta = Math.min(time - previousTime, 0.05);
  previousTime = time;

  const flap = Math.sin(time * 26);

  wings[0].rotation.x = 0.7 + flap * 0.65;
  wings[1].rotation.x = -0.7 - flap * 0.65;
  wings[2].rotation.x = 0.48 - flap * 0.5;
  wings[3].rotation.x = -0.48 + flap * 0.5;

  bee.position.y = 2 + Math.sin(time * 2.2) * 0.18;
  bee.rotation.z = Math.sin(time * 1.5) * 0.035;

  legs.forEach((leg, index) => {
    leg.rotation.z = Math.sin(time * 2.5 + index) * 0.08;
  });

  bucketRig.rotation.z = Math.sin(time * 2.3) * 0.14;

  if (phase === "flying-left") {
    bee.position.x -= delta * 3;

    if (bee.position.x < 4.8) {
      const progress = Math.min((4.8 - bee.position.x) / 5.4, 1);

      const characterCount = Math.floor(progress * historyText.length);

      historyMessage.textContent = historyText.slice(0, characterCount);
    }

    if (bee.position.x <= -0.8) {
      bee.position.x = -0.8;
      historyMessage.textContent = historyText;
      waitingStarted = time;
      phase = "waiting";
    }
  }

  if (phase === "waiting" && time - waitingStarted >= 8) {
    bee.scale.x = Math.abs(bee.scale.x);
    phase = "flying-right";
  }

  if (phase === "flying-right") {
    bee.position.x += delta * 2.2;

    const progress = Math.min((bee.position.x + 0.8) / 6.4, 1);

    const removedCharacters = Math.floor(progress * historyText.length);

    historyMessage.textContent = historyText.slice(removedCharacters);

    if (bee.position.x >= 8) {
      bee.visible = false;
      historyMessage.textContent = "";
      historyMessage.style.opacity = "0";
      phase = "idle";
    }
  }

  renderer.render(scene, camera);
});
addEventListener("resize", () => {
  camera.aspect = beeScene.clientWidth / beeScene.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(beeScene.clientWidth, beeScene.clientHeight);
});
