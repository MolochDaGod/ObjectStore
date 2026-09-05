/**
 * Paperdoll head follow — cursor lookAt (threejs-games model-lookat-cursor).
 * Post-mixer on Neck + Head only. Never the kit root / Bip001 hip.
 */
import * as THREE from 'https://esm.sh/three@0.185.0';

const HEAD_NAMES = ['Bip001 Head', 'Bip001_Head', 'mixamorigHead', 'Head'];
const NECK_NAMES = ['Bip001 Neck', 'Bip001_Neck', 'mixamorigNeck', 'Neck'];

const YAW_MAX = 0.9;
const PITCH_MAX = 0.48;
const FOLLOW = 8;

function findNamed(root, names) {
  for (const n of names) {
    const o = root.getObjectByName(n);
    if (o) return o;
  }
  return null;
}

const _headW = new THREE.Vector3();
const _camDir = new THREE.Vector3();
const _hit = new THREE.Vector3();
const _localHead = new THREE.Vector3();
const _localHit = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _e = new THREE.Euler(0, 0, 0, 'YXZ');
const _q = new THREE.Quaternion();
const _plane = new THREE.Plane();
const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();

export function createHeadLook(root, canvas) {
  const head = findNamed(root, HEAD_NAMES);
  const neck = findNamed(root, NECK_NAMES);
  if (!head) {
    return { update() {}, dispose() {} };
  }

  let over = false;
  let yaw = 0;
  let pitch = 0;

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    _ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    _ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    over = true;
  };
  const onLeave = () => {
    over = false;
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  function aimPoint(camera) {
    head.getWorldPosition(_headW);
    if (over) {
      camera.getWorldDirection(_camDir);
      _plane.setFromNormalAndCoplanarPoint(_camDir, _headW);
      _raycaster.setFromCamera(_ndc, camera);
      if (_raycaster.ray.intersectPlane(_plane, _hit)) return _hit;
    }
    camera.getWorldPosition(_hit);
    return _hit;
  }

  function update(camera, dt, charRoot) {
    const space = charRoot || root;
    const target = aimPoint(camera);
    space.worldToLocal(_localHead.copy(_headW));
    space.worldToLocal(_localHit.copy(target));
    _dir.subVectors(_localHit, _localHead);
    if (_dir.lengthSq() < 1e-10) return;

    let ty = Math.atan2(_dir.x, _dir.z);
    let tp = Math.atan2(-_dir.y, Math.hypot(_dir.x, _dir.z));
    ty = THREE.MathUtils.clamp(ty, -YAW_MAX, YAW_MAX);
    tp = THREE.MathUtils.clamp(tp, -PITCH_MAX, PITCH_MAX);

    const k = 1 - Math.exp(-(dt || 1 / 60) * FOLLOW);
    yaw += (ty - yaw) * k;
    pitch += (tp - pitch) * k;

    if (neck) {
      _e.set(0, yaw * 0.38, 0);
      _q.setFromEuler(_e);
      neck.quaternion.premultiply(_q);
    }
    _e.set(pitch, yaw * (neck ? 0.62 : 1), 0);
    _q.setFromEuler(_e);
    head.quaternion.premultiply(_q);
  }

  function dispose() {
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
  }

  return { update, dispose, head, neck };
}
