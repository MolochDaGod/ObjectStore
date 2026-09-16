/**
 * Post-mixer stance + two-bone foot IK (grudge6 play contract).
 *
 * Order: mixer.update → placeRootBetweenFeet → applyFootIk
 * Root XZ = midpoint of L/R feet. Y from lower sole vs sampler.
 * Never `root.y = terrainY`. Never Euler on Bip001 after mixer.
 */
import * as THREE from 'https://esm.sh/three@0.185.0';

const FOOT_LIFT = 0.03;
const FOOT_MAX_UP = 0.42;
const FOOT_MAX_DOWN = 0.55;
const STANCE_MAX_SHIFT = 0.55;
const ANKLE_TO_SOLE = 0.04;

export function flatGround(_x, _z) {
  return 0;
}

const FOOT_L = ['Bip001 L Foot', 'Bip001_L_Foot', 'mixamorigLeftFoot', 'LeftFoot'];
const FOOT_R = ['Bip001 R Foot', 'Bip001_R_Foot', 'mixamorigRightFoot', 'RightFoot'];
const TOE_L = ['Bip001 L Toe0', 'Bip001_L_Toe0', 'mixamorigLeftToeBase'];
const TOE_R = ['Bip001 R Toe0', 'Bip001_R_Toe0', 'mixamorigRightToeBase'];
const THIGH_L = ['Bip001 L Thigh', 'Bip001_L_Thigh', 'mixamorigLeftUpLeg', 'LeftUpLeg'];
const THIGH_R = ['Bip001 R Thigh', 'Bip001_R_Thigh', 'mixamorigRightUpLeg', 'RightUpLeg'];
const CALF_L = ['Bip001 L Calf', 'Bip001_L_Calf', 'mixamorigLeftLeg', 'LeftLeg'];
const CALF_R = ['Bip001 R Calf', 'Bip001_R_Calf', 'mixamorigRightLeg', 'RightLeg'];

function findNamed(root, names) {
  for (const n of names) {
    const o = root.getObjectByName(n);
    if (o) return o;
  }
  return null;
}

const _lf = new THREE.Vector3();
const _rf = new THREE.Vector3();
const _delta = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _ab = new THREE.Vector3();
const _bc = new THREE.Vector3();
const _ac = new THREE.Vector3();
const _at = new THREE.Vector3();
const _nAb = new THREE.Vector3();
const _nBc = new THREE.Vector3();
const _nAc = new THREE.Vector3();
const _axis = new THREE.Vector3();
const _tgt = new THREE.Vector3();
const _qParent = new THREE.Quaternion();
const _qRot = new THREE.Quaternion();
const _qDelta = new THREE.Quaternion();

function rotateBoneWorld(bone, axis, angle) {
  if (!bone.parent || Math.abs(angle) < 1e-5) return;
  bone.parent.getWorldQuaternion(_qParent);
  _qRot.setFromAxisAngle(axis, angle);
  _qDelta.copy(_qParent).invert().multiply(_qRot).multiply(_qParent);
  bone.quaternion.premultiply(_qDelta);
  bone.updateWorldMatrix(false, true);
}

function solveTwoBone(upperLen, lowerLen, targetDist) {
  const reach = upperLen + lowerLen;
  const minDist = Math.abs(upperLen - lowerLen);
  if (targetDist >= reach) return { rootAngle: 0, jointAngle: Math.PI };
  const d = THREE.MathUtils.clamp(targetDist, minDist + 1e-6, reach - 1e-6);
  const rootCos = THREE.MathUtils.clamp(
    (upperLen * upperLen + d * d - lowerLen * lowerLen) / (2 * upperLen * d),
    -1,
    1,
  );
  const jointCos = THREE.MathUtils.clamp(
    (upperLen * upperLen + lowerLen * lowerLen - d * d) / (2 * upperLen * lowerLen),
    -1,
    1,
  );
  return { rootAngle: Math.acos(rootCos), jointAngle: Math.acos(jointCos) };
}

function solveLegToTarget(upper, lower, foot, target) {
  upper.getWorldPosition(_a);
  lower.getWorldPosition(_b);
  foot.getWorldPosition(_c);
  const lab = _a.distanceTo(_b);
  const lbc = _b.distanceTo(_c);
  if (lab < 1e-5 || lbc < 1e-5) return;

  _at.subVectors(target, _a);
  const lat = THREE.MathUtils.clamp(_at.length(), 1e-4, lab + lbc - 1e-4);
  _ab.subVectors(_b, _a);
  _bc.subVectors(_c, _b);
  _ac.subVectors(_c, _a);
  _nAb.copy(_ab).normalize();
  _nBc.copy(_bc).normalize();
  _nAc.copy(_ac).normalize();

  const acab0 = Math.acos(THREE.MathUtils.clamp(_nAc.dot(_nAb), -1, 1));
  const babc0 = Math.acos(THREE.MathUtils.clamp(-_nAb.dot(_nBc), -1, 1));
  const sol = solveTwoBone(lab, lbc, lat);

  _axis.copy(_ac).cross(_ab);
  if (_axis.lengthSq() < 1e-8) {
    _axis.set(0, 0, 1);
    _axis.crossVectors(_at, _axis);
    if (_axis.lengthSq() < 1e-8) return;
  }
  _axis.normalize();
  rotateBoneWorld(upper, _axis, sol.rootAngle - acab0);
  rotateBoneWorld(lower, _axis, -(sol.jointAngle - babc0));

  foot.getWorldPosition(_c);
  _ac.subVectors(_c, _a).normalize();
  _at.subVectors(target, _a).normalize();
  _axis.copy(_ac).cross(_at);
  if (_axis.lengthSq() > 1e-8) {
    _axis.normalize();
    const swing = Math.acos(THREE.MathUtils.clamp(_ac.dot(_at), -1, 1));
    rotateBoneWorld(upper, _axis, swing);
  }
}

function soleWorld(root, footNames, toeNames, out) {
  const toe = findNamed(root, toeNames);
  const foot = findNamed(root, footNames);
  const bone = toe || foot;
  if (!bone) return null;
  bone.getWorldPosition(out);
  if (!toe) out.y -= ANKLE_TO_SOLE;
  return bone;
}

/**
 * Shift kit root so L/R foot midpoint is on world origin XZ and the lower
 * sole meets the sampler. Does not write rotation.
 */
export function placeRootBetweenFeet(root, groundAt = flatGround) {
  if (!root) return false;
  root.updateMatrixWorld(true);
  if (!soleWorld(root, FOOT_L, TOE_L, _lf)) return false;
  if (!soleWorld(root, FOOT_R, TOE_R, _rf)) return false;
  const mx = (_lf.x + _rf.x) * 0.5;
  const mz = (_lf.z + _rf.z) * 0.5;
  const minY = Math.min(_lf.y, _rf.y);
  const gy = groundAt(mx, mz);
  _delta.set(-mx, gy - minY, -mz);
  const horiz = Math.hypot(_delta.x, _delta.z);
  if (horiz > STANCE_MAX_SHIFT) {
    const s = STANCE_MAX_SHIFT / horiz;
    _delta.x *= s;
    _delta.z *= s;
  }
  _delta.y = THREE.MathUtils.clamp(_delta.y, -FOOT_MAX_DOWN, FOOT_MAX_UP);
  root.position.add(_delta);
  root.updateMatrixWorld(true);
  return true;
}

/** Two-bone plant onto the height sampler. After mixer + placeRootBetweenFeet. */
export function applyFootIk(root, groundAt = flatGround) {
  if (!root) return false;
  const legs = [
    {
      upper: findNamed(root, THIGH_L),
      lower: findNamed(root, CALF_L),
      foot: findNamed(root, FOOT_L),
    },
    {
      upper: findNamed(root, THIGH_R),
      lower: findNamed(root, CALF_R),
      foot: findNamed(root, FOOT_R),
    },
  ];
  let any = false;
  root.updateMatrixWorld(true);
  for (const leg of legs) {
    if (!leg.upper || !leg.lower || !leg.foot) continue;
    leg.foot.getWorldPosition(_c);
    const gy = groundAt(_c.x, _c.z) + FOOT_LIFT;
    const dy = gy - _c.y;
    if (dy > FOOT_MAX_UP) continue;
    const apply = THREE.MathUtils.clamp(dy, -FOOT_MAX_DOWN, FOOT_MAX_UP);
    if (Math.abs(apply) < 0.008) continue;
    _tgt.set(_c.x, _c.y + apply, _c.z);
    solveLegToTarget(leg.upper, leg.lower, leg.foot, _tgt);
    any = true;
  }
  return any;
}

export function findStanceBones(root) {
  return {
    lFoot: findNamed(root, FOOT_L),
    rFoot: findNamed(root, FOOT_R),
    lThigh: findNamed(root, THIGH_L),
    rThigh: findNamed(root, THIGH_R),
    lCalf: findNamed(root, CALF_L),
    rCalf: findNamed(root, CALF_R),
  };
}
