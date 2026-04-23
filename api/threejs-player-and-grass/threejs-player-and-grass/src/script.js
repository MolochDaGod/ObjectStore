// Find the un-bundled project on codevre:
// https://codevre.com/editor?project=7kR8qQoxNCVu1AwDEoqetvzkVGC3_20251211163430823_vh7c

// Grudge wiring — must import before any top-level code so window.Grudge.race
// is in place by the time the Player constructor runs further down.
import './wire-race-model.js';

// http-url:https://esm.sh/three@0.182.0/es2022/build/three.core.mjs
var up = "182";
var fp = 0;
var mp = 1;
var yp = 2;
var bp = 1;
var wp = 2;
var Mp = 3;
var vr = 0;
var Ll = 1;
var _p = 2;
var rc = 0;
var ma = 1;
var vp = 2;
var Sp = 3;
var Ap = 4;
var Tp = 5;
var ya = 100;
var Ip = 101;
var Cp = 102;
var zp = 103;
var Fp = 104;
var Bp = 200;
var kp = 201;
var Pp = 202;
var Rp = 203;
var ga = 204;
var xa = 205;
var Op = 206;
var Ep = 207;
var Np = 208;
var Vp = 209;
var Dp = 210;
var Lp = 211;
var Up = 212;
var Wp = 213;
var qp = 214;
var Jp = 0;
var Gp = 1;
var Xp = 2;
var ba = 3;
var Hp = 4;
var Zp = 5;
var Yp = 6;
var $p = 7;
var ta = 0;
var jp = 1;
var Qp = 2;
var Kp = 0;
var tf = 1;
var ef = 2;
var sf = 3;
var nf = 4;
var rf = 5;
var of = 6;
var af = 7;
var wa = "attached";
var oc = "detached";
var ea = 300;
var Rn = 301;
var ac = 302;
var hc = 303;
var lc = 304;
var cc = 306;
var Sr = 1e3;
var $t = 1001;
var Ar = 1002;
var kt = 1003;
var uc = 1004;
var dc = 1005;
var Vt = 1006;
var pc = 1007;
var On = 1008;
var ia = 1009;
var fc = 1010;
var mc = 1011;
var yc = 1012;
var gc = 1013;
var En = 1014;
var Si = 1015;
var xc = 1016;
var bc = 1017;
var wc = 1018;
var df = 1020;
var Mc = 35902;
var _c = 35899;
var vc = 1021;
var Sc = 1022;
var ji = 1023;
var Tr = 1026;
var Ac = 1027;
var Ul = 1028;
var Wl = 1029;
var Tc = 1030;
var Ic = 1031;
var Cc = 1033;
var zc = 33776;
var Fc = 33777;
var Bc = 33778;
var kc = 33779;
var Pc = 35840;
var Rc = 35841;
var Oc = 35842;
var Ec = 35843;
var Nc = 36196;
var Vc = 37492;
var Dc = 37496;
var Lc = 37488;
var Uc = 37489;
var Wc = 37490;
var qc = 37491;
var Jc = 37808;
var Gc = 37809;
var Xc = 37810;
var Hc = 37811;
var Zc = 37812;
var Yc = 37813;
var $c = 37814;
var jc = 37815;
var Qc = 37816;
var Kc = 37817;
var tu = 37818;
var eu = 37819;
var iu = 37820;
var su = 37821;
var nu = 36492;
var ru = 36494;
var ou = 36495;
var au = 36283;
var hu = 36284;
var lu = 36285;
var cu = 36286;
var uu = 2200;
var du = 2201;
var pu = 2202;
var sn = 2300;
var Ir = 2301;
var Vn = 2302;
var wi = 2400;
var Mi = 2401;
var nn = 2402;
var sa = 2500;
var ql = 2501;
var ff = 0;
var mf = 1;
var yf = 2;
var fu = 3200;
var Pi = 0;
var wf = 1;
var Jl = "";
var Nt = "srgb";
var Ma = "srgb-linear";
var _a = "linear";
var Dn = "srgb";
var Ke = 7680;
var va = 519;
var Vf = 512;
var Df = 513;
var Lf = 514;
var Uf = 515;
var Wf = 516;
var qf = 517;
var Jf = 518;
var Gf = 519;
var rn = 35044;
var em = "300 es";
var jt = 2e3;
var Qi = 2001;
function mu(h36) {
  for (let t = h36.length - 1; t >= 0; --t)
    if (h36[t] >= 65535)
      return true;
  return false;
}
function Gl(h36) {
  return ArrayBuffer.isView(h36) && !(h36 instanceof DataView);
}
function on(h36) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", h36);
}
function rm() {
  let h36 = on("canvas");
  return h36.style.display = "block", h36;
}
var Sa = {};
var Ce = null;
function Aa(...h36) {
  let t = "THREE." + h36.shift();
  Ce ? Ce("log", t, ...h36) : console.log(t, ...h36);
}
function E(...h36) {
  let t = "THREE." + h36.shift();
  Ce ? Ce("warn", t, ...h36) : console.warn(t, ...h36);
}
function X(...h36) {
  let t = "THREE." + h36.shift();
  Ce ? Ce("error", t, ...h36) : console.error(t, ...h36);
}
function Ta(...h36) {
  let t = h36.join(" ");
  t in Sa || (Sa[t] = true, E(...h36));
}
function hm(h36, t, e) {
  return new Promise(function(i, s) {
    function n() {
      switch (h36.clientWaitSync(t, h36.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case h36.WAIT_FAILED:
          s();
          break;
        case h36.TIMEOUT_EXPIRED:
          setTimeout(n, e);
          break;
        default:
          i();
      }
    }
    setTimeout(n, e);
  });
}
var Kt = class {
  addEventListener(t, e) {
    this._listeners === void 0 && (this._listeners = {});
    let i = this._listeners;
    i[t] === void 0 && (i[t] = []), i[t].indexOf(e) === -1 && i[t].push(e);
  }
  hasEventListener(t, e) {
    let i = this._listeners;
    return i === void 0 ? false : i[t] !== void 0 && i[t].indexOf(e) !== -1;
  }
  removeEventListener(t, e) {
    let i = this._listeners;
    if (i === void 0)
      return;
    let s = i[t];
    if (s !== void 0) {
      let n = s.indexOf(e);
      n !== -1 && s.splice(n, 1);
    }
  }
  dispatchEvent(t) {
    let e = this._listeners;
    if (e === void 0)
      return;
    let i = e[t.type];
    if (i !== void 0) {
      t.target = this;
      let s = i.slice(0);
      for (let n = 0, r = s.length; n < r; n++)
        s[n].call(this, t);
      t.target = null;
    }
  }
};
var mt = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
var Ia = 1234567;
var He = Math.PI / 180;
var Ki = 180 / Math.PI;
function Bt() {
  let h36 = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, i = Math.random() * 4294967295 | 0;
  return (mt[h36 & 255] + mt[h36 >> 8 & 255] + mt[h36 >> 16 & 255] + mt[h36 >> 24 & 255] + "-" + mt[t & 255] + mt[t >> 8 & 255] + "-" + mt[t >> 16 & 15 | 64] + mt[t >> 24 & 255] + "-" + mt[e & 63 | 128] + mt[e >> 8 & 255] + "-" + mt[e >> 16 & 255] + mt[e >> 24 & 255] + mt[i & 255] + mt[i >> 8 & 255] + mt[i >> 16 & 255] + mt[i >> 24 & 255]).toLowerCase();
}
function N(h36, t, e) {
  return Math.max(t, Math.min(e, h36));
}
function na(h36, t) {
  return (h36 % t + t) % t;
}
function gu(h36, t, e, i, s) {
  return i + (h36 - t) * (s - i) / (e - t);
}
function xu(h36, t, e) {
  return h36 !== t ? (e - h36) / (t - h36) : 0;
}
function Zi(h36, t, e) {
  return (1 - e) * h36 + e * t;
}
function bu(h36, t, e, i) {
  return Zi(h36, t, 1 - Math.exp(-e * i));
}
function wu(h36, t = 1) {
  return t - Math.abs(na(h36, t * 2) - t);
}
function Mu(h36, t, e) {
  return h36 <= t ? 0 : h36 >= e ? 1 : (h36 = (h36 - t) / (e - t), h36 * h36 * (3 - 2 * h36));
}
function _u(h36, t, e) {
  return h36 <= t ? 0 : h36 >= e ? 1 : (h36 = (h36 - t) / (e - t), h36 * h36 * h36 * (h36 * (h36 * 6 - 15) + 10));
}
function vu(h36, t) {
  return h36 + Math.floor(Math.random() * (t - h36 + 1));
}
function Su(h36, t) {
  return h36 + Math.random() * (t - h36);
}
function Au(h36) {
  return h36 * (0.5 - Math.random());
}
function Tu(h36) {
  h36 !== void 0 && (Ia = h36);
  let t = Ia += 1831565813;
  return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function Iu(h36) {
  return h36 * He;
}
function Cu(h36) {
  return h36 * Ki;
}
function zu(h36) {
  return (h36 & h36 - 1) === 0 && h36 !== 0;
}
function Fu(h36) {
  return Math.pow(2, Math.ceil(Math.log(h36) / Math.LN2));
}
function Bu(h36) {
  return Math.pow(2, Math.floor(Math.log(h36) / Math.LN2));
}
function ku(h36, t, e, i, s) {
  let n = Math.cos, r = Math.sin, o = n(e / 2), a = r(e / 2), l = n((t + i) / 2), c = r((t + i) / 2), u = n((t - i) / 2), d = r((t - i) / 2), p = n((i - t) / 2), f = r((i - t) / 2);
  switch (s) {
    case "XYX":
      h36.set(o * c, a * u, a * d, o * l);
      break;
    case "YZY":
      h36.set(a * d, o * c, a * u, o * l);
      break;
    case "ZXZ":
      h36.set(a * u, a * d, o * c, o * l);
      break;
    case "XZX":
      h36.set(o * c, a * f, a * p, o * l);
      break;
    case "YXY":
      h36.set(a * p, o * c, a * f, o * l);
      break;
    case "ZYZ":
      h36.set(a * f, a * p, o * c, o * l);
      break;
    default:
      E("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + s);
  }
}
function wt(h36, t) {
  switch (t.constructor) {
    case Float32Array:
      return h36;
    case Uint32Array:
      return h36 / 4294967295;
    case Uint16Array:
      return h36 / 65535;
    case Uint8Array:
      return h36 / 255;
    case Int32Array:
      return Math.max(h36 / 2147483647, -1);
    case Int16Array:
      return Math.max(h36 / 32767, -1);
    case Int8Array:
      return Math.max(h36 / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function L(h36, t) {
  switch (t.constructor) {
    case Float32Array:
      return h36;
    case Uint32Array:
      return Math.round(h36 * 4294967295);
    case Uint16Array:
      return Math.round(h36 * 65535);
    case Uint8Array:
      return Math.round(h36 * 255);
    case Int32Array:
      return Math.round(h36 * 2147483647);
    case Int16Array:
      return Math.round(h36 * 32767);
    case Int8Array:
      return Math.round(h36 * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
var lm = { DEG2RAD: He, RAD2DEG: Ki, generateUUID: Bt, clamp: N, euclideanModulo: na, mapLinear: gu, inverseLerp: xu, lerp: Zi, damp: bu, pingpong: wu, smoothstep: Mu, smootherstep: _u, randInt: vu, randFloat: Su, randFloatSpread: Au, seededRandom: Tu, degToRad: Iu, radToDeg: Cu, isPowerOfTwo: zu, ceilPowerOfTwo: Fu, floorPowerOfTwo: Bu, setQuaternionFromProperEuler: ku, normalize: L, denormalize: wt };
var I = class h {
  constructor(t = 0, e = 0) {
    h.prototype.isVector2 = true, this.x = t, this.y = e;
  }
  get width() {
    return this.x;
  }
  set width(t) {
    this.x = t;
  }
  get height() {
    return this.y;
  }
  set height(t) {
    this.y = t;
  }
  set(t, e) {
    return this.x = t, this.y = e, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this;
  }
  addVectors(t, e) {
    return this.x = t.x + e.x, this.y = t.y + e.y, this;
  }
  addScaledVector(t, e) {
    return this.x += t.x * e, this.y += t.y * e, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this;
  }
  subVectors(t, e) {
    return this.x = t.x - e.x, this.y = t.y - e.y, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this;
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  applyMatrix3(t) {
    let e = this.x, i = this.y, s = t.elements;
    return this.x = s[0] * e + s[3] * i + s[6], this.y = s[1] * e + s[4] * i + s[7], this;
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this;
  }
  clamp(t, e) {
    return this.x = N(this.x, t.x, e.x), this.y = N(this.y, t.y, e.y), this;
  }
  clampScalar(t, e) {
    return this.x = N(this.x, t, e), this.y = N(this.y, t, e), this;
  }
  clampLength(t, e) {
    let i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(N(i, t, e));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  cross(t) {
    return this.x * t.y - this.y * t.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(t) {
    let e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0)
      return Math.PI / 2;
    let i = this.dot(t) / e;
    return Math.acos(N(i, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    let e = this.x - t.x, i = this.y - t.y;
    return e * e + i * i;
  }
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this;
  }
  lerpVectors(t, e, i) {
    return this.x = t.x + (e.x - t.x) * i, this.y = t.y + (e.y - t.y) * i, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y;
  }
  fromArray(t, e = 0) {
    return this.x = t[e], this.y = t[e + 1], this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this.x, t[e + 1] = this.y, t;
  }
  fromBufferAttribute(t, e) {
    return this.x = t.getX(e), this.y = t.getY(e), this;
  }
  rotateAround(t, e) {
    let i = Math.cos(e), s = Math.sin(e), n = this.x - t.x, r = this.y - t.y;
    return this.x = n * i - r * s + t.x, this.y = n * s + r * i + t.y, this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
};
var Mt = class {
  constructor(t = 0, e = 0, i = 0, s = 1) {
    this.isQuaternion = true, this._x = t, this._y = e, this._z = i, this._w = s;
  }
  static slerpFlat(t, e, i, s, n, r, o) {
    let a = i[s + 0], l = i[s + 1], c = i[s + 2], u = i[s + 3], d = n[r + 0], p = n[r + 1], f = n[r + 2], m = n[r + 3];
    if (o <= 0) {
      t[e + 0] = a, t[e + 1] = l, t[e + 2] = c, t[e + 3] = u;
      return;
    }
    if (o >= 1) {
      t[e + 0] = d, t[e + 1] = p, t[e + 2] = f, t[e + 3] = m;
      return;
    }
    if (u !== m || a !== d || l !== p || c !== f) {
      let g2 = a * d + l * p + c * f + u * m;
      g2 < 0 && (d = -d, p = -p, f = -f, m = -m, g2 = -g2);
      let y3 = 1 - o;
      if (g2 < 0.9995) {
        let x = Math.acos(g2), b = Math.sin(x);
        y3 = Math.sin(y3 * x) / b, o = Math.sin(o * x) / b, a = a * y3 + d * o, l = l * y3 + p * o, c = c * y3 + f * o, u = u * y3 + m * o;
      } else {
        a = a * y3 + d * o, l = l * y3 + p * o, c = c * y3 + f * o, u = u * y3 + m * o;
        let x = 1 / Math.sqrt(a * a + l * l + c * c + u * u);
        a *= x, l *= x, c *= x, u *= x;
      }
    }
    t[e] = a, t[e + 1] = l, t[e + 2] = c, t[e + 3] = u;
  }
  static multiplyQuaternionsFlat(t, e, i, s, n, r) {
    let o = i[s], a = i[s + 1], l = i[s + 2], c = i[s + 3], u = n[r], d = n[r + 1], p = n[r + 2], f = n[r + 3];
    return t[e] = o * f + c * u + a * p - l * d, t[e + 1] = a * f + c * d + l * u - o * p, t[e + 2] = l * f + c * p + o * d - a * u, t[e + 3] = c * f - o * u - a * d - l * p, t;
  }
  get x() {
    return this._x;
  }
  set x(t) {
    this._x = t, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(t) {
    this._y = t, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(t) {
    this._z = t, this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(t) {
    this._w = t, this._onChangeCallback();
  }
  set(t, e, i, s) {
    return this._x = t, this._y = e, this._z = i, this._w = s, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(t) {
    return this._x = t.x, this._y = t.y, this._z = t.z, this._w = t.w, this._onChangeCallback(), this;
  }
  setFromEuler(t, e = true) {
    let i = t._x, s = t._y, n = t._z, r = t._order, o = Math.cos, a = Math.sin, l = o(i / 2), c = o(s / 2), u = o(n / 2), d = a(i / 2), p = a(s / 2), f = a(n / 2);
    switch (r) {
      case "XYZ":
        this._x = d * c * u + l * p * f, this._y = l * p * u - d * c * f, this._z = l * c * f + d * p * u, this._w = l * c * u - d * p * f;
        break;
      case "YXZ":
        this._x = d * c * u + l * p * f, this._y = l * p * u - d * c * f, this._z = l * c * f - d * p * u, this._w = l * c * u + d * p * f;
        break;
      case "ZXY":
        this._x = d * c * u - l * p * f, this._y = l * p * u + d * c * f, this._z = l * c * f + d * p * u, this._w = l * c * u - d * p * f;
        break;
      case "ZYX":
        this._x = d * c * u - l * p * f, this._y = l * p * u + d * c * f, this._z = l * c * f - d * p * u, this._w = l * c * u + d * p * f;
        break;
      case "YZX":
        this._x = d * c * u + l * p * f, this._y = l * p * u + d * c * f, this._z = l * c * f - d * p * u, this._w = l * c * u - d * p * f;
        break;
      case "XZY":
        this._x = d * c * u - l * p * f, this._y = l * p * u - d * c * f, this._z = l * c * f + d * p * u, this._w = l * c * u + d * p * f;
        break;
      default:
        E("Quaternion: .setFromEuler() encountered an unknown order: " + r);
    }
    return e === true && this._onChangeCallback(), this;
  }
  setFromAxisAngle(t, e) {
    let i = e / 2, s = Math.sin(i);
    return this._x = t.x * s, this._y = t.y * s, this._z = t.z * s, this._w = Math.cos(i), this._onChangeCallback(), this;
  }
  setFromRotationMatrix(t) {
    let e = t.elements, i = e[0], s = e[4], n = e[8], r = e[1], o = e[5], a = e[9], l = e[2], c = e[6], u = e[10], d = i + o + u;
    if (d > 0) {
      let p = 0.5 / Math.sqrt(d + 1);
      this._w = 0.25 / p, this._x = (c - a) * p, this._y = (n - l) * p, this._z = (r - s) * p;
    } else if (i > o && i > u) {
      let p = 2 * Math.sqrt(1 + i - o - u);
      this._w = (c - a) / p, this._x = 0.25 * p, this._y = (s + r) / p, this._z = (n + l) / p;
    } else if (o > u) {
      let p = 2 * Math.sqrt(1 + o - i - u);
      this._w = (n - l) / p, this._x = (s + r) / p, this._y = 0.25 * p, this._z = (a + c) / p;
    } else {
      let p = 2 * Math.sqrt(1 + u - i - o);
      this._w = (r - s) / p, this._x = (n + l) / p, this._y = (a + c) / p, this._z = 0.25 * p;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(t, e) {
    let i = t.dot(e) + 1;
    return i < 1e-8 ? (i = 0, Math.abs(t.x) > Math.abs(t.z) ? (this._x = -t.y, this._y = t.x, this._z = 0, this._w = i) : (this._x = 0, this._y = -t.z, this._z = t.y, this._w = i)) : (this._x = t.y * e.z - t.z * e.y, this._y = t.z * e.x - t.x * e.z, this._z = t.x * e.y - t.y * e.x, this._w = i), this.normalize();
  }
  angleTo(t) {
    return 2 * Math.acos(Math.abs(N(this.dot(t), -1, 1)));
  }
  rotateTowards(t, e) {
    let i = this.angleTo(t);
    if (i === 0)
      return this;
    let s = Math.min(1, e / i);
    return this.slerp(t, s), this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
  }
  dot(t) {
    return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let t = this.length();
    return t === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (t = 1 / t, this._x = this._x * t, this._y = this._y * t, this._z = this._z * t, this._w = this._w * t), this._onChangeCallback(), this;
  }
  multiply(t) {
    return this.multiplyQuaternions(this, t);
  }
  premultiply(t) {
    return this.multiplyQuaternions(t, this);
  }
  multiplyQuaternions(t, e) {
    let i = t._x, s = t._y, n = t._z, r = t._w, o = e._x, a = e._y, l = e._z, c = e._w;
    return this._x = i * c + r * o + s * l - n * a, this._y = s * c + r * a + n * o - i * l, this._z = n * c + r * l + i * a - s * o, this._w = r * c - i * o - s * a - n * l, this._onChangeCallback(), this;
  }
  slerp(t, e) {
    if (e <= 0)
      return this;
    if (e >= 1)
      return this.copy(t);
    let i = t._x, s = t._y, n = t._z, r = t._w, o = this.dot(t);
    o < 0 && (i = -i, s = -s, n = -n, r = -r, o = -o);
    let a = 1 - e;
    if (o < 0.9995) {
      let l = Math.acos(o), c = Math.sin(l);
      a = Math.sin(a * l) / c, e = Math.sin(e * l) / c, this._x = this._x * a + i * e, this._y = this._y * a + s * e, this._z = this._z * a + n * e, this._w = this._w * a + r * e, this._onChangeCallback();
    } else
      this._x = this._x * a + i * e, this._y = this._y * a + s * e, this._z = this._z * a + n * e, this._w = this._w * a + r * e, this.normalize();
    return this;
  }
  slerpQuaternions(t, e, i) {
    return this.copy(t).slerp(e, i);
  }
  random() {
    let t = 2 * Math.PI * Math.random(), e = 2 * Math.PI * Math.random(), i = Math.random(), s = Math.sqrt(1 - i), n = Math.sqrt(i);
    return this.set(s * Math.sin(t), s * Math.cos(t), n * Math.sin(e), n * Math.cos(e));
  }
  equals(t) {
    return t._x === this._x && t._y === this._y && t._z === this._z && t._w === this._w;
  }
  fromArray(t, e = 0) {
    return this._x = t[e], this._y = t[e + 1], this._z = t[e + 2], this._w = t[e + 3], this._onChangeCallback(), this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._w, t;
  }
  fromBufferAttribute(t, e) {
    return this._x = t.getX(e), this._y = t.getY(e), this._z = t.getZ(e), this._w = t.getW(e), this._onChangeCallback(), this;
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(t) {
    return this._onChangeCallback = t, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
};
var w = class h2 {
  constructor(t = 0, e = 0, i = 0) {
    h2.prototype.isVector3 = true, this.x = t, this.y = e, this.z = i;
  }
  set(t, e, i) {
    return i === void 0 && (i = this.z), this.x = t, this.y = e, this.z = i, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setZ(t) {
    return this.z = t, this;
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this;
  }
  addVectors(t, e) {
    return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this;
  }
  addScaledVector(t, e) {
    return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this;
  }
  subVectors(t, e) {
    return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this;
  }
  multiplyVectors(t, e) {
    return this.x = t.x * e.x, this.y = t.y * e.y, this.z = t.z * e.z, this;
  }
  applyEuler(t) {
    return this.applyQuaternion(Ca.setFromEuler(t));
  }
  applyAxisAngle(t, e) {
    return this.applyQuaternion(Ca.setFromAxisAngle(t, e));
  }
  applyMatrix3(t) {
    let e = this.x, i = this.y, s = this.z, n = t.elements;
    return this.x = n[0] * e + n[3] * i + n[6] * s, this.y = n[1] * e + n[4] * i + n[7] * s, this.z = n[2] * e + n[5] * i + n[8] * s, this;
  }
  applyNormalMatrix(t) {
    return this.applyMatrix3(t).normalize();
  }
  applyMatrix4(t) {
    let e = this.x, i = this.y, s = this.z, n = t.elements, r = 1 / (n[3] * e + n[7] * i + n[11] * s + n[15]);
    return this.x = (n[0] * e + n[4] * i + n[8] * s + n[12]) * r, this.y = (n[1] * e + n[5] * i + n[9] * s + n[13]) * r, this.z = (n[2] * e + n[6] * i + n[10] * s + n[14]) * r, this;
  }
  applyQuaternion(t) {
    let e = this.x, i = this.y, s = this.z, n = t.x, r = t.y, o = t.z, a = t.w, l = 2 * (r * s - o * i), c = 2 * (o * e - n * s), u = 2 * (n * i - r * e);
    return this.x = e + a * l + r * u - o * c, this.y = i + a * c + o * l - n * u, this.z = s + a * u + n * c - r * l, this;
  }
  project(t) {
    return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix);
  }
  unproject(t) {
    return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld);
  }
  transformDirection(t) {
    let e = this.x, i = this.y, s = this.z, n = t.elements;
    return this.x = n[0] * e + n[4] * i + n[8] * s, this.y = n[1] * e + n[5] * i + n[9] * s, this.z = n[2] * e + n[6] * i + n[10] * s, this.normalize();
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this.z /= t.z, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this;
  }
  clamp(t, e) {
    return this.x = N(this.x, t.x, e.x), this.y = N(this.y, t.y, e.y), this.z = N(this.z, t.z, e.z), this;
  }
  clampScalar(t, e) {
    return this.x = N(this.x, t, e), this.y = N(this.y, t, e), this.z = N(this.z, t, e), this;
  }
  clampLength(t, e) {
    let i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(N(i, t, e));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this;
  }
  lerpVectors(t, e, i) {
    return this.x = t.x + (e.x - t.x) * i, this.y = t.y + (e.y - t.y) * i, this.z = t.z + (e.z - t.z) * i, this;
  }
  cross(t) {
    return this.crossVectors(this, t);
  }
  crossVectors(t, e) {
    let i = t.x, s = t.y, n = t.z, r = e.x, o = e.y, a = e.z;
    return this.x = s * a - n * o, this.y = n * r - i * a, this.z = i * o - s * r, this;
  }
  projectOnVector(t) {
    let e = t.lengthSq();
    if (e === 0)
      return this.set(0, 0, 0);
    let i = t.dot(this) / e;
    return this.copy(t).multiplyScalar(i);
  }
  projectOnPlane(t) {
    return Ln.copy(this).projectOnVector(t), this.sub(Ln);
  }
  reflect(t) {
    return this.sub(Ln.copy(t).multiplyScalar(2 * this.dot(t)));
  }
  angleTo(t) {
    let e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0)
      return Math.PI / 2;
    let i = this.dot(t) / e;
    return Math.acos(N(i, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    let e = this.x - t.x, i = this.y - t.y, s = this.z - t.z;
    return e * e + i * i + s * s;
  }
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z);
  }
  setFromSpherical(t) {
    return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
  }
  setFromSphericalCoords(t, e, i) {
    let s = Math.sin(e) * t;
    return this.x = s * Math.sin(i), this.y = Math.cos(e) * t, this.z = s * Math.cos(i), this;
  }
  setFromCylindrical(t) {
    return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
  }
  setFromCylindricalCoords(t, e, i) {
    return this.x = t * Math.sin(e), this.y = i, this.z = t * Math.cos(e), this;
  }
  setFromMatrixPosition(t) {
    let e = t.elements;
    return this.x = e[12], this.y = e[13], this.z = e[14], this;
  }
  setFromMatrixScale(t) {
    let e = this.setFromMatrixColumn(t, 0).length(), i = this.setFromMatrixColumn(t, 1).length(), s = this.setFromMatrixColumn(t, 2).length();
    return this.x = e, this.y = i, this.z = s, this;
  }
  setFromMatrixColumn(t, e) {
    return this.fromArray(t.elements, e * 4);
  }
  setFromMatrix3Column(t, e) {
    return this.fromArray(t.elements, e * 3);
  }
  setFromEuler(t) {
    return this.x = t._x, this.y = t._y, this.z = t._z, this;
  }
  setFromColor(t) {
    return this.x = t.r, this.y = t.g, this.z = t.b, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z;
  }
  fromArray(t, e = 0) {
    return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t;
  }
  fromBufferAttribute(t, e) {
    return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
  }
  randomDirection() {
    let t = Math.random() * Math.PI * 2, e = Math.random() * 2 - 1, i = Math.sqrt(1 - e * e);
    return this.x = i * Math.cos(t), this.y = e, this.z = i * Math.sin(t), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
};
var Ln = new w();
var Ca = new Mt();
var te = class h3 {
  constructor(t, e, i, s, n, r, o, a, l) {
    h3.prototype.isMatrix3 = true, this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1], t !== void 0 && this.set(t, e, i, s, n, r, o, a, l);
  }
  set(t, e, i, s, n, r, o, a, l) {
    let c = this.elements;
    return c[0] = t, c[1] = s, c[2] = o, c[3] = e, c[4] = n, c[5] = a, c[6] = i, c[7] = r, c[8] = l, this;
  }
  identity() {
    return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
  }
  copy(t) {
    let e = this.elements, i = t.elements;
    return e[0] = i[0], e[1] = i[1], e[2] = i[2], e[3] = i[3], e[4] = i[4], e[5] = i[5], e[6] = i[6], e[7] = i[7], e[8] = i[8], this;
  }
  extractBasis(t, e, i) {
    return t.setFromMatrix3Column(this, 0), e.setFromMatrix3Column(this, 1), i.setFromMatrix3Column(this, 2), this;
  }
  setFromMatrix4(t) {
    let e = t.elements;
    return this.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]), this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    let i = t.elements, s = e.elements, n = this.elements, r = i[0], o = i[3], a = i[6], l = i[1], c = i[4], u = i[7], d = i[2], p = i[5], f = i[8], m = s[0], g2 = s[3], y3 = s[6], x = s[1], b = s[4], M = s[7], _2 = s[2], v = s[5], A = s[8];
    return n[0] = r * m + o * x + a * _2, n[3] = r * g2 + o * b + a * v, n[6] = r * y3 + o * M + a * A, n[1] = l * m + c * x + u * _2, n[4] = l * g2 + c * b + u * v, n[7] = l * y3 + c * M + u * A, n[2] = d * m + p * x + f * _2, n[5] = d * g2 + p * b + f * v, n[8] = d * y3 + p * M + f * A, this;
  }
  multiplyScalar(t) {
    let e = this.elements;
    return e[0] *= t, e[3] *= t, e[6] *= t, e[1] *= t, e[4] *= t, e[7] *= t, e[2] *= t, e[5] *= t, e[8] *= t, this;
  }
  determinant() {
    let t = this.elements, e = t[0], i = t[1], s = t[2], n = t[3], r = t[4], o = t[5], a = t[6], l = t[7], c = t[8];
    return e * r * c - e * o * l - i * n * c + i * o * a + s * n * l - s * r * a;
  }
  invert() {
    let t = this.elements, e = t[0], i = t[1], s = t[2], n = t[3], r = t[4], o = t[5], a = t[6], l = t[7], c = t[8], u = c * r - o * l, d = o * a - c * n, p = l * n - r * a, f = e * u + i * d + s * p;
    if (f === 0)
      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    let m = 1 / f;
    return t[0] = u * m, t[1] = (s * l - c * i) * m, t[2] = (o * i - s * r) * m, t[3] = d * m, t[4] = (c * e - s * a) * m, t[5] = (s * n - o * e) * m, t[6] = p * m, t[7] = (i * a - l * e) * m, t[8] = (r * e - i * n) * m, this;
  }
  transpose() {
    let t, e = this.elements;
    return t = e[1], e[1] = e[3], e[3] = t, t = e[2], e[2] = e[6], e[6] = t, t = e[5], e[5] = e[7], e[7] = t, this;
  }
  getNormalMatrix(t) {
    return this.setFromMatrix4(t).invert().transpose();
  }
  transposeIntoArray(t) {
    let e = this.elements;
    return t[0] = e[0], t[1] = e[3], t[2] = e[6], t[3] = e[1], t[4] = e[4], t[5] = e[7], t[6] = e[2], t[7] = e[5], t[8] = e[8], this;
  }
  setUvTransform(t, e, i, s, n, r, o) {
    let a = Math.cos(n), l = Math.sin(n);
    return this.set(i * a, i * l, -i * (a * r + l * o) + r + t, -s * l, s * a, -s * (-l * r + a * o) + o + e, 0, 0, 1), this;
  }
  scale(t, e) {
    return this.premultiply(Un.makeScale(t, e)), this;
  }
  rotate(t) {
    return this.premultiply(Un.makeRotation(-t)), this;
  }
  translate(t, e) {
    return this.premultiply(Un.makeTranslation(t, e)), this;
  }
  makeTranslation(t, e) {
    return t.isVector2 ? this.set(1, 0, t.x, 0, 1, t.y, 0, 0, 1) : this.set(1, 0, t, 0, 1, e, 0, 0, 1), this;
  }
  makeRotation(t) {
    let e = Math.cos(t), i = Math.sin(t);
    return this.set(e, -i, 0, i, e, 0, 0, 0, 1), this;
  }
  makeScale(t, e) {
    return this.set(t, 0, 0, 0, e, 0, 0, 0, 1), this;
  }
  equals(t) {
    let e = this.elements, i = t.elements;
    for (let s = 0; s < 9; s++)
      if (e[s] !== i[s])
        return false;
    return true;
  }
  fromArray(t, e = 0) {
    for (let i = 0; i < 9; i++)
      this.elements[i] = t[i + e];
    return this;
  }
  toArray(t = [], e = 0) {
    let i = this.elements;
    return t[e] = i[0], t[e + 1] = i[1], t[e + 2] = i[2], t[e + 3] = i[3], t[e + 4] = i[4], t[e + 5] = i[5], t[e + 6] = i[6], t[e + 7] = i[7], t[e + 8] = i[8], t;
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
};
var Un = new te();
var za = new te().set(0.4123908, 0.3575843, 0.1804808, 0.212639, 0.7151687, 0.0721923, 0.0193308, 0.1191948, 0.9505322);
var Fa = new te().set(3.2409699, -1.5373832, -0.4986108, -0.9692436, 1.8759675, 0.0415551, 0.0556301, -0.203977, 1.0569715);
function Pu() {
  let h36 = { enabled: true, workingColorSpace: Ma, spaces: {}, convert: function(s, n, r) {
    return this.enabled === false || n === r || !n || !r || (this.spaces[n].transfer === Dn && (s.r = ye(s.r), s.g = ye(s.g), s.b = ye(s.b)), this.spaces[n].primaries !== this.spaces[r].primaries && (s.applyMatrix3(this.spaces[n].toXYZ), s.applyMatrix3(this.spaces[r].fromXYZ)), this.spaces[r].transfer === Dn && (s.r = vi(s.r), s.g = vi(s.g), s.b = vi(s.b))), s;
  }, workingToColorSpace: function(s, n) {
    return this.convert(s, this.workingColorSpace, n);
  }, colorSpaceToWorking: function(s, n) {
    return this.convert(s, n, this.workingColorSpace);
  }, getPrimaries: function(s) {
    return this.spaces[s].primaries;
  }, getTransfer: function(s) {
    return s === Jl ? _a : this.spaces[s].transfer;
  }, getToneMappingMode: function(s) {
    return this.spaces[s].outputColorSpaceConfig.toneMappingMode || "standard";
  }, getLuminanceCoefficients: function(s, n = this.workingColorSpace) {
    return s.fromArray(this.spaces[n].luminanceCoefficients);
  }, define: function(s) {
    Object.assign(this.spaces, s);
  }, _getMatrix: function(s, n, r) {
    return s.copy(this.spaces[n].toXYZ).multiply(this.spaces[r].fromXYZ);
  }, _getDrawingBufferColorSpace: function(s) {
    return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace;
  }, _getUnpackColorSpace: function(s = this.workingColorSpace) {
    return this.spaces[s].workingColorSpaceConfig.unpackColorSpace;
  }, fromWorkingColorSpace: function(s, n) {
    return Ta("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."), h36.workingToColorSpace(s, n);
  }, toWorkingColorSpace: function(s, n) {
    return Ta("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."), h36.colorSpaceToWorking(s, n);
  } }, t = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06], e = [0.2126, 0.7152, 0.0722], i = [0.3127, 0.329];
  return h36.define({ [Ma]: { primaries: t, whitePoint: i, transfer: _a, toXYZ: za, fromXYZ: Fa, luminanceCoefficients: e, workingColorSpaceConfig: { unpackColorSpace: Nt }, outputColorSpaceConfig: { drawingBufferColorSpace: Nt } }, [Nt]: { primaries: t, whitePoint: i, transfer: Dn, toXYZ: za, fromXYZ: Fa, luminanceCoefficients: e, outputColorSpaceConfig: { drawingBufferColorSpace: Nt } } }), h36;
}
var Ft = Pu();
function ye(h36) {
  return h36 < 0.04045 ? h36 * 0.0773993808 : Math.pow(h36 * 0.9478672986 + 0.0521327014, 2.4);
}
function vi(h36) {
  return h36 < 31308e-7 ? h36 * 12.92 : 1.055 * Math.pow(h36, 0.41666) - 0.055;
}
var ti;
var Cr = class {
  static getDataURL(t, e = "image/png") {
    if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u")
      return t.src;
    let i;
    if (t instanceof HTMLCanvasElement)
      i = t;
    else {
      ti === void 0 && (ti = on("canvas")), ti.width = t.width, ti.height = t.height;
      let s = ti.getContext("2d");
      t instanceof ImageData ? s.putImageData(t, 0, 0) : s.drawImage(t, 0, 0, t.width, t.height), i = ti;
    }
    return i.toDataURL(e);
  }
  static sRGBToLinear(t) {
    if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
      let e = on("canvas");
      e.width = t.width, e.height = t.height;
      let i = e.getContext("2d");
      i.drawImage(t, 0, 0, t.width, t.height);
      let s = i.getImageData(0, 0, t.width, t.height), n = s.data;
      for (let r = 0; r < n.length; r++)
        n[r] = ye(n[r] / 255) * 255;
      return i.putImageData(s, 0, 0), e;
    } else if (t.data) {
      let e = t.data.slice(0);
      for (let i = 0; i < e.length; i++)
        e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[i] = Math.floor(ye(e[i] / 255) * 255) : e[i] = ye(e[i]);
      return { data: e, width: t.width, height: t.height };
    } else
      return E("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
  }
};
var Ru = 0;
var fe = class {
  constructor(t = null) {
    this.isSource = true, Object.defineProperty(this, "id", { value: Ru++ }), this.uuid = Bt(), this.data = t, this.dataReady = true, this.version = 0;
  }
  getSize(t) {
    let e = this.data;
    return typeof HTMLVideoElement < "u" && e instanceof HTMLVideoElement ? t.set(e.videoWidth, e.videoHeight, 0) : typeof VideoFrame < "u" && e instanceof VideoFrame ? t.set(e.displayHeight, e.displayWidth, 0) : e !== null ? t.set(e.width, e.height, e.depth || 0) : t.set(0, 0, 0), t;
  }
  set needsUpdate(t) {
    t === true && this.version++;
  }
  toJSON(t) {
    let e = t === void 0 || typeof t == "string";
    if (!e && t.images[this.uuid] !== void 0)
      return t.images[this.uuid];
    let i = { uuid: this.uuid, url: "" }, s = this.data;
    if (s !== null) {
      let n;
      if (Array.isArray(s)) {
        n = [];
        for (let r = 0, o = s.length; r < o; r++)
          s[r].isDataTexture ? n.push(Wn(s[r].image)) : n.push(Wn(s[r]));
      } else
        n = Wn(s);
      i.url = n;
    }
    return e || (t.images[this.uuid] = i), i;
  }
};
function Wn(h36) {
  return typeof HTMLImageElement < "u" && h36 instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && h36 instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && h36 instanceof ImageBitmap ? Cr.getDataURL(h36) : h36.data ? { data: Array.from(h36.data), width: h36.width, height: h36.height, type: h36.data.constructor.name } : (E("Texture: Unable to serialize Texture."), {});
}
var Ou = 0;
var qn = new w();
var ut = class h4 extends Kt {
  constructor(t = h4.DEFAULT_IMAGE, e = h4.DEFAULT_MAPPING, i = $t, s = $t, n = Vt, r = On, o = ji, a = ia, l = h4.DEFAULT_ANISOTROPY, c = Jl) {
    super(), this.isTexture = true, Object.defineProperty(this, "id", { value: Ou++ }), this.uuid = Bt(), this.name = "", this.source = new fe(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = i, this.wrapT = s, this.magFilter = n, this.minFilter = r, this.anisotropy = l, this.format = o, this.internalFormat = null, this.type = a, this.offset = new I(0, 0), this.repeat = new I(1, 1), this.center = new I(0, 0), this.rotation = 0, this.matrixAutoUpdate = true, this.matrix = new te(), this.generateMipmaps = true, this.premultiplyAlpha = false, this.flipY = true, this.unpackAlignment = 4, this.colorSpace = c, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = false, this.isArrayTexture = !!(t && t.depth && t.depth > 1), this.pmremVersion = 0;
  }
  get width() {
    return this.source.getSize(qn).x;
  }
  get height() {
    return this.source.getSize(qn).y;
  }
  get depth() {
    return this.source.getSize(qn).z;
  }
  get image() {
    return this.source.data;
  }
  set image(t = null) {
    this.source.data = t;
  }
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.name = t.name, this.source = t.source, this.mipmaps = t.mipmaps.slice(0), this.mapping = t.mapping, this.channel = t.channel, this.wrapS = t.wrapS, this.wrapT = t.wrapT, this.magFilter = t.magFilter, this.minFilter = t.minFilter, this.anisotropy = t.anisotropy, this.format = t.format, this.internalFormat = t.internalFormat, this.type = t.type, this.offset.copy(t.offset), this.repeat.copy(t.repeat), this.center.copy(t.center), this.rotation = t.rotation, this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrix.copy(t.matrix), this.generateMipmaps = t.generateMipmaps, this.premultiplyAlpha = t.premultiplyAlpha, this.flipY = t.flipY, this.unpackAlignment = t.unpackAlignment, this.colorSpace = t.colorSpace, this.renderTarget = t.renderTarget, this.isRenderTargetTexture = t.isRenderTargetTexture, this.isArrayTexture = t.isArrayTexture, this.userData = JSON.parse(JSON.stringify(t.userData)), this.needsUpdate = true, this;
  }
  setValues(t) {
    for (let e in t) {
      let i = t[e];
      if (i === void 0) {
        E(`Texture.setValues(): parameter '${e}' has value of undefined.`);
        continue;
      }
      let s = this[e];
      if (s === void 0) {
        E(`Texture.setValues(): property '${e}' does not exist.`);
        continue;
      }
      s && i && s.isVector2 && i.isVector2 || s && i && s.isVector3 && i.isVector3 || s && i && s.isMatrix3 && i.isMatrix3 ? s.copy(i) : this[e] = i;
    }
  }
  toJSON(t) {
    let e = t === void 0 || typeof t == "string";
    if (!e && t.textures[this.uuid] !== void 0)
      return t.textures[this.uuid];
    let i = { metadata: { version: 4.7, type: "Texture", generator: "Texture.toJSON" }, uuid: this.uuid, name: this.name, image: this.source.toJSON(t).uuid, mapping: this.mapping, channel: this.channel, repeat: [this.repeat.x, this.repeat.y], offset: [this.offset.x, this.offset.y], center: [this.center.x, this.center.y], rotation: this.rotation, wrap: [this.wrapS, this.wrapT], format: this.format, internalFormat: this.internalFormat, type: this.type, colorSpace: this.colorSpace, minFilter: this.minFilter, magFilter: this.magFilter, anisotropy: this.anisotropy, flipY: this.flipY, generateMipmaps: this.generateMipmaps, premultiplyAlpha: this.premultiplyAlpha, unpackAlignment: this.unpackAlignment };
    return Object.keys(this.userData).length > 0 && (i.userData = this.userData), e || (t.textures[this.uuid] = i), i;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(t) {
    if (this.mapping !== ea)
      return t;
    if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1)
      switch (this.wrapS) {
        case Sr:
          t.x = t.x - Math.floor(t.x);
          break;
        case $t:
          t.x = t.x < 0 ? 0 : 1;
          break;
        case Ar:
          Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
          break;
      }
    if (t.y < 0 || t.y > 1)
      switch (this.wrapT) {
        case Sr:
          t.y = t.y - Math.floor(t.y);
          break;
        case $t:
          t.y = t.y < 0 ? 0 : 1;
          break;
        case Ar:
          Math.abs(Math.floor(t.y) % 2) === 1 ? t.y = Math.ceil(t.y) - t.y : t.y = t.y - Math.floor(t.y);
          break;
      }
    return this.flipY && (t.y = 1 - t.y), t;
  }
  set needsUpdate(t) {
    t === true && (this.version++, this.source.needsUpdate = true);
  }
  set needsPMREMUpdate(t) {
    t === true && this.pmremVersion++;
  }
};
ut.DEFAULT_IMAGE = null;
ut.DEFAULT_MAPPING = ea;
ut.DEFAULT_ANISOTROPY = 1;
var Dt = class h5 {
  constructor(t = 0, e = 0, i = 0, s = 1) {
    h5.prototype.isVector4 = true, this.x = t, this.y = e, this.z = i, this.w = s;
  }
  get width() {
    return this.z;
  }
  set width(t) {
    this.z = t;
  }
  get height() {
    return this.w;
  }
  set height(t) {
    this.w = t;
  }
  set(t, e, i, s) {
    return this.x = t, this.y = e, this.z = i, this.w = s, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this.w = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setZ(t) {
    return this.z = t, this;
  }
  setW(t) {
    return this.w = t, this;
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      case 3:
        this.w = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this.w = t.w !== void 0 ? t.w : 1, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this.w += t.w, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this.w += t, this;
  }
  addVectors(t, e) {
    return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this.w = t.w + e.w, this;
  }
  addScaledVector(t, e) {
    return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this.w += t.w * e, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this.w -= t.w, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this.w -= t, this;
  }
  subVectors(t, e) {
    return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this.w = t.w - e.w, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this.w *= t.w, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this.w *= t, this;
  }
  applyMatrix4(t) {
    let e = this.x, i = this.y, s = this.z, n = this.w, r = t.elements;
    return this.x = r[0] * e + r[4] * i + r[8] * s + r[12] * n, this.y = r[1] * e + r[5] * i + r[9] * s + r[13] * n, this.z = r[2] * e + r[6] * i + r[10] * s + r[14] * n, this.w = r[3] * e + r[7] * i + r[11] * s + r[15] * n, this;
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this.z /= t.z, this.w /= t.w, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  setAxisAngleFromQuaternion(t) {
    this.w = 2 * Math.acos(t.w);
    let e = Math.sqrt(1 - t.w * t.w);
    return e < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = t.x / e, this.y = t.y / e, this.z = t.z / e), this;
  }
  setAxisAngleFromRotationMatrix(t) {
    let e, i, s, n, a = t.elements, l = a[0], c = a[4], u = a[8], d = a[1], p = a[5], f = a[9], m = a[2], g2 = a[6], y3 = a[10];
    if (Math.abs(c - d) < 0.01 && Math.abs(u - m) < 0.01 && Math.abs(f - g2) < 0.01) {
      if (Math.abs(c + d) < 0.1 && Math.abs(u + m) < 0.1 && Math.abs(f + g2) < 0.1 && Math.abs(l + p + y3 - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      e = Math.PI;
      let b = (l + 1) / 2, M = (p + 1) / 2, _2 = (y3 + 1) / 2, v = (c + d) / 4, A = (u + m) / 4, S = (f + g2) / 4;
      return b > M && b > _2 ? b < 0.01 ? (i = 0, s = 0.707106781, n = 0.707106781) : (i = Math.sqrt(b), s = v / i, n = A / i) : M > _2 ? M < 0.01 ? (i = 0.707106781, s = 0, n = 0.707106781) : (s = Math.sqrt(M), i = v / s, n = S / s) : _2 < 0.01 ? (i = 0.707106781, s = 0.707106781, n = 0) : (n = Math.sqrt(_2), i = A / n, s = S / n), this.set(i, s, n, e), this;
    }
    let x = Math.sqrt((g2 - f) * (g2 - f) + (u - m) * (u - m) + (d - c) * (d - c));
    return Math.abs(x) < 1e-3 && (x = 1), this.x = (g2 - f) / x, this.y = (u - m) / x, this.z = (d - c) / x, this.w = Math.acos((l + p + y3 - 1) / 2), this;
  }
  setFromMatrixPosition(t) {
    let e = t.elements;
    return this.x = e[12], this.y = e[13], this.z = e[14], this.w = e[15], this;
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this.w = Math.min(this.w, t.w), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this.w = Math.max(this.w, t.w), this;
  }
  clamp(t, e) {
    return this.x = N(this.x, t.x, e.x), this.y = N(this.y, t.y, e.y), this.z = N(this.z, t.z, e.z), this.w = N(this.w, t.w, e.w), this;
  }
  clampScalar(t, e) {
    return this.x = N(this.x, t, e), this.y = N(this.y, t, e), this.z = N(this.z, t, e), this.w = N(this.w, t, e), this;
  }
  clampLength(t, e) {
    let i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(N(i, t, e));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this.w += (t.w - this.w) * e, this;
  }
  lerpVectors(t, e, i) {
    return this.x = t.x + (e.x - t.x) * i, this.y = t.y + (e.y - t.y) * i, this.z = t.z + (e.z - t.z) * i, this.w = t.w + (e.w - t.w) * i, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w;
  }
  fromArray(t, e = 0) {
    return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this.w = t[e + 3], this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t[e + 3] = this.w, t;
  }
  fromBufferAttribute(t, e) {
    return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this.w = t.getW(e), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
};
var an = class extends Kt {
  constructor(t = 1, e = 1, i = {}) {
    super(), i = Object.assign({ generateMipmaps: false, internalFormat: null, minFilter: Vt, depthBuffer: true, stencilBuffer: false, resolveDepthBuffer: true, resolveStencilBuffer: true, depthTexture: null, samples: 0, count: 1, depth: 1, multiview: false }, i), this.isRenderTarget = true, this.width = t, this.height = e, this.depth = i.depth, this.scissor = new Dt(0, 0, t, e), this.scissorTest = false, this.viewport = new Dt(0, 0, t, e);
    let s = { width: t, height: e, depth: i.depth }, n = new ut(s);
    this.textures = [];
    let r = i.count;
    for (let o = 0; o < r; o++)
      this.textures[o] = n.clone(), this.textures[o].isRenderTargetTexture = true, this.textures[o].renderTarget = this;
    this._setTextureOptions(i), this.depthBuffer = i.depthBuffer, this.stencilBuffer = i.stencilBuffer, this.resolveDepthBuffer = i.resolveDepthBuffer, this.resolveStencilBuffer = i.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = i.depthTexture, this.samples = i.samples, this.multiview = i.multiview;
  }
  _setTextureOptions(t = {}) {
    let e = { minFilter: Vt, generateMipmaps: false, flipY: false, internalFormat: null };
    t.mapping !== void 0 && (e.mapping = t.mapping), t.wrapS !== void 0 && (e.wrapS = t.wrapS), t.wrapT !== void 0 && (e.wrapT = t.wrapT), t.wrapR !== void 0 && (e.wrapR = t.wrapR), t.magFilter !== void 0 && (e.magFilter = t.magFilter), t.minFilter !== void 0 && (e.minFilter = t.minFilter), t.format !== void 0 && (e.format = t.format), t.type !== void 0 && (e.type = t.type), t.anisotropy !== void 0 && (e.anisotropy = t.anisotropy), t.colorSpace !== void 0 && (e.colorSpace = t.colorSpace), t.flipY !== void 0 && (e.flipY = t.flipY), t.generateMipmaps !== void 0 && (e.generateMipmaps = t.generateMipmaps), t.internalFormat !== void 0 && (e.internalFormat = t.internalFormat);
    for (let i = 0; i < this.textures.length; i++)
      this.textures[i].setValues(e);
  }
  get texture() {
    return this.textures[0];
  }
  set texture(t) {
    this.textures[0] = t;
  }
  set depthTexture(t) {
    this._depthTexture !== null && (this._depthTexture.renderTarget = null), t !== null && (t.renderTarget = this), this._depthTexture = t;
  }
  get depthTexture() {
    return this._depthTexture;
  }
  setSize(t, e, i = 1) {
    if (this.width !== t || this.height !== e || this.depth !== i) {
      this.width = t, this.height = e, this.depth = i;
      for (let s = 0, n = this.textures.length; s < n; s++)
        this.textures[s].image.width = t, this.textures[s].image.height = e, this.textures[s].image.depth = i, this.textures[s].isData3DTexture !== true && (this.textures[s].isArrayTexture = this.textures[s].image.depth > 1);
      this.dispose();
    }
    this.viewport.set(0, 0, t, e), this.scissor.set(0, 0, t, e);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    this.width = t.width, this.height = t.height, this.depth = t.depth, this.scissor.copy(t.scissor), this.scissorTest = t.scissorTest, this.viewport.copy(t.viewport), this.textures.length = 0;
    for (let e = 0, i = t.textures.length; e < i; e++) {
      this.textures[e] = t.textures[e].clone(), this.textures[e].isRenderTargetTexture = true, this.textures[e].renderTarget = this;
      let s = Object.assign({}, t.textures[e].image);
      this.textures[e].source = new fe(s);
    }
    return this.depthBuffer = t.depthBuffer, this.stencilBuffer = t.stencilBuffer, this.resolveDepthBuffer = t.resolveDepthBuffer, this.resolveStencilBuffer = t.resolveStencilBuffer, t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()), this.samples = t.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
};
var ts = class extends an {
  constructor(t = 1, e = 1, i = {}) {
    super(t, e, i), this.isWebGLRenderTarget = true;
  }
};
var zr = class extends ut {
  constructor(t = null, e = 1, i = 1, s = 1) {
    super(null), this.isDataArrayTexture = true, this.image = { data: t, width: e, height: i, depth: s }, this.magFilter = kt, this.minFilter = kt, this.wrapR = $t, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(t) {
    this.layerUpdates.add(t);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
};
var hn = class extends ut {
  constructor(t = null, e = 1, i = 1, s = 1) {
    super(null), this.isData3DTexture = true, this.image = { data: t, width: e, height: i, depth: s }, this.magFilter = kt, this.minFilter = kt, this.wrapR = $t, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1;
  }
};
var pt = class {
  constructor(t = new w(1 / 0, 1 / 0, 1 / 0), e = new w(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = true, this.min = t, this.max = e;
  }
  set(t, e) {
    return this.min.copy(t), this.max.copy(e), this;
  }
  setFromArray(t) {
    this.makeEmpty();
    for (let e = 0, i = t.length; e < i; e += 3)
      this.expandByPoint(qt.fromArray(t, e));
    return this;
  }
  setFromBufferAttribute(t) {
    this.makeEmpty();
    for (let e = 0, i = t.count; e < i; e++)
      this.expandByPoint(qt.fromBufferAttribute(t, e));
    return this;
  }
  setFromPoints(t) {
    this.makeEmpty();
    for (let e = 0, i = t.length; e < i; e++)
      this.expandByPoint(t[e]);
    return this;
  }
  setFromCenterAndSize(t, e) {
    let i = qt.copy(e).multiplyScalar(0.5);
    return this.min.copy(t).sub(i), this.max.copy(t).add(i), this;
  }
  setFromObject(t, e = false) {
    return this.makeEmpty(), this.expandByObject(t, e);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.min.copy(t.min), this.max.copy(t.max), this;
  }
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(t) {
    return this.isEmpty() ? t.set(0, 0, 0) : t.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(t) {
    return this.isEmpty() ? t.set(0, 0, 0) : t.subVectors(this.max, this.min);
  }
  expandByPoint(t) {
    return this.min.min(t), this.max.max(t), this;
  }
  expandByVector(t) {
    return this.min.sub(t), this.max.add(t), this;
  }
  expandByScalar(t) {
    return this.min.addScalar(-t), this.max.addScalar(t), this;
  }
  expandByObject(t, e = false) {
    t.updateWorldMatrix(false, false);
    let i = t.geometry;
    if (i !== void 0) {
      let n = i.getAttribute("position");
      if (e === true && n !== void 0 && t.isInstancedMesh !== true)
        for (let r = 0, o = n.count; r < o; r++)
          t.isMesh === true ? t.getVertexPosition(r, qt) : qt.fromBufferAttribute(n, r), qt.applyMatrix4(t.matrixWorld), this.expandByPoint(qt);
      else
        t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), fs.copy(t.boundingBox)) : (i.boundingBox === null && i.computeBoundingBox(), fs.copy(i.boundingBox)), fs.applyMatrix4(t.matrixWorld), this.union(fs);
    }
    let s = t.children;
    for (let n = 0, r = s.length; n < r; n++)
      this.expandByObject(s[n], e);
    return this;
  }
  containsPoint(t) {
    return t.x >= this.min.x && t.x <= this.max.x && t.y >= this.min.y && t.y <= this.max.y && t.z >= this.min.z && t.z <= this.max.z;
  }
  containsBox(t) {
    return this.min.x <= t.min.x && t.max.x <= this.max.x && this.min.y <= t.min.y && t.max.y <= this.max.y && this.min.z <= t.min.z && t.max.z <= this.max.z;
  }
  getParameter(t, e) {
    return e.set((t.x - this.min.x) / (this.max.x - this.min.x), (t.y - this.min.y) / (this.max.y - this.min.y), (t.z - this.min.z) / (this.max.z - this.min.z));
  }
  intersectsBox(t) {
    return t.max.x >= this.min.x && t.min.x <= this.max.x && t.max.y >= this.min.y && t.min.y <= this.max.y && t.max.z >= this.min.z && t.min.z <= this.max.z;
  }
  intersectsSphere(t) {
    return this.clampPoint(t.center, qt), qt.distanceToSquared(t.center) <= t.radius * t.radius;
  }
  intersectsPlane(t) {
    let e, i;
    return t.normal.x > 0 ? (e = t.normal.x * this.min.x, i = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, i = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, i += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, i += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, i += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, i += t.normal.z * this.min.z), e <= -t.constant && i >= -t.constant;
  }
  intersectsTriangle(t) {
    if (this.isEmpty())
      return false;
    this.getCenter(Oi), ms.subVectors(this.max, Oi), ei.subVectors(t.a, Oi), ii.subVectors(t.b, Oi), si.subVectors(t.c, Oi), be.subVectors(ii, ei), we.subVectors(si, ii), Pe.subVectors(ei, si);
    let e = [0, -be.z, be.y, 0, -we.z, we.y, 0, -Pe.z, Pe.y, be.z, 0, -be.x, we.z, 0, -we.x, Pe.z, 0, -Pe.x, -be.y, be.x, 0, -we.y, we.x, 0, -Pe.y, Pe.x, 0];
    return !Jn(e, ei, ii, si, ms) || (e = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Jn(e, ei, ii, si, ms)) ? false : (ys.crossVectors(be, we), e = [ys.x, ys.y, ys.z], Jn(e, ei, ii, si, ms));
  }
  clampPoint(t, e) {
    return e.copy(t).clamp(this.min, this.max);
  }
  distanceToPoint(t) {
    return this.clampPoint(t, qt).distanceTo(t);
  }
  getBoundingSphere(t) {
    return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(qt).length() * 0.5), t;
  }
  intersect(t) {
    return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(t) {
    return this.min.min(t.min), this.max.max(t.max), this;
  }
  applyMatrix4(t) {
    return this.isEmpty() ? this : (oe[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), oe[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), oe[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), oe[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), oe[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), oe[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), oe[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), oe[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(oe), this);
  }
  translate(t) {
    return this.min.add(t), this.max.add(t), this;
  }
  equals(t) {
    return t.min.equals(this.min) && t.max.equals(this.max);
  }
  toJSON() {
    return { min: this.min.toArray(), max: this.max.toArray() };
  }
  fromJSON(t) {
    return this.min.fromArray(t.min), this.max.fromArray(t.max), this;
  }
};
var oe = [new w(), new w(), new w(), new w(), new w(), new w(), new w(), new w()];
var qt = new w();
var fs = new pt();
var ei = new w();
var ii = new w();
var si = new w();
var be = new w();
var we = new w();
var Pe = new w();
var Oi = new w();
var ms = new w();
var ys = new w();
var Re = new w();
function Jn(h36, t, e, i, s) {
  for (let n = 0, r = h36.length - 3; n <= r; n += 3) {
    Re.fromArray(h36, n);
    let o = s.x * Math.abs(Re.x) + s.y * Math.abs(Re.y) + s.z * Math.abs(Re.z), a = t.dot(Re), l = e.dot(Re), c = i.dot(Re);
    if (Math.max(-Math.max(a, l, c), Math.min(a, l, c)) > o)
      return false;
  }
  return true;
}
var Eu = new pt();
var Ei = new w();
var Gn = new w();
var ct = class {
  constructor(t = new w(), e = -1) {
    this.isSphere = true, this.center = t, this.radius = e;
  }
  set(t, e) {
    return this.center.copy(t), this.radius = e, this;
  }
  setFromPoints(t, e) {
    let i = this.center;
    e !== void 0 ? i.copy(e) : Eu.setFromPoints(t).getCenter(i);
    let s = 0;
    for (let n = 0, r = t.length; n < r; n++)
      s = Math.max(s, i.distanceToSquared(t[n]));
    return this.radius = Math.sqrt(s), this;
  }
  copy(t) {
    return this.center.copy(t.center), this.radius = t.radius, this;
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this;
  }
  containsPoint(t) {
    return t.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(t) {
    return t.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(t) {
    let e = this.radius + t.radius;
    return t.center.distanceToSquared(this.center) <= e * e;
  }
  intersectsBox(t) {
    return t.intersectsSphere(this);
  }
  intersectsPlane(t) {
    return Math.abs(t.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(t, e) {
    let i = this.center.distanceToSquared(t);
    return e.copy(t), i > this.radius * this.radius && (e.sub(this.center).normalize(), e.multiplyScalar(this.radius).add(this.center)), e;
  }
  getBoundingBox(t) {
    return this.isEmpty() ? (t.makeEmpty(), t) : (t.set(this.center, this.center), t.expandByScalar(this.radius), t);
  }
  applyMatrix4(t) {
    return this.center.applyMatrix4(t), this.radius = this.radius * t.getMaxScaleOnAxis(), this;
  }
  translate(t) {
    return this.center.add(t), this;
  }
  expandByPoint(t) {
    if (this.isEmpty())
      return this.center.copy(t), this.radius = 0, this;
    Ei.subVectors(t, this.center);
    let e = Ei.lengthSq();
    if (e > this.radius * this.radius) {
      let i = Math.sqrt(e), s = (i - this.radius) * 0.5;
      this.center.addScaledVector(Ei, s / i), this.radius += s;
    }
    return this;
  }
  union(t) {
    return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === true ? this.radius = Math.max(this.radius, t.radius) : (Gn.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(Ei.copy(t.center).add(Gn)), this.expandByPoint(Ei.copy(t.center).sub(Gn))), this);
  }
  equals(t) {
    return t.center.equals(this.center) && t.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    return { radius: this.radius, center: this.center.toArray() };
  }
  fromJSON(t) {
    return this.radius = t.radius, this.center.fromArray(t.center), this;
  }
};
var ae = new w();
var Xn = new w();
var gs = new w();
var Me = new w();
var Hn = new w();
var xs = new w();
var Zn = new w();
var Ze = class {
  constructor(t = new w(), e = new w(0, 0, -1)) {
    this.origin = t, this.direction = e;
  }
  set(t, e) {
    return this.origin.copy(t), this.direction.copy(e), this;
  }
  copy(t) {
    return this.origin.copy(t.origin), this.direction.copy(t.direction), this;
  }
  at(t, e) {
    return e.copy(this.origin).addScaledVector(this.direction, t);
  }
  lookAt(t) {
    return this.direction.copy(t).sub(this.origin).normalize(), this;
  }
  recast(t) {
    return this.origin.copy(this.at(t, ae)), this;
  }
  closestPointToPoint(t, e) {
    e.subVectors(t, this.origin);
    let i = e.dot(this.direction);
    return i < 0 ? e.copy(this.origin) : e.copy(this.origin).addScaledVector(this.direction, i);
  }
  distanceToPoint(t) {
    return Math.sqrt(this.distanceSqToPoint(t));
  }
  distanceSqToPoint(t) {
    let e = ae.subVectors(t, this.origin).dot(this.direction);
    return e < 0 ? this.origin.distanceToSquared(t) : (ae.copy(this.origin).addScaledVector(this.direction, e), ae.distanceToSquared(t));
  }
  distanceSqToSegment(t, e, i, s) {
    Xn.copy(t).add(e).multiplyScalar(0.5), gs.copy(e).sub(t).normalize(), Me.copy(this.origin).sub(Xn);
    let n = t.distanceTo(e) * 0.5, r = -this.direction.dot(gs), o = Me.dot(this.direction), a = -Me.dot(gs), l = Me.lengthSq(), c = Math.abs(1 - r * r), u, d, p, f;
    if (c > 0)
      if (u = r * a - o, d = r * o - a, f = n * c, u >= 0)
        if (d >= -f)
          if (d <= f) {
            let m = 1 / c;
            u *= m, d *= m, p = u * (u + r * d + 2 * o) + d * (r * u + d + 2 * a) + l;
          } else
            d = n, u = Math.max(0, -(r * d + o)), p = -u * u + d * (d + 2 * a) + l;
        else
          d = -n, u = Math.max(0, -(r * d + o)), p = -u * u + d * (d + 2 * a) + l;
      else
        d <= -f ? (u = Math.max(0, -(-r * n + o)), d = u > 0 ? -n : Math.min(Math.max(-n, -a), n), p = -u * u + d * (d + 2 * a) + l) : d <= f ? (u = 0, d = Math.min(Math.max(-n, -a), n), p = d * (d + 2 * a) + l) : (u = Math.max(0, -(r * n + o)), d = u > 0 ? n : Math.min(Math.max(-n, -a), n), p = -u * u + d * (d + 2 * a) + l);
    else
      d = r > 0 ? -n : n, u = Math.max(0, -(r * d + o)), p = -u * u + d * (d + 2 * a) + l;
    return i && i.copy(this.origin).addScaledVector(this.direction, u), s && s.copy(Xn).addScaledVector(gs, d), p;
  }
  intersectSphere(t, e) {
    ae.subVectors(t.center, this.origin);
    let i = ae.dot(this.direction), s = ae.dot(ae) - i * i, n = t.radius * t.radius;
    if (s > n)
      return null;
    let r = Math.sqrt(n - s), o = i - r, a = i + r;
    return a < 0 ? null : o < 0 ? this.at(a, e) : this.at(o, e);
  }
  intersectsSphere(t) {
    return t.radius < 0 ? false : this.distanceSqToPoint(t.center) <= t.radius * t.radius;
  }
  distanceToPlane(t) {
    let e = t.normal.dot(this.direction);
    if (e === 0)
      return t.distanceToPoint(this.origin) === 0 ? 0 : null;
    let i = -(this.origin.dot(t.normal) + t.constant) / e;
    return i >= 0 ? i : null;
  }
  intersectPlane(t, e) {
    let i = this.distanceToPlane(t);
    return i === null ? null : this.at(i, e);
  }
  intersectsPlane(t) {
    let e = t.distanceToPoint(this.origin);
    return e === 0 || t.normal.dot(this.direction) * e < 0;
  }
  intersectBox(t, e) {
    let i, s, n, r, o, a, l = 1 / this.direction.x, c = 1 / this.direction.y, u = 1 / this.direction.z, d = this.origin;
    return l >= 0 ? (i = (t.min.x - d.x) * l, s = (t.max.x - d.x) * l) : (i = (t.max.x - d.x) * l, s = (t.min.x - d.x) * l), c >= 0 ? (n = (t.min.y - d.y) * c, r = (t.max.y - d.y) * c) : (n = (t.max.y - d.y) * c, r = (t.min.y - d.y) * c), i > r || n > s || ((n > i || isNaN(i)) && (i = n), (r < s || isNaN(s)) && (s = r), u >= 0 ? (o = (t.min.z - d.z) * u, a = (t.max.z - d.z) * u) : (o = (t.max.z - d.z) * u, a = (t.min.z - d.z) * u), i > a || o > s) || ((o > i || i !== i) && (i = o), (a < s || s !== s) && (s = a), s < 0) ? null : this.at(i >= 0 ? i : s, e);
  }
  intersectsBox(t) {
    return this.intersectBox(t, ae) !== null;
  }
  intersectTriangle(t, e, i, s, n) {
    Hn.subVectors(e, t), xs.subVectors(i, t), Zn.crossVectors(Hn, xs);
    let r = this.direction.dot(Zn), o;
    if (r > 0) {
      if (s)
        return null;
      o = 1;
    } else if (r < 0)
      o = -1, r = -r;
    else
      return null;
    Me.subVectors(this.origin, t);
    let a = o * this.direction.dot(xs.crossVectors(Me, xs));
    if (a < 0)
      return null;
    let l = o * this.direction.dot(Hn.cross(Me));
    if (l < 0 || a + l > r)
      return null;
    let c = -o * Me.dot(Zn);
    return c < 0 ? null : this.at(c / r, n);
  }
  applyMatrix4(t) {
    return this.origin.applyMatrix4(t), this.direction.transformDirection(t), this;
  }
  equals(t) {
    return t.origin.equals(this.origin) && t.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
var U = class h6 {
  constructor(t, e, i, s, n, r, o, a, l, c, u, d, p, f, m, g2) {
    h6.prototype.isMatrix4 = true, this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], t !== void 0 && this.set(t, e, i, s, n, r, o, a, l, c, u, d, p, f, m, g2);
  }
  set(t, e, i, s, n, r, o, a, l, c, u, d, p, f, m, g2) {
    let y3 = this.elements;
    return y3[0] = t, y3[4] = e, y3[8] = i, y3[12] = s, y3[1] = n, y3[5] = r, y3[9] = o, y3[13] = a, y3[2] = l, y3[6] = c, y3[10] = u, y3[14] = d, y3[3] = p, y3[7] = f, y3[11] = m, y3[15] = g2, this;
  }
  identity() {
    return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  clone() {
    return new h6().fromArray(this.elements);
  }
  copy(t) {
    let e = this.elements, i = t.elements;
    return e[0] = i[0], e[1] = i[1], e[2] = i[2], e[3] = i[3], e[4] = i[4], e[5] = i[5], e[6] = i[6], e[7] = i[7], e[8] = i[8], e[9] = i[9], e[10] = i[10], e[11] = i[11], e[12] = i[12], e[13] = i[13], e[14] = i[14], e[15] = i[15], this;
  }
  copyPosition(t) {
    let e = this.elements, i = t.elements;
    return e[12] = i[12], e[13] = i[13], e[14] = i[14], this;
  }
  setFromMatrix3(t) {
    let e = t.elements;
    return this.set(e[0], e[3], e[6], 0, e[1], e[4], e[7], 0, e[2], e[5], e[8], 0, 0, 0, 0, 1), this;
  }
  extractBasis(t, e, i) {
    return this.determinant() === 0 ? (t.set(1, 0, 0), e.set(0, 1, 0), i.set(0, 0, 1), this) : (t.setFromMatrixColumn(this, 0), e.setFromMatrixColumn(this, 1), i.setFromMatrixColumn(this, 2), this);
  }
  makeBasis(t, e, i) {
    return this.set(t.x, e.x, i.x, 0, t.y, e.y, i.y, 0, t.z, e.z, i.z, 0, 0, 0, 0, 1), this;
  }
  extractRotation(t) {
    if (t.determinant() === 0)
      return this.identity();
    let e = this.elements, i = t.elements, s = 1 / ni.setFromMatrixColumn(t, 0).length(), n = 1 / ni.setFromMatrixColumn(t, 1).length(), r = 1 / ni.setFromMatrixColumn(t, 2).length();
    return e[0] = i[0] * s, e[1] = i[1] * s, e[2] = i[2] * s, e[3] = 0, e[4] = i[4] * n, e[5] = i[5] * n, e[6] = i[6] * n, e[7] = 0, e[8] = i[8] * r, e[9] = i[9] * r, e[10] = i[10] * r, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  makeRotationFromEuler(t) {
    let e = this.elements, i = t.x, s = t.y, n = t.z, r = Math.cos(i), o = Math.sin(i), a = Math.cos(s), l = Math.sin(s), c = Math.cos(n), u = Math.sin(n);
    if (t.order === "XYZ") {
      let d = r * c, p = r * u, f = o * c, m = o * u;
      e[0] = a * c, e[4] = -a * u, e[8] = l, e[1] = p + f * l, e[5] = d - m * l, e[9] = -o * a, e[2] = m - d * l, e[6] = f + p * l, e[10] = r * a;
    } else if (t.order === "YXZ") {
      let d = a * c, p = a * u, f = l * c, m = l * u;
      e[0] = d + m * o, e[4] = f * o - p, e[8] = r * l, e[1] = r * u, e[5] = r * c, e[9] = -o, e[2] = p * o - f, e[6] = m + d * o, e[10] = r * a;
    } else if (t.order === "ZXY") {
      let d = a * c, p = a * u, f = l * c, m = l * u;
      e[0] = d - m * o, e[4] = -r * u, e[8] = f + p * o, e[1] = p + f * o, e[5] = r * c, e[9] = m - d * o, e[2] = -r * l, e[6] = o, e[10] = r * a;
    } else if (t.order === "ZYX") {
      let d = r * c, p = r * u, f = o * c, m = o * u;
      e[0] = a * c, e[4] = f * l - p, e[8] = d * l + m, e[1] = a * u, e[5] = m * l + d, e[9] = p * l - f, e[2] = -l, e[6] = o * a, e[10] = r * a;
    } else if (t.order === "YZX") {
      let d = r * a, p = r * l, f = o * a, m = o * l;
      e[0] = a * c, e[4] = m - d * u, e[8] = f * u + p, e[1] = u, e[5] = r * c, e[9] = -o * c, e[2] = -l * c, e[6] = p * u + f, e[10] = d - m * u;
    } else if (t.order === "XZY") {
      let d = r * a, p = r * l, f = o * a, m = o * l;
      e[0] = a * c, e[4] = -u, e[8] = l * c, e[1] = d * u + m, e[5] = r * c, e[9] = p * u - f, e[2] = f * u - p, e[6] = o * c, e[10] = m * u + d;
    }
    return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  makeRotationFromQuaternion(t) {
    return this.compose(Nu, t, Vu);
  }
  lookAt(t, e, i) {
    let s = this.elements;
    return Ct.subVectors(t, e), Ct.lengthSq() === 0 && (Ct.z = 1), Ct.normalize(), _e.crossVectors(i, Ct), _e.lengthSq() === 0 && (Math.abs(i.z) === 1 ? Ct.x += 1e-4 : Ct.z += 1e-4, Ct.normalize(), _e.crossVectors(i, Ct)), _e.normalize(), bs.crossVectors(Ct, _e), s[0] = _e.x, s[4] = bs.x, s[8] = Ct.x, s[1] = _e.y, s[5] = bs.y, s[9] = Ct.y, s[2] = _e.z, s[6] = bs.z, s[10] = Ct.z, this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    let i = t.elements, s = e.elements, n = this.elements, r = i[0], o = i[4], a = i[8], l = i[12], c = i[1], u = i[5], d = i[9], p = i[13], f = i[2], m = i[6], g2 = i[10], y3 = i[14], x = i[3], b = i[7], M = i[11], _2 = i[15], v = s[0], A = s[4], S = s[8], T = s[12], C = s[1], P = s[5], D2 = s[9], J = s[13], $ = s[2], Z2 = s[6], at = s[10], dt = s[14], Ut2 = s[3], et = s[7], rt = s[11], it = s[15];
    return n[0] = r * v + o * C + a * $ + l * Ut2, n[4] = r * A + o * P + a * Z2 + l * et, n[8] = r * S + o * D2 + a * at + l * rt, n[12] = r * T + o * J + a * dt + l * it, n[1] = c * v + u * C + d * $ + p * Ut2, n[5] = c * A + u * P + d * Z2 + p * et, n[9] = c * S + u * D2 + d * at + p * rt, n[13] = c * T + u * J + d * dt + p * it, n[2] = f * v + m * C + g2 * $ + y3 * Ut2, n[6] = f * A + m * P + g2 * Z2 + y3 * et, n[10] = f * S + m * D2 + g2 * at + y3 * rt, n[14] = f * T + m * J + g2 * dt + y3 * it, n[3] = x * v + b * C + M * $ + _2 * Ut2, n[7] = x * A + b * P + M * Z2 + _2 * et, n[11] = x * S + b * D2 + M * at + _2 * rt, n[15] = x * T + b * J + M * dt + _2 * it, this;
  }
  multiplyScalar(t) {
    let e = this.elements;
    return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this;
  }
  determinant() {
    let t = this.elements, e = t[0], i = t[4], s = t[8], n = t[12], r = t[1], o = t[5], a = t[9], l = t[13], c = t[2], u = t[6], d = t[10], p = t[14], f = t[3], m = t[7], g2 = t[11], y3 = t[15], x = a * p - l * d, b = o * p - l * u, M = o * d - a * u, _2 = r * p - l * c, v = r * d - a * c, A = r * u - o * c;
    return e * (m * x - g2 * b + y3 * M) - i * (f * x - g2 * _2 + y3 * v) + s * (f * b - m * _2 + y3 * A) - n * (f * M - m * v + g2 * A);
  }
  transpose() {
    let t = this.elements, e;
    return e = t[1], t[1] = t[4], t[4] = e, e = t[2], t[2] = t[8], t[8] = e, e = t[6], t[6] = t[9], t[9] = e, e = t[3], t[3] = t[12], t[12] = e, e = t[7], t[7] = t[13], t[13] = e, e = t[11], t[11] = t[14], t[14] = e, this;
  }
  setPosition(t, e, i) {
    let s = this.elements;
    return t.isVector3 ? (s[12] = t.x, s[13] = t.y, s[14] = t.z) : (s[12] = t, s[13] = e, s[14] = i), this;
  }
  invert() {
    let t = this.elements, e = t[0], i = t[1], s = t[2], n = t[3], r = t[4], o = t[5], a = t[6], l = t[7], c = t[8], u = t[9], d = t[10], p = t[11], f = t[12], m = t[13], g2 = t[14], y3 = t[15], x = u * g2 * l - m * d * l + m * a * p - o * g2 * p - u * a * y3 + o * d * y3, b = f * d * l - c * g2 * l - f * a * p + r * g2 * p + c * a * y3 - r * d * y3, M = c * m * l - f * u * l + f * o * p - r * m * p - c * o * y3 + r * u * y3, _2 = f * u * a - c * m * a - f * o * d + r * m * d + c * o * g2 - r * u * g2, v = e * x + i * b + s * M + n * _2;
    if (v === 0)
      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    let A = 1 / v;
    return t[0] = x * A, t[1] = (m * d * n - u * g2 * n - m * s * p + i * g2 * p + u * s * y3 - i * d * y3) * A, t[2] = (o * g2 * n - m * a * n + m * s * l - i * g2 * l - o * s * y3 + i * a * y3) * A, t[3] = (u * a * n - o * d * n - u * s * l + i * d * l + o * s * p - i * a * p) * A, t[4] = b * A, t[5] = (c * g2 * n - f * d * n + f * s * p - e * g2 * p - c * s * y3 + e * d * y3) * A, t[6] = (f * a * n - r * g2 * n - f * s * l + e * g2 * l + r * s * y3 - e * a * y3) * A, t[7] = (r * d * n - c * a * n + c * s * l - e * d * l - r * s * p + e * a * p) * A, t[8] = M * A, t[9] = (f * u * n - c * m * n - f * i * p + e * m * p + c * i * y3 - e * u * y3) * A, t[10] = (r * m * n - f * o * n + f * i * l - e * m * l - r * i * y3 + e * o * y3) * A, t[11] = (c * o * n - r * u * n - c * i * l + e * u * l + r * i * p - e * o * p) * A, t[12] = _2 * A, t[13] = (c * m * s - f * u * s + f * i * d - e * m * d - c * i * g2 + e * u * g2) * A, t[14] = (f * o * s - r * m * s - f * i * a + e * m * a + r * i * g2 - e * o * g2) * A, t[15] = (r * u * s - c * o * s + c * i * a - e * u * a - r * i * d + e * o * d) * A, this;
  }
  scale(t) {
    let e = this.elements, i = t.x, s = t.y, n = t.z;
    return e[0] *= i, e[4] *= s, e[8] *= n, e[1] *= i, e[5] *= s, e[9] *= n, e[2] *= i, e[6] *= s, e[10] *= n, e[3] *= i, e[7] *= s, e[11] *= n, this;
  }
  getMaxScaleOnAxis() {
    let t = this.elements, e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2], i = t[4] * t[4] + t[5] * t[5] + t[6] * t[6], s = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
    return Math.sqrt(Math.max(e, i, s));
  }
  makeTranslation(t, e, i) {
    return t.isVector3 ? this.set(1, 0, 0, t.x, 0, 1, 0, t.y, 0, 0, 1, t.z, 0, 0, 0, 1) : this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, i, 0, 0, 0, 1), this;
  }
  makeRotationX(t) {
    let e = Math.cos(t), i = Math.sin(t);
    return this.set(1, 0, 0, 0, 0, e, -i, 0, 0, i, e, 0, 0, 0, 0, 1), this;
  }
  makeRotationY(t) {
    let e = Math.cos(t), i = Math.sin(t);
    return this.set(e, 0, i, 0, 0, 1, 0, 0, -i, 0, e, 0, 0, 0, 0, 1), this;
  }
  makeRotationZ(t) {
    let e = Math.cos(t), i = Math.sin(t);
    return this.set(e, -i, 0, 0, i, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  makeRotationAxis(t, e) {
    let i = Math.cos(e), s = Math.sin(e), n = 1 - i, r = t.x, o = t.y, a = t.z, l = n * r, c = n * o;
    return this.set(l * r + i, l * o - s * a, l * a + s * o, 0, l * o + s * a, c * o + i, c * a - s * r, 0, l * a - s * o, c * a + s * r, n * a * a + i, 0, 0, 0, 0, 1), this;
  }
  makeScale(t, e, i) {
    return this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, i, 0, 0, 0, 0, 1), this;
  }
  makeShear(t, e, i, s, n, r) {
    return this.set(1, i, n, 0, t, 1, r, 0, e, s, 1, 0, 0, 0, 0, 1), this;
  }
  compose(t, e, i) {
    let s = this.elements, n = e._x, r = e._y, o = e._z, a = e._w, l = n + n, c = r + r, u = o + o, d = n * l, p = n * c, f = n * u, m = r * c, g2 = r * u, y3 = o * u, x = a * l, b = a * c, M = a * u, _2 = i.x, v = i.y, A = i.z;
    return s[0] = (1 - (m + y3)) * _2, s[1] = (p + M) * _2, s[2] = (f - b) * _2, s[3] = 0, s[4] = (p - M) * v, s[5] = (1 - (d + y3)) * v, s[6] = (g2 + x) * v, s[7] = 0, s[8] = (f + b) * A, s[9] = (g2 - x) * A, s[10] = (1 - (d + m)) * A, s[11] = 0, s[12] = t.x, s[13] = t.y, s[14] = t.z, s[15] = 1, this;
  }
  decompose(t, e, i) {
    let s = this.elements;
    if (t.x = s[12], t.y = s[13], t.z = s[14], this.determinant() === 0)
      return i.set(1, 1, 1), e.identity(), this;
    let n = ni.set(s[0], s[1], s[2]).length(), r = ni.set(s[4], s[5], s[6]).length(), o = ni.set(s[8], s[9], s[10]).length();
    this.determinant() < 0 && (n = -n), Jt.copy(this);
    let l = 1 / n, c = 1 / r, u = 1 / o;
    return Jt.elements[0] *= l, Jt.elements[1] *= l, Jt.elements[2] *= l, Jt.elements[4] *= c, Jt.elements[5] *= c, Jt.elements[6] *= c, Jt.elements[8] *= u, Jt.elements[9] *= u, Jt.elements[10] *= u, e.setFromRotationMatrix(Jt), i.x = n, i.y = r, i.z = o, this;
  }
  makePerspective(t, e, i, s, n, r, o = jt, a = false) {
    let l = this.elements, c = 2 * n / (e - t), u = 2 * n / (i - s), d = (e + t) / (e - t), p = (i + s) / (i - s), f, m;
    if (a)
      f = n / (r - n), m = r * n / (r - n);
    else if (o === jt)
      f = -(r + n) / (r - n), m = -2 * r * n / (r - n);
    else if (o === Qi)
      f = -r / (r - n), m = -r * n / (r - n);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return l[0] = c, l[4] = 0, l[8] = d, l[12] = 0, l[1] = 0, l[5] = u, l[9] = p, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = f, l[14] = m, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
  }
  makeOrthographic(t, e, i, s, n, r, o = jt, a = false) {
    let l = this.elements, c = 2 / (e - t), u = 2 / (i - s), d = -(e + t) / (e - t), p = -(i + s) / (i - s), f, m;
    if (a)
      f = 1 / (r - n), m = r / (r - n);
    else if (o === jt)
      f = -2 / (r - n), m = -(r + n) / (r - n);
    else if (o === Qi)
      f = -1 / (r - n), m = -n / (r - n);
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return l[0] = c, l[4] = 0, l[8] = 0, l[12] = d, l[1] = 0, l[5] = u, l[9] = 0, l[13] = p, l[2] = 0, l[6] = 0, l[10] = f, l[14] = m, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
  }
  equals(t) {
    let e = this.elements, i = t.elements;
    for (let s = 0; s < 16; s++)
      if (e[s] !== i[s])
        return false;
    return true;
  }
  fromArray(t, e = 0) {
    for (let i = 0; i < 16; i++)
      this.elements[i] = t[i + e];
    return this;
  }
  toArray(t = [], e = 0) {
    let i = this.elements;
    return t[e] = i[0], t[e + 1] = i[1], t[e + 2] = i[2], t[e + 3] = i[3], t[e + 4] = i[4], t[e + 5] = i[5], t[e + 6] = i[6], t[e + 7] = i[7], t[e + 8] = i[8], t[e + 9] = i[9], t[e + 10] = i[10], t[e + 11] = i[11], t[e + 12] = i[12], t[e + 13] = i[13], t[e + 14] = i[14], t[e + 15] = i[15], t;
  }
};
var ni = new w();
var Jt = new U();
var Nu = new w(0, 0, 0);
var Vu = new w(1, 1, 1);
var _e = new w();
var bs = new w();
var Ct = new w();
var Pa = new U();
var Ra = new Mt();
var ee = class h7 {
  constructor(t = 0, e = 0, i = 0, s = h7.DEFAULT_ORDER) {
    this.isEuler = true, this._x = t, this._y = e, this._z = i, this._order = s;
  }
  get x() {
    return this._x;
  }
  set x(t) {
    this._x = t, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(t) {
    this._y = t, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(t) {
    this._z = t, this._onChangeCallback();
  }
  get order() {
    return this._order;
  }
  set order(t) {
    this._order = t, this._onChangeCallback();
  }
  set(t, e, i, s = this._order) {
    return this._x = t, this._y = e, this._z = i, this._order = s, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(t) {
    return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this._onChangeCallback(), this;
  }
  setFromRotationMatrix(t, e = this._order, i = true) {
    let s = t.elements, n = s[0], r = s[4], o = s[8], a = s[1], l = s[5], c = s[9], u = s[2], d = s[6], p = s[10];
    switch (e) {
      case "XYZ":
        this._y = Math.asin(N(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-c, p), this._z = Math.atan2(-r, n)) : (this._x = Math.atan2(d, l), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-N(c, -1, 1)), Math.abs(c) < 0.9999999 ? (this._y = Math.atan2(o, p), this._z = Math.atan2(a, l)) : (this._y = Math.atan2(-u, n), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(N(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-u, p), this._z = Math.atan2(-r, l)) : (this._y = 0, this._z = Math.atan2(a, n));
        break;
      case "ZYX":
        this._y = Math.asin(-N(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._x = Math.atan2(d, p), this._z = Math.atan2(a, n)) : (this._x = 0, this._z = Math.atan2(-r, l));
        break;
      case "YZX":
        this._z = Math.asin(N(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(-c, l), this._y = Math.atan2(-u, n)) : (this._x = 0, this._y = Math.atan2(o, p));
        break;
      case "XZY":
        this._z = Math.asin(-N(r, -1, 1)), Math.abs(r) < 0.9999999 ? (this._x = Math.atan2(d, l), this._y = Math.atan2(o, n)) : (this._x = Math.atan2(-c, p), this._y = 0);
        break;
      default:
        E("Euler: .setFromRotationMatrix() encountered an unknown order: " + e);
    }
    return this._order = e, i === true && this._onChangeCallback(), this;
  }
  setFromQuaternion(t, e, i) {
    return Pa.makeRotationFromQuaternion(t), this.setFromRotationMatrix(Pa, e, i);
  }
  setFromVector3(t, e = this._order) {
    return this.set(t.x, t.y, t.z, e);
  }
  reorder(t) {
    return Ra.setFromEuler(this), this.setFromQuaternion(Ra, t);
  }
  equals(t) {
    return t._x === this._x && t._y === this._y && t._z === this._z && t._order === this._order;
  }
  fromArray(t) {
    return this._x = t[0], this._y = t[1], this._z = t[2], t[3] !== void 0 && (this._order = t[3]), this._onChangeCallback(), this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._order, t;
  }
  _onChange(t) {
    return this._onChangeCallback = t, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
};
ee.DEFAULT_ORDER = "XYZ";
var ln = class {
  constructor() {
    this.mask = 1;
  }
  set(t) {
    this.mask = (1 << t | 0) >>> 0;
  }
  enable(t) {
    this.mask |= 1 << t | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(t) {
    this.mask ^= 1 << t | 0;
  }
  disable(t) {
    this.mask &= ~(1 << t | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(t) {
    return (this.mask & t.mask) !== 0;
  }
  isEnabled(t) {
    return (this.mask & (1 << t | 0)) !== 0;
  }
};
var Du = 0;
var Oa = new w();
var ri = new Mt();
var he = new U();
var ws = new w();
var Ni = new w();
var Lu = new w();
var Uu = new Mt();
var Ea = new w(1, 0, 0);
var Na = new w(0, 1, 0);
var Va = new w(0, 0, 1);
var Da = { type: "added" };
var Wu = { type: "removed" };
var oi = { type: "childadded", child: null };
var Yn = { type: "childremoved", child: null };
var H = class h8 extends Kt {
  constructor() {
    super(), this.isObject3D = true, Object.defineProperty(this, "id", { value: Du++ }), this.uuid = Bt(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = h8.DEFAULT_UP.clone();
    let t = new w(), e = new ee(), i = new Mt(), s = new w(1, 1, 1);
    function n() {
      i.setFromEuler(e, false);
    }
    function r() {
      e.setFromQuaternion(i, void 0, false);
    }
    e._onChange(n), i._onChange(r), Object.defineProperties(this, { position: { configurable: true, enumerable: true, value: t }, rotation: { configurable: true, enumerable: true, value: e }, quaternion: { configurable: true, enumerable: true, value: i }, scale: { configurable: true, enumerable: true, value: s }, modelViewMatrix: { value: new U() }, normalMatrix: { value: new te() } }), this.matrix = new U(), this.matrixWorld = new U(), this.matrixAutoUpdate = h8.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = h8.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = false, this.layers = new ln(), this.visible = true, this.castShadow = false, this.receiveShadow = false, this.frustumCulled = true, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.userData = {};
  }
  onBeforeShadow() {
  }
  onAfterShadow() {
  }
  onBeforeRender() {
  }
  onAfterRender() {
  }
  applyMatrix4(t) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(t), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  applyQuaternion(t) {
    return this.quaternion.premultiply(t), this;
  }
  setRotationFromAxisAngle(t, e) {
    this.quaternion.setFromAxisAngle(t, e);
  }
  setRotationFromEuler(t) {
    this.quaternion.setFromEuler(t, true);
  }
  setRotationFromMatrix(t) {
    this.quaternion.setFromRotationMatrix(t);
  }
  setRotationFromQuaternion(t) {
    this.quaternion.copy(t);
  }
  rotateOnAxis(t, e) {
    return ri.setFromAxisAngle(t, e), this.quaternion.multiply(ri), this;
  }
  rotateOnWorldAxis(t, e) {
    return ri.setFromAxisAngle(t, e), this.quaternion.premultiply(ri), this;
  }
  rotateX(t) {
    return this.rotateOnAxis(Ea, t);
  }
  rotateY(t) {
    return this.rotateOnAxis(Na, t);
  }
  rotateZ(t) {
    return this.rotateOnAxis(Va, t);
  }
  translateOnAxis(t, e) {
    return Oa.copy(t).applyQuaternion(this.quaternion), this.position.add(Oa.multiplyScalar(e)), this;
  }
  translateX(t) {
    return this.translateOnAxis(Ea, t);
  }
  translateY(t) {
    return this.translateOnAxis(Na, t);
  }
  translateZ(t) {
    return this.translateOnAxis(Va, t);
  }
  localToWorld(t) {
    return this.updateWorldMatrix(true, false), t.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(t) {
    return this.updateWorldMatrix(true, false), t.applyMatrix4(he.copy(this.matrixWorld).invert());
  }
  lookAt(t, e, i) {
    t.isVector3 ? ws.copy(t) : ws.set(t, e, i);
    let s = this.parent;
    this.updateWorldMatrix(true, false), Ni.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? he.lookAt(Ni, ws, this.up) : he.lookAt(ws, Ni, this.up), this.quaternion.setFromRotationMatrix(he), s && (he.extractRotation(s.matrixWorld), ri.setFromRotationMatrix(he), this.quaternion.premultiply(ri.invert()));
  }
  add(t) {
    if (arguments.length > 1) {
      for (let e = 0; e < arguments.length; e++)
        this.add(arguments[e]);
      return this;
    }
    return t === this ? (X("Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(Da), oi.child = t, this.dispatchEvent(oi), oi.child = null) : X("Object3D.add: object not an instance of THREE.Object3D.", t), this);
  }
  remove(t) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++)
        this.remove(arguments[i]);
      return this;
    }
    let e = this.children.indexOf(t);
    return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(Wu), Yn.child = t, this.dispatchEvent(Yn), Yn.child = null), this;
  }
  removeFromParent() {
    let t = this.parent;
    return t !== null && t.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(t) {
    return this.updateWorldMatrix(true, false), he.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(true, false), he.multiply(t.parent.matrixWorld)), t.applyMatrix4(he), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(false, true), t.dispatchEvent(Da), oi.child = t, this.dispatchEvent(oi), oi.child = null, this;
  }
  getObjectById(t) {
    return this.getObjectByProperty("id", t);
  }
  getObjectByName(t) {
    return this.getObjectByProperty("name", t);
  }
  getObjectByProperty(t, e) {
    if (this[t] === e)
      return this;
    for (let i = 0, s = this.children.length; i < s; i++) {
      let r = this.children[i].getObjectByProperty(t, e);
      if (r !== void 0)
        return r;
    }
  }
  getObjectsByProperty(t, e, i = []) {
    this[t] === e && i.push(this);
    let s = this.children;
    for (let n = 0, r = s.length; n < r; n++)
      s[n].getObjectsByProperty(t, e, i);
    return i;
  }
  getWorldPosition(t) {
    return this.updateWorldMatrix(true, false), t.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(t) {
    return this.updateWorldMatrix(true, false), this.matrixWorld.decompose(Ni, t, Lu), t;
  }
  getWorldScale(t) {
    return this.updateWorldMatrix(true, false), this.matrixWorld.decompose(Ni, Uu, t), t;
  }
  getWorldDirection(t) {
    this.updateWorldMatrix(true, false);
    let e = this.matrixWorld.elements;
    return t.set(e[8], e[9], e[10]).normalize();
  }
  raycast() {
  }
  traverse(t) {
    t(this);
    let e = this.children;
    for (let i = 0, s = e.length; i < s; i++)
      e[i].traverse(t);
  }
  traverseVisible(t) {
    if (this.visible === false)
      return;
    t(this);
    let e = this.children;
    for (let i = 0, s = e.length; i < s; i++)
      e[i].traverseVisible(t);
  }
  traverseAncestors(t) {
    let e = this.parent;
    e !== null && (t(e), e.traverseAncestors(t));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = true;
  }
  updateMatrixWorld(t) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || t) && (this.matrixWorldAutoUpdate === true && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = false, t = true);
    let e = this.children;
    for (let i = 0, s = e.length; i < s; i++)
      e[i].updateMatrixWorld(t);
  }
  updateWorldMatrix(t, e) {
    let i = this.parent;
    if (t === true && i !== null && i.updateWorldMatrix(true, false), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === true && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), e === true) {
      let s = this.children;
      for (let n = 0, r = s.length; n < r; n++)
        s[n].updateWorldMatrix(false, true);
    }
  }
  toJSON(t) {
    let e = t === void 0 || typeof t == "string", i = {};
    e && (t = { geometries: {}, materials: {}, textures: {}, images: {}, shapes: {}, skeletons: {}, animations: {}, nodes: {} }, i.metadata = { version: 4.7, type: "Object", generator: "Object3D.toJSON" });
    let s = {};
    s.uuid = this.uuid, s.type = this.type, this.name !== "" && (s.name = this.name), this.castShadow === true && (s.castShadow = true), this.receiveShadow === true && (s.receiveShadow = true), this.visible === false && (s.visible = false), this.frustumCulled === false && (s.frustumCulled = false), this.renderOrder !== 0 && (s.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (s.userData = this.userData), s.layers = this.layers.mask, s.matrix = this.matrix.toArray(), s.up = this.up.toArray(), this.matrixAutoUpdate === false && (s.matrixAutoUpdate = false), this.isInstancedMesh && (s.type = "InstancedMesh", s.count = this.count, s.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (s.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (s.type = "BatchedMesh", s.perObjectFrustumCulled = this.perObjectFrustumCulled, s.sortObjects = this.sortObjects, s.drawRanges = this._drawRanges, s.reservedRanges = this._reservedRanges, s.geometryInfo = this._geometryInfo.map((o) => ({ ...o, boundingBox: o.boundingBox ? o.boundingBox.toJSON() : void 0, boundingSphere: o.boundingSphere ? o.boundingSphere.toJSON() : void 0 })), s.instanceInfo = this._instanceInfo.map((o) => ({ ...o })), s.availableInstanceIds = this._availableInstanceIds.slice(), s.availableGeometryIds = this._availableGeometryIds.slice(), s.nextIndexStart = this._nextIndexStart, s.nextVertexStart = this._nextVertexStart, s.geometryCount = this._geometryCount, s.maxInstanceCount = this._maxInstanceCount, s.maxVertexCount = this._maxVertexCount, s.maxIndexCount = this._maxIndexCount, s.geometryInitialized = this._geometryInitialized, s.matricesTexture = this._matricesTexture.toJSON(t), s.indirectTexture = this._indirectTexture.toJSON(t), this._colorsTexture !== null && (s.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (s.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (s.boundingBox = this.boundingBox.toJSON()));
    function n(o, a) {
      return o[a.uuid] === void 0 && (o[a.uuid] = a.toJSON(t)), a.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? s.background = this.background.toJSON() : this.background.isTexture && (s.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== true && (s.environment = this.environment.toJSON(t).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      s.geometry = n(t.geometries, this.geometry);
      let o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        let a = o.shapes;
        if (Array.isArray(a))
          for (let l = 0, c = a.length; l < c; l++) {
            let u = a[l];
            n(t.shapes, u);
          }
        else
          n(t.shapes, a);
      }
    }
    if (this.isSkinnedMesh && (s.bindMode = this.bindMode, s.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (n(t.skeletons, this.skeleton), s.skeleton = this.skeleton.uuid)), this.material !== void 0)
      if (Array.isArray(this.material)) {
        let o = [];
        for (let a = 0, l = this.material.length; a < l; a++)
          o.push(n(t.materials, this.material[a]));
        s.material = o;
      } else
        s.material = n(t.materials, this.material);
    if (this.children.length > 0) {
      s.children = [];
      for (let o = 0; o < this.children.length; o++)
        s.children.push(this.children[o].toJSON(t).object);
    }
    if (this.animations.length > 0) {
      s.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        let a = this.animations[o];
        s.animations.push(n(t.animations, a));
      }
    }
    if (e) {
      let o = r(t.geometries), a = r(t.materials), l = r(t.textures), c = r(t.images), u = r(t.shapes), d = r(t.skeletons), p = r(t.animations), f = r(t.nodes);
      o.length > 0 && (i.geometries = o), a.length > 0 && (i.materials = a), l.length > 0 && (i.textures = l), c.length > 0 && (i.images = c), u.length > 0 && (i.shapes = u), d.length > 0 && (i.skeletons = d), p.length > 0 && (i.animations = p), f.length > 0 && (i.nodes = f);
    }
    return i.object = s, i;
    function r(o) {
      let a = [];
      for (let l in o) {
        let c = o[l];
        delete c.metadata, a.push(c);
      }
      return a;
    }
  }
  clone(t) {
    return new this.constructor().copy(this, t);
  }
  copy(t, e = true) {
    if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, this.animations = t.animations.slice(), this.userData = JSON.parse(JSON.stringify(t.userData)), e === true)
      for (let i = 0; i < t.children.length; i++) {
        let s = t.children[i];
        this.add(s.clone());
      }
    return this;
  }
};
H.DEFAULT_UP = new w(0, 1, 0);
H.DEFAULT_MATRIX_AUTO_UPDATE = true;
H.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;
var Gt = new w();
var le = new w();
var $n = new w();
var ce = new w();
var ai = new w();
var hi = new w();
var La = new w();
var jn = new w();
var Qn = new w();
var Kn = new w();
var tr = new Dt();
var er = new Dt();
var ir = new Dt();
var de = class h9 {
  constructor(t = new w(), e = new w(), i = new w()) {
    this.a = t, this.b = e, this.c = i;
  }
  static getNormal(t, e, i, s) {
    s.subVectors(i, e), Gt.subVectors(t, e), s.cross(Gt);
    let n = s.lengthSq();
    return n > 0 ? s.multiplyScalar(1 / Math.sqrt(n)) : s.set(0, 0, 0);
  }
  static getBarycoord(t, e, i, s, n) {
    Gt.subVectors(s, e), le.subVectors(i, e), $n.subVectors(t, e);
    let r = Gt.dot(Gt), o = Gt.dot(le), a = Gt.dot($n), l = le.dot(le), c = le.dot($n), u = r * l - o * o;
    if (u === 0)
      return n.set(0, 0, 0), null;
    let d = 1 / u, p = (l * a - o * c) * d, f = (r * c - o * a) * d;
    return n.set(1 - p - f, f, p);
  }
  static containsPoint(t, e, i, s) {
    return this.getBarycoord(t, e, i, s, ce) === null ? false : ce.x >= 0 && ce.y >= 0 && ce.x + ce.y <= 1;
  }
  static getInterpolation(t, e, i, s, n, r, o, a) {
    return this.getBarycoord(t, e, i, s, ce) === null ? (a.x = 0, a.y = 0, "z" in a && (a.z = 0), "w" in a && (a.w = 0), null) : (a.setScalar(0), a.addScaledVector(n, ce.x), a.addScaledVector(r, ce.y), a.addScaledVector(o, ce.z), a);
  }
  static getInterpolatedAttribute(t, e, i, s, n, r) {
    return tr.setScalar(0), er.setScalar(0), ir.setScalar(0), tr.fromBufferAttribute(t, e), er.fromBufferAttribute(t, i), ir.fromBufferAttribute(t, s), r.setScalar(0), r.addScaledVector(tr, n.x), r.addScaledVector(er, n.y), r.addScaledVector(ir, n.z), r;
  }
  static isFrontFacing(t, e, i, s) {
    return Gt.subVectors(i, e), le.subVectors(t, e), Gt.cross(le).dot(s) < 0;
  }
  set(t, e, i) {
    return this.a.copy(t), this.b.copy(e), this.c.copy(i), this;
  }
  setFromPointsAndIndices(t, e, i, s) {
    return this.a.copy(t[e]), this.b.copy(t[i]), this.c.copy(t[s]), this;
  }
  setFromAttributeAndIndices(t, e, i, s) {
    return this.a.fromBufferAttribute(t, e), this.b.fromBufferAttribute(t, i), this.c.fromBufferAttribute(t, s), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this;
  }
  getArea() {
    return Gt.subVectors(this.c, this.b), le.subVectors(this.a, this.b), Gt.cross(le).length() * 0.5;
  }
  getMidpoint(t) {
    return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(t) {
    return h9.getNormal(this.a, this.b, this.c, t);
  }
  getPlane(t) {
    return t.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(t, e) {
    return h9.getBarycoord(t, this.a, this.b, this.c, e);
  }
  getInterpolation(t, e, i, s, n) {
    return h9.getInterpolation(t, this.a, this.b, this.c, e, i, s, n);
  }
  containsPoint(t) {
    return h9.containsPoint(t, this.a, this.b, this.c);
  }
  isFrontFacing(t) {
    return h9.isFrontFacing(this.a, this.b, this.c, t);
  }
  intersectsBox(t) {
    return t.intersectsTriangle(this);
  }
  closestPointToPoint(t, e) {
    let i = this.a, s = this.b, n = this.c, r, o;
    ai.subVectors(s, i), hi.subVectors(n, i), jn.subVectors(t, i);
    let a = ai.dot(jn), l = hi.dot(jn);
    if (a <= 0 && l <= 0)
      return e.copy(i);
    Qn.subVectors(t, s);
    let c = ai.dot(Qn), u = hi.dot(Qn);
    if (c >= 0 && u <= c)
      return e.copy(s);
    let d = a * u - c * l;
    if (d <= 0 && a >= 0 && c <= 0)
      return r = a / (a - c), e.copy(i).addScaledVector(ai, r);
    Kn.subVectors(t, n);
    let p = ai.dot(Kn), f = hi.dot(Kn);
    if (f >= 0 && p <= f)
      return e.copy(n);
    let m = p * l - a * f;
    if (m <= 0 && l >= 0 && f <= 0)
      return o = l / (l - f), e.copy(i).addScaledVector(hi, o);
    let g2 = c * f - p * u;
    if (g2 <= 0 && u - c >= 0 && p - f >= 0)
      return La.subVectors(n, s), o = (u - c) / (u - c + (p - f)), e.copy(s).addScaledVector(La, o);
    let y3 = 1 / (g2 + m + d);
    return r = m * y3, o = d * y3, e.copy(i).addScaledVector(ai, r).addScaledVector(hi, o);
  }
  equals(t) {
    return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
  }
};
var Xl = { aliceblue: 15792383, antiquewhite: 16444375, aqua: 65535, aquamarine: 8388564, azure: 15794175, beige: 16119260, bisque: 16770244, black: 0, blanchedalmond: 16772045, blue: 255, blueviolet: 9055202, brown: 10824234, burlywood: 14596231, cadetblue: 6266528, chartreuse: 8388352, chocolate: 13789470, coral: 16744272, cornflowerblue: 6591981, cornsilk: 16775388, crimson: 14423100, cyan: 65535, darkblue: 139, darkcyan: 35723, darkgoldenrod: 12092939, darkgray: 11119017, darkgreen: 25600, darkgrey: 11119017, darkkhaki: 12433259, darkmagenta: 9109643, darkolivegreen: 5597999, darkorange: 16747520, darkorchid: 10040012, darkred: 9109504, darksalmon: 15308410, darkseagreen: 9419919, darkslateblue: 4734347, darkslategray: 3100495, darkslategrey: 3100495, darkturquoise: 52945, darkviolet: 9699539, deeppink: 16716947, deepskyblue: 49151, dimgray: 6908265, dimgrey: 6908265, dodgerblue: 2003199, firebrick: 11674146, floralwhite: 16775920, forestgreen: 2263842, fuchsia: 16711935, gainsboro: 14474460, ghostwhite: 16316671, gold: 16766720, goldenrod: 14329120, gray: 8421504, green: 32768, greenyellow: 11403055, grey: 8421504, honeydew: 15794160, hotpink: 16738740, indianred: 13458524, indigo: 4915330, ivory: 16777200, khaki: 15787660, lavender: 15132410, lavenderblush: 16773365, lawngreen: 8190976, lemonchiffon: 16775885, lightblue: 11393254, lightcoral: 15761536, lightcyan: 14745599, lightgoldenrodyellow: 16448210, lightgray: 13882323, lightgreen: 9498256, lightgrey: 13882323, lightpink: 16758465, lightsalmon: 16752762, lightseagreen: 2142890, lightskyblue: 8900346, lightslategray: 7833753, lightslategrey: 7833753, lightsteelblue: 11584734, lightyellow: 16777184, lime: 65280, limegreen: 3329330, linen: 16445670, magenta: 16711935, maroon: 8388608, mediumaquamarine: 6737322, mediumblue: 205, mediumorchid: 12211667, mediumpurple: 9662683, mediumseagreen: 3978097, mediumslateblue: 8087790, mediumspringgreen: 64154, mediumturquoise: 4772300, mediumvioletred: 13047173, midnightblue: 1644912, mintcream: 16121850, mistyrose: 16770273, moccasin: 16770229, navajowhite: 16768685, navy: 128, oldlace: 16643558, olive: 8421376, olivedrab: 7048739, orange: 16753920, orangered: 16729344, orchid: 14315734, palegoldenrod: 15657130, palegreen: 10025880, paleturquoise: 11529966, palevioletred: 14381203, papayawhip: 16773077, peachpuff: 16767673, peru: 13468991, pink: 16761035, plum: 14524637, powderblue: 11591910, purple: 8388736, rebeccapurple: 6697881, red: 16711680, rosybrown: 12357519, royalblue: 4286945, saddlebrown: 9127187, salmon: 16416882, sandybrown: 16032864, seagreen: 3050327, seashell: 16774638, sienna: 10506797, silver: 12632256, skyblue: 8900331, slateblue: 6970061, slategray: 7372944, slategrey: 7372944, snow: 16775930, springgreen: 65407, steelblue: 4620980, tan: 13808780, teal: 32896, thistle: 14204888, tomato: 16737095, turquoise: 4251856, violet: 15631086, wheat: 16113331, white: 16777215, whitesmoke: 16119285, yellow: 16776960, yellowgreen: 10145074 };
var ve = { h: 0, s: 0, l: 0 };
var Ms = { h: 0, s: 0, l: 0 };
function sr(h36, t, e) {
  return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? h36 + (t - h36) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? h36 + (t - h36) * 6 * (2 / 3 - e) : h36;
}
var V = class {
  constructor(t, e, i) {
    return this.isColor = true, this.r = 1, this.g = 1, this.b = 1, this.set(t, e, i);
  }
  set(t, e, i) {
    if (e === void 0 && i === void 0) {
      let s = t;
      s && s.isColor ? this.copy(s) : typeof s == "number" ? this.setHex(s) : typeof s == "string" && this.setStyle(s);
    } else
      this.setRGB(t, e, i);
    return this;
  }
  setScalar(t) {
    return this.r = t, this.g = t, this.b = t, this;
  }
  setHex(t, e = Nt) {
    return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, Ft.colorSpaceToWorking(this, e), this;
  }
  setRGB(t, e, i, s = Ft.workingColorSpace) {
    return this.r = t, this.g = e, this.b = i, Ft.colorSpaceToWorking(this, s), this;
  }
  setHSL(t, e, i, s = Ft.workingColorSpace) {
    if (t = na(t, 1), e = N(e, 0, 1), i = N(i, 0, 1), e === 0)
      this.r = this.g = this.b = i;
    else {
      let n = i <= 0.5 ? i * (1 + e) : i + e - i * e, r = 2 * i - n;
      this.r = sr(r, n, t + 1 / 3), this.g = sr(r, n, t), this.b = sr(r, n, t - 1 / 3);
    }
    return Ft.colorSpaceToWorking(this, s), this;
  }
  setStyle(t, e = Nt) {
    function i(n) {
      n !== void 0 && parseFloat(n) < 1 && E("Color: Alpha component of " + t + " will be ignored.");
    }
    let s;
    if (s = /^(\w+)\(([^\)]*)\)/.exec(t)) {
      let n, r = s[1], o = s[2];
      switch (r) {
        case "rgb":
        case "rgba":
          if (n = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return i(n[4]), this.setRGB(Math.min(255, parseInt(n[1], 10)) / 255, Math.min(255, parseInt(n[2], 10)) / 255, Math.min(255, parseInt(n[3], 10)) / 255, e);
          if (n = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return i(n[4]), this.setRGB(Math.min(100, parseInt(n[1], 10)) / 100, Math.min(100, parseInt(n[2], 10)) / 100, Math.min(100, parseInt(n[3], 10)) / 100, e);
          break;
        case "hsl":
        case "hsla":
          if (n = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return i(n[4]), this.setHSL(parseFloat(n[1]) / 360, parseFloat(n[2]) / 100, parseFloat(n[3]) / 100, e);
          break;
        default:
          E("Color: Unknown color model " + t);
      }
    } else if (s = /^\#([A-Fa-f\d]+)$/.exec(t)) {
      let n = s[1], r = n.length;
      if (r === 3)
        return this.setRGB(parseInt(n.charAt(0), 16) / 15, parseInt(n.charAt(1), 16) / 15, parseInt(n.charAt(2), 16) / 15, e);
      if (r === 6)
        return this.setHex(parseInt(n, 16), e);
      E("Color: Invalid hex color " + t);
    } else if (t && t.length > 0)
      return this.setColorName(t, e);
    return this;
  }
  setColorName(t, e = Nt) {
    let i = Xl[t.toLowerCase()];
    return i !== void 0 ? this.setHex(i, e) : E("Color: Unknown color " + t), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(t) {
    return this.r = t.r, this.g = t.g, this.b = t.b, this;
  }
  copySRGBToLinear(t) {
    return this.r = ye(t.r), this.g = ye(t.g), this.b = ye(t.b), this;
  }
  copyLinearToSRGB(t) {
    return this.r = vi(t.r), this.g = vi(t.g), this.b = vi(t.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(t = Nt) {
    return Ft.workingToColorSpace(yt.copy(this), t), Math.round(N(yt.r * 255, 0, 255)) * 65536 + Math.round(N(yt.g * 255, 0, 255)) * 256 + Math.round(N(yt.b * 255, 0, 255));
  }
  getHexString(t = Nt) {
    return ("000000" + this.getHex(t).toString(16)).slice(-6);
  }
  getHSL(t, e = Ft.workingColorSpace) {
    Ft.workingToColorSpace(yt.copy(this), e);
    let i = yt.r, s = yt.g, n = yt.b, r = Math.max(i, s, n), o = Math.min(i, s, n), a, l, c = (o + r) / 2;
    if (o === r)
      a = 0, l = 0;
    else {
      let u = r - o;
      switch (l = c <= 0.5 ? u / (r + o) : u / (2 - r - o), r) {
        case i:
          a = (s - n) / u + (s < n ? 6 : 0);
          break;
        case s:
          a = (n - i) / u + 2;
          break;
        case n:
          a = (i - s) / u + 4;
          break;
      }
      a /= 6;
    }
    return t.h = a, t.s = l, t.l = c, t;
  }
  getRGB(t, e = Ft.workingColorSpace) {
    return Ft.workingToColorSpace(yt.copy(this), e), t.r = yt.r, t.g = yt.g, t.b = yt.b, t;
  }
  getStyle(t = Nt) {
    Ft.workingToColorSpace(yt.copy(this), t);
    let e = yt.r, i = yt.g, s = yt.b;
    return t !== Nt ? `color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})` : `rgb(${Math.round(e * 255)},${Math.round(i * 255)},${Math.round(s * 255)})`;
  }
  offsetHSL(t, e, i) {
    return this.getHSL(ve), this.setHSL(ve.h + t, ve.s + e, ve.l + i);
  }
  add(t) {
    return this.r += t.r, this.g += t.g, this.b += t.b, this;
  }
  addColors(t, e) {
    return this.r = t.r + e.r, this.g = t.g + e.g, this.b = t.b + e.b, this;
  }
  addScalar(t) {
    return this.r += t, this.g += t, this.b += t, this;
  }
  sub(t) {
    return this.r = Math.max(0, this.r - t.r), this.g = Math.max(0, this.g - t.g), this.b = Math.max(0, this.b - t.b), this;
  }
  multiply(t) {
    return this.r *= t.r, this.g *= t.g, this.b *= t.b, this;
  }
  multiplyScalar(t) {
    return this.r *= t, this.g *= t, this.b *= t, this;
  }
  lerp(t, e) {
    return this.r += (t.r - this.r) * e, this.g += (t.g - this.g) * e, this.b += (t.b - this.b) * e, this;
  }
  lerpColors(t, e, i) {
    return this.r = t.r + (e.r - t.r) * i, this.g = t.g + (e.g - t.g) * i, this.b = t.b + (e.b - t.b) * i, this;
  }
  lerpHSL(t, e) {
    this.getHSL(ve), t.getHSL(Ms);
    let i = Zi(ve.h, Ms.h, e), s = Zi(ve.s, Ms.s, e), n = Zi(ve.l, Ms.l, e);
    return this.setHSL(i, s, n), this;
  }
  setFromVector3(t) {
    return this.r = t.x, this.g = t.y, this.b = t.z, this;
  }
  applyMatrix3(t) {
    let e = this.r, i = this.g, s = this.b, n = t.elements;
    return this.r = n[0] * e + n[3] * i + n[6] * s, this.g = n[1] * e + n[4] * i + n[7] * s, this.b = n[2] * e + n[5] * i + n[8] * s, this;
  }
  equals(t) {
    return t.r === this.r && t.g === this.g && t.b === this.b;
  }
  fromArray(t, e = 0) {
    return this.r = t[e], this.g = t[e + 1], this.b = t[e + 2], this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this.r, t[e + 1] = this.g, t[e + 2] = this.b, t;
  }
  fromBufferAttribute(t, e) {
    return this.r = t.getX(e), this.g = t.getY(e), this.b = t.getZ(e), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
};
var yt = new V();
V.NAMES = Xl;
var qu = 0;
var ft = class extends Kt {
  constructor() {
    super(), this.isMaterial = true, Object.defineProperty(this, "id", { value: qu++ }), this.uuid = Bt(), this.name = "", this.type = "Material", this.blending = ma, this.side = vr, this.vertexColors = false, this.opacity = 1, this.transparent = false, this.alphaHash = false, this.blendSrc = ga, this.blendDst = xa, this.blendEquation = ya, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new V(0, 0, 0), this.blendAlpha = 0, this.depthFunc = ba, this.depthTest = true, this.depthWrite = true, this.stencilWriteMask = 255, this.stencilFunc = va, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Ke, this.stencilZFail = Ke, this.stencilZPass = Ke, this.stencilWrite = false, this.clippingPlanes = null, this.clipIntersection = false, this.clipShadows = false, this.shadowSide = null, this.colorWrite = true, this.precision = null, this.polygonOffset = false, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = false, this.alphaToCoverage = false, this.premultipliedAlpha = false, this.forceSinglePass = false, this.allowOverride = true, this.visible = true, this.toneMapped = true, this.userData = {}, this.version = 0, this._alphaTest = 0;
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(t) {
    this._alphaTest > 0 != t > 0 && this.version++, this._alphaTest = t;
  }
  onBeforeRender() {
  }
  onBeforeCompile() {
  }
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(t) {
    if (t !== void 0)
      for (let e in t) {
        let i = t[e];
        if (i === void 0) {
          E(`Material: parameter '${e}' has value of undefined.`);
          continue;
        }
        let s = this[e];
        if (s === void 0) {
          E(`Material: '${e}' is not a property of THREE.${this.type}.`);
          continue;
        }
        s && s.isColor ? s.set(i) : s && s.isVector3 && i && i.isVector3 ? s.copy(i) : this[e] = i;
      }
  }
  toJSON(t) {
    let e = t === void 0 || typeof t == "string";
    e && (t = { textures: {}, images: {} });
    let i = { metadata: { version: 4.7, type: "Material", generator: "Material.toJSON" } };
    i.uuid = this.uuid, i.type = this.type, this.name !== "" && (i.name = this.name), this.color && this.color.isColor && (i.color = this.color.getHex()), this.roughness !== void 0 && (i.roughness = this.roughness), this.metalness !== void 0 && (i.metalness = this.metalness), this.sheen !== void 0 && (i.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (i.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (i.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (i.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (i.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (i.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (i.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (i.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (i.shininess = this.shininess), this.clearcoat !== void 0 && (i.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (i.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (i.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (i.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (i.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, i.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.sheenColorMap && this.sheenColorMap.isTexture && (i.sheenColorMap = this.sheenColorMap.toJSON(t).uuid), this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture && (i.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(t).uuid), this.dispersion !== void 0 && (i.dispersion = this.dispersion), this.iridescence !== void 0 && (i.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (i.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (i.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (i.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (i.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (i.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (i.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (i.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (i.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (i.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (i.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (i.lightMap = this.lightMap.toJSON(t).uuid, i.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (i.aoMap = this.aoMap.toJSON(t).uuid, i.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (i.bumpMap = this.bumpMap.toJSON(t).uuid, i.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (i.normalMap = this.normalMap.toJSON(t).uuid, i.normalMapType = this.normalMapType, i.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (i.displacementMap = this.displacementMap.toJSON(t).uuid, i.displacementScale = this.displacementScale, i.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (i.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (i.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (i.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (i.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (i.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (i.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (i.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (i.combine = this.combine)), this.envMapRotation !== void 0 && (i.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (i.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (i.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (i.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (i.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (i.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (i.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (i.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (i.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (i.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (i.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (i.size = this.size), this.shadowSide !== null && (i.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (i.sizeAttenuation = this.sizeAttenuation), this.blending !== ma && (i.blending = this.blending), this.side !== vr && (i.side = this.side), this.vertexColors === true && (i.vertexColors = true), this.opacity < 1 && (i.opacity = this.opacity), this.transparent === true && (i.transparent = true), this.blendSrc !== ga && (i.blendSrc = this.blendSrc), this.blendDst !== xa && (i.blendDst = this.blendDst), this.blendEquation !== ya && (i.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (i.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (i.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (i.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (i.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (i.blendAlpha = this.blendAlpha), this.depthFunc !== ba && (i.depthFunc = this.depthFunc), this.depthTest === false && (i.depthTest = this.depthTest), this.depthWrite === false && (i.depthWrite = this.depthWrite), this.colorWrite === false && (i.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (i.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== va && (i.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (i.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (i.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Ke && (i.stencilFail = this.stencilFail), this.stencilZFail !== Ke && (i.stencilZFail = this.stencilZFail), this.stencilZPass !== Ke && (i.stencilZPass = this.stencilZPass), this.stencilWrite === true && (i.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (i.rotation = this.rotation), this.polygonOffset === true && (i.polygonOffset = true), this.polygonOffsetFactor !== 0 && (i.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (i.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (i.linewidth = this.linewidth), this.dashSize !== void 0 && (i.dashSize = this.dashSize), this.gapSize !== void 0 && (i.gapSize = this.gapSize), this.scale !== void 0 && (i.scale = this.scale), this.dithering === true && (i.dithering = true), this.alphaTest > 0 && (i.alphaTest = this.alphaTest), this.alphaHash === true && (i.alphaHash = true), this.alphaToCoverage === true && (i.alphaToCoverage = true), this.premultipliedAlpha === true && (i.premultipliedAlpha = true), this.forceSinglePass === true && (i.forceSinglePass = true), this.allowOverride === false && (i.allowOverride = false), this.wireframe === true && (i.wireframe = true), this.wireframeLinewidth > 1 && (i.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (i.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (i.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === true && (i.flatShading = true), this.visible === false && (i.visible = false), this.toneMapped === false && (i.toneMapped = false), this.fog === false && (i.fog = false), Object.keys(this.userData).length > 0 && (i.userData = this.userData);
    function s(n) {
      let r = [];
      for (let o in n) {
        let a = n[o];
        delete a.metadata, r.push(a);
      }
      return r;
    }
    if (e) {
      let n = s(t.textures), r = s(t.images);
      n.length > 0 && (i.textures = n), r.length > 0 && (i.images = r);
    }
    return i;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    this.name = t.name, this.blending = t.blending, this.side = t.side, this.vertexColors = t.vertexColors, this.opacity = t.opacity, this.transparent = t.transparent, this.blendSrc = t.blendSrc, this.blendDst = t.blendDst, this.blendEquation = t.blendEquation, this.blendSrcAlpha = t.blendSrcAlpha, this.blendDstAlpha = t.blendDstAlpha, this.blendEquationAlpha = t.blendEquationAlpha, this.blendColor.copy(t.blendColor), this.blendAlpha = t.blendAlpha, this.depthFunc = t.depthFunc, this.depthTest = t.depthTest, this.depthWrite = t.depthWrite, this.stencilWriteMask = t.stencilWriteMask, this.stencilFunc = t.stencilFunc, this.stencilRef = t.stencilRef, this.stencilFuncMask = t.stencilFuncMask, this.stencilFail = t.stencilFail, this.stencilZFail = t.stencilZFail, this.stencilZPass = t.stencilZPass, this.stencilWrite = t.stencilWrite;
    let e = t.clippingPlanes, i = null;
    if (e !== null) {
      let s = e.length;
      i = new Array(s);
      for (let n = 0; n !== s; ++n)
        i[n] = e[n].clone();
    }
    return this.clippingPlanes = i, this.clipIntersection = t.clipIntersection, this.clipShadows = t.clipShadows, this.shadowSide = t.shadowSide, this.colorWrite = t.colorWrite, this.precision = t.precision, this.polygonOffset = t.polygonOffset, this.polygonOffsetFactor = t.polygonOffsetFactor, this.polygonOffsetUnits = t.polygonOffsetUnits, this.dithering = t.dithering, this.alphaTest = t.alphaTest, this.alphaHash = t.alphaHash, this.alphaToCoverage = t.alphaToCoverage, this.premultipliedAlpha = t.premultipliedAlpha, this.forceSinglePass = t.forceSinglePass, this.allowOverride = t.allowOverride, this.visible = t.visible, this.toneMapped = t.toneMapped, this.userData = JSON.parse(JSON.stringify(t.userData)), this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(t) {
    t === true && this.version++;
  }
};
var ze = class extends ft {
  constructor(t) {
    super(), this.isMeshBasicMaterial = true, this.type = "MeshBasicMaterial", this.color = new V(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new ee(), this.combine = ta, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = false, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this;
  }
};
var pe = Ju();
function Ju() {
  let h36 = new ArrayBuffer(4), t = new Float32Array(h36), e = new Uint32Array(h36), i = new Uint32Array(512), s = new Uint32Array(512);
  for (let a = 0; a < 256; ++a) {
    let l = a - 127;
    l < -27 ? (i[a] = 0, i[a | 256] = 32768, s[a] = 24, s[a | 256] = 24) : l < -14 ? (i[a] = 1024 >> -l - 14, i[a | 256] = 1024 >> -l - 14 | 32768, s[a] = -l - 1, s[a | 256] = -l - 1) : l <= 15 ? (i[a] = l + 15 << 10, i[a | 256] = l + 15 << 10 | 32768, s[a] = 13, s[a | 256] = 13) : l < 128 ? (i[a] = 31744, i[a | 256] = 64512, s[a] = 24, s[a | 256] = 24) : (i[a] = 31744, i[a | 256] = 64512, s[a] = 13, s[a | 256] = 13);
  }
  let n = new Uint32Array(2048), r = new Uint32Array(64), o = new Uint32Array(64);
  for (let a = 1; a < 1024; ++a) {
    let l = a << 13, c = 0;
    for (; (l & 8388608) === 0; )
      l <<= 1, c -= 8388608;
    l &= -8388609, c += 947912704, n[a] = l | c;
  }
  for (let a = 1024; a < 2048; ++a)
    n[a] = 939524096 + (a - 1024 << 13);
  for (let a = 1; a < 31; ++a)
    r[a] = a << 23;
  r[31] = 1199570944, r[32] = 2147483648;
  for (let a = 33; a < 63; ++a)
    r[a] = 2147483648 + (a - 32 << 23);
  r[63] = 3347054592;
  for (let a = 1; a < 64; ++a)
    a !== 32 && (o[a] = 1024);
  return { floatView: t, uint32View: e, baseTable: i, shiftTable: s, mantissaTable: n, exponentTable: r, offsetTable: o };
}
var ot = new w();
var _s = new I();
var Gu = 0;
var j = class {
  constructor(t, e, i = false) {
    if (Array.isArray(t))
      throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = true, Object.defineProperty(this, "id", { value: Gu++ }), this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = i, this.usage = rn, this.updateRanges = [], this.gpuType = Si, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(t) {
    t === true && this.version++;
  }
  setUsage(t) {
    return this.usage = t, this;
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(t) {
    return this.name = t.name, this.array = new t.array.constructor(t.array), this.itemSize = t.itemSize, this.count = t.count, this.normalized = t.normalized, this.usage = t.usage, this.gpuType = t.gpuType, this;
  }
  copyAt(t, e, i) {
    t *= this.itemSize, i *= e.itemSize;
    for (let s = 0, n = this.itemSize; s < n; s++)
      this.array[t + s] = e.array[i + s];
    return this;
  }
  copyArray(t) {
    return this.array.set(t), this;
  }
  applyMatrix3(t) {
    if (this.itemSize === 2)
      for (let e = 0, i = this.count; e < i; e++)
        _s.fromBufferAttribute(this, e), _s.applyMatrix3(t), this.setXY(e, _s.x, _s.y);
    else if (this.itemSize === 3)
      for (let e = 0, i = this.count; e < i; e++)
        ot.fromBufferAttribute(this, e), ot.applyMatrix3(t), this.setXYZ(e, ot.x, ot.y, ot.z);
    return this;
  }
  applyMatrix4(t) {
    for (let e = 0, i = this.count; e < i; e++)
      ot.fromBufferAttribute(this, e), ot.applyMatrix4(t), this.setXYZ(e, ot.x, ot.y, ot.z);
    return this;
  }
  applyNormalMatrix(t) {
    for (let e = 0, i = this.count; e < i; e++)
      ot.fromBufferAttribute(this, e), ot.applyNormalMatrix(t), this.setXYZ(e, ot.x, ot.y, ot.z);
    return this;
  }
  transformDirection(t) {
    for (let e = 0, i = this.count; e < i; e++)
      ot.fromBufferAttribute(this, e), ot.transformDirection(t), this.setXYZ(e, ot.x, ot.y, ot.z);
    return this;
  }
  set(t, e = 0) {
    return this.array.set(t, e), this;
  }
  getComponent(t, e) {
    let i = this.array[t * this.itemSize + e];
    return this.normalized && (i = wt(i, this.array)), i;
  }
  setComponent(t, e, i) {
    return this.normalized && (i = L(i, this.array)), this.array[t * this.itemSize + e] = i, this;
  }
  getX(t) {
    let e = this.array[t * this.itemSize];
    return this.normalized && (e = wt(e, this.array)), e;
  }
  setX(t, e) {
    return this.normalized && (e = L(e, this.array)), this.array[t * this.itemSize] = e, this;
  }
  getY(t) {
    let e = this.array[t * this.itemSize + 1];
    return this.normalized && (e = wt(e, this.array)), e;
  }
  setY(t, e) {
    return this.normalized && (e = L(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
  }
  getZ(t) {
    let e = this.array[t * this.itemSize + 2];
    return this.normalized && (e = wt(e, this.array)), e;
  }
  setZ(t, e) {
    return this.normalized && (e = L(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
  }
  getW(t) {
    let e = this.array[t * this.itemSize + 3];
    return this.normalized && (e = wt(e, this.array)), e;
  }
  setW(t, e) {
    return this.normalized && (e = L(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
  }
  setXY(t, e, i) {
    return t *= this.itemSize, this.normalized && (e = L(e, this.array), i = L(i, this.array)), this.array[t + 0] = e, this.array[t + 1] = i, this;
  }
  setXYZ(t, e, i, s) {
    return t *= this.itemSize, this.normalized && (e = L(e, this.array), i = L(i, this.array), s = L(s, this.array)), this.array[t + 0] = e, this.array[t + 1] = i, this.array[t + 2] = s, this;
  }
  setXYZW(t, e, i, s, n) {
    return t *= this.itemSize, this.normalized && (e = L(e, this.array), i = L(i, this.array), s = L(s, this.array), n = L(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = i, this.array[t + 2] = s, this.array[t + 3] = n, this;
  }
  onUpload(t) {
    return this.onUploadCallback = t, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    let t = { itemSize: this.itemSize, type: this.array.constructor.name, array: Array.from(this.array), normalized: this.normalized };
    return this.name !== "" && (t.name = this.name), this.usage !== rn && (t.usage = this.usage), t;
  }
};
var Fr = class extends j {
  constructor(t, e, i) {
    super(new Uint16Array(t), e, i);
  }
};
var Br = class extends j {
  constructor(t, e, i) {
    super(new Uint32Array(t), e, i);
  }
};
var B = class extends j {
  constructor(t, e, i) {
    super(new Float32Array(t), e, i);
  }
};
var Xu = 0;
var Et = new U();
var nr = new H();
var li = new w();
var zt = new pt();
var Vi = new pt();
var lt = new w();
var q = class h10 extends Kt {
  constructor() {
    super(), this.isBufferGeometry = true, Object.defineProperty(this, "id", { value: Xu++ }), this.uuid = Bt(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.indirectOffset = 0, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = false, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(t) {
    return Array.isArray(t) ? this.index = new (mu(t) ? Br : Fr)(t, 1) : this.index = t, this;
  }
  setIndirect(t, e = 0) {
    return this.indirect = t, this.indirectOffset = e, this;
  }
  getIndirect() {
    return this.indirect;
  }
  getAttribute(t) {
    return this.attributes[t];
  }
  setAttribute(t, e) {
    return this.attributes[t] = e, this;
  }
  deleteAttribute(t) {
    return delete this.attributes[t], this;
  }
  hasAttribute(t) {
    return this.attributes[t] !== void 0;
  }
  addGroup(t, e, i = 0) {
    this.groups.push({ start: t, count: e, materialIndex: i });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(t, e) {
    this.drawRange.start = t, this.drawRange.count = e;
  }
  applyMatrix4(t) {
    let e = this.attributes.position;
    e !== void 0 && (e.applyMatrix4(t), e.needsUpdate = true);
    let i = this.attributes.normal;
    if (i !== void 0) {
      let n = new te().getNormalMatrix(t);
      i.applyNormalMatrix(n), i.needsUpdate = true;
    }
    let s = this.attributes.tangent;
    return s !== void 0 && (s.transformDirection(t), s.needsUpdate = true), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(t) {
    return Et.makeRotationFromQuaternion(t), this.applyMatrix4(Et), this;
  }
  rotateX(t) {
    return Et.makeRotationX(t), this.applyMatrix4(Et), this;
  }
  rotateY(t) {
    return Et.makeRotationY(t), this.applyMatrix4(Et), this;
  }
  rotateZ(t) {
    return Et.makeRotationZ(t), this.applyMatrix4(Et), this;
  }
  translate(t, e, i) {
    return Et.makeTranslation(t, e, i), this.applyMatrix4(Et), this;
  }
  scale(t, e, i) {
    return Et.makeScale(t, e, i), this.applyMatrix4(Et), this;
  }
  lookAt(t) {
    return nr.lookAt(t), nr.updateMatrix(), this.applyMatrix4(nr.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(li).negate(), this.translate(li.x, li.y, li.z), this;
  }
  setFromPoints(t) {
    let e = this.getAttribute("position");
    if (e === void 0) {
      let i = [];
      for (let s = 0, n = t.length; s < n; s++) {
        let r = t[s];
        i.push(r.x, r.y, r.z || 0);
      }
      this.setAttribute("position", new B(i, 3));
    } else {
      let i = Math.min(t.length, e.count);
      for (let s = 0; s < i; s++) {
        let n = t[s];
        e.setXYZ(s, n.x, n.y, n.z || 0);
      }
      t.length > e.count && E("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), e.needsUpdate = true;
    }
    return this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new pt());
    let t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      X("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new w(-1 / 0, -1 / 0, -1 / 0), new w(1 / 0, 1 / 0, 1 / 0));
      return;
    }
    if (t !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(t), e)
        for (let i = 0, s = e.length; i < s; i++) {
          let n = e[i];
          zt.setFromBufferAttribute(n), this.morphTargetsRelative ? (lt.addVectors(this.boundingBox.min, zt.min), this.boundingBox.expandByPoint(lt), lt.addVectors(this.boundingBox.max, zt.max), this.boundingBox.expandByPoint(lt)) : (this.boundingBox.expandByPoint(zt.min), this.boundingBox.expandByPoint(zt.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && X('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new ct());
    let t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      X("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new w(), 1 / 0);
      return;
    }
    if (t) {
      let i = this.boundingSphere.center;
      if (zt.setFromBufferAttribute(t), e)
        for (let n = 0, r = e.length; n < r; n++) {
          let o = e[n];
          Vi.setFromBufferAttribute(o), this.morphTargetsRelative ? (lt.addVectors(zt.min, Vi.min), zt.expandByPoint(lt), lt.addVectors(zt.max, Vi.max), zt.expandByPoint(lt)) : (zt.expandByPoint(Vi.min), zt.expandByPoint(Vi.max));
        }
      zt.getCenter(i);
      let s = 0;
      for (let n = 0, r = t.count; n < r; n++)
        lt.fromBufferAttribute(t, n), s = Math.max(s, i.distanceToSquared(lt));
      if (e)
        for (let n = 0, r = e.length; n < r; n++) {
          let o = e[n], a = this.morphTargetsRelative;
          for (let l = 0, c = o.count; l < c; l++)
            lt.fromBufferAttribute(o, l), a && (li.fromBufferAttribute(t, l), lt.add(li)), s = Math.max(s, i.distanceToSquared(lt));
        }
      this.boundingSphere.radius = Math.sqrt(s), isNaN(this.boundingSphere.radius) && X('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
    }
  }
  computeTangents() {
    let t = this.index, e = this.attributes;
    if (t === null || e.position === void 0 || e.normal === void 0 || e.uv === void 0) {
      X("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    let i = e.position, s = e.normal, n = e.uv;
    this.hasAttribute("tangent") === false && this.setAttribute("tangent", new j(new Float32Array(4 * i.count), 4));
    let r = this.getAttribute("tangent"), o = [], a = [];
    for (let S = 0; S < i.count; S++)
      o[S] = new w(), a[S] = new w();
    let l = new w(), c = new w(), u = new w(), d = new I(), p = new I(), f = new I(), m = new w(), g2 = new w();
    function y3(S, T, C) {
      l.fromBufferAttribute(i, S), c.fromBufferAttribute(i, T), u.fromBufferAttribute(i, C), d.fromBufferAttribute(n, S), p.fromBufferAttribute(n, T), f.fromBufferAttribute(n, C), c.sub(l), u.sub(l), p.sub(d), f.sub(d);
      let P = 1 / (p.x * f.y - f.x * p.y);
      isFinite(P) && (m.copy(c).multiplyScalar(f.y).addScaledVector(u, -p.y).multiplyScalar(P), g2.copy(u).multiplyScalar(p.x).addScaledVector(c, -f.x).multiplyScalar(P), o[S].add(m), o[T].add(m), o[C].add(m), a[S].add(g2), a[T].add(g2), a[C].add(g2));
    }
    let x = this.groups;
    x.length === 0 && (x = [{ start: 0, count: t.count }]);
    for (let S = 0, T = x.length; S < T; ++S) {
      let C = x[S], P = C.start, D2 = C.count;
      for (let J = P, $ = P + D2; J < $; J += 3)
        y3(t.getX(J + 0), t.getX(J + 1), t.getX(J + 2));
    }
    let b = new w(), M = new w(), _2 = new w(), v = new w();
    function A(S) {
      _2.fromBufferAttribute(s, S), v.copy(_2);
      let T = o[S];
      b.copy(T), b.sub(_2.multiplyScalar(_2.dot(T))).normalize(), M.crossVectors(v, T);
      let P = M.dot(a[S]) < 0 ? -1 : 1;
      r.setXYZW(S, b.x, b.y, b.z, P);
    }
    for (let S = 0, T = x.length; S < T; ++S) {
      let C = x[S], P = C.start, D2 = C.count;
      for (let J = P, $ = P + D2; J < $; J += 3)
        A(t.getX(J + 0)), A(t.getX(J + 1)), A(t.getX(J + 2));
    }
  }
  computeVertexNormals() {
    let t = this.index, e = this.getAttribute("position");
    if (e !== void 0) {
      let i = this.getAttribute("normal");
      if (i === void 0)
        i = new j(new Float32Array(e.count * 3), 3), this.setAttribute("normal", i);
      else
        for (let d = 0, p = i.count; d < p; d++)
          i.setXYZ(d, 0, 0, 0);
      let s = new w(), n = new w(), r = new w(), o = new w(), a = new w(), l = new w(), c = new w(), u = new w();
      if (t)
        for (let d = 0, p = t.count; d < p; d += 3) {
          let f = t.getX(d + 0), m = t.getX(d + 1), g2 = t.getX(d + 2);
          s.fromBufferAttribute(e, f), n.fromBufferAttribute(e, m), r.fromBufferAttribute(e, g2), c.subVectors(r, n), u.subVectors(s, n), c.cross(u), o.fromBufferAttribute(i, f), a.fromBufferAttribute(i, m), l.fromBufferAttribute(i, g2), o.add(c), a.add(c), l.add(c), i.setXYZ(f, o.x, o.y, o.z), i.setXYZ(m, a.x, a.y, a.z), i.setXYZ(g2, l.x, l.y, l.z);
        }
      else
        for (let d = 0, p = e.count; d < p; d += 3)
          s.fromBufferAttribute(e, d + 0), n.fromBufferAttribute(e, d + 1), r.fromBufferAttribute(e, d + 2), c.subVectors(r, n), u.subVectors(s, n), c.cross(u), i.setXYZ(d + 0, c.x, c.y, c.z), i.setXYZ(d + 1, c.x, c.y, c.z), i.setXYZ(d + 2, c.x, c.y, c.z);
      this.normalizeNormals(), i.needsUpdate = true;
    }
  }
  normalizeNormals() {
    let t = this.attributes.normal;
    for (let e = 0, i = t.count; e < i; e++)
      lt.fromBufferAttribute(t, e), lt.normalize(), t.setXYZ(e, lt.x, lt.y, lt.z);
  }
  toNonIndexed() {
    function t(o, a) {
      let l = o.array, c = o.itemSize, u = o.normalized, d = new l.constructor(a.length * c), p = 0, f = 0;
      for (let m = 0, g2 = a.length; m < g2; m++) {
        o.isInterleavedBufferAttribute ? p = a[m] * o.data.stride + o.offset : p = a[m] * c;
        for (let y3 = 0; y3 < c; y3++)
          d[f++] = l[p++];
      }
      return new j(d, c, u);
    }
    if (this.index === null)
      return E("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    let e = new h10(), i = this.index.array, s = this.attributes;
    for (let o in s) {
      let a = s[o], l = t(a, i);
      e.setAttribute(o, l);
    }
    let n = this.morphAttributes;
    for (let o in n) {
      let a = [], l = n[o];
      for (let c = 0, u = l.length; c < u; c++) {
        let d = l[c], p = t(d, i);
        a.push(p);
      }
      e.morphAttributes[o] = a;
    }
    e.morphTargetsRelative = this.morphTargetsRelative;
    let r = this.groups;
    for (let o = 0, a = r.length; o < a; o++) {
      let l = r[o];
      e.addGroup(l.start, l.count, l.materialIndex);
    }
    return e;
  }
  toJSON() {
    let t = { metadata: { version: 4.7, type: "BufferGeometry", generator: "BufferGeometry.toJSON" } };
    if (t.uuid = this.uuid, t.type = this.type, this.name !== "" && (t.name = this.name), Object.keys(this.userData).length > 0 && (t.userData = this.userData), this.parameters !== void 0) {
      let a = this.parameters;
      for (let l in a)
        a[l] !== void 0 && (t[l] = a[l]);
      return t;
    }
    t.data = { attributes: {} };
    let e = this.index;
    e !== null && (t.data.index = { type: e.array.constructor.name, array: Array.prototype.slice.call(e.array) });
    let i = this.attributes;
    for (let a in i) {
      let l = i[a];
      t.data.attributes[a] = l.toJSON(t.data);
    }
    let s = {}, n = false;
    for (let a in this.morphAttributes) {
      let l = this.morphAttributes[a], c = [];
      for (let u = 0, d = l.length; u < d; u++) {
        let p = l[u];
        c.push(p.toJSON(t.data));
      }
      c.length > 0 && (s[a] = c, n = true);
    }
    n && (t.data.morphAttributes = s, t.data.morphTargetsRelative = this.morphTargetsRelative);
    let r = this.groups;
    r.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(r)));
    let o = this.boundingSphere;
    return o !== null && (t.data.boundingSphere = o.toJSON()), t;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    let e = {};
    this.name = t.name;
    let i = t.index;
    i !== null && this.setIndex(i.clone());
    let s = t.attributes;
    for (let l in s) {
      let c = s[l];
      this.setAttribute(l, c.clone(e));
    }
    let n = t.morphAttributes;
    for (let l in n) {
      let c = [], u = n[l];
      for (let d = 0, p = u.length; d < p; d++)
        c.push(u[d].clone(e));
      this.morphAttributes[l] = c;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    let r = t.groups;
    for (let l = 0, c = r.length; l < c; l++) {
      let u = r[l];
      this.addGroup(u.start, u.count, u.materialIndex);
    }
    let o = t.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    let a = t.boundingSphere;
    return a !== null && (this.boundingSphere = a.clone()), this.drawRange.start = t.drawRange.start, this.drawRange.count = t.drawRange.count, this.userData = t.userData, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
};
var Za = new U();
var Oe = new Ze();
var vs = new ct();
var Ya = new w();
var Ss = new w();
var As = new w();
var Ts = new w();
var rr = new w();
var Is = new w();
var $a = new w();
var Cs = new w();
var Pt = class extends H {
  constructor(t = new q(), e = new ze()) {
    super(), this.isMesh = true, this.type = "Mesh", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), t.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = t.morphTargetInfluences.slice()), t.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, t.morphTargetDictionary)), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  updateMorphTargets() {
    let e = this.geometry.morphAttributes, i = Object.keys(e);
    if (i.length > 0) {
      let s = e[i[0]];
      if (s !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let n = 0, r = s.length; n < r; n++) {
          let o = s[n].name || String(n);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = n;
        }
      }
    }
  }
  getVertexPosition(t, e) {
    let i = this.geometry, s = i.attributes.position, n = i.morphAttributes.position, r = i.morphTargetsRelative;
    e.fromBufferAttribute(s, t);
    let o = this.morphTargetInfluences;
    if (n && o) {
      Is.set(0, 0, 0);
      for (let a = 0, l = n.length; a < l; a++) {
        let c = o[a], u = n[a];
        c !== 0 && (rr.fromBufferAttribute(u, t), r ? Is.addScaledVector(rr, c) : Is.addScaledVector(rr.sub(e), c));
      }
      e.add(Is);
    }
    return e;
  }
  raycast(t, e) {
    let i = this.geometry, s = this.material, n = this.matrixWorld;
    s !== void 0 && (i.boundingSphere === null && i.computeBoundingSphere(), vs.copy(i.boundingSphere), vs.applyMatrix4(n), Oe.copy(t.ray).recast(t.near), !(vs.containsPoint(Oe.origin) === false && (Oe.intersectSphere(vs, Ya) === null || Oe.origin.distanceToSquared(Ya) > (t.far - t.near) ** 2)) && (Za.copy(n).invert(), Oe.copy(t.ray).applyMatrix4(Za), !(i.boundingBox !== null && Oe.intersectsBox(i.boundingBox) === false) && this._computeIntersections(t, e, Oe)));
  }
  _computeIntersections(t, e, i) {
    let s, n = this.geometry, r = this.material, o = n.index, a = n.attributes.position, l = n.attributes.uv, c = n.attributes.uv1, u = n.attributes.normal, d = n.groups, p = n.drawRange;
    if (o !== null)
      if (Array.isArray(r))
        for (let f = 0, m = d.length; f < m; f++) {
          let g2 = d[f], y3 = r[g2.materialIndex], x = Math.max(g2.start, p.start), b = Math.min(o.count, Math.min(g2.start + g2.count, p.start + p.count));
          for (let M = x, _2 = b; M < _2; M += 3) {
            let v = o.getX(M), A = o.getX(M + 1), S = o.getX(M + 2);
            s = zs(this, y3, t, i, l, c, u, v, A, S), s && (s.faceIndex = Math.floor(M / 3), s.face.materialIndex = g2.materialIndex, e.push(s));
          }
        }
      else {
        let f = Math.max(0, p.start), m = Math.min(o.count, p.start + p.count);
        for (let g2 = f, y3 = m; g2 < y3; g2 += 3) {
          let x = o.getX(g2), b = o.getX(g2 + 1), M = o.getX(g2 + 2);
          s = zs(this, r, t, i, l, c, u, x, b, M), s && (s.faceIndex = Math.floor(g2 / 3), e.push(s));
        }
      }
    else if (a !== void 0)
      if (Array.isArray(r))
        for (let f = 0, m = d.length; f < m; f++) {
          let g2 = d[f], y3 = r[g2.materialIndex], x = Math.max(g2.start, p.start), b = Math.min(a.count, Math.min(g2.start + g2.count, p.start + p.count));
          for (let M = x, _2 = b; M < _2; M += 3) {
            let v = M, A = M + 1, S = M + 2;
            s = zs(this, y3, t, i, l, c, u, v, A, S), s && (s.faceIndex = Math.floor(M / 3), s.face.materialIndex = g2.materialIndex, e.push(s));
          }
        }
      else {
        let f = Math.max(0, p.start), m = Math.min(a.count, p.start + p.count);
        for (let g2 = f, y3 = m; g2 < y3; g2 += 3) {
          let x = g2, b = g2 + 1, M = g2 + 2;
          s = zs(this, r, t, i, l, c, u, x, b, M), s && (s.faceIndex = Math.floor(g2 / 3), e.push(s));
        }
      }
  }
};
function Hu(h36, t, e, i, s, n, r, o) {
  let a;
  if (t.side === Ll ? a = i.intersectTriangle(r, n, s, true, o) : a = i.intersectTriangle(s, n, r, t.side === vr, o), a === null)
    return null;
  Cs.copy(o), Cs.applyMatrix4(h36.matrixWorld);
  let l = e.ray.origin.distanceTo(Cs);
  return l < e.near || l > e.far ? null : { distance: l, point: Cs.clone(), object: h36 };
}
function zs(h36, t, e, i, s, n, r, o, a, l) {
  h36.getVertexPosition(o, Ss), h36.getVertexPosition(a, As), h36.getVertexPosition(l, Ts);
  let c = Hu(h36, t, e, i, Ss, As, Ts, $a);
  if (c) {
    let u = new w();
    de.getBarycoord($a, Ss, As, Ts, u), s && (c.uv = de.getInterpolatedAttribute(s, o, a, l, u, new I())), n && (c.uv1 = de.getInterpolatedAttribute(n, o, a, l, u, new I())), r && (c.normal = de.getInterpolatedAttribute(r, o, a, l, u, new w()), c.normal.dot(i.direction) > 0 && c.normal.multiplyScalar(-1));
    let d = { a: o, b: a, c: l, normal: new w(), materialIndex: 0 };
    de.getNormal(Ss, As, Ts, d.normal), c.face = d, c.barycoord = u;
  }
  return c;
}
var cn = class h11 extends q {
  constructor(t = 1, e = 1, i = 1, s = 1, n = 1, r = 1) {
    super(), this.type = "BoxGeometry", this.parameters = { width: t, height: e, depth: i, widthSegments: s, heightSegments: n, depthSegments: r };
    let o = this;
    s = Math.floor(s), n = Math.floor(n), r = Math.floor(r);
    let a = [], l = [], c = [], u = [], d = 0, p = 0;
    f("z", "y", "x", -1, -1, i, e, t, r, n, 0), f("z", "y", "x", 1, -1, i, e, -t, r, n, 1), f("x", "z", "y", 1, 1, t, i, e, s, r, 2), f("x", "z", "y", 1, -1, t, i, -e, s, r, 3), f("x", "y", "z", 1, -1, t, e, i, s, n, 4), f("x", "y", "z", -1, -1, t, e, -i, s, n, 5), this.setIndex(a), this.setAttribute("position", new B(l, 3)), this.setAttribute("normal", new B(c, 3)), this.setAttribute("uv", new B(u, 2));
    function f(m, g2, y3, x, b, M, _2, v, A, S, T) {
      let C = M / A, P = _2 / S, D2 = M / 2, J = _2 / 2, $ = v / 2, Z2 = A + 1, at = S + 1, dt = 0, Ut2 = 0, et = new w();
      for (let rt = 0; rt < at; rt++) {
        let it = rt * P - J;
        for (let Wt2 = 0; Wt2 < Z2; Wt2++) {
          let Ot2 = Wt2 * C - D2;
          et[m] = Ot2 * x, et[g2] = it * b, et[y3] = $, l.push(et.x, et.y, et.z), et[m] = 0, et[g2] = 0, et[y3] = v > 0 ? 1 : -1, c.push(et.x, et.y, et.z), u.push(Wt2 / A), u.push(1 - rt / S), dt += 1;
        }
      }
      for (let rt = 0; rt < S; rt++)
        for (let it = 0; it < A; it++) {
          let Wt2 = d + it + Z2 * rt, Ot2 = d + it + Z2 * (rt + 1), Qe = d + (it + 1) + Z2 * (rt + 1), Ri = d + (it + 1) + Z2 * rt;
          a.push(Wt2, Ot2, Ri), a.push(Ot2, Qe, Ri), Ut2 += 6;
        }
      o.addGroup(p, Ut2, T), p += Ut2, d += dt;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h11(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
  }
};
function Nn(h36) {
  let t = {};
  for (let e in h36) {
    t[e] = {};
    for (let i in h36[e]) {
      let s = h36[e][i];
      s && (s.isColor || s.isMatrix3 || s.isMatrix4 || s.isVector2 || s.isVector3 || s.isVector4 || s.isTexture || s.isQuaternion) ? s.isRenderTargetTexture ? (E("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[e][i] = null) : t[e][i] = s.clone() : Array.isArray(s) ? t[e][i] = s.slice() : t[e][i] = s;
    }
  }
  return t;
}
function Zu(h36) {
  let t = {};
  for (let e = 0; e < h36.length; e++) {
    let i = Nn(h36[e]);
    for (let s in i)
      t[s] = i[s];
  }
  return t;
}
function Yu(h36) {
  let t = [];
  for (let e = 0; e < h36.length; e++)
    t.push(h36[e].clone());
  return t;
}
function cm(h36) {
  let t = h36.getRenderTarget();
  return t === null ? h36.outputColorSpace : t.isXRRenderTarget === true ? t.texture.colorSpace : Ft.workingColorSpace;
}
var um = { clone: Nn, merge: Zu };
var $u = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
var ju = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
var es = class extends ft {
  constructor(t) {
    super(), this.isShaderMaterial = true, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = $u, this.fragmentShader = ju, this.linewidth = 1, this.wireframe = false, this.wireframeLinewidth = 1, this.fog = false, this.lights = false, this.clipping = false, this.forceSinglePass = true, this.extensions = { clipCullDistance: false, multiDraw: false }, this.defaultAttributeValues = { color: [1, 1, 1], uv: [0, 0], uv1: [0, 0] }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = false, this.glslVersion = null, t !== void 0 && this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = Nn(t.uniforms), this.uniformsGroups = Yu(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this.defaultAttributeValues = Object.assign({}, t.defaultAttributeValues), this.index0AttributeName = t.index0AttributeName, this.uniformsNeedUpdate = t.uniformsNeedUpdate, this;
  }
  toJSON(t) {
    let e = super.toJSON(t);
    e.glslVersion = this.glslVersion, e.uniforms = {};
    for (let s in this.uniforms) {
      let r = this.uniforms[s].value;
      r && r.isTexture ? e.uniforms[s] = { type: "t", value: r.toJSON(t).uuid } : r && r.isColor ? e.uniforms[s] = { type: "c", value: r.getHex() } : r && r.isVector2 ? e.uniforms[s] = { type: "v2", value: r.toArray() } : r && r.isVector3 ? e.uniforms[s] = { type: "v3", value: r.toArray() } : r && r.isVector4 ? e.uniforms[s] = { type: "v4", value: r.toArray() } : r && r.isMatrix3 ? e.uniforms[s] = { type: "m3", value: r.toArray() } : r && r.isMatrix4 ? e.uniforms[s] = { type: "m4", value: r.toArray() } : e.uniforms[s] = { value: r };
    }
    Object.keys(this.defines).length > 0 && (e.defines = this.defines), e.vertexShader = this.vertexShader, e.fragmentShader = this.fragmentShader, e.lights = this.lights, e.clipping = this.clipping;
    let i = {};
    for (let s in this.extensions)
      this.extensions[s] === true && (i[s] = true);
    return Object.keys(i).length > 0 && (e.extensions = i), e;
  }
};
var is = class extends H {
  constructor() {
    super(), this.isCamera = true, this.type = "Camera", this.matrixWorldInverse = new U(), this.projectionMatrix = new U(), this.projectionMatrixInverse = new U(), this.coordinateSystem = jt, this._reversedDepth = false;
  }
  get reversedDepth() {
    return this._reversedDepth;
  }
  copy(t, e) {
    return super.copy(t, e), this.matrixWorldInverse.copy(t.matrixWorldInverse), this.projectionMatrix.copy(t.projectionMatrix), this.projectionMatrixInverse.copy(t.projectionMatrixInverse), this.coordinateSystem = t.coordinateSystem, this;
  }
  getWorldDirection(t) {
    return super.getWorldDirection(t).negate();
  }
  updateMatrixWorld(t) {
    super.updateMatrixWorld(t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(t, e) {
    super.updateWorldMatrix(t, e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
var Se = new w();
var ja = new I();
var Qa = new I();
var At = class extends is {
  constructor(t = 50, e = 1, i = 0.1, s = 2e3) {
    super(), this.isPerspectiveCamera = true, this.type = "PerspectiveCamera", this.fov = t, this.zoom = 1, this.near = i, this.far = s, this.focus = 10, this.aspect = e, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(t, e) {
    return super.copy(t, e), this.fov = t.fov, this.zoom = t.zoom, this.near = t.near, this.far = t.far, this.focus = t.focus, this.aspect = t.aspect, this.view = t.view === null ? null : Object.assign({}, t.view), this.filmGauge = t.filmGauge, this.filmOffset = t.filmOffset, this;
  }
  setFocalLength(t) {
    let e = 0.5 * this.getFilmHeight() / t;
    this.fov = Ki * 2 * Math.atan(e), this.updateProjectionMatrix();
  }
  getFocalLength() {
    let t = Math.tan(He * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / t;
  }
  getEffectiveFOV() {
    return Ki * 2 * Math.atan(Math.tan(He * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  getViewBounds(t, e, i) {
    Se.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), e.set(Se.x, Se.y).multiplyScalar(-t / Se.z), Se.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), i.set(Se.x, Se.y).multiplyScalar(-t / Se.z);
  }
  getViewSize(t, e) {
    return this.getViewBounds(t, ja, Qa), e.subVectors(Qa, ja);
  }
  setViewOffset(t, e, i, s, n, r) {
    this.aspect = t / e, this.view === null && (this.view = { enabled: true, fullWidth: 1, fullHeight: 1, offsetX: 0, offsetY: 0, width: 1, height: 1 }), this.view.enabled = true, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = i, this.view.offsetY = s, this.view.width = n, this.view.height = r, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = false), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    let t = this.near, e = t * Math.tan(He * 0.5 * this.fov) / this.zoom, i = 2 * e, s = this.aspect * i, n = -0.5 * s, r = this.view;
    if (this.view !== null && this.view.enabled) {
      let a = r.fullWidth, l = r.fullHeight;
      n += r.offsetX * s / a, e -= r.offsetY * i / l, s *= r.width / a, i *= r.height / l;
    }
    let o = this.filmOffset;
    o !== 0 && (n += t * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(n, n + s, e, e - i, t, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    let e = super.toJSON(t);
    return e.object.fov = this.fov, e.object.zoom = this.zoom, e.object.near = this.near, e.object.far = this.far, e.object.focus = this.focus, e.object.aspect = this.aspect, this.view !== null && (e.object.view = Object.assign({}, this.view)), e.object.filmGauge = this.filmGauge, e.object.filmOffset = this.filmOffset, e;
  }
};
var ci = -90;
var ui = 1;
var kr = class extends H {
  constructor(t, e, i) {
    super(), this.type = "CubeCamera", this.renderTarget = i, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    let s = new At(ci, ui, t, e);
    s.layers = this.layers, this.add(s);
    let n = new At(ci, ui, t, e);
    n.layers = this.layers, this.add(n);
    let r = new At(ci, ui, t, e);
    r.layers = this.layers, this.add(r);
    let o = new At(ci, ui, t, e);
    o.layers = this.layers, this.add(o);
    let a = new At(ci, ui, t, e);
    a.layers = this.layers, this.add(a);
    let l = new At(ci, ui, t, e);
    l.layers = this.layers, this.add(l);
  }
  updateCoordinateSystem() {
    let t = this.coordinateSystem, e = this.children.concat(), [i, s, n, r, o, a] = e;
    for (let l of e)
      this.remove(l);
    if (t === jt)
      i.up.set(0, 1, 0), i.lookAt(1, 0, 0), s.up.set(0, 1, 0), s.lookAt(-1, 0, 0), n.up.set(0, 0, -1), n.lookAt(0, 1, 0), r.up.set(0, 0, 1), r.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), a.up.set(0, 1, 0), a.lookAt(0, 0, -1);
    else if (t === Qi)
      i.up.set(0, -1, 0), i.lookAt(-1, 0, 0), s.up.set(0, -1, 0), s.lookAt(1, 0, 0), n.up.set(0, 0, 1), n.lookAt(0, 1, 0), r.up.set(0, 0, -1), r.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), a.up.set(0, -1, 0), a.lookAt(0, 0, -1);
    else
      throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + t);
    for (let l of e)
      this.add(l), l.updateMatrixWorld();
  }
  update(t, e) {
    this.parent === null && this.updateMatrixWorld();
    let { renderTarget: i, activeMipmapLevel: s } = this;
    this.coordinateSystem !== t.coordinateSystem && (this.coordinateSystem = t.coordinateSystem, this.updateCoordinateSystem());
    let [n, r, o, a, l, c] = this.children, u = t.getRenderTarget(), d = t.getActiveCubeFace(), p = t.getActiveMipmapLevel(), f = t.xr.enabled;
    t.xr.enabled = false;
    let m = i.texture.generateMipmaps;
    i.texture.generateMipmaps = false, t.setRenderTarget(i, 0, s), t.render(e, n), t.setRenderTarget(i, 1, s), t.render(e, r), t.setRenderTarget(i, 2, s), t.render(e, o), t.setRenderTarget(i, 3, s), t.render(e, a), t.setRenderTarget(i, 4, s), t.render(e, l), i.texture.generateMipmaps = m, t.setRenderTarget(i, 5, s), t.render(e, c), t.setRenderTarget(u, d, p), t.xr.enabled = f, i.texture.needsPMREMUpdate = true;
  }
};
var ss = class extends ut {
  constructor(t = [], e = Rn, i, s, n, r, o, a, l, c) {
    super(t, e, i, s, n, r, o, a, l, c), this.isCubeTexture = true, this.flipY = false;
  }
  get images() {
    return this.image;
  }
  set images(t) {
    this.image = t;
  }
};
var Ka = class extends ts {
  constructor(t = 1, e = {}) {
    super(t, t, e), this.isWebGLCubeRenderTarget = true;
    let i = { width: t, height: t, depth: 1 }, s = [i, i, i, i, i, i];
    this.texture = new ss(s), this._setTextureOptions(e), this.texture.isRenderTargetTexture = true;
  }
  fromEquirectangularTexture(t, e) {
    this.texture.type = e.type, this.texture.colorSpace = e.colorSpace, this.texture.generateMipmaps = e.generateMipmaps, this.texture.minFilter = e.minFilter, this.texture.magFilter = e.magFilter;
    let i = { uniforms: { tEquirect: { value: null } }, vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`, fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			` }, s = new cn(5, 5, 5), n = new es({ name: "CubemapFromEquirect", uniforms: Nn(i.uniforms), vertexShader: i.vertexShader, fragmentShader: i.fragmentShader, side: Ll, blending: rc });
    n.uniforms.tEquirect.value = e;
    let r = new Pt(s, n), o = e.minFilter;
    return e.minFilter === On && (e.minFilter = Vt), new kr(1, 10, this).update(t, r), e.minFilter = o, r.geometry.dispose(), r.material.dispose(), this;
  }
  clear(t, e = true, i = true, s = true) {
    let n = t.getRenderTarget();
    for (let r = 0; r < 6; r++)
      t.setRenderTarget(this, r), t.clear(e, i, s);
    t.setRenderTarget(n);
  }
};
var Ge = class extends H {
  constructor() {
    super(), this.isGroup = true, this.type = "Group";
  }
};
var Qu = { type: "move" };
var th = class {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new Ge(), this._hand.matrixAutoUpdate = false, this._hand.visible = false, this._hand.joints = {}, this._hand.inputState = { pinching: false }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Ge(), this._targetRay.matrixAutoUpdate = false, this._targetRay.visible = false, this._targetRay.hasLinearVelocity = false, this._targetRay.linearVelocity = new w(), this._targetRay.hasAngularVelocity = false, this._targetRay.angularVelocity = new w()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new Ge(), this._grip.matrixAutoUpdate = false, this._grip.visible = false, this._grip.hasLinearVelocity = false, this._grip.linearVelocity = new w(), this._grip.hasAngularVelocity = false, this._grip.angularVelocity = new w()), this._grip;
  }
  dispatchEvent(t) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(t), this._grip !== null && this._grip.dispatchEvent(t), this._hand !== null && this._hand.dispatchEvent(t), this;
  }
  connect(t) {
    if (t && t.hand) {
      let e = this._hand;
      if (e)
        for (let i of t.hand.values())
          this._getHandJoint(e, i);
    }
    return this.dispatchEvent({ type: "connected", data: t }), this;
  }
  disconnect(t) {
    return this.dispatchEvent({ type: "disconnected", data: t }), this._targetRay !== null && (this._targetRay.visible = false), this._grip !== null && (this._grip.visible = false), this._hand !== null && (this._hand.visible = false), this;
  }
  update(t, e, i) {
    let s = null, n = null, r = null, o = this._targetRay, a = this._grip, l = this._hand;
    if (t && e.session.visibilityState !== "visible-blurred") {
      if (l && t.hand) {
        r = true;
        for (let m of t.hand.values()) {
          let g2 = e.getJointPose(m, i), y3 = this._getHandJoint(l, m);
          g2 !== null && (y3.matrix.fromArray(g2.transform.matrix), y3.matrix.decompose(y3.position, y3.rotation, y3.scale), y3.matrixWorldNeedsUpdate = true, y3.jointRadius = g2.radius), y3.visible = g2 !== null;
        }
        let c = l.joints["index-finger-tip"], u = l.joints["thumb-tip"], d = c.position.distanceTo(u.position), p = 0.02, f = 5e-3;
        l.inputState.pinching && d > p + f ? (l.inputState.pinching = false, this.dispatchEvent({ type: "pinchend", handedness: t.handedness, target: this })) : !l.inputState.pinching && d <= p - f && (l.inputState.pinching = true, this.dispatchEvent({ type: "pinchstart", handedness: t.handedness, target: this }));
      } else
        a !== null && t.gripSpace && (n = e.getPose(t.gripSpace, i), n !== null && (a.matrix.fromArray(n.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), a.matrixWorldNeedsUpdate = true, n.linearVelocity ? (a.hasLinearVelocity = true, a.linearVelocity.copy(n.linearVelocity)) : a.hasLinearVelocity = false, n.angularVelocity ? (a.hasAngularVelocity = true, a.angularVelocity.copy(n.angularVelocity)) : a.hasAngularVelocity = false));
      o !== null && (s = e.getPose(t.targetRaySpace, i), s === null && n !== null && (s = n), s !== null && (o.matrix.fromArray(s.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = true, s.linearVelocity ? (o.hasLinearVelocity = true, o.linearVelocity.copy(s.linearVelocity)) : o.hasLinearVelocity = false, s.angularVelocity ? (o.hasAngularVelocity = true, o.angularVelocity.copy(s.angularVelocity)) : o.hasAngularVelocity = false, this.dispatchEvent(Qu)));
    }
    return o !== null && (o.visible = s !== null), a !== null && (a.visible = n !== null), l !== null && (l.visible = r !== null), this;
  }
  _getHandJoint(t, e) {
    if (t.joints[e.jointName] === void 0) {
      let i = new Ge();
      i.matrixAutoUpdate = false, i.visible = false, t.joints[e.jointName] = i, t.add(i);
    }
    return t.joints[e.jointName];
  }
};
var Rr = class h12 {
  constructor(t, e = 1, i = 1e3) {
    this.isFog = true, this.name = "", this.color = new V(t), this.near = e, this.far = i;
  }
  clone() {
    return new h12(this.color, this.near, this.far);
  }
  toJSON() {
    return { type: "Fog", name: this.name, color: this.color.getHex(), near: this.near, far: this.far };
  }
};
var Or = class extends H {
  constructor() {
    super(), this.isScene = true, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new ee(), this.environmentIntensity = 1, this.environmentRotation = new ee(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(t, e) {
    return super.copy(t, e), t.background !== null && (this.background = t.background.clone()), t.environment !== null && (this.environment = t.environment.clone()), t.fog !== null && (this.fog = t.fog.clone()), this.backgroundBlurriness = t.backgroundBlurriness, this.backgroundIntensity = t.backgroundIntensity, this.backgroundRotation.copy(t.backgroundRotation), this.environmentIntensity = t.environmentIntensity, this.environmentRotation.copy(t.environmentRotation), t.overrideMaterial !== null && (this.overrideMaterial = t.overrideMaterial.clone()), this.matrixAutoUpdate = t.matrixAutoUpdate, this;
  }
  toJSON(t) {
    let e = super.toJSON(t);
    return this.fog !== null && (e.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (e.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (e.object.backgroundIntensity = this.backgroundIntensity), e.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (e.object.environmentIntensity = this.environmentIntensity), e.object.environmentRotation = this.environmentRotation.toArray(), e;
  }
};
var ns = class {
  constructor(t, e) {
    this.isInterleavedBuffer = true, this.array = t, this.stride = e, this.count = t !== void 0 ? t.length / e : 0, this.usage = rn, this.updateRanges = [], this.version = 0, this.uuid = Bt();
  }
  onUploadCallback() {
  }
  set needsUpdate(t) {
    t === true && this.version++;
  }
  setUsage(t) {
    return this.usage = t, this;
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(t) {
    return this.array = new t.array.constructor(t.array), this.count = t.count, this.stride = t.stride, this.usage = t.usage, this;
  }
  copyAt(t, e, i) {
    t *= this.stride, i *= e.stride;
    for (let s = 0, n = this.stride; s < n; s++)
      this.array[t + s] = e.array[i + s];
    return this;
  }
  set(t, e = 0) {
    return this.array.set(t, e), this;
  }
  clone(t) {
    t.arrayBuffers === void 0 && (t.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = Bt()), t.arrayBuffers[this.array.buffer._uuid] === void 0 && (t.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
    let e = new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]), i = new this.constructor(e, this.stride);
    return i.setUsage(this.usage), i;
  }
  onUpload(t) {
    return this.onUploadCallback = t, this;
  }
  toJSON(t) {
    return t.arrayBuffers === void 0 && (t.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = Bt()), t.arrayBuffers[this.array.buffer._uuid] === void 0 && (t.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), { uuid: this.uuid, buffer: this.array.buffer._uuid, type: this.array.constructor.name, stride: this.stride };
  }
};
var bt = new w();
var Ai = class h13 {
  constructor(t, e, i, s = false) {
    this.isInterleavedBufferAttribute = true, this.name = "", this.data = t, this.itemSize = e, this.offset = i, this.normalized = s;
  }
  get count() {
    return this.data.count;
  }
  get array() {
    return this.data.array;
  }
  set needsUpdate(t) {
    this.data.needsUpdate = t;
  }
  applyMatrix4(t) {
    for (let e = 0, i = this.data.count; e < i; e++)
      bt.fromBufferAttribute(this, e), bt.applyMatrix4(t), this.setXYZ(e, bt.x, bt.y, bt.z);
    return this;
  }
  applyNormalMatrix(t) {
    for (let e = 0, i = this.count; e < i; e++)
      bt.fromBufferAttribute(this, e), bt.applyNormalMatrix(t), this.setXYZ(e, bt.x, bt.y, bt.z);
    return this;
  }
  transformDirection(t) {
    for (let e = 0, i = this.count; e < i; e++)
      bt.fromBufferAttribute(this, e), bt.transformDirection(t), this.setXYZ(e, bt.x, bt.y, bt.z);
    return this;
  }
  getComponent(t, e) {
    let i = this.array[t * this.data.stride + this.offset + e];
    return this.normalized && (i = wt(i, this.array)), i;
  }
  setComponent(t, e, i) {
    return this.normalized && (i = L(i, this.array)), this.data.array[t * this.data.stride + this.offset + e] = i, this;
  }
  setX(t, e) {
    return this.normalized && (e = L(e, this.array)), this.data.array[t * this.data.stride + this.offset] = e, this;
  }
  setY(t, e) {
    return this.normalized && (e = L(e, this.array)), this.data.array[t * this.data.stride + this.offset + 1] = e, this;
  }
  setZ(t, e) {
    return this.normalized && (e = L(e, this.array)), this.data.array[t * this.data.stride + this.offset + 2] = e, this;
  }
  setW(t, e) {
    return this.normalized && (e = L(e, this.array)), this.data.array[t * this.data.stride + this.offset + 3] = e, this;
  }
  getX(t) {
    let e = this.data.array[t * this.data.stride + this.offset];
    return this.normalized && (e = wt(e, this.array)), e;
  }
  getY(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 1];
    return this.normalized && (e = wt(e, this.array)), e;
  }
  getZ(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 2];
    return this.normalized && (e = wt(e, this.array)), e;
  }
  getW(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 3];
    return this.normalized && (e = wt(e, this.array)), e;
  }
  setXY(t, e, i) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = L(e, this.array), i = L(i, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = i, this;
  }
  setXYZ(t, e, i, s) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = L(e, this.array), i = L(i, this.array), s = L(s, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = i, this.data.array[t + 2] = s, this;
  }
  setXYZW(t, e, i, s, n) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = L(e, this.array), i = L(i, this.array), s = L(s, this.array), n = L(n, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = i, this.data.array[t + 2] = s, this.data.array[t + 3] = n, this;
  }
  clone(t) {
    if (t === void 0) {
      Aa("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
      let e = [];
      for (let i = 0; i < this.count; i++) {
        let s = i * this.data.stride + this.offset;
        for (let n = 0; n < this.itemSize; n++)
          e.push(this.data.array[s + n]);
      }
      return new j(new this.array.constructor(e), this.itemSize, this.normalized);
    } else
      return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.clone(t)), new h13(t.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
  }
  toJSON(t) {
    if (t === void 0) {
      Aa("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
      let e = [];
      for (let i = 0; i < this.count; i++) {
        let s = i * this.data.stride + this.offset;
        for (let n = 0; n < this.itemSize; n++)
          e.push(this.data.array[s + n]);
      }
      return { itemSize: this.itemSize, type: this.array.constructor.name, array: e, normalized: this.normalized };
    } else
      return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.toJSON(t)), { isInterleavedBufferAttribute: true, itemSize: this.itemSize, data: this.data.uuid, offset: this.offset, normalized: this.normalized };
  }
};
var Di = new w();
var pi = new w();
var fi = new w();
var mi = new I();
var Li = new I();
var Hl = new U();
var Fs = new w();
var Ui = new w();
var Bs = new w();
var eh = new I();
var or = new I();
var ih = new I();
var Ps = new w();
var sh = new w();
var nh = new w();
var rh = new Dt();
var oh = new Dt();
var Ku = new w();
var ah = new U();
var Rs = new w();
var ar = new ct();
var hh = new U();
var hr = new Ze();
var Vr = class extends Pt {
  constructor(t, e) {
    super(t, e), this.isSkinnedMesh = true, this.type = "SkinnedMesh", this.bindMode = wa, this.bindMatrix = new U(), this.bindMatrixInverse = new U(), this.boundingBox = null, this.boundingSphere = null;
  }
  computeBoundingBox() {
    let t = this.geometry;
    this.boundingBox === null && (this.boundingBox = new pt()), this.boundingBox.makeEmpty();
    let e = t.getAttribute("position");
    for (let i = 0; i < e.count; i++)
      this.getVertexPosition(i, Rs), this.boundingBox.expandByPoint(Rs);
  }
  computeBoundingSphere() {
    let t = this.geometry;
    this.boundingSphere === null && (this.boundingSphere = new ct()), this.boundingSphere.makeEmpty();
    let e = t.getAttribute("position");
    for (let i = 0; i < e.count; i++)
      this.getVertexPosition(i, Rs), this.boundingSphere.expandByPoint(Rs);
  }
  copy(t, e) {
    return super.copy(t, e), this.bindMode = t.bindMode, this.bindMatrix.copy(t.bindMatrix), this.bindMatrixInverse.copy(t.bindMatrixInverse), this.skeleton = t.skeleton, t.boundingBox !== null && (this.boundingBox = t.boundingBox.clone()), t.boundingSphere !== null && (this.boundingSphere = t.boundingSphere.clone()), this;
  }
  raycast(t, e) {
    let i = this.material, s = this.matrixWorld;
    i !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), ar.copy(this.boundingSphere), ar.applyMatrix4(s), t.ray.intersectsSphere(ar) !== false && (hh.copy(s).invert(), hr.copy(t.ray).applyMatrix4(hh), !(this.boundingBox !== null && hr.intersectsBox(this.boundingBox) === false) && this._computeIntersections(t, e, hr)));
  }
  getVertexPosition(t, e) {
    return super.getVertexPosition(t, e), this.applyBoneTransform(t, e), e;
  }
  bind(t, e) {
    this.skeleton = t, e === void 0 && (this.updateMatrixWorld(true), this.skeleton.calculateInverses(), e = this.matrixWorld), this.bindMatrix.copy(e), this.bindMatrixInverse.copy(e).invert();
  }
  pose() {
    this.skeleton.pose();
  }
  normalizeSkinWeights() {
    let t = new Dt(), e = this.geometry.attributes.skinWeight;
    for (let i = 0, s = e.count; i < s; i++) {
      t.fromBufferAttribute(e, i);
      let n = 1 / t.manhattanLength();
      n !== 1 / 0 ? t.multiplyScalar(n) : t.set(1, 0, 0, 0), e.setXYZW(i, t.x, t.y, t.z, t.w);
    }
  }
  updateMatrixWorld(t) {
    super.updateMatrixWorld(t), this.bindMode === wa ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === oc ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : E("SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
  }
  applyBoneTransform(t, e) {
    let i = this.skeleton, s = this.geometry;
    rh.fromBufferAttribute(s.attributes.skinIndex, t), oh.fromBufferAttribute(s.attributes.skinWeight, t), nh.copy(e).applyMatrix4(this.bindMatrix), e.set(0, 0, 0);
    for (let n = 0; n < 4; n++) {
      let r = oh.getComponent(n);
      if (r !== 0) {
        let o = rh.getComponent(n);
        ah.multiplyMatrices(i.bones[o].matrixWorld, i.boneInverses[o]), e.addScaledVector(Ku.copy(nh).applyMatrix4(ah), r);
      }
    }
    return e.applyMatrix4(this.bindMatrixInverse);
  }
};
var dn = class extends H {
  constructor() {
    super(), this.isBone = true, this.type = "Bone";
  }
};
var Xt = class extends ut {
  constructor(t = null, e = 1, i = 1, s, n, r, o, a, l = kt, c = kt, u, d) {
    super(null, r, o, a, l, c, s, n, u, d), this.isDataTexture = true, this.image = { data: t, width: e, height: i }, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1;
  }
};
var lh = new U();
var td = new U();
var Dr = class h14 {
  constructor(t = [], e = []) {
    this.uuid = Bt(), this.bones = t.slice(0), this.boneInverses = e, this.boneMatrices = null, this.previousBoneMatrices = null, this.boneTexture = null, this.init();
  }
  init() {
    let t = this.bones, e = this.boneInverses;
    if (this.boneMatrices = new Float32Array(t.length * 16), e.length === 0)
      this.calculateInverses();
    else if (t.length !== e.length) {
      E("Skeleton: Number of inverse bone matrices does not match amount of bones."), this.boneInverses = [];
      for (let i = 0, s = this.bones.length; i < s; i++)
        this.boneInverses.push(new U());
    }
  }
  calculateInverses() {
    this.boneInverses.length = 0;
    for (let t = 0, e = this.bones.length; t < e; t++) {
      let i = new U();
      this.bones[t] && i.copy(this.bones[t].matrixWorld).invert(), this.boneInverses.push(i);
    }
  }
  pose() {
    for (let t = 0, e = this.bones.length; t < e; t++) {
      let i = this.bones[t];
      i && i.matrixWorld.copy(this.boneInverses[t]).invert();
    }
    for (let t = 0, e = this.bones.length; t < e; t++) {
      let i = this.bones[t];
      i && (i.parent && i.parent.isBone ? (i.matrix.copy(i.parent.matrixWorld).invert(), i.matrix.multiply(i.matrixWorld)) : i.matrix.copy(i.matrixWorld), i.matrix.decompose(i.position, i.quaternion, i.scale));
    }
  }
  update() {
    let t = this.bones, e = this.boneInverses, i = this.boneMatrices, s = this.boneTexture;
    for (let n = 0, r = t.length; n < r; n++) {
      let o = t[n] ? t[n].matrixWorld : td;
      lh.multiplyMatrices(o, e[n]), lh.toArray(i, n * 16);
    }
    s !== null && (s.needsUpdate = true);
  }
  clone() {
    return new h14(this.bones, this.boneInverses);
  }
  computeBoneTexture() {
    let t = Math.sqrt(this.bones.length * 4);
    t = Math.ceil(t / 4) * 4, t = Math.max(t, 4);
    let e = new Float32Array(t * t * 4);
    e.set(this.boneMatrices);
    let i = new Xt(e, t, t, ji, Si);
    return i.needsUpdate = true, this.boneMatrices = e, this.boneTexture = i, this;
  }
  getBoneByName(t) {
    for (let e = 0, i = this.bones.length; e < i; e++) {
      let s = this.bones[e];
      if (s.name === t)
        return s;
    }
  }
  dispose() {
    this.boneTexture !== null && (this.boneTexture.dispose(), this.boneTexture = null);
  }
  fromJSON(t, e) {
    this.uuid = t.uuid;
    for (let i = 0, s = t.bones.length; i < s; i++) {
      let n = t.bones[i], r = e[n];
      r === void 0 && (E("Skeleton: No bone found with UUID:", n), r = new dn()), this.bones.push(r), this.boneInverses.push(new U().fromArray(t.boneInverses[i]));
    }
    return this.init(), this;
  }
  toJSON() {
    let t = { metadata: { version: 4.7, type: "Skeleton", generator: "Skeleton.toJSON" }, bones: [], boneInverses: [] };
    t.uuid = this.uuid;
    let e = this.bones, i = this.boneInverses;
    for (let s = 0, n = e.length; s < n; s++) {
      let r = e[s];
      t.bones.push(r.uuid);
      let o = i[s];
      t.boneInverses.push(o.toArray());
    }
    return t;
  }
};
var Ye = class extends j {
  constructor(t, e, i, s = 1) {
    super(t, e, i), this.isInstancedBufferAttribute = true, this.meshPerAttribute = s;
  }
  copy(t) {
    return super.copy(t), this.meshPerAttribute = t.meshPerAttribute, this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.meshPerAttribute = this.meshPerAttribute, t.isInstancedBufferAttribute = true, t;
  }
};
var yi = new U();
var ch = new U();
var Os = [];
var uh = new pt();
var ed = new U();
var Wi = new Pt();
var qi = new ct();
var Lr = class extends Pt {
  constructor(t, e, i) {
    super(t, e), this.isInstancedMesh = true, this.instanceMatrix = new Ye(new Float32Array(i * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = i, this.boundingBox = null, this.boundingSphere = null;
    for (let s = 0; s < i; s++)
      this.setMatrixAt(s, ed);
  }
  computeBoundingBox() {
    let t = this.geometry, e = this.count;
    this.boundingBox === null && (this.boundingBox = new pt()), t.boundingBox === null && t.computeBoundingBox(), this.boundingBox.makeEmpty();
    for (let i = 0; i < e; i++)
      this.getMatrixAt(i, yi), uh.copy(t.boundingBox).applyMatrix4(yi), this.boundingBox.union(uh);
  }
  computeBoundingSphere() {
    let t = this.geometry, e = this.count;
    this.boundingSphere === null && (this.boundingSphere = new ct()), t.boundingSphere === null && t.computeBoundingSphere(), this.boundingSphere.makeEmpty();
    for (let i = 0; i < e; i++)
      this.getMatrixAt(i, yi), qi.copy(t.boundingSphere).applyMatrix4(yi), this.boundingSphere.union(qi);
  }
  copy(t, e) {
    return super.copy(t, e), this.instanceMatrix.copy(t.instanceMatrix), t.morphTexture !== null && (this.morphTexture = t.morphTexture.clone()), t.instanceColor !== null && (this.instanceColor = t.instanceColor.clone()), this.count = t.count, t.boundingBox !== null && (this.boundingBox = t.boundingBox.clone()), t.boundingSphere !== null && (this.boundingSphere = t.boundingSphere.clone()), this;
  }
  getColorAt(t, e) {
    e.fromArray(this.instanceColor.array, t * 3);
  }
  getMatrixAt(t, e) {
    e.fromArray(this.instanceMatrix.array, t * 16);
  }
  getMorphAt(t, e) {
    let i = e.morphTargetInfluences, s = this.morphTexture.source.data.data, n = i.length + 1, r = t * n + 1;
    for (let o = 0; o < i.length; o++)
      i[o] = s[r + o];
  }
  raycast(t, e) {
    let i = this.matrixWorld, s = this.count;
    if (Wi.geometry = this.geometry, Wi.material = this.material, Wi.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), qi.copy(this.boundingSphere), qi.applyMatrix4(i), t.ray.intersectsSphere(qi) !== false))
      for (let n = 0; n < s; n++) {
        this.getMatrixAt(n, yi), ch.multiplyMatrices(i, yi), Wi.matrixWorld = ch, Wi.raycast(t, Os);
        for (let r = 0, o = Os.length; r < o; r++) {
          let a = Os[r];
          a.instanceId = n, a.object = this, e.push(a);
        }
        Os.length = 0;
      }
  }
  setColorAt(t, e) {
    this.instanceColor === null && (this.instanceColor = new Ye(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), e.toArray(this.instanceColor.array, t * 3);
  }
  setMatrixAt(t, e) {
    e.toArray(this.instanceMatrix.array, t * 16);
  }
  setMorphAt(t, e) {
    let i = e.morphTargetInfluences, s = i.length + 1;
    this.morphTexture === null && (this.morphTexture = new Xt(new Float32Array(s * this.count), s, this.count, Ul, Si));
    let n = this.morphTexture.source.data.data, r = 0;
    for (let l = 0; l < i.length; l++)
      r += i[l];
    let o = this.geometry.morphTargetsRelative ? 1 : 1 - r, a = s * t;
    n[a] = o, n.set(i, a + 1);
  }
  updateMorphTargets() {
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" }), this.morphTexture !== null && (this.morphTexture.dispose(), this.morphTexture = null);
  }
};
var lr = new w();
var id = new w();
var sd = new te();
var Te = class {
  constructor(t = new w(1, 0, 0), e = 0) {
    this.isPlane = true, this.normal = t, this.constant = e;
  }
  set(t, e) {
    return this.normal.copy(t), this.constant = e, this;
  }
  setComponents(t, e, i, s) {
    return this.normal.set(t, e, i), this.constant = s, this;
  }
  setFromNormalAndCoplanarPoint(t, e) {
    return this.normal.copy(t), this.constant = -e.dot(this.normal), this;
  }
  setFromCoplanarPoints(t, e, i) {
    let s = lr.subVectors(i, e).cross(id.subVectors(t, e)).normalize();
    return this.setFromNormalAndCoplanarPoint(s, t), this;
  }
  copy(t) {
    return this.normal.copy(t.normal), this.constant = t.constant, this;
  }
  normalize() {
    let t = 1 / this.normal.length();
    return this.normal.multiplyScalar(t), this.constant *= t, this;
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  distanceToPoint(t) {
    return this.normal.dot(t) + this.constant;
  }
  distanceToSphere(t) {
    return this.distanceToPoint(t.center) - t.radius;
  }
  projectPoint(t, e) {
    return e.copy(t).addScaledVector(this.normal, -this.distanceToPoint(t));
  }
  intersectLine(t, e) {
    let i = t.delta(lr), s = this.normal.dot(i);
    if (s === 0)
      return this.distanceToPoint(t.start) === 0 ? e.copy(t.start) : null;
    let n = -(t.start.dot(this.normal) + this.constant) / s;
    return n < 0 || n > 1 ? null : e.copy(t.start).addScaledVector(i, n);
  }
  intersectsLine(t) {
    let e = this.distanceToPoint(t.start), i = this.distanceToPoint(t.end);
    return e < 0 && i > 0 || i < 0 && e > 0;
  }
  intersectsBox(t) {
    return t.intersectsPlane(this);
  }
  intersectsSphere(t) {
    return t.intersectsPlane(this);
  }
  coplanarPoint(t) {
    return t.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(t, e) {
    let i = e || sd.getNormalMatrix(t), s = this.coplanarPoint(lr).applyMatrix4(t), n = this.normal.applyMatrix3(i).normalize();
    return this.constant = -s.dot(n), this;
  }
  translate(t) {
    return this.constant -= t.dot(this.normal), this;
  }
  equals(t) {
    return t.normal.equals(this.normal) && t.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
var Ee = new ct();
var nd = new I(0.5, 0.5);
var Es = new w();
var rs = class {
  constructor(t = new Te(), e = new Te(), i = new Te(), s = new Te(), n = new Te(), r = new Te()) {
    this.planes = [t, e, i, s, n, r];
  }
  set(t, e, i, s, n, r) {
    let o = this.planes;
    return o[0].copy(t), o[1].copy(e), o[2].copy(i), o[3].copy(s), o[4].copy(n), o[5].copy(r), this;
  }
  copy(t) {
    let e = this.planes;
    for (let i = 0; i < 6; i++)
      e[i].copy(t.planes[i]);
    return this;
  }
  setFromProjectionMatrix(t, e = jt, i = false) {
    let s = this.planes, n = t.elements, r = n[0], o = n[1], a = n[2], l = n[3], c = n[4], u = n[5], d = n[6], p = n[7], f = n[8], m = n[9], g2 = n[10], y3 = n[11], x = n[12], b = n[13], M = n[14], _2 = n[15];
    if (s[0].setComponents(l - r, p - c, y3 - f, _2 - x).normalize(), s[1].setComponents(l + r, p + c, y3 + f, _2 + x).normalize(), s[2].setComponents(l + o, p + u, y3 + m, _2 + b).normalize(), s[3].setComponents(l - o, p - u, y3 - m, _2 - b).normalize(), i)
      s[4].setComponents(a, d, g2, M).normalize(), s[5].setComponents(l - a, p - d, y3 - g2, _2 - M).normalize();
    else if (s[4].setComponents(l - a, p - d, y3 - g2, _2 - M).normalize(), e === jt)
      s[5].setComponents(l + a, p + d, y3 + g2, _2 + M).normalize();
    else if (e === Qi)
      s[5].setComponents(a, d, g2, M).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + e);
    return this;
  }
  intersectsObject(t) {
    if (t.boundingSphere !== void 0)
      t.boundingSphere === null && t.computeBoundingSphere(), Ee.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
    else {
      let e = t.geometry;
      e.boundingSphere === null && e.computeBoundingSphere(), Ee.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
    }
    return this.intersectsSphere(Ee);
  }
  intersectsSprite(t) {
    Ee.center.set(0, 0, 0);
    let e = nd.distanceTo(t.center);
    return Ee.radius = 0.7071067811865476 + e, Ee.applyMatrix4(t.matrixWorld), this.intersectsSphere(Ee);
  }
  intersectsSphere(t) {
    let e = this.planes, i = t.center, s = -t.radius;
    for (let n = 0; n < 6; n++)
      if (e[n].distanceToPoint(i) < s)
        return false;
    return true;
  }
  intersectsBox(t) {
    let e = this.planes;
    for (let i = 0; i < 6; i++) {
      let s = e[i];
      if (Es.x = s.normal.x > 0 ? t.max.x : t.min.x, Es.y = s.normal.y > 0 ? t.max.y : t.min.y, Es.z = s.normal.z > 0 ? t.max.z : t.min.z, s.distanceToPoint(Es) < 0)
        return false;
    }
    return true;
  }
  containsPoint(t) {
    let e = this.planes;
    for (let i = 0; i < 6; i++)
      if (e[i].distanceToPoint(t) < 0)
        return false;
    return true;
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
var Zt = new U();
var Yt = new rs();
var Ur = class h15 {
  constructor() {
    this.coordinateSystem = jt;
  }
  intersectsObject(t, e) {
    if (!e.isArrayCamera || e.cameras.length === 0)
      return false;
    for (let i = 0; i < e.cameras.length; i++) {
      let s = e.cameras[i];
      if (Zt.multiplyMatrices(s.projectionMatrix, s.matrixWorldInverse), Yt.setFromProjectionMatrix(Zt, s.coordinateSystem, s.reversedDepth), Yt.intersectsObject(t))
        return true;
    }
    return false;
  }
  intersectsSprite(t, e) {
    if (!e || !e.cameras || e.cameras.length === 0)
      return false;
    for (let i = 0; i < e.cameras.length; i++) {
      let s = e.cameras[i];
      if (Zt.multiplyMatrices(s.projectionMatrix, s.matrixWorldInverse), Yt.setFromProjectionMatrix(Zt, s.coordinateSystem, s.reversedDepth), Yt.intersectsSprite(t))
        return true;
    }
    return false;
  }
  intersectsSphere(t, e) {
    if (!e || !e.cameras || e.cameras.length === 0)
      return false;
    for (let i = 0; i < e.cameras.length; i++) {
      let s = e.cameras[i];
      if (Zt.multiplyMatrices(s.projectionMatrix, s.matrixWorldInverse), Yt.setFromProjectionMatrix(Zt, s.coordinateSystem, s.reversedDepth), Yt.intersectsSphere(t))
        return true;
    }
    return false;
  }
  intersectsBox(t, e) {
    if (!e || !e.cameras || e.cameras.length === 0)
      return false;
    for (let i = 0; i < e.cameras.length; i++) {
      let s = e.cameras[i];
      if (Zt.multiplyMatrices(s.projectionMatrix, s.matrixWorldInverse), Yt.setFromProjectionMatrix(Zt, s.coordinateSystem, s.reversedDepth), Yt.intersectsBox(t))
        return true;
    }
    return false;
  }
  containsPoint(t, e) {
    if (!e || !e.cameras || e.cameras.length === 0)
      return false;
    for (let i = 0; i < e.cameras.length; i++) {
      let s = e.cameras[i];
      if (Zt.multiplyMatrices(s.projectionMatrix, s.matrixWorldInverse), Yt.setFromProjectionMatrix(Zt, s.coordinateSystem, s.reversedDepth), Yt.containsPoint(t))
        return true;
    }
    return false;
  }
  clone() {
    return new h15();
  }
};
var Wr = class {
  constructor() {
    this.index = 0, this.pool = [], this.list = [];
  }
  push(t, e, i, s) {
    let n = this.pool, r = this.list;
    this.index >= n.length && n.push({ start: -1, count: -1, z: -1, index: -1 });
    let o = n[this.index];
    r.push(o), this.index++, o.start = t, o.count = e, o.z = i, o.index = s;
  }
  reset() {
    this.list.length = 0, this.index = 0;
  }
};
var vt = new U();
var ad = new V(1, 1, 1);
var dh = new rs();
var hd = new Ur();
var Ns = new pt();
var Ne = new ct();
var Ji = new w();
var ph = new w();
var ld = new w();
var ur = new Wr();
var gt = new Pt();
var xt = class extends ft {
  constructor(t) {
    super(), this.isLineBasicMaterial = true, this.type = "LineBasicMaterial", this.color = new V(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
  }
};
var pn = new w();
var fn = new w();
var fh = new U();
var Gi = new Ze();
var Ds = new ct();
var dr = new w();
var mh = new w();
var ge = class extends H {
  constructor(t = new q(), e = new xt()) {
    super(), this.isLine = true, this.type = "Line", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  computeLineDistances() {
    let t = this.geometry;
    if (t.index === null) {
      let e = t.attributes.position, i = [0];
      for (let s = 1, n = e.count; s < n; s++)
        pn.fromBufferAttribute(e, s - 1), fn.fromBufferAttribute(e, s), i[s] = i[s - 1], i[s] += pn.distanceTo(fn);
      t.setAttribute("lineDistance", new B(i, 1));
    } else
      E("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(t, e) {
    let i = this.geometry, s = this.matrixWorld, n = t.params.Line.threshold, r = i.drawRange;
    if (i.boundingSphere === null && i.computeBoundingSphere(), Ds.copy(i.boundingSphere), Ds.applyMatrix4(s), Ds.radius += n, t.ray.intersectsSphere(Ds) === false)
      return;
    fh.copy(s).invert(), Gi.copy(t.ray).applyMatrix4(fh);
    let o = n / ((this.scale.x + this.scale.y + this.scale.z) / 3), a = o * o, l = this.isLineSegments ? 2 : 1, c = i.index, d = i.attributes.position;
    if (c !== null) {
      let p = Math.max(0, r.start), f = Math.min(c.count, r.start + r.count);
      for (let m = p, g2 = f - 1; m < g2; m += l) {
        let y3 = c.getX(m), x = c.getX(m + 1), b = Ls(this, t, Gi, a, y3, x, m);
        b && e.push(b);
      }
      if (this.isLineLoop) {
        let m = c.getX(f - 1), g2 = c.getX(p), y3 = Ls(this, t, Gi, a, m, g2, f - 1);
        y3 && e.push(y3);
      }
    } else {
      let p = Math.max(0, r.start), f = Math.min(d.count, r.start + r.count);
      for (let m = p, g2 = f - 1; m < g2; m += l) {
        let y3 = Ls(this, t, Gi, a, m, m + 1, m);
        y3 && e.push(y3);
      }
      if (this.isLineLoop) {
        let m = Ls(this, t, Gi, a, f - 1, p, f - 1);
        m && e.push(m);
      }
    }
  }
  updateMorphTargets() {
    let e = this.geometry.morphAttributes, i = Object.keys(e);
    if (i.length > 0) {
      let s = e[i[0]];
      if (s !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let n = 0, r = s.length; n < r; n++) {
          let o = s[n].name || String(n);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = n;
        }
      }
    }
  }
};
function Ls(h36, t, e, i, s, n, r) {
  let o = h36.geometry.attributes.position;
  if (pn.fromBufferAttribute(o, s), fn.fromBufferAttribute(o, n), e.distanceSqToSegment(pn, fn, dr, mh) > i)
    return;
  dr.applyMatrix4(h36.matrixWorld);
  let l = t.ray.origin.distanceTo(dr);
  if (!(l < t.near || l > t.far))
    return { distance: l, point: mh.clone().applyMatrix4(h36.matrixWorld), index: r, face: null, faceIndex: null, barycoord: null, object: h36 };
}
var yh = new w();
var gh = new w();
var Ht = class extends ge {
  constructor(t, e) {
    super(t, e), this.isLineSegments = true, this.type = "LineSegments";
  }
  computeLineDistances() {
    let t = this.geometry;
    if (t.index === null) {
      let e = t.attributes.position, i = [];
      for (let s = 0, n = e.count; s < n; s += 2)
        yh.fromBufferAttribute(e, s), gh.fromBufferAttribute(e, s + 1), i[s] = s === 0 ? 0 : i[s - 1], i[s + 1] = i[s] + yh.distanceTo(gh);
      t.setAttribute("lineDistance", new B(i, 1));
    } else
      E("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
};
var Jr = class extends ge {
  constructor(t, e) {
    super(t, e), this.isLineLoop = true, this.type = "LineLoop";
  }
};
var mn = class extends ft {
  constructor(t) {
    super(), this.isPointsMaterial = true, this.type = "PointsMaterial", this.color = new V(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = true, this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.size = t.size, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
  }
};
var xh = new U();
var Gr = new Ze();
var Us = new ct();
var Ws = new w();
var Xr = class extends H {
  constructor(t = new q(), e = new mn()) {
    super(), this.isPoints = true, this.type = "Points", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  raycast(t, e) {
    let i = this.geometry, s = this.matrixWorld, n = t.params.Points.threshold, r = i.drawRange;
    if (i.boundingSphere === null && i.computeBoundingSphere(), Us.copy(i.boundingSphere), Us.applyMatrix4(s), Us.radius += n, t.ray.intersectsSphere(Us) === false)
      return;
    xh.copy(s).invert(), Gr.copy(t.ray).applyMatrix4(xh);
    let o = n / ((this.scale.x + this.scale.y + this.scale.z) / 3), a = o * o, l = i.index, u = i.attributes.position;
    if (l !== null) {
      let d = Math.max(0, r.start), p = Math.min(l.count, r.start + r.count);
      for (let f = d, m = p; f < m; f++) {
        let g2 = l.getX(f);
        Ws.fromBufferAttribute(u, g2), bh(Ws, g2, a, s, t, e, this);
      }
    } else {
      let d = Math.max(0, r.start), p = Math.min(u.count, r.start + r.count);
      for (let f = d, m = p; f < m; f++)
        Ws.fromBufferAttribute(u, f), bh(Ws, f, a, s, t, e, this);
    }
  }
  updateMorphTargets() {
    let e = this.geometry.morphAttributes, i = Object.keys(e);
    if (i.length > 0) {
      let s = e[i[0]];
      if (s !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let n = 0, r = s.length; n < r; n++) {
          let o = s[n].name || String(n);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = n;
        }
      }
    }
  }
};
function bh(h36, t, e, i, s, n, r) {
  let o = Gr.distanceSqToPoint(h36);
  if (o < e) {
    let a = new w();
    Gr.closestPointToPoint(h36, a), a.applyMatrix4(i);
    let l = s.ray.origin.distanceTo(a);
    if (l < s.near || l > s.far)
      return;
    n.push({ distance: l, distanceToRay: Math.sqrt(o), point: a, index: t, face: null, faceIndex: null, barycoord: null, object: r });
  }
}
var Zr = class extends ut {
  constructor(t, e, i = En, s, n, r, o = kt, a = kt, l, c = Tr, u = 1) {
    if (c !== Tr && c !== Ac)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    let d = { width: t, height: e, depth: u };
    super(d, s, n, r, o, a, c, i, l), this.isDepthTexture = true, this.flipY = false, this.generateMipmaps = false, this.compareFunction = null;
  }
  copy(t) {
    return super.copy(t), this.source = new fe(Object.assign({}, t.image)), this.compareFunction = t.compareFunction, this;
  }
  toJSON(t) {
    let e = super.toJSON(t);
    return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e;
  }
};
var Ah = class extends Zr {
  constructor(t, e = En, i = Rn, s, n, r = kt, o = kt, a, l = Tr) {
    let c = { width: t, height: t, depth: 1 }, u = [c, c, c, c, c, c];
    super(t, t, e, i, s, n, r, o, a, l), this.image = u, this.isCubeDepthTexture = true, this.isCubeTexture = true;
  }
  get images() {
    return this.image;
  }
  set images(t) {
    this.image = t;
  }
};
var Th = class extends ut {
  constructor(t = null) {
    super(), this.sourceTexture = t, this.isExternalTexture = true;
  }
  copy(t) {
    return super.copy(t), this.sourceTexture = t.sourceTexture, this;
  }
};
var Yr = class h16 extends q {
  constructor(t = 1, e = 1, i = 4, s = 8, n = 1) {
    super(), this.type = "CapsuleGeometry", this.parameters = { radius: t, height: e, capSegments: i, radialSegments: s, heightSegments: n }, e = Math.max(0, e), i = Math.max(1, Math.floor(i)), s = Math.max(3, Math.floor(s)), n = Math.max(1, Math.floor(n));
    let r = [], o = [], a = [], l = [], c = e / 2, u = Math.PI / 2 * t, d = e, p = 2 * u + d, f = i * 2 + n, m = s + 1, g2 = new w(), y3 = new w();
    for (let x = 0; x <= f; x++) {
      let b = 0, M = 0, _2 = 0, v = 0;
      if (x <= i) {
        let T = x / i, C = T * Math.PI / 2;
        M = -c - t * Math.cos(C), _2 = t * Math.sin(C), v = -t * Math.cos(C), b = T * u;
      } else if (x <= i + n) {
        let T = (x - i) / n;
        M = -c + T * e, _2 = t, v = 0, b = u + T * d;
      } else {
        let T = (x - i - n) / i, C = T * Math.PI / 2;
        M = c + t * Math.sin(C), _2 = t * Math.cos(C), v = t * Math.sin(C), b = u + d + T * u;
      }
      let A = Math.max(0, Math.min(1, b / p)), S = 0;
      x === 0 ? S = 0.5 / s : x === f && (S = -0.5 / s);
      for (let T = 0; T <= s; T++) {
        let C = T / s, P = C * Math.PI * 2, D2 = Math.sin(P), J = Math.cos(P);
        y3.x = -_2 * J, y3.y = M, y3.z = _2 * D2, o.push(y3.x, y3.y, y3.z), g2.set(-_2 * J, v, _2 * D2), g2.normalize(), a.push(g2.x, g2.y, g2.z), l.push(C + S, A);
      }
      if (x > 0) {
        let T = (x - 1) * m;
        for (let C = 0; C < s; C++) {
          let P = T + C, D2 = T + C + 1, J = x * m + C, $ = x * m + C + 1;
          r.push(P, D2, J), r.push(D2, $, J);
        }
      }
    }
    this.setIndex(r), this.setAttribute("position", new B(o, 3)), this.setAttribute("normal", new B(a, 3)), this.setAttribute("uv", new B(l, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h16(t.radius, t.height, t.capSegments, t.radialSegments, t.heightSegments);
  }
};
var $r = class h17 extends q {
  constructor(t = 1, e = 32, i = 0, s = Math.PI * 2) {
    super(), this.type = "CircleGeometry", this.parameters = { radius: t, segments: e, thetaStart: i, thetaLength: s }, e = Math.max(3, e);
    let n = [], r = [], o = [], a = [], l = new w(), c = new I();
    r.push(0, 0, 0), o.push(0, 0, 1), a.push(0.5, 0.5);
    for (let u = 0, d = 3; u <= e; u++, d += 3) {
      let p = i + u / e * s;
      l.x = t * Math.cos(p), l.y = t * Math.sin(p), r.push(l.x, l.y, l.z), o.push(0, 0, 1), c.x = (r[d] / t + 1) / 2, c.y = (r[d + 1] / t + 1) / 2, a.push(c.x, c.y);
    }
    for (let u = 1; u <= e; u++)
      n.push(u, u + 1, 0);
    this.setIndex(n), this.setAttribute("position", new B(r, 3)), this.setAttribute("normal", new B(o, 3)), this.setAttribute("uv", new B(a, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h17(t.radius, t.segments, t.thetaStart, t.thetaLength);
  }
};
var yn = class h18 extends q {
  constructor(t = 1, e = 1, i = 1, s = 32, n = 1, r = false, o = 0, a = Math.PI * 2) {
    super(), this.type = "CylinderGeometry", this.parameters = { radiusTop: t, radiusBottom: e, height: i, radialSegments: s, heightSegments: n, openEnded: r, thetaStart: o, thetaLength: a };
    let l = this;
    s = Math.floor(s), n = Math.floor(n);
    let c = [], u = [], d = [], p = [], f = 0, m = [], g2 = i / 2, y3 = 0;
    x(), r === false && (t > 0 && b(true), e > 0 && b(false)), this.setIndex(c), this.setAttribute("position", new B(u, 3)), this.setAttribute("normal", new B(d, 3)), this.setAttribute("uv", new B(p, 2));
    function x() {
      let M = new w(), _2 = new w(), v = 0, A = (e - t) / i;
      for (let S = 0; S <= n; S++) {
        let T = [], C = S / n, P = C * (e - t) + t;
        for (let D2 = 0; D2 <= s; D2++) {
          let J = D2 / s, $ = J * a + o, Z2 = Math.sin($), at = Math.cos($);
          _2.x = P * Z2, _2.y = -C * i + g2, _2.z = P * at, u.push(_2.x, _2.y, _2.z), M.set(Z2, A, at).normalize(), d.push(M.x, M.y, M.z), p.push(J, 1 - C), T.push(f++);
        }
        m.push(T);
      }
      for (let S = 0; S < s; S++)
        for (let T = 0; T < n; T++) {
          let C = m[T][S], P = m[T + 1][S], D2 = m[T + 1][S + 1], J = m[T][S + 1];
          (t > 0 || T !== 0) && (c.push(C, P, J), v += 3), (e > 0 || T !== n - 1) && (c.push(P, D2, J), v += 3);
        }
      l.addGroup(y3, v, 0), y3 += v;
    }
    function b(M) {
      let _2 = f, v = new I(), A = new w(), S = 0, T = M === true ? t : e, C = M === true ? 1 : -1;
      for (let D2 = 1; D2 <= s; D2++)
        u.push(0, g2 * C, 0), d.push(0, C, 0), p.push(0.5, 0.5), f++;
      let P = f;
      for (let D2 = 0; D2 <= s; D2++) {
        let $ = D2 / s * a + o, Z2 = Math.cos($), at = Math.sin($);
        A.x = T * at, A.y = g2 * C, A.z = T * Z2, u.push(A.x, A.y, A.z), d.push(0, C, 0), v.x = Z2 * 0.5 + 0.5, v.y = at * 0.5 * C + 0.5, p.push(v.x, v.y), f++;
      }
      for (let D2 = 0; D2 < s; D2++) {
        let J = _2 + D2, $ = P + D2;
        M === true ? c.push($, $ + 1, J) : c.push($ + 1, $, J), S += 3;
      }
      l.addGroup(y3, S, M === true ? 1 : 2), y3 += S;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h18(t.radiusTop, t.radiusBottom, t.height, t.radialSegments, t.heightSegments, t.openEnded, t.thetaStart, t.thetaLength);
  }
};
var gn = class h19 extends yn {
  constructor(t = 1, e = 1, i = 32, s = 1, n = false, r = 0, o = Math.PI * 2) {
    super(0, t, e, i, s, n, r, o), this.type = "ConeGeometry", this.parameters = { radius: t, height: e, radialSegments: i, heightSegments: s, openEnded: n, thetaStart: r, thetaLength: o };
  }
  static fromJSON(t) {
    return new h19(t.radius, t.height, t.radialSegments, t.heightSegments, t.openEnded, t.thetaStart, t.thetaLength);
  }
};
var $e = class h20 extends q {
  constructor(t = [], e = [], i = 1, s = 0) {
    super(), this.type = "PolyhedronGeometry", this.parameters = { vertices: t, indices: e, radius: i, detail: s };
    let n = [], r = [];
    o(s), l(i), c(), this.setAttribute("position", new B(n, 3)), this.setAttribute("normal", new B(n.slice(), 3)), this.setAttribute("uv", new B(r, 2)), s === 0 ? this.computeVertexNormals() : this.normalizeNormals();
    function o(x) {
      let b = new w(), M = new w(), _2 = new w();
      for (let v = 0; v < e.length; v += 3)
        p(e[v + 0], b), p(e[v + 1], M), p(e[v + 2], _2), a(b, M, _2, x);
    }
    function a(x, b, M, _2) {
      let v = _2 + 1, A = [];
      for (let S = 0; S <= v; S++) {
        A[S] = [];
        let T = x.clone().lerp(M, S / v), C = b.clone().lerp(M, S / v), P = v - S;
        for (let D2 = 0; D2 <= P; D2++)
          D2 === 0 && S === v ? A[S][D2] = T : A[S][D2] = T.clone().lerp(C, D2 / P);
      }
      for (let S = 0; S < v; S++)
        for (let T = 0; T < 2 * (v - S) - 1; T++) {
          let C = Math.floor(T / 2);
          T % 2 === 0 ? (d(A[S][C + 1]), d(A[S + 1][C]), d(A[S][C])) : (d(A[S][C + 1]), d(A[S + 1][C + 1]), d(A[S + 1][C]));
        }
    }
    function l(x) {
      let b = new w();
      for (let M = 0; M < n.length; M += 3)
        b.x = n[M + 0], b.y = n[M + 1], b.z = n[M + 2], b.normalize().multiplyScalar(x), n[M + 0] = b.x, n[M + 1] = b.y, n[M + 2] = b.z;
    }
    function c() {
      let x = new w();
      for (let b = 0; b < n.length; b += 3) {
        x.x = n[b + 0], x.y = n[b + 1], x.z = n[b + 2];
        let M = g2(x) / 2 / Math.PI + 0.5, _2 = y3(x) / Math.PI + 0.5;
        r.push(M, 1 - _2);
      }
      f(), u();
    }
    function u() {
      for (let x = 0; x < r.length; x += 6) {
        let b = r[x + 0], M = r[x + 2], _2 = r[x + 4], v = Math.max(b, M, _2), A = Math.min(b, M, _2);
        v > 0.9 && A < 0.1 && (b < 0.2 && (r[x + 0] += 1), M < 0.2 && (r[x + 2] += 1), _2 < 0.2 && (r[x + 4] += 1));
      }
    }
    function d(x) {
      n.push(x.x, x.y, x.z);
    }
    function p(x, b) {
      let M = x * 3;
      b.x = t[M + 0], b.y = t[M + 1], b.z = t[M + 2];
    }
    function f() {
      let x = new w(), b = new w(), M = new w(), _2 = new w(), v = new I(), A = new I(), S = new I();
      for (let T = 0, C = 0; T < n.length; T += 9, C += 6) {
        x.set(n[T + 0], n[T + 1], n[T + 2]), b.set(n[T + 3], n[T + 4], n[T + 5]), M.set(n[T + 6], n[T + 7], n[T + 8]), v.set(r[C + 0], r[C + 1]), A.set(r[C + 2], r[C + 3]), S.set(r[C + 4], r[C + 5]), _2.copy(x).add(b).add(M).divideScalar(3);
        let P = g2(_2);
        m(v, C + 0, x, P), m(A, C + 2, b, P), m(S, C + 4, M, P);
      }
    }
    function m(x, b, M, _2) {
      _2 < 0 && x.x === 1 && (r[b] = x.x - 1), M.x === 0 && M.z === 0 && (r[b] = _2 / 2 / Math.PI + 0.5);
    }
    function g2(x) {
      return Math.atan2(x.z, -x.x);
    }
    function y3(x) {
      return Math.atan2(-x.y, Math.sqrt(x.x * x.x + x.z * x.z));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h20(t.vertices, t.indices, t.radius, t.detail);
  }
};
var jr = class h21 extends $e {
  constructor(t = 1, e = 0) {
    let i = (1 + Math.sqrt(5)) / 2, s = 1 / i, n = [-1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 0, -s, -i, 0, -s, i, 0, s, -i, 0, s, i, -s, -i, 0, -s, i, 0, s, -i, 0, s, i, 0, -i, 0, -s, i, 0, -s, -i, 0, s, i, 0, s], r = [3, 11, 7, 3, 7, 15, 3, 15, 13, 7, 19, 17, 7, 17, 6, 7, 6, 15, 17, 4, 8, 17, 8, 10, 17, 10, 6, 8, 0, 16, 8, 16, 2, 8, 2, 10, 0, 12, 1, 0, 1, 18, 0, 18, 16, 6, 10, 2, 6, 2, 13, 6, 13, 15, 2, 16, 18, 2, 18, 3, 2, 3, 13, 18, 1, 9, 18, 9, 11, 18, 11, 3, 4, 14, 12, 4, 12, 0, 4, 0, 8, 11, 9, 5, 11, 5, 19, 11, 19, 7, 19, 5, 14, 19, 14, 4, 19, 4, 17, 1, 12, 14, 1, 14, 5, 1, 5, 9];
    super(n, r, t, e), this.type = "DodecahedronGeometry", this.parameters = { radius: t, detail: e };
  }
  static fromJSON(t) {
    return new h21(t.radius, t.detail);
  }
};
var qs = new w();
var Js = new w();
var pr = new w();
var Gs = new de();
var Qr = class extends q {
  constructor(t = null, e = 1) {
    if (super(), this.type = "EdgesGeometry", this.parameters = { geometry: t, thresholdAngle: e }, t !== null) {
      let s = Math.pow(10, 4), n = Math.cos(He * e), r = t.getIndex(), o = t.getAttribute("position"), a = r ? r.count : o.count, l = [0, 0, 0], c = ["a", "b", "c"], u = new Array(3), d = {}, p = [];
      for (let f = 0; f < a; f += 3) {
        r ? (l[0] = r.getX(f), l[1] = r.getX(f + 1), l[2] = r.getX(f + 2)) : (l[0] = f, l[1] = f + 1, l[2] = f + 2);
        let { a: m, b: g2, c: y3 } = Gs;
        if (m.fromBufferAttribute(o, l[0]), g2.fromBufferAttribute(o, l[1]), y3.fromBufferAttribute(o, l[2]), Gs.getNormal(pr), u[0] = `${Math.round(m.x * s)},${Math.round(m.y * s)},${Math.round(m.z * s)}`, u[1] = `${Math.round(g2.x * s)},${Math.round(g2.y * s)},${Math.round(g2.z * s)}`, u[2] = `${Math.round(y3.x * s)},${Math.round(y3.y * s)},${Math.round(y3.z * s)}`, !(u[0] === u[1] || u[1] === u[2] || u[2] === u[0]))
          for (let x = 0; x < 3; x++) {
            let b = (x + 1) % 3, M = u[x], _2 = u[b], v = Gs[c[x]], A = Gs[c[b]], S = `${M}_${_2}`, T = `${_2}_${M}`;
            T in d && d[T] ? (pr.dot(d[T].normal) <= n && (p.push(v.x, v.y, v.z), p.push(A.x, A.y, A.z)), d[T] = null) : S in d || (d[S] = { index0: l[x], index1: l[b], normal: pr.clone() });
          }
      }
      for (let f in d)
        if (d[f]) {
          let { index0: m, index1: g2 } = d[f];
          qs.fromBufferAttribute(o, m), Js.fromBufferAttribute(o, g2), p.push(qs.x, qs.y, qs.z), p.push(Js.x, Js.y, Js.z);
        }
      this.setAttribute("position", new B(p, 3));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
};
var Lt = class {
  constructor() {
    this.type = "Curve", this.arcLengthDivisions = 200, this.needsUpdate = false, this.cacheArcLengths = null;
  }
  getPoint() {
    E("Curve: .getPoint() not implemented.");
  }
  getPointAt(t, e) {
    let i = this.getUtoTmapping(t);
    return this.getPoint(i, e);
  }
  getPoints(t = 5) {
    let e = [];
    for (let i = 0; i <= t; i++)
      e.push(this.getPoint(i / t));
    return e;
  }
  getSpacedPoints(t = 5) {
    let e = [];
    for (let i = 0; i <= t; i++)
      e.push(this.getPointAt(i / t));
    return e;
  }
  getLength() {
    let t = this.getLengths();
    return t[t.length - 1];
  }
  getLengths(t = this.arcLengthDivisions) {
    if (this.cacheArcLengths && this.cacheArcLengths.length === t + 1 && !this.needsUpdate)
      return this.cacheArcLengths;
    this.needsUpdate = false;
    let e = [], i, s = this.getPoint(0), n = 0;
    e.push(0);
    for (let r = 1; r <= t; r++)
      i = this.getPoint(r / t), n += i.distanceTo(s), e.push(n), s = i;
    return this.cacheArcLengths = e, e;
  }
  updateArcLengths() {
    this.needsUpdate = true, this.getLengths();
  }
  getUtoTmapping(t, e = null) {
    let i = this.getLengths(), s = 0, n = i.length, r;
    e ? r = e : r = t * i[n - 1];
    let o = 0, a = n - 1, l;
    for (; o <= a; )
      if (s = Math.floor(o + (a - o) / 2), l = i[s] - r, l < 0)
        o = s + 1;
      else if (l > 0)
        a = s - 1;
      else {
        a = s;
        break;
      }
    if (s = a, i[s] === r)
      return s / (n - 1);
    let c = i[s], d = i[s + 1] - c, p = (r - c) / d;
    return (s + p) / (n - 1);
  }
  getTangent(t, e) {
    let s = t - 1e-4, n = t + 1e-4;
    s < 0 && (s = 0), n > 1 && (n = 1);
    let r = this.getPoint(s), o = this.getPoint(n), a = e || (r.isVector2 ? new I() : new w());
    return a.copy(o).sub(r).normalize(), a;
  }
  getTangentAt(t, e) {
    let i = this.getUtoTmapping(t);
    return this.getTangent(i, e);
  }
  computeFrenetFrames(t, e = false) {
    let i = new w(), s = [], n = [], r = [], o = new w(), a = new U();
    for (let p = 0; p <= t; p++) {
      let f = p / t;
      s[p] = this.getTangentAt(f, new w());
    }
    n[0] = new w(), r[0] = new w();
    let l = Number.MAX_VALUE, c = Math.abs(s[0].x), u = Math.abs(s[0].y), d = Math.abs(s[0].z);
    c <= l && (l = c, i.set(1, 0, 0)), u <= l && (l = u, i.set(0, 1, 0)), d <= l && i.set(0, 0, 1), o.crossVectors(s[0], i).normalize(), n[0].crossVectors(s[0], o), r[0].crossVectors(s[0], n[0]);
    for (let p = 1; p <= t; p++) {
      if (n[p] = n[p - 1].clone(), r[p] = r[p - 1].clone(), o.crossVectors(s[p - 1], s[p]), o.length() > Number.EPSILON) {
        o.normalize();
        let f = Math.acos(N(s[p - 1].dot(s[p]), -1, 1));
        n[p].applyMatrix4(a.makeRotationAxis(o, f));
      }
      r[p].crossVectors(s[p], n[p]);
    }
    if (e === true) {
      let p = Math.acos(N(n[0].dot(n[t]), -1, 1));
      p /= t, s[0].dot(o.crossVectors(n[0], n[t])) > 0 && (p = -p);
      for (let f = 1; f <= t; f++)
        n[f].applyMatrix4(a.makeRotationAxis(s[f], p * f)), r[f].crossVectors(s[f], n[f]);
    }
    return { tangents: s, normals: n, binormals: r };
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.arcLengthDivisions = t.arcLengthDivisions, this;
  }
  toJSON() {
    let t = { metadata: { version: 4.7, type: "Curve", generator: "Curve.toJSON" } };
    return t.arcLengthDivisions = this.arcLengthDivisions, t.type = this.type, t;
  }
  fromJSON(t) {
    return this.arcLengthDivisions = t.arcLengthDivisions, this;
  }
};
var as = class extends Lt {
  constructor(t = 0, e = 0, i = 1, s = 1, n = 0, r = Math.PI * 2, o = false, a = 0) {
    super(), this.isEllipseCurve = true, this.type = "EllipseCurve", this.aX = t, this.aY = e, this.xRadius = i, this.yRadius = s, this.aStartAngle = n, this.aEndAngle = r, this.aClockwise = o, this.aRotation = a;
  }
  getPoint(t, e = new I()) {
    let i = e, s = Math.PI * 2, n = this.aEndAngle - this.aStartAngle, r = Math.abs(n) < Number.EPSILON;
    for (; n < 0; )
      n += s;
    for (; n > s; )
      n -= s;
    n < Number.EPSILON && (r ? n = 0 : n = s), this.aClockwise === true && !r && (n === s ? n = -s : n = n - s);
    let o = this.aStartAngle + t * n, a = this.aX + this.xRadius * Math.cos(o), l = this.aY + this.yRadius * Math.sin(o);
    if (this.aRotation !== 0) {
      let c = Math.cos(this.aRotation), u = Math.sin(this.aRotation), d = a - this.aX, p = l - this.aY;
      a = d * c - p * u + this.aX, l = d * u + p * c + this.aY;
    }
    return i.set(a, l);
  }
  copy(t) {
    return super.copy(t), this.aX = t.aX, this.aY = t.aY, this.xRadius = t.xRadius, this.yRadius = t.yRadius, this.aStartAngle = t.aStartAngle, this.aEndAngle = t.aEndAngle, this.aClockwise = t.aClockwise, this.aRotation = t.aRotation, this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.aX = this.aX, t.aY = this.aY, t.xRadius = this.xRadius, t.yRadius = this.yRadius, t.aStartAngle = this.aStartAngle, t.aEndAngle = this.aEndAngle, t.aClockwise = this.aClockwise, t.aRotation = this.aRotation, t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.aX = t.aX, this.aY = t.aY, this.xRadius = t.xRadius, this.yRadius = t.yRadius, this.aStartAngle = t.aStartAngle, this.aEndAngle = t.aEndAngle, this.aClockwise = t.aClockwise, this.aRotation = t.aRotation, this;
  }
};
var Kr = class extends as {
  constructor(t, e, i, s, n, r) {
    super(t, e, i, i, s, n, r), this.isArcCurve = true, this.type = "ArcCurve";
  }
};
function ra() {
  let h36 = 0, t = 0, e = 0, i = 0;
  function s(n, r, o, a) {
    h36 = n, t = o, e = -3 * n + 3 * r - 2 * o - a, i = 2 * n - 2 * r + o + a;
  }
  return { initCatmullRom: function(n, r, o, a, l) {
    s(r, o, l * (o - n), l * (a - r));
  }, initNonuniformCatmullRom: function(n, r, o, a, l, c, u) {
    let d = (r - n) / l - (o - n) / (l + c) + (o - r) / c, p = (o - r) / c - (a - r) / (c + u) + (a - o) / u;
    d *= c, p *= c, s(r, o, d, p);
  }, calc: function(n) {
    let r = n * n, o = r * n;
    return h36 + t * n + e * r + i * o;
  } };
}
var Xs = new w();
var fr = new ra();
var mr = new ra();
var yr = new ra();
var to = class extends Lt {
  constructor(t = [], e = false, i = "centripetal", s = 0.5) {
    super(), this.isCatmullRomCurve3 = true, this.type = "CatmullRomCurve3", this.points = t, this.closed = e, this.curveType = i, this.tension = s;
  }
  getPoint(t, e = new w()) {
    let i = e, s = this.points, n = s.length, r = (n - (this.closed ? 0 : 1)) * t, o = Math.floor(r), a = r - o;
    this.closed ? o += o > 0 ? 0 : (Math.floor(Math.abs(o) / n) + 1) * n : a === 0 && o === n - 1 && (o = n - 2, a = 1);
    let l, c;
    this.closed || o > 0 ? l = s[(o - 1) % n] : (Xs.subVectors(s[0], s[1]).add(s[0]), l = Xs);
    let u = s[o % n], d = s[(o + 1) % n];
    if (this.closed || o + 2 < n ? c = s[(o + 2) % n] : (Xs.subVectors(s[n - 1], s[n - 2]).add(s[n - 1]), c = Xs), this.curveType === "centripetal" || this.curveType === "chordal") {
      let p = this.curveType === "chordal" ? 0.5 : 0.25, f = Math.pow(l.distanceToSquared(u), p), m = Math.pow(u.distanceToSquared(d), p), g2 = Math.pow(d.distanceToSquared(c), p);
      m < 1e-4 && (m = 1), f < 1e-4 && (f = m), g2 < 1e-4 && (g2 = m), fr.initNonuniformCatmullRom(l.x, u.x, d.x, c.x, f, m, g2), mr.initNonuniformCatmullRom(l.y, u.y, d.y, c.y, f, m, g2), yr.initNonuniformCatmullRom(l.z, u.z, d.z, c.z, f, m, g2);
    } else
      this.curveType === "catmullrom" && (fr.initCatmullRom(l.x, u.x, d.x, c.x, this.tension), mr.initCatmullRom(l.y, u.y, d.y, c.y, this.tension), yr.initCatmullRom(l.z, u.z, d.z, c.z, this.tension));
    return i.set(fr.calc(a), mr.calc(a), yr.calc(a)), i;
  }
  copy(t) {
    super.copy(t), this.points = [];
    for (let e = 0, i = t.points.length; e < i; e++) {
      let s = t.points[e];
      this.points.push(s.clone());
    }
    return this.closed = t.closed, this.curveType = t.curveType, this.tension = t.tension, this;
  }
  toJSON() {
    let t = super.toJSON();
    t.points = [];
    for (let e = 0, i = this.points.length; e < i; e++) {
      let s = this.points[e];
      t.points.push(s.toArray());
    }
    return t.closed = this.closed, t.curveType = this.curveType, t.tension = this.tension, t;
  }
  fromJSON(t) {
    super.fromJSON(t), this.points = [];
    for (let e = 0, i = t.points.length; e < i; e++) {
      let s = t.points[e];
      this.points.push(new w().fromArray(s));
    }
    return this.closed = t.closed, this.curveType = t.curveType, this.tension = t.tension, this;
  }
};
function Ih(h36, t, e, i, s) {
  let n = (i - t) * 0.5, r = (s - e) * 0.5, o = h36 * h36, a = h36 * o;
  return (2 * e - 2 * i + n + r) * a + (-3 * e + 3 * i - 2 * n - r) * o + n * h36 + e;
}
function ud(h36, t) {
  let e = 1 - h36;
  return e * e * t;
}
function dd(h36, t) {
  return 2 * (1 - h36) * h36 * t;
}
function pd(h36, t) {
  return h36 * h36 * t;
}
function Yi(h36, t, e, i) {
  return ud(h36, t) + dd(h36, e) + pd(h36, i);
}
function fd(h36, t) {
  let e = 1 - h36;
  return e * e * e * t;
}
function md(h36, t) {
  let e = 1 - h36;
  return 3 * e * e * h36 * t;
}
function yd(h36, t) {
  return 3 * (1 - h36) * h36 * h36 * t;
}
function gd(h36, t) {
  return h36 * h36 * h36 * t;
}
function $i(h36, t, e, i, s) {
  return fd(h36, t) + md(h36, e) + yd(h36, i) + gd(h36, s);
}
var xn = class extends Lt {
  constructor(t = new I(), e = new I(), i = new I(), s = new I()) {
    super(), this.isCubicBezierCurve = true, this.type = "CubicBezierCurve", this.v0 = t, this.v1 = e, this.v2 = i, this.v3 = s;
  }
  getPoint(t, e = new I()) {
    let i = e, s = this.v0, n = this.v1, r = this.v2, o = this.v3;
    return i.set($i(t, s.x, n.x, r.x, o.x), $i(t, s.y, n.y, r.y, o.y)), i;
  }
  copy(t) {
    return super.copy(t), this.v0.copy(t.v0), this.v1.copy(t.v1), this.v2.copy(t.v2), this.v3.copy(t.v3), this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.v0 = this.v0.toArray(), t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t.v3 = this.v3.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v0.fromArray(t.v0), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this.v3.fromArray(t.v3), this;
  }
};
var eo = class extends Lt {
  constructor(t = new w(), e = new w(), i = new w(), s = new w()) {
    super(), this.isCubicBezierCurve3 = true, this.type = "CubicBezierCurve3", this.v0 = t, this.v1 = e, this.v2 = i, this.v3 = s;
  }
  getPoint(t, e = new w()) {
    let i = e, s = this.v0, n = this.v1, r = this.v2, o = this.v3;
    return i.set($i(t, s.x, n.x, r.x, o.x), $i(t, s.y, n.y, r.y, o.y), $i(t, s.z, n.z, r.z, o.z)), i;
  }
  copy(t) {
    return super.copy(t), this.v0.copy(t.v0), this.v1.copy(t.v1), this.v2.copy(t.v2), this.v3.copy(t.v3), this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.v0 = this.v0.toArray(), t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t.v3 = this.v3.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v0.fromArray(t.v0), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this.v3.fromArray(t.v3), this;
  }
};
var bn = class extends Lt {
  constructor(t = new I(), e = new I()) {
    super(), this.isLineCurve = true, this.type = "LineCurve", this.v1 = t, this.v2 = e;
  }
  getPoint(t, e = new I()) {
    let i = e;
    return t === 1 ? i.copy(this.v2) : (i.copy(this.v2).sub(this.v1), i.multiplyScalar(t).add(this.v1)), i;
  }
  getPointAt(t, e) {
    return this.getPoint(t, e);
  }
  getTangent(t, e = new I()) {
    return e.subVectors(this.v2, this.v1).normalize();
  }
  getTangentAt(t, e) {
    return this.getTangent(t, e);
  }
  copy(t) {
    return super.copy(t), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this;
  }
};
var io = class extends Lt {
  constructor(t = new w(), e = new w()) {
    super(), this.isLineCurve3 = true, this.type = "LineCurve3", this.v1 = t, this.v2 = e;
  }
  getPoint(t, e = new w()) {
    let i = e;
    return t === 1 ? i.copy(this.v2) : (i.copy(this.v2).sub(this.v1), i.multiplyScalar(t).add(this.v1)), i;
  }
  getPointAt(t, e) {
    return this.getPoint(t, e);
  }
  getTangent(t, e = new w()) {
    return e.subVectors(this.v2, this.v1).normalize();
  }
  getTangentAt(t, e) {
    return this.getTangent(t, e);
  }
  copy(t) {
    return super.copy(t), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this;
  }
};
var wn = class extends Lt {
  constructor(t = new I(), e = new I(), i = new I()) {
    super(), this.isQuadraticBezierCurve = true, this.type = "QuadraticBezierCurve", this.v0 = t, this.v1 = e, this.v2 = i;
  }
  getPoint(t, e = new I()) {
    let i = e, s = this.v0, n = this.v1, r = this.v2;
    return i.set(Yi(t, s.x, n.x, r.x), Yi(t, s.y, n.y, r.y)), i;
  }
  copy(t) {
    return super.copy(t), this.v0.copy(t.v0), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.v0 = this.v0.toArray(), t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v0.fromArray(t.v0), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this;
  }
};
var Mn = class extends Lt {
  constructor(t = new w(), e = new w(), i = new w()) {
    super(), this.isQuadraticBezierCurve3 = true, this.type = "QuadraticBezierCurve3", this.v0 = t, this.v1 = e, this.v2 = i;
  }
  getPoint(t, e = new w()) {
    let i = e, s = this.v0, n = this.v1, r = this.v2;
    return i.set(Yi(t, s.x, n.x, r.x), Yi(t, s.y, n.y, r.y), Yi(t, s.z, n.z, r.z)), i;
  }
  copy(t) {
    return super.copy(t), this.v0.copy(t.v0), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.v0 = this.v0.toArray(), t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v0.fromArray(t.v0), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this;
  }
};
var _n = class extends Lt {
  constructor(t = []) {
    super(), this.isSplineCurve = true, this.type = "SplineCurve", this.points = t;
  }
  getPoint(t, e = new I()) {
    let i = e, s = this.points, n = (s.length - 1) * t, r = Math.floor(n), o = n - r, a = s[r === 0 ? r : r - 1], l = s[r], c = s[r > s.length - 2 ? s.length - 1 : r + 1], u = s[r > s.length - 3 ? s.length - 1 : r + 2];
    return i.set(Ih(o, a.x, l.x, c.x, u.x), Ih(o, a.y, l.y, c.y, u.y)), i;
  }
  copy(t) {
    super.copy(t), this.points = [];
    for (let e = 0, i = t.points.length; e < i; e++) {
      let s = t.points[e];
      this.points.push(s.clone());
    }
    return this;
  }
  toJSON() {
    let t = super.toJSON();
    t.points = [];
    for (let e = 0, i = this.points.length; e < i; e++) {
      let s = this.points[e];
      t.points.push(s.toArray());
    }
    return t;
  }
  fromJSON(t) {
    super.fromJSON(t), this.points = [];
    for (let e = 0, i = t.points.length; e < i; e++) {
      let s = t.points[e];
      this.points.push(new I().fromArray(s));
    }
    return this;
  }
};
var vn = Object.freeze({ __proto__: null, ArcCurve: Kr, CatmullRomCurve3: to, CubicBezierCurve: xn, CubicBezierCurve3: eo, EllipseCurve: as, LineCurve: bn, LineCurve3: io, QuadraticBezierCurve: wn, QuadraticBezierCurve3: Mn, SplineCurve: _n });
var so = class extends Lt {
  constructor() {
    super(), this.type = "CurvePath", this.curves = [], this.autoClose = false;
  }
  add(t) {
    this.curves.push(t);
  }
  closePath() {
    let t = this.curves[0].getPoint(0), e = this.curves[this.curves.length - 1].getPoint(1);
    if (!t.equals(e)) {
      let i = t.isVector2 === true ? "LineCurve" : "LineCurve3";
      this.curves.push(new vn[i](e, t));
    }
    return this;
  }
  getPoint(t, e) {
    let i = t * this.getLength(), s = this.getCurveLengths(), n = 0;
    for (; n < s.length; ) {
      if (s[n] >= i) {
        let r = s[n] - i, o = this.curves[n], a = o.getLength(), l = a === 0 ? 0 : 1 - r / a;
        return o.getPointAt(l, e);
      }
      n++;
    }
    return null;
  }
  getLength() {
    let t = this.getCurveLengths();
    return t[t.length - 1];
  }
  updateArcLengths() {
    this.needsUpdate = true, this.cacheLengths = null, this.getCurveLengths();
  }
  getCurveLengths() {
    if (this.cacheLengths && this.cacheLengths.length === this.curves.length)
      return this.cacheLengths;
    let t = [], e = 0;
    for (let i = 0, s = this.curves.length; i < s; i++)
      e += this.curves[i].getLength(), t.push(e);
    return this.cacheLengths = t, t;
  }
  getSpacedPoints(t = 40) {
    let e = [];
    for (let i = 0; i <= t; i++)
      e.push(this.getPoint(i / t));
    return this.autoClose && e.push(e[0]), e;
  }
  getPoints(t = 12) {
    let e = [], i;
    for (let s = 0, n = this.curves; s < n.length; s++) {
      let r = n[s], o = r.isEllipseCurve ? t * 2 : r.isLineCurve || r.isLineCurve3 ? 1 : r.isSplineCurve ? t * r.points.length : t, a = r.getPoints(o);
      for (let l = 0; l < a.length; l++) {
        let c = a[l];
        i && i.equals(c) || (e.push(c), i = c);
      }
    }
    return this.autoClose && e.length > 1 && !e[e.length - 1].equals(e[0]) && e.push(e[0]), e;
  }
  copy(t) {
    super.copy(t), this.curves = [];
    for (let e = 0, i = t.curves.length; e < i; e++) {
      let s = t.curves[e];
      this.curves.push(s.clone());
    }
    return this.autoClose = t.autoClose, this;
  }
  toJSON() {
    let t = super.toJSON();
    t.autoClose = this.autoClose, t.curves = [];
    for (let e = 0, i = this.curves.length; e < i; e++) {
      let s = this.curves[e];
      t.curves.push(s.toJSON());
    }
    return t;
  }
  fromJSON(t) {
    super.fromJSON(t), this.autoClose = t.autoClose, this.curves = [];
    for (let e = 0, i = t.curves.length; e < i; e++) {
      let s = t.curves[e];
      this.curves.push(new vn[s.type]().fromJSON(s));
    }
    return this;
  }
};
var hs = class extends so {
  constructor(t) {
    super(), this.type = "Path", this.currentPoint = new I(), t && this.setFromPoints(t);
  }
  setFromPoints(t) {
    this.moveTo(t[0].x, t[0].y);
    for (let e = 1, i = t.length; e < i; e++)
      this.lineTo(t[e].x, t[e].y);
    return this;
  }
  moveTo(t, e) {
    return this.currentPoint.set(t, e), this;
  }
  lineTo(t, e) {
    let i = new bn(this.currentPoint.clone(), new I(t, e));
    return this.curves.push(i), this.currentPoint.set(t, e), this;
  }
  quadraticCurveTo(t, e, i, s) {
    let n = new wn(this.currentPoint.clone(), new I(t, e), new I(i, s));
    return this.curves.push(n), this.currentPoint.set(i, s), this;
  }
  bezierCurveTo(t, e, i, s, n, r) {
    let o = new xn(this.currentPoint.clone(), new I(t, e), new I(i, s), new I(n, r));
    return this.curves.push(o), this.currentPoint.set(n, r), this;
  }
  splineThru(t) {
    let e = [this.currentPoint.clone()].concat(t), i = new _n(e);
    return this.curves.push(i), this.currentPoint.copy(t[t.length - 1]), this;
  }
  arc(t, e, i, s, n, r) {
    let o = this.currentPoint.x, a = this.currentPoint.y;
    return this.absarc(t + o, e + a, i, s, n, r), this;
  }
  absarc(t, e, i, s, n, r) {
    return this.absellipse(t, e, i, i, s, n, r), this;
  }
  ellipse(t, e, i, s, n, r, o, a) {
    let l = this.currentPoint.x, c = this.currentPoint.y;
    return this.absellipse(t + l, e + c, i, s, n, r, o, a), this;
  }
  absellipse(t, e, i, s, n, r, o, a) {
    let l = new as(t, e, i, s, n, r, o, a);
    if (this.curves.length > 0) {
      let u = l.getPoint(0);
      u.equals(this.currentPoint) || this.lineTo(u.x, u.y);
    }
    this.curves.push(l);
    let c = l.getPoint(1);
    return this.currentPoint.copy(c), this;
  }
  copy(t) {
    return super.copy(t), this.currentPoint.copy(t.currentPoint), this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.currentPoint = this.currentPoint.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.currentPoint.fromArray(t.currentPoint), this;
  }
};
var Ie = class extends hs {
  constructor(t) {
    super(t), this.uuid = Bt(), this.type = "Shape", this.holes = [];
  }
  getPointsHoles(t) {
    let e = [];
    for (let i = 0, s = this.holes.length; i < s; i++)
      e[i] = this.holes[i].getPoints(t);
    return e;
  }
  extractPoints(t) {
    return { shape: this.getPoints(t), holes: this.getPointsHoles(t) };
  }
  copy(t) {
    super.copy(t), this.holes = [];
    for (let e = 0, i = t.holes.length; e < i; e++) {
      let s = t.holes[e];
      this.holes.push(s.clone());
    }
    return this;
  }
  toJSON() {
    let t = super.toJSON();
    t.uuid = this.uuid, t.holes = [];
    for (let e = 0, i = this.holes.length; e < i; e++) {
      let s = this.holes[e];
      t.holes.push(s.toJSON());
    }
    return t;
  }
  fromJSON(t) {
    super.fromJSON(t), this.uuid = t.uuid, this.holes = [];
    for (let e = 0, i = t.holes.length; e < i; e++) {
      let s = t.holes[e];
      this.holes.push(new hs().fromJSON(s));
    }
    return this;
  }
};
function xd(h36, t, e = 2) {
  let i = t && t.length, s = i ? t[0] * e : h36.length, n = Zl(h36, 0, s, e, true), r = [];
  if (!n || n.next === n.prev)
    return r;
  let o, a, l;
  if (i && (n = vd(h36, t, n, e)), h36.length > 80 * e) {
    o = h36[0], a = h36[1];
    let c = o, u = a;
    for (let d = e; d < s; d += e) {
      let p = h36[d], f = h36[d + 1];
      p < o && (o = p), f < a && (a = f), p > c && (c = p), f > u && (u = f);
    }
    l = Math.max(c - o, u - a), l = l !== 0 ? 32767 / l : 0;
  }
  return ls(n, r, e, o, a, l, 0), r;
}
function Zl(h36, t, e, i, s) {
  let n;
  if (s === Rd(h36, t, e, i) > 0)
    for (let r = t; r < e; r += i)
      n = Ch(r / i | 0, h36[r], h36[r + 1], n);
  else
    for (let r = e - i; r >= t; r -= i)
      n = Ch(r / i | 0, h36[r], h36[r + 1], n);
  return n && Ti(n, n.next) && (us(n), n = n.next), n;
}
function je(h36, t) {
  if (!h36)
    return h36;
  t || (t = h36);
  let e = h36, i;
  do
    if (i = false, !e.steiner && (Ti(e, e.next) || tt(e.prev, e, e.next) === 0)) {
      if (us(e), e = t = e.prev, e === e.next)
        break;
      i = true;
    } else
      e = e.next;
  while (i || e !== t);
  return t;
}
function ls(h36, t, e, i, s, n, r) {
  if (!h36)
    return;
  !r && n && Cd(h36, i, s, n);
  let o = h36;
  for (; h36.prev !== h36.next; ) {
    let a = h36.prev, l = h36.next;
    if (n ? wd(h36, i, s, n) : bd(h36)) {
      t.push(a.i, h36.i, l.i), us(h36), h36 = l.next, o = l.next;
      continue;
    }
    if (h36 = l, h36 === o) {
      r ? r === 1 ? (h36 = Md(je(h36), t), ls(h36, t, e, i, s, n, 2)) : r === 2 && _d(h36, t, e, i, s, n) : ls(je(h36), t, e, i, s, n, 1);
      break;
    }
  }
}
function bd(h36) {
  let t = h36.prev, e = h36, i = h36.next;
  if (tt(t, e, i) >= 0)
    return false;
  let s = t.x, n = e.x, r = i.x, o = t.y, a = e.y, l = i.y, c = Math.min(s, n, r), u = Math.min(o, a, l), d = Math.max(s, n, r), p = Math.max(o, a, l), f = i.next;
  for (; f !== t; ) {
    if (f.x >= c && f.x <= d && f.y >= u && f.y <= p && Hi(s, o, n, a, r, l, f.x, f.y) && tt(f.prev, f, f.next) >= 0)
      return false;
    f = f.next;
  }
  return true;
}
function wd(h36, t, e, i) {
  let s = h36.prev, n = h36, r = h36.next;
  if (tt(s, n, r) >= 0)
    return false;
  let o = s.x, a = n.x, l = r.x, c = s.y, u = n.y, d = r.y, p = Math.min(o, a, l), f = Math.min(c, u, d), m = Math.max(o, a, l), g2 = Math.max(c, u, d), y3 = no(p, f, t, e, i), x = no(m, g2, t, e, i), b = h36.prevZ, M = h36.nextZ;
  for (; b && b.z >= y3 && M && M.z <= x; ) {
    if (b.x >= p && b.x <= m && b.y >= f && b.y <= g2 && b !== s && b !== r && Hi(o, c, a, u, l, d, b.x, b.y) && tt(b.prev, b, b.next) >= 0 || (b = b.prevZ, M.x >= p && M.x <= m && M.y >= f && M.y <= g2 && M !== s && M !== r && Hi(o, c, a, u, l, d, M.x, M.y) && tt(M.prev, M, M.next) >= 0))
      return false;
    M = M.nextZ;
  }
  for (; b && b.z >= y3; ) {
    if (b.x >= p && b.x <= m && b.y >= f && b.y <= g2 && b !== s && b !== r && Hi(o, c, a, u, l, d, b.x, b.y) && tt(b.prev, b, b.next) >= 0)
      return false;
    b = b.prevZ;
  }
  for (; M && M.z <= x; ) {
    if (M.x >= p && M.x <= m && M.y >= f && M.y <= g2 && M !== s && M !== r && Hi(o, c, a, u, l, d, M.x, M.y) && tt(M.prev, M, M.next) >= 0)
      return false;
    M = M.nextZ;
  }
  return true;
}
function Md(h36, t) {
  let e = h36;
  do {
    let i = e.prev, s = e.next.next;
    !Ti(i, s) && $l(i, e, e.next, s) && cs(i, s) && cs(s, i) && (t.push(i.i, e.i, s.i), us(e), us(e.next), e = h36 = s), e = e.next;
  } while (e !== h36);
  return je(e);
}
function _d(h36, t, e, i, s, n) {
  let r = h36;
  do {
    let o = r.next.next;
    for (; o !== r.prev; ) {
      if (r.i !== o.i && Bd(r, o)) {
        let a = jl(r, o);
        r = je(r, r.next), a = je(a, a.next), ls(r, t, e, i, s, n, 0), ls(a, t, e, i, s, n, 0);
        return;
      }
      o = o.next;
    }
    r = r.next;
  } while (r !== h36);
}
function vd(h36, t, e, i) {
  let s = [];
  for (let n = 0, r = t.length; n < r; n++) {
    let o = t[n] * i, a = n < r - 1 ? t[n + 1] * i : h36.length, l = Zl(h36, o, a, i, false);
    l === l.next && (l.steiner = true), s.push(Fd(l));
  }
  s.sort(Sd);
  for (let n = 0; n < s.length; n++)
    e = Ad(s[n], e);
  return e;
}
function Sd(h36, t) {
  let e = h36.x - t.x;
  if (e === 0 && (e = h36.y - t.y, e === 0)) {
    let i = (h36.next.y - h36.y) / (h36.next.x - h36.x), s = (t.next.y - t.y) / (t.next.x - t.x);
    e = i - s;
  }
  return e;
}
function Ad(h36, t) {
  let e = Td(h36, t);
  if (!e)
    return t;
  let i = jl(e, h36);
  return je(i, i.next), je(e, e.next);
}
function Td(h36, t) {
  let e = t, i = h36.x, s = h36.y, n = -1 / 0, r;
  if (Ti(h36, e))
    return e;
  do {
    if (Ti(h36, e.next))
      return e.next;
    if (s <= e.y && s >= e.next.y && e.next.y !== e.y) {
      let u = e.x + (s - e.y) * (e.next.x - e.x) / (e.next.y - e.y);
      if (u <= i && u > n && (n = u, r = e.x < e.next.x ? e : e.next, u === i))
        return r;
    }
    e = e.next;
  } while (e !== t);
  if (!r)
    return null;
  let o = r, a = r.x, l = r.y, c = 1 / 0;
  e = r;
  do {
    if (i >= e.x && e.x >= a && i !== e.x && Yl(s < l ? i : n, s, a, l, s < l ? n : i, s, e.x, e.y)) {
      let u = Math.abs(s - e.y) / (i - e.x);
      cs(e, h36) && (u < c || u === c && (e.x > r.x || e.x === r.x && Id(r, e))) && (r = e, c = u);
    }
    e = e.next;
  } while (e !== o);
  return r;
}
function Id(h36, t) {
  return tt(h36.prev, h36, t.prev) < 0 && tt(t.next, h36, h36.next) < 0;
}
function Cd(h36, t, e, i) {
  let s = h36;
  do
    s.z === 0 && (s.z = no(s.x, s.y, t, e, i)), s.prevZ = s.prev, s.nextZ = s.next, s = s.next;
  while (s !== h36);
  s.prevZ.nextZ = null, s.prevZ = null, zd(s);
}
function zd(h36) {
  let t, e = 1;
  do {
    let i = h36, s;
    h36 = null;
    let n = null;
    for (t = 0; i; ) {
      t++;
      let r = i, o = 0;
      for (let l = 0; l < e && (o++, r = r.nextZ, !!r); l++)
        ;
      let a = e;
      for (; o > 0 || a > 0 && r; )
        o !== 0 && (a === 0 || !r || i.z <= r.z) ? (s = i, i = i.nextZ, o--) : (s = r, r = r.nextZ, a--), n ? n.nextZ = s : h36 = s, s.prevZ = n, n = s;
      i = r;
    }
    n.nextZ = null, e *= 2;
  } while (t > 1);
  return h36;
}
function no(h36, t, e, i, s) {
  return h36 = (h36 - e) * s | 0, t = (t - i) * s | 0, h36 = (h36 | h36 << 8) & 16711935, h36 = (h36 | h36 << 4) & 252645135, h36 = (h36 | h36 << 2) & 858993459, h36 = (h36 | h36 << 1) & 1431655765, t = (t | t << 8) & 16711935, t = (t | t << 4) & 252645135, t = (t | t << 2) & 858993459, t = (t | t << 1) & 1431655765, h36 | t << 1;
}
function Fd(h36) {
  let t = h36, e = h36;
  do
    (t.x < e.x || t.x === e.x && t.y < e.y) && (e = t), t = t.next;
  while (t !== h36);
  return e;
}
function Yl(h36, t, e, i, s, n, r, o) {
  return (s - r) * (t - o) >= (h36 - r) * (n - o) && (h36 - r) * (i - o) >= (e - r) * (t - o) && (e - r) * (n - o) >= (s - r) * (i - o);
}
function Hi(h36, t, e, i, s, n, r, o) {
  return !(h36 === r && t === o) && Yl(h36, t, e, i, s, n, r, o);
}
function Bd(h36, t) {
  return h36.next.i !== t.i && h36.prev.i !== t.i && !kd(h36, t) && (cs(h36, t) && cs(t, h36) && Pd(h36, t) && (tt(h36.prev, h36, t.prev) || tt(h36, t.prev, t)) || Ti(h36, t) && tt(h36.prev, h36, h36.next) > 0 && tt(t.prev, t, t.next) > 0);
}
function tt(h36, t, e) {
  return (t.y - h36.y) * (e.x - t.x) - (t.x - h36.x) * (e.y - t.y);
}
function Ti(h36, t) {
  return h36.x === t.x && h36.y === t.y;
}
function $l(h36, t, e, i) {
  let s = Zs(tt(h36, t, e)), n = Zs(tt(h36, t, i)), r = Zs(tt(e, i, h36)), o = Zs(tt(e, i, t));
  return !!(s !== n && r !== o || s === 0 && Hs(h36, e, t) || n === 0 && Hs(h36, i, t) || r === 0 && Hs(e, h36, i) || o === 0 && Hs(e, t, i));
}
function Hs(h36, t, e) {
  return t.x <= Math.max(h36.x, e.x) && t.x >= Math.min(h36.x, e.x) && t.y <= Math.max(h36.y, e.y) && t.y >= Math.min(h36.y, e.y);
}
function Zs(h36) {
  return h36 > 0 ? 1 : h36 < 0 ? -1 : 0;
}
function kd(h36, t) {
  let e = h36;
  do {
    if (e.i !== h36.i && e.next.i !== h36.i && e.i !== t.i && e.next.i !== t.i && $l(e, e.next, h36, t))
      return true;
    e = e.next;
  } while (e !== h36);
  return false;
}
function cs(h36, t) {
  return tt(h36.prev, h36, h36.next) < 0 ? tt(h36, t, h36.next) >= 0 && tt(h36, h36.prev, t) >= 0 : tt(h36, t, h36.prev) < 0 || tt(h36, h36.next, t) < 0;
}
function Pd(h36, t) {
  let e = h36, i = false, s = (h36.x + t.x) / 2, n = (h36.y + t.y) / 2;
  do
    e.y > n != e.next.y > n && e.next.y !== e.y && s < (e.next.x - e.x) * (n - e.y) / (e.next.y - e.y) + e.x && (i = !i), e = e.next;
  while (e !== h36);
  return i;
}
function jl(h36, t) {
  let e = ro(h36.i, h36.x, h36.y), i = ro(t.i, t.x, t.y), s = h36.next, n = t.prev;
  return h36.next = t, t.prev = h36, e.next = s, s.prev = e, i.next = e, e.prev = i, n.next = i, i.prev = n, i;
}
function Ch(h36, t, e, i) {
  let s = ro(h36, t, e);
  return i ? (s.next = i.next, s.prev = i, i.next.prev = s, i.next = s) : (s.prev = s, s.next = s), s;
}
function us(h36) {
  h36.next.prev = h36.prev, h36.prev.next = h36.next, h36.prevZ && (h36.prevZ.nextZ = h36.nextZ), h36.nextZ && (h36.nextZ.prevZ = h36.prevZ);
}
function ro(h36, t, e) {
  return { i: h36, x: t, y: e, prev: null, next: null, z: 0, prevZ: null, nextZ: null, steiner: false };
}
function Rd(h36, t, e, i) {
  let s = 0;
  for (let n = t, r = e - i; n < e; n += i)
    s += (h36[r] - h36[n]) * (h36[n + 1] + h36[r + 1]), r = n;
  return s;
}
var oo = class {
  static triangulate(t, e, i = 2) {
    return xd(t, e, i);
  }
};
var Qt = class h22 {
  static area(t) {
    let e = t.length, i = 0;
    for (let s = e - 1, n = 0; n < e; s = n++)
      i += t[s].x * t[n].y - t[n].x * t[s].y;
    return i * 0.5;
  }
  static isClockWise(t) {
    return h22.area(t) < 0;
  }
  static triangulateShape(t, e) {
    let i = [], s = [], n = [];
    zh(t), Fh(i, t);
    let r = t.length;
    e.forEach(zh);
    for (let a = 0; a < e.length; a++)
      s.push(r), r += e[a].length, Fh(i, e[a]);
    let o = oo.triangulate(i, s);
    for (let a = 0; a < o.length; a += 3)
      n.push(o.slice(a, a + 3));
    return n;
  }
};
function zh(h36) {
  let t = h36.length;
  t > 2 && h36[t - 1].equals(h36[0]) && h36.pop();
}
function Fh(h36, t) {
  for (let e = 0; e < t.length; e++)
    h36.push(t[e].x), h36.push(t[e].y);
}
var ao = class h23 extends q {
  constructor(t = new Ie([new I(0.5, 0.5), new I(-0.5, 0.5), new I(-0.5, -0.5), new I(0.5, -0.5)]), e = {}) {
    super(), this.type = "ExtrudeGeometry", this.parameters = { shapes: t, options: e }, t = Array.isArray(t) ? t : [t];
    let i = this, s = [], n = [];
    for (let o = 0, a = t.length; o < a; o++) {
      let l = t[o];
      r(l);
    }
    this.setAttribute("position", new B(s, 3)), this.setAttribute("uv", new B(n, 2)), this.computeVertexNormals();
    function r(o) {
      let a = [], l = e.curveSegments !== void 0 ? e.curveSegments : 12, c = e.steps !== void 0 ? e.steps : 1, u = e.depth !== void 0 ? e.depth : 1, d = e.bevelEnabled !== void 0 ? e.bevelEnabled : true, p = e.bevelThickness !== void 0 ? e.bevelThickness : 0.2, f = e.bevelSize !== void 0 ? e.bevelSize : p - 0.1, m = e.bevelOffset !== void 0 ? e.bevelOffset : 0, g2 = e.bevelSegments !== void 0 ? e.bevelSegments : 3, y3 = e.extrudePath, x = e.UVGenerator !== void 0 ? e.UVGenerator : Od, b, M = false, _2, v, A, S;
      if (y3) {
        b = y3.getSpacedPoints(c), M = true, d = false;
        let z2 = y3.isCatmullRomCurve3 ? y3.closed : false;
        _2 = y3.computeFrenetFrames(c, z2), v = new w(), A = new w(), S = new w();
      }
      d || (g2 = 0, p = 0, f = 0, m = 0);
      let T = o.extractPoints(l), C = T.shape, P = T.holes;
      if (!Qt.isClockWise(C)) {
        C = C.reverse();
        for (let z2 = 0, F = P.length; z2 < F; z2++) {
          let k = P[z2];
          Qt.isClockWise(k) && (P[z2] = k.reverse());
        }
      }
      function J(z2) {
        let k = 10000000000000001e-36, O = z2[0];
        for (let R = 1; R <= z2.length; R++) {
          let G2 = R % z2.length, W3 = z2[G2], Q2 = W3.x - O.x, K = W3.y - O.y, ht = Q2 * Q2 + K * K, Tt = Math.max(Math.abs(W3.x), Math.abs(W3.y), Math.abs(O.x), Math.abs(O.y)), ke2 = k * Tt * Tt;
          if (ht <= ke2) {
            z2.splice(G2, 1), R--;
            continue;
          }
          O = W3;
        }
      }
      J(C), P.forEach(J);
      let $ = P.length, Z2 = C;
      for (let z2 = 0; z2 < $; z2++) {
        let F = P[z2];
        C = C.concat(F);
      }
      function at(z2, F, k) {
        return F || X("ExtrudeGeometry: vec does not exist"), z2.clone().addScaledVector(F, k);
      }
      let dt = C.length;
      function Ut2(z2, F, k) {
        let O, R, G2, W3 = z2.x - F.x, Q2 = z2.y - F.y, K = k.x - z2.x, ht = k.y - z2.y, Tt = W3 * W3 + Q2 * Q2, ke2 = W3 * ht - Q2 * K;
        if (Math.abs(ke2) > Number.EPSILON) {
          let It = Math.sqrt(Tt), ca = Math.sqrt(K * K + ht * ht), ua = F.x - Q2 / It, da = F.y + W3 / It, sc2 = k.x - ht / ca, nc2 = k.y + K / ca, pa = ((sc2 - ua) * ht - (nc2 - da) * K) / (W3 * ht - Q2 * K);
          O = ua + W3 * pa - z2.x, R = da + Q2 * pa - z2.y;
          let fa = O * O + R * R;
          if (fa <= 2)
            return new I(O, R);
          G2 = Math.sqrt(fa / 2);
        } else {
          let It = false;
          W3 > Number.EPSILON ? K > Number.EPSILON && (It = true) : W3 < -Number.EPSILON ? K < -Number.EPSILON && (It = true) : Math.sign(Q2) === Math.sign(ht) && (It = true), It ? (O = -Q2, R = W3, G2 = Math.sqrt(Tt)) : (O = W3, R = Q2, G2 = Math.sqrt(Tt / 2));
        }
        return new I(O / G2, R / G2);
      }
      let et = [];
      for (let z2 = 0, F = Z2.length, k = F - 1, O = z2 + 1; z2 < F; z2++, k++, O++)
        k === F && (k = 0), O === F && (O = 0), et[z2] = Ut2(Z2[z2], Z2[k], Z2[O]);
      let rt = [], it, Wt2 = et.concat();
      for (let z2 = 0, F = $; z2 < F; z2++) {
        let k = P[z2];
        it = [];
        for (let O = 0, R = k.length, G2 = R - 1, W3 = O + 1; O < R; O++, G2++, W3++)
          G2 === R && (G2 = 0), W3 === R && (W3 = 0), it[O] = Ut2(k[O], k[G2], k[W3]);
        rt.push(it), Wt2 = Wt2.concat(it);
      }
      let Ot2;
      if (g2 === 0)
        Ot2 = Qt.triangulateShape(Z2, P);
      else {
        let z2 = [], F = [];
        for (let k = 0; k < g2; k++) {
          let O = k / g2, R = p * Math.cos(O * Math.PI / 2), G2 = f * Math.sin(O * Math.PI / 2) + m;
          for (let W3 = 0, Q2 = Z2.length; W3 < Q2; W3++) {
            let K = at(Z2[W3], et[W3], G2);
            se2(K.x, K.y, -R), O === 0 && z2.push(K);
          }
          for (let W3 = 0, Q2 = $; W3 < Q2; W3++) {
            let K = P[W3];
            it = rt[W3];
            let ht = [];
            for (let Tt = 0, ke2 = K.length; Tt < ke2; Tt++) {
              let It = at(K[Tt], it[Tt], G2);
              se2(It.x, It.y, -R), O === 0 && ht.push(It);
            }
            O === 0 && F.push(ht);
          }
        }
        Ot2 = Qt.triangulateShape(z2, F);
      }
      let Qe = Ot2.length, Ri = f + m;
      for (let z2 = 0; z2 < dt; z2++) {
        let F = d ? at(C[z2], Wt2[z2], Ri) : C[z2];
        M ? (A.copy(_2.normals[0]).multiplyScalar(F.x), v.copy(_2.binormals[0]).multiplyScalar(F.y), S.copy(b[0]).add(A).add(v), se2(S.x, S.y, S.z)) : se2(F.x, F.y, 0);
      }
      for (let z2 = 1; z2 <= c; z2++)
        for (let F = 0; F < dt; F++) {
          let k = d ? at(C[F], Wt2[F], Ri) : C[F];
          M ? (A.copy(_2.normals[z2]).multiplyScalar(k.x), v.copy(_2.binormals[z2]).multiplyScalar(k.y), S.copy(b[z2]).add(A).add(v), se2(S.x, S.y, S.z)) : se2(k.x, k.y, u / c * z2);
        }
      for (let z2 = g2 - 1; z2 >= 0; z2--) {
        let F = z2 / g2, k = p * Math.cos(F * Math.PI / 2), O = f * Math.sin(F * Math.PI / 2) + m;
        for (let R = 0, G2 = Z2.length; R < G2; R++) {
          let W3 = at(Z2[R], et[R], O);
          se2(W3.x, W3.y, u + k);
        }
        for (let R = 0, G2 = P.length; R < G2; R++) {
          let W3 = P[R];
          it = rt[R];
          for (let Q2 = 0, K = W3.length; Q2 < K; Q2++) {
            let ht = at(W3[Q2], it[Q2], O);
            M ? se2(ht.x, ht.y + b[c - 1].y, b[c - 1].x + k) : se2(ht.x, ht.y, u + k);
          }
        }
      }
      tc2(), ec2();
      function tc2() {
        let z2 = s.length / 3;
        if (d) {
          let F = 0, k = dt * F;
          for (let O = 0; O < Qe; O++) {
            let R = Ot2[O];
            ps2(R[2] + k, R[1] + k, R[0] + k);
          }
          F = c + g2 * 2, k = dt * F;
          for (let O = 0; O < Qe; O++) {
            let R = Ot2[O];
            ps2(R[0] + k, R[1] + k, R[2] + k);
          }
        } else {
          for (let F = 0; F < Qe; F++) {
            let k = Ot2[F];
            ps2(k[2], k[1], k[0]);
          }
          for (let F = 0; F < Qe; F++) {
            let k = Ot2[F];
            ps2(k[0] + dt * c, k[1] + dt * c, k[2] + dt * c);
          }
        }
        i.addGroup(z2, s.length / 3 - z2, 0);
      }
      function ec2() {
        let z2 = s.length / 3, F = 0;
        la(Z2, F), F += Z2.length;
        for (let k = 0, O = P.length; k < O; k++) {
          let R = P[k];
          la(R, F), F += R.length;
        }
        i.addGroup(z2, s.length / 3 - z2, 1);
      }
      function la(z2, F) {
        let k = z2.length;
        for (; --k >= 0; ) {
          let O = k, R = k - 1;
          R < 0 && (R = z2.length - 1);
          for (let G2 = 0, W3 = c + g2 * 2; G2 < W3; G2++) {
            let Q2 = dt * G2, K = dt * (G2 + 1), ht = F + O + Q2, Tt = F + R + Q2, ke2 = F + R + K, It = F + O + K;
            ic2(ht, Tt, ke2, It);
          }
        }
      }
      function se2(z2, F, k) {
        a.push(z2), a.push(F), a.push(k);
      }
      function ps2(z2, F, k) {
        ne2(z2), ne2(F), ne2(k);
        let O = s.length / 3, R = x.generateTopUV(i, s, O - 3, O - 2, O - 1);
        re2(R[0]), re2(R[1]), re2(R[2]);
      }
      function ic2(z2, F, k, O) {
        ne2(z2), ne2(F), ne2(O), ne2(F), ne2(k), ne2(O);
        let R = s.length / 3, G2 = x.generateSideWallUV(i, s, R - 6, R - 3, R - 2, R - 1);
        re2(G2[0]), re2(G2[1]), re2(G2[3]), re2(G2[1]), re2(G2[2]), re2(G2[3]);
      }
      function ne2(z2) {
        s.push(a[z2 * 3 + 0]), s.push(a[z2 * 3 + 1]), s.push(a[z2 * 3 + 2]);
      }
      function re2(z2) {
        n.push(z2.x), n.push(z2.y);
      }
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  toJSON() {
    let t = super.toJSON(), e = this.parameters.shapes, i = this.parameters.options;
    return Ed(e, i, t);
  }
  static fromJSON(t, e) {
    let i = [];
    for (let n = 0, r = t.shapes.length; n < r; n++) {
      let o = e[t.shapes[n]];
      i.push(o);
    }
    let s = t.options.extrudePath;
    return s !== void 0 && (t.options.extrudePath = new vn[s.type]().fromJSON(s)), new h23(i, t.options);
  }
};
var Od = { generateTopUV: function(h36, t, e, i, s) {
  let n = t[e * 3], r = t[e * 3 + 1], o = t[i * 3], a = t[i * 3 + 1], l = t[s * 3], c = t[s * 3 + 1];
  return [new I(n, r), new I(o, a), new I(l, c)];
}, generateSideWallUV: function(h36, t, e, i, s, n) {
  let r = t[e * 3], o = t[e * 3 + 1], a = t[e * 3 + 2], l = t[i * 3], c = t[i * 3 + 1], u = t[i * 3 + 2], d = t[s * 3], p = t[s * 3 + 1], f = t[s * 3 + 2], m = t[n * 3], g2 = t[n * 3 + 1], y3 = t[n * 3 + 2];
  return Math.abs(o - c) < Math.abs(r - l) ? [new I(r, 1 - a), new I(l, 1 - u), new I(d, 1 - f), new I(m, 1 - y3)] : [new I(o, 1 - a), new I(c, 1 - u), new I(p, 1 - f), new I(g2, 1 - y3)];
} };
function Ed(h36, t, e) {
  if (e.shapes = [], Array.isArray(h36))
    for (let i = 0, s = h36.length; i < s; i++) {
      let n = h36[i];
      e.shapes.push(n.uuid);
    }
  else
    e.shapes.push(h36.uuid);
  return e.options = Object.assign({}, t), t.extrudePath !== void 0 && (e.options.extrudePath = t.extrudePath.toJSON()), e;
}
var ho = class h24 extends $e {
  constructor(t = 1, e = 0) {
    let i = (1 + Math.sqrt(5)) / 2, s = [-1, i, 0, 1, i, 0, -1, -i, 0, 1, -i, 0, 0, -1, i, 0, 1, i, 0, -1, -i, 0, 1, -i, i, 0, -1, i, 0, 1, -i, 0, -1, -i, 0, 1], n = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];
    super(s, n, t, e), this.type = "IcosahedronGeometry", this.parameters = { radius: t, detail: e };
  }
  static fromJSON(t) {
    return new h24(t.radius, t.detail);
  }
};
var lo = class h25 extends q {
  constructor(t = [new I(0, -0.5), new I(0.5, 0), new I(0, 0.5)], e = 12, i = 0, s = Math.PI * 2) {
    super(), this.type = "LatheGeometry", this.parameters = { points: t, segments: e, phiStart: i, phiLength: s }, e = Math.floor(e), s = N(s, 0, Math.PI * 2);
    let n = [], r = [], o = [], a = [], l = [], c = 1 / e, u = new w(), d = new I(), p = new w(), f = new w(), m = new w(), g2 = 0, y3 = 0;
    for (let x = 0; x <= t.length - 1; x++)
      switch (x) {
        case 0:
          g2 = t[x + 1].x - t[x].x, y3 = t[x + 1].y - t[x].y, p.x = y3 * 1, p.y = -g2, p.z = y3 * 0, m.copy(p), p.normalize(), a.push(p.x, p.y, p.z);
          break;
        case t.length - 1:
          a.push(m.x, m.y, m.z);
          break;
        default:
          g2 = t[x + 1].x - t[x].x, y3 = t[x + 1].y - t[x].y, p.x = y3 * 1, p.y = -g2, p.z = y3 * 0, f.copy(p), p.x += m.x, p.y += m.y, p.z += m.z, p.normalize(), a.push(p.x, p.y, p.z), m.copy(f);
      }
    for (let x = 0; x <= e; x++) {
      let b = i + x * c * s, M = Math.sin(b), _2 = Math.cos(b);
      for (let v = 0; v <= t.length - 1; v++) {
        u.x = t[v].x * M, u.y = t[v].y, u.z = t[v].x * _2, r.push(u.x, u.y, u.z), d.x = x / e, d.y = v / (t.length - 1), o.push(d.x, d.y);
        let A = a[3 * v + 0] * M, S = a[3 * v + 1], T = a[3 * v + 0] * _2;
        l.push(A, S, T);
      }
    }
    for (let x = 0; x < e; x++)
      for (let b = 0; b < t.length - 1; b++) {
        let M = b + x * t.length, _2 = M, v = M + t.length, A = M + t.length + 1, S = M + 1;
        n.push(_2, v, S), n.push(A, S, v);
      }
    this.setIndex(n), this.setAttribute("position", new B(r, 3)), this.setAttribute("uv", new B(o, 2)), this.setAttribute("normal", new B(l, 3));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h25(t.points, t.segments, t.phiStart, t.phiLength);
  }
};
var Sn = class h26 extends $e {
  constructor(t = 1, e = 0) {
    let i = [1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1], s = [0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2];
    super(i, s, t, e), this.type = "OctahedronGeometry", this.parameters = { radius: t, detail: e };
  }
  static fromJSON(t) {
    return new h26(t.radius, t.detail);
  }
};
var co = class h27 extends q {
  constructor(t = 1, e = 1, i = 1, s = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = { width: t, height: e, widthSegments: i, heightSegments: s };
    let n = t / 2, r = e / 2, o = Math.floor(i), a = Math.floor(s), l = o + 1, c = a + 1, u = t / o, d = e / a, p = [], f = [], m = [], g2 = [];
    for (let y3 = 0; y3 < c; y3++) {
      let x = y3 * d - r;
      for (let b = 0; b < l; b++) {
        let M = b * u - n;
        f.push(M, -x, 0), m.push(0, 0, 1), g2.push(b / o), g2.push(1 - y3 / a);
      }
    }
    for (let y3 = 0; y3 < a; y3++)
      for (let x = 0; x < o; x++) {
        let b = x + l * y3, M = x + l * (y3 + 1), _2 = x + 1 + l * (y3 + 1), v = x + 1 + l * y3;
        p.push(b, M, v), p.push(M, _2, v);
      }
    this.setIndex(p), this.setAttribute("position", new B(f, 3)), this.setAttribute("normal", new B(m, 3)), this.setAttribute("uv", new B(g2, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h27(t.width, t.height, t.widthSegments, t.heightSegments);
  }
};
var uo = class h28 extends q {
  constructor(t = 0.5, e = 1, i = 32, s = 1, n = 0, r = Math.PI * 2) {
    super(), this.type = "RingGeometry", this.parameters = { innerRadius: t, outerRadius: e, thetaSegments: i, phiSegments: s, thetaStart: n, thetaLength: r }, i = Math.max(3, i), s = Math.max(1, s);
    let o = [], a = [], l = [], c = [], u = t, d = (e - t) / s, p = new w(), f = new I();
    for (let m = 0; m <= s; m++) {
      for (let g2 = 0; g2 <= i; g2++) {
        let y3 = n + g2 / i * r;
        p.x = u * Math.cos(y3), p.y = u * Math.sin(y3), a.push(p.x, p.y, p.z), l.push(0, 0, 1), f.x = (p.x / e + 1) / 2, f.y = (p.y / e + 1) / 2, c.push(f.x, f.y);
      }
      u += d;
    }
    for (let m = 0; m < s; m++) {
      let g2 = m * (i + 1);
      for (let y3 = 0; y3 < i; y3++) {
        let x = y3 + g2, b = x, M = x + i + 1, _2 = x + i + 2, v = x + 1;
        o.push(b, M, v), o.push(M, _2, v);
      }
    }
    this.setIndex(o), this.setAttribute("position", new B(a, 3)), this.setAttribute("normal", new B(l, 3)), this.setAttribute("uv", new B(c, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h28(t.innerRadius, t.outerRadius, t.thetaSegments, t.phiSegments, t.thetaStart, t.thetaLength);
  }
};
var po = class h29 extends q {
  constructor(t = new Ie([new I(0, 0.5), new I(-0.5, -0.5), new I(0.5, -0.5)]), e = 12) {
    super(), this.type = "ShapeGeometry", this.parameters = { shapes: t, curveSegments: e };
    let i = [], s = [], n = [], r = [], o = 0, a = 0;
    if (Array.isArray(t) === false)
      l(t);
    else
      for (let c = 0; c < t.length; c++)
        l(t[c]), this.addGroup(o, a, c), o += a, a = 0;
    this.setIndex(i), this.setAttribute("position", new B(s, 3)), this.setAttribute("normal", new B(n, 3)), this.setAttribute("uv", new B(r, 2));
    function l(c) {
      let u = s.length / 3, d = c.extractPoints(e), p = d.shape, f = d.holes;
      Qt.isClockWise(p) === false && (p = p.reverse());
      for (let g2 = 0, y3 = f.length; g2 < y3; g2++) {
        let x = f[g2];
        Qt.isClockWise(x) === true && (f[g2] = x.reverse());
      }
      let m = Qt.triangulateShape(p, f);
      for (let g2 = 0, y3 = f.length; g2 < y3; g2++) {
        let x = f[g2];
        p = p.concat(x);
      }
      for (let g2 = 0, y3 = p.length; g2 < y3; g2++) {
        let x = p[g2];
        s.push(x.x, x.y, 0), n.push(0, 0, 1), r.push(x.x, x.y);
      }
      for (let g2 = 0, y3 = m.length; g2 < y3; g2++) {
        let x = m[g2], b = x[0] + u, M = x[1] + u, _2 = x[2] + u;
        i.push(b, M, _2), a += 3;
      }
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  toJSON() {
    let t = super.toJSON(), e = this.parameters.shapes;
    return Nd(e, t);
  }
  static fromJSON(t, e) {
    let i = [];
    for (let s = 0, n = t.shapes.length; s < n; s++) {
      let r = e[t.shapes[s]];
      i.push(r);
    }
    return new h29(i, t.curveSegments);
  }
};
function Nd(h36, t) {
  if (t.shapes = [], Array.isArray(h36))
    for (let e = 0, i = h36.length; e < i; e++) {
      let s = h36[e];
      t.shapes.push(s.uuid);
    }
  else
    t.shapes.push(h36.uuid);
  return t;
}
var An = class h30 extends q {
  constructor(t = 1, e = 32, i = 16, s = 0, n = Math.PI * 2, r = 0, o = Math.PI) {
    super(), this.type = "SphereGeometry", this.parameters = { radius: t, widthSegments: e, heightSegments: i, phiStart: s, phiLength: n, thetaStart: r, thetaLength: o }, e = Math.max(3, Math.floor(e)), i = Math.max(2, Math.floor(i));
    let a = Math.min(r + o, Math.PI), l = 0, c = [], u = new w(), d = new w(), p = [], f = [], m = [], g2 = [];
    for (let y3 = 0; y3 <= i; y3++) {
      let x = [], b = y3 / i, M = 0;
      y3 === 0 && r === 0 ? M = 0.5 / e : y3 === i && a === Math.PI && (M = -0.5 / e);
      for (let _2 = 0; _2 <= e; _2++) {
        let v = _2 / e;
        u.x = -t * Math.cos(s + v * n) * Math.sin(r + b * o), u.y = t * Math.cos(r + b * o), u.z = t * Math.sin(s + v * n) * Math.sin(r + b * o), f.push(u.x, u.y, u.z), d.copy(u).normalize(), m.push(d.x, d.y, d.z), g2.push(v + M, 1 - b), x.push(l++);
      }
      c.push(x);
    }
    for (let y3 = 0; y3 < i; y3++)
      for (let x = 0; x < e; x++) {
        let b = c[y3][x + 1], M = c[y3][x], _2 = c[y3 + 1][x], v = c[y3 + 1][x + 1];
        (y3 !== 0 || r > 0) && p.push(b, M, v), (y3 !== i - 1 || a < Math.PI) && p.push(M, _2, v);
      }
    this.setIndex(p), this.setAttribute("position", new B(f, 3)), this.setAttribute("normal", new B(m, 3)), this.setAttribute("uv", new B(g2, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h30(t.radius, t.widthSegments, t.heightSegments, t.phiStart, t.phiLength, t.thetaStart, t.thetaLength);
  }
};
var fo = class h31 extends $e {
  constructor(t = 1, e = 0) {
    let i = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1], s = [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1];
    super(i, s, t, e), this.type = "TetrahedronGeometry", this.parameters = { radius: t, detail: e };
  }
  static fromJSON(t) {
    return new h31(t.radius, t.detail);
  }
};
var mo = class h32 extends q {
  constructor(t = 1, e = 0.4, i = 12, s = 48, n = Math.PI * 2) {
    super(), this.type = "TorusGeometry", this.parameters = { radius: t, tube: e, radialSegments: i, tubularSegments: s, arc: n }, i = Math.floor(i), s = Math.floor(s);
    let r = [], o = [], a = [], l = [], c = new w(), u = new w(), d = new w();
    for (let p = 0; p <= i; p++)
      for (let f = 0; f <= s; f++) {
        let m = f / s * n, g2 = p / i * Math.PI * 2;
        u.x = (t + e * Math.cos(g2)) * Math.cos(m), u.y = (t + e * Math.cos(g2)) * Math.sin(m), u.z = e * Math.sin(g2), o.push(u.x, u.y, u.z), c.x = t * Math.cos(m), c.y = t * Math.sin(m), d.subVectors(u, c).normalize(), a.push(d.x, d.y, d.z), l.push(f / s), l.push(p / i);
      }
    for (let p = 1; p <= i; p++)
      for (let f = 1; f <= s; f++) {
        let m = (s + 1) * p + f - 1, g2 = (s + 1) * (p - 1) + f - 1, y3 = (s + 1) * (p - 1) + f, x = (s + 1) * p + f;
        r.push(m, g2, x), r.push(g2, y3, x);
      }
    this.setIndex(r), this.setAttribute("position", new B(o, 3)), this.setAttribute("normal", new B(a, 3)), this.setAttribute("uv", new B(l, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h32(t.radius, t.tube, t.radialSegments, t.tubularSegments, t.arc);
  }
};
var yo = class h33 extends q {
  constructor(t = 1, e = 0.4, i = 64, s = 8, n = 2, r = 3) {
    super(), this.type = "TorusKnotGeometry", this.parameters = { radius: t, tube: e, tubularSegments: i, radialSegments: s, p: n, q: r }, i = Math.floor(i), s = Math.floor(s);
    let o = [], a = [], l = [], c = [], u = new w(), d = new w(), p = new w(), f = new w(), m = new w(), g2 = new w(), y3 = new w();
    for (let b = 0; b <= i; ++b) {
      let M = b / i * n * Math.PI * 2;
      x(M, n, r, t, p), x(M + 0.01, n, r, t, f), g2.subVectors(f, p), y3.addVectors(f, p), m.crossVectors(g2, y3), y3.crossVectors(m, g2), m.normalize(), y3.normalize();
      for (let _2 = 0; _2 <= s; ++_2) {
        let v = _2 / s * Math.PI * 2, A = -e * Math.cos(v), S = e * Math.sin(v);
        u.x = p.x + (A * y3.x + S * m.x), u.y = p.y + (A * y3.y + S * m.y), u.z = p.z + (A * y3.z + S * m.z), a.push(u.x, u.y, u.z), d.subVectors(u, p).normalize(), l.push(d.x, d.y, d.z), c.push(b / i), c.push(_2 / s);
      }
    }
    for (let b = 1; b <= i; b++)
      for (let M = 1; M <= s; M++) {
        let _2 = (s + 1) * (b - 1) + (M - 1), v = (s + 1) * b + (M - 1), A = (s + 1) * b + M, S = (s + 1) * (b - 1) + M;
        o.push(_2, v, S), o.push(v, A, S);
      }
    this.setIndex(o), this.setAttribute("position", new B(a, 3)), this.setAttribute("normal", new B(l, 3)), this.setAttribute("uv", new B(c, 2));
    function x(b, M, _2, v, A) {
      let S = Math.cos(b), T = Math.sin(b), C = _2 / M * b, P = Math.cos(C);
      A.x = v * (2 + P) * 0.5 * S, A.y = v * (2 + P) * T * 0.5, A.z = v * Math.sin(C) * 0.5;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new h33(t.radius, t.tube, t.tubularSegments, t.radialSegments, t.p, t.q);
  }
};
var go = class h34 extends q {
  constructor(t = new Mn(new w(-1, -1, 0), new w(-1, 1, 0), new w(1, 1, 0)), e = 64, i = 1, s = 8, n = false) {
    super(), this.type = "TubeGeometry", this.parameters = { path: t, tubularSegments: e, radius: i, radialSegments: s, closed: n };
    let r = t.computeFrenetFrames(e, n);
    this.tangents = r.tangents, this.normals = r.normals, this.binormals = r.binormals;
    let o = new w(), a = new w(), l = new I(), c = new w(), u = [], d = [], p = [], f = [];
    m(), this.setIndex(f), this.setAttribute("position", new B(u, 3)), this.setAttribute("normal", new B(d, 3)), this.setAttribute("uv", new B(p, 2));
    function m() {
      for (let b = 0; b < e; b++)
        g2(b);
      g2(n === false ? e : 0), x(), y3();
    }
    function g2(b) {
      c = t.getPointAt(b / e, c);
      let M = r.normals[b], _2 = r.binormals[b];
      for (let v = 0; v <= s; v++) {
        let A = v / s * Math.PI * 2, S = Math.sin(A), T = -Math.cos(A);
        a.x = T * M.x + S * _2.x, a.y = T * M.y + S * _2.y, a.z = T * M.z + S * _2.z, a.normalize(), d.push(a.x, a.y, a.z), o.x = c.x + i * a.x, o.y = c.y + i * a.y, o.z = c.z + i * a.z, u.push(o.x, o.y, o.z);
      }
    }
    function y3() {
      for (let b = 1; b <= e; b++)
        for (let M = 1; M <= s; M++) {
          let _2 = (s + 1) * (b - 1) + (M - 1), v = (s + 1) * b + (M - 1), A = (s + 1) * b + M, S = (s + 1) * (b - 1) + M;
          f.push(_2, v, S), f.push(v, A, S);
        }
    }
    function x() {
      for (let b = 0; b <= e; b++)
        for (let M = 0; M <= s; M++)
          l.x = b / e, l.y = M / s, p.push(l.x, l.y);
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.path = this.parameters.path.toJSON(), t;
  }
  static fromJSON(t) {
    return new h34(new vn[t.path.type]().fromJSON(t.path), t.tubularSegments, t.radius, t.radialSegments, t.closed);
  }
};
var xo = class extends q {
  constructor(t = null) {
    if (super(), this.type = "WireframeGeometry", this.parameters = { geometry: t }, t !== null) {
      let e = [], i = /* @__PURE__ */ new Set(), s = new w(), n = new w();
      if (t.index !== null) {
        let r = t.attributes.position, o = t.index, a = t.groups;
        a.length === 0 && (a = [{ start: 0, count: o.count, materialIndex: 0 }]);
        for (let l = 0, c = a.length; l < c; ++l) {
          let u = a[l], d = u.start, p = u.count;
          for (let f = d, m = d + p; f < m; f += 3)
            for (let g2 = 0; g2 < 3; g2++) {
              let y3 = o.getX(f + g2), x = o.getX(f + (g2 + 1) % 3);
              s.fromBufferAttribute(r, y3), n.fromBufferAttribute(r, x), Bh(s, n, i) === true && (e.push(s.x, s.y, s.z), e.push(n.x, n.y, n.z));
            }
        }
      } else {
        let r = t.attributes.position;
        for (let o = 0, a = r.count / 3; o < a; o++)
          for (let l = 0; l < 3; l++) {
            let c = 3 * o + l, u = 3 * o + (l + 1) % 3;
            s.fromBufferAttribute(r, c), n.fromBufferAttribute(r, u), Bh(s, n, i) === true && (e.push(s.x, s.y, s.z), e.push(n.x, n.y, n.z));
          }
      }
      this.setAttribute("position", new B(e, 3));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
};
function Bh(h36, t, e) {
  let i = `${h36.x},${h36.y},${h36.z}-${t.x},${t.y},${t.z}`, s = `${t.x},${t.y},${t.z}-${h36.x},${h36.y},${h36.z}`;
  return e.has(i) === true || e.has(s) === true ? false : (e.add(i), e.add(s), true);
}
var kh = Object.freeze({ __proto__: null, BoxGeometry: cn, CapsuleGeometry: Yr, CircleGeometry: $r, ConeGeometry: gn, CylinderGeometry: yn, DodecahedronGeometry: jr, EdgesGeometry: Qr, ExtrudeGeometry: ao, IcosahedronGeometry: ho, LatheGeometry: lo, OctahedronGeometry: Sn, PlaneGeometry: co, PolyhedronGeometry: $e, RingGeometry: uo, ShapeGeometry: po, SphereGeometry: An, TetrahedronGeometry: fo, TorusGeometry: mo, TorusKnotGeometry: yo, TubeGeometry: go, WireframeGeometry: xo });
var wo = class extends es {
  constructor(t) {
    super(t), this.isRawShaderMaterial = true, this.type = "RawShaderMaterial";
  }
};
var Tn = class extends ft {
  constructor(t) {
    super(), this.isMeshStandardMaterial = true, this.type = "MeshStandardMaterial", this.defines = { STANDARD: "" }, this.color = new V(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new V(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Pi, this.normalScale = new I(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new ee(), this.envMapIntensity = 1, this.wireframe = false, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = false, this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.defines = { STANDARD: "" }, this.color.copy(t.color), this.roughness = t.roughness, this.metalness = t.metalness, this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.emissive.copy(t.emissive), this.emissiveMap = t.emissiveMap, this.emissiveIntensity = t.emissiveIntensity, this.bumpMap = t.bumpMap, this.bumpScale = t.bumpScale, this.normalMap = t.normalMap, this.normalMapType = t.normalMapType, this.normalScale.copy(t.normalScale), this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.roughnessMap = t.roughnessMap, this.metalnessMap = t.metalnessMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.envMapIntensity = t.envMapIntensity, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.flatShading = t.flatShading, this.fog = t.fog, this;
  }
};
var Mo = class extends Tn {
  constructor(t) {
    super(), this.isMeshPhysicalMaterial = true, this.defines = { STANDARD: "", PHYSICAL: "" }, this.type = "MeshPhysicalMaterial", this.anisotropyRotation = 0, this.anisotropyMap = null, this.clearcoatMap = null, this.clearcoatRoughness = 0, this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new I(1, 1), this.clearcoatNormalMap = null, this.ior = 1.5, Object.defineProperty(this, "reflectivity", { get: function() {
      return N(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
    }, set: function(e) {
      this.ior = (1 + 0.4 * e) / (1 - 0.4 * e);
    } }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessRange = [100, 400], this.iridescenceThicknessMap = null, this.sheenColor = new V(0), this.sheenColorMap = null, this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, this.attenuationColor = new V(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, this.specularColor = new V(1, 1, 1), this.specularColorMap = null, this._anisotropy = 0, this._clearcoat = 0, this._dispersion = 0, this._iridescence = 0, this._sheen = 0, this._transmission = 0, this.setValues(t);
  }
  get anisotropy() {
    return this._anisotropy;
  }
  set anisotropy(t) {
    this._anisotropy > 0 != t > 0 && this.version++, this._anisotropy = t;
  }
  get clearcoat() {
    return this._clearcoat;
  }
  set clearcoat(t) {
    this._clearcoat > 0 != t > 0 && this.version++, this._clearcoat = t;
  }
  get iridescence() {
    return this._iridescence;
  }
  set iridescence(t) {
    this._iridescence > 0 != t > 0 && this.version++, this._iridescence = t;
  }
  get dispersion() {
    return this._dispersion;
  }
  set dispersion(t) {
    this._dispersion > 0 != t > 0 && this.version++, this._dispersion = t;
  }
  get sheen() {
    return this._sheen;
  }
  set sheen(t) {
    this._sheen > 0 != t > 0 && this.version++, this._sheen = t;
  }
  get transmission() {
    return this._transmission;
  }
  set transmission(t) {
    this._transmission > 0 != t > 0 && this.version++, this._transmission = t;
  }
  copy(t) {
    return super.copy(t), this.defines = { STANDARD: "", PHYSICAL: "" }, this.anisotropy = t.anisotropy, this.anisotropyRotation = t.anisotropyRotation, this.anisotropyMap = t.anisotropyMap, this.clearcoat = t.clearcoat, this.clearcoatMap = t.clearcoatMap, this.clearcoatRoughness = t.clearcoatRoughness, this.clearcoatRoughnessMap = t.clearcoatRoughnessMap, this.clearcoatNormalMap = t.clearcoatNormalMap, this.clearcoatNormalScale.copy(t.clearcoatNormalScale), this.dispersion = t.dispersion, this.ior = t.ior, this.iridescence = t.iridescence, this.iridescenceMap = t.iridescenceMap, this.iridescenceIOR = t.iridescenceIOR, this.iridescenceThicknessRange = [...t.iridescenceThicknessRange], this.iridescenceThicknessMap = t.iridescenceThicknessMap, this.sheen = t.sheen, this.sheenColor.copy(t.sheenColor), this.sheenColorMap = t.sheenColorMap, this.sheenRoughness = t.sheenRoughness, this.sheenRoughnessMap = t.sheenRoughnessMap, this.transmission = t.transmission, this.transmissionMap = t.transmissionMap, this.thickness = t.thickness, this.thicknessMap = t.thicknessMap, this.attenuationDistance = t.attenuationDistance, this.attenuationColor.copy(t.attenuationColor), this.specularIntensity = t.specularIntensity, this.specularIntensityMap = t.specularIntensityMap, this.specularColor.copy(t.specularColor), this.specularColorMap = t.specularColorMap, this;
  }
};
var To = class extends ft {
  constructor(t) {
    super(), this.isMeshDepthMaterial = true, this.type = "MeshDepthMaterial", this.depthPacking = fu, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = false, this.wireframeLinewidth = 1, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this;
  }
};
var Io = class extends ft {
  constructor(t) {
    super(), this.isMeshDistanceMaterial = true, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this;
  }
};
function Xe(h36, t) {
  return !h36 || h36.constructor === t ? h36 : typeof t.BYTES_PER_ELEMENT == "number" ? new t(h36) : Array.prototype.slice.call(h36);
}
function Ql(h36) {
  function t(s, n) {
    return h36[s] - h36[n];
  }
  let e = h36.length, i = new Array(e);
  for (let s = 0; s !== e; ++s)
    i[s] = s;
  return i.sort(t), i;
}
function Fo(h36, t, e) {
  let i = h36.length, s = new h36.constructor(i);
  for (let n = 0, r = 0; r !== i; ++n) {
    let o = e[n] * t;
    for (let a = 0; a !== t; ++a)
      s[r++] = h36[o + a];
  }
  return s;
}
function oa(h36, t, e, i) {
  let s = 1, n = h36[0];
  for (; n !== void 0 && n[i] === void 0; )
    n = h36[s++];
  if (n === void 0)
    return;
  let r = n[i];
  if (r !== void 0)
    if (Array.isArray(r))
      do
        r = n[i], r !== void 0 && (t.push(n.time), e.push(...r)), n = h36[s++];
      while (n !== void 0);
    else if (r.toArray !== void 0)
      do
        r = n[i], r !== void 0 && (t.push(n.time), r.toArray(e, e.length)), n = h36[s++];
      while (n !== void 0);
    else
      do
        r = n[i], r !== void 0 && (t.push(n.time), e.push(r)), n = h36[s++];
      while (n !== void 0);
}
var Ii = class {
  constructor(t, e, i, s) {
    this.parameterPositions = t, this._cachedIndex = 0, this.resultBuffer = s !== void 0 ? s : new e.constructor(i), this.sampleValues = e, this.valueSize = i, this.settings = null, this.DefaultSettings_ = {};
  }
  evaluate(t) {
    let e = this.parameterPositions, i = this._cachedIndex, s = e[i], n = e[i - 1];
    t: {
      e: {
        let r;
        i: {
          s:
            if (!(t < s)) {
              for (let o = i + 2; ; ) {
                if (s === void 0) {
                  if (t < n)
                    break s;
                  return i = e.length, this._cachedIndex = i, this.copySampleValue_(i - 1);
                }
                if (i === o)
                  break;
                if (n = s, s = e[++i], t < s)
                  break e;
              }
              r = e.length;
              break i;
            }
          if (!(t >= n)) {
            let o = e[1];
            t < o && (i = 2, n = o);
            for (let a = i - 2; ; ) {
              if (n === void 0)
                return this._cachedIndex = 0, this.copySampleValue_(0);
              if (i === a)
                break;
              if (s = n, n = e[--i - 1], t >= n)
                break e;
            }
            r = i, i = 0;
            break i;
          }
          break t;
        }
        for (; i < r; ) {
          let o = i + r >>> 1;
          t < e[o] ? r = o : i = o + 1;
        }
        if (s = e[i], n = e[i - 1], n === void 0)
          return this._cachedIndex = 0, this.copySampleValue_(0);
        if (s === void 0)
          return i = e.length, this._cachedIndex = i, this.copySampleValue_(i - 1);
      }
      this._cachedIndex = i, this.intervalChanged_(i, n, s);
    }
    return this.interpolate_(i, n, t, s);
  }
  getSettings_() {
    return this.settings || this.DefaultSettings_;
  }
  copySampleValue_(t) {
    let e = this.resultBuffer, i = this.sampleValues, s = this.valueSize, n = t * s;
    for (let r = 0; r !== s; ++r)
      e[r] = i[n + r];
    return e;
  }
  interpolate_() {
    throw new Error("call to abstract method");
  }
  intervalChanged_() {
  }
};
var Bo = class extends Ii {
  constructor(t, e, i, s) {
    super(t, e, i, s), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = { endingStart: wi, endingEnd: wi };
  }
  intervalChanged_(t, e, i) {
    let s = this.parameterPositions, n = t - 2, r = t + 1, o = s[n], a = s[r];
    if (o === void 0)
      switch (this.getSettings_().endingStart) {
        case Mi:
          n = t, o = 2 * e - i;
          break;
        case nn:
          n = s.length - 2, o = e + s[n] - s[n + 1];
          break;
        default:
          n = t, o = i;
      }
    if (a === void 0)
      switch (this.getSettings_().endingEnd) {
        case Mi:
          r = t, a = 2 * i - e;
          break;
        case nn:
          r = 1, a = i + s[1] - s[0];
          break;
        default:
          r = t - 1, a = e;
      }
    let l = (i - e) * 0.5, c = this.valueSize;
    this._weightPrev = l / (e - o), this._weightNext = l / (a - i), this._offsetPrev = n * c, this._offsetNext = r * c;
  }
  interpolate_(t, e, i, s) {
    let n = this.resultBuffer, r = this.sampleValues, o = this.valueSize, a = t * o, l = a - o, c = this._offsetPrev, u = this._offsetNext, d = this._weightPrev, p = this._weightNext, f = (i - e) / (s - e), m = f * f, g2 = m * f, y3 = -d * g2 + 2 * d * m - d * f, x = (1 + d) * g2 + (-1.5 - 2 * d) * m + (-0.5 + d) * f + 1, b = (-1 - p) * g2 + (1.5 + p) * m + 0.5 * f, M = p * g2 - p * m;
    for (let _2 = 0; _2 !== o; ++_2)
      n[_2] = y3 * r[c + _2] + x * r[l + _2] + b * r[a + _2] + M * r[u + _2];
    return n;
  }
};
var In = class extends Ii {
  constructor(t, e, i, s) {
    super(t, e, i, s);
  }
  interpolate_(t, e, i, s) {
    let n = this.resultBuffer, r = this.sampleValues, o = this.valueSize, a = t * o, l = a - o, c = (i - e) / (s - e), u = 1 - c;
    for (let d = 0; d !== o; ++d)
      n[d] = r[l + d] * u + r[a + d] * c;
    return n;
  }
};
var ko = class extends Ii {
  constructor(t, e, i, s) {
    super(t, e, i, s);
  }
  interpolate_(t) {
    return this.copySampleValue_(t - 1);
  }
};
var Rt = class {
  constructor(t, e, i, s) {
    if (t === void 0)
      throw new Error("THREE.KeyframeTrack: track name is undefined");
    if (e === void 0 || e.length === 0)
      throw new Error("THREE.KeyframeTrack: no keyframes in track named " + t);
    this.name = t, this.times = Xe(e, this.TimeBufferType), this.values = Xe(i, this.ValueBufferType), this.setInterpolation(s || this.DefaultInterpolation);
  }
  static toJSON(t) {
    let e = t.constructor, i;
    if (e.toJSON !== this.toJSON)
      i = e.toJSON(t);
    else {
      i = { name: t.name, times: Xe(t.times, Array), values: Xe(t.values, Array) };
      let s = t.getInterpolation();
      s !== t.DefaultInterpolation && (i.interpolation = s);
    }
    return i.type = t.ValueTypeName, i;
  }
  InterpolantFactoryMethodDiscrete(t) {
    return new ko(this.times, this.values, this.getValueSize(), t);
  }
  InterpolantFactoryMethodLinear(t) {
    return new In(this.times, this.values, this.getValueSize(), t);
  }
  InterpolantFactoryMethodSmooth(t) {
    return new Bo(this.times, this.values, this.getValueSize(), t);
  }
  setInterpolation(t) {
    let e;
    switch (t) {
      case sn:
        e = this.InterpolantFactoryMethodDiscrete;
        break;
      case Ir:
        e = this.InterpolantFactoryMethodLinear;
        break;
      case Vn:
        e = this.InterpolantFactoryMethodSmooth;
        break;
    }
    if (e === void 0) {
      let i = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
      if (this.createInterpolant === void 0)
        if (t !== this.DefaultInterpolation)
          this.setInterpolation(this.DefaultInterpolation);
        else
          throw new Error(i);
      return E("KeyframeTrack:", i), this;
    }
    return this.createInterpolant = e, this;
  }
  getInterpolation() {
    switch (this.createInterpolant) {
      case this.InterpolantFactoryMethodDiscrete:
        return sn;
      case this.InterpolantFactoryMethodLinear:
        return Ir;
      case this.InterpolantFactoryMethodSmooth:
        return Vn;
    }
  }
  getValueSize() {
    return this.values.length / this.times.length;
  }
  shift(t) {
    if (t !== 0) {
      let e = this.times;
      for (let i = 0, s = e.length; i !== s; ++i)
        e[i] += t;
    }
    return this;
  }
  scale(t) {
    if (t !== 1) {
      let e = this.times;
      for (let i = 0, s = e.length; i !== s; ++i)
        e[i] *= t;
    }
    return this;
  }
  trim(t, e) {
    let i = this.times, s = i.length, n = 0, r = s - 1;
    for (; n !== s && i[n] < t; )
      ++n;
    for (; r !== -1 && i[r] > e; )
      --r;
    if (++r, n !== 0 || r !== s) {
      n >= r && (r = Math.max(r, 1), n = r - 1);
      let o = this.getValueSize();
      this.times = i.slice(n, r), this.values = this.values.slice(n * o, r * o);
    }
    return this;
  }
  validate() {
    let t = true, e = this.getValueSize();
    e - Math.floor(e) !== 0 && (X("KeyframeTrack: Invalid value size in track.", this), t = false);
    let i = this.times, s = this.values, n = i.length;
    n === 0 && (X("KeyframeTrack: Track is empty.", this), t = false);
    let r = null;
    for (let o = 0; o !== n; o++) {
      let a = i[o];
      if (typeof a == "number" && isNaN(a)) {
        X("KeyframeTrack: Time is not a valid number.", this, o, a), t = false;
        break;
      }
      if (r !== null && r > a) {
        X("KeyframeTrack: Out of order keys.", this, o, a, r), t = false;
        break;
      }
      r = a;
    }
    if (s !== void 0 && Gl(s))
      for (let o = 0, a = s.length; o !== a; ++o) {
        let l = s[o];
        if (isNaN(l)) {
          X("KeyframeTrack: Value is not a valid number.", this, o, l), t = false;
          break;
        }
      }
    return t;
  }
  optimize() {
    let t = this.times.slice(), e = this.values.slice(), i = this.getValueSize(), s = this.getInterpolation() === Vn, n = t.length - 1, r = 1;
    for (let o = 1; o < n; ++o) {
      let a = false, l = t[o], c = t[o + 1];
      if (l !== c && (o !== 1 || l !== t[0]))
        if (s)
          a = true;
        else {
          let u = o * i, d = u - i, p = u + i;
          for (let f = 0; f !== i; ++f) {
            let m = e[u + f];
            if (m !== e[d + f] || m !== e[p + f]) {
              a = true;
              break;
            }
          }
        }
      if (a) {
        if (o !== r) {
          t[r] = t[o];
          let u = o * i, d = r * i;
          for (let p = 0; p !== i; ++p)
            e[d + p] = e[u + p];
        }
        ++r;
      }
    }
    if (n > 0) {
      t[r] = t[n];
      for (let o = n * i, a = r * i, l = 0; l !== i; ++l)
        e[a + l] = e[o + l];
      ++r;
    }
    return r !== t.length ? (this.times = t.slice(0, r), this.values = e.slice(0, r * i)) : (this.times = t, this.values = e), this;
  }
  clone() {
    let t = this.times.slice(), e = this.values.slice(), i = this.constructor, s = new i(this.name, t, e);
    return s.createInterpolant = this.createInterpolant, s;
  }
};
Rt.prototype.ValueTypeName = "";
Rt.prototype.TimeBufferType = Float32Array;
Rt.prototype.ValueBufferType = Float32Array;
Rt.prototype.DefaultInterpolation = Ir;
var Fe = class extends Rt {
  constructor(t, e, i) {
    super(t, e, i);
  }
};
Fe.prototype.ValueTypeName = "bool";
Fe.prototype.ValueBufferType = Array;
Fe.prototype.DefaultInterpolation = sn;
Fe.prototype.InterpolantFactoryMethodLinear = void 0;
Fe.prototype.InterpolantFactoryMethodSmooth = void 0;
var Cn = class extends Rt {
  constructor(t, e, i, s) {
    super(t, e, i, s);
  }
};
Cn.prototype.ValueTypeName = "color";
var Ci = class extends Rt {
  constructor(t, e, i, s) {
    super(t, e, i, s);
  }
};
Ci.prototype.ValueTypeName = "number";
var Po = class extends Ii {
  constructor(t, e, i, s) {
    super(t, e, i, s);
  }
  interpolate_(t, e, i, s) {
    let n = this.resultBuffer, r = this.sampleValues, o = this.valueSize, a = (i - e) / (s - e), l = t * o;
    for (let c = l + o; l !== c; l += 4)
      Mt.slerpFlat(n, 0, r, l - o, r, l, a);
    return n;
  }
};
var zi = class extends Rt {
  constructor(t, e, i, s) {
    super(t, e, i, s);
  }
  InterpolantFactoryMethodLinear(t) {
    return new Po(this.times, this.values, this.getValueSize(), t);
  }
};
zi.prototype.ValueTypeName = "quaternion";
zi.prototype.InterpolantFactoryMethodSmooth = void 0;
var Be = class extends Rt {
  constructor(t, e, i) {
    super(t, e, i);
  }
};
Be.prototype.ValueTypeName = "string";
Be.prototype.ValueBufferType = Array;
Be.prototype.DefaultInterpolation = sn;
Be.prototype.InterpolantFactoryMethodLinear = void 0;
Be.prototype.InterpolantFactoryMethodSmooth = void 0;
var Fi = class extends Rt {
  constructor(t, e, i, s) {
    super(t, e, i, s);
  }
};
Fi.prototype.ValueTypeName = "vector";
var Bi = class {
  constructor(t = "", e = -1, i = [], s = sa) {
    this.name = t, this.tracks = i, this.duration = e, this.blendMode = s, this.uuid = Bt(), this.userData = {}, this.duration < 0 && this.resetDuration();
  }
  static parse(t) {
    let e = [], i = t.tracks, s = 1 / (t.fps || 1);
    for (let r = 0, o = i.length; r !== o; ++r)
      e.push(Ud(i[r]).scale(s));
    let n = new this(t.name, t.duration, e, t.blendMode);
    return n.uuid = t.uuid, n.userData = JSON.parse(t.userData || "{}"), n;
  }
  static toJSON(t) {
    let e = [], i = t.tracks, s = { name: t.name, duration: t.duration, tracks: e, uuid: t.uuid, blendMode: t.blendMode, userData: JSON.stringify(t.userData) };
    for (let n = 0, r = i.length; n !== r; ++n)
      e.push(Rt.toJSON(i[n]));
    return s;
  }
  static CreateFromMorphTargetSequence(t, e, i, s) {
    let n = e.length, r = [];
    for (let o = 0; o < n; o++) {
      let a = [], l = [];
      a.push((o + n - 1) % n, o, (o + 1) % n), l.push(0, 1, 0);
      let c = Ql(a);
      a = Fo(a, 1, c), l = Fo(l, 1, c), !s && a[0] === 0 && (a.push(n), l.push(l[0])), r.push(new Ci(".morphTargetInfluences[" + e[o].name + "]", a, l).scale(1 / i));
    }
    return new this(t, -1, r);
  }
  static findByName(t, e) {
    let i = t;
    if (!Array.isArray(t)) {
      let s = t;
      i = s.geometry && s.geometry.animations || s.animations;
    }
    for (let s = 0; s < i.length; s++)
      if (i[s].name === e)
        return i[s];
    return null;
  }
  static CreateClipsFromMorphTargetSequences(t, e, i) {
    let s = {}, n = /^([\w-]*?)([\d]+)$/;
    for (let o = 0, a = t.length; o < a; o++) {
      let l = t[o], c = l.name.match(n);
      if (c && c.length > 1) {
        let u = c[1], d = s[u];
        d || (s[u] = d = []), d.push(l);
      }
    }
    let r = [];
    for (let o in s)
      r.push(this.CreateFromMorphTargetSequence(o, s[o], e, i));
    return r;
  }
  static parseAnimation(t, e) {
    if (E("AnimationClip: parseAnimation() is deprecated and will be removed with r185"), !t)
      return X("AnimationClip: No animation in JSONLoader data."), null;
    let i = function(u, d, p, f, m) {
      if (p.length !== 0) {
        let g2 = [], y3 = [];
        oa(p, g2, y3, f), g2.length !== 0 && m.push(new u(d, g2, y3));
      }
    }, s = [], n = t.name || "default", r = t.fps || 30, o = t.blendMode, a = t.length || -1, l = t.hierarchy || [];
    for (let u = 0; u < l.length; u++) {
      let d = l[u].keys;
      if (!(!d || d.length === 0))
        if (d[0].morphTargets) {
          let p = {}, f;
          for (f = 0; f < d.length; f++)
            if (d[f].morphTargets)
              for (let m = 0; m < d[f].morphTargets.length; m++)
                p[d[f].morphTargets[m]] = -1;
          for (let m in p) {
            let g2 = [], y3 = [];
            for (let x = 0; x !== d[f].morphTargets.length; ++x) {
              let b = d[f];
              g2.push(b.time), y3.push(b.morphTarget === m ? 1 : 0);
            }
            s.push(new Ci(".morphTargetInfluence[" + m + "]", g2, y3));
          }
          a = p.length * r;
        } else {
          let p = ".bones[" + e[u].name + "]";
          i(Fi, p + ".position", d, "pos", s), i(zi, p + ".quaternion", d, "rot", s), i(Fi, p + ".scale", d, "scl", s);
        }
    }
    return s.length === 0 ? null : new this(n, a, s, o);
  }
  resetDuration() {
    let t = this.tracks, e = 0;
    for (let i = 0, s = t.length; i !== s; ++i) {
      let n = this.tracks[i];
      e = Math.max(e, n.times[n.times.length - 1]);
    }
    return this.duration = e, this;
  }
  trim() {
    for (let t = 0; t < this.tracks.length; t++)
      this.tracks[t].trim(0, this.duration);
    return this;
  }
  validate() {
    let t = true;
    for (let e = 0; e < this.tracks.length; e++)
      t = t && this.tracks[e].validate();
    return t;
  }
  optimize() {
    for (let t = 0; t < this.tracks.length; t++)
      this.tracks[t].optimize();
    return this;
  }
  clone() {
    let t = [];
    for (let i = 0; i < this.tracks.length; i++)
      t.push(this.tracks[i].clone());
    let e = new this.constructor(this.name, this.duration, t, this.blendMode);
    return e.userData = JSON.parse(JSON.stringify(this.userData)), e;
  }
  toJSON() {
    return this.constructor.toJSON(this);
  }
};
function Ld(h36) {
  switch (h36.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return Ci;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return Fi;
    case "color":
      return Cn;
    case "quaternion":
      return zi;
    case "bool":
    case "boolean":
      return Fe;
    case "string":
      return Be;
  }
  throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + h36);
}
function Ud(h36) {
  if (h36.type === void 0)
    throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
  let t = Ld(h36.type);
  if (h36.times === void 0) {
    let e = [], i = [];
    oa(h36.keys, e, i, "value"), h36.times = e, h36.values = i;
  }
  return t.parse !== void 0 ? t.parse(h36) : new t(h36.name, h36.times, h36.values, h36.interpolation);
}
var me = { enabled: false, files: {}, add: function(h36, t) {
  this.enabled !== false && (this.files[h36] = t);
}, get: function(h36) {
  if (this.enabled !== false)
    return this.files[h36];
}, remove: function(h36) {
  delete this.files[h36];
}, clear: function() {
  this.files = {};
} };
var zn = class {
  constructor(t, e, i) {
    let s = this, n = false, r = 0, o = 0, a, l = [];
    this.onStart = void 0, this.onLoad = t, this.onProgress = e, this.onError = i, this._abortController = null, this.itemStart = function(c) {
      o++, n === false && s.onStart !== void 0 && s.onStart(c, r, o), n = true;
    }, this.itemEnd = function(c) {
      r++, s.onProgress !== void 0 && s.onProgress(c, r, o), r === o && (n = false, s.onLoad !== void 0 && s.onLoad());
    }, this.itemError = function(c) {
      s.onError !== void 0 && s.onError(c);
    }, this.resolveURL = function(c) {
      return a ? a(c) : c;
    }, this.setURLModifier = function(c) {
      return a = c, this;
    }, this.addHandler = function(c, u) {
      return l.push(c, u), this;
    }, this.removeHandler = function(c) {
      let u = l.indexOf(c);
      return u !== -1 && l.splice(u, 2), this;
    }, this.getHandler = function(c) {
      for (let u = 0, d = l.length; u < d; u += 2) {
        let p = l[u], f = l[u + 1];
        if (p.global && (p.lastIndex = 0), p.test(c))
          return f;
      }
      return null;
    }, this.abort = function() {
      return this.abortController.abort(), this._abortController = null, this;
    };
  }
  get abortController() {
    return this._abortController || (this._abortController = new AbortController()), this._abortController;
  }
};
var Wd = new zn();
var _t = class {
  constructor(t) {
    this.manager = t !== void 0 ? t : Wd, this.crossOrigin = "anonymous", this.withCredentials = false, this.path = "", this.resourcePath = "", this.requestHeader = {};
  }
  load() {
  }
  loadAsync(t, e) {
    let i = this;
    return new Promise(function(s, n) {
      i.load(t, s, e, n);
    });
  }
  parse() {
  }
  setCrossOrigin(t) {
    return this.crossOrigin = t, this;
  }
  setWithCredentials(t) {
    return this.withCredentials = t, this;
  }
  setPath(t) {
    return this.path = t, this;
  }
  setResourcePath(t) {
    return this.resourcePath = t, this;
  }
  setRequestHeader(t) {
    return this.requestHeader = t, this;
  }
  abort() {
    return this;
  }
};
_t.DEFAULT_MATERIAL_NAME = "__DEFAULT";
var ue = {};
var Ro = class extends Error {
  constructor(t, e) {
    super(t), this.response = e;
  }
};
var ie = class extends _t {
  constructor(t) {
    super(t), this.mimeType = "", this.responseType = "", this._abortController = new AbortController();
  }
  load(t, e, i, s) {
    t === void 0 && (t = ""), this.path !== void 0 && (t = this.path + t), t = this.manager.resolveURL(t);
    let n = me.get(`file:${t}`);
    if (n !== void 0)
      return this.manager.itemStart(t), setTimeout(() => {
        e && e(n), this.manager.itemEnd(t);
      }, 0), n;
    if (ue[t] !== void 0) {
      ue[t].push({ onLoad: e, onProgress: i, onError: s });
      return;
    }
    ue[t] = [], ue[t].push({ onLoad: e, onProgress: i, onError: s });
    let r = new Request(t, { headers: new Headers(this.requestHeader), credentials: this.withCredentials ? "include" : "same-origin", signal: typeof AbortSignal.any == "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal }), o = this.mimeType, a = this.responseType;
    fetch(r).then((l) => {
      if (l.status === 200 || l.status === 0) {
        if (l.status === 0 && E("FileLoader: HTTP Status 0 received."), typeof ReadableStream > "u" || l.body === void 0 || l.body.getReader === void 0)
          return l;
        let c = ue[t], u = l.body.getReader(), d = l.headers.get("X-File-Size") || l.headers.get("Content-Length"), p = d ? parseInt(d) : 0, f = p !== 0, m = 0, g2 = new ReadableStream({ start(y3) {
          x();
          function x() {
            u.read().then(({ done: b, value: M }) => {
              if (b)
                y3.close();
              else {
                m += M.byteLength;
                let _2 = new ProgressEvent("progress", { lengthComputable: f, loaded: m, total: p });
                for (let v = 0, A = c.length; v < A; v++) {
                  let S = c[v];
                  S.onProgress && S.onProgress(_2);
                }
                y3.enqueue(M), x();
              }
            }, (b) => {
              y3.error(b);
            });
          }
        } });
        return new Response(g2);
      } else
        throw new Ro(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`, l);
    }).then((l) => {
      switch (a) {
        case "arraybuffer":
          return l.arrayBuffer();
        case "blob":
          return l.blob();
        case "document":
          return l.text().then((c) => new DOMParser().parseFromString(c, o));
        case "json":
          return l.json();
        default:
          if (o === "")
            return l.text();
          {
            let u = /charset="?([^;"\s]*)"?/i.exec(o), d = u && u[1] ? u[1].toLowerCase() : void 0, p = new TextDecoder(d);
            return l.arrayBuffer().then((f) => p.decode(f));
          }
      }
    }).then((l) => {
      me.add(`file:${t}`, l);
      let c = ue[t];
      delete ue[t];
      for (let u = 0, d = c.length; u < d; u++) {
        let p = c[u];
        p.onLoad && p.onLoad(l);
      }
    }).catch((l) => {
      let c = ue[t];
      if (c === void 0)
        throw this.manager.itemError(t), l;
      delete ue[t];
      for (let u = 0, d = c.length; u < d; u++) {
        let p = c[u];
        p.onError && p.onError(l);
      }
      this.manager.itemError(t);
    }).finally(() => {
      this.manager.itemEnd(t);
    }), this.manager.itemStart(t);
  }
  setResponseType(t) {
    return this.responseType = t, this;
  }
  setMimeType(t) {
    return this.mimeType = t, this;
  }
  abort() {
    return this._abortController.abort(), this._abortController = new AbortController(), this;
  }
};
var gi = /* @__PURE__ */ new WeakMap();
var ki = class extends _t {
  constructor(t) {
    super(t);
  }
  load(t, e, i, s) {
    this.path !== void 0 && (t = this.path + t), t = this.manager.resolveURL(t);
    let n = this, r = me.get(`image:${t}`);
    if (r !== void 0) {
      if (r.complete === true)
        n.manager.itemStart(t), setTimeout(function() {
          e && e(r), n.manager.itemEnd(t);
        }, 0);
      else {
        let u = gi.get(r);
        u === void 0 && (u = [], gi.set(r, u)), u.push({ onLoad: e, onError: s });
      }
      return r;
    }
    let o = on("img");
    function a() {
      c(), e && e(this);
      let u = gi.get(this) || [];
      for (let d = 0; d < u.length; d++) {
        let p = u[d];
        p.onLoad && p.onLoad(this);
      }
      gi.delete(this), n.manager.itemEnd(t);
    }
    function l(u) {
      c(), s && s(u), me.remove(`image:${t}`);
      let d = gi.get(this) || [];
      for (let p = 0; p < d.length; p++) {
        let f = d[p];
        f.onError && f.onError(u);
      }
      gi.delete(this), n.manager.itemError(t), n.manager.itemEnd(t);
    }
    function c() {
      o.removeEventListener("load", a, false), o.removeEventListener("error", l, false);
    }
    return o.addEventListener("load", a, false), o.addEventListener("error", l, false), t.slice(0, 5) !== "data:" && this.crossOrigin !== void 0 && (o.crossOrigin = this.crossOrigin), me.add(`image:${t}`, o), n.manager.itemStart(t), o.src = t, o;
  }
};
var Eh = class extends _t {
  constructor(t) {
    super(t);
  }
  load(t, e, i, s) {
    let n = new ss();
    n.colorSpace = Nt;
    let r = new ki(this.manager);
    r.setCrossOrigin(this.crossOrigin), r.setPath(this.path);
    let o = 0;
    function a(l) {
      r.load(t[l], function(c) {
        n.images[l] = c, o++, o === 6 && (n.needsUpdate = true, e && e(n));
      }, void 0, s);
    }
    for (let l = 0; l < t.length; ++l)
      a(l);
    return n;
  }
};
var Vh = class extends _t {
  constructor(t) {
    super(t);
  }
  load(t, e, i, s) {
    let n = new ut(), r = new ki(this.manager);
    return r.setCrossOrigin(this.crossOrigin), r.setPath(this.path), r.load(t, function(o) {
      n.image = o, n.needsUpdate = true, e !== void 0 && e(n);
    }, i, s), n;
  }
};
var xe = class extends H {
  constructor(t, e = 1) {
    super(), this.isLight = true, this.type = "Light", this.color = new V(t), this.intensity = e;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  copy(t, e) {
    return super.copy(t, e), this.color.copy(t.color), this.intensity = t.intensity, this;
  }
  toJSON(t) {
    let e = super.toJSON(t);
    return e.object.color = this.color.getHex(), e.object.intensity = this.intensity, e;
  }
};
var Oo = class extends xe {
  constructor(t, e, i) {
    super(t, i), this.isHemisphereLight = true, this.type = "HemisphereLight", this.position.copy(H.DEFAULT_UP), this.updateMatrix(), this.groundColor = new V(e);
  }
  copy(t, e) {
    return super.copy(t, e), this.groundColor.copy(t.groundColor), this;
  }
  toJSON(t) {
    let e = super.toJSON(t);
    return e.object.groundColor = this.groundColor.getHex(), e;
  }
};
var gr = new U();
var Dh = new w();
var Lh = new w();
var ds = class {
  constructor(t) {
    this.camera = t, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new I(512, 512), this.mapType = ia, this.map = null, this.mapPass = null, this.matrix = new U(), this.autoUpdate = true, this.needsUpdate = false, this._frustum = new rs(), this._frameExtents = new I(1, 1), this._viewportCount = 1, this._viewports = [new Dt(0, 0, 1, 1)];
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(t) {
    let e = this.camera, i = this.matrix;
    Dh.setFromMatrixPosition(t.matrixWorld), e.position.copy(Dh), Lh.setFromMatrixPosition(t.target.matrixWorld), e.lookAt(Lh), e.updateMatrixWorld(), gr.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), this._frustum.setFromProjectionMatrix(gr, e.coordinateSystem, e.reversedDepth), e.reversedDepth ? i.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0, 0, 1) : i.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1), i.multiply(gr);
  }
  getViewport(t) {
    return this._viewports[t];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  copy(t) {
    return this.camera = t.camera.clone(), this.intensity = t.intensity, this.bias = t.bias, this.radius = t.radius, this.autoUpdate = t.autoUpdate, this.needsUpdate = t.needsUpdate, this.normalBias = t.normalBias, this.blurSamples = t.blurSamples, this.mapSize.copy(t.mapSize), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    let t = {};
    return this.intensity !== 1 && (t.intensity = this.intensity), this.bias !== 0 && (t.bias = this.bias), this.normalBias !== 0 && (t.normalBias = this.normalBias), this.radius !== 1 && (t.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (t.mapSize = this.mapSize.toArray()), t.camera = this.camera.toJSON(false).object, delete t.camera.matrix, t;
  }
};
var Eo = class extends ds {
  constructor() {
    super(new At(50, 1, 0.5, 500)), this.isSpotLightShadow = true, this.focus = 1, this.aspect = 1;
  }
  updateMatrices(t) {
    let e = this.camera, i = Ki * 2 * t.angle * this.focus, s = this.mapSize.width / this.mapSize.height * this.aspect, n = t.distance || e.far;
    (i !== e.fov || s !== e.aspect || n !== e.far) && (e.fov = i, e.aspect = s, e.far = n, e.updateProjectionMatrix()), super.updateMatrices(t);
  }
  copy(t) {
    return super.copy(t), this.focus = t.focus, this;
  }
};
var No = class extends xe {
  constructor(t, e, i = 0, s = Math.PI / 3, n = 0, r = 2) {
    super(t, e), this.isSpotLight = true, this.type = "SpotLight", this.position.copy(H.DEFAULT_UP), this.updateMatrix(), this.target = new H(), this.distance = i, this.angle = s, this.penumbra = n, this.decay = r, this.map = null, this.shadow = new Eo();
  }
  get power() {
    return this.intensity * Math.PI;
  }
  set power(t) {
    this.intensity = t / Math.PI;
  }
  dispose() {
    super.dispose(), this.shadow.dispose();
  }
  copy(t, e) {
    return super.copy(t, e), this.distance = t.distance, this.angle = t.angle, this.penumbra = t.penumbra, this.decay = t.decay, this.target = t.target.clone(), this.map = t.map, this.shadow = t.shadow.clone(), this;
  }
  toJSON(t) {
    let e = super.toJSON(t);
    return e.object.distance = this.distance, e.object.angle = this.angle, e.object.decay = this.decay, e.object.penumbra = this.penumbra, e.object.target = this.target.uuid, this.map && this.map.isTexture && (e.object.map = this.map.toJSON(t).uuid), e.object.shadow = this.shadow.toJSON(), e;
  }
};
var Vo = class extends ds {
  constructor() {
    super(new At(90, 1, 0.5, 500)), this.isPointLightShadow = true;
  }
};
var Do = class extends xe {
  constructor(t, e, i = 0, s = 2) {
    super(t, e), this.isPointLight = true, this.type = "PointLight", this.distance = i, this.decay = s, this.shadow = new Vo();
  }
  get power() {
    return this.intensity * 4 * Math.PI;
  }
  set power(t) {
    this.intensity = t / (4 * Math.PI);
  }
  dispose() {
    super.dispose(), this.shadow.dispose();
  }
  copy(t, e) {
    return super.copy(t, e), this.distance = t.distance, this.decay = t.decay, this.shadow = t.shadow.clone(), this;
  }
  toJSON(t) {
    let e = super.toJSON(t);
    return e.object.distance = this.distance, e.object.decay = this.decay, e.object.shadow = this.shadow.toJSON(), e;
  }
};
var Fn = class extends is {
  constructor(t = -1, e = 1, i = 1, s = -1, n = 0.1, r = 2e3) {
    super(), this.isOrthographicCamera = true, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = t, this.right = e, this.top = i, this.bottom = s, this.near = n, this.far = r, this.updateProjectionMatrix();
  }
  copy(t, e) {
    return super.copy(t, e), this.left = t.left, this.right = t.right, this.top = t.top, this.bottom = t.bottom, this.near = t.near, this.far = t.far, this.zoom = t.zoom, this.view = t.view === null ? null : Object.assign({}, t.view), this;
  }
  setViewOffset(t, e, i, s, n, r) {
    this.view === null && (this.view = { enabled: true, fullWidth: 1, fullHeight: 1, offsetX: 0, offsetY: 0, width: 1, height: 1 }), this.view.enabled = true, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = i, this.view.offsetY = s, this.view.width = n, this.view.height = r, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = false), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    let t = (this.right - this.left) / (2 * this.zoom), e = (this.top - this.bottom) / (2 * this.zoom), i = (this.right + this.left) / 2, s = (this.top + this.bottom) / 2, n = i - t, r = i + t, o = s + e, a = s - e;
    if (this.view !== null && this.view.enabled) {
      let l = (this.right - this.left) / this.view.fullWidth / this.zoom, c = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      n += l * this.view.offsetX, r = n + l * this.view.width, o -= c * this.view.offsetY, a = o - c * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(n, r, o, a, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    let e = super.toJSON(t);
    return e.object.zoom = this.zoom, e.object.left = this.left, e.object.right = this.right, e.object.top = this.top, e.object.bottom = this.bottom, e.object.near = this.near, e.object.far = this.far, this.view !== null && (e.object.view = Object.assign({}, this.view)), e;
  }
};
var Lo = class extends ds {
  constructor() {
    super(new Fn(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = true;
  }
};
var Uo = class extends xe {
  constructor(t, e) {
    super(t, e), this.isDirectionalLight = true, this.type = "DirectionalLight", this.position.copy(H.DEFAULT_UP), this.updateMatrix(), this.target = new H(), this.shadow = new Lo();
  }
  dispose() {
    super.dispose(), this.shadow.dispose();
  }
  copy(t) {
    return super.copy(t), this.target = t.target.clone(), this.shadow = t.shadow.clone(), this;
  }
  toJSON(t) {
    let e = super.toJSON(t);
    return e.object.shadow = this.shadow.toJSON(), e.object.target = this.target.uuid, e;
  }
};
var kn = class {
  static extractUrlBase(t) {
    let e = t.lastIndexOf("/");
    return e === -1 ? "./" : t.slice(0, e + 1);
  }
  static resolveURL(t, e) {
    return typeof t != "string" || t === "" ? "" : (/^https?:\/\//i.test(e) && /^\//.test(t) && (e = e.replace(/(^https?:\/\/[^\/]+).*/i, "$1")), /^(https?:)?\/\//i.test(t) || /^data:.*,.*$/i.test(t) || /^blob:.*$/i.test(t) ? t : e + t);
  }
};
var Xo = class extends q {
  constructor() {
    super(), this.isInstancedBufferGeometry = true, this.type = "InstancedBufferGeometry", this.instanceCount = 1 / 0;
  }
  copy(t) {
    return super.copy(t), this.instanceCount = t.instanceCount, this;
  }
  toJSON() {
    let t = super.toJSON();
    return t.instanceCount = this.instanceCount, t.isInstancedBufferGeometry = true, t;
  }
};
var xr = /* @__PURE__ */ new WeakMap();
var Jh = class extends _t {
  constructor(t) {
    super(t), this.isImageBitmapLoader = true, typeof createImageBitmap > "u" && E("ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && E("ImageBitmapLoader: fetch() not supported."), this.options = { premultiplyAlpha: "none" }, this._abortController = new AbortController();
  }
  setOptions(t) {
    return this.options = t, this;
  }
  load(t, e, i, s) {
    t === void 0 && (t = ""), this.path !== void 0 && (t = this.path + t), t = this.manager.resolveURL(t);
    let n = this, r = me.get(`image-bitmap:${t}`);
    if (r !== void 0) {
      if (n.manager.itemStart(t), r.then) {
        r.then((l) => {
          if (xr.has(r) === true)
            s && s(xr.get(r)), n.manager.itemError(t), n.manager.itemEnd(t);
          else
            return e && e(l), n.manager.itemEnd(t), l;
        });
        return;
      }
      return setTimeout(function() {
        e && e(r), n.manager.itemEnd(t);
      }, 0), r;
    }
    let o = {};
    o.credentials = this.crossOrigin === "anonymous" ? "same-origin" : "include", o.headers = this.requestHeader, o.signal = typeof AbortSignal.any == "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal;
    let a = fetch(t, o).then(function(l) {
      return l.blob();
    }).then(function(l) {
      return createImageBitmap(l, Object.assign(n.options, { colorSpaceConversion: "none" }));
    }).then(function(l) {
      return me.add(`image-bitmap:${t}`, l), e && e(l), n.manager.itemEnd(t), l;
    }).catch(function(l) {
      s && s(l), xr.set(a, l), me.remove(`image-bitmap:${t}`), n.manager.itemError(t), n.manager.itemEnd(t);
    });
    me.add(`image-bitmap:${t}`, a), n.manager.itemStart(t);
  }
  abort() {
    return this._abortController.abort(), this._abortController = new AbortController(), this;
  }
};
var Xh = new U();
var Hh = new U();
var De = new U();
var Yh = class extends At {
  constructor(t = []) {
    super(), this.isArrayCamera = true, this.isMultiViewCamera = false, this.cameras = t;
  }
};
var Zo = class {
  constructor(t = true) {
    this.autoStart = t, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = false;
  }
  start() {
    this.startTime = performance.now(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = true;
  }
  stop() {
    this.getElapsedTime(), this.running = false, this.autoStart = false;
  }
  getElapsedTime() {
    return this.getDelta(), this.elapsedTime;
  }
  getDelta() {
    let t = 0;
    if (this.autoStart && !this.running)
      return this.start(), 0;
    if (this.running) {
      let e = performance.now();
      t = (e - this.oldTime) / 1e3, this.oldTime = e, this.elapsedTime += t;
    }
    return t;
  }
};
var Le = new w();
var br = new Mt();
var Jd = new w();
var Ue = new w();
var We = new w();
var qe = new w();
var jh = new Mt();
var Gd = new w();
var Je = new w();
var $o = class {
  constructor(t, e, i) {
    this.binding = t, this.valueSize = i;
    let s, n, r;
    switch (e) {
      case "quaternion":
        s = this._slerp, n = this._slerpAdditive, r = this._setAdditiveIdentityQuaternion, this.buffer = new Float64Array(i * 6), this._workIndex = 5;
        break;
      case "string":
      case "bool":
        s = this._select, n = this._select, r = this._setAdditiveIdentityOther, this.buffer = new Array(i * 5);
        break;
      default:
        s = this._lerp, n = this._lerpAdditive, r = this._setAdditiveIdentityNumeric, this.buffer = new Float64Array(i * 5);
    }
    this._mixBufferRegion = s, this._mixBufferRegionAdditive = n, this._setIdentity = r, this._origIndex = 3, this._addIndex = 4, this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, this.useCount = 0, this.referenceCount = 0;
  }
  accumulate(t, e) {
    let i = this.buffer, s = this.valueSize, n = t * s + s, r = this.cumulativeWeight;
    if (r === 0) {
      for (let o = 0; o !== s; ++o)
        i[n + o] = i[o];
      r = e;
    } else {
      r += e;
      let o = e / r;
      this._mixBufferRegion(i, n, 0, o, s);
    }
    this.cumulativeWeight = r;
  }
  accumulateAdditive(t) {
    let e = this.buffer, i = this.valueSize, s = i * this._addIndex;
    this.cumulativeWeightAdditive === 0 && this._setIdentity(), this._mixBufferRegionAdditive(e, s, 0, t, i), this.cumulativeWeightAdditive += t;
  }
  apply(t) {
    let e = this.valueSize, i = this.buffer, s = t * e + e, n = this.cumulativeWeight, r = this.cumulativeWeightAdditive, o = this.binding;
    if (this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, n < 1) {
      let a = e * this._origIndex;
      this._mixBufferRegion(i, s, a, 1 - n, e);
    }
    r > 0 && this._mixBufferRegionAdditive(i, s, this._addIndex * e, 1, e);
    for (let a = e, l = e + e; a !== l; ++a)
      if (i[a] !== i[a + e]) {
        o.setValue(i, s);
        break;
      }
  }
  saveOriginalState() {
    let t = this.binding, e = this.buffer, i = this.valueSize, s = i * this._origIndex;
    t.getValue(e, s);
    for (let n = i, r = s; n !== r; ++n)
      e[n] = e[s + n % i];
    this._setIdentity(), this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0;
  }
  restoreOriginalState() {
    let t = this.valueSize * 3;
    this.binding.setValue(this.buffer, t);
  }
  _setAdditiveIdentityNumeric() {
    let t = this._addIndex * this.valueSize, e = t + this.valueSize;
    for (let i = t; i < e; i++)
      this.buffer[i] = 0;
  }
  _setAdditiveIdentityQuaternion() {
    this._setAdditiveIdentityNumeric(), this.buffer[this._addIndex * this.valueSize + 3] = 1;
  }
  _setAdditiveIdentityOther() {
    let t = this._origIndex * this.valueSize, e = this._addIndex * this.valueSize;
    for (let i = 0; i < this.valueSize; i++)
      this.buffer[e + i] = this.buffer[t + i];
  }
  _select(t, e, i, s, n) {
    if (s >= 0.5)
      for (let r = 0; r !== n; ++r)
        t[e + r] = t[i + r];
  }
  _slerp(t, e, i, s) {
    Mt.slerpFlat(t, e, t, e, t, i, s);
  }
  _slerpAdditive(t, e, i, s, n) {
    let r = this._workIndex * n;
    Mt.multiplyQuaternionsFlat(t, r, t, e, t, i), Mt.slerpFlat(t, e, t, e, t, r, s);
  }
  _lerp(t, e, i, s, n) {
    let r = 1 - s;
    for (let o = 0; o !== n; ++o) {
      let a = e + o;
      t[a] = t[a] * r + t[i + o] * s;
    }
  }
  _lerpAdditive(t, e, i, s, n) {
    for (let r = 0; r !== n; ++r) {
      let o = e + r;
      t[o] = t[o] + t[i + r] * s;
    }
  }
};
var aa = "\\[\\]\\.:\\/";
var Xd = new RegExp("[" + aa + "]", "g");
var ha = "[^" + aa + "]";
var Hd = "[^" + aa.replace("\\.", "") + "]";
var Zd = /((?:WC+[\/:])*)/.source.replace("WC", ha);
var Yd = /(WCOD+)?/.source.replace("WCOD", Hd);
var $d = /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", ha);
var jd = /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", ha);
var Qd = new RegExp("^" + Zd + Yd + $d + jd + "$");
var Kd = ["material", "materials", "bones", "map"];
var jo = class {
  constructor(t, e, i) {
    let s = i || Y.parseTrackName(e);
    this._targetGroup = t, this._bindings = t.subscribe_(e, s);
  }
  getValue(t, e) {
    this.bind();
    let i = this._targetGroup.nCachedObjects_, s = this._bindings[i];
    s !== void 0 && s.getValue(t, e);
  }
  setValue(t, e) {
    let i = this._bindings;
    for (let s = this._targetGroup.nCachedObjects_, n = i.length; s !== n; ++s)
      i[s].setValue(t, e);
  }
  bind() {
    let t = this._bindings;
    for (let e = this._targetGroup.nCachedObjects_, i = t.length; e !== i; ++e)
      t[e].bind();
  }
  unbind() {
    let t = this._bindings;
    for (let e = this._targetGroup.nCachedObjects_, i = t.length; e !== i; ++e)
      t[e].unbind();
  }
};
var Y = class h35 {
  constructor(t, e, i) {
    this.path = e, this.parsedPath = i || h35.parseTrackName(e), this.node = h35.findNode(t, this.parsedPath.nodeName), this.rootNode = t, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
  static create(t, e, i) {
    return t && t.isAnimationObjectGroup ? new h35.Composite(t, e, i) : new h35(t, e, i);
  }
  static sanitizeNodeName(t) {
    return t.replace(/\s/g, "_").replace(Xd, "");
  }
  static parseTrackName(t) {
    let e = Qd.exec(t);
    if (e === null)
      throw new Error("PropertyBinding: Cannot parse trackName: " + t);
    let i = { nodeName: e[2], objectName: e[3], objectIndex: e[4], propertyName: e[5], propertyIndex: e[6] }, s = i.nodeName && i.nodeName.lastIndexOf(".");
    if (s !== void 0 && s !== -1) {
      let n = i.nodeName.substring(s + 1);
      Kd.indexOf(n) !== -1 && (i.nodeName = i.nodeName.substring(0, s), i.objectName = n);
    }
    if (i.propertyName === null || i.propertyName.length === 0)
      throw new Error("PropertyBinding: can not parse propertyName from trackName: " + t);
    return i;
  }
  static findNode(t, e) {
    if (e === void 0 || e === "" || e === "." || e === -1 || e === t.name || e === t.uuid)
      return t;
    if (t.skeleton) {
      let i = t.skeleton.getBoneByName(e);
      if (i !== void 0)
        return i;
    }
    if (t.children) {
      let i = function(n) {
        for (let r = 0; r < n.length; r++) {
          let o = n[r];
          if (o.name === e || o.uuid === e)
            return o;
          let a = i(o.children);
          if (a)
            return a;
        }
        return null;
      }, s = i(t.children);
      if (s)
        return s;
    }
    return null;
  }
  _getValue_unavailable() {
  }
  _setValue_unavailable() {
  }
  _getValue_direct(t, e) {
    t[e] = this.targetObject[this.propertyName];
  }
  _getValue_array(t, e) {
    let i = this.resolvedProperty;
    for (let s = 0, n = i.length; s !== n; ++s)
      t[e++] = i[s];
  }
  _getValue_arrayElement(t, e) {
    t[e] = this.resolvedProperty[this.propertyIndex];
  }
  _getValue_toArray(t, e) {
    this.resolvedProperty.toArray(t, e);
  }
  _setValue_direct(t, e) {
    this.targetObject[this.propertyName] = t[e];
  }
  _setValue_direct_setNeedsUpdate(t, e) {
    this.targetObject[this.propertyName] = t[e], this.targetObject.needsUpdate = true;
  }
  _setValue_direct_setMatrixWorldNeedsUpdate(t, e) {
    this.targetObject[this.propertyName] = t[e], this.targetObject.matrixWorldNeedsUpdate = true;
  }
  _setValue_array(t, e) {
    let i = this.resolvedProperty;
    for (let s = 0, n = i.length; s !== n; ++s)
      i[s] = t[e++];
  }
  _setValue_array_setNeedsUpdate(t, e) {
    let i = this.resolvedProperty;
    for (let s = 0, n = i.length; s !== n; ++s)
      i[s] = t[e++];
    this.targetObject.needsUpdate = true;
  }
  _setValue_array_setMatrixWorldNeedsUpdate(t, e) {
    let i = this.resolvedProperty;
    for (let s = 0, n = i.length; s !== n; ++s)
      i[s] = t[e++];
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  _setValue_arrayElement(t, e) {
    this.resolvedProperty[this.propertyIndex] = t[e];
  }
  _setValue_arrayElement_setNeedsUpdate(t, e) {
    this.resolvedProperty[this.propertyIndex] = t[e], this.targetObject.needsUpdate = true;
  }
  _setValue_arrayElement_setMatrixWorldNeedsUpdate(t, e) {
    this.resolvedProperty[this.propertyIndex] = t[e], this.targetObject.matrixWorldNeedsUpdate = true;
  }
  _setValue_fromArray(t, e) {
    this.resolvedProperty.fromArray(t, e);
  }
  _setValue_fromArray_setNeedsUpdate(t, e) {
    this.resolvedProperty.fromArray(t, e), this.targetObject.needsUpdate = true;
  }
  _setValue_fromArray_setMatrixWorldNeedsUpdate(t, e) {
    this.resolvedProperty.fromArray(t, e), this.targetObject.matrixWorldNeedsUpdate = true;
  }
  _getValue_unbound(t, e) {
    this.bind(), this.getValue(t, e);
  }
  _setValue_unbound(t, e) {
    this.bind(), this.setValue(t, e);
  }
  bind() {
    let t = this.node, e = this.parsedPath, i = e.objectName, s = e.propertyName, n = e.propertyIndex;
    if (t || (t = h35.findNode(this.rootNode, e.nodeName), this.node = t), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !t) {
      E("PropertyBinding: No target node found for track: " + this.path + ".");
      return;
    }
    if (i) {
      let l = e.objectIndex;
      switch (i) {
        case "materials":
          if (!t.material) {
            X("PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!t.material.materials) {
            X("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
            return;
          }
          t = t.material.materials;
          break;
        case "bones":
          if (!t.skeleton) {
            X("PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
            return;
          }
          t = t.skeleton.bones;
          for (let c = 0; c < t.length; c++)
            if (t[c].name === l) {
              l = c;
              break;
            }
          break;
        case "map":
          if ("map" in t) {
            t = t.map;
            break;
          }
          if (!t.material) {
            X("PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!t.material.map) {
            X("PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
            return;
          }
          t = t.material.map;
          break;
        default:
          if (t[i] === void 0) {
            X("PropertyBinding: Can not bind to objectName of node undefined.", this);
            return;
          }
          t = t[i];
      }
      if (l !== void 0) {
        if (t[l] === void 0) {
          X("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, t);
          return;
        }
        t = t[l];
      }
    }
    let r = t[s];
    if (r === void 0) {
      let l = e.nodeName;
      X("PropertyBinding: Trying to update property for track: " + l + "." + s + " but it wasn't found.", t);
      return;
    }
    let o = this.Versioning.None;
    this.targetObject = t, t.isMaterial === true ? o = this.Versioning.NeedsUpdate : t.isObject3D === true && (o = this.Versioning.MatrixWorldNeedsUpdate);
    let a = this.BindingType.Direct;
    if (n !== void 0) {
      if (s === "morphTargetInfluences") {
        if (!t.geometry) {
          X("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
          return;
        }
        if (!t.geometry.morphAttributes) {
          X("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
          return;
        }
        t.morphTargetDictionary[n] !== void 0 && (n = t.morphTargetDictionary[n]);
      }
      a = this.BindingType.ArrayElement, this.resolvedProperty = r, this.propertyIndex = n;
    } else
      r.fromArray !== void 0 && r.toArray !== void 0 ? (a = this.BindingType.HasFromToArray, this.resolvedProperty = r) : Array.isArray(r) ? (a = this.BindingType.EntireArray, this.resolvedProperty = r) : this.propertyName = s;
    this.getValue = this.GetterByBindingType[a], this.setValue = this.SetterByBindingTypeAndVersioning[a][o];
  }
  unbind() {
    this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
};
Y.Composite = jo;
Y.prototype.BindingType = { Direct: 0, EntireArray: 1, ArrayElement: 2, HasFromToArray: 3 };
Y.prototype.Versioning = { None: 0, NeedsUpdate: 1, MatrixWorldNeedsUpdate: 2 };
Y.prototype.GetterByBindingType = [Y.prototype._getValue_direct, Y.prototype._getValue_array, Y.prototype._getValue_arrayElement, Y.prototype._getValue_toArray];
Y.prototype.SetterByBindingTypeAndVersioning = [[Y.prototype._setValue_direct, Y.prototype._setValue_direct_setNeedsUpdate, Y.prototype._setValue_direct_setMatrixWorldNeedsUpdate], [Y.prototype._setValue_array, Y.prototype._setValue_array_setNeedsUpdate, Y.prototype._setValue_array_setMatrixWorldNeedsUpdate], [Y.prototype._setValue_arrayElement, Y.prototype._setValue_arrayElement_setNeedsUpdate, Y.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate], [Y.prototype._setValue_fromArray, Y.prototype._setValue_fromArray_setNeedsUpdate, Y.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];
var Qo = class {
  constructor(t, e, i = null, s = e.blendMode) {
    this._mixer = t, this._clip = e, this._localRoot = i, this.blendMode = s;
    let n = e.tracks, r = n.length, o = new Array(r), a = { endingStart: wi, endingEnd: wi };
    for (let l = 0; l !== r; ++l) {
      let c = n[l].createInterpolant(null);
      o[l] = c, c.settings = a;
    }
    this._interpolantSettings = a, this._interpolants = o, this._propertyBindings = new Array(r), this._cacheIndex = null, this._byClipCacheIndex = null, this._timeScaleInterpolant = null, this._weightInterpolant = null, this.loop = du, this._loopCount = -1, this._startTime = null, this.time = 0, this.timeScale = 1, this._effectiveTimeScale = 1, this.weight = 1, this._effectiveWeight = 1, this.repetitions = 1 / 0, this.paused = false, this.enabled = true, this.clampWhenFinished = false, this.zeroSlopeAtStart = true, this.zeroSlopeAtEnd = true;
  }
  play() {
    return this._mixer._activateAction(this), this;
  }
  stop() {
    return this._mixer._deactivateAction(this), this.reset();
  }
  reset() {
    return this.paused = false, this.enabled = true, this.time = 0, this._loopCount = -1, this._startTime = null, this.stopFading().stopWarping();
  }
  isRunning() {
    return this.enabled && !this.paused && this.timeScale !== 0 && this._startTime === null && this._mixer._isActiveAction(this);
  }
  isScheduled() {
    return this._mixer._isActiveAction(this);
  }
  startAt(t) {
    return this._startTime = t, this;
  }
  setLoop(t, e) {
    return this.loop = t, this.repetitions = e, this;
  }
  setEffectiveWeight(t) {
    return this.weight = t, this._effectiveWeight = this.enabled ? t : 0, this.stopFading();
  }
  getEffectiveWeight() {
    return this._effectiveWeight;
  }
  fadeIn(t) {
    return this._scheduleFading(t, 0, 1);
  }
  fadeOut(t) {
    return this._scheduleFading(t, 1, 0);
  }
  crossFadeFrom(t, e, i = false) {
    if (t.fadeOut(e), this.fadeIn(e), i === true) {
      let s = this._clip.duration, n = t._clip.duration, r = n / s, o = s / n;
      t.warp(1, r, e), this.warp(o, 1, e);
    }
    return this;
  }
  crossFadeTo(t, e, i = false) {
    return t.crossFadeFrom(this, e, i);
  }
  stopFading() {
    let t = this._weightInterpolant;
    return t !== null && (this._weightInterpolant = null, this._mixer._takeBackControlInterpolant(t)), this;
  }
  setEffectiveTimeScale(t) {
    return this.timeScale = t, this._effectiveTimeScale = this.paused ? 0 : t, this.stopWarping();
  }
  getEffectiveTimeScale() {
    return this._effectiveTimeScale;
  }
  setDuration(t) {
    return this.timeScale = this._clip.duration / t, this.stopWarping();
  }
  syncWith(t) {
    return this.time = t.time, this.timeScale = t.timeScale, this.stopWarping();
  }
  halt(t) {
    return this.warp(this._effectiveTimeScale, 0, t);
  }
  warp(t, e, i) {
    let s = this._mixer, n = s.time, r = this.timeScale, o = this._timeScaleInterpolant;
    o === null && (o = s._lendControlInterpolant(), this._timeScaleInterpolant = o);
    let a = o.parameterPositions, l = o.sampleValues;
    return a[0] = n, a[1] = n + i, l[0] = t / r, l[1] = e / r, this;
  }
  stopWarping() {
    let t = this._timeScaleInterpolant;
    return t !== null && (this._timeScaleInterpolant = null, this._mixer._takeBackControlInterpolant(t)), this;
  }
  getMixer() {
    return this._mixer;
  }
  getClip() {
    return this._clip;
  }
  getRoot() {
    return this._localRoot || this._mixer._root;
  }
  _update(t, e, i, s) {
    if (!this.enabled) {
      this._updateWeight(t);
      return;
    }
    let n = this._startTime;
    if (n !== null) {
      let a = (t - n) * i;
      a < 0 || i === 0 ? e = 0 : (this._startTime = null, e = i * a);
    }
    e *= this._updateTimeScale(t);
    let r = this._updateTime(e), o = this._updateWeight(t);
    if (o > 0) {
      let a = this._interpolants, l = this._propertyBindings;
      switch (this.blendMode) {
        case ql:
          for (let c = 0, u = a.length; c !== u; ++c)
            a[c].evaluate(r), l[c].accumulateAdditive(o);
          break;
        case sa:
        default:
          for (let c = 0, u = a.length; c !== u; ++c)
            a[c].evaluate(r), l[c].accumulate(s, o);
      }
    }
  }
  _updateWeight(t) {
    let e = 0;
    if (this.enabled) {
      e = this.weight;
      let i = this._weightInterpolant;
      if (i !== null) {
        let s = i.evaluate(t)[0];
        e *= s, t > i.parameterPositions[1] && (this.stopFading(), s === 0 && (this.enabled = false));
      }
    }
    return this._effectiveWeight = e, e;
  }
  _updateTimeScale(t) {
    let e = 0;
    if (!this.paused) {
      e = this.timeScale;
      let i = this._timeScaleInterpolant;
      if (i !== null) {
        let s = i.evaluate(t)[0];
        e *= s, t > i.parameterPositions[1] && (this.stopWarping(), e === 0 ? this.paused = true : this.timeScale = e);
      }
    }
    return this._effectiveTimeScale = e, e;
  }
  _updateTime(t) {
    let e = this._clip.duration, i = this.loop, s = this.time + t, n = this._loopCount, r = i === pu;
    if (t === 0)
      return n === -1 ? s : r && (n & 1) === 1 ? e - s : s;
    if (i === uu) {
      n === -1 && (this._loopCount = 0, this._setEndings(true, true, false));
      t: {
        if (s >= e)
          s = e;
        else if (s < 0)
          s = 0;
        else {
          this.time = s;
          break t;
        }
        this.clampWhenFinished ? this.paused = true : this.enabled = false, this.time = s, this._mixer.dispatchEvent({ type: "finished", action: this, direction: t < 0 ? -1 : 1 });
      }
    } else {
      if (n === -1 && (t >= 0 ? (n = 0, this._setEndings(true, this.repetitions === 0, r)) : this._setEndings(this.repetitions === 0, true, r)), s >= e || s < 0) {
        let o = Math.floor(s / e);
        s -= e * o, n += Math.abs(o);
        let a = this.repetitions - n;
        if (a <= 0)
          this.clampWhenFinished ? this.paused = true : this.enabled = false, s = t > 0 ? e : 0, this.time = s, this._mixer.dispatchEvent({ type: "finished", action: this, direction: t > 0 ? 1 : -1 });
        else {
          if (a === 1) {
            let l = t < 0;
            this._setEndings(l, !l, r);
          } else
            this._setEndings(false, false, r);
          this._loopCount = n, this.time = s, this._mixer.dispatchEvent({ type: "loop", action: this, loopDelta: o });
        }
      } else
        this.time = s;
      if (r && (n & 1) === 1)
        return e - s;
    }
    return s;
  }
  _setEndings(t, e, i) {
    let s = this._interpolantSettings;
    i ? (s.endingStart = Mi, s.endingEnd = Mi) : (t ? s.endingStart = this.zeroSlopeAtStart ? Mi : wi : s.endingStart = nn, e ? s.endingEnd = this.zeroSlopeAtEnd ? Mi : wi : s.endingEnd = nn);
  }
  _scheduleFading(t, e, i) {
    let s = this._mixer, n = s.time, r = this._weightInterpolant;
    r === null && (r = s._lendControlInterpolant(), this._weightInterpolant = r);
    let o = r.parameterPositions, a = r.sampleValues;
    return o[0] = n, a[0] = e, o[1] = n + t, a[1] = i, this;
  }
};
var tp = new Float32Array(1);
var el = class extends Kt {
  constructor(t) {
    super(), this._root = t, this._initMemoryManager(), this._accuIndex = 0, this.time = 0, this.timeScale = 1;
  }
  _bindAction(t, e) {
    let i = t._localRoot || this._root, s = t._clip.tracks, n = s.length, r = t._propertyBindings, o = t._interpolants, a = i.uuid, l = this._bindingsByRootAndName, c = l[a];
    c === void 0 && (c = {}, l[a] = c);
    for (let u = 0; u !== n; ++u) {
      let d = s[u], p = d.name, f = c[p];
      if (f !== void 0)
        ++f.referenceCount, r[u] = f;
      else {
        if (f = r[u], f !== void 0) {
          f._cacheIndex === null && (++f.referenceCount, this._addInactiveBinding(f, a, p));
          continue;
        }
        let m = e && e._propertyBindings[u].binding.parsedPath;
        f = new $o(Y.create(i, p, m), d.ValueTypeName, d.getValueSize()), ++f.referenceCount, this._addInactiveBinding(f, a, p), r[u] = f;
      }
      o[u].resultBuffer = f.buffer;
    }
  }
  _activateAction(t) {
    if (!this._isActiveAction(t)) {
      if (t._cacheIndex === null) {
        let i = (t._localRoot || this._root).uuid, s = t._clip.uuid, n = this._actionsByClip[s];
        this._bindAction(t, n && n.knownActions[0]), this._addInactiveAction(t, s, i);
      }
      let e = t._propertyBindings;
      for (let i = 0, s = e.length; i !== s; ++i) {
        let n = e[i];
        n.useCount++ === 0 && (this._lendBinding(n), n.saveOriginalState());
      }
      this._lendAction(t);
    }
  }
  _deactivateAction(t) {
    if (this._isActiveAction(t)) {
      let e = t._propertyBindings;
      for (let i = 0, s = e.length; i !== s; ++i) {
        let n = e[i];
        --n.useCount === 0 && (n.restoreOriginalState(), this._takeBackBinding(n));
      }
      this._takeBackAction(t);
    }
  }
  _initMemoryManager() {
    this._actions = [], this._nActiveActions = 0, this._actionsByClip = {}, this._bindings = [], this._nActiveBindings = 0, this._bindingsByRootAndName = {}, this._controlInterpolants = [], this._nActiveControlInterpolants = 0;
    let t = this;
    this.stats = { actions: { get total() {
      return t._actions.length;
    }, get inUse() {
      return t._nActiveActions;
    } }, bindings: { get total() {
      return t._bindings.length;
    }, get inUse() {
      return t._nActiveBindings;
    } }, controlInterpolants: { get total() {
      return t._controlInterpolants.length;
    }, get inUse() {
      return t._nActiveControlInterpolants;
    } } };
  }
  _isActiveAction(t) {
    let e = t._cacheIndex;
    return e !== null && e < this._nActiveActions;
  }
  _addInactiveAction(t, e, i) {
    let s = this._actions, n = this._actionsByClip, r = n[e];
    if (r === void 0)
      r = { knownActions: [t], actionByRoot: {} }, t._byClipCacheIndex = 0, n[e] = r;
    else {
      let o = r.knownActions;
      t._byClipCacheIndex = o.length, o.push(t);
    }
    t._cacheIndex = s.length, s.push(t), r.actionByRoot[i] = t;
  }
  _removeInactiveAction(t) {
    let e = this._actions, i = e[e.length - 1], s = t._cacheIndex;
    i._cacheIndex = s, e[s] = i, e.pop(), t._cacheIndex = null;
    let n = t._clip.uuid, r = this._actionsByClip, o = r[n], a = o.knownActions, l = a[a.length - 1], c = t._byClipCacheIndex;
    l._byClipCacheIndex = c, a[c] = l, a.pop(), t._byClipCacheIndex = null;
    let u = o.actionByRoot, d = (t._localRoot || this._root).uuid;
    delete u[d], a.length === 0 && delete r[n], this._removeInactiveBindingsForAction(t);
  }
  _removeInactiveBindingsForAction(t) {
    let e = t._propertyBindings;
    for (let i = 0, s = e.length; i !== s; ++i) {
      let n = e[i];
      --n.referenceCount === 0 && this._removeInactiveBinding(n);
    }
  }
  _lendAction(t) {
    let e = this._actions, i = t._cacheIndex, s = this._nActiveActions++, n = e[s];
    t._cacheIndex = s, e[s] = t, n._cacheIndex = i, e[i] = n;
  }
  _takeBackAction(t) {
    let e = this._actions, i = t._cacheIndex, s = --this._nActiveActions, n = e[s];
    t._cacheIndex = s, e[s] = t, n._cacheIndex = i, e[i] = n;
  }
  _addInactiveBinding(t, e, i) {
    let s = this._bindingsByRootAndName, n = this._bindings, r = s[e];
    r === void 0 && (r = {}, s[e] = r), r[i] = t, t._cacheIndex = n.length, n.push(t);
  }
  _removeInactiveBinding(t) {
    let e = this._bindings, i = t.binding, s = i.rootNode.uuid, n = i.path, r = this._bindingsByRootAndName, o = r[s], a = e[e.length - 1], l = t._cacheIndex;
    a._cacheIndex = l, e[l] = a, e.pop(), delete o[n], Object.keys(o).length === 0 && delete r[s];
  }
  _lendBinding(t) {
    let e = this._bindings, i = t._cacheIndex, s = this._nActiveBindings++, n = e[s];
    t._cacheIndex = s, e[s] = t, n._cacheIndex = i, e[i] = n;
  }
  _takeBackBinding(t) {
    let e = this._bindings, i = t._cacheIndex, s = --this._nActiveBindings, n = e[s];
    t._cacheIndex = s, e[s] = t, n._cacheIndex = i, e[i] = n;
  }
  _lendControlInterpolant() {
    let t = this._controlInterpolants, e = this._nActiveControlInterpolants++, i = t[e];
    return i === void 0 && (i = new In(new Float32Array(2), new Float32Array(2), 1, tp), i.__cacheIndex = e, t[e] = i), i;
  }
  _takeBackControlInterpolant(t) {
    let e = this._controlInterpolants, i = t.__cacheIndex, s = --this._nActiveControlInterpolants, n = e[s];
    t.__cacheIndex = s, e[s] = t, n.__cacheIndex = i, e[i] = n;
  }
  clipAction(t, e, i) {
    let s = e || this._root, n = s.uuid, r = typeof t == "string" ? Bi.findByName(s, t) : t, o = r !== null ? r.uuid : t, a = this._actionsByClip[o], l = null;
    if (i === void 0 && (r !== null ? i = r.blendMode : i = sa), a !== void 0) {
      let u = a.actionByRoot[n];
      if (u !== void 0 && u.blendMode === i)
        return u;
      l = a.knownActions[0], r === null && (r = l._clip);
    }
    if (r === null)
      return null;
    let c = new Qo(this, r, e, i);
    return this._bindAction(c, l), this._addInactiveAction(c, o, n), c;
  }
  existingAction(t, e) {
    let i = e || this._root, s = i.uuid, n = typeof t == "string" ? Bi.findByName(i, t) : t, r = n ? n.uuid : t, o = this._actionsByClip[r];
    return o !== void 0 && o.actionByRoot[s] || null;
  }
  stopAllAction() {
    let t = this._actions, e = this._nActiveActions;
    for (let i = e - 1; i >= 0; --i)
      t[i].stop();
    return this;
  }
  update(t) {
    t *= this.timeScale;
    let e = this._actions, i = this._nActiveActions, s = this.time += t, n = Math.sign(t), r = this._accuIndex ^= 1;
    for (let l = 0; l !== i; ++l)
      e[l]._update(s, t, n, r);
    let o = this._bindings, a = this._nActiveBindings;
    for (let l = 0; l !== a; ++l)
      o[l].apply(r);
    return this;
  }
  setTime(t) {
    this.time = 0;
    for (let e = 0; e < this._actions.length; e++)
      this._actions[e].time = 0;
    return this.update(t);
  }
  getRoot() {
    return this._root;
  }
  uncacheClip(t) {
    let e = this._actions, i = t.uuid, s = this._actionsByClip, n = s[i];
    if (n !== void 0) {
      let r = n.knownActions;
      for (let o = 0, a = r.length; o !== a; ++o) {
        let l = r[o];
        this._deactivateAction(l);
        let c = l._cacheIndex, u = e[e.length - 1];
        l._cacheIndex = null, l._byClipCacheIndex = null, u._cacheIndex = c, e[c] = u, e.pop(), this._removeInactiveBindingsForAction(l);
      }
      delete s[i];
    }
  }
  uncacheRoot(t) {
    let e = t.uuid, i = this._actionsByClip;
    for (let r in i) {
      let o = i[r].actionByRoot, a = o[e];
      a !== void 0 && (this._deactivateAction(a), this._removeInactiveAction(a));
    }
    let s = this._bindingsByRootAndName, n = s[e];
    if (n !== void 0)
      for (let r in n) {
        let o = n[r];
        o.restoreOriginalState(), this._removeInactiveBinding(o);
      }
  }
  uncacheAction(t, e) {
    let i = this.existingAction(t, e);
    i !== null && (this._deactivateAction(i), this._removeInactiveAction(i));
  }
};
var al = new U();
var fl = new I();
var yl = new w();
var $s = new w();
var xi = new w();
var bi = new w();
var wr = new w();
var sp = new w();
var np = new w();
var xl = new w();
var Ae = new w();
var js = new U();
var Mr = new U();
var rp = new w();
var _l = new V();
var vl = new V();
var Il = new w();
var Qs = new w();
var Cl = new w();
var Ks = new w();
var st = new is();
var tn = new pt();
var Rl = new w();
function lp(h36, t, e, i) {
  let s = cp(i);
  switch (e) {
    case vc:
      return h36 * t;
    case Ul:
      return h36 * t / s.components * s.byteLength;
    case Wl:
      return h36 * t / s.components * s.byteLength;
    case Tc:
      return h36 * t * 2 / s.components * s.byteLength;
    case Ic:
      return h36 * t * 2 / s.components * s.byteLength;
    case Sc:
      return h36 * t * 3 / s.components * s.byteLength;
    case ji:
      return h36 * t * 4 / s.components * s.byteLength;
    case Cc:
      return h36 * t * 4 / s.components * s.byteLength;
    case zc:
    case Fc:
      return Math.floor((h36 + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Bc:
    case kc:
      return Math.floor((h36 + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Rc:
    case Ec:
      return Math.max(h36, 16) * Math.max(t, 8) / 4;
    case Pc:
    case Oc:
      return Math.max(h36, 8) * Math.max(t, 8) / 2;
    case Nc:
    case Vc:
    case Lc:
    case Uc:
      return Math.floor((h36 + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Dc:
    case Wc:
    case qc:
      return Math.floor((h36 + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Jc:
      return Math.floor((h36 + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Gc:
      return Math.floor((h36 + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case Xc:
      return Math.floor((h36 + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case Hc:
      return Math.floor((h36 + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case Zc:
      return Math.floor((h36 + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case Yc:
      return Math.floor((h36 + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case $c:
      return Math.floor((h36 + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case jc:
      return Math.floor((h36 + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case Qc:
      return Math.floor((h36 + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case Kc:
      return Math.floor((h36 + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case tu:
      return Math.floor((h36 + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case eu:
      return Math.floor((h36 + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case iu:
      return Math.floor((h36 + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case su:
      return Math.floor((h36 + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    case nu:
    case ru:
    case ou:
      return Math.ceil(h36 / 4) * Math.ceil(t / 4) * 16;
    case au:
    case hu:
      return Math.ceil(h36 / 4) * Math.ceil(t / 4) * 8;
    case lu:
    case cu:
      return Math.ceil(h36 / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(`Unable to determine texture byte length for ${e} format.`);
}
function cp(h36) {
  switch (h36) {
    case ia:
    case fc:
      return { byteLength: 1, components: 1 };
    case yc:
    case mc:
    case xc:
      return { byteLength: 2, components: 1 };
    case bc:
    case wc:
      return { byteLength: 2, components: 4 };
    case En:
    case gc:
    case Si:
      return { byteLength: 4, components: 1 };
    case Mc:
    case _c:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${h36}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: { revision: "182" } }));
typeof window < "u" && (window.__THREE__ ? E("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = "182");

// http-url:https://esm.sh/three@0.182.0/es2022/three.mjs
function Jr2() {
  let e = null, n = false, t = null, i = null;
  function l(a, h36) {
    t(a, h36), i = e.requestAnimationFrame(l);
  }
  return { start: function() {
    n !== true && t !== null && (i = e.requestAnimationFrame(l), n = true);
  }, stop: function() {
    e.cancelAnimationFrame(i), n = false;
  }, setAnimationLoop: function(a) {
    t = a;
  }, setContext: function(a) {
    e = a;
  } };
}
function Ro2(e) {
  let n = /* @__PURE__ */ new WeakMap();
  function t(d, b) {
    let x = d.array, w2 = d.usage, g2 = x.byteLength, S = e.createBuffer();
    e.bindBuffer(b, S), e.bufferData(b, x, w2), d.onUploadCallback();
    let R;
    if (x instanceof Float32Array)
      R = e.FLOAT;
    else if (typeof Float16Array < "u" && x instanceof Float16Array)
      R = e.HALF_FLOAT;
    else if (x instanceof Uint16Array)
      d.isFloat16BufferAttribute ? R = e.HALF_FLOAT : R = e.UNSIGNED_SHORT;
    else if (x instanceof Int16Array)
      R = e.SHORT;
    else if (x instanceof Uint32Array)
      R = e.UNSIGNED_INT;
    else if (x instanceof Int32Array)
      R = e.INT;
    else if (x instanceof Int8Array)
      R = e.BYTE;
    else if (x instanceof Uint8Array)
      R = e.UNSIGNED_BYTE;
    else if (x instanceof Uint8ClampedArray)
      R = e.UNSIGNED_BYTE;
    else
      throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + x);
    return { buffer: S, type: R, bytesPerElement: x.BYTES_PER_ELEMENT, version: d.version, size: g2 };
  }
  function i(d, b, x) {
    let w2 = b.array, g2 = b.updateRanges;
    if (e.bindBuffer(x, d), g2.length === 0)
      e.bufferSubData(x, 0, w2);
    else {
      g2.sort((R, O) => R.start - O.start);
      let S = 0;
      for (let R = 1; R < g2.length; R++) {
        let O = g2[S], U2 = g2[R];
        U2.start <= O.start + O.count + 1 ? O.count = Math.max(O.count, U2.start + U2.count - O.start) : (++S, g2[S] = U2);
      }
      g2.length = S + 1;
      for (let R = 0, O = g2.length; R < O; R++) {
        let U2 = g2[R];
        e.bufferSubData(x, U2.start * w2.BYTES_PER_ELEMENT, w2, U2.start, U2.count);
      }
      b.clearUpdateRanges();
    }
    b.onUploadCallback();
  }
  function l(d) {
    return d.isInterleavedBufferAttribute && (d = d.data), n.get(d);
  }
  function a(d) {
    d.isInterleavedBufferAttribute && (d = d.data);
    let b = n.get(d);
    b && (e.deleteBuffer(b.buffer), n.delete(d));
  }
  function h36(d, b) {
    if (d.isInterleavedBufferAttribute && (d = d.data), d.isGLBufferAttribute) {
      let w2 = n.get(d);
      (!w2 || w2.version < d.version) && n.set(d, { buffer: d.buffer, type: d.type, bytesPerElement: d.elementSize, version: d.version });
      return;
    }
    let x = n.get(d);
    if (x === void 0)
      n.set(d, t(d, b));
    else if (x.version < d.version) {
      if (x.size !== d.array.byteLength)
        throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      i(x.buffer, d, b), x.version = d.version;
    }
  }
  return { get: l, remove: a, update: h36 };
}
var bo2 = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`;
var Co2 = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`;
var Po2 = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`;
var Lo2 = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`;
var Do2 = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`;
var Uo2 = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`;
var wo2 = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`;
var Io2 = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`;
var No2 = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`;
var yo2 = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`;
var Fo2 = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`;
var Oo2 = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`;
var Bo2 = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`;
var Go2 = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`;
var Ho2 = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`;
var Vo2 = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`;
var ko2 = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`;
var Wo2 = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`;
var zo2 = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`;
var Xo2 = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`;
var Yo2 = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`;
var qo2 = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`;
var Ko = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`;
var $o2 = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`;
var Zo2 = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`;
var Qo2 = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`;
var Jo2 = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`;
var jo2 = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`;
var es2 = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`;
var ts2 = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`;
var ns2 = "gl_FragColor = linearToOutputTexel( gl_FragColor );";
var is2 = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`;
var rs2 = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`;
var as2 = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`;
var os2 = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`;
var ss2 = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`;
var ls2 = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`;
var cs2 = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`;
var fs2 = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`;
var ds2 = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`;
var us2 = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`;
var ps = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`;
var hs2 = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`;
var ms2 = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`;
var _s2 = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`;
var gs2 = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`;
var vs2 = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`;
var Ss2 = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`;
var Es2 = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`;
var xs2 = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`;
var Ms2 = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`;
var Ts2 = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`;
var As2 = `uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`;
var Rs2 = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`;
var bs2 = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`;
var Cs2 = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`;
var Ps2 = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`;
var Ls2 = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`;
var Ds2 = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`;
var Us2 = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`;
var ws2 = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`;
var Is2 = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`;
var Ns2 = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`;
var ys2 = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`;
var Fs2 = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`;
var Os2 = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`;
var Bs2 = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`;
var Gs2 = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`;
var Hs2 = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`;
var Vs = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`;
var ks = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`;
var Ws2 = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`;
var zs2 = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`;
var Xs2 = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`;
var Ys = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`;
var qs2 = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`;
var Ks2 = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`;
var $s2 = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`;
var Zs2 = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`;
var Qs2 = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`;
var Js2 = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`;
var js2 = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`;
var el2 = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`;
var tl2 = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`;
var nl2 = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`;
var il2 = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`;
var rl2 = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`;
var al2 = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`;
var ol2 = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`;
var sl2 = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`;
var ll = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`;
var cl2 = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`;
var fl2 = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`;
var dl2 = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`;
var ul2 = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`;
var pl2 = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`;
var hl2 = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`;
var ml2 = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`;
var _l2 = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`;
var gl2 = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`;
var vl2 = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`;
var Sl2 = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`;
var El2 = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`;
var xl2 = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`;
var Ml2 = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`;
var Tl2 = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`;
var Al2 = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
var Rl2 = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`;
var bl2 = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`;
var Cl2 = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`;
var Pl2 = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`;
var Ll2 = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`;
var Dl2 = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`;
var Ul2 = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`;
var wl2 = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`;
var Il2 = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`;
var Nl2 = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`;
var yl2 = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`;
var Fl2 = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`;
var Ol2 = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`;
var Bl2 = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`;
var Gl2 = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`;
var Hl2 = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`;
var Vl2 = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`;
var kl2 = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`;
var Wl2 = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`;
var zl2 = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`;
var Xl2 = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`;
var Yl2 = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`;
var ql2 = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`;
var Kl = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`;
var $l2 = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`;
var Zl2 = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`;
var Ql2 = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`;
var Jl2 = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`;
var jl2 = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`;
var ec = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`;
var tc = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`;
var nc = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`;
var ic = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`;
var rc2 = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`;
var Pe2 = { alphahash_fragment: bo2, alphahash_pars_fragment: Co2, alphamap_fragment: Po2, alphamap_pars_fragment: Lo2, alphatest_fragment: Do2, alphatest_pars_fragment: Uo2, aomap_fragment: wo2, aomap_pars_fragment: Io2, batching_pars_vertex: No2, batching_vertex: yo2, begin_vertex: Fo2, beginnormal_vertex: Oo2, bsdfs: Bo2, iridescence_fragment: Go2, bumpmap_pars_fragment: Ho2, clipping_planes_fragment: Vo2, clipping_planes_pars_fragment: ko2, clipping_planes_pars_vertex: Wo2, clipping_planes_vertex: zo2, color_fragment: Xo2, color_pars_fragment: Yo2, color_pars_vertex: qo2, color_vertex: Ko, common: $o2, cube_uv_reflection_fragment: Zo2, defaultnormal_vertex: Qo2, displacementmap_pars_vertex: Jo2, displacementmap_vertex: jo2, emissivemap_fragment: es2, emissivemap_pars_fragment: ts2, colorspace_fragment: ns2, colorspace_pars_fragment: is2, envmap_fragment: rs2, envmap_common_pars_fragment: as2, envmap_pars_fragment: os2, envmap_pars_vertex: ss2, envmap_physical_pars_fragment: vs2, envmap_vertex: ls2, fog_vertex: cs2, fog_pars_vertex: fs2, fog_fragment: ds2, fog_pars_fragment: us2, gradientmap_pars_fragment: ps, lightmap_pars_fragment: hs2, lights_lambert_fragment: ms2, lights_lambert_pars_fragment: _s2, lights_pars_begin: gs2, lights_toon_fragment: Ss2, lights_toon_pars_fragment: Es2, lights_phong_fragment: xs2, lights_phong_pars_fragment: Ms2, lights_physical_fragment: Ts2, lights_physical_pars_fragment: As2, lights_fragment_begin: Rs2, lights_fragment_maps: bs2, lights_fragment_end: Cs2, logdepthbuf_fragment: Ps2, logdepthbuf_pars_fragment: Ls2, logdepthbuf_pars_vertex: Ds2, logdepthbuf_vertex: Us2, map_fragment: ws2, map_pars_fragment: Is2, map_particle_fragment: Ns2, map_particle_pars_fragment: ys2, metalnessmap_fragment: Fs2, metalnessmap_pars_fragment: Os2, morphinstance_vertex: Bs2, morphcolor_vertex: Gs2, morphnormal_vertex: Hs2, morphtarget_pars_vertex: Vs, morphtarget_vertex: ks, normal_fragment_begin: Ws2, normal_fragment_maps: zs2, normal_pars_fragment: Xs2, normal_pars_vertex: Ys, normal_vertex: qs2, normalmap_pars_fragment: Ks2, clearcoat_normal_fragment_begin: $s2, clearcoat_normal_fragment_maps: Zs2, clearcoat_pars_fragment: Qs2, iridescence_pars_fragment: Js2, opaque_fragment: js2, packing: el2, premultiplied_alpha_fragment: tl2, project_vertex: nl2, dithering_fragment: il2, dithering_pars_fragment: rl2, roughnessmap_fragment: al2, roughnessmap_pars_fragment: ol2, shadowmap_pars_fragment: sl2, shadowmap_pars_vertex: ll, shadowmap_vertex: cl2, shadowmask_pars_fragment: fl2, skinbase_vertex: dl2, skinning_pars_vertex: ul2, skinning_vertex: pl2, skinnormal_vertex: hl2, specularmap_fragment: ml2, specularmap_pars_fragment: _l2, tonemapping_fragment: gl2, tonemapping_pars_fragment: vl2, transmission_fragment: Sl2, transmission_pars_fragment: El2, uv_pars_fragment: xl2, uv_pars_vertex: Ml2, uv_vertex: Tl2, worldpos_vertex: Al2, background_vert: Rl2, background_frag: bl2, backgroundCube_vert: Cl2, backgroundCube_frag: Pl2, cube_vert: Ll2, cube_frag: Dl2, depth_vert: Ul2, depth_frag: wl2, distance_vert: Il2, distance_frag: Nl2, equirect_vert: yl2, equirect_frag: Fl2, linedashed_vert: Ol2, linedashed_frag: Bl2, meshbasic_vert: Gl2, meshbasic_frag: Hl2, meshlambert_vert: Vl2, meshlambert_frag: kl2, meshmatcap_vert: Wl2, meshmatcap_frag: zl2, meshnormal_vert: Xl2, meshnormal_frag: Yl2, meshphong_vert: ql2, meshphong_frag: Kl, meshphysical_vert: $l2, meshphysical_frag: Zl2, meshtoon_vert: Ql2, meshtoon_frag: Jl2, points_vert: jl2, points_frag: ec, shadow_vert: tc, shadow_frag: nc, sprite_vert: ic, sprite_frag: rc2 };
var ae2 = { common: { diffuse: { value: new V(16777215) }, opacity: { value: 1 }, map: { value: null }, mapTransform: { value: new te() }, alphaMap: { value: null }, alphaMapTransform: { value: new te() }, alphaTest: { value: 0 } }, specularmap: { specularMap: { value: null }, specularMapTransform: { value: new te() } }, envmap: { envMap: { value: null }, envMapRotation: { value: new te() }, flipEnvMap: { value: -1 }, reflectivity: { value: 1 }, ior: { value: 1.5 }, refractionRatio: { value: 0.98 }, dfgLUT: { value: null } }, aomap: { aoMap: { value: null }, aoMapIntensity: { value: 1 }, aoMapTransform: { value: new te() } }, lightmap: { lightMap: { value: null }, lightMapIntensity: { value: 1 }, lightMapTransform: { value: new te() } }, bumpmap: { bumpMap: { value: null }, bumpMapTransform: { value: new te() }, bumpScale: { value: 1 } }, normalmap: { normalMap: { value: null }, normalMapTransform: { value: new te() }, normalScale: { value: new I(1, 1) } }, displacementmap: { displacementMap: { value: null }, displacementMapTransform: { value: new te() }, displacementScale: { value: 1 }, displacementBias: { value: 0 } }, emissivemap: { emissiveMap: { value: null }, emissiveMapTransform: { value: new te() } }, metalnessmap: { metalnessMap: { value: null }, metalnessMapTransform: { value: new te() } }, roughnessmap: { roughnessMap: { value: null }, roughnessMapTransform: { value: new te() } }, gradientmap: { gradientMap: { value: null } }, fog: { fogDensity: { value: 25e-5 }, fogNear: { value: 1 }, fogFar: { value: 2e3 }, fogColor: { value: new V(16777215) } }, lights: { ambientLightColor: { value: [] }, lightProbe: { value: [] }, directionalLights: { value: [], properties: { direction: {}, color: {} } }, directionalLightShadows: { value: [], properties: { shadowIntensity: 1, shadowBias: {}, shadowNormalBias: {}, shadowRadius: {}, shadowMapSize: {} } }, directionalShadowMap: { value: [] }, directionalShadowMatrix: { value: [] }, spotLights: { value: [], properties: { color: {}, position: {}, direction: {}, distance: {}, coneCos: {}, penumbraCos: {}, decay: {} } }, spotLightShadows: { value: [], properties: { shadowIntensity: 1, shadowBias: {}, shadowNormalBias: {}, shadowRadius: {}, shadowMapSize: {} } }, spotLightMap: { value: [] }, spotShadowMap: { value: [] }, spotLightMatrix: { value: [] }, pointLights: { value: [], properties: { color: {}, position: {}, decay: {}, distance: {} } }, pointLightShadows: { value: [], properties: { shadowIntensity: 1, shadowBias: {}, shadowNormalBias: {}, shadowRadius: {}, shadowMapSize: {}, shadowCameraNear: {}, shadowCameraFar: {} } }, pointShadowMap: { value: [] }, pointShadowMatrix: { value: [] }, hemisphereLights: { value: [], properties: { direction: {}, skyColor: {}, groundColor: {} } }, rectAreaLights: { value: [], properties: { color: {}, position: {}, width: {}, height: {} } }, ltc_1: { value: null }, ltc_2: { value: null } }, points: { diffuse: { value: new V(16777215) }, opacity: { value: 1 }, size: { value: 1 }, scale: { value: 1 }, map: { value: null }, alphaMap: { value: null }, alphaMapTransform: { value: new te() }, alphaTest: { value: 0 }, uvTransform: { value: new te() } }, sprite: { diffuse: { value: new V(16777215) }, opacity: { value: 1 }, center: { value: new I(0.5, 0.5) }, rotation: { value: 0 }, map: { value: null }, mapTransform: { value: new te() }, alphaMap: { value: null }, alphaMapTransform: { value: new te() }, alphaTest: { value: 0 } } };
var Mt2 = { basic: { uniforms: Zu([ae2.common, ae2.specularmap, ae2.envmap, ae2.aomap, ae2.lightmap, ae2.fog]), vertexShader: Pe2.meshbasic_vert, fragmentShader: Pe2.meshbasic_frag }, lambert: { uniforms: Zu([ae2.common, ae2.specularmap, ae2.envmap, ae2.aomap, ae2.lightmap, ae2.emissivemap, ae2.bumpmap, ae2.normalmap, ae2.displacementmap, ae2.fog, ae2.lights, { emissive: { value: new V(0) } }]), vertexShader: Pe2.meshlambert_vert, fragmentShader: Pe2.meshlambert_frag }, phong: { uniforms: Zu([ae2.common, ae2.specularmap, ae2.envmap, ae2.aomap, ae2.lightmap, ae2.emissivemap, ae2.bumpmap, ae2.normalmap, ae2.displacementmap, ae2.fog, ae2.lights, { emissive: { value: new V(0) }, specular: { value: new V(1118481) }, shininess: { value: 30 } }]), vertexShader: Pe2.meshphong_vert, fragmentShader: Pe2.meshphong_frag }, standard: { uniforms: Zu([ae2.common, ae2.envmap, ae2.aomap, ae2.lightmap, ae2.emissivemap, ae2.bumpmap, ae2.normalmap, ae2.displacementmap, ae2.roughnessmap, ae2.metalnessmap, ae2.fog, ae2.lights, { emissive: { value: new V(0) }, roughness: { value: 1 }, metalness: { value: 0 }, envMapIntensity: { value: 1 } }]), vertexShader: Pe2.meshphysical_vert, fragmentShader: Pe2.meshphysical_frag }, toon: { uniforms: Zu([ae2.common, ae2.aomap, ae2.lightmap, ae2.emissivemap, ae2.bumpmap, ae2.normalmap, ae2.displacementmap, ae2.gradientmap, ae2.fog, ae2.lights, { emissive: { value: new V(0) } }]), vertexShader: Pe2.meshtoon_vert, fragmentShader: Pe2.meshtoon_frag }, matcap: { uniforms: Zu([ae2.common, ae2.bumpmap, ae2.normalmap, ae2.displacementmap, ae2.fog, { matcap: { value: null } }]), vertexShader: Pe2.meshmatcap_vert, fragmentShader: Pe2.meshmatcap_frag }, points: { uniforms: Zu([ae2.points, ae2.fog]), vertexShader: Pe2.points_vert, fragmentShader: Pe2.points_frag }, dashed: { uniforms: Zu([ae2.common, ae2.fog, { scale: { value: 1 }, dashSize: { value: 1 }, totalSize: { value: 2 } }]), vertexShader: Pe2.linedashed_vert, fragmentShader: Pe2.linedashed_frag }, depth: { uniforms: Zu([ae2.common, ae2.displacementmap]), vertexShader: Pe2.depth_vert, fragmentShader: Pe2.depth_frag }, normal: { uniforms: Zu([ae2.common, ae2.bumpmap, ae2.normalmap, ae2.displacementmap, { opacity: { value: 1 } }]), vertexShader: Pe2.meshnormal_vert, fragmentShader: Pe2.meshnormal_frag }, sprite: { uniforms: Zu([ae2.sprite, ae2.fog]), vertexShader: Pe2.sprite_vert, fragmentShader: Pe2.sprite_frag }, background: { uniforms: { uvTransform: { value: new te() }, t2D: { value: null }, backgroundIntensity: { value: 1 } }, vertexShader: Pe2.background_vert, fragmentShader: Pe2.background_frag }, backgroundCube: { uniforms: { envMap: { value: null }, flipEnvMap: { value: -1 }, backgroundBlurriness: { value: 0 }, backgroundIntensity: { value: 1 }, backgroundRotation: { value: new te() } }, vertexShader: Pe2.backgroundCube_vert, fragmentShader: Pe2.backgroundCube_frag }, cube: { uniforms: { tCube: { value: null }, tFlip: { value: -1 }, opacity: { value: 1 } }, vertexShader: Pe2.cube_vert, fragmentShader: Pe2.cube_frag }, equirect: { uniforms: { tEquirect: { value: null } }, vertexShader: Pe2.equirect_vert, fragmentShader: Pe2.equirect_frag }, distance: { uniforms: Zu([ae2.common, ae2.displacementmap, { referencePosition: { value: new w() }, nearDistance: { value: 1 }, farDistance: { value: 1e3 } }]), vertexShader: Pe2.distance_vert, fragmentShader: Pe2.distance_frag }, shadow: { uniforms: Zu([ae2.lights, ae2.fog, { color: { value: new V(0) }, opacity: { value: 1 } }]), vertexShader: Pe2.shadow_vert, fragmentShader: Pe2.shadow_frag } };
Mt2.physical = { uniforms: Zu([Mt2.standard.uniforms, { clearcoat: { value: 0 }, clearcoatMap: { value: null }, clearcoatMapTransform: { value: new te() }, clearcoatNormalMap: { value: null }, clearcoatNormalMapTransform: { value: new te() }, clearcoatNormalScale: { value: new I(1, 1) }, clearcoatRoughness: { value: 0 }, clearcoatRoughnessMap: { value: null }, clearcoatRoughnessMapTransform: { value: new te() }, dispersion: { value: 0 }, iridescence: { value: 0 }, iridescenceMap: { value: null }, iridescenceMapTransform: { value: new te() }, iridescenceIOR: { value: 1.3 }, iridescenceThicknessMinimum: { value: 100 }, iridescenceThicknessMaximum: { value: 400 }, iridescenceThicknessMap: { value: null }, iridescenceThicknessMapTransform: { value: new te() }, sheen: { value: 0 }, sheenColor: { value: new V(0) }, sheenColorMap: { value: null }, sheenColorMapTransform: { value: new te() }, sheenRoughness: { value: 1 }, sheenRoughnessMap: { value: null }, sheenRoughnessMapTransform: { value: new te() }, transmission: { value: 0 }, transmissionMap: { value: null }, transmissionMapTransform: { value: new te() }, transmissionSamplerSize: { value: new I() }, transmissionSamplerMap: { value: null }, thickness: { value: 0 }, thicknessMap: { value: null }, thicknessMapTransform: { value: new te() }, attenuationDistance: { value: 0 }, attenuationColor: { value: new V(0) }, specularColor: { value: new V(1, 1, 1) }, specularColorMap: { value: null }, specularColorMapTransform: { value: new te() }, specularIntensity: { value: 1 }, specularIntensityMap: { value: null }, specularIntensityMapTransform: { value: new te() }, anisotropyVector: { value: new I() }, anisotropyMap: { value: null }, anisotropyMapTransform: { value: new te() } }]), vertexShader: Pe2.meshphysical_vert, fragmentShader: Pe2.meshphysical_frag };
var un2 = { r: 0, b: 0, g: 0 };
var Ot = new ee();
var ac2 = new U();
function oc2(e, n, t, i, l, a, h36) {
  let d = new V(0), b = a === true ? 0 : 1, x, w2, g2 = null, S = 0, R = null;
  function O(M) {
    let A = M.isScene === true ? M.background : null;
    return A && A.isTexture && (A = (M.backgroundBlurriness > 0 ? t : n).get(A)), A;
  }
  function U2(M) {
    let A = false, C = O(M);
    C === null ? o(d, b) : C && C.isColor && (o(C, 1), A = true);
    let T = e.xr.getEnvironmentBlendMode();
    T === "additive" ? i.buffers.color.setClear(0, 0, 0, 1, h36) : T === "alpha-blend" && i.buffers.color.setClear(0, 0, 0, 0, h36), (e.autoClear || A) && (i.buffers.depth.setTest(true), i.buffers.depth.setMask(true), i.buffers.color.setMask(true), e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil));
  }
  function f(M, A) {
    let C = O(A);
    C && (C.isCubeTexture || C.mapping === cc) ? (w2 === void 0 && (w2 = new Pt(new cn(1, 1, 1), new es({ name: "BackgroundCubeMaterial", uniforms: Nn(Mt2.backgroundCube.uniforms), vertexShader: Mt2.backgroundCube.vertexShader, fragmentShader: Mt2.backgroundCube.fragmentShader, side: Ll, depthTest: false, depthWrite: false, fog: false, allowOverride: false })), w2.geometry.deleteAttribute("normal"), w2.geometry.deleteAttribute("uv"), w2.onBeforeRender = function(T, N3, q3) {
      this.matrixWorld.copyPosition(q3.matrixWorld);
    }, Object.defineProperty(w2.material, "envMap", { get: function() {
      return this.uniforms.envMap.value;
    } }), l.update(w2)), Ot.copy(A.backgroundRotation), Ot.x *= -1, Ot.y *= -1, Ot.z *= -1, C.isCubeTexture && C.isRenderTargetTexture === false && (Ot.y *= -1, Ot.z *= -1), w2.material.uniforms.envMap.value = C, w2.material.uniforms.flipEnvMap.value = C.isCubeTexture && C.isRenderTargetTexture === false ? -1 : 1, w2.material.uniforms.backgroundBlurriness.value = A.backgroundBlurriness, w2.material.uniforms.backgroundIntensity.value = A.backgroundIntensity, w2.material.uniforms.backgroundRotation.value.setFromMatrix4(ac2.makeRotationFromEuler(Ot)), w2.material.toneMapped = Ft.getTransfer(C.colorSpace) !== Dn, (g2 !== C || S !== C.version || R !== e.toneMapping) && (w2.material.needsUpdate = true, g2 = C, S = C.version, R = e.toneMapping), w2.layers.enableAll(), M.unshift(w2, w2.geometry, w2.material, 0, 0, null)) : C && C.isTexture && (x === void 0 && (x = new Pt(new co(2, 2), new es({ name: "BackgroundMaterial", uniforms: Nn(Mt2.background.uniforms), vertexShader: Mt2.background.vertexShader, fragmentShader: Mt2.background.fragmentShader, side: vr, depthTest: false, depthWrite: false, fog: false, allowOverride: false })), x.geometry.deleteAttribute("normal"), Object.defineProperty(x.material, "map", { get: function() {
      return this.uniforms.t2D.value;
    } }), l.update(x)), x.material.uniforms.t2D.value = C, x.material.uniforms.backgroundIntensity.value = A.backgroundIntensity, x.material.toneMapped = Ft.getTransfer(C.colorSpace) !== Dn, C.matrixAutoUpdate === true && C.updateMatrix(), x.material.uniforms.uvTransform.value.copy(C.matrix), (g2 !== C || S !== C.version || R !== e.toneMapping) && (x.material.needsUpdate = true, g2 = C, S = C.version, R = e.toneMapping), x.layers.enableAll(), M.unshift(x, x.geometry, x.material, 0, 0, null));
  }
  function o(M, A) {
    M.getRGB(un2, cm(e)), i.buffers.color.setClear(un2.r, un2.g, un2.b, A, h36);
  }
  function P() {
    w2 !== void 0 && (w2.geometry.dispose(), w2.material.dispose(), w2 = void 0), x !== void 0 && (x.geometry.dispose(), x.material.dispose(), x = void 0);
  }
  return { getClearColor: function() {
    return d;
  }, setClearColor: function(M, A = 1) {
    d.set(M), b = A, o(d, b);
  }, getClearAlpha: function() {
    return b;
  }, setClearAlpha: function(M) {
    b = M, o(d, b);
  }, render: U2, addToRenderList: f, dispose: P };
}
function sc(e, n) {
  let t = e.getParameter(e.MAX_VERTEX_ATTRIBS), i = {}, l = S(null), a = l, h36 = false;
  function d(p, L3, k, G2, z2) {
    let K = false, B2 = g2(G2, k, L3);
    a !== B2 && (a = B2, x(a.object)), K = R(p, G2, k, z2), K && O(p, G2, k, z2), z2 !== null && n.update(z2, e.ELEMENT_ARRAY_BUFFER), (K || h36) && (h36 = false, A(p, L3, k, G2), z2 !== null && e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, n.get(z2).buffer));
  }
  function b() {
    return e.createVertexArray();
  }
  function x(p) {
    return e.bindVertexArray(p);
  }
  function w2(p) {
    return e.deleteVertexArray(p);
  }
  function g2(p, L3, k) {
    let G2 = k.wireframe === true, z2 = i[p.id];
    z2 === void 0 && (z2 = {}, i[p.id] = z2);
    let K = z2[L3.id];
    K === void 0 && (K = {}, z2[L3.id] = K);
    let B2 = K[G2];
    return B2 === void 0 && (B2 = S(b()), K[G2] = B2), B2;
  }
  function S(p) {
    let L3 = [], k = [], G2 = [];
    for (let z2 = 0; z2 < t; z2++)
      L3[z2] = 0, k[z2] = 0, G2[z2] = 0;
    return { geometry: null, program: null, wireframe: false, newAttributes: L3, enabledAttributes: k, attributeDivisors: G2, object: p, attributes: {}, index: null };
  }
  function R(p, L3, k, G2) {
    let z2 = a.attributes, K = L3.attributes, B2 = 0, V2 = k.getAttributes();
    for (let J in V2)
      if (V2[J].location >= 0) {
        let ge3 = z2[J], Ee3 = K[J];
        if (Ee3 === void 0 && (J === "instanceMatrix" && p.instanceMatrix && (Ee3 = p.instanceMatrix), J === "instanceColor" && p.instanceColor && (Ee3 = p.instanceColor)), ge3 === void 0 || ge3.attribute !== Ee3 || Ee3 && ge3.data !== Ee3.data)
          return true;
        B2++;
      }
    return a.attributesNum !== B2 || a.index !== G2;
  }
  function O(p, L3, k, G2) {
    let z2 = {}, K = L3.attributes, B2 = 0, V2 = k.getAttributes();
    for (let J in V2)
      if (V2[J].location >= 0) {
        let ge3 = K[J];
        ge3 === void 0 && (J === "instanceMatrix" && p.instanceMatrix && (ge3 = p.instanceMatrix), J === "instanceColor" && p.instanceColor && (ge3 = p.instanceColor));
        let Ee3 = {};
        Ee3.attribute = ge3, ge3 && ge3.data && (Ee3.data = ge3.data), z2[J] = Ee3, B2++;
      }
    a.attributes = z2, a.attributesNum = B2, a.index = G2;
  }
  function U2() {
    let p = a.newAttributes;
    for (let L3 = 0, k = p.length; L3 < k; L3++)
      p[L3] = 0;
  }
  function f(p) {
    o(p, 0);
  }
  function o(p, L3) {
    let k = a.newAttributes, G2 = a.enabledAttributes, z2 = a.attributeDivisors;
    k[p] = 1, G2[p] === 0 && (e.enableVertexAttribArray(p), G2[p] = 1), z2[p] !== L3 && (e.vertexAttribDivisor(p, L3), z2[p] = L3);
  }
  function P() {
    let p = a.newAttributes, L3 = a.enabledAttributes;
    for (let k = 0, G2 = L3.length; k < G2; k++)
      L3[k] !== p[k] && (e.disableVertexAttribArray(k), L3[k] = 0);
  }
  function M(p, L3, k, G2, z2, K, B2) {
    B2 === true ? e.vertexAttribIPointer(p, L3, k, z2, K) : e.vertexAttribPointer(p, L3, k, G2, z2, K);
  }
  function A(p, L3, k, G2) {
    U2();
    let z2 = G2.attributes, K = k.getAttributes(), B2 = L3.defaultAttributeValues;
    for (let V2 in K) {
      let J = K[V2];
      if (J.location >= 0) {
        let xe3 = z2[V2];
        if (xe3 === void 0 && (V2 === "instanceMatrix" && p.instanceMatrix && (xe3 = p.instanceMatrix), V2 === "instanceColor" && p.instanceColor && (xe3 = p.instanceColor)), xe3 !== void 0) {
          let ge3 = xe3.normalized, Ee3 = xe3.itemSize, Oe3 = n.get(xe3);
          if (Oe3 === void 0)
            continue;
          let we3 = Oe3.buffer, nt = Oe3.type, je2 = Oe3.bytesPerElement, W3 = nt === e.INT || nt === e.UNSIGNED_INT || xe3.gpuType === gc;
          if (xe3.isInterleavedBufferAttribute) {
            let $ = xe3.data, fe3 = $.stride, Ce3 = xe3.offset;
            if ($.isInstancedInterleavedBuffer) {
              for (let pe3 = 0; pe3 < J.locationSize; pe3++)
                o(J.location + pe3, $.meshPerAttribute);
              p.isInstancedMesh !== true && G2._maxInstanceCount === void 0 && (G2._maxInstanceCount = $.meshPerAttribute * $.count);
            } else
              for (let pe3 = 0; pe3 < J.locationSize; pe3++)
                f(J.location + pe3);
            e.bindBuffer(e.ARRAY_BUFFER, we3);
            for (let pe3 = 0; pe3 < J.locationSize; pe3++)
              M(J.location + pe3, Ee3 / J.locationSize, nt, ge3, fe3 * je2, (Ce3 + Ee3 / J.locationSize * pe3) * je2, W3);
          } else {
            if (xe3.isInstancedBufferAttribute) {
              for (let $ = 0; $ < J.locationSize; $++)
                o(J.location + $, xe3.meshPerAttribute);
              p.isInstancedMesh !== true && G2._maxInstanceCount === void 0 && (G2._maxInstanceCount = xe3.meshPerAttribute * xe3.count);
            } else
              for (let $ = 0; $ < J.locationSize; $++)
                f(J.location + $);
            e.bindBuffer(e.ARRAY_BUFFER, we3);
            for (let $ = 0; $ < J.locationSize; $++)
              M(J.location + $, Ee3 / J.locationSize, nt, ge3, Ee3 * je2, Ee3 / J.locationSize * $ * je2, W3);
          }
        } else if (B2 !== void 0) {
          let ge3 = B2[V2];
          if (ge3 !== void 0)
            switch (ge3.length) {
              case 2:
                e.vertexAttrib2fv(J.location, ge3);
                break;
              case 3:
                e.vertexAttrib3fv(J.location, ge3);
                break;
              case 4:
                e.vertexAttrib4fv(J.location, ge3);
                break;
              default:
                e.vertexAttrib1fv(J.location, ge3);
            }
        }
      }
    }
    P();
  }
  function C() {
    q3();
    for (let p in i) {
      let L3 = i[p];
      for (let k in L3) {
        let G2 = L3[k];
        for (let z2 in G2)
          w2(G2[z2].object), delete G2[z2];
        delete L3[k];
      }
      delete i[p];
    }
  }
  function T(p) {
    if (i[p.id] === void 0)
      return;
    let L3 = i[p.id];
    for (let k in L3) {
      let G2 = L3[k];
      for (let z2 in G2)
        w2(G2[z2].object), delete G2[z2];
      delete L3[k];
    }
    delete i[p.id];
  }
  function N3(p) {
    for (let L3 in i) {
      let k = i[L3];
      if (k[p.id] === void 0)
        continue;
      let G2 = k[p.id];
      for (let z2 in G2)
        w2(G2[z2].object), delete G2[z2];
      delete k[p.id];
    }
  }
  function q3() {
    c(), h36 = true, a !== l && (a = l, x(a.object));
  }
  function c() {
    l.geometry = null, l.program = null, l.wireframe = false;
  }
  return { setup: d, reset: q3, resetDefaultState: c, dispose: C, releaseStatesOfGeometry: T, releaseStatesOfProgram: N3, initAttributes: U2, enableAttribute: f, disableUnusedAttributes: P };
}
function lc2(e, n, t) {
  let i;
  function l(x) {
    i = x;
  }
  function a(x, w2) {
    e.drawArrays(i, x, w2), t.update(w2, i, 1);
  }
  function h36(x, w2, g2) {
    g2 !== 0 && (e.drawArraysInstanced(i, x, w2, g2), t.update(w2, i, g2));
  }
  function d(x, w2, g2) {
    if (g2 === 0)
      return;
    n.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i, x, 0, w2, 0, g2);
    let R = 0;
    for (let O = 0; O < g2; O++)
      R += w2[O];
    t.update(R, i, 1);
  }
  function b(x, w2, g2, S) {
    if (g2 === 0)
      return;
    let R = n.get("WEBGL_multi_draw");
    if (R === null)
      for (let O = 0; O < x.length; O++)
        h36(x[O], w2[O], S[O]);
    else {
      R.multiDrawArraysInstancedWEBGL(i, x, 0, w2, 0, S, 0, g2);
      let O = 0;
      for (let U2 = 0; U2 < g2; U2++)
        O += w2[U2] * S[U2];
      t.update(O, i, 1);
    }
  }
  this.setMode = l, this.render = a, this.renderInstances = h36, this.renderMultiDraw = d, this.renderMultiDrawInstances = b;
}
function cc2(e, n, t, i) {
  let l;
  function a() {
    if (l !== void 0)
      return l;
    if (n.has("EXT_texture_filter_anisotropic") === true) {
      let N3 = n.get("EXT_texture_filter_anisotropic");
      l = e.getParameter(N3.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      l = 0;
    return l;
  }
  function h36(N3) {
    return !(N3 !== ji && i.convert(N3) !== e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function d(N3) {
    let q3 = N3 === xc && (n.has("EXT_color_buffer_half_float") || n.has("EXT_color_buffer_float"));
    return !(N3 !== ia && i.convert(N3) !== e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE) && N3 !== Si && !q3);
  }
  function b(N3) {
    if (N3 === "highp") {
      if (e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).precision > 0)
        return "highp";
      N3 = "mediump";
    }
    return N3 === "mediump" && e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let x = t.precision !== void 0 ? t.precision : "highp", w2 = b(x);
  w2 !== x && (E("WebGLRenderer:", x, "not supported, using", w2, "instead."), x = w2);
  let g2 = t.logarithmicDepthBuffer === true, S = t.reversedDepthBuffer === true && n.has("EXT_clip_control"), R = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS), O = e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS), U2 = e.getParameter(e.MAX_TEXTURE_SIZE), f = e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE), o = e.getParameter(e.MAX_VERTEX_ATTRIBS), P = e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS), M = e.getParameter(e.MAX_VARYING_VECTORS), A = e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS), C = e.getParameter(e.MAX_SAMPLES), T = e.getParameter(e.SAMPLES);
  return { isWebGL2: true, getMaxAnisotropy: a, getMaxPrecision: b, textureFormatReadable: h36, textureTypeReadable: d, precision: x, logarithmicDepthBuffer: g2, reversedDepthBuffer: S, maxTextures: R, maxVertexTextures: O, maxTextureSize: U2, maxCubemapSize: f, maxAttributes: o, maxVertexUniforms: P, maxVaryings: M, maxFragmentUniforms: A, maxSamples: C, samples: T };
}
function fc2(e) {
  let n = this, t = null, i = 0, l = false, a = false, h36 = new Te(), d = new te(), b = { value: null, needsUpdate: false };
  this.uniform = b, this.numPlanes = 0, this.numIntersection = 0, this.init = function(g2, S) {
    let R = g2.length !== 0 || S || i !== 0 || l;
    return l = S, i = g2.length, R;
  }, this.beginShadows = function() {
    a = true, w2(null);
  }, this.endShadows = function() {
    a = false;
  }, this.setGlobalState = function(g2, S) {
    t = w2(g2, S, 0);
  }, this.setState = function(g2, S, R) {
    let O = g2.clippingPlanes, U2 = g2.clipIntersection, f = g2.clipShadows, o = e.get(g2);
    if (!l || O === null || O.length === 0 || a && !f)
      a ? w2(null) : x();
    else {
      let P = a ? 0 : i, M = P * 4, A = o.clippingState || null;
      b.value = A, A = w2(O, S, M, R);
      for (let C = 0; C !== M; ++C)
        A[C] = t[C];
      o.clippingState = A, this.numIntersection = U2 ? this.numPlanes : 0, this.numPlanes += P;
    }
  };
  function x() {
    b.value !== t && (b.value = t, b.needsUpdate = i > 0), n.numPlanes = i, n.numIntersection = 0;
  }
  function w2(g2, S, R, O) {
    let U2 = g2 !== null ? g2.length : 0, f = null;
    if (U2 !== 0) {
      if (f = b.value, O !== true || f === null) {
        let o = R + U2 * 4, P = S.matrixWorldInverse;
        d.getNormalMatrix(P), (f === null || f.length < o) && (f = new Float32Array(o));
        for (let M = 0, A = R; M !== U2; ++M, A += 4)
          h36.copy(g2[M]).applyMatrix4(P, d), h36.normal.toArray(f, A), f[A + 3] = h36.constant;
      }
      b.value = f, b.needsUpdate = true;
    }
    return n.numPlanes = U2, n.numIntersection = 0, f;
  }
}
function dc2(e) {
  let n = /* @__PURE__ */ new WeakMap();
  function t(h36, d) {
    return d === hc ? h36.mapping = Rn : d === lc && (h36.mapping = ac), h36;
  }
  function i(h36) {
    if (h36 && h36.isTexture) {
      let d = h36.mapping;
      if (d === hc || d === lc)
        if (n.has(h36)) {
          let b = n.get(h36).texture;
          return t(b, h36.mapping);
        } else {
          let b = h36.image;
          if (b && b.height > 0) {
            let x = new Ka(b.height);
            return x.fromEquirectangularTexture(e, h36), n.set(h36, x), h36.addEventListener("dispose", l), t(x.texture, h36.mapping);
          } else
            return null;
        }
    }
    return h36;
  }
  function l(h36) {
    let d = h36.target;
    d.removeEventListener("dispose", l);
    let b = n.get(d);
    b !== void 0 && (n.delete(d), b.dispose());
  }
  function a() {
    n = /* @__PURE__ */ new WeakMap();
  }
  return { get: i, dispose: a };
}
var Dt2 = 4;
var or2 = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582];
var Gt2 = 20;
var uc2 = 256;
var jt2 = new Fn();
var sr2 = new V();
var Fn2 = null;
var On2 = 0;
var Bn2 = 0;
var Gn2 = false;
var pc2 = new w();
var xn2 = class {
  constructor(n) {
    this._renderer = n, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._sizeLods = [], this._sigmas = [], this._lodMeshes = [], this._backgroundBox = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._blurMaterial = null, this._ggxMaterial = null;
  }
  fromScene(n, t = 0, i = 0.1, l = 100, a = {}) {
    let { size: h36 = 256, position: d = pc2 } = a;
    Fn2 = this._renderer.getRenderTarget(), On2 = this._renderer.getActiveCubeFace(), Bn2 = this._renderer.getActiveMipmapLevel(), Gn2 = this._renderer.xr.enabled, this._renderer.xr.enabled = false, this._setSize(h36);
    let b = this._allocateTargets();
    return b.depthBuffer = true, this._sceneToCubeUV(n, i, l, b, d), t > 0 && this._blur(b, 0, 0, t), this._applyPMREM(b), this._cleanup(b), b;
  }
  fromEquirectangular(n, t = null) {
    return this._fromTexture(n, t);
  }
  fromCubemap(n, t = null) {
    return this._fromTexture(n, t);
  }
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = fr2(), this._compileMaterial(this._cubemapMaterial));
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = cr(), this._compileMaterial(this._equirectMaterial));
  }
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose(), this._backgroundBox !== null && (this._backgroundBox.geometry.dispose(), this._backgroundBox.material.dispose());
  }
  _setSize(n) {
    this._lodMax = Math.floor(Math.log2(n)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._ggxMaterial !== null && this._ggxMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let n = 0; n < this._lodMeshes.length; n++)
      this._lodMeshes[n].geometry.dispose();
  }
  _cleanup(n) {
    this._renderer.setRenderTarget(Fn2, On2, Bn2), this._renderer.xr.enabled = Gn2, n.scissorTest = false, Wt(n, 0, 0, n.width, n.height);
  }
  _fromTexture(n, t) {
    n.mapping === Rn || n.mapping === ac ? this._setSize(n.image.length === 0 ? 16 : n.image[0].width || n.image[0].image.width) : this._setSize(n.image.width / 4), Fn2 = this._renderer.getRenderTarget(), On2 = this._renderer.getActiveCubeFace(), Bn2 = this._renderer.getActiveMipmapLevel(), Gn2 = this._renderer.xr.enabled, this._renderer.xr.enabled = false;
    let i = t || this._allocateTargets();
    return this._textureToCubeUV(n, i), this._applyPMREM(i), this._cleanup(i), i;
  }
  _allocateTargets() {
    let n = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, i = { magFilter: Vt, minFilter: Vt, generateMipmaps: false, type: xc, format: ji, colorSpace: Ma, depthBuffer: false }, l = lr2(n, t, i);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== n || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = lr2(n, t, i);
      let { _lodMax: a } = this;
      ({ lodMeshes: this._lodMeshes, sizeLods: this._sizeLods, sigmas: this._sigmas } = hc2(a)), this._blurMaterial = _c2(a, n, t), this._ggxMaterial = mc2(a, n, t);
    }
    return l;
  }
  _compileMaterial(n) {
    let t = new Pt(new q(), n);
    this._renderer.compile(t, jt2);
  }
  _sceneToCubeUV(n, t, i, l, a) {
    let b = new At(90, 1, t, i), x = [1, -1, 1, 1, 1, 1], w2 = [1, 1, 1, -1, -1, -1], g2 = this._renderer, S = g2.autoClear, R = g2.toneMapping;
    g2.getClearColor(sr2), g2.toneMapping = Kp, g2.autoClear = false, g2.state.buffers.depth.getReversed() && (g2.setRenderTarget(l), g2.clearDepth(), g2.setRenderTarget(null)), this._backgroundBox === null && (this._backgroundBox = new Pt(new cn(), new ze({ name: "PMREM.Background", side: Ll, depthWrite: false, depthTest: false })));
    let U2 = this._backgroundBox, f = U2.material, o = false, P = n.background;
    P ? P.isColor && (f.color.copy(P), n.background = null, o = true) : (f.color.copy(sr2), o = true);
    for (let M = 0; M < 6; M++) {
      let A = M % 3;
      A === 0 ? (b.up.set(0, x[M], 0), b.position.set(a.x, a.y, a.z), b.lookAt(a.x + w2[M], a.y, a.z)) : A === 1 ? (b.up.set(0, 0, x[M]), b.position.set(a.x, a.y, a.z), b.lookAt(a.x, a.y + w2[M], a.z)) : (b.up.set(0, x[M], 0), b.position.set(a.x, a.y, a.z), b.lookAt(a.x, a.y, a.z + w2[M]));
      let C = this._cubeSize;
      Wt(l, A * C, M > 2 ? C : 0, C, C), g2.setRenderTarget(l), o && g2.render(U2, b), g2.render(n, b);
    }
    g2.toneMapping = R, g2.autoClear = S, n.background = P;
  }
  _textureToCubeUV(n, t) {
    let i = this._renderer, l = n.mapping === Rn || n.mapping === ac;
    l ? (this._cubemapMaterial === null && (this._cubemapMaterial = fr2()), this._cubemapMaterial.uniforms.flipEnvMap.value = n.isRenderTargetTexture === false ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = cr());
    let a = l ? this._cubemapMaterial : this._equirectMaterial, h36 = this._lodMeshes[0];
    h36.material = a;
    let d = a.uniforms;
    d.envMap.value = n;
    let b = this._cubeSize;
    Wt(t, 0, 0, 3 * b, 2 * b), i.setRenderTarget(t), i.render(h36, jt2);
  }
  _applyPMREM(n) {
    let t = this._renderer, i = t.autoClear;
    t.autoClear = false;
    let l = this._lodMeshes.length;
    for (let a = 1; a < l; a++)
      this._applyGGXFilter(n, a - 1, a);
    t.autoClear = i;
  }
  _applyGGXFilter(n, t, i) {
    let l = this._renderer, a = this._pingPongRenderTarget, h36 = this._ggxMaterial, d = this._lodMeshes[i];
    d.material = h36;
    let b = h36.uniforms, x = i / (this._lodMeshes.length - 1), w2 = t / (this._lodMeshes.length - 1), g2 = Math.sqrt(x * x - w2 * w2), S = 0 + x * 1.25, R = g2 * S, { _lodMax: O } = this, U2 = this._sizeLods[i], f = 3 * U2 * (i > O - Dt2 ? i - O + Dt2 : 0), o = 4 * (this._cubeSize - U2);
    b.envMap.value = n.texture, b.roughness.value = R, b.mipInt.value = O - t, Wt(a, f, o, 3 * U2, 2 * U2), l.setRenderTarget(a), l.render(d, jt2), b.envMap.value = a.texture, b.roughness.value = 0, b.mipInt.value = O - i, Wt(n, f, o, 3 * U2, 2 * U2), l.setRenderTarget(n), l.render(d, jt2);
  }
  _blur(n, t, i, l, a) {
    let h36 = this._pingPongRenderTarget;
    this._halfBlur(n, h36, t, i, l, "latitudinal", a), this._halfBlur(h36, n, i, i, l, "longitudinal", a);
  }
  _halfBlur(n, t, i, l, a, h36, d) {
    let b = this._renderer, x = this._blurMaterial;
    h36 !== "latitudinal" && h36 !== "longitudinal" && X("blur direction must be either latitudinal or longitudinal!");
    let w2 = 3, g2 = this._lodMeshes[l];
    g2.material = x;
    let S = x.uniforms, R = this._sizeLods[i] - 1, O = isFinite(a) ? Math.PI / (2 * R) : 2 * Math.PI / (2 * Gt2 - 1), U2 = a / O, f = isFinite(a) ? 1 + Math.floor(w2 * U2) : Gt2;
    f > Gt2 && E(`sigmaRadians, ${a}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${Gt2}`);
    let o = [], P = 0;
    for (let N3 = 0; N3 < Gt2; ++N3) {
      let q3 = N3 / U2, c = Math.exp(-q3 * q3 / 2);
      o.push(c), N3 === 0 ? P += c : N3 < f && (P += 2 * c);
    }
    for (let N3 = 0; N3 < o.length; N3++)
      o[N3] = o[N3] / P;
    S.envMap.value = n.texture, S.samples.value = f, S.weights.value = o, S.latitudinal.value = h36 === "latitudinal", d && (S.poleAxis.value = d);
    let { _lodMax: M } = this;
    S.dTheta.value = O, S.mipInt.value = M - i;
    let A = this._sizeLods[l], C = 3 * A * (l > M - Dt2 ? l - M + Dt2 : 0), T = 4 * (this._cubeSize - A);
    Wt(t, C, T, 3 * A, 2 * A), b.setRenderTarget(t), b.render(g2, jt2);
  }
};
function hc2(e) {
  let n = [], t = [], i = [], l = e, a = e - Dt2 + 1 + or2.length;
  for (let h36 = 0; h36 < a; h36++) {
    let d = Math.pow(2, l);
    n.push(d);
    let b = 1 / d;
    h36 > e - Dt2 ? b = or2[h36 - e + Dt2 - 1] : h36 === 0 && (b = 0), t.push(b);
    let x = 1 / (d - 2), w2 = -x, g2 = 1 + x, S = [w2, w2, g2, w2, g2, g2, w2, w2, g2, g2, w2, g2], R = 6, O = 6, U2 = 3, f = 2, o = 1, P = new Float32Array(U2 * O * R), M = new Float32Array(f * O * R), A = new Float32Array(o * O * R);
    for (let T = 0; T < R; T++) {
      let N3 = T % 3 * 2 / 3 - 1, q3 = T > 2 ? 0 : -1, c = [N3, q3, 0, N3 + 2 / 3, q3, 0, N3 + 2 / 3, q3 + 1, 0, N3, q3, 0, N3 + 2 / 3, q3 + 1, 0, N3, q3 + 1, 0];
      P.set(c, U2 * O * T), M.set(S, f * O * T);
      let p = [T, T, T, T, T, T];
      A.set(p, o * O * T);
    }
    let C = new q();
    C.setAttribute("position", new j(P, U2)), C.setAttribute("uv", new j(M, f)), C.setAttribute("faceIndex", new j(A, o)), i.push(new Pt(C, null)), l > Dt2 && l--;
  }
  return { lodMeshes: i, sizeLods: n, sigmas: t };
}
function lr2(e, n, t) {
  let i = new ts(e, n, t);
  return i.texture.mapping = cc, i.texture.name = "PMREM.cubeUv", i.scissorTest = true, i;
}
function Wt(e, n, t, i, l) {
  e.viewport.set(n, t, i, l), e.scissor.set(n, t, i, l);
}
function mc2(e, n, t) {
  return new es({ name: "PMREMGGXConvolution", defines: { GGX_SAMPLES: uc2, CUBEUV_TEXEL_WIDTH: 1 / n, CUBEUV_TEXEL_HEIGHT: 1 / t, CUBEUV_MAX_MIP: `${e}.0` }, uniforms: { envMap: { value: null }, roughness: { value: 0 }, mipInt: { value: 0 } }, vertexShader: Rn2(), fragmentShader: `

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`, blending: rc, depthTest: false, depthWrite: false });
}
function _c2(e, n, t) {
  let i = new Float32Array(Gt2), l = new w(0, 1, 0);
  return new es({ name: "SphericalGaussianBlur", defines: { n: Gt2, CUBEUV_TEXEL_WIDTH: 1 / n, CUBEUV_TEXEL_HEIGHT: 1 / t, CUBEUV_MAX_MIP: `${e}.0` }, uniforms: { envMap: { value: null }, samples: { value: 1 }, weights: { value: i }, latitudinal: { value: false }, dTheta: { value: 0 }, mipInt: { value: 0 }, poleAxis: { value: l } }, vertexShader: Rn2(), fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`, blending: rc, depthTest: false, depthWrite: false });
}
function cr() {
  return new es({ name: "EquirectangularToCubeUV", uniforms: { envMap: { value: null } }, vertexShader: Rn2(), fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`, blending: rc, depthTest: false, depthWrite: false });
}
function fr2() {
  return new es({ name: "CubemapToCubeUV", uniforms: { envMap: { value: null }, flipEnvMap: { value: -1 } }, vertexShader: Rn2(), fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`, blending: rc, depthTest: false, depthWrite: false });
}
function Rn2() {
  return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
}
function gc2(e) {
  let n = /* @__PURE__ */ new WeakMap(), t = null;
  function i(d) {
    if (d && d.isTexture) {
      let b = d.mapping, x = b === hc || b === lc, w2 = b === Rn || b === ac;
      if (x || w2) {
        let g2 = n.get(d), S = g2 !== void 0 ? g2.texture.pmremVersion : 0;
        if (d.isRenderTargetTexture && d.pmremVersion !== S)
          return t === null && (t = new xn2(e)), g2 = x ? t.fromEquirectangular(d, g2) : t.fromCubemap(d, g2), g2.texture.pmremVersion = d.pmremVersion, n.set(d, g2), g2.texture;
        if (g2 !== void 0)
          return g2.texture;
        {
          let R = d.image;
          return x && R && R.height > 0 || w2 && R && l(R) ? (t === null && (t = new xn2(e)), g2 = x ? t.fromEquirectangular(d) : t.fromCubemap(d), g2.texture.pmremVersion = d.pmremVersion, n.set(d, g2), d.addEventListener("dispose", a), g2.texture) : null;
        }
      }
    }
    return d;
  }
  function l(d) {
    let b = 0, x = 6;
    for (let w2 = 0; w2 < x; w2++)
      d[w2] !== void 0 && b++;
    return b === x;
  }
  function a(d) {
    let b = d.target;
    b.removeEventListener("dispose", a);
    let x = n.get(b);
    x !== void 0 && (n.delete(b), x.dispose());
  }
  function h36() {
    n = /* @__PURE__ */ new WeakMap(), t !== null && (t.dispose(), t = null);
  }
  return { get: i, dispose: h36 };
}
function vc2(e) {
  let n = {};
  function t(i) {
    if (n[i] !== void 0)
      return n[i];
    let l = e.getExtension(i);
    return n[i] = l, l;
  }
  return { has: function(i) {
    return t(i) !== null;
  }, init: function() {
    t("EXT_color_buffer_float"), t("WEBGL_clip_cull_distance"), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture"), t("WEBGL_render_shared_exponent");
  }, get: function(i) {
    let l = t(i);
    return l === null && Ta("WebGLRenderer: " + i + " extension not supported."), l;
  } };
}
function Sc2(e, n, t, i) {
  let l = {}, a = /* @__PURE__ */ new WeakMap();
  function h36(g2) {
    let S = g2.target;
    S.index !== null && n.remove(S.index);
    for (let O in S.attributes)
      n.remove(S.attributes[O]);
    S.removeEventListener("dispose", h36), delete l[S.id];
    let R = a.get(S);
    R && (n.remove(R), a.delete(S)), i.releaseStatesOfGeometry(S), S.isInstancedBufferGeometry === true && delete S._maxInstanceCount, t.memory.geometries--;
  }
  function d(g2, S) {
    return l[S.id] === true || (S.addEventListener("dispose", h36), l[S.id] = true, t.memory.geometries++), S;
  }
  function b(g2) {
    let S = g2.attributes;
    for (let R in S)
      n.update(S[R], e.ARRAY_BUFFER);
  }
  function x(g2) {
    let S = [], R = g2.index, O = g2.attributes.position, U2 = 0;
    if (R !== null) {
      let P = R.array;
      U2 = R.version;
      for (let M = 0, A = P.length; M < A; M += 3) {
        let C = P[M + 0], T = P[M + 1], N3 = P[M + 2];
        S.push(C, T, T, N3, N3, C);
      }
    } else if (O !== void 0) {
      let P = O.array;
      U2 = O.version;
      for (let M = 0, A = P.length / 3 - 1; M < A; M += 3) {
        let C = M + 0, T = M + 1, N3 = M + 2;
        S.push(C, T, T, N3, N3, C);
      }
    } else
      return;
    let f = new (mu(S) ? Br : Fr)(S, 1);
    f.version = U2;
    let o = a.get(g2);
    o && n.remove(o), a.set(g2, f);
  }
  function w2(g2) {
    let S = a.get(g2);
    if (S) {
      let R = g2.index;
      R !== null && S.version < R.version && x(g2);
    } else
      x(g2);
    return a.get(g2);
  }
  return { get: d, update: b, getWireframeAttribute: w2 };
}
function Ec2(e, n, t) {
  let i;
  function l(S) {
    i = S;
  }
  let a, h36;
  function d(S) {
    a = S.type, h36 = S.bytesPerElement;
  }
  function b(S, R) {
    e.drawElements(i, R, a, S * h36), t.update(R, i, 1);
  }
  function x(S, R, O) {
    O !== 0 && (e.drawElementsInstanced(i, R, a, S * h36, O), t.update(R, i, O));
  }
  function w2(S, R, O) {
    if (O === 0)
      return;
    n.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i, R, 0, a, S, 0, O);
    let f = 0;
    for (let o = 0; o < O; o++)
      f += R[o];
    t.update(f, i, 1);
  }
  function g2(S, R, O, U2) {
    if (O === 0)
      return;
    let f = n.get("WEBGL_multi_draw");
    if (f === null)
      for (let o = 0; o < S.length; o++)
        x(S[o] / h36, R[o], U2[o]);
    else {
      f.multiDrawElementsInstancedWEBGL(i, R, 0, a, S, 0, U2, 0, O);
      let o = 0;
      for (let P = 0; P < O; P++)
        o += R[P] * U2[P];
      t.update(o, i, 1);
    }
  }
  this.setMode = l, this.setIndex = d, this.render = b, this.renderInstances = x, this.renderMultiDraw = w2, this.renderMultiDrawInstances = g2;
}
function xc2(e) {
  let n = { geometries: 0, textures: 0 }, t = { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 };
  function i(a, h36, d) {
    switch (t.calls++, h36) {
      case e.TRIANGLES:
        t.triangles += d * (a / 3);
        break;
      case e.LINES:
        t.lines += d * (a / 2);
        break;
      case e.LINE_STRIP:
        t.lines += d * (a - 1);
        break;
      case e.LINE_LOOP:
        t.lines += d * a;
        break;
      case e.POINTS:
        t.points += d * a;
        break;
      default:
        X("WebGLInfo: Unknown draw mode:", h36);
        break;
    }
  }
  function l() {
    t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0;
  }
  return { memory: n, render: t, programs: null, autoReset: true, reset: l, update: i };
}
function Mc2(e, n, t) {
  let i = /* @__PURE__ */ new WeakMap(), l = new Dt();
  function a(h36, d, b) {
    let x = h36.morphTargetInfluences, w2 = d.morphAttributes.position || d.morphAttributes.normal || d.morphAttributes.color, g2 = w2 !== void 0 ? w2.length : 0, S = i.get(d);
    if (S === void 0 || S.count !== g2) {
      let c = function() {
        N3.dispose(), i.delete(d), d.removeEventListener("dispose", c);
      };
      S !== void 0 && S.texture.dispose();
      let R = d.morphAttributes.position !== void 0, O = d.morphAttributes.normal !== void 0, U2 = d.morphAttributes.color !== void 0, f = d.morphAttributes.position || [], o = d.morphAttributes.normal || [], P = d.morphAttributes.color || [], M = 0;
      R === true && (M = 1), O === true && (M = 2), U2 === true && (M = 3);
      let A = d.attributes.position.count * M, C = 1;
      A > n.maxTextureSize && (C = Math.ceil(A / n.maxTextureSize), A = n.maxTextureSize);
      let T = new Float32Array(A * C * 4 * g2), N3 = new zr(T, A, C, g2);
      N3.type = Si, N3.needsUpdate = true;
      let q3 = M * 4;
      for (let p = 0; p < g2; p++) {
        let L3 = f[p], k = o[p], G2 = P[p], z2 = A * C * 4 * p;
        for (let K = 0; K < L3.count; K++) {
          let B2 = K * q3;
          R === true && (l.fromBufferAttribute(L3, K), T[z2 + B2 + 0] = l.x, T[z2 + B2 + 1] = l.y, T[z2 + B2 + 2] = l.z, T[z2 + B2 + 3] = 0), O === true && (l.fromBufferAttribute(k, K), T[z2 + B2 + 4] = l.x, T[z2 + B2 + 5] = l.y, T[z2 + B2 + 6] = l.z, T[z2 + B2 + 7] = 0), U2 === true && (l.fromBufferAttribute(G2, K), T[z2 + B2 + 8] = l.x, T[z2 + B2 + 9] = l.y, T[z2 + B2 + 10] = l.z, T[z2 + B2 + 11] = G2.itemSize === 4 ? l.w : 1);
        }
      }
      S = { count: g2, texture: N3, size: new I(A, C) }, i.set(d, S), d.addEventListener("dispose", c);
    }
    if (h36.isInstancedMesh === true && h36.morphTexture !== null)
      b.getUniforms().setValue(e, "morphTexture", h36.morphTexture, t);
    else {
      let R = 0;
      for (let U2 = 0; U2 < x.length; U2++)
        R += x[U2];
      let O = d.morphTargetsRelative ? 1 : 1 - R;
      b.getUniforms().setValue(e, "morphTargetBaseInfluence", O), b.getUniforms().setValue(e, "morphTargetInfluences", x);
    }
    b.getUniforms().setValue(e, "morphTargetsTexture", S.texture, t), b.getUniforms().setValue(e, "morphTargetsTextureSize", S.size);
  }
  return { update: a };
}
function Tc2(e, n, t, i) {
  let l = /* @__PURE__ */ new WeakMap();
  function a(b) {
    let x = i.render.frame, w2 = b.geometry, g2 = n.get(b, w2);
    if (l.get(g2) !== x && (n.update(g2), l.set(g2, x)), b.isInstancedMesh && (b.hasEventListener("dispose", d) === false && b.addEventListener("dispose", d), l.get(b) !== x && (t.update(b.instanceMatrix, e.ARRAY_BUFFER), b.instanceColor !== null && t.update(b.instanceColor, e.ARRAY_BUFFER), l.set(b, x))), b.isSkinnedMesh) {
      let S = b.skeleton;
      l.get(S) !== x && (S.update(), l.set(S, x));
    }
    return g2;
  }
  function h36() {
    l = /* @__PURE__ */ new WeakMap();
  }
  function d(b) {
    let x = b.target;
    x.removeEventListener("dispose", d), t.remove(x.instanceMatrix), x.instanceColor !== null && t.remove(x.instanceColor);
  }
  return { update: a, dispose: h36 };
}
var Ac2 = { [tf]: "LINEAR_TONE_MAPPING", [ef]: "REINHARD_TONE_MAPPING", [sf]: "CINEON_TONE_MAPPING", [nf]: "ACES_FILMIC_TONE_MAPPING", [of]: "AGX_TONE_MAPPING", [af]: "NEUTRAL_TONE_MAPPING", [rf]: "CUSTOM_TONE_MAPPING" };
function Rc2(e, n, t, i, l) {
  let a = new ts(n, t, { type: e, depthBuffer: i, stencilBuffer: l }), h36 = new ts(n, t, { type: xc, depthBuffer: false, stencilBuffer: false }), d = new q();
  d.setAttribute("position", new B([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), d.setAttribute("uv", new B([0, 2, 0, 0, 2, 0], 2));
  let b = new wo({ uniforms: { tDiffuse: { value: null } }, vertexShader: `
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`, fragmentShader: `
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`, depthTest: false, depthWrite: false }), x = new Pt(d, b), w2 = new Fn(-1, 1, 1, -1, 0, 1), g2 = null, S = null, R = false, O, U2 = null, f = [], o = false;
  this.setSize = function(P, M) {
    a.setSize(P, M), h36.setSize(P, M);
    for (let A = 0; A < f.length; A++) {
      let C = f[A];
      C.setSize && C.setSize(P, M);
    }
  }, this.setEffects = function(P) {
    f = P, o = f.length > 0 && f[0].isRenderPass === true;
    let M = a.width, A = a.height;
    for (let C = 0; C < f.length; C++) {
      let T = f[C];
      T.setSize && T.setSize(M, A);
    }
  }, this.begin = function(P, M) {
    if (R || P.toneMapping === Kp && f.length === 0)
      return false;
    if (U2 = M, M !== null) {
      let A = M.width, C = M.height;
      (a.width !== A || a.height !== C) && this.setSize(A, C);
    }
    return o === false && P.setRenderTarget(a), O = P.toneMapping, P.toneMapping = Kp, true;
  }, this.hasRenderPass = function() {
    return o;
  }, this.end = function(P, M) {
    P.toneMapping = O, R = true;
    let A = a, C = h36;
    for (let T = 0; T < f.length; T++) {
      let N3 = f[T];
      if (N3.enabled !== false && (N3.render(P, C, A, M), N3.needsSwap !== false)) {
        let q3 = A;
        A = C, C = q3;
      }
    }
    if (g2 !== P.outputColorSpace || S !== P.toneMapping) {
      g2 = P.outputColorSpace, S = P.toneMapping, b.defines = {}, Ft.getTransfer(g2) === Dn && (b.defines.SRGB_TRANSFER = "");
      let T = Ac2[S];
      T && (b.defines[T] = ""), b.needsUpdate = true;
    }
    b.uniforms.tDiffuse.value = A.texture, P.setRenderTarget(U2), P.render(x, w2), U2 = null, R = false;
  }, this.isCompositing = function() {
    return R;
  }, this.dispose = function() {
    a.dispose(), h36.dispose(), d.dispose(), b.dispose();
  };
}
var jr2 = new ut();
var jn2 = new Zr(1, 1);
var ea2 = new zr();
var ta2 = new hn();
var na2 = new ss();
var dr2 = [];
var ur2 = [];
var pr2 = new Float32Array(16);
var hr2 = new Float32Array(9);
var mr2 = new Float32Array(4);
function Zt2(e, n, t) {
  let i = e[0];
  if (i <= 0 || i > 0)
    return e;
  let l = n * t, a = dr2[l];
  if (a === void 0 && (a = new Float32Array(l), dr2[l] = a), n !== 0) {
    i.toArray(a, 0);
    for (let h36 = 1, d = 0; h36 !== n; ++h36)
      d += t, e[h36].toArray(a, d);
  }
  return a;
}
function ot2(e, n) {
  if (e.length !== n.length)
    return false;
  for (let t = 0, i = e.length; t < i; t++)
    if (e[t] !== n[t])
      return false;
  return true;
}
function st2(e, n) {
  for (let t = 0, i = n.length; t < i; t++)
    e[t] = n[t];
}
function bn2(e, n) {
  let t = ur2[n];
  t === void 0 && (t = new Int32Array(n), ur2[n] = t);
  for (let i = 0; i !== n; ++i)
    t[i] = e.allocateTextureUnit();
  return t;
}
function bc2(e, n) {
  let t = this.cache;
  t[0] !== n && (e.uniform1f(this.addr, n), t[0] = n);
}
function Cc2(e, n) {
  let t = this.cache;
  if (n.x !== void 0)
    (t[0] !== n.x || t[1] !== n.y) && (e.uniform2f(this.addr, n.x, n.y), t[0] = n.x, t[1] = n.y);
  else {
    if (ot2(t, n))
      return;
    e.uniform2fv(this.addr, n), st2(t, n);
  }
}
function Pc2(e, n) {
  let t = this.cache;
  if (n.x !== void 0)
    (t[0] !== n.x || t[1] !== n.y || t[2] !== n.z) && (e.uniform3f(this.addr, n.x, n.y, n.z), t[0] = n.x, t[1] = n.y, t[2] = n.z);
  else if (n.r !== void 0)
    (t[0] !== n.r || t[1] !== n.g || t[2] !== n.b) && (e.uniform3f(this.addr, n.r, n.g, n.b), t[0] = n.r, t[1] = n.g, t[2] = n.b);
  else {
    if (ot2(t, n))
      return;
    e.uniform3fv(this.addr, n), st2(t, n);
  }
}
function Lc2(e, n) {
  let t = this.cache;
  if (n.x !== void 0)
    (t[0] !== n.x || t[1] !== n.y || t[2] !== n.z || t[3] !== n.w) && (e.uniform4f(this.addr, n.x, n.y, n.z, n.w), t[0] = n.x, t[1] = n.y, t[2] = n.z, t[3] = n.w);
  else {
    if (ot2(t, n))
      return;
    e.uniform4fv(this.addr, n), st2(t, n);
  }
}
function Dc2(e, n) {
  let t = this.cache, i = n.elements;
  if (i === void 0) {
    if (ot2(t, n))
      return;
    e.uniformMatrix2fv(this.addr, false, n), st2(t, n);
  } else {
    if (ot2(t, i))
      return;
    mr2.set(i), e.uniformMatrix2fv(this.addr, false, mr2), st2(t, i);
  }
}
function Uc2(e, n) {
  let t = this.cache, i = n.elements;
  if (i === void 0) {
    if (ot2(t, n))
      return;
    e.uniformMatrix3fv(this.addr, false, n), st2(t, n);
  } else {
    if (ot2(t, i))
      return;
    hr2.set(i), e.uniformMatrix3fv(this.addr, false, hr2), st2(t, i);
  }
}
function wc2(e, n) {
  let t = this.cache, i = n.elements;
  if (i === void 0) {
    if (ot2(t, n))
      return;
    e.uniformMatrix4fv(this.addr, false, n), st2(t, n);
  } else {
    if (ot2(t, i))
      return;
    pr2.set(i), e.uniformMatrix4fv(this.addr, false, pr2), st2(t, i);
  }
}
function Ic2(e, n) {
  let t = this.cache;
  t[0] !== n && (e.uniform1i(this.addr, n), t[0] = n);
}
function Nc2(e, n) {
  let t = this.cache;
  if (n.x !== void 0)
    (t[0] !== n.x || t[1] !== n.y) && (e.uniform2i(this.addr, n.x, n.y), t[0] = n.x, t[1] = n.y);
  else {
    if (ot2(t, n))
      return;
    e.uniform2iv(this.addr, n), st2(t, n);
  }
}
function yc2(e, n) {
  let t = this.cache;
  if (n.x !== void 0)
    (t[0] !== n.x || t[1] !== n.y || t[2] !== n.z) && (e.uniform3i(this.addr, n.x, n.y, n.z), t[0] = n.x, t[1] = n.y, t[2] = n.z);
  else {
    if (ot2(t, n))
      return;
    e.uniform3iv(this.addr, n), st2(t, n);
  }
}
function Fc2(e, n) {
  let t = this.cache;
  if (n.x !== void 0)
    (t[0] !== n.x || t[1] !== n.y || t[2] !== n.z || t[3] !== n.w) && (e.uniform4i(this.addr, n.x, n.y, n.z, n.w), t[0] = n.x, t[1] = n.y, t[2] = n.z, t[3] = n.w);
  else {
    if (ot2(t, n))
      return;
    e.uniform4iv(this.addr, n), st2(t, n);
  }
}
function Oc2(e, n) {
  let t = this.cache;
  t[0] !== n && (e.uniform1ui(this.addr, n), t[0] = n);
}
function Bc2(e, n) {
  let t = this.cache;
  if (n.x !== void 0)
    (t[0] !== n.x || t[1] !== n.y) && (e.uniform2ui(this.addr, n.x, n.y), t[0] = n.x, t[1] = n.y);
  else {
    if (ot2(t, n))
      return;
    e.uniform2uiv(this.addr, n), st2(t, n);
  }
}
function Gc2(e, n) {
  let t = this.cache;
  if (n.x !== void 0)
    (t[0] !== n.x || t[1] !== n.y || t[2] !== n.z) && (e.uniform3ui(this.addr, n.x, n.y, n.z), t[0] = n.x, t[1] = n.y, t[2] = n.z);
  else {
    if (ot2(t, n))
      return;
    e.uniform3uiv(this.addr, n), st2(t, n);
  }
}
function Hc2(e, n) {
  let t = this.cache;
  if (n.x !== void 0)
    (t[0] !== n.x || t[1] !== n.y || t[2] !== n.z || t[3] !== n.w) && (e.uniform4ui(this.addr, n.x, n.y, n.z, n.w), t[0] = n.x, t[1] = n.y, t[2] = n.z, t[3] = n.w);
  else {
    if (ot2(t, n))
      return;
    e.uniform4uiv(this.addr, n), st2(t, n);
  }
}
function Vc2(e, n, t) {
  let i = this.cache, l = t.allocateTextureUnit();
  i[0] !== l && (e.uniform1i(this.addr, l), i[0] = l);
  let a;
  this.type === e.SAMPLER_2D_SHADOW ? (jn2.compareFunction = t.isReversedDepthBuffer() ? Jf : Uf, a = jn2) : a = jr2, t.setTexture2D(n || a, l);
}
function kc2(e, n, t) {
  let i = this.cache, l = t.allocateTextureUnit();
  i[0] !== l && (e.uniform1i(this.addr, l), i[0] = l), t.setTexture3D(n || ta2, l);
}
function Wc2(e, n, t) {
  let i = this.cache, l = t.allocateTextureUnit();
  i[0] !== l && (e.uniform1i(this.addr, l), i[0] = l), t.setTextureCube(n || na2, l);
}
function zc2(e, n, t) {
  let i = this.cache, l = t.allocateTextureUnit();
  i[0] !== l && (e.uniform1i(this.addr, l), i[0] = l), t.setTexture2DArray(n || ea2, l);
}
function Xc2(e) {
  switch (e) {
    case 5126:
      return bc2;
    case 35664:
      return Cc2;
    case 35665:
      return Pc2;
    case 35666:
      return Lc2;
    case 35674:
      return Dc2;
    case 35675:
      return Uc2;
    case 35676:
      return wc2;
    case 5124:
    case 35670:
      return Ic2;
    case 35667:
    case 35671:
      return Nc2;
    case 35668:
    case 35672:
      return yc2;
    case 35669:
    case 35673:
      return Fc2;
    case 5125:
      return Oc2;
    case 36294:
      return Bc2;
    case 36295:
      return Gc2;
    case 36296:
      return Hc2;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Vc2;
    case 35679:
    case 36299:
    case 36307:
      return kc2;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Wc2;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return zc2;
  }
}
function Yc2(e, n) {
  e.uniform1fv(this.addr, n);
}
function qc2(e, n) {
  let t = Zt2(n, this.size, 2);
  e.uniform2fv(this.addr, t);
}
function Kc2(e, n) {
  let t = Zt2(n, this.size, 3);
  e.uniform3fv(this.addr, t);
}
function $c2(e, n) {
  let t = Zt2(n, this.size, 4);
  e.uniform4fv(this.addr, t);
}
function Zc2(e, n) {
  let t = Zt2(n, this.size, 4);
  e.uniformMatrix2fv(this.addr, false, t);
}
function Qc2(e, n) {
  let t = Zt2(n, this.size, 9);
  e.uniformMatrix3fv(this.addr, false, t);
}
function Jc2(e, n) {
  let t = Zt2(n, this.size, 16);
  e.uniformMatrix4fv(this.addr, false, t);
}
function jc2(e, n) {
  e.uniform1iv(this.addr, n);
}
function ef2(e, n) {
  e.uniform2iv(this.addr, n);
}
function tf2(e, n) {
  e.uniform3iv(this.addr, n);
}
function nf2(e, n) {
  e.uniform4iv(this.addr, n);
}
function rf2(e, n) {
  e.uniform1uiv(this.addr, n);
}
function af2(e, n) {
  e.uniform2uiv(this.addr, n);
}
function of2(e, n) {
  e.uniform3uiv(this.addr, n);
}
function sf2(e, n) {
  e.uniform4uiv(this.addr, n);
}
function lf2(e, n, t) {
  let i = this.cache, l = n.length, a = bn2(t, l);
  ot2(i, a) || (e.uniform1iv(this.addr, a), st2(i, a));
  let h36;
  this.type === e.SAMPLER_2D_SHADOW ? h36 = jn2 : h36 = jr2;
  for (let d = 0; d !== l; ++d)
    t.setTexture2D(n[d] || h36, a[d]);
}
function cf2(e, n, t) {
  let i = this.cache, l = n.length, a = bn2(t, l);
  ot2(i, a) || (e.uniform1iv(this.addr, a), st2(i, a));
  for (let h36 = 0; h36 !== l; ++h36)
    t.setTexture3D(n[h36] || ta2, a[h36]);
}
function ff2(e, n, t) {
  let i = this.cache, l = n.length, a = bn2(t, l);
  ot2(i, a) || (e.uniform1iv(this.addr, a), st2(i, a));
  for (let h36 = 0; h36 !== l; ++h36)
    t.setTextureCube(n[h36] || na2, a[h36]);
}
function df2(e, n, t) {
  let i = this.cache, l = n.length, a = bn2(t, l);
  ot2(i, a) || (e.uniform1iv(this.addr, a), st2(i, a));
  for (let h36 = 0; h36 !== l; ++h36)
    t.setTexture2DArray(n[h36] || ea2, a[h36]);
}
function uf2(e) {
  switch (e) {
    case 5126:
      return Yc2;
    case 35664:
      return qc2;
    case 35665:
      return Kc2;
    case 35666:
      return $c2;
    case 35674:
      return Zc2;
    case 35675:
      return Qc2;
    case 35676:
      return Jc2;
    case 5124:
    case 35670:
      return jc2;
    case 35667:
    case 35671:
      return ef2;
    case 35668:
    case 35672:
      return tf2;
    case 35669:
    case 35673:
      return nf2;
    case 5125:
      return rf2;
    case 36294:
      return af2;
    case 36295:
      return of2;
    case 36296:
      return sf2;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return lf2;
    case 35679:
    case 36299:
    case 36307:
      return cf2;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return ff2;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return df2;
  }
}
var ei2 = class {
  constructor(n, t, i) {
    this.id = n, this.addr = i, this.cache = [], this.type = t.type, this.setValue = Xc2(t.type);
  }
};
var ti2 = class {
  constructor(n, t, i) {
    this.id = n, this.addr = i, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = uf2(t.type);
  }
};
var ni2 = class {
  constructor(n) {
    this.id = n, this.seq = [], this.map = {};
  }
  setValue(n, t, i) {
    let l = this.seq;
    for (let a = 0, h36 = l.length; a !== h36; ++a) {
      let d = l[a];
      d.setValue(n, t[d.id], i);
    }
  }
};
var Hn2 = /(\w+)(\])?(\[|\.)?/g;
function _r(e, n) {
  e.seq.push(n), e.map[n.id] = n;
}
function pf2(e, n, t) {
  let i = e.name, l = i.length;
  for (Hn2.lastIndex = 0; ; ) {
    let a = Hn2.exec(i), h36 = Hn2.lastIndex, d = a[1], b = a[2] === "]", x = a[3];
    if (b && (d = d | 0), x === void 0 || x === "[" && h36 + 2 === l) {
      _r(t, x === void 0 ? new ei2(d, e, n) : new ti2(d, e, n));
      break;
    } else {
      let g2 = t.map[d];
      g2 === void 0 && (g2 = new ni2(d), _r(t, g2)), t = g2;
    }
  }
}
var Yt2 = class {
  constructor(n, t) {
    this.seq = [], this.map = {};
    let i = n.getProgramParameter(t, n.ACTIVE_UNIFORMS);
    for (let h36 = 0; h36 < i; ++h36) {
      let d = n.getActiveUniform(t, h36), b = n.getUniformLocation(t, d.name);
      pf2(d, b, this);
    }
    let l = [], a = [];
    for (let h36 of this.seq)
      h36.type === n.SAMPLER_2D_SHADOW || h36.type === n.SAMPLER_CUBE_SHADOW || h36.type === n.SAMPLER_2D_ARRAY_SHADOW ? l.push(h36) : a.push(h36);
    l.length > 0 && (this.seq = l.concat(a));
  }
  setValue(n, t, i, l) {
    let a = this.map[t];
    a !== void 0 && a.setValue(n, i, l);
  }
  setOptional(n, t, i) {
    let l = t[i];
    l !== void 0 && this.setValue(n, i, l);
  }
  static upload(n, t, i, l) {
    for (let a = 0, h36 = t.length; a !== h36; ++a) {
      let d = t[a], b = i[d.id];
      b.needsUpdate !== false && d.setValue(n, b.value, l);
    }
  }
  static seqWithValue(n, t) {
    let i = [];
    for (let l = 0, a = n.length; l !== a; ++l) {
      let h36 = n[l];
      h36.id in t && i.push(h36);
    }
    return i;
  }
};
function gr2(e, n, t) {
  let i = e.createShader(n);
  return e.shaderSource(i, t), e.compileShader(i), i;
}
var hf2 = 37297;
var mf2 = 0;
function _f2(e, n) {
  let t = e.split(`
`), i = [], l = Math.max(n - 6, 0), a = Math.min(n + 6, t.length);
  for (let h36 = l; h36 < a; h36++) {
    let d = h36 + 1;
    i.push(`${d === n ? ">" : " "} ${d}: ${t[h36]}`);
  }
  return i.join(`
`);
}
var vr2 = new te();
function gf2(e) {
  Ft._getMatrix(vr2, Ft.workingColorSpace, e);
  let n = `mat3( ${vr2.elements.map((t) => t.toFixed(4))} )`;
  switch (Ft.getTransfer(e)) {
    case _a:
      return [n, "LinearTransferOETF"];
    case Dn:
      return [n, "sRGBTransferOETF"];
    default:
      return E("WebGLProgram: Unsupported color space: ", e), [n, "LinearTransferOETF"];
  }
}
function Sr2(e, n, t) {
  let i = e.getShaderParameter(n, e.COMPILE_STATUS), a = (e.getShaderInfoLog(n) || "").trim();
  if (i && a === "")
    return "";
  let h36 = /ERROR: 0:(\d+)/.exec(a);
  if (h36) {
    let d = parseInt(h36[1]);
    return t.toUpperCase() + `

` + a + `

` + _f2(e.getShaderSource(n), d);
  } else
    return a;
}
function vf2(e, n) {
  let t = gf2(n);
  return [`vec4 ${e}( vec4 value ) {`, `	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`, "}"].join(`
`);
}
var Sf2 = { [tf]: "Linear", [ef]: "Reinhard", [sf]: "Cineon", [nf]: "ACESFilmic", [of]: "AgX", [af]: "Neutral", [rf]: "Custom" };
function Ef2(e, n) {
  let t = Sf2[n];
  return t === void 0 ? (E("WebGLProgram: Unsupported toneMapping:", n), "vec3 " + e + "( vec3 color ) { return LinearToneMapping( color ); }") : "vec3 " + e + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
}
var pn2 = new w();
function xf2() {
  Ft.getLuminanceCoefficients(pn2);
  let e = pn2.x.toFixed(4), n = pn2.y.toFixed(4), t = pn2.z.toFixed(4);
  return ["float luminance( const in vec3 rgb ) {", `	const vec3 weights = vec3( ${e}, ${n}, ${t} );`, "	return dot( weights, rgb );", "}"].join(`
`);
}
function Mf2(e) {
  return [e.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", e.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(rn2).join(`
`);
}
function Tf2(e) {
  let n = [];
  for (let t in e) {
    let i = e[t];
    i !== false && n.push("#define " + t + " " + i);
  }
  return n.join(`
`);
}
function Af2(e, n) {
  let t = {}, i = e.getProgramParameter(n, e.ACTIVE_ATTRIBUTES);
  for (let l = 0; l < i; l++) {
    let a = e.getActiveAttrib(n, l), h36 = a.name, d = 1;
    a.type === e.FLOAT_MAT2 && (d = 2), a.type === e.FLOAT_MAT3 && (d = 3), a.type === e.FLOAT_MAT4 && (d = 4), t[h36] = { type: a.type, location: e.getAttribLocation(n, h36), locationSize: d };
  }
  return t;
}
function rn2(e) {
  return e !== "";
}
function Er2(e, n) {
  let t = n.numSpotLightShadows + n.numSpotLightMaps - n.numSpotLightShadowsWithMaps;
  return e.replace(/NUM_DIR_LIGHTS/g, n.numDirLights).replace(/NUM_SPOT_LIGHTS/g, n.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, n.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, n.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, n.numPointLights).replace(/NUM_HEMI_LIGHTS/g, n.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, n.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, n.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, n.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, n.numPointLightShadows);
}
function xr2(e, n) {
  return e.replace(/NUM_CLIPPING_PLANES/g, n.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, n.numClippingPlanes - n.numClipIntersection);
}
var Rf2 = /^[ \t]*#include +<([\w\d./]+)>/gm;
function ii2(e) {
  return e.replace(Rf2, Cf2);
}
var bf2 = /* @__PURE__ */ new Map();
function Cf2(e, n) {
  let t = Pe2[n];
  if (t === void 0) {
    let i = bf2.get(n);
    if (i !== void 0)
      t = Pe2[i], E('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', n, i);
    else
      throw new Error("Can not resolve #include <" + n + ">");
  }
  return ii2(t);
}
var Pf2 = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function Mr2(e) {
  return e.replace(Pf2, Lf2);
}
function Lf2(e, n, t, i) {
  let l = "";
  for (let a = parseInt(n); a < parseInt(t); a++)
    l += i.replace(/\[\s*i\s*\]/g, "[ " + a + " ]").replace(/UNROLLED_LOOP_INDEX/g, a);
  return l;
}
function Tr2(e) {
  let n = `precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;
  return e.precision === "highp" ? n += `
#define HIGH_PRECISION` : e.precision === "mediump" ? n += `
#define MEDIUM_PRECISION` : e.precision === "lowp" && (n += `
#define LOW_PRECISION`), n;
}
var Df2 = { [bp]: "SHADOWMAP_TYPE_PCF", [Mp]: "SHADOWMAP_TYPE_VSM" };
function Uf2(e) {
  return Df2[e.shadowMapType] || "SHADOWMAP_TYPE_BASIC";
}
var wf2 = { [Rn]: "ENVMAP_TYPE_CUBE", [ac]: "ENVMAP_TYPE_CUBE", [cc]: "ENVMAP_TYPE_CUBE_UV" };
function If2(e) {
  return e.envMap === false ? "ENVMAP_TYPE_CUBE" : wf2[e.envMapMode] || "ENVMAP_TYPE_CUBE";
}
var Nf2 = { [ac]: "ENVMAP_MODE_REFRACTION" };
function yf2(e) {
  return e.envMap === false ? "ENVMAP_MODE_REFLECTION" : Nf2[e.envMapMode] || "ENVMAP_MODE_REFLECTION";
}
var Ff2 = { [ta]: "ENVMAP_BLENDING_MULTIPLY", [jp]: "ENVMAP_BLENDING_MIX", [Qp]: "ENVMAP_BLENDING_ADD" };
function Of2(e) {
  return e.envMap === false ? "ENVMAP_BLENDING_NONE" : Ff2[e.combine] || "ENVMAP_BLENDING_NONE";
}
function Bf2(e) {
  let n = e.envMapCubeUVHeight;
  if (n === null)
    return null;
  let t = Math.log2(n) - 2, i = 1 / n;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 112)), texelHeight: i, maxMip: t };
}
function Gf2(e, n, t, i) {
  let l = e.getContext(), a = t.defines, h36 = t.vertexShader, d = t.fragmentShader, b = Uf2(t), x = If2(t), w2 = yf2(t), g2 = Of2(t), S = Bf2(t), R = Mf2(t), O = Tf2(a), U2 = l.createProgram(), f, o, P = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (f = ["#define SHADER_TYPE " + t.shaderType, "#define SHADER_NAME " + t.shaderName, O].filter(rn2).join(`
`), f.length > 0 && (f += `
`), o = ["#define SHADER_TYPE " + t.shaderType, "#define SHADER_NAME " + t.shaderName, O].filter(rn2).join(`
`), o.length > 0 && (o += `
`)) : (f = [Tr2(t), "#define SHADER_TYPE " + t.shaderType, "#define SHADER_NAME " + t.shaderName, O, t.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "", t.batching ? "#define USE_BATCHING" : "", t.batchingColor ? "#define USE_BATCHING_COLOR" : "", t.instancing ? "#define USE_INSTANCING" : "", t.instancingColor ? "#define USE_INSTANCING_COLOR" : "", t.instancingMorph ? "#define USE_INSTANCING_MORPH" : "", t.useFog && t.fog ? "#define USE_FOG" : "", t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "", t.map ? "#define USE_MAP" : "", t.envMap ? "#define USE_ENVMAP" : "", t.envMap ? "#define " + w2 : "", t.lightMap ? "#define USE_LIGHTMAP" : "", t.aoMap ? "#define USE_AOMAP" : "", t.bumpMap ? "#define USE_BUMPMAP" : "", t.normalMap ? "#define USE_NORMALMAP" : "", t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", t.displacementMap ? "#define USE_DISPLACEMENTMAP" : "", t.emissiveMap ? "#define USE_EMISSIVEMAP" : "", t.anisotropy ? "#define USE_ANISOTROPY" : "", t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", t.specularMap ? "#define USE_SPECULARMAP" : "", t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", t.metalnessMap ? "#define USE_METALNESSMAP" : "", t.alphaMap ? "#define USE_ALPHAMAP" : "", t.alphaHash ? "#define USE_ALPHAHASH" : "", t.transmission ? "#define USE_TRANSMISSION" : "", t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", t.thicknessMap ? "#define USE_THICKNESSMAP" : "", t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", t.mapUv ? "#define MAP_UV " + t.mapUv : "", t.alphaMapUv ? "#define ALPHAMAP_UV " + t.alphaMapUv : "", t.lightMapUv ? "#define LIGHTMAP_UV " + t.lightMapUv : "", t.aoMapUv ? "#define AOMAP_UV " + t.aoMapUv : "", t.emissiveMapUv ? "#define EMISSIVEMAP_UV " + t.emissiveMapUv : "", t.bumpMapUv ? "#define BUMPMAP_UV " + t.bumpMapUv : "", t.normalMapUv ? "#define NORMALMAP_UV " + t.normalMapUv : "", t.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + t.displacementMapUv : "", t.metalnessMapUv ? "#define METALNESSMAP_UV " + t.metalnessMapUv : "", t.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + t.roughnessMapUv : "", t.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + t.anisotropyMapUv : "", t.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + t.clearcoatMapUv : "", t.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + t.clearcoatNormalMapUv : "", t.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + t.clearcoatRoughnessMapUv : "", t.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + t.iridescenceMapUv : "", t.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + t.iridescenceThicknessMapUv : "", t.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + t.sheenColorMapUv : "", t.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + t.sheenRoughnessMapUv : "", t.specularMapUv ? "#define SPECULARMAP_UV " + t.specularMapUv : "", t.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + t.specularColorMapUv : "", t.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + t.specularIntensityMapUv : "", t.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + t.transmissionMapUv : "", t.thicknessMapUv ? "#define THICKNESSMAP_UV " + t.thicknessMapUv : "", t.vertexTangents && t.flatShading === false ? "#define USE_TANGENT" : "", t.vertexColors ? "#define USE_COLOR" : "", t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", t.vertexUv1s ? "#define USE_UV1" : "", t.vertexUv2s ? "#define USE_UV2" : "", t.vertexUv3s ? "#define USE_UV3" : "", t.pointsUvs ? "#define USE_POINTS_UV" : "", t.flatShading ? "#define FLAT_SHADED" : "", t.skinning ? "#define USE_SKINNING" : "", t.morphTargets ? "#define USE_MORPHTARGETS" : "", t.morphNormals && t.flatShading === false ? "#define USE_MORPHNORMALS" : "", t.morphColors ? "#define USE_MORPHCOLORS" : "", t.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride : "", t.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "", t.doubleSided ? "#define DOUBLE_SIDED" : "", t.flipSided ? "#define FLIP_SIDED" : "", t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", t.shadowMapEnabled ? "#define " + b : "", t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", t.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "", t.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", "#ifdef USE_INSTANCING", "	attribute mat4 instanceMatrix;", "#endif", "#ifdef USE_INSTANCING_COLOR", "	attribute vec3 instanceColor;", "#endif", "#ifdef USE_INSTANCING_MORPH", "	uniform sampler2D morphTexture;", "#endif", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_UV1", "	attribute vec2 uv1;", "#endif", "#ifdef USE_UV2", "	attribute vec2 uv2;", "#endif", "#ifdef USE_UV3", "	attribute vec2 uv3;", "#endif", "#ifdef USE_TANGENT", "	attribute vec4 tangent;", "#endif", "#if defined( USE_COLOR_ALPHA )", "	attribute vec4 color;", "#elif defined( USE_COLOR )", "	attribute vec3 color;", "#endif", "#ifdef USE_SKINNING", "	attribute vec4 skinIndex;", "	attribute vec4 skinWeight;", "#endif", `
`].filter(rn2).join(`
`), o = [Tr2(t), "#define SHADER_TYPE " + t.shaderType, "#define SHADER_NAME " + t.shaderName, O, t.useFog && t.fog ? "#define USE_FOG" : "", t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "", t.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "", t.map ? "#define USE_MAP" : "", t.matcap ? "#define USE_MATCAP" : "", t.envMap ? "#define USE_ENVMAP" : "", t.envMap ? "#define " + x : "", t.envMap ? "#define " + w2 : "", t.envMap ? "#define " + g2 : "", S ? "#define CUBEUV_TEXEL_WIDTH " + S.texelWidth : "", S ? "#define CUBEUV_TEXEL_HEIGHT " + S.texelHeight : "", S ? "#define CUBEUV_MAX_MIP " + S.maxMip + ".0" : "", t.lightMap ? "#define USE_LIGHTMAP" : "", t.aoMap ? "#define USE_AOMAP" : "", t.bumpMap ? "#define USE_BUMPMAP" : "", t.normalMap ? "#define USE_NORMALMAP" : "", t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", t.emissiveMap ? "#define USE_EMISSIVEMAP" : "", t.anisotropy ? "#define USE_ANISOTROPY" : "", t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", t.clearcoat ? "#define USE_CLEARCOAT" : "", t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", t.dispersion ? "#define USE_DISPERSION" : "", t.iridescence ? "#define USE_IRIDESCENCE" : "", t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", t.specularMap ? "#define USE_SPECULARMAP" : "", t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", t.metalnessMap ? "#define USE_METALNESSMAP" : "", t.alphaMap ? "#define USE_ALPHAMAP" : "", t.alphaTest ? "#define USE_ALPHATEST" : "", t.alphaHash ? "#define USE_ALPHAHASH" : "", t.sheen ? "#define USE_SHEEN" : "", t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", t.transmission ? "#define USE_TRANSMISSION" : "", t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", t.thicknessMap ? "#define USE_THICKNESSMAP" : "", t.vertexTangents && t.flatShading === false ? "#define USE_TANGENT" : "", t.vertexColors || t.instancingColor || t.batchingColor ? "#define USE_COLOR" : "", t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", t.vertexUv1s ? "#define USE_UV1" : "", t.vertexUv2s ? "#define USE_UV2" : "", t.vertexUv3s ? "#define USE_UV3" : "", t.pointsUvs ? "#define USE_POINTS_UV" : "", t.gradientMap ? "#define USE_GRADIENTMAP" : "", t.flatShading ? "#define FLAT_SHADED" : "", t.doubleSided ? "#define DOUBLE_SIDED" : "", t.flipSided ? "#define FLIP_SIDED" : "", t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", t.shadowMapEnabled ? "#define " + b : "", t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "", t.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "", t.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "", t.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", t.toneMapping !== Kp ? "#define TONE_MAPPING" : "", t.toneMapping !== Kp ? Pe2.tonemapping_pars_fragment : "", t.toneMapping !== Kp ? Ef2("toneMapping", t.toneMapping) : "", t.dithering ? "#define DITHERING" : "", t.opaque ? "#define OPAQUE" : "", Pe2.colorspace_pars_fragment, vf2("linearToOutputTexel", t.outputColorSpace), xf2(), t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "", `
`].filter(rn2).join(`
`)), h36 = ii2(h36), h36 = Er2(h36, t), h36 = xr2(h36, t), d = ii2(d), d = Er2(d, t), d = xr2(d, t), h36 = Mr2(h36), d = Mr2(d), t.isRawShaderMaterial !== true && (P = `#version 300 es
`, f = [R, "#define attribute in", "#define varying out", "#define texture2D texture"].join(`
`) + `
` + f, o = ["#define varying in", t.glslVersion === em ? "" : "layout(location = 0) out highp vec4 pc_fragColor;", t.glslVersion === em ? "" : "#define gl_FragColor pc_fragColor", "#define gl_FragDepthEXT gl_FragDepth", "#define texture2D texture", "#define textureCube texture", "#define texture2DProj textureProj", "#define texture2DLodEXT textureLod", "#define texture2DProjLodEXT textureProjLod", "#define textureCubeLodEXT textureLod", "#define texture2DGradEXT textureGrad", "#define texture2DProjGradEXT textureProjGrad", "#define textureCubeGradEXT textureGrad"].join(`
`) + `
` + o);
  let M = P + f + h36, A = P + o + d, C = gr2(l, l.VERTEX_SHADER, M), T = gr2(l, l.FRAGMENT_SHADER, A);
  l.attachShader(U2, C), l.attachShader(U2, T), t.index0AttributeName !== void 0 ? l.bindAttribLocation(U2, 0, t.index0AttributeName) : t.morphTargets === true && l.bindAttribLocation(U2, 0, "position"), l.linkProgram(U2);
  function N3(L3) {
    if (e.debug.checkShaderErrors) {
      let k = l.getProgramInfoLog(U2) || "", G2 = l.getShaderInfoLog(C) || "", z2 = l.getShaderInfoLog(T) || "", K = k.trim(), B2 = G2.trim(), V2 = z2.trim(), J = true, xe3 = true;
      if (l.getProgramParameter(U2, l.LINK_STATUS) === false)
        if (J = false, typeof e.debug.onShaderError == "function")
          e.debug.onShaderError(l, U2, C, T);
        else {
          let ge3 = Sr2(l, C, "vertex"), Ee3 = Sr2(l, T, "fragment");
          X("THREE.WebGLProgram: Shader Error " + l.getError() + " - VALIDATE_STATUS " + l.getProgramParameter(U2, l.VALIDATE_STATUS) + `

Material Name: ` + L3.name + `
Material Type: ` + L3.type + `

Program Info Log: ` + K + `
` + ge3 + `
` + Ee3);
        }
      else
        K !== "" ? E("WebGLProgram: Program Info Log:", K) : (B2 === "" || V2 === "") && (xe3 = false);
      xe3 && (L3.diagnostics = { runnable: J, programLog: K, vertexShader: { log: B2, prefix: f }, fragmentShader: { log: V2, prefix: o } });
    }
    l.deleteShader(C), l.deleteShader(T), q3 = new Yt2(l, U2), c = Af2(l, U2);
  }
  let q3;
  this.getUniforms = function() {
    return q3 === void 0 && N3(this), q3;
  };
  let c;
  this.getAttributes = function() {
    return c === void 0 && N3(this), c;
  };
  let p = t.rendererExtensionParallelShaderCompile === false;
  return this.isReady = function() {
    return p === false && (p = l.getProgramParameter(U2, hf2)), p;
  }, this.destroy = function() {
    i.releaseStatesOfProgram(this), l.deleteProgram(U2), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = mf2++, this.cacheKey = n, this.usedTimes = 1, this.program = U2, this.vertexShader = C, this.fragmentShader = T, this;
}
var Hf2 = 0;
var ri2 = class {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(n) {
    let t = n.vertexShader, i = n.fragmentShader, l = this._getShaderStage(t), a = this._getShaderStage(i), h36 = this._getShaderCacheForMaterial(n);
    return h36.has(l) === false && (h36.add(l), l.usedTimes++), h36.has(a) === false && (h36.add(a), a.usedTimes++), this;
  }
  remove(n) {
    let t = this.materialCache.get(n);
    for (let i of t)
      i.usedTimes--, i.usedTimes === 0 && this.shaderCache.delete(i.code);
    return this.materialCache.delete(n), this;
  }
  getVertexShaderID(n) {
    return this._getShaderStage(n.vertexShader).id;
  }
  getFragmentShaderID(n) {
    return this._getShaderStage(n.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(n) {
    let t = this.materialCache, i = t.get(n);
    return i === void 0 && (i = /* @__PURE__ */ new Set(), t.set(n, i)), i;
  }
  _getShaderStage(n) {
    let t = this.shaderCache, i = t.get(n);
    return i === void 0 && (i = new ai2(n), t.set(n, i)), i;
  }
};
var ai2 = class {
  constructor(n) {
    this.id = Hf2++, this.code = n, this.usedTimes = 0;
  }
};
function Vf2(e, n, t, i, l, a, h36) {
  let d = new ln(), b = new ri2(), x = /* @__PURE__ */ new Set(), w2 = [], g2 = /* @__PURE__ */ new Map(), S = l.logarithmicDepthBuffer, R = l.precision, O = { MeshDepthMaterial: "depth", MeshDistanceMaterial: "distance", MeshNormalMaterial: "normal", MeshBasicMaterial: "basic", MeshLambertMaterial: "lambert", MeshPhongMaterial: "phong", MeshToonMaterial: "toon", MeshStandardMaterial: "physical", MeshPhysicalMaterial: "physical", MeshMatcapMaterial: "matcap", LineBasicMaterial: "basic", LineDashedMaterial: "dashed", PointsMaterial: "points", ShadowMaterial: "shadow", SpriteMaterial: "sprite" };
  function U2(c) {
    return x.add(c), c === 0 ? "uv" : `uv${c}`;
  }
  function f(c, p, L3, k, G2) {
    let z2 = k.fog, K = G2.geometry, B2 = c.isMeshStandardMaterial ? k.environment : null, V2 = (c.isMeshStandardMaterial ? t : n).get(c.envMap || B2), J = V2 && V2.mapping === cc ? V2.image.height : null, xe3 = O[c.type];
    c.precision !== null && (R = l.getMaxPrecision(c.precision), R !== c.precision && E("WebGLProgram.getParameters:", c.precision, "not supported, using", R, "instead."));
    let ge3 = K.morphAttributes.position || K.morphAttributes.normal || K.morphAttributes.color, Ee3 = ge3 !== void 0 ? ge3.length : 0, Oe3 = 0;
    K.morphAttributes.position !== void 0 && (Oe3 = 1), K.morphAttributes.normal !== void 0 && (Oe3 = 2), K.morphAttributes.color !== void 0 && (Oe3 = 3);
    let we3, nt, je2, W3;
    if (xe3) {
      let Ve = Mt2[xe3];
      we3 = Ve.vertexShader, nt = Ve.fragmentShader;
    } else
      we3 = c.vertexShader, nt = c.fragmentShader, b.update(c), je2 = b.getVertexShaderID(c), W3 = b.getFragmentShaderID(c);
    let $ = e.getRenderTarget(), fe3 = e.state.buffers.depth.getReversed(), Ce3 = G2.isInstancedMesh === true, pe3 = G2.isBatchedMesh === true, Ne2 = !!c.map, lt2 = !!c.matcap, Ie2 = !!V2, He2 = !!c.aoMap, ze3 = !!c.lightMap, Le2 = !!c.bumpMap, rt = !!c.normalMap, m = !!c.displacementMap, at = !!c.emissiveMap, Ge2 = !!c.metalnessMap, qe2 = !!c.roughnessMap, me3 = c.anisotropy > 0, u = c.clearcoat > 0, r = c.dispersion > 0, v = c.iridescence > 0, H3 = c.sheen > 0, Y3 = c.transmission > 0, F = me3 && !!c.anisotropyMap, ve2 = u && !!c.clearcoatMap, te3 = u && !!c.clearcoatNormalMap, he3 = u && !!c.clearcoatRoughnessMap, Re3 = v && !!c.iridescenceMap, Q2 = v && !!c.iridescenceThicknessMap, ie3 = H3 && !!c.sheenColorMap, ue3 = H3 && !!c.sheenRoughnessMap, _e3 = !!c.specularMap, ne2 = !!c.specularColorMap, De3 = !!c.specularIntensityMap, _2 = Y3 && !!c.transmissionMap, se2 = Y3 && !!c.thicknessMap, j2 = !!c.gradientMap, le3 = !!c.alphaMap, Z2 = c.alphaTest > 0, X2 = !!c.alphaHash, ee3 = !!c.extensions, be3 = Kp;
    c.toneMapped && ($ === null || $.isXRRenderTarget === true) && (be3 = e.toneMapping);
    let Ke2 = { shaderID: xe3, shaderType: c.type, shaderName: c.name, vertexShader: we3, fragmentShader: nt, defines: c.defines, customVertexShaderID: je2, customFragmentShaderID: W3, isRawShaderMaterial: c.isRawShaderMaterial === true, glslVersion: c.glslVersion, precision: R, batching: pe3, batchingColor: pe3 && G2._colorsTexture !== null, instancing: Ce3, instancingColor: Ce3 && G2.instanceColor !== null, instancingMorph: Ce3 && G2.morphTexture !== null, outputColorSpace: $ === null ? e.outputColorSpace : $.isXRRenderTarget === true ? $.texture.colorSpace : Ma, alphaToCoverage: !!c.alphaToCoverage, map: Ne2, matcap: lt2, envMap: Ie2, envMapMode: Ie2 && V2.mapping, envMapCubeUVHeight: J, aoMap: He2, lightMap: ze3, bumpMap: Le2, normalMap: rt, displacementMap: m, emissiveMap: at, normalMapObjectSpace: rt && c.normalMapType === wf, normalMapTangentSpace: rt && c.normalMapType === Pi, metalnessMap: Ge2, roughnessMap: qe2, anisotropy: me3, anisotropyMap: F, clearcoat: u, clearcoatMap: ve2, clearcoatNormalMap: te3, clearcoatRoughnessMap: he3, dispersion: r, iridescence: v, iridescenceMap: Re3, iridescenceThicknessMap: Q2, sheen: H3, sheenColorMap: ie3, sheenRoughnessMap: ue3, specularMap: _e3, specularColorMap: ne2, specularIntensityMap: De3, transmission: Y3, transmissionMap: _2, thicknessMap: se2, gradientMap: j2, opaque: c.transparent === false && c.blending === ma && c.alphaToCoverage === false, alphaMap: le3, alphaTest: Z2, alphaHash: X2, combine: c.combine, mapUv: Ne2 && U2(c.map.channel), aoMapUv: He2 && U2(c.aoMap.channel), lightMapUv: ze3 && U2(c.lightMap.channel), bumpMapUv: Le2 && U2(c.bumpMap.channel), normalMapUv: rt && U2(c.normalMap.channel), displacementMapUv: m && U2(c.displacementMap.channel), emissiveMapUv: at && U2(c.emissiveMap.channel), metalnessMapUv: Ge2 && U2(c.metalnessMap.channel), roughnessMapUv: qe2 && U2(c.roughnessMap.channel), anisotropyMapUv: F && U2(c.anisotropyMap.channel), clearcoatMapUv: ve2 && U2(c.clearcoatMap.channel), clearcoatNormalMapUv: te3 && U2(c.clearcoatNormalMap.channel), clearcoatRoughnessMapUv: he3 && U2(c.clearcoatRoughnessMap.channel), iridescenceMapUv: Re3 && U2(c.iridescenceMap.channel), iridescenceThicknessMapUv: Q2 && U2(c.iridescenceThicknessMap.channel), sheenColorMapUv: ie3 && U2(c.sheenColorMap.channel), sheenRoughnessMapUv: ue3 && U2(c.sheenRoughnessMap.channel), specularMapUv: _e3 && U2(c.specularMap.channel), specularColorMapUv: ne2 && U2(c.specularColorMap.channel), specularIntensityMapUv: De3 && U2(c.specularIntensityMap.channel), transmissionMapUv: _2 && U2(c.transmissionMap.channel), thicknessMapUv: se2 && U2(c.thicknessMap.channel), alphaMapUv: le3 && U2(c.alphaMap.channel), vertexTangents: !!K.attributes.tangent && (rt || me3), vertexColors: c.vertexColors, vertexAlphas: c.vertexColors === true && !!K.attributes.color && K.attributes.color.itemSize === 4, pointsUvs: G2.isPoints === true && !!K.attributes.uv && (Ne2 || le3), fog: !!z2, useFog: c.fog === true, fogExp2: !!z2 && z2.isFogExp2, flatShading: c.flatShading === true && c.wireframe === false, sizeAttenuation: c.sizeAttenuation === true, logarithmicDepthBuffer: S, reversedDepthBuffer: fe3, skinning: G2.isSkinnedMesh === true, morphTargets: K.morphAttributes.position !== void 0, morphNormals: K.morphAttributes.normal !== void 0, morphColors: K.morphAttributes.color !== void 0, morphTargetsCount: Ee3, morphTextureStride: Oe3, numDirLights: p.directional.length, numPointLights: p.point.length, numSpotLights: p.spot.length, numSpotLightMaps: p.spotLightMap.length, numRectAreaLights: p.rectArea.length, numHemiLights: p.hemi.length, numDirLightShadows: p.directionalShadowMap.length, numPointLightShadows: p.pointShadowMap.length, numSpotLightShadows: p.spotShadowMap.length, numSpotLightShadowsWithMaps: p.numSpotLightShadowsWithMaps, numLightProbes: p.numLightProbes, numClippingPlanes: h36.numPlanes, numClipIntersection: h36.numIntersection, dithering: c.dithering, shadowMapEnabled: e.shadowMap.enabled && L3.length > 0, shadowMapType: e.shadowMap.type, toneMapping: be3, decodeVideoTexture: Ne2 && c.map.isVideoTexture === true && Ft.getTransfer(c.map.colorSpace) === Dn, decodeVideoTextureEmissive: at && c.emissiveMap.isVideoTexture === true && Ft.getTransfer(c.emissiveMap.colorSpace) === Dn, premultipliedAlpha: c.premultipliedAlpha, doubleSided: c.side === _p, flipSided: c.side === Ll, useDepthPacking: c.depthPacking >= 0, depthPacking: c.depthPacking || 0, index0AttributeName: c.index0AttributeName, extensionClipCullDistance: ee3 && c.extensions.clipCullDistance === true && i.has("WEBGL_clip_cull_distance"), extensionMultiDraw: (ee3 && c.extensions.multiDraw === true || pe3) && i.has("WEBGL_multi_draw"), rendererExtensionParallelShaderCompile: i.has("KHR_parallel_shader_compile"), customProgramCacheKey: c.customProgramCacheKey() };
    return Ke2.vertexUv1s = x.has(1), Ke2.vertexUv2s = x.has(2), Ke2.vertexUv3s = x.has(3), x.clear(), Ke2;
  }
  function o(c) {
    let p = [];
    if (c.shaderID ? p.push(c.shaderID) : (p.push(c.customVertexShaderID), p.push(c.customFragmentShaderID)), c.defines !== void 0)
      for (let L3 in c.defines)
        p.push(L3), p.push(c.defines[L3]);
    return c.isRawShaderMaterial === false && (P(p, c), M(p, c), p.push(e.outputColorSpace)), p.push(c.customProgramCacheKey), p.join();
  }
  function P(c, p) {
    c.push(p.precision), c.push(p.outputColorSpace), c.push(p.envMapMode), c.push(p.envMapCubeUVHeight), c.push(p.mapUv), c.push(p.alphaMapUv), c.push(p.lightMapUv), c.push(p.aoMapUv), c.push(p.bumpMapUv), c.push(p.normalMapUv), c.push(p.displacementMapUv), c.push(p.emissiveMapUv), c.push(p.metalnessMapUv), c.push(p.roughnessMapUv), c.push(p.anisotropyMapUv), c.push(p.clearcoatMapUv), c.push(p.clearcoatNormalMapUv), c.push(p.clearcoatRoughnessMapUv), c.push(p.iridescenceMapUv), c.push(p.iridescenceThicknessMapUv), c.push(p.sheenColorMapUv), c.push(p.sheenRoughnessMapUv), c.push(p.specularMapUv), c.push(p.specularColorMapUv), c.push(p.specularIntensityMapUv), c.push(p.transmissionMapUv), c.push(p.thicknessMapUv), c.push(p.combine), c.push(p.fogExp2), c.push(p.sizeAttenuation), c.push(p.morphTargetsCount), c.push(p.morphAttributeCount), c.push(p.numDirLights), c.push(p.numPointLights), c.push(p.numSpotLights), c.push(p.numSpotLightMaps), c.push(p.numHemiLights), c.push(p.numRectAreaLights), c.push(p.numDirLightShadows), c.push(p.numPointLightShadows), c.push(p.numSpotLightShadows), c.push(p.numSpotLightShadowsWithMaps), c.push(p.numLightProbes), c.push(p.shadowMapType), c.push(p.toneMapping), c.push(p.numClippingPlanes), c.push(p.numClipIntersection), c.push(p.depthPacking);
  }
  function M(c, p) {
    d.disableAll(), p.instancing && d.enable(0), p.instancingColor && d.enable(1), p.instancingMorph && d.enable(2), p.matcap && d.enable(3), p.envMap && d.enable(4), p.normalMapObjectSpace && d.enable(5), p.normalMapTangentSpace && d.enable(6), p.clearcoat && d.enable(7), p.iridescence && d.enable(8), p.alphaTest && d.enable(9), p.vertexColors && d.enable(10), p.vertexAlphas && d.enable(11), p.vertexUv1s && d.enable(12), p.vertexUv2s && d.enable(13), p.vertexUv3s && d.enable(14), p.vertexTangents && d.enable(15), p.anisotropy && d.enable(16), p.alphaHash && d.enable(17), p.batching && d.enable(18), p.dispersion && d.enable(19), p.batchingColor && d.enable(20), p.gradientMap && d.enable(21), c.push(d.mask), d.disableAll(), p.fog && d.enable(0), p.useFog && d.enable(1), p.flatShading && d.enable(2), p.logarithmicDepthBuffer && d.enable(3), p.reversedDepthBuffer && d.enable(4), p.skinning && d.enable(5), p.morphTargets && d.enable(6), p.morphNormals && d.enable(7), p.morphColors && d.enable(8), p.premultipliedAlpha && d.enable(9), p.shadowMapEnabled && d.enable(10), p.doubleSided && d.enable(11), p.flipSided && d.enable(12), p.useDepthPacking && d.enable(13), p.dithering && d.enable(14), p.transmission && d.enable(15), p.sheen && d.enable(16), p.opaque && d.enable(17), p.pointsUvs && d.enable(18), p.decodeVideoTexture && d.enable(19), p.decodeVideoTextureEmissive && d.enable(20), p.alphaToCoverage && d.enable(21), c.push(d.mask);
  }
  function A(c) {
    let p = O[c.type], L3;
    if (p) {
      let k = Mt2[p];
      L3 = um.clone(k.uniforms);
    } else
      L3 = c.uniforms;
    return L3;
  }
  function C(c, p) {
    let L3 = g2.get(p);
    return L3 !== void 0 ? ++L3.usedTimes : (L3 = new Gf2(e, p, c, a), w2.push(L3), g2.set(p, L3)), L3;
  }
  function T(c) {
    if (--c.usedTimes === 0) {
      let p = w2.indexOf(c);
      w2[p] = w2[w2.length - 1], w2.pop(), g2.delete(c.cacheKey), c.destroy();
    }
  }
  function N3(c) {
    b.remove(c);
  }
  function q3() {
    b.dispose();
  }
  return { getParameters: f, getProgramCacheKey: o, getUniforms: A, acquireProgram: C, releaseProgram: T, releaseShaderCache: N3, programs: w2, dispose: q3 };
}
function kf2() {
  let e = /* @__PURE__ */ new WeakMap();
  function n(h36) {
    return e.has(h36);
  }
  function t(h36) {
    let d = e.get(h36);
    return d === void 0 && (d = {}, e.set(h36, d)), d;
  }
  function i(h36) {
    e.delete(h36);
  }
  function l(h36, d, b) {
    e.get(h36)[d] = b;
  }
  function a() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return { has: n, get: t, remove: i, update: l, dispose: a };
}
function Wf2(e, n) {
  return e.groupOrder !== n.groupOrder ? e.groupOrder - n.groupOrder : e.renderOrder !== n.renderOrder ? e.renderOrder - n.renderOrder : e.material.id !== n.material.id ? e.material.id - n.material.id : e.z !== n.z ? e.z - n.z : e.id - n.id;
}
function Ar2(e, n) {
  return e.groupOrder !== n.groupOrder ? e.groupOrder - n.groupOrder : e.renderOrder !== n.renderOrder ? e.renderOrder - n.renderOrder : e.z !== n.z ? n.z - e.z : e.id - n.id;
}
function Rr2() {
  let e = [], n = 0, t = [], i = [], l = [];
  function a() {
    n = 0, t.length = 0, i.length = 0, l.length = 0;
  }
  function h36(g2, S, R, O, U2, f) {
    let o = e[n];
    return o === void 0 ? (o = { id: g2.id, object: g2, geometry: S, material: R, groupOrder: O, renderOrder: g2.renderOrder, z: U2, group: f }, e[n] = o) : (o.id = g2.id, o.object = g2, o.geometry = S, o.material = R, o.groupOrder = O, o.renderOrder = g2.renderOrder, o.z = U2, o.group = f), n++, o;
  }
  function d(g2, S, R, O, U2, f) {
    let o = h36(g2, S, R, O, U2, f);
    R.transmission > 0 ? i.push(o) : R.transparent === true ? l.push(o) : t.push(o);
  }
  function b(g2, S, R, O, U2, f) {
    let o = h36(g2, S, R, O, U2, f);
    R.transmission > 0 ? i.unshift(o) : R.transparent === true ? l.unshift(o) : t.unshift(o);
  }
  function x(g2, S) {
    t.length > 1 && t.sort(g2 || Wf2), i.length > 1 && i.sort(S || Ar2), l.length > 1 && l.sort(S || Ar2);
  }
  function w2() {
    for (let g2 = n, S = e.length; g2 < S; g2++) {
      let R = e[g2];
      if (R.id === null)
        break;
      R.id = null, R.object = null, R.geometry = null, R.material = null, R.group = null;
    }
  }
  return { opaque: t, transmissive: i, transparent: l, init: a, push: d, unshift: b, finish: w2, sort: x };
}
function zf2() {
  let e = /* @__PURE__ */ new WeakMap();
  function n(i, l) {
    let a = e.get(i), h36;
    return a === void 0 ? (h36 = new Rr2(), e.set(i, [h36])) : l >= a.length ? (h36 = new Rr2(), a.push(h36)) : h36 = a[l], h36;
  }
  function t() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return { get: n, dispose: t };
}
function Xf2() {
  let e = {};
  return { get: function(n) {
    if (e[n.id] !== void 0)
      return e[n.id];
    let t;
    switch (n.type) {
      case "DirectionalLight":
        t = { direction: new w(), color: new V() };
        break;
      case "SpotLight":
        t = { position: new w(), direction: new w(), color: new V(), distance: 0, coneCos: 0, penumbraCos: 0, decay: 0 };
        break;
      case "PointLight":
        t = { position: new w(), color: new V(), distance: 0, decay: 0 };
        break;
      case "HemisphereLight":
        t = { direction: new w(), skyColor: new V(), groundColor: new V() };
        break;
      case "RectAreaLight":
        t = { color: new V(), position: new w(), halfWidth: new w(), halfHeight: new w() };
        break;
    }
    return e[n.id] = t, t;
  } };
}
function Yf2() {
  let e = {};
  return { get: function(n) {
    if (e[n.id] !== void 0)
      return e[n.id];
    let t;
    switch (n.type) {
      case "DirectionalLight":
        t = { shadowIntensity: 1, shadowBias: 0, shadowNormalBias: 0, shadowRadius: 1, shadowMapSize: new I() };
        break;
      case "SpotLight":
        t = { shadowIntensity: 1, shadowBias: 0, shadowNormalBias: 0, shadowRadius: 1, shadowMapSize: new I() };
        break;
      case "PointLight":
        t = { shadowIntensity: 1, shadowBias: 0, shadowNormalBias: 0, shadowRadius: 1, shadowMapSize: new I(), shadowCameraNear: 1, shadowCameraFar: 1e3 };
        break;
    }
    return e[n.id] = t, t;
  } };
}
var qf2 = 0;
function Kf2(e, n) {
  return (n.castShadow ? 2 : 0) - (e.castShadow ? 2 : 0) + (n.map ? 1 : 0) - (e.map ? 1 : 0);
}
function $f2(e) {
  let n = new Xf2(), t = Yf2(), i = { version: 0, hash: { directionalLength: -1, pointLength: -1, spotLength: -1, rectAreaLength: -1, hemiLength: -1, numDirectionalShadows: -1, numPointShadows: -1, numSpotShadows: -1, numSpotMaps: -1, numLightProbes: -1 }, ambient: [0, 0, 0], probe: [], directional: [], directionalShadow: [], directionalShadowMap: [], directionalShadowMatrix: [], spot: [], spotLightMap: [], spotShadow: [], spotShadowMap: [], spotLightMatrix: [], rectArea: [], rectAreaLTC1: null, rectAreaLTC2: null, point: [], pointShadow: [], pointShadowMap: [], pointShadowMatrix: [], hemi: [], numSpotLightShadowsWithMaps: 0, numLightProbes: 0 };
  for (let x = 0; x < 9; x++)
    i.probe.push(new w());
  let l = new w(), a = new U(), h36 = new U();
  function d(x) {
    let w2 = 0, g2 = 0, S = 0;
    for (let c = 0; c < 9; c++)
      i.probe[c].set(0, 0, 0);
    let R = 0, O = 0, U2 = 0, f = 0, o = 0, P = 0, M = 0, A = 0, C = 0, T = 0, N3 = 0;
    x.sort(Kf2);
    for (let c = 0, p = x.length; c < p; c++) {
      let L3 = x[c], k = L3.color, G2 = L3.intensity, z2 = L3.distance, K = null;
      if (L3.shadow && L3.shadow.map && (L3.shadow.map.texture.format === Tc ? K = L3.shadow.map.texture : K = L3.shadow.map.depthTexture || L3.shadow.map.texture), L3.isAmbientLight)
        w2 += k.r * G2, g2 += k.g * G2, S += k.b * G2;
      else if (L3.isLightProbe) {
        for (let B2 = 0; B2 < 9; B2++)
          i.probe[B2].addScaledVector(L3.sh.coefficients[B2], G2);
        N3++;
      } else if (L3.isDirectionalLight) {
        let B2 = n.get(L3);
        if (B2.color.copy(L3.color).multiplyScalar(L3.intensity), L3.castShadow) {
          let V2 = L3.shadow, J = t.get(L3);
          J.shadowIntensity = V2.intensity, J.shadowBias = V2.bias, J.shadowNormalBias = V2.normalBias, J.shadowRadius = V2.radius, J.shadowMapSize = V2.mapSize, i.directionalShadow[R] = J, i.directionalShadowMap[R] = K, i.directionalShadowMatrix[R] = L3.shadow.matrix, P++;
        }
        i.directional[R] = B2, R++;
      } else if (L3.isSpotLight) {
        let B2 = n.get(L3);
        B2.position.setFromMatrixPosition(L3.matrixWorld), B2.color.copy(k).multiplyScalar(G2), B2.distance = z2, B2.coneCos = Math.cos(L3.angle), B2.penumbraCos = Math.cos(L3.angle * (1 - L3.penumbra)), B2.decay = L3.decay, i.spot[U2] = B2;
        let V2 = L3.shadow;
        if (L3.map && (i.spotLightMap[C] = L3.map, C++, V2.updateMatrices(L3), L3.castShadow && T++), i.spotLightMatrix[U2] = V2.matrix, L3.castShadow) {
          let J = t.get(L3);
          J.shadowIntensity = V2.intensity, J.shadowBias = V2.bias, J.shadowNormalBias = V2.normalBias, J.shadowRadius = V2.radius, J.shadowMapSize = V2.mapSize, i.spotShadow[U2] = J, i.spotShadowMap[U2] = K, A++;
        }
        U2++;
      } else if (L3.isRectAreaLight) {
        let B2 = n.get(L3);
        B2.color.copy(k).multiplyScalar(G2), B2.halfWidth.set(L3.width * 0.5, 0, 0), B2.halfHeight.set(0, L3.height * 0.5, 0), i.rectArea[f] = B2, f++;
      } else if (L3.isPointLight) {
        let B2 = n.get(L3);
        if (B2.color.copy(L3.color).multiplyScalar(L3.intensity), B2.distance = L3.distance, B2.decay = L3.decay, L3.castShadow) {
          let V2 = L3.shadow, J = t.get(L3);
          J.shadowIntensity = V2.intensity, J.shadowBias = V2.bias, J.shadowNormalBias = V2.normalBias, J.shadowRadius = V2.radius, J.shadowMapSize = V2.mapSize, J.shadowCameraNear = V2.camera.near, J.shadowCameraFar = V2.camera.far, i.pointShadow[O] = J, i.pointShadowMap[O] = K, i.pointShadowMatrix[O] = L3.shadow.matrix, M++;
        }
        i.point[O] = B2, O++;
      } else if (L3.isHemisphereLight) {
        let B2 = n.get(L3);
        B2.skyColor.copy(L3.color).multiplyScalar(G2), B2.groundColor.copy(L3.groundColor).multiplyScalar(G2), i.hemi[o] = B2, o++;
      }
    }
    f > 0 && (e.has("OES_texture_float_linear") === true ? (i.rectAreaLTC1 = ae2.LTC_FLOAT_1, i.rectAreaLTC2 = ae2.LTC_FLOAT_2) : (i.rectAreaLTC1 = ae2.LTC_HALF_1, i.rectAreaLTC2 = ae2.LTC_HALF_2)), i.ambient[0] = w2, i.ambient[1] = g2, i.ambient[2] = S;
    let q3 = i.hash;
    (q3.directionalLength !== R || q3.pointLength !== O || q3.spotLength !== U2 || q3.rectAreaLength !== f || q3.hemiLength !== o || q3.numDirectionalShadows !== P || q3.numPointShadows !== M || q3.numSpotShadows !== A || q3.numSpotMaps !== C || q3.numLightProbes !== N3) && (i.directional.length = R, i.spot.length = U2, i.rectArea.length = f, i.point.length = O, i.hemi.length = o, i.directionalShadow.length = P, i.directionalShadowMap.length = P, i.pointShadow.length = M, i.pointShadowMap.length = M, i.spotShadow.length = A, i.spotShadowMap.length = A, i.directionalShadowMatrix.length = P, i.pointShadowMatrix.length = M, i.spotLightMatrix.length = A + C - T, i.spotLightMap.length = C, i.numSpotLightShadowsWithMaps = T, i.numLightProbes = N3, q3.directionalLength = R, q3.pointLength = O, q3.spotLength = U2, q3.rectAreaLength = f, q3.hemiLength = o, q3.numDirectionalShadows = P, q3.numPointShadows = M, q3.numSpotShadows = A, q3.numSpotMaps = C, q3.numLightProbes = N3, i.version = qf2++);
  }
  function b(x, w2) {
    let g2 = 0, S = 0, R = 0, O = 0, U2 = 0, f = w2.matrixWorldInverse;
    for (let o = 0, P = x.length; o < P; o++) {
      let M = x[o];
      if (M.isDirectionalLight) {
        let A = i.directional[g2];
        A.direction.setFromMatrixPosition(M.matrixWorld), l.setFromMatrixPosition(M.target.matrixWorld), A.direction.sub(l), A.direction.transformDirection(f), g2++;
      } else if (M.isSpotLight) {
        let A = i.spot[R];
        A.position.setFromMatrixPosition(M.matrixWorld), A.position.applyMatrix4(f), A.direction.setFromMatrixPosition(M.matrixWorld), l.setFromMatrixPosition(M.target.matrixWorld), A.direction.sub(l), A.direction.transformDirection(f), R++;
      } else if (M.isRectAreaLight) {
        let A = i.rectArea[O];
        A.position.setFromMatrixPosition(M.matrixWorld), A.position.applyMatrix4(f), h36.identity(), a.copy(M.matrixWorld), a.premultiply(f), h36.extractRotation(a), A.halfWidth.set(M.width * 0.5, 0, 0), A.halfHeight.set(0, M.height * 0.5, 0), A.halfWidth.applyMatrix4(h36), A.halfHeight.applyMatrix4(h36), O++;
      } else if (M.isPointLight) {
        let A = i.point[S];
        A.position.setFromMatrixPosition(M.matrixWorld), A.position.applyMatrix4(f), S++;
      } else if (M.isHemisphereLight) {
        let A = i.hemi[U2];
        A.direction.setFromMatrixPosition(M.matrixWorld), A.direction.transformDirection(f), U2++;
      }
    }
  }
  return { setup: d, setupView: b, state: i };
}
function br2(e) {
  let n = new $f2(e), t = [], i = [];
  function l(w2) {
    x.camera = w2, t.length = 0, i.length = 0;
  }
  function a(w2) {
    t.push(w2);
  }
  function h36(w2) {
    i.push(w2);
  }
  function d() {
    n.setup(t);
  }
  function b(w2) {
    n.setupView(t, w2);
  }
  let x = { lightsArray: t, shadowsArray: i, camera: null, lights: n, transmissionRenderTarget: {} };
  return { init: l, state: x, setupLights: d, setupLightsView: b, pushLight: a, pushShadow: h36 };
}
function Zf2(e) {
  let n = /* @__PURE__ */ new WeakMap();
  function t(l, a = 0) {
    let h36 = n.get(l), d;
    return h36 === void 0 ? (d = new br2(e), n.set(l, [d])) : a >= h36.length ? (d = new br2(e), h36.push(d)) : d = h36[a], d;
  }
  function i() {
    n = /* @__PURE__ */ new WeakMap();
  }
  return { get: t, dispose: i };
}
var Qf2 = `void main() {
	gl_Position = vec4( position, 1.0 );
}`;
var Jf2 = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`;
var jf2 = [new w(1, 0, 0), new w(-1, 0, 0), new w(0, 1, 0), new w(0, -1, 0), new w(0, 0, 1), new w(0, 0, -1)];
var ed2 = [new w(0, -1, 0), new w(0, -1, 0), new w(0, 0, 1), new w(0, 0, -1), new w(0, -1, 0), new w(0, -1, 0)];
var Cr2 = new U();
var en = new w();
var Vn2 = new w();
function td2(e, n, t) {
  let i = new rs(), l = new I(), a = new I(), h36 = new Dt(), d = new To(), b = new Io(), x = {}, w2 = t.maxTextureSize, g2 = { [vr]: Ll, [Ll]: vr, [_p]: _p }, S = new es({ defines: { VSM_SAMPLES: 8 }, uniforms: { shadow_pass: { value: null }, resolution: { value: new I() }, radius: { value: 4 } }, vertexShader: Qf2, fragmentShader: Jf2 }), R = S.clone();
  R.defines.HORIZONTAL_PASS = 1;
  let O = new q();
  O.setAttribute("position", new j(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3));
  let U2 = new Pt(O, S), f = this;
  this.enabled = false, this.autoUpdate = true, this.needsUpdate = false, this.type = bp;
  let o = this.type;
  this.render = function(T, N3, q3) {
    if (f.enabled === false || f.autoUpdate === false && f.needsUpdate === false || T.length === 0)
      return;
    T.type === wp && (E("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."), T.type = bp);
    let c = e.getRenderTarget(), p = e.getActiveCubeFace(), L3 = e.getActiveMipmapLevel(), k = e.state;
    k.setBlending(rc), k.buffers.depth.getReversed() === true ? k.buffers.color.setClear(0, 0, 0, 0) : k.buffers.color.setClear(1, 1, 1, 1), k.buffers.depth.setTest(true), k.setScissorTest(false);
    let G2 = o !== this.type;
    G2 && N3.traverse(function(z2) {
      z2.material && (Array.isArray(z2.material) ? z2.material.forEach((K) => K.needsUpdate = true) : z2.material.needsUpdate = true);
    });
    for (let z2 = 0, K = T.length; z2 < K; z2++) {
      let B2 = T[z2], V2 = B2.shadow;
      if (V2 === void 0) {
        E("WebGLShadowMap:", B2, "has no shadow.");
        continue;
      }
      if (V2.autoUpdate === false && V2.needsUpdate === false)
        continue;
      l.copy(V2.mapSize);
      let J = V2.getFrameExtents();
      if (l.multiply(J), a.copy(V2.mapSize), (l.x > w2 || l.y > w2) && (l.x > w2 && (a.x = Math.floor(w2 / J.x), l.x = a.x * J.x, V2.mapSize.x = a.x), l.y > w2 && (a.y = Math.floor(w2 / J.y), l.y = a.y * J.y, V2.mapSize.y = a.y)), V2.map === null || G2 === true) {
        if (V2.map !== null && (V2.map.depthTexture !== null && (V2.map.depthTexture.dispose(), V2.map.depthTexture = null), V2.map.dispose()), this.type === Mp) {
          if (B2.isPointLight) {
            E("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");
            continue;
          }
          V2.map = new ts(l.x, l.y, { format: Tc, type: xc, minFilter: Vt, magFilter: Vt, generateMipmaps: false }), V2.map.texture.name = B2.name + ".shadowMap", V2.map.depthTexture = new Zr(l.x, l.y, Si), V2.map.depthTexture.name = B2.name + ".shadowMapDepth", V2.map.depthTexture.format = Tr, V2.map.depthTexture.compareFunction = null, V2.map.depthTexture.minFilter = kt, V2.map.depthTexture.magFilter = kt;
        } else {
          B2.isPointLight ? (V2.map = new Ka(l.x), V2.map.depthTexture = new Ah(l.x, En)) : (V2.map = new ts(l.x, l.y), V2.map.depthTexture = new Zr(l.x, l.y, En)), V2.map.depthTexture.name = B2.name + ".shadowMap", V2.map.depthTexture.format = Tr;
          let ge3 = e.state.buffers.depth.getReversed();
          this.type === bp ? (V2.map.depthTexture.compareFunction = ge3 ? Jf : Uf, V2.map.depthTexture.minFilter = Vt, V2.map.depthTexture.magFilter = Vt) : (V2.map.depthTexture.compareFunction = null, V2.map.depthTexture.minFilter = kt, V2.map.depthTexture.magFilter = kt);
        }
        V2.camera.updateProjectionMatrix();
      }
      let xe3 = V2.map.isWebGLCubeRenderTarget ? 6 : 1;
      for (let ge3 = 0; ge3 < xe3; ge3++) {
        if (V2.map.isWebGLCubeRenderTarget)
          e.setRenderTarget(V2.map, ge3), e.clear();
        else {
          ge3 === 0 && (e.setRenderTarget(V2.map), e.clear());
          let Ee3 = V2.getViewport(ge3);
          h36.set(a.x * Ee3.x, a.y * Ee3.y, a.x * Ee3.z, a.y * Ee3.w), k.viewport(h36);
        }
        if (B2.isPointLight) {
          let Ee3 = V2.camera, Oe3 = V2.matrix, we3 = B2.distance || Ee3.far;
          we3 !== Ee3.far && (Ee3.far = we3, Ee3.updateProjectionMatrix()), en.setFromMatrixPosition(B2.matrixWorld), Ee3.position.copy(en), Vn2.copy(Ee3.position), Vn2.add(jf2[ge3]), Ee3.up.copy(ed2[ge3]), Ee3.lookAt(Vn2), Ee3.updateMatrixWorld(), Oe3.makeTranslation(-en.x, -en.y, -en.z), Cr2.multiplyMatrices(Ee3.projectionMatrix, Ee3.matrixWorldInverse), V2._frustum.setFromProjectionMatrix(Cr2, Ee3.coordinateSystem, Ee3.reversedDepth);
        } else
          V2.updateMatrices(B2);
        i = V2.getFrustum(), A(N3, q3, V2.camera, B2, this.type);
      }
      V2.isPointLightShadow !== true && this.type === Mp && P(V2, q3), V2.needsUpdate = false;
    }
    o = this.type, f.needsUpdate = false, e.setRenderTarget(c, p, L3);
  };
  function P(T, N3) {
    let q3 = n.update(U2);
    S.defines.VSM_SAMPLES !== T.blurSamples && (S.defines.VSM_SAMPLES = T.blurSamples, R.defines.VSM_SAMPLES = T.blurSamples, S.needsUpdate = true, R.needsUpdate = true), T.mapPass === null && (T.mapPass = new ts(l.x, l.y, { format: Tc, type: xc })), S.uniforms.shadow_pass.value = T.map.depthTexture, S.uniforms.resolution.value = T.mapSize, S.uniforms.radius.value = T.radius, e.setRenderTarget(T.mapPass), e.clear(), e.renderBufferDirect(N3, null, q3, S, U2, null), R.uniforms.shadow_pass.value = T.mapPass.texture, R.uniforms.resolution.value = T.mapSize, R.uniforms.radius.value = T.radius, e.setRenderTarget(T.map), e.clear(), e.renderBufferDirect(N3, null, q3, R, U2, null);
  }
  function M(T, N3, q3, c) {
    let p = null, L3 = q3.isPointLight === true ? T.customDistanceMaterial : T.customDepthMaterial;
    if (L3 !== void 0)
      p = L3;
    else if (p = q3.isPointLight === true ? b : d, e.localClippingEnabled && N3.clipShadows === true && Array.isArray(N3.clippingPlanes) && N3.clippingPlanes.length !== 0 || N3.displacementMap && N3.displacementScale !== 0 || N3.alphaMap && N3.alphaTest > 0 || N3.map && N3.alphaTest > 0 || N3.alphaToCoverage === true) {
      let k = p.uuid, G2 = N3.uuid, z2 = x[k];
      z2 === void 0 && (z2 = {}, x[k] = z2);
      let K = z2[G2];
      K === void 0 && (K = p.clone(), z2[G2] = K, N3.addEventListener("dispose", C)), p = K;
    }
    if (p.visible = N3.visible, p.wireframe = N3.wireframe, c === Mp ? p.side = N3.shadowSide !== null ? N3.shadowSide : N3.side : p.side = N3.shadowSide !== null ? N3.shadowSide : g2[N3.side], p.alphaMap = N3.alphaMap, p.alphaTest = N3.alphaToCoverage === true ? 0.5 : N3.alphaTest, p.map = N3.map, p.clipShadows = N3.clipShadows, p.clippingPlanes = N3.clippingPlanes, p.clipIntersection = N3.clipIntersection, p.displacementMap = N3.displacementMap, p.displacementScale = N3.displacementScale, p.displacementBias = N3.displacementBias, p.wireframeLinewidth = N3.wireframeLinewidth, p.linewidth = N3.linewidth, q3.isPointLight === true && p.isMeshDistanceMaterial === true) {
      let k = e.properties.get(p);
      k.light = q3;
    }
    return p;
  }
  function A(T, N3, q3, c, p) {
    if (T.visible === false)
      return;
    if (T.layers.test(N3.layers) && (T.isMesh || T.isLine || T.isPoints) && (T.castShadow || T.receiveShadow && p === Mp) && (!T.frustumCulled || i.intersectsObject(T))) {
      T.modelViewMatrix.multiplyMatrices(q3.matrixWorldInverse, T.matrixWorld);
      let G2 = n.update(T), z2 = T.material;
      if (Array.isArray(z2)) {
        let K = G2.groups;
        for (let B2 = 0, V2 = K.length; B2 < V2; B2++) {
          let J = K[B2], xe3 = z2[J.materialIndex];
          if (xe3 && xe3.visible) {
            let ge3 = M(T, xe3, c, p);
            T.onBeforeShadow(e, T, N3, q3, G2, ge3, J), e.renderBufferDirect(q3, null, G2, ge3, T, J), T.onAfterShadow(e, T, N3, q3, G2, ge3, J);
          }
        }
      } else if (z2.visible) {
        let K = M(T, z2, c, p);
        T.onBeforeShadow(e, T, N3, q3, G2, K, null), e.renderBufferDirect(q3, null, G2, K, T, null), T.onAfterShadow(e, T, N3, q3, G2, K, null);
      }
    }
    let k = T.children;
    for (let G2 = 0, z2 = k.length; G2 < z2; G2++)
      A(k[G2], N3, q3, c, p);
  }
  function C(T) {
    T.target.removeEventListener("dispose", C);
    for (let q3 in x) {
      let c = x[q3], p = T.target.uuid;
      p in c && (c[p].dispose(), delete c[p]);
    }
  }
}
var nd2 = { [Jp]: Gp, [Xp]: Yp, [Hp]: $p, [ba]: Zp, [Gp]: Jp, [Yp]: Xp, [$p]: Hp, [Zp]: ba };
function id2(e, n) {
  function t() {
    let _2 = false, se2 = new Dt(), j2 = null, le3 = new Dt(0, 0, 0, 0);
    return { setMask: function(Z2) {
      j2 !== Z2 && !_2 && (e.colorMask(Z2, Z2, Z2, Z2), j2 = Z2);
    }, setLocked: function(Z2) {
      _2 = Z2;
    }, setClear: function(Z2, X2, ee3, be3, Ke2) {
      Ke2 === true && (Z2 *= be3, X2 *= be3, ee3 *= be3), se2.set(Z2, X2, ee3, be3), le3.equals(se2) === false && (e.clearColor(Z2, X2, ee3, be3), le3.copy(se2));
    }, reset: function() {
      _2 = false, j2 = null, le3.set(-1, 0, 0, 0);
    } };
  }
  function i() {
    let _2 = false, se2 = false, j2 = null, le3 = null, Z2 = null;
    return { setReversed: function(X2) {
      if (se2 !== X2) {
        let ee3 = n.get("EXT_clip_control");
        X2 ? ee3.clipControlEXT(ee3.LOWER_LEFT_EXT, ee3.ZERO_TO_ONE_EXT) : ee3.clipControlEXT(ee3.LOWER_LEFT_EXT, ee3.NEGATIVE_ONE_TO_ONE_EXT), se2 = X2;
        let be3 = Z2;
        Z2 = null, this.setClear(be3);
      }
    }, getReversed: function() {
      return se2;
    }, setTest: function(X2) {
      X2 ? $(e.DEPTH_TEST) : fe3(e.DEPTH_TEST);
    }, setMask: function(X2) {
      j2 !== X2 && !_2 && (e.depthMask(X2), j2 = X2);
    }, setFunc: function(X2) {
      if (se2 && (X2 = nd2[X2]), le3 !== X2) {
        switch (X2) {
          case Jp:
            e.depthFunc(e.NEVER);
            break;
          case Gp:
            e.depthFunc(e.ALWAYS);
            break;
          case Xp:
            e.depthFunc(e.LESS);
            break;
          case ba:
            e.depthFunc(e.LEQUAL);
            break;
          case Hp:
            e.depthFunc(e.EQUAL);
            break;
          case Zp:
            e.depthFunc(e.GEQUAL);
            break;
          case Yp:
            e.depthFunc(e.GREATER);
            break;
          case $p:
            e.depthFunc(e.NOTEQUAL);
            break;
          default:
            e.depthFunc(e.LEQUAL);
        }
        le3 = X2;
      }
    }, setLocked: function(X2) {
      _2 = X2;
    }, setClear: function(X2) {
      Z2 !== X2 && (se2 && (X2 = 1 - X2), e.clearDepth(X2), Z2 = X2);
    }, reset: function() {
      _2 = false, j2 = null, le3 = null, Z2 = null, se2 = false;
    } };
  }
  function l() {
    let _2 = false, se2 = null, j2 = null, le3 = null, Z2 = null, X2 = null, ee3 = null, be3 = null, Ke2 = null;
    return { setTest: function(Ve) {
      _2 || (Ve ? $(e.STENCIL_TEST) : fe3(e.STENCIL_TEST));
    }, setMask: function(Ve) {
      se2 !== Ve && !_2 && (e.stencilMask(Ve), se2 = Ve);
    }, setFunc: function(Ve, Et2, Rt2) {
      (j2 !== Ve || le3 !== Et2 || Z2 !== Rt2) && (e.stencilFunc(Ve, Et2, Rt2), j2 = Ve, le3 = Et2, Z2 = Rt2);
    }, setOp: function(Ve, Et2, Rt2) {
      (X2 !== Ve || ee3 !== Et2 || be3 !== Rt2) && (e.stencilOp(Ve, Et2, Rt2), X2 = Ve, ee3 = Et2, be3 = Rt2);
    }, setLocked: function(Ve) {
      _2 = Ve;
    }, setClear: function(Ve) {
      Ke2 !== Ve && (e.clearStencil(Ve), Ke2 = Ve);
    }, reset: function() {
      _2 = false, se2 = null, j2 = null, le3 = null, Z2 = null, X2 = null, ee3 = null, be3 = null, Ke2 = null;
    } };
  }
  let a = new t(), h36 = new i(), d = new l(), b = /* @__PURE__ */ new WeakMap(), x = /* @__PURE__ */ new WeakMap(), w2 = {}, g2 = {}, S = /* @__PURE__ */ new WeakMap(), R = [], O = null, U2 = false, f = null, o = null, P = null, M = null, A = null, C = null, T = null, N3 = new V(0, 0, 0), q3 = 0, c = false, p = null, L3 = null, k = null, G2 = null, z2 = null, K = e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS), B2 = false, V2 = 0, J = e.getParameter(e.VERSION);
  J.indexOf("WebGL") !== -1 ? (V2 = parseFloat(/^WebGL (\d)/.exec(J)[1]), B2 = V2 >= 1) : J.indexOf("OpenGL ES") !== -1 && (V2 = parseFloat(/^OpenGL ES (\d)/.exec(J)[1]), B2 = V2 >= 2);
  let xe3 = null, ge3 = {}, Ee3 = e.getParameter(e.SCISSOR_BOX), Oe3 = e.getParameter(e.VIEWPORT), we3 = new Dt().fromArray(Ee3), nt = new Dt().fromArray(Oe3);
  function je2(_2, se2, j2, le3) {
    let Z2 = new Uint8Array(4), X2 = e.createTexture();
    e.bindTexture(_2, X2), e.texParameteri(_2, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(_2, e.TEXTURE_MAG_FILTER, e.NEAREST);
    for (let ee3 = 0; ee3 < j2; ee3++)
      _2 === e.TEXTURE_3D || _2 === e.TEXTURE_2D_ARRAY ? e.texImage3D(se2, 0, e.RGBA, 1, 1, le3, 0, e.RGBA, e.UNSIGNED_BYTE, Z2) : e.texImage2D(se2 + ee3, 0, e.RGBA, 1, 1, 0, e.RGBA, e.UNSIGNED_BYTE, Z2);
    return X2;
  }
  let W3 = {};
  W3[e.TEXTURE_2D] = je2(e.TEXTURE_2D, e.TEXTURE_2D, 1), W3[e.TEXTURE_CUBE_MAP] = je2(e.TEXTURE_CUBE_MAP, e.TEXTURE_CUBE_MAP_POSITIVE_X, 6), W3[e.TEXTURE_2D_ARRAY] = je2(e.TEXTURE_2D_ARRAY, e.TEXTURE_2D_ARRAY, 1, 1), W3[e.TEXTURE_3D] = je2(e.TEXTURE_3D, e.TEXTURE_3D, 1, 1), a.setClear(0, 0, 0, 1), h36.setClear(1), d.setClear(0), $(e.DEPTH_TEST), h36.setFunc(ba), Le2(false), rt(mp), $(e.CULL_FACE), He2(rc);
  function $(_2) {
    w2[_2] !== true && (e.enable(_2), w2[_2] = true);
  }
  function fe3(_2) {
    w2[_2] !== false && (e.disable(_2), w2[_2] = false);
  }
  function Ce3(_2, se2) {
    return g2[_2] !== se2 ? (e.bindFramebuffer(_2, se2), g2[_2] = se2, _2 === e.DRAW_FRAMEBUFFER && (g2[e.FRAMEBUFFER] = se2), _2 === e.FRAMEBUFFER && (g2[e.DRAW_FRAMEBUFFER] = se2), true) : false;
  }
  function pe3(_2, se2) {
    let j2 = R, le3 = false;
    if (_2) {
      j2 = S.get(se2), j2 === void 0 && (j2 = [], S.set(se2, j2));
      let Z2 = _2.textures;
      if (j2.length !== Z2.length || j2[0] !== e.COLOR_ATTACHMENT0) {
        for (let X2 = 0, ee3 = Z2.length; X2 < ee3; X2++)
          j2[X2] = e.COLOR_ATTACHMENT0 + X2;
        j2.length = Z2.length, le3 = true;
      }
    } else
      j2[0] !== e.BACK && (j2[0] = e.BACK, le3 = true);
    le3 && e.drawBuffers(j2);
  }
  function Ne2(_2) {
    return O !== _2 ? (e.useProgram(_2), O = _2, true) : false;
  }
  let lt2 = { [ya]: e.FUNC_ADD, [Ip]: e.FUNC_SUBTRACT, [Cp]: e.FUNC_REVERSE_SUBTRACT };
  lt2[zp] = e.MIN, lt2[Fp] = e.MAX;
  let Ie2 = { [Bp]: e.ZERO, [kp]: e.ONE, [Pp]: e.SRC_COLOR, [ga]: e.SRC_ALPHA, [Dp]: e.SRC_ALPHA_SATURATE, [Np]: e.DST_COLOR, [Op]: e.DST_ALPHA, [Rp]: e.ONE_MINUS_SRC_COLOR, [xa]: e.ONE_MINUS_SRC_ALPHA, [Vp]: e.ONE_MINUS_DST_COLOR, [Ep]: e.ONE_MINUS_DST_ALPHA, [Lp]: e.CONSTANT_COLOR, [Up]: e.ONE_MINUS_CONSTANT_COLOR, [Wp]: e.CONSTANT_ALPHA, [qp]: e.ONE_MINUS_CONSTANT_ALPHA };
  function He2(_2, se2, j2, le3, Z2, X2, ee3, be3, Ke2, Ve) {
    if (_2 === rc) {
      U2 === true && (fe3(e.BLEND), U2 = false);
      return;
    }
    if (U2 === false && ($(e.BLEND), U2 = true), _2 !== Tp) {
      if (_2 !== f || Ve !== c) {
        if ((o !== ya || A !== ya) && (e.blendEquation(e.FUNC_ADD), o = ya, A = ya), Ve)
          switch (_2) {
            case ma:
              e.blendFuncSeparate(e.ONE, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
              break;
            case vp:
              e.blendFunc(e.ONE, e.ONE);
              break;
            case Sp:
              e.blendFuncSeparate(e.ZERO, e.ONE_MINUS_SRC_COLOR, e.ZERO, e.ONE);
              break;
            case Ap:
              e.blendFuncSeparate(e.DST_COLOR, e.ONE_MINUS_SRC_ALPHA, e.ZERO, e.ONE);
              break;
            default:
              X("WebGLState: Invalid blending: ", _2);
              break;
          }
        else
          switch (_2) {
            case ma:
              e.blendFuncSeparate(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
              break;
            case vp:
              e.blendFuncSeparate(e.SRC_ALPHA, e.ONE, e.ONE, e.ONE);
              break;
            case Sp:
              X("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
              break;
            case Ap:
              X("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
              break;
            default:
              X("WebGLState: Invalid blending: ", _2);
              break;
          }
        P = null, M = null, C = null, T = null, N3.set(0, 0, 0), q3 = 0, f = _2, c = Ve;
      }
      return;
    }
    Z2 = Z2 || se2, X2 = X2 || j2, ee3 = ee3 || le3, (se2 !== o || Z2 !== A) && (e.blendEquationSeparate(lt2[se2], lt2[Z2]), o = se2, A = Z2), (j2 !== P || le3 !== M || X2 !== C || ee3 !== T) && (e.blendFuncSeparate(Ie2[j2], Ie2[le3], Ie2[X2], Ie2[ee3]), P = j2, M = le3, C = X2, T = ee3), (be3.equals(N3) === false || Ke2 !== q3) && (e.blendColor(be3.r, be3.g, be3.b, Ke2), N3.copy(be3), q3 = Ke2), f = _2, c = false;
  }
  function ze3(_2, se2) {
    _2.side === _p ? fe3(e.CULL_FACE) : $(e.CULL_FACE);
    let j2 = _2.side === Ll;
    se2 && (j2 = !j2), Le2(j2), _2.blending === ma && _2.transparent === false ? He2(rc) : He2(_2.blending, _2.blendEquation, _2.blendSrc, _2.blendDst, _2.blendEquationAlpha, _2.blendSrcAlpha, _2.blendDstAlpha, _2.blendColor, _2.blendAlpha, _2.premultipliedAlpha), h36.setFunc(_2.depthFunc), h36.setTest(_2.depthTest), h36.setMask(_2.depthWrite), a.setMask(_2.colorWrite);
    let le3 = _2.stencilWrite;
    d.setTest(le3), le3 && (d.setMask(_2.stencilWriteMask), d.setFunc(_2.stencilFunc, _2.stencilRef, _2.stencilFuncMask), d.setOp(_2.stencilFail, _2.stencilZFail, _2.stencilZPass)), at(_2.polygonOffset, _2.polygonOffsetFactor, _2.polygonOffsetUnits), _2.alphaToCoverage === true ? $(e.SAMPLE_ALPHA_TO_COVERAGE) : fe3(e.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Le2(_2) {
    p !== _2 && (_2 ? e.frontFace(e.CW) : e.frontFace(e.CCW), p = _2);
  }
  function rt(_2) {
    _2 !== fp ? ($(e.CULL_FACE), _2 !== L3 && (_2 === mp ? e.cullFace(e.BACK) : _2 === yp ? e.cullFace(e.FRONT) : e.cullFace(e.FRONT_AND_BACK))) : fe3(e.CULL_FACE), L3 = _2;
  }
  function m(_2) {
    _2 !== k && (B2 && e.lineWidth(_2), k = _2);
  }
  function at(_2, se2, j2) {
    _2 ? ($(e.POLYGON_OFFSET_FILL), (G2 !== se2 || z2 !== j2) && (e.polygonOffset(se2, j2), G2 = se2, z2 = j2)) : fe3(e.POLYGON_OFFSET_FILL);
  }
  function Ge2(_2) {
    _2 ? $(e.SCISSOR_TEST) : fe3(e.SCISSOR_TEST);
  }
  function qe2(_2) {
    _2 === void 0 && (_2 = e.TEXTURE0 + K - 1), xe3 !== _2 && (e.activeTexture(_2), xe3 = _2);
  }
  function me3(_2, se2, j2) {
    j2 === void 0 && (xe3 === null ? j2 = e.TEXTURE0 + K - 1 : j2 = xe3);
    let le3 = ge3[j2];
    le3 === void 0 && (le3 = { type: void 0, texture: void 0 }, ge3[j2] = le3), (le3.type !== _2 || le3.texture !== se2) && (xe3 !== j2 && (e.activeTexture(j2), xe3 = j2), e.bindTexture(_2, se2 || W3[_2]), le3.type = _2, le3.texture = se2);
  }
  function u() {
    let _2 = ge3[xe3];
    _2 !== void 0 && _2.type !== void 0 && (e.bindTexture(_2.type, null), _2.type = void 0, _2.texture = void 0);
  }
  function r() {
    try {
      e.compressedTexImage2D(...arguments);
    } catch (_2) {
      X("WebGLState:", _2);
    }
  }
  function v() {
    try {
      e.compressedTexImage3D(...arguments);
    } catch (_2) {
      X("WebGLState:", _2);
    }
  }
  function H3() {
    try {
      e.texSubImage2D(...arguments);
    } catch (_2) {
      X("WebGLState:", _2);
    }
  }
  function Y3() {
    try {
      e.texSubImage3D(...arguments);
    } catch (_2) {
      X("WebGLState:", _2);
    }
  }
  function F() {
    try {
      e.compressedTexSubImage2D(...arguments);
    } catch (_2) {
      X("WebGLState:", _2);
    }
  }
  function ve2() {
    try {
      e.compressedTexSubImage3D(...arguments);
    } catch (_2) {
      X("WebGLState:", _2);
    }
  }
  function te3() {
    try {
      e.texStorage2D(...arguments);
    } catch (_2) {
      X("WebGLState:", _2);
    }
  }
  function he3() {
    try {
      e.texStorage3D(...arguments);
    } catch (_2) {
      X("WebGLState:", _2);
    }
  }
  function Re3() {
    try {
      e.texImage2D(...arguments);
    } catch (_2) {
      X("WebGLState:", _2);
    }
  }
  function Q2() {
    try {
      e.texImage3D(...arguments);
    } catch (_2) {
      X("WebGLState:", _2);
    }
  }
  function ie3(_2) {
    we3.equals(_2) === false && (e.scissor(_2.x, _2.y, _2.z, _2.w), we3.copy(_2));
  }
  function ue3(_2) {
    nt.equals(_2) === false && (e.viewport(_2.x, _2.y, _2.z, _2.w), nt.copy(_2));
  }
  function _e3(_2, se2) {
    let j2 = x.get(se2);
    j2 === void 0 && (j2 = /* @__PURE__ */ new WeakMap(), x.set(se2, j2));
    let le3 = j2.get(_2);
    le3 === void 0 && (le3 = e.getUniformBlockIndex(se2, _2.name), j2.set(_2, le3));
  }
  function ne2(_2, se2) {
    let le3 = x.get(se2).get(_2);
    b.get(se2) !== le3 && (e.uniformBlockBinding(se2, le3, _2.__bindingPointIndex), b.set(se2, le3));
  }
  function De3() {
    e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.POLYGON_OFFSET_FILL), e.disable(e.SCISSOR_TEST), e.disable(e.STENCIL_TEST), e.disable(e.SAMPLE_ALPHA_TO_COVERAGE), e.blendEquation(e.FUNC_ADD), e.blendFunc(e.ONE, e.ZERO), e.blendFuncSeparate(e.ONE, e.ZERO, e.ONE, e.ZERO), e.blendColor(0, 0, 0, 0), e.colorMask(true, true, true, true), e.clearColor(0, 0, 0, 0), e.depthMask(true), e.depthFunc(e.LESS), h36.setReversed(false), e.clearDepth(1), e.stencilMask(4294967295), e.stencilFunc(e.ALWAYS, 0, 4294967295), e.stencilOp(e.KEEP, e.KEEP, e.KEEP), e.clearStencil(0), e.cullFace(e.BACK), e.frontFace(e.CCW), e.polygonOffset(0, 0), e.activeTexture(e.TEXTURE0), e.bindFramebuffer(e.FRAMEBUFFER, null), e.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), e.bindFramebuffer(e.READ_FRAMEBUFFER, null), e.useProgram(null), e.lineWidth(1), e.scissor(0, 0, e.canvas.width, e.canvas.height), e.viewport(0, 0, e.canvas.width, e.canvas.height), w2 = {}, xe3 = null, ge3 = {}, g2 = {}, S = /* @__PURE__ */ new WeakMap(), R = [], O = null, U2 = false, f = null, o = null, P = null, M = null, A = null, C = null, T = null, N3 = new V(0, 0, 0), q3 = 0, c = false, p = null, L3 = null, k = null, G2 = null, z2 = null, we3.set(0, 0, e.canvas.width, e.canvas.height), nt.set(0, 0, e.canvas.width, e.canvas.height), a.reset(), h36.reset(), d.reset();
  }
  return { buffers: { color: a, depth: h36, stencil: d }, enable: $, disable: fe3, bindFramebuffer: Ce3, drawBuffers: pe3, useProgram: Ne2, setBlending: He2, setMaterial: ze3, setFlipSided: Le2, setCullFace: rt, setLineWidth: m, setPolygonOffset: at, setScissorTest: Ge2, activeTexture: qe2, bindTexture: me3, unbindTexture: u, compressedTexImage2D: r, compressedTexImage3D: v, texImage2D: Re3, texImage3D: Q2, updateUBOMapping: _e3, uniformBlockBinding: ne2, texStorage2D: te3, texStorage3D: he3, texSubImage2D: H3, texSubImage3D: Y3, compressedTexSubImage2D: F, compressedTexSubImage3D: ve2, scissor: ie3, viewport: ue3, reset: De3 };
}
function rd(e, n, t, i, l, a, h36) {
  let d = n.has("WEBGL_multisampled_render_to_texture") ? n.get("WEBGL_multisampled_render_to_texture") : null, b = typeof navigator > "u" ? false : /OculusBrowser/g.test(navigator.userAgent), x = new I(), w2 = /* @__PURE__ */ new WeakMap(), g2, S = /* @__PURE__ */ new WeakMap(), R = false;
  try {
    R = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function O(u, r) {
    return R ? new OffscreenCanvas(u, r) : on("canvas");
  }
  function U2(u, r, v) {
    let H3 = 1, Y3 = me3(u);
    if ((Y3.width > v || Y3.height > v) && (H3 = v / Math.max(Y3.width, Y3.height)), H3 < 1)
      if (typeof HTMLImageElement < "u" && u instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && u instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && u instanceof ImageBitmap || typeof VideoFrame < "u" && u instanceof VideoFrame) {
        let F = Math.floor(H3 * Y3.width), ve2 = Math.floor(H3 * Y3.height);
        g2 === void 0 && (g2 = O(F, ve2));
        let te3 = r ? O(F, ve2) : g2;
        return te3.width = F, te3.height = ve2, te3.getContext("2d").drawImage(u, 0, 0, F, ve2), E("WebGLRenderer: Texture has been resized from (" + Y3.width + "x" + Y3.height + ") to (" + F + "x" + ve2 + ")."), te3;
      } else
        return "data" in u && E("WebGLRenderer: Image in DataTexture is too big (" + Y3.width + "x" + Y3.height + ")."), u;
    return u;
  }
  function f(u) {
    return u.generateMipmaps;
  }
  function o(u) {
    e.generateMipmap(u);
  }
  function P(u) {
    return u.isWebGLCubeRenderTarget ? e.TEXTURE_CUBE_MAP : u.isWebGL3DRenderTarget ? e.TEXTURE_3D : u.isWebGLArrayRenderTarget || u.isCompressedArrayTexture ? e.TEXTURE_2D_ARRAY : e.TEXTURE_2D;
  }
  function M(u, r, v, H3, Y3 = false) {
    if (u !== null) {
      if (e[u] !== void 0)
        return e[u];
      E("WebGLRenderer: Attempt to use non-existing WebGL internal format '" + u + "'");
    }
    let F = r;
    if (r === e.RED && (v === e.FLOAT && (F = e.R32F), v === e.HALF_FLOAT && (F = e.R16F), v === e.UNSIGNED_BYTE && (F = e.R8)), r === e.RED_INTEGER && (v === e.UNSIGNED_BYTE && (F = e.R8UI), v === e.UNSIGNED_SHORT && (F = e.R16UI), v === e.UNSIGNED_INT && (F = e.R32UI), v === e.BYTE && (F = e.R8I), v === e.SHORT && (F = e.R16I), v === e.INT && (F = e.R32I)), r === e.RG && (v === e.FLOAT && (F = e.RG32F), v === e.HALF_FLOAT && (F = e.RG16F), v === e.UNSIGNED_BYTE && (F = e.RG8)), r === e.RG_INTEGER && (v === e.UNSIGNED_BYTE && (F = e.RG8UI), v === e.UNSIGNED_SHORT && (F = e.RG16UI), v === e.UNSIGNED_INT && (F = e.RG32UI), v === e.BYTE && (F = e.RG8I), v === e.SHORT && (F = e.RG16I), v === e.INT && (F = e.RG32I)), r === e.RGB_INTEGER && (v === e.UNSIGNED_BYTE && (F = e.RGB8UI), v === e.UNSIGNED_SHORT && (F = e.RGB16UI), v === e.UNSIGNED_INT && (F = e.RGB32UI), v === e.BYTE && (F = e.RGB8I), v === e.SHORT && (F = e.RGB16I), v === e.INT && (F = e.RGB32I)), r === e.RGBA_INTEGER && (v === e.UNSIGNED_BYTE && (F = e.RGBA8UI), v === e.UNSIGNED_SHORT && (F = e.RGBA16UI), v === e.UNSIGNED_INT && (F = e.RGBA32UI), v === e.BYTE && (F = e.RGBA8I), v === e.SHORT && (F = e.RGBA16I), v === e.INT && (F = e.RGBA32I)), r === e.RGB && (v === e.UNSIGNED_INT_5_9_9_9_REV && (F = e.RGB9_E5), v === e.UNSIGNED_INT_10F_11F_11F_REV && (F = e.R11F_G11F_B10F)), r === e.RGBA) {
      let ve2 = Y3 ? _a : Ft.getTransfer(H3);
      v === e.FLOAT && (F = e.RGBA32F), v === e.HALF_FLOAT && (F = e.RGBA16F), v === e.UNSIGNED_BYTE && (F = ve2 === Dn ? e.SRGB8_ALPHA8 : e.RGBA8), v === e.UNSIGNED_SHORT_4_4_4_4 && (F = e.RGBA4), v === e.UNSIGNED_SHORT_5_5_5_1 && (F = e.RGB5_A1);
    }
    return (F === e.R16F || F === e.R32F || F === e.RG16F || F === e.RG32F || F === e.RGBA16F || F === e.RGBA32F) && n.get("EXT_color_buffer_float"), F;
  }
  function A(u, r) {
    let v;
    return u ? r === null || r === En || r === df ? v = e.DEPTH24_STENCIL8 : r === Si ? v = e.DEPTH32F_STENCIL8 : r === yc && (v = e.DEPTH24_STENCIL8, E("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : r === null || r === En || r === df ? v = e.DEPTH_COMPONENT24 : r === Si ? v = e.DEPTH_COMPONENT32F : r === yc && (v = e.DEPTH_COMPONENT16), v;
  }
  function C(u, r) {
    return f(u) === true || u.isFramebufferTexture && u.minFilter !== kt && u.minFilter !== Vt ? Math.log2(Math.max(r.width, r.height)) + 1 : u.mipmaps !== void 0 && u.mipmaps.length > 0 ? u.mipmaps.length : u.isCompressedTexture && Array.isArray(u.image) ? r.mipmaps.length : 1;
  }
  function T(u) {
    let r = u.target;
    r.removeEventListener("dispose", T), q3(r), r.isVideoTexture && w2.delete(r);
  }
  function N3(u) {
    let r = u.target;
    r.removeEventListener("dispose", N3), p(r);
  }
  function q3(u) {
    let r = i.get(u);
    if (r.__webglInit === void 0)
      return;
    let v = u.source, H3 = S.get(v);
    if (H3) {
      let Y3 = H3[r.__cacheKey];
      Y3.usedTimes--, Y3.usedTimes === 0 && c(u), Object.keys(H3).length === 0 && S.delete(v);
    }
    i.remove(u);
  }
  function c(u) {
    let r = i.get(u);
    e.deleteTexture(r.__webglTexture);
    let v = u.source, H3 = S.get(v);
    delete H3[r.__cacheKey], h36.memory.textures--;
  }
  function p(u) {
    let r = i.get(u);
    if (u.depthTexture && (u.depthTexture.dispose(), i.remove(u.depthTexture)), u.isWebGLCubeRenderTarget)
      for (let H3 = 0; H3 < 6; H3++) {
        if (Array.isArray(r.__webglFramebuffer[H3]))
          for (let Y3 = 0; Y3 < r.__webglFramebuffer[H3].length; Y3++)
            e.deleteFramebuffer(r.__webglFramebuffer[H3][Y3]);
        else
          e.deleteFramebuffer(r.__webglFramebuffer[H3]);
        r.__webglDepthbuffer && e.deleteRenderbuffer(r.__webglDepthbuffer[H3]);
      }
    else {
      if (Array.isArray(r.__webglFramebuffer))
        for (let H3 = 0; H3 < r.__webglFramebuffer.length; H3++)
          e.deleteFramebuffer(r.__webglFramebuffer[H3]);
      else
        e.deleteFramebuffer(r.__webglFramebuffer);
      if (r.__webglDepthbuffer && e.deleteRenderbuffer(r.__webglDepthbuffer), r.__webglMultisampledFramebuffer && e.deleteFramebuffer(r.__webglMultisampledFramebuffer), r.__webglColorRenderbuffer)
        for (let H3 = 0; H3 < r.__webglColorRenderbuffer.length; H3++)
          r.__webglColorRenderbuffer[H3] && e.deleteRenderbuffer(r.__webglColorRenderbuffer[H3]);
      r.__webglDepthRenderbuffer && e.deleteRenderbuffer(r.__webglDepthRenderbuffer);
    }
    let v = u.textures;
    for (let H3 = 0, Y3 = v.length; H3 < Y3; H3++) {
      let F = i.get(v[H3]);
      F.__webglTexture && (e.deleteTexture(F.__webglTexture), h36.memory.textures--), i.remove(v[H3]);
    }
    i.remove(u);
  }
  let L3 = 0;
  function k() {
    L3 = 0;
  }
  function G2() {
    let u = L3;
    return u >= l.maxTextures && E("WebGLTextures: Trying to use " + u + " texture units while this GPU supports only " + l.maxTextures), L3 += 1, u;
  }
  function z2(u) {
    let r = [];
    return r.push(u.wrapS), r.push(u.wrapT), r.push(u.wrapR || 0), r.push(u.magFilter), r.push(u.minFilter), r.push(u.anisotropy), r.push(u.internalFormat), r.push(u.format), r.push(u.type), r.push(u.generateMipmaps), r.push(u.premultiplyAlpha), r.push(u.flipY), r.push(u.unpackAlignment), r.push(u.colorSpace), r.join();
  }
  function K(u, r) {
    let v = i.get(u);
    if (u.isVideoTexture && Ge2(u), u.isRenderTargetTexture === false && u.isExternalTexture !== true && u.version > 0 && v.__version !== u.version) {
      let H3 = u.image;
      if (H3 === null)
        E("WebGLRenderer: Texture marked for update but no image data found.");
      else if (H3.complete === false)
        E("WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        W3(v, u, r);
        return;
      }
    } else
      u.isExternalTexture && (v.__webglTexture = u.sourceTexture ? u.sourceTexture : null);
    t.bindTexture(e.TEXTURE_2D, v.__webglTexture, e.TEXTURE0 + r);
  }
  function B2(u, r) {
    let v = i.get(u);
    if (u.isRenderTargetTexture === false && u.version > 0 && v.__version !== u.version) {
      W3(v, u, r);
      return;
    } else
      u.isExternalTexture && (v.__webglTexture = u.sourceTexture ? u.sourceTexture : null);
    t.bindTexture(e.TEXTURE_2D_ARRAY, v.__webglTexture, e.TEXTURE0 + r);
  }
  function V2(u, r) {
    let v = i.get(u);
    if (u.isRenderTargetTexture === false && u.version > 0 && v.__version !== u.version) {
      W3(v, u, r);
      return;
    }
    t.bindTexture(e.TEXTURE_3D, v.__webglTexture, e.TEXTURE0 + r);
  }
  function J(u, r) {
    let v = i.get(u);
    if (u.isCubeDepthTexture !== true && u.version > 0 && v.__version !== u.version) {
      $(v, u, r);
      return;
    }
    t.bindTexture(e.TEXTURE_CUBE_MAP, v.__webglTexture, e.TEXTURE0 + r);
  }
  let xe3 = { [Sr]: e.REPEAT, [$t]: e.CLAMP_TO_EDGE, [Ar]: e.MIRRORED_REPEAT }, ge3 = { [kt]: e.NEAREST, [uc]: e.NEAREST_MIPMAP_NEAREST, [dc]: e.NEAREST_MIPMAP_LINEAR, [Vt]: e.LINEAR, [pc]: e.LINEAR_MIPMAP_NEAREST, [On]: e.LINEAR_MIPMAP_LINEAR }, Ee3 = { [Vf]: e.NEVER, [Gf]: e.ALWAYS, [Df]: e.LESS, [Uf]: e.LEQUAL, [Lf]: e.EQUAL, [Jf]: e.GEQUAL, [Wf]: e.GREATER, [qf]: e.NOTEQUAL };
  function Oe3(u, r) {
    if (r.type === Si && n.has("OES_texture_float_linear") === false && (r.magFilter === Vt || r.magFilter === pc || r.magFilter === dc || r.magFilter === On || r.minFilter === Vt || r.minFilter === pc || r.minFilter === dc || r.minFilter === On) && E("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), e.texParameteri(u, e.TEXTURE_WRAP_S, xe3[r.wrapS]), e.texParameteri(u, e.TEXTURE_WRAP_T, xe3[r.wrapT]), (u === e.TEXTURE_3D || u === e.TEXTURE_2D_ARRAY) && e.texParameteri(u, e.TEXTURE_WRAP_R, xe3[r.wrapR]), e.texParameteri(u, e.TEXTURE_MAG_FILTER, ge3[r.magFilter]), e.texParameteri(u, e.TEXTURE_MIN_FILTER, ge3[r.minFilter]), r.compareFunction && (e.texParameteri(u, e.TEXTURE_COMPARE_MODE, e.COMPARE_REF_TO_TEXTURE), e.texParameteri(u, e.TEXTURE_COMPARE_FUNC, Ee3[r.compareFunction])), n.has("EXT_texture_filter_anisotropic") === true) {
      if (r.magFilter === kt || r.minFilter !== dc && r.minFilter !== On || r.type === Si && n.has("OES_texture_float_linear") === false)
        return;
      if (r.anisotropy > 1 || i.get(r).__currentAnisotropy) {
        let v = n.get("EXT_texture_filter_anisotropic");
        e.texParameterf(u, v.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(r.anisotropy, l.getMaxAnisotropy())), i.get(r).__currentAnisotropy = r.anisotropy;
      }
    }
  }
  function we3(u, r) {
    let v = false;
    u.__webglInit === void 0 && (u.__webglInit = true, r.addEventListener("dispose", T));
    let H3 = r.source, Y3 = S.get(H3);
    Y3 === void 0 && (Y3 = {}, S.set(H3, Y3));
    let F = z2(r);
    if (F !== u.__cacheKey) {
      Y3[F] === void 0 && (Y3[F] = { texture: e.createTexture(), usedTimes: 0 }, h36.memory.textures++, v = true), Y3[F].usedTimes++;
      let ve2 = Y3[u.__cacheKey];
      ve2 !== void 0 && (Y3[u.__cacheKey].usedTimes--, ve2.usedTimes === 0 && c(r)), u.__cacheKey = F, u.__webglTexture = Y3[F].texture;
    }
    return v;
  }
  function nt(u, r, v) {
    return Math.floor(Math.floor(u / v) / r);
  }
  function je2(u, r, v, H3) {
    let F = u.updateRanges;
    if (F.length === 0)
      t.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, r.width, r.height, v, H3, r.data);
    else {
      F.sort((Q2, ie3) => Q2.start - ie3.start);
      let ve2 = 0;
      for (let Q2 = 1; Q2 < F.length; Q2++) {
        let ie3 = F[ve2], ue3 = F[Q2], _e3 = ie3.start + ie3.count, ne2 = nt(ue3.start, r.width, 4), De3 = nt(ie3.start, r.width, 4);
        ue3.start <= _e3 + 1 && ne2 === De3 && nt(ue3.start + ue3.count - 1, r.width, 4) === ne2 ? ie3.count = Math.max(ie3.count, ue3.start + ue3.count - ie3.start) : (++ve2, F[ve2] = ue3);
      }
      F.length = ve2 + 1;
      let te3 = e.getParameter(e.UNPACK_ROW_LENGTH), he3 = e.getParameter(e.UNPACK_SKIP_PIXELS), Re3 = e.getParameter(e.UNPACK_SKIP_ROWS);
      e.pixelStorei(e.UNPACK_ROW_LENGTH, r.width);
      for (let Q2 = 0, ie3 = F.length; Q2 < ie3; Q2++) {
        let ue3 = F[Q2], _e3 = Math.floor(ue3.start / 4), ne2 = Math.ceil(ue3.count / 4), De3 = _e3 % r.width, _2 = Math.floor(_e3 / r.width), se2 = ne2, j2 = 1;
        e.pixelStorei(e.UNPACK_SKIP_PIXELS, De3), e.pixelStorei(e.UNPACK_SKIP_ROWS, _2), t.texSubImage2D(e.TEXTURE_2D, 0, De3, _2, se2, j2, v, H3, r.data);
      }
      u.clearUpdateRanges(), e.pixelStorei(e.UNPACK_ROW_LENGTH, te3), e.pixelStorei(e.UNPACK_SKIP_PIXELS, he3), e.pixelStorei(e.UNPACK_SKIP_ROWS, Re3);
    }
  }
  function W3(u, r, v) {
    let H3 = e.TEXTURE_2D;
    (r.isDataArrayTexture || r.isCompressedArrayTexture) && (H3 = e.TEXTURE_2D_ARRAY), r.isData3DTexture && (H3 = e.TEXTURE_3D);
    let Y3 = we3(u, r), F = r.source;
    t.bindTexture(H3, u.__webglTexture, e.TEXTURE0 + v);
    let ve2 = i.get(F);
    if (F.version !== ve2.__version || Y3 === true) {
      t.activeTexture(e.TEXTURE0 + v);
      let te3 = Ft.getPrimaries(Ft.workingColorSpace), he3 = r.colorSpace === Jl ? null : Ft.getPrimaries(r.colorSpace), Re3 = r.colorSpace === Jl || te3 === he3 ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
      e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, r.flipY), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, r.premultiplyAlpha), e.pixelStorei(e.UNPACK_ALIGNMENT, r.unpackAlignment), e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, Re3);
      let Q2 = U2(r.image, false, l.maxTextureSize);
      Q2 = qe2(r, Q2);
      let ie3 = a.convert(r.format, r.colorSpace), ue3 = a.convert(r.type), _e3 = M(r.internalFormat, ie3, ue3, r.colorSpace, r.isVideoTexture);
      Oe3(H3, r);
      let ne2, De3 = r.mipmaps, _2 = r.isVideoTexture !== true, se2 = ve2.__version === void 0 || Y3 === true, j2 = F.dataReady, le3 = C(r, Q2);
      if (r.isDepthTexture)
        _e3 = A(r.format === Ac, r.type), se2 && (_2 ? t.texStorage2D(e.TEXTURE_2D, 1, _e3, Q2.width, Q2.height) : t.texImage2D(e.TEXTURE_2D, 0, _e3, Q2.width, Q2.height, 0, ie3, ue3, null));
      else if (r.isDataTexture)
        if (De3.length > 0) {
          _2 && se2 && t.texStorage2D(e.TEXTURE_2D, le3, _e3, De3[0].width, De3[0].height);
          for (let Z2 = 0, X2 = De3.length; Z2 < X2; Z2++)
            ne2 = De3[Z2], _2 ? j2 && t.texSubImage2D(e.TEXTURE_2D, Z2, 0, 0, ne2.width, ne2.height, ie3, ue3, ne2.data) : t.texImage2D(e.TEXTURE_2D, Z2, _e3, ne2.width, ne2.height, 0, ie3, ue3, ne2.data);
          r.generateMipmaps = false;
        } else
          _2 ? (se2 && t.texStorage2D(e.TEXTURE_2D, le3, _e3, Q2.width, Q2.height), j2 && je2(r, Q2, ie3, ue3)) : t.texImage2D(e.TEXTURE_2D, 0, _e3, Q2.width, Q2.height, 0, ie3, ue3, Q2.data);
      else if (r.isCompressedTexture)
        if (r.isCompressedArrayTexture) {
          _2 && se2 && t.texStorage3D(e.TEXTURE_2D_ARRAY, le3, _e3, De3[0].width, De3[0].height, Q2.depth);
          for (let Z2 = 0, X2 = De3.length; Z2 < X2; Z2++)
            if (ne2 = De3[Z2], r.format !== ji)
              if (ie3 !== null)
                if (_2) {
                  if (j2)
                    if (r.layerUpdates.size > 0) {
                      let ee3 = lp(ne2.width, ne2.height, r.format, r.type);
                      for (let be3 of r.layerUpdates) {
                        let Ke2 = ne2.data.subarray(be3 * ee3 / ne2.data.BYTES_PER_ELEMENT, (be3 + 1) * ee3 / ne2.data.BYTES_PER_ELEMENT);
                        t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY, Z2, 0, 0, be3, ne2.width, ne2.height, 1, ie3, Ke2);
                      }
                      r.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY, Z2, 0, 0, 0, ne2.width, ne2.height, Q2.depth, ie3, ne2.data);
                } else
                  t.compressedTexImage3D(e.TEXTURE_2D_ARRAY, Z2, _e3, ne2.width, ne2.height, Q2.depth, 0, ne2.data, 0, 0);
              else
                E("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              _2 ? j2 && t.texSubImage3D(e.TEXTURE_2D_ARRAY, Z2, 0, 0, 0, ne2.width, ne2.height, Q2.depth, ie3, ue3, ne2.data) : t.texImage3D(e.TEXTURE_2D_ARRAY, Z2, _e3, ne2.width, ne2.height, Q2.depth, 0, ie3, ue3, ne2.data);
        } else {
          _2 && se2 && t.texStorage2D(e.TEXTURE_2D, le3, _e3, De3[0].width, De3[0].height);
          for (let Z2 = 0, X2 = De3.length; Z2 < X2; Z2++)
            ne2 = De3[Z2], r.format !== ji ? ie3 !== null ? _2 ? j2 && t.compressedTexSubImage2D(e.TEXTURE_2D, Z2, 0, 0, ne2.width, ne2.height, ie3, ne2.data) : t.compressedTexImage2D(e.TEXTURE_2D, Z2, _e3, ne2.width, ne2.height, 0, ne2.data) : E("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : _2 ? j2 && t.texSubImage2D(e.TEXTURE_2D, Z2, 0, 0, ne2.width, ne2.height, ie3, ue3, ne2.data) : t.texImage2D(e.TEXTURE_2D, Z2, _e3, ne2.width, ne2.height, 0, ie3, ue3, ne2.data);
        }
      else if (r.isDataArrayTexture)
        if (_2) {
          if (se2 && t.texStorage3D(e.TEXTURE_2D_ARRAY, le3, _e3, Q2.width, Q2.height, Q2.depth), j2)
            if (r.layerUpdates.size > 0) {
              let Z2 = lp(Q2.width, Q2.height, r.format, r.type);
              for (let X2 of r.layerUpdates) {
                let ee3 = Q2.data.subarray(X2 * Z2 / Q2.data.BYTES_PER_ELEMENT, (X2 + 1) * Z2 / Q2.data.BYTES_PER_ELEMENT);
                t.texSubImage3D(e.TEXTURE_2D_ARRAY, 0, 0, 0, X2, Q2.width, Q2.height, 1, ie3, ue3, ee3);
              }
              r.clearLayerUpdates();
            } else
              t.texSubImage3D(e.TEXTURE_2D_ARRAY, 0, 0, 0, 0, Q2.width, Q2.height, Q2.depth, ie3, ue3, Q2.data);
        } else
          t.texImage3D(e.TEXTURE_2D_ARRAY, 0, _e3, Q2.width, Q2.height, Q2.depth, 0, ie3, ue3, Q2.data);
      else if (r.isData3DTexture)
        _2 ? (se2 && t.texStorage3D(e.TEXTURE_3D, le3, _e3, Q2.width, Q2.height, Q2.depth), j2 && t.texSubImage3D(e.TEXTURE_3D, 0, 0, 0, 0, Q2.width, Q2.height, Q2.depth, ie3, ue3, Q2.data)) : t.texImage3D(e.TEXTURE_3D, 0, _e3, Q2.width, Q2.height, Q2.depth, 0, ie3, ue3, Q2.data);
      else if (r.isFramebufferTexture) {
        if (se2)
          if (_2)
            t.texStorage2D(e.TEXTURE_2D, le3, _e3, Q2.width, Q2.height);
          else {
            let Z2 = Q2.width, X2 = Q2.height;
            for (let ee3 = 0; ee3 < le3; ee3++)
              t.texImage2D(e.TEXTURE_2D, ee3, _e3, Z2, X2, 0, ie3, ue3, null), Z2 >>= 1, X2 >>= 1;
          }
      } else if (De3.length > 0) {
        if (_2 && se2) {
          let Z2 = me3(De3[0]);
          t.texStorage2D(e.TEXTURE_2D, le3, _e3, Z2.width, Z2.height);
        }
        for (let Z2 = 0, X2 = De3.length; Z2 < X2; Z2++)
          ne2 = De3[Z2], _2 ? j2 && t.texSubImage2D(e.TEXTURE_2D, Z2, 0, 0, ie3, ue3, ne2) : t.texImage2D(e.TEXTURE_2D, Z2, _e3, ie3, ue3, ne2);
        r.generateMipmaps = false;
      } else if (_2) {
        if (se2) {
          let Z2 = me3(Q2);
          t.texStorage2D(e.TEXTURE_2D, le3, _e3, Z2.width, Z2.height);
        }
        j2 && t.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, ie3, ue3, Q2);
      } else
        t.texImage2D(e.TEXTURE_2D, 0, _e3, ie3, ue3, Q2);
      f(r) && o(H3), ve2.__version = F.version, r.onUpdate && r.onUpdate(r);
    }
    u.__version = r.version;
  }
  function $(u, r, v) {
    if (r.image.length !== 6)
      return;
    let H3 = we3(u, r), Y3 = r.source;
    t.bindTexture(e.TEXTURE_CUBE_MAP, u.__webglTexture, e.TEXTURE0 + v);
    let F = i.get(Y3);
    if (Y3.version !== F.__version || H3 === true) {
      t.activeTexture(e.TEXTURE0 + v);
      let ve2 = Ft.getPrimaries(Ft.workingColorSpace), te3 = r.colorSpace === Jl ? null : Ft.getPrimaries(r.colorSpace), he3 = r.colorSpace === Jl || ve2 === te3 ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
      e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, r.flipY), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, r.premultiplyAlpha), e.pixelStorei(e.UNPACK_ALIGNMENT, r.unpackAlignment), e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, he3);
      let Re3 = r.isCompressedTexture || r.image[0].isCompressedTexture, Q2 = r.image[0] && r.image[0].isDataTexture, ie3 = [];
      for (let X2 = 0; X2 < 6; X2++)
        !Re3 && !Q2 ? ie3[X2] = U2(r.image[X2], true, l.maxCubemapSize) : ie3[X2] = Q2 ? r.image[X2].image : r.image[X2], ie3[X2] = qe2(r, ie3[X2]);
      let ue3 = ie3[0], _e3 = a.convert(r.format, r.colorSpace), ne2 = a.convert(r.type), De3 = M(r.internalFormat, _e3, ne2, r.colorSpace), _2 = r.isVideoTexture !== true, se2 = F.__version === void 0 || H3 === true, j2 = Y3.dataReady, le3 = C(r, ue3);
      Oe3(e.TEXTURE_CUBE_MAP, r);
      let Z2;
      if (Re3) {
        _2 && se2 && t.texStorage2D(e.TEXTURE_CUBE_MAP, le3, De3, ue3.width, ue3.height);
        for (let X2 = 0; X2 < 6; X2++) {
          Z2 = ie3[X2].mipmaps;
          for (let ee3 = 0; ee3 < Z2.length; ee3++) {
            let be3 = Z2[ee3];
            r.format !== ji ? _e3 !== null ? _2 ? j2 && t.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, ee3, 0, 0, be3.width, be3.height, _e3, be3.data) : t.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, ee3, De3, be3.width, be3.height, 0, be3.data) : E("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : _2 ? j2 && t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, ee3, 0, 0, be3.width, be3.height, _e3, ne2, be3.data) : t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, ee3, De3, be3.width, be3.height, 0, _e3, ne2, be3.data);
          }
        }
      } else {
        if (Z2 = r.mipmaps, _2 && se2) {
          Z2.length > 0 && le3++;
          let X2 = me3(ie3[0]);
          t.texStorage2D(e.TEXTURE_CUBE_MAP, le3, De3, X2.width, X2.height);
        }
        for (let X2 = 0; X2 < 6; X2++)
          if (Q2) {
            _2 ? j2 && t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, 0, 0, 0, ie3[X2].width, ie3[X2].height, _e3, ne2, ie3[X2].data) : t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, 0, De3, ie3[X2].width, ie3[X2].height, 0, _e3, ne2, ie3[X2].data);
            for (let ee3 = 0; ee3 < Z2.length; ee3++) {
              let Ke2 = Z2[ee3].image[X2].image;
              _2 ? j2 && t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, ee3 + 1, 0, 0, Ke2.width, Ke2.height, _e3, ne2, Ke2.data) : t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, ee3 + 1, De3, Ke2.width, Ke2.height, 0, _e3, ne2, Ke2.data);
            }
          } else {
            _2 ? j2 && t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, 0, 0, 0, _e3, ne2, ie3[X2]) : t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, 0, De3, _e3, ne2, ie3[X2]);
            for (let ee3 = 0; ee3 < Z2.length; ee3++) {
              let be3 = Z2[ee3];
              _2 ? j2 && t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, ee3 + 1, 0, 0, _e3, ne2, be3.image[X2]) : t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + X2, ee3 + 1, De3, _e3, ne2, be3.image[X2]);
            }
          }
      }
      f(r) && o(e.TEXTURE_CUBE_MAP), F.__version = Y3.version, r.onUpdate && r.onUpdate(r);
    }
    u.__version = r.version;
  }
  function fe3(u, r, v, H3, Y3, F) {
    let ve2 = a.convert(v.format, v.colorSpace), te3 = a.convert(v.type), he3 = M(v.internalFormat, ve2, te3, v.colorSpace), Re3 = i.get(r), Q2 = i.get(v);
    if (Q2.__renderTarget = r, !Re3.__hasExternalTextures) {
      let ie3 = Math.max(1, r.width >> F), ue3 = Math.max(1, r.height >> F);
      Y3 === e.TEXTURE_3D || Y3 === e.TEXTURE_2D_ARRAY ? t.texImage3D(Y3, F, he3, ie3, ue3, r.depth, 0, ve2, te3, null) : t.texImage2D(Y3, F, he3, ie3, ue3, 0, ve2, te3, null);
    }
    t.bindFramebuffer(e.FRAMEBUFFER, u), at(r) ? d.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, H3, Y3, Q2.__webglTexture, 0, m(r)) : (Y3 === e.TEXTURE_2D || Y3 >= e.TEXTURE_CUBE_MAP_POSITIVE_X && Y3 <= e.TEXTURE_CUBE_MAP_NEGATIVE_Z) && e.framebufferTexture2D(e.FRAMEBUFFER, H3, Y3, Q2.__webglTexture, F), t.bindFramebuffer(e.FRAMEBUFFER, null);
  }
  function Ce3(u, r, v) {
    if (e.bindRenderbuffer(e.RENDERBUFFER, u), r.depthBuffer) {
      let H3 = r.depthTexture, Y3 = H3 && H3.isDepthTexture ? H3.type : null, F = A(r.stencilBuffer, Y3), ve2 = r.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
      at(r) ? d.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, m(r), F, r.width, r.height) : v ? e.renderbufferStorageMultisample(e.RENDERBUFFER, m(r), F, r.width, r.height) : e.renderbufferStorage(e.RENDERBUFFER, F, r.width, r.height), e.framebufferRenderbuffer(e.FRAMEBUFFER, ve2, e.RENDERBUFFER, u);
    } else {
      let H3 = r.textures;
      for (let Y3 = 0; Y3 < H3.length; Y3++) {
        let F = H3[Y3], ve2 = a.convert(F.format, F.colorSpace), te3 = a.convert(F.type), he3 = M(F.internalFormat, ve2, te3, F.colorSpace);
        at(r) ? d.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, m(r), he3, r.width, r.height) : v ? e.renderbufferStorageMultisample(e.RENDERBUFFER, m(r), he3, r.width, r.height) : e.renderbufferStorage(e.RENDERBUFFER, he3, r.width, r.height);
      }
    }
    e.bindRenderbuffer(e.RENDERBUFFER, null);
  }
  function pe3(u, r, v) {
    let H3 = r.isWebGLCubeRenderTarget === true;
    if (t.bindFramebuffer(e.FRAMEBUFFER, u), !(r.depthTexture && r.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    let Y3 = i.get(r.depthTexture);
    if (Y3.__renderTarget = r, (!Y3.__webglTexture || r.depthTexture.image.width !== r.width || r.depthTexture.image.height !== r.height) && (r.depthTexture.image.width = r.width, r.depthTexture.image.height = r.height, r.depthTexture.needsUpdate = true), H3) {
      if (Y3.__webglInit === void 0 && (Y3.__webglInit = true, r.depthTexture.addEventListener("dispose", T)), Y3.__webglTexture === void 0) {
        Y3.__webglTexture = e.createTexture(), t.bindTexture(e.TEXTURE_CUBE_MAP, Y3.__webglTexture), Oe3(e.TEXTURE_CUBE_MAP, r.depthTexture);
        let Re3 = a.convert(r.depthTexture.format), Q2 = a.convert(r.depthTexture.type), ie3;
        r.depthTexture.format === Tr ? ie3 = e.DEPTH_COMPONENT24 : r.depthTexture.format === Ac && (ie3 = e.DEPTH24_STENCIL8);
        for (let ue3 = 0; ue3 < 6; ue3++)
          e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + ue3, 0, ie3, r.width, r.height, 0, Re3, Q2, null);
      }
    } else
      K(r.depthTexture, 0);
    let F = Y3.__webglTexture, ve2 = m(r), te3 = H3 ? e.TEXTURE_CUBE_MAP_POSITIVE_X + v : e.TEXTURE_2D, he3 = r.depthTexture.format === Ac ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
    if (r.depthTexture.format === Tr)
      at(r) ? d.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, he3, te3, F, 0, ve2) : e.framebufferTexture2D(e.FRAMEBUFFER, he3, te3, F, 0);
    else if (r.depthTexture.format === Ac)
      at(r) ? d.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, he3, te3, F, 0, ve2) : e.framebufferTexture2D(e.FRAMEBUFFER, he3, te3, F, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function Ne2(u) {
    let r = i.get(u), v = u.isWebGLCubeRenderTarget === true;
    if (r.__boundDepthTexture !== u.depthTexture) {
      let H3 = u.depthTexture;
      if (r.__depthDisposeCallback && r.__depthDisposeCallback(), H3) {
        let Y3 = () => {
          delete r.__boundDepthTexture, delete r.__depthDisposeCallback, H3.removeEventListener("dispose", Y3);
        };
        H3.addEventListener("dispose", Y3), r.__depthDisposeCallback = Y3;
      }
      r.__boundDepthTexture = H3;
    }
    if (u.depthTexture && !r.__autoAllocateDepthBuffer)
      if (v)
        for (let H3 = 0; H3 < 6; H3++)
          pe3(r.__webglFramebuffer[H3], u, H3);
      else {
        let H3 = u.texture.mipmaps;
        H3 && H3.length > 0 ? pe3(r.__webglFramebuffer[0], u, 0) : pe3(r.__webglFramebuffer, u, 0);
      }
    else if (v) {
      r.__webglDepthbuffer = [];
      for (let H3 = 0; H3 < 6; H3++)
        if (t.bindFramebuffer(e.FRAMEBUFFER, r.__webglFramebuffer[H3]), r.__webglDepthbuffer[H3] === void 0)
          r.__webglDepthbuffer[H3] = e.createRenderbuffer(), Ce3(r.__webglDepthbuffer[H3], u, false);
        else {
          let Y3 = u.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, F = r.__webglDepthbuffer[H3];
          e.bindRenderbuffer(e.RENDERBUFFER, F), e.framebufferRenderbuffer(e.FRAMEBUFFER, Y3, e.RENDERBUFFER, F);
        }
    } else {
      let H3 = u.texture.mipmaps;
      if (H3 && H3.length > 0 ? t.bindFramebuffer(e.FRAMEBUFFER, r.__webglFramebuffer[0]) : t.bindFramebuffer(e.FRAMEBUFFER, r.__webglFramebuffer), r.__webglDepthbuffer === void 0)
        r.__webglDepthbuffer = e.createRenderbuffer(), Ce3(r.__webglDepthbuffer, u, false);
      else {
        let Y3 = u.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, F = r.__webglDepthbuffer;
        e.bindRenderbuffer(e.RENDERBUFFER, F), e.framebufferRenderbuffer(e.FRAMEBUFFER, Y3, e.RENDERBUFFER, F);
      }
    }
    t.bindFramebuffer(e.FRAMEBUFFER, null);
  }
  function lt2(u, r, v) {
    let H3 = i.get(u);
    r !== void 0 && fe3(H3.__webglFramebuffer, u, u.texture, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, 0), v !== void 0 && Ne2(u);
  }
  function Ie2(u) {
    let r = u.texture, v = i.get(u), H3 = i.get(r);
    u.addEventListener("dispose", N3);
    let Y3 = u.textures, F = u.isWebGLCubeRenderTarget === true, ve2 = Y3.length > 1;
    if (ve2 || (H3.__webglTexture === void 0 && (H3.__webglTexture = e.createTexture()), H3.__version = r.version, h36.memory.textures++), F) {
      v.__webglFramebuffer = [];
      for (let te3 = 0; te3 < 6; te3++)
        if (r.mipmaps && r.mipmaps.length > 0) {
          v.__webglFramebuffer[te3] = [];
          for (let he3 = 0; he3 < r.mipmaps.length; he3++)
            v.__webglFramebuffer[te3][he3] = e.createFramebuffer();
        } else
          v.__webglFramebuffer[te3] = e.createFramebuffer();
    } else {
      if (r.mipmaps && r.mipmaps.length > 0) {
        v.__webglFramebuffer = [];
        for (let te3 = 0; te3 < r.mipmaps.length; te3++)
          v.__webglFramebuffer[te3] = e.createFramebuffer();
      } else
        v.__webglFramebuffer = e.createFramebuffer();
      if (ve2)
        for (let te3 = 0, he3 = Y3.length; te3 < he3; te3++) {
          let Re3 = i.get(Y3[te3]);
          Re3.__webglTexture === void 0 && (Re3.__webglTexture = e.createTexture(), h36.memory.textures++);
        }
      if (u.samples > 0 && at(u) === false) {
        v.__webglMultisampledFramebuffer = e.createFramebuffer(), v.__webglColorRenderbuffer = [], t.bindFramebuffer(e.FRAMEBUFFER, v.__webglMultisampledFramebuffer);
        for (let te3 = 0; te3 < Y3.length; te3++) {
          let he3 = Y3[te3];
          v.__webglColorRenderbuffer[te3] = e.createRenderbuffer(), e.bindRenderbuffer(e.RENDERBUFFER, v.__webglColorRenderbuffer[te3]);
          let Re3 = a.convert(he3.format, he3.colorSpace), Q2 = a.convert(he3.type), ie3 = M(he3.internalFormat, Re3, Q2, he3.colorSpace, u.isXRRenderTarget === true), ue3 = m(u);
          e.renderbufferStorageMultisample(e.RENDERBUFFER, ue3, ie3, u.width, u.height), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + te3, e.RENDERBUFFER, v.__webglColorRenderbuffer[te3]);
        }
        e.bindRenderbuffer(e.RENDERBUFFER, null), u.depthBuffer && (v.__webglDepthRenderbuffer = e.createRenderbuffer(), Ce3(v.__webglDepthRenderbuffer, u, true)), t.bindFramebuffer(e.FRAMEBUFFER, null);
      }
    }
    if (F) {
      t.bindTexture(e.TEXTURE_CUBE_MAP, H3.__webglTexture), Oe3(e.TEXTURE_CUBE_MAP, r);
      for (let te3 = 0; te3 < 6; te3++)
        if (r.mipmaps && r.mipmaps.length > 0)
          for (let he3 = 0; he3 < r.mipmaps.length; he3++)
            fe3(v.__webglFramebuffer[te3][he3], u, r, e.COLOR_ATTACHMENT0, e.TEXTURE_CUBE_MAP_POSITIVE_X + te3, he3);
        else
          fe3(v.__webglFramebuffer[te3], u, r, e.COLOR_ATTACHMENT0, e.TEXTURE_CUBE_MAP_POSITIVE_X + te3, 0);
      f(r) && o(e.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (ve2) {
      for (let te3 = 0, he3 = Y3.length; te3 < he3; te3++) {
        let Re3 = Y3[te3], Q2 = i.get(Re3), ie3 = e.TEXTURE_2D;
        (u.isWebGL3DRenderTarget || u.isWebGLArrayRenderTarget) && (ie3 = u.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY), t.bindTexture(ie3, Q2.__webglTexture), Oe3(ie3, Re3), fe3(v.__webglFramebuffer, u, Re3, e.COLOR_ATTACHMENT0 + te3, ie3, 0), f(Re3) && o(ie3);
      }
      t.unbindTexture();
    } else {
      let te3 = e.TEXTURE_2D;
      if ((u.isWebGL3DRenderTarget || u.isWebGLArrayRenderTarget) && (te3 = u.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY), t.bindTexture(te3, H3.__webglTexture), Oe3(te3, r), r.mipmaps && r.mipmaps.length > 0)
        for (let he3 = 0; he3 < r.mipmaps.length; he3++)
          fe3(v.__webglFramebuffer[he3], u, r, e.COLOR_ATTACHMENT0, te3, he3);
      else
        fe3(v.__webglFramebuffer, u, r, e.COLOR_ATTACHMENT0, te3, 0);
      f(r) && o(te3), t.unbindTexture();
    }
    u.depthBuffer && Ne2(u);
  }
  function He2(u) {
    let r = u.textures;
    for (let v = 0, H3 = r.length; v < H3; v++) {
      let Y3 = r[v];
      if (f(Y3)) {
        let F = P(u), ve2 = i.get(Y3).__webglTexture;
        t.bindTexture(F, ve2), o(F), t.unbindTexture();
      }
    }
  }
  let ze3 = [], Le2 = [];
  function rt(u) {
    if (u.samples > 0) {
      if (at(u) === false) {
        let r = u.textures, v = u.width, H3 = u.height, Y3 = e.COLOR_BUFFER_BIT, F = u.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, ve2 = i.get(u), te3 = r.length > 1;
        if (te3)
          for (let Re3 = 0; Re3 < r.length; Re3++)
            t.bindFramebuffer(e.FRAMEBUFFER, ve2.__webglMultisampledFramebuffer), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Re3, e.RENDERBUFFER, null), t.bindFramebuffer(e.FRAMEBUFFER, ve2.__webglFramebuffer), e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Re3, e.TEXTURE_2D, null, 0);
        t.bindFramebuffer(e.READ_FRAMEBUFFER, ve2.__webglMultisampledFramebuffer);
        let he3 = u.texture.mipmaps;
        he3 && he3.length > 0 ? t.bindFramebuffer(e.DRAW_FRAMEBUFFER, ve2.__webglFramebuffer[0]) : t.bindFramebuffer(e.DRAW_FRAMEBUFFER, ve2.__webglFramebuffer);
        for (let Re3 = 0; Re3 < r.length; Re3++) {
          if (u.resolveDepthBuffer && (u.depthBuffer && (Y3 |= e.DEPTH_BUFFER_BIT), u.stencilBuffer && u.resolveStencilBuffer && (Y3 |= e.STENCIL_BUFFER_BIT)), te3) {
            e.framebufferRenderbuffer(e.READ_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.RENDERBUFFER, ve2.__webglColorRenderbuffer[Re3]);
            let Q2 = i.get(r[Re3]).__webglTexture;
            e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, Q2, 0);
          }
          e.blitFramebuffer(0, 0, v, H3, 0, 0, v, H3, Y3, e.NEAREST), b === true && (ze3.length = 0, Le2.length = 0, ze3.push(e.COLOR_ATTACHMENT0 + Re3), u.depthBuffer && u.resolveDepthBuffer === false && (ze3.push(F), Le2.push(F), e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, Le2)), e.invalidateFramebuffer(e.READ_FRAMEBUFFER, ze3));
        }
        if (t.bindFramebuffer(e.READ_FRAMEBUFFER, null), t.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), te3)
          for (let Re3 = 0; Re3 < r.length; Re3++) {
            t.bindFramebuffer(e.FRAMEBUFFER, ve2.__webglMultisampledFramebuffer), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Re3, e.RENDERBUFFER, ve2.__webglColorRenderbuffer[Re3]);
            let Q2 = i.get(r[Re3]).__webglTexture;
            t.bindFramebuffer(e.FRAMEBUFFER, ve2.__webglFramebuffer), e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Re3, e.TEXTURE_2D, Q2, 0);
          }
        t.bindFramebuffer(e.DRAW_FRAMEBUFFER, ve2.__webglMultisampledFramebuffer);
      } else if (u.depthBuffer && u.resolveDepthBuffer === false && b) {
        let r = u.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
        e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, [r]);
      }
    }
  }
  function m(u) {
    return Math.min(l.maxSamples, u.samples);
  }
  function at(u) {
    let r = i.get(u);
    return u.samples > 0 && n.has("WEBGL_multisampled_render_to_texture") === true && r.__useRenderToTexture !== false;
  }
  function Ge2(u) {
    let r = h36.render.frame;
    w2.get(u) !== r && (w2.set(u, r), u.update());
  }
  function qe2(u, r) {
    let v = u.colorSpace, H3 = u.format, Y3 = u.type;
    return u.isCompressedTexture === true || u.isVideoTexture === true || v !== Ma && v !== Jl && (Ft.getTransfer(v) === Dn ? (H3 !== ji || Y3 !== ia) && E("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : X("WebGLTextures: Unsupported texture color space:", v)), r;
  }
  function me3(u) {
    return typeof HTMLImageElement < "u" && u instanceof HTMLImageElement ? (x.width = u.naturalWidth || u.width, x.height = u.naturalHeight || u.height) : typeof VideoFrame < "u" && u instanceof VideoFrame ? (x.width = u.displayWidth, x.height = u.displayHeight) : (x.width = u.width, x.height = u.height), x;
  }
  this.allocateTextureUnit = G2, this.resetTextureUnits = k, this.setTexture2D = K, this.setTexture2DArray = B2, this.setTexture3D = V2, this.setTextureCube = J, this.rebindTextures = lt2, this.setupRenderTarget = Ie2, this.updateRenderTargetMipmap = He2, this.updateMultisampleRenderTarget = rt, this.setupDepthRenderbuffer = Ne2, this.setupFrameBufferTexture = fe3, this.useMultisampledRTT = at, this.isReversedDepthBuffer = function() {
    return t.buffers.depth.getReversed();
  };
}
function ad2(e, n) {
  function t(i, l = Jl) {
    let a, h36 = Ft.getTransfer(l);
    if (i === ia)
      return e.UNSIGNED_BYTE;
    if (i === bc)
      return e.UNSIGNED_SHORT_4_4_4_4;
    if (i === wc)
      return e.UNSIGNED_SHORT_5_5_5_1;
    if (i === Mc)
      return e.UNSIGNED_INT_5_9_9_9_REV;
    if (i === _c)
      return e.UNSIGNED_INT_10F_11F_11F_REV;
    if (i === fc)
      return e.BYTE;
    if (i === mc)
      return e.SHORT;
    if (i === yc)
      return e.UNSIGNED_SHORT;
    if (i === gc)
      return e.INT;
    if (i === En)
      return e.UNSIGNED_INT;
    if (i === Si)
      return e.FLOAT;
    if (i === xc)
      return e.HALF_FLOAT;
    if (i === vc)
      return e.ALPHA;
    if (i === Sc)
      return e.RGB;
    if (i === ji)
      return e.RGBA;
    if (i === Tr)
      return e.DEPTH_COMPONENT;
    if (i === Ac)
      return e.DEPTH_STENCIL;
    if (i === Ul)
      return e.RED;
    if (i === Wl)
      return e.RED_INTEGER;
    if (i === Tc)
      return e.RG;
    if (i === Ic)
      return e.RG_INTEGER;
    if (i === Cc)
      return e.RGBA_INTEGER;
    if (i === zc || i === Fc || i === Bc || i === kc)
      if (h36 === Dn)
        if (a = n.get("WEBGL_compressed_texture_s3tc_srgb"), a !== null) {
          if (i === zc)
            return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (i === Fc)
            return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (i === Bc)
            return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (i === kc)
            return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (a = n.get("WEBGL_compressed_texture_s3tc"), a !== null) {
        if (i === zc)
          return a.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (i === Fc)
          return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (i === Bc)
          return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (i === kc)
          return a.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (i === Pc || i === Rc || i === Oc || i === Ec)
      if (a = n.get("WEBGL_compressed_texture_pvrtc"), a !== null) {
        if (i === Pc)
          return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (i === Rc)
          return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (i === Oc)
          return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (i === Ec)
          return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (i === Nc || i === Vc || i === Dc || i === Lc || i === Uc || i === Wc || i === qc)
      if (a = n.get("WEBGL_compressed_texture_etc"), a !== null) {
        if (i === Nc || i === Vc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ETC2 : a.COMPRESSED_RGB8_ETC2;
        if (i === Dc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : a.COMPRESSED_RGBA8_ETC2_EAC;
        if (i === Lc)
          return a.COMPRESSED_R11_EAC;
        if (i === Uc)
          return a.COMPRESSED_SIGNED_R11_EAC;
        if (i === Wc)
          return a.COMPRESSED_RG11_EAC;
        if (i === qc)
          return a.COMPRESSED_SIGNED_RG11_EAC;
      } else
        return null;
    if (i === Jc || i === Gc || i === Xc || i === Hc || i === Zc || i === Yc || i === $c || i === jc || i === Qc || i === Kc || i === tu || i === eu || i === iu || i === su)
      if (a = n.get("WEBGL_compressed_texture_astc"), a !== null) {
        if (i === Jc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : a.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (i === Gc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : a.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (i === Xc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : a.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (i === Hc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : a.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (i === Zc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : a.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (i === Yc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : a.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (i === $c)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : a.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (i === jc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : a.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (i === Qc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : a.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (i === Kc)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : a.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (i === tu)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : a.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (i === eu)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : a.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (i === iu)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : a.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (i === su)
          return h36 === Dn ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : a.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (i === nu || i === ru || i === ou)
      if (a = n.get("EXT_texture_compression_bptc"), a !== null) {
        if (i === nu)
          return h36 === Dn ? a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : a.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (i === ru)
          return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (i === ou)
          return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (i === au || i === hu || i === lu || i === cu)
      if (a = n.get("EXT_texture_compression_rgtc"), a !== null) {
        if (i === au)
          return a.COMPRESSED_RED_RGTC1_EXT;
        if (i === hu)
          return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (i === lu)
          return a.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (i === cu)
          return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return i === df ? e.UNSIGNED_INT_24_8 : e[i] !== void 0 ? e[i] : null;
  }
  return { convert: t };
}
var od = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`;
var sd2 = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
var oi2 = class {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(n, t) {
    if (this.texture === null) {
      let i = new Th(n.texture);
      (n.depthNear !== t.depthNear || n.depthFar !== t.depthFar) && (this.depthNear = n.depthNear, this.depthFar = n.depthFar), this.texture = i;
    }
  }
  getMesh(n) {
    if (this.texture !== null && this.mesh === null) {
      let t = n.cameras[0].viewport, i = new es({ vertexShader: od, fragmentShader: sd2, uniforms: { depthColor: { value: this.texture }, depthWidth: { value: t.z }, depthHeight: { value: t.w } } });
      this.mesh = new Pt(new co(20, 20), i);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
  getDepthTexture() {
    return this.texture;
  }
};
var si2 = class extends Kt {
  constructor(n, t) {
    super();
    let i = this, l = null, a = 1, h36 = null, d = "local-floor", b = 1, x = null, w2 = null, g2 = null, S = null, R = null, O = null, U2 = typeof XRWebGLBinding < "u", f = new oi2(), o = {}, P = t.getContextAttributes(), M = null, A = null, C = [], T = [], N3 = new I(), q3 = null, c = new At();
    c.viewport = new Dt();
    let p = new At();
    p.viewport = new Dt();
    let L3 = [c, p], k = new Yh(), G2 = null, z2 = null;
    this.cameraAutoUpdate = true, this.enabled = false, this.isPresenting = false, this.getController = function(W3) {
      let $ = C[W3];
      return $ === void 0 && ($ = new th(), C[W3] = $), $.getTargetRaySpace();
    }, this.getControllerGrip = function(W3) {
      let $ = C[W3];
      return $ === void 0 && ($ = new th(), C[W3] = $), $.getGripSpace();
    }, this.getHand = function(W3) {
      let $ = C[W3];
      return $ === void 0 && ($ = new th(), C[W3] = $), $.getHandSpace();
    };
    function K(W3) {
      let $ = T.indexOf(W3.inputSource);
      if ($ === -1)
        return;
      let fe3 = C[$];
      fe3 !== void 0 && (fe3.update(W3.inputSource, W3.frame, x || h36), fe3.dispatchEvent({ type: W3.type, data: W3.inputSource }));
    }
    function B2() {
      l.removeEventListener("select", K), l.removeEventListener("selectstart", K), l.removeEventListener("selectend", K), l.removeEventListener("squeeze", K), l.removeEventListener("squeezestart", K), l.removeEventListener("squeezeend", K), l.removeEventListener("end", B2), l.removeEventListener("inputsourceschange", V2);
      for (let W3 = 0; W3 < C.length; W3++) {
        let $ = T[W3];
        $ !== null && (T[W3] = null, C[W3].disconnect($));
      }
      G2 = null, z2 = null, f.reset();
      for (let W3 in o)
        delete o[W3];
      n.setRenderTarget(M), R = null, S = null, g2 = null, l = null, A = null, je2.stop(), i.isPresenting = false, n.setPixelRatio(q3), n.setSize(N3.width, N3.height, false), i.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(W3) {
      a = W3, i.isPresenting === true && E("WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(W3) {
      d = W3, i.isPresenting === true && E("WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return x || h36;
    }, this.setReferenceSpace = function(W3) {
      x = W3;
    }, this.getBaseLayer = function() {
      return S !== null ? S : R;
    }, this.getBinding = function() {
      return g2 === null && U2 && (g2 = new XRWebGLBinding(l, t)), g2;
    }, this.getFrame = function() {
      return O;
    }, this.getSession = function() {
      return l;
    }, this.setSession = async function(W3) {
      if (l = W3, l !== null) {
        if (M = n.getRenderTarget(), l.addEventListener("select", K), l.addEventListener("selectstart", K), l.addEventListener("selectend", K), l.addEventListener("squeeze", K), l.addEventListener("squeezestart", K), l.addEventListener("squeezeend", K), l.addEventListener("end", B2), l.addEventListener("inputsourceschange", V2), P.xrCompatible !== true && await t.makeXRCompatible(), q3 = n.getPixelRatio(), n.getSize(N3), U2 && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let fe3 = null, Ce3 = null, pe3 = null;
          P.depth && (pe3 = P.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, fe3 = P.stencil ? Ac : Tr, Ce3 = P.stencil ? df : En);
          let Ne2 = { colorFormat: t.RGBA8, depthFormat: pe3, scaleFactor: a };
          g2 = this.getBinding(), S = g2.createProjectionLayer(Ne2), l.updateRenderState({ layers: [S] }), n.setPixelRatio(1), n.setSize(S.textureWidth, S.textureHeight, false), A = new ts(S.textureWidth, S.textureHeight, { format: ji, type: ia, depthTexture: new Zr(S.textureWidth, S.textureHeight, Ce3, void 0, void 0, void 0, void 0, void 0, void 0, fe3), stencilBuffer: P.stencil, colorSpace: n.outputColorSpace, samples: P.antialias ? 4 : 0, resolveDepthBuffer: S.ignoreDepthValues === false, resolveStencilBuffer: S.ignoreDepthValues === false });
        } else {
          let fe3 = { antialias: P.antialias, alpha: true, depth: P.depth, stencil: P.stencil, framebufferScaleFactor: a };
          R = new XRWebGLLayer(l, t, fe3), l.updateRenderState({ baseLayer: R }), n.setPixelRatio(1), n.setSize(R.framebufferWidth, R.framebufferHeight, false), A = new ts(R.framebufferWidth, R.framebufferHeight, { format: ji, type: ia, colorSpace: n.outputColorSpace, stencilBuffer: P.stencil, resolveDepthBuffer: R.ignoreDepthValues === false, resolveStencilBuffer: R.ignoreDepthValues === false });
        }
        A.isXRRenderTarget = true, this.setFoveation(b), x = null, h36 = await l.requestReferenceSpace(d), je2.setContext(l), je2.start(), i.isPresenting = true, i.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (l !== null)
        return l.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return f.getDepthTexture();
    };
    function V2(W3) {
      for (let $ = 0; $ < W3.removed.length; $++) {
        let fe3 = W3.removed[$], Ce3 = T.indexOf(fe3);
        Ce3 >= 0 && (T[Ce3] = null, C[Ce3].disconnect(fe3));
      }
      for (let $ = 0; $ < W3.added.length; $++) {
        let fe3 = W3.added[$], Ce3 = T.indexOf(fe3);
        if (Ce3 === -1) {
          for (let Ne2 = 0; Ne2 < C.length; Ne2++)
            if (Ne2 >= T.length) {
              T.push(fe3), Ce3 = Ne2;
              break;
            } else if (T[Ne2] === null) {
              T[Ne2] = fe3, Ce3 = Ne2;
              break;
            }
          if (Ce3 === -1)
            break;
        }
        let pe3 = C[Ce3];
        pe3 && pe3.connect(fe3);
      }
    }
    let J = new w(), xe3 = new w();
    function ge3(W3, $, fe3) {
      J.setFromMatrixPosition($.matrixWorld), xe3.setFromMatrixPosition(fe3.matrixWorld);
      let Ce3 = J.distanceTo(xe3), pe3 = $.projectionMatrix.elements, Ne2 = fe3.projectionMatrix.elements, lt2 = pe3[14] / (pe3[10] - 1), Ie2 = pe3[14] / (pe3[10] + 1), He2 = (pe3[9] + 1) / pe3[5], ze3 = (pe3[9] - 1) / pe3[5], Le2 = (pe3[8] - 1) / pe3[0], rt = (Ne2[8] + 1) / Ne2[0], m = lt2 * Le2, at = lt2 * rt, Ge2 = Ce3 / (-Le2 + rt), qe2 = Ge2 * -Le2;
      if ($.matrixWorld.decompose(W3.position, W3.quaternion, W3.scale), W3.translateX(qe2), W3.translateZ(Ge2), W3.matrixWorld.compose(W3.position, W3.quaternion, W3.scale), W3.matrixWorldInverse.copy(W3.matrixWorld).invert(), pe3[10] === -1)
        W3.projectionMatrix.copy($.projectionMatrix), W3.projectionMatrixInverse.copy($.projectionMatrixInverse);
      else {
        let me3 = lt2 + Ge2, u = Ie2 + Ge2, r = m - qe2, v = at + (Ce3 - qe2), H3 = He2 * Ie2 / u * me3, Y3 = ze3 * Ie2 / u * me3;
        W3.projectionMatrix.makePerspective(r, v, H3, Y3, me3, u), W3.projectionMatrixInverse.copy(W3.projectionMatrix).invert();
      }
    }
    function Ee3(W3, $) {
      $ === null ? W3.matrixWorld.copy(W3.matrix) : W3.matrixWorld.multiplyMatrices($.matrixWorld, W3.matrix), W3.matrixWorldInverse.copy(W3.matrixWorld).invert();
    }
    this.updateCamera = function(W3) {
      if (l === null)
        return;
      let $ = W3.near, fe3 = W3.far;
      f.texture !== null && (f.depthNear > 0 && ($ = f.depthNear), f.depthFar > 0 && (fe3 = f.depthFar)), k.near = p.near = c.near = $, k.far = p.far = c.far = fe3, (G2 !== k.near || z2 !== k.far) && (l.updateRenderState({ depthNear: k.near, depthFar: k.far }), G2 = k.near, z2 = k.far), k.layers.mask = W3.layers.mask | 6, c.layers.mask = k.layers.mask & 3, p.layers.mask = k.layers.mask & 5;
      let Ce3 = W3.parent, pe3 = k.cameras;
      Ee3(k, Ce3);
      for (let Ne2 = 0; Ne2 < pe3.length; Ne2++)
        Ee3(pe3[Ne2], Ce3);
      pe3.length === 2 ? ge3(k, c, p) : k.projectionMatrix.copy(c.projectionMatrix), Oe3(W3, k, Ce3);
    };
    function Oe3(W3, $, fe3) {
      fe3 === null ? W3.matrix.copy($.matrixWorld) : (W3.matrix.copy(fe3.matrixWorld), W3.matrix.invert(), W3.matrix.multiply($.matrixWorld)), W3.matrix.decompose(W3.position, W3.quaternion, W3.scale), W3.updateMatrixWorld(true), W3.projectionMatrix.copy($.projectionMatrix), W3.projectionMatrixInverse.copy($.projectionMatrixInverse), W3.isPerspectiveCamera && (W3.fov = Ki * 2 * Math.atan(1 / W3.projectionMatrix.elements[5]), W3.zoom = 1);
    }
    this.getCamera = function() {
      return k;
    }, this.getFoveation = function() {
      if (!(S === null && R === null))
        return b;
    }, this.setFoveation = function(W3) {
      b = W3, S !== null && (S.fixedFoveation = W3), R !== null && R.fixedFoveation !== void 0 && (R.fixedFoveation = W3);
    }, this.hasDepthSensing = function() {
      return f.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return f.getMesh(k);
    }, this.getCameraTexture = function(W3) {
      return o[W3];
    };
    let we3 = null;
    function nt(W3, $) {
      if (w2 = $.getViewerPose(x || h36), O = $, w2 !== null) {
        let fe3 = w2.views;
        R !== null && (n.setRenderTargetFramebuffer(A, R.framebuffer), n.setRenderTarget(A));
        let Ce3 = false;
        fe3.length !== k.cameras.length && (k.cameras.length = 0, Ce3 = true);
        for (let Ie2 = 0; Ie2 < fe3.length; Ie2++) {
          let He2 = fe3[Ie2], ze3 = null;
          if (R !== null)
            ze3 = R.getViewport(He2);
          else {
            let rt = g2.getViewSubImage(S, He2);
            ze3 = rt.viewport, Ie2 === 0 && (n.setRenderTargetTextures(A, rt.colorTexture, rt.depthStencilTexture), n.setRenderTarget(A));
          }
          let Le2 = L3[Ie2];
          Le2 === void 0 && (Le2 = new At(), Le2.layers.enable(Ie2), Le2.viewport = new Dt(), L3[Ie2] = Le2), Le2.matrix.fromArray(He2.transform.matrix), Le2.matrix.decompose(Le2.position, Le2.quaternion, Le2.scale), Le2.projectionMatrix.fromArray(He2.projectionMatrix), Le2.projectionMatrixInverse.copy(Le2.projectionMatrix).invert(), Le2.viewport.set(ze3.x, ze3.y, ze3.width, ze3.height), Ie2 === 0 && (k.matrix.copy(Le2.matrix), k.matrix.decompose(k.position, k.quaternion, k.scale)), Ce3 === true && k.cameras.push(Le2);
        }
        let pe3 = l.enabledFeatures;
        if (pe3 && pe3.includes("depth-sensing") && l.depthUsage == "gpu-optimized" && U2) {
          g2 = i.getBinding();
          let Ie2 = g2.getDepthInformation(fe3[0]);
          Ie2 && Ie2.isValid && Ie2.texture && f.init(Ie2, l.renderState);
        }
        if (pe3 && pe3.includes("camera-access") && U2) {
          n.state.unbindTexture(), g2 = i.getBinding();
          for (let Ie2 = 0; Ie2 < fe3.length; Ie2++) {
            let He2 = fe3[Ie2].camera;
            if (He2) {
              let ze3 = o[He2];
              ze3 || (ze3 = new Th(), o[He2] = ze3);
              let Le2 = g2.getCameraImage(He2);
              ze3.sourceTexture = Le2;
            }
          }
        }
      }
      for (let fe3 = 0; fe3 < C.length; fe3++) {
        let Ce3 = T[fe3], pe3 = C[fe3];
        Ce3 !== null && pe3 !== void 0 && pe3.update(Ce3, $, x || h36);
      }
      we3 && we3(W3, $), $.detectedPlanes && i.dispatchEvent({ type: "planesdetected", data: $ }), O = null;
    }
    let je2 = new Jr2();
    je2.setAnimationLoop(nt), this.setAnimationLoop = function(W3) {
      we3 = W3;
    }, this.dispose = function() {
    };
  }
};
var Bt2 = new ee();
var ld2 = new U();
function cd(e, n) {
  function t(f, o) {
    f.matrixAutoUpdate === true && f.updateMatrix(), o.value.copy(f.matrix);
  }
  function i(f, o) {
    o.color.getRGB(f.fogColor.value, cm(e)), o.isFog ? (f.fogNear.value = o.near, f.fogFar.value = o.far) : o.isFogExp2 && (f.fogDensity.value = o.density);
  }
  function l(f, o, P, M, A) {
    o.isMeshBasicMaterial || o.isMeshLambertMaterial ? a(f, o) : o.isMeshToonMaterial ? (a(f, o), g2(f, o)) : o.isMeshPhongMaterial ? (a(f, o), w2(f, o)) : o.isMeshStandardMaterial ? (a(f, o), S(f, o), o.isMeshPhysicalMaterial && R(f, o, A)) : o.isMeshMatcapMaterial ? (a(f, o), O(f, o)) : o.isMeshDepthMaterial ? a(f, o) : o.isMeshDistanceMaterial ? (a(f, o), U2(f, o)) : o.isMeshNormalMaterial ? a(f, o) : o.isLineBasicMaterial ? (h36(f, o), o.isLineDashedMaterial && d(f, o)) : o.isPointsMaterial ? b(f, o, P, M) : o.isSpriteMaterial ? x(f, o) : o.isShadowMaterial ? (f.color.value.copy(o.color), f.opacity.value = o.opacity) : o.isShaderMaterial && (o.uniformsNeedUpdate = false);
  }
  function a(f, o) {
    f.opacity.value = o.opacity, o.color && f.diffuse.value.copy(o.color), o.emissive && f.emissive.value.copy(o.emissive).multiplyScalar(o.emissiveIntensity), o.map && (f.map.value = o.map, t(o.map, f.mapTransform)), o.alphaMap && (f.alphaMap.value = o.alphaMap, t(o.alphaMap, f.alphaMapTransform)), o.bumpMap && (f.bumpMap.value = o.bumpMap, t(o.bumpMap, f.bumpMapTransform), f.bumpScale.value = o.bumpScale, o.side === Ll && (f.bumpScale.value *= -1)), o.normalMap && (f.normalMap.value = o.normalMap, t(o.normalMap, f.normalMapTransform), f.normalScale.value.copy(o.normalScale), o.side === Ll && f.normalScale.value.negate()), o.displacementMap && (f.displacementMap.value = o.displacementMap, t(o.displacementMap, f.displacementMapTransform), f.displacementScale.value = o.displacementScale, f.displacementBias.value = o.displacementBias), o.emissiveMap && (f.emissiveMap.value = o.emissiveMap, t(o.emissiveMap, f.emissiveMapTransform)), o.specularMap && (f.specularMap.value = o.specularMap, t(o.specularMap, f.specularMapTransform)), o.alphaTest > 0 && (f.alphaTest.value = o.alphaTest);
    let P = n.get(o), M = P.envMap, A = P.envMapRotation;
    M && (f.envMap.value = M, Bt2.copy(A), Bt2.x *= -1, Bt2.y *= -1, Bt2.z *= -1, M.isCubeTexture && M.isRenderTargetTexture === false && (Bt2.y *= -1, Bt2.z *= -1), f.envMapRotation.value.setFromMatrix4(ld2.makeRotationFromEuler(Bt2)), f.flipEnvMap.value = M.isCubeTexture && M.isRenderTargetTexture === false ? -1 : 1, f.reflectivity.value = o.reflectivity, f.ior.value = o.ior, f.refractionRatio.value = o.refractionRatio), o.lightMap && (f.lightMap.value = o.lightMap, f.lightMapIntensity.value = o.lightMapIntensity, t(o.lightMap, f.lightMapTransform)), o.aoMap && (f.aoMap.value = o.aoMap, f.aoMapIntensity.value = o.aoMapIntensity, t(o.aoMap, f.aoMapTransform));
  }
  function h36(f, o) {
    f.diffuse.value.copy(o.color), f.opacity.value = o.opacity, o.map && (f.map.value = o.map, t(o.map, f.mapTransform));
  }
  function d(f, o) {
    f.dashSize.value = o.dashSize, f.totalSize.value = o.dashSize + o.gapSize, f.scale.value = o.scale;
  }
  function b(f, o, P, M) {
    f.diffuse.value.copy(o.color), f.opacity.value = o.opacity, f.size.value = o.size * P, f.scale.value = M * 0.5, o.map && (f.map.value = o.map, t(o.map, f.uvTransform)), o.alphaMap && (f.alphaMap.value = o.alphaMap, t(o.alphaMap, f.alphaMapTransform)), o.alphaTest > 0 && (f.alphaTest.value = o.alphaTest);
  }
  function x(f, o) {
    f.diffuse.value.copy(o.color), f.opacity.value = o.opacity, f.rotation.value = o.rotation, o.map && (f.map.value = o.map, t(o.map, f.mapTransform)), o.alphaMap && (f.alphaMap.value = o.alphaMap, t(o.alphaMap, f.alphaMapTransform)), o.alphaTest > 0 && (f.alphaTest.value = o.alphaTest);
  }
  function w2(f, o) {
    f.specular.value.copy(o.specular), f.shininess.value = Math.max(o.shininess, 1e-4);
  }
  function g2(f, o) {
    o.gradientMap && (f.gradientMap.value = o.gradientMap);
  }
  function S(f, o) {
    f.metalness.value = o.metalness, o.metalnessMap && (f.metalnessMap.value = o.metalnessMap, t(o.metalnessMap, f.metalnessMapTransform)), f.roughness.value = o.roughness, o.roughnessMap && (f.roughnessMap.value = o.roughnessMap, t(o.roughnessMap, f.roughnessMapTransform)), o.envMap && (f.envMapIntensity.value = o.envMapIntensity);
  }
  function R(f, o, P) {
    f.ior.value = o.ior, o.sheen > 0 && (f.sheenColor.value.copy(o.sheenColor).multiplyScalar(o.sheen), f.sheenRoughness.value = o.sheenRoughness, o.sheenColorMap && (f.sheenColorMap.value = o.sheenColorMap, t(o.sheenColorMap, f.sheenColorMapTransform)), o.sheenRoughnessMap && (f.sheenRoughnessMap.value = o.sheenRoughnessMap, t(o.sheenRoughnessMap, f.sheenRoughnessMapTransform))), o.clearcoat > 0 && (f.clearcoat.value = o.clearcoat, f.clearcoatRoughness.value = o.clearcoatRoughness, o.clearcoatMap && (f.clearcoatMap.value = o.clearcoatMap, t(o.clearcoatMap, f.clearcoatMapTransform)), o.clearcoatRoughnessMap && (f.clearcoatRoughnessMap.value = o.clearcoatRoughnessMap, t(o.clearcoatRoughnessMap, f.clearcoatRoughnessMapTransform)), o.clearcoatNormalMap && (f.clearcoatNormalMap.value = o.clearcoatNormalMap, t(o.clearcoatNormalMap, f.clearcoatNormalMapTransform), f.clearcoatNormalScale.value.copy(o.clearcoatNormalScale), o.side === Ll && f.clearcoatNormalScale.value.negate())), o.dispersion > 0 && (f.dispersion.value = o.dispersion), o.iridescence > 0 && (f.iridescence.value = o.iridescence, f.iridescenceIOR.value = o.iridescenceIOR, f.iridescenceThicknessMinimum.value = o.iridescenceThicknessRange[0], f.iridescenceThicknessMaximum.value = o.iridescenceThicknessRange[1], o.iridescenceMap && (f.iridescenceMap.value = o.iridescenceMap, t(o.iridescenceMap, f.iridescenceMapTransform)), o.iridescenceThicknessMap && (f.iridescenceThicknessMap.value = o.iridescenceThicknessMap, t(o.iridescenceThicknessMap, f.iridescenceThicknessMapTransform))), o.transmission > 0 && (f.transmission.value = o.transmission, f.transmissionSamplerMap.value = P.texture, f.transmissionSamplerSize.value.set(P.width, P.height), o.transmissionMap && (f.transmissionMap.value = o.transmissionMap, t(o.transmissionMap, f.transmissionMapTransform)), f.thickness.value = o.thickness, o.thicknessMap && (f.thicknessMap.value = o.thicknessMap, t(o.thicknessMap, f.thicknessMapTransform)), f.attenuationDistance.value = o.attenuationDistance, f.attenuationColor.value.copy(o.attenuationColor)), o.anisotropy > 0 && (f.anisotropyVector.value.set(o.anisotropy * Math.cos(o.anisotropyRotation), o.anisotropy * Math.sin(o.anisotropyRotation)), o.anisotropyMap && (f.anisotropyMap.value = o.anisotropyMap, t(o.anisotropyMap, f.anisotropyMapTransform))), f.specularIntensity.value = o.specularIntensity, f.specularColor.value.copy(o.specularColor), o.specularColorMap && (f.specularColorMap.value = o.specularColorMap, t(o.specularColorMap, f.specularColorMapTransform)), o.specularIntensityMap && (f.specularIntensityMap.value = o.specularIntensityMap, t(o.specularIntensityMap, f.specularIntensityMapTransform));
  }
  function O(f, o) {
    o.matcap && (f.matcap.value = o.matcap);
  }
  function U2(f, o) {
    let P = n.get(o).light;
    f.referencePosition.value.setFromMatrixPosition(P.matrixWorld), f.nearDistance.value = P.shadow.camera.near, f.farDistance.value = P.shadow.camera.far;
  }
  return { refreshFogUniforms: i, refreshMaterialUniforms: l };
}
function fd2(e, n, t, i) {
  let l = {}, a = {}, h36 = [], d = e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);
  function b(P, M) {
    let A = M.program;
    i.uniformBlockBinding(P, A);
  }
  function x(P, M) {
    let A = l[P.id];
    A === void 0 && (O(P), A = w2(P), l[P.id] = A, P.addEventListener("dispose", f));
    let C = M.program;
    i.updateUBOMapping(P, C);
    let T = n.render.frame;
    a[P.id] !== T && (S(P), a[P.id] = T);
  }
  function w2(P) {
    let M = g2();
    P.__bindingPointIndex = M;
    let A = e.createBuffer(), C = P.__size, T = P.usage;
    return e.bindBuffer(e.UNIFORM_BUFFER, A), e.bufferData(e.UNIFORM_BUFFER, C, T), e.bindBuffer(e.UNIFORM_BUFFER, null), e.bindBufferBase(e.UNIFORM_BUFFER, M, A), A;
  }
  function g2() {
    for (let P = 0; P < d; P++)
      if (h36.indexOf(P) === -1)
        return h36.push(P), P;
    return X("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function S(P) {
    let M = l[P.id], A = P.uniforms, C = P.__cache;
    e.bindBuffer(e.UNIFORM_BUFFER, M);
    for (let T = 0, N3 = A.length; T < N3; T++) {
      let q3 = Array.isArray(A[T]) ? A[T] : [A[T]];
      for (let c = 0, p = q3.length; c < p; c++) {
        let L3 = q3[c];
        if (R(L3, T, c, C) === true) {
          let k = L3.__offset, G2 = Array.isArray(L3.value) ? L3.value : [L3.value], z2 = 0;
          for (let K = 0; K < G2.length; K++) {
            let B2 = G2[K], V2 = U2(B2);
            typeof B2 == "number" || typeof B2 == "boolean" ? (L3.__data[0] = B2, e.bufferSubData(e.UNIFORM_BUFFER, k + z2, L3.__data)) : B2.isMatrix3 ? (L3.__data[0] = B2.elements[0], L3.__data[1] = B2.elements[1], L3.__data[2] = B2.elements[2], L3.__data[3] = 0, L3.__data[4] = B2.elements[3], L3.__data[5] = B2.elements[4], L3.__data[6] = B2.elements[5], L3.__data[7] = 0, L3.__data[8] = B2.elements[6], L3.__data[9] = B2.elements[7], L3.__data[10] = B2.elements[8], L3.__data[11] = 0) : (B2.toArray(L3.__data, z2), z2 += V2.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          e.bufferSubData(e.UNIFORM_BUFFER, k, L3.__data);
        }
      }
    }
    e.bindBuffer(e.UNIFORM_BUFFER, null);
  }
  function R(P, M, A, C) {
    let T = P.value, N3 = M + "_" + A;
    if (C[N3] === void 0)
      return typeof T == "number" || typeof T == "boolean" ? C[N3] = T : C[N3] = T.clone(), true;
    {
      let q3 = C[N3];
      if (typeof T == "number" || typeof T == "boolean") {
        if (q3 !== T)
          return C[N3] = T, true;
      } else if (q3.equals(T) === false)
        return q3.copy(T), true;
    }
    return false;
  }
  function O(P) {
    let M = P.uniforms, A = 0, C = 16;
    for (let N3 = 0, q3 = M.length; N3 < q3; N3++) {
      let c = Array.isArray(M[N3]) ? M[N3] : [M[N3]];
      for (let p = 0, L3 = c.length; p < L3; p++) {
        let k = c[p], G2 = Array.isArray(k.value) ? k.value : [k.value];
        for (let z2 = 0, K = G2.length; z2 < K; z2++) {
          let B2 = G2[z2], V2 = U2(B2), J = A % C, xe3 = J % V2.boundary, ge3 = J + xe3;
          A += xe3, ge3 !== 0 && C - ge3 < V2.storage && (A += C - ge3), k.__data = new Float32Array(V2.storage / Float32Array.BYTES_PER_ELEMENT), k.__offset = A, A += V2.storage;
        }
      }
    }
    let T = A % C;
    return T > 0 && (A += C - T), P.__size = A, P.__cache = {}, this;
  }
  function U2(P) {
    let M = { boundary: 0, storage: 0 };
    return typeof P == "number" || typeof P == "boolean" ? (M.boundary = 4, M.storage = 4) : P.isVector2 ? (M.boundary = 8, M.storage = 8) : P.isVector3 || P.isColor ? (M.boundary = 16, M.storage = 12) : P.isVector4 ? (M.boundary = 16, M.storage = 16) : P.isMatrix3 ? (M.boundary = 48, M.storage = 48) : P.isMatrix4 ? (M.boundary = 64, M.storage = 64) : P.isTexture ? E("WebGLRenderer: Texture samplers can not be part of an uniforms group.") : E("WebGLRenderer: Unsupported uniform value type.", P), M;
  }
  function f(P) {
    let M = P.target;
    M.removeEventListener("dispose", f);
    let A = h36.indexOf(M.__bindingPointIndex);
    h36.splice(A, 1), e.deleteBuffer(l[M.id]), delete l[M.id], delete a[M.id];
  }
  function o() {
    for (let P in l)
      e.deleteBuffer(l[P]);
    h36 = [], l = {}, a = {};
  }
  return { bind: b, update: x, dispose: o };
}
var dd2 = new Uint16Array([12469, 15057, 12620, 14925, 13266, 14620, 13807, 14376, 14323, 13990, 14545, 13625, 14713, 13328, 14840, 12882, 14931, 12528, 14996, 12233, 15039, 11829, 15066, 11525, 15080, 11295, 15085, 10976, 15082, 10705, 15073, 10495, 13880, 14564, 13898, 14542, 13977, 14430, 14158, 14124, 14393, 13732, 14556, 13410, 14702, 12996, 14814, 12596, 14891, 12291, 14937, 11834, 14957, 11489, 14958, 11194, 14943, 10803, 14921, 10506, 14893, 10278, 14858, 9960, 14484, 14039, 14487, 14025, 14499, 13941, 14524, 13740, 14574, 13468, 14654, 13106, 14743, 12678, 14818, 12344, 14867, 11893, 14889, 11509, 14893, 11180, 14881, 10751, 14852, 10428, 14812, 10128, 14765, 9754, 14712, 9466, 14764, 13480, 14764, 13475, 14766, 13440, 14766, 13347, 14769, 13070, 14786, 12713, 14816, 12387, 14844, 11957, 14860, 11549, 14868, 11215, 14855, 10751, 14825, 10403, 14782, 10044, 14729, 9651, 14666, 9352, 14599, 9029, 14967, 12835, 14966, 12831, 14963, 12804, 14954, 12723, 14936, 12564, 14917, 12347, 14900, 11958, 14886, 11569, 14878, 11247, 14859, 10765, 14828, 10401, 14784, 10011, 14727, 9600, 14660, 9289, 14586, 8893, 14508, 8533, 15111, 12234, 15110, 12234, 15104, 12216, 15092, 12156, 15067, 12010, 15028, 11776, 14981, 11500, 14942, 11205, 14902, 10752, 14861, 10393, 14812, 9991, 14752, 9570, 14682, 9252, 14603, 8808, 14519, 8445, 14431, 8145, 15209, 11449, 15208, 11451, 15202, 11451, 15190, 11438, 15163, 11384, 15117, 11274, 15055, 10979, 14994, 10648, 14932, 10343, 14871, 9936, 14803, 9532, 14729, 9218, 14645, 8742, 14556, 8381, 14461, 8020, 14365, 7603, 15273, 10603, 15272, 10607, 15267, 10619, 15256, 10631, 15231, 10614, 15182, 10535, 15118, 10389, 15042, 10167, 14963, 9787, 14883, 9447, 14800, 9115, 14710, 8665, 14615, 8318, 14514, 7911, 14411, 7507, 14279, 7198, 15314, 9675, 15313, 9683, 15309, 9712, 15298, 9759, 15277, 9797, 15229, 9773, 15166, 9668, 15084, 9487, 14995, 9274, 14898, 8910, 14800, 8539, 14697, 8234, 14590, 7790, 14479, 7409, 14367, 7067, 14178, 6621, 15337, 8619, 15337, 8631, 15333, 8677, 15325, 8769, 15305, 8871, 15264, 8940, 15202, 8909, 15119, 8775, 15022, 8565, 14916, 8328, 14804, 8009, 14688, 7614, 14569, 7287, 14448, 6888, 14321, 6483, 14088, 6171, 15350, 7402, 15350, 7419, 15347, 7480, 15340, 7613, 15322, 7804, 15287, 7973, 15229, 8057, 15148, 8012, 15046, 7846, 14933, 7611, 14810, 7357, 14682, 7069, 14552, 6656, 14421, 6316, 14251, 5948, 14007, 5528, 15356, 5942, 15356, 5977, 15353, 6119, 15348, 6294, 15332, 6551, 15302, 6824, 15249, 7044, 15171, 7122, 15070, 7050, 14949, 6861, 14818, 6611, 14679, 6349, 14538, 6067, 14398, 5651, 14189, 5311, 13935, 4958, 15359, 4123, 15359, 4153, 15356, 4296, 15353, 4646, 15338, 5160, 15311, 5508, 15263, 5829, 15188, 6042, 15088, 6094, 14966, 6001, 14826, 5796, 14678, 5543, 14527, 5287, 14377, 4985, 14133, 4586, 13869, 4257, 15360, 1563, 15360, 1642, 15358, 2076, 15354, 2636, 15341, 3350, 15317, 4019, 15273, 4429, 15203, 4732, 15105, 4911, 14981, 4932, 14836, 4818, 14679, 4621, 14517, 4386, 14359, 4156, 14083, 3795, 13808, 3437, 15360, 122, 15360, 137, 15358, 285, 15355, 636, 15344, 1274, 15322, 2177, 15281, 2765, 15215, 3223, 15120, 3451, 14995, 3569, 14846, 3567, 14681, 3466, 14511, 3305, 14344, 3121, 14037, 2800, 13753, 2467, 15360, 0, 15360, 1, 15359, 21, 15355, 89, 15346, 253, 15325, 479, 15287, 796, 15225, 1148, 15133, 1492, 15008, 1749, 14856, 1882, 14685, 1886, 14506, 1783, 14324, 1608, 13996, 1398, 13702, 1183]);
var xt2 = null;
function ud2() {
  return xt2 === null && (xt2 = new Xt(dd2, 16, 16, Tc, xc), xt2.name = "DFG_LUT", xt2.minFilter = Vt, xt2.magFilter = Vt, xt2.wrapS = $t, xt2.wrapT = $t, xt2.generateMipmaps = false, xt2.needsUpdate = true), xt2;
}
var Pr2 = class {
  constructor(n = {}) {
    let { canvas: t = rm(), context: i = null, depth: l = true, stencil: a = false, alpha: h36 = false, antialias: d = false, premultipliedAlpha: b = true, preserveDrawingBuffer: x = false, powerPreference: w2 = "default", failIfMajorPerformanceCaveat: g2 = false, reversedDepthBuffer: S = false, outputBufferType: R = ia } = n;
    this.isWebGLRenderer = true;
    let O;
    if (i !== null) {
      if (typeof WebGLRenderingContext < "u" && i instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      O = i.getContextAttributes().alpha;
    } else
      O = h36;
    let U2 = R, f = /* @__PURE__ */ new Set([Cc, Ic, Wl]), o = /* @__PURE__ */ new Set([ia, En, yc, df, bc, wc]), P = new Uint32Array(4), M = new Int32Array(4), A = null, C = null, T = [], N3 = [], q3 = null;
    this.domElement = t, this.debug = { checkShaderErrors: true, onShaderError: null }, this.autoClear = true, this.autoClearColor = true, this.autoClearDepth = true, this.autoClearStencil = true, this.sortObjects = true, this.clippingPlanes = [], this.localClippingEnabled = false, this.toneMapping = Kp, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
    let c = this, p = false;
    this._outputColorSpace = Nt;
    let L3 = 0, k = 0, G2 = null, z2 = -1, K = null, B2 = new Dt(), V2 = new Dt(), J = null, xe3 = new V(0), ge3 = 0, Ee3 = t.width, Oe3 = t.height, we3 = 1, nt = null, je2 = null, W3 = new Dt(0, 0, Ee3, Oe3), $ = new Dt(0, 0, Ee3, Oe3), fe3 = false, Ce3 = new rs(), pe3 = false, Ne2 = false, lt2 = new U(), Ie2 = new w(), He2 = new Dt(), ze3 = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: true }, Le2 = false;
    function rt() {
      return G2 === null ? we3 : 1;
    }
    let m = i;
    function at(s, E2) {
      return t.getContext(s, E2);
    }
    try {
      let s = { alpha: true, depth: l, stencil: a, antialias: d, premultipliedAlpha: b, preserveDrawingBuffer: x, powerPreference: w2, failIfMajorPerformanceCaveat: g2 };
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${up}`), t.addEventListener("webglcontextlost", be3, false), t.addEventListener("webglcontextrestored", Ke2, false), t.addEventListener("webglcontextcreationerror", Ve, false), m === null) {
        let E2 = "webgl2";
        if (m = at(E2, s), m === null)
          throw at(E2) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (s) {
      throw X("WebGLRenderer: " + s.message), s;
    }
    let Ge2, qe2, me3, u, r, v, H3, Y3, F, ve2, te3, he3, Re3, Q2, ie3, ue3, _e3, ne2, De3, _2, se2, j2, le3, Z2;
    function X2() {
      Ge2 = new vc2(m), Ge2.init(), j2 = new ad2(m, Ge2), qe2 = new cc2(m, Ge2, n, j2), me3 = new id2(m, Ge2), qe2.reversedDepthBuffer && S && me3.buffers.depth.setReversed(true), u = new xc2(m), r = new kf2(), v = new rd(m, Ge2, me3, r, qe2, j2, u), H3 = new dc2(c), Y3 = new gc2(c), F = new Ro2(m), le3 = new sc(m, F), ve2 = new Sc2(m, F, u, le3), te3 = new Tc2(m, ve2, F, u), De3 = new Mc2(m, qe2, v), ue3 = new fc2(r), he3 = new Vf2(c, H3, Y3, Ge2, qe2, le3, ue3), Re3 = new cd(c, r), Q2 = new zf2(), ie3 = new Zf2(Ge2), ne2 = new oc2(c, H3, Y3, me3, te3, O, b), _e3 = new td2(c, te3, qe2), Z2 = new fd2(m, u, qe2, me3), _2 = new lc2(m, Ge2, u), se2 = new Ec2(m, Ge2, u), u.programs = he3.programs, c.capabilities = qe2, c.extensions = Ge2, c.properties = r, c.renderLists = Q2, c.shadowMap = _e3, c.state = me3, c.info = u;
    }
    X2(), U2 !== ia && (q3 = new Rc2(U2, t.width, t.height, l, a));
    let ee3 = new si2(c, m);
    this.xr = ee3, this.getContext = function() {
      return m;
    }, this.getContextAttributes = function() {
      return m.getContextAttributes();
    }, this.forceContextLoss = function() {
      let s = Ge2.get("WEBGL_lose_context");
      s && s.loseContext();
    }, this.forceContextRestore = function() {
      let s = Ge2.get("WEBGL_lose_context");
      s && s.restoreContext();
    }, this.getPixelRatio = function() {
      return we3;
    }, this.setPixelRatio = function(s) {
      s !== void 0 && (we3 = s, this.setSize(Ee3, Oe3, false));
    }, this.getSize = function(s) {
      return s.set(Ee3, Oe3);
    }, this.setSize = function(s, E2, y3 = true) {
      if (ee3.isPresenting) {
        E("WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      Ee3 = s, Oe3 = E2, t.width = Math.floor(s * we3), t.height = Math.floor(E2 * we3), y3 === true && (t.style.width = s + "px", t.style.height = E2 + "px"), q3 !== null && q3.setSize(t.width, t.height), this.setViewport(0, 0, s, E2);
    }, this.getDrawingBufferSize = function(s) {
      return s.set(Ee3 * we3, Oe3 * we3).floor();
    }, this.setDrawingBufferSize = function(s, E2, y3) {
      Ee3 = s, Oe3 = E2, we3 = y3, t.width = Math.floor(s * y3), t.height = Math.floor(E2 * y3), this.setViewport(0, 0, s, E2);
    }, this.setEffects = function(s) {
      if (U2 === ia) {
        console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");
        return;
      }
      if (s) {
        for (let E2 = 0; E2 < s.length; E2++)
          if (s[E2].isOutputPass === true) {
            console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");
            break;
          }
      }
      q3.setEffects(s || []);
    }, this.getCurrentViewport = function(s) {
      return s.copy(B2);
    }, this.getViewport = function(s) {
      return s.copy(W3);
    }, this.setViewport = function(s, E2, y3, I2) {
      s.isVector4 ? W3.set(s.x, s.y, s.z, s.w) : W3.set(s, E2, y3, I2), me3.viewport(B2.copy(W3).multiplyScalar(we3).round());
    }, this.getScissor = function(s) {
      return s.copy($);
    }, this.setScissor = function(s, E2, y3, I2) {
      s.isVector4 ? $.set(s.x, s.y, s.z, s.w) : $.set(s, E2, y3, I2), me3.scissor(V2.copy($).multiplyScalar(we3).round());
    }, this.getScissorTest = function() {
      return fe3;
    }, this.setScissorTest = function(s) {
      me3.setScissorTest(fe3 = s);
    }, this.setOpaqueSort = function(s) {
      nt = s;
    }, this.setTransparentSort = function(s) {
      je2 = s;
    }, this.getClearColor = function(s) {
      return s.copy(ne2.getClearColor());
    }, this.setClearColor = function() {
      ne2.setClearColor(...arguments);
    }, this.getClearAlpha = function() {
      return ne2.getClearAlpha();
    }, this.setClearAlpha = function() {
      ne2.setClearAlpha(...arguments);
    }, this.clear = function(s = true, E2 = true, y3 = true) {
      let I2 = 0;
      if (s) {
        let D2 = false;
        if (G2 !== null) {
          let re2 = G2.texture.format;
          D2 = f.has(re2);
        }
        if (D2) {
          let re2 = G2.texture.type, ce3 = o.has(re2), oe3 = ne2.getClearColor(), de3 = ne2.getClearAlpha(), Se2 = oe3.r, Ae3 = oe3.g, Me2 = oe3.b;
          ce3 ? (P[0] = Se2, P[1] = Ae3, P[2] = Me2, P[3] = de3, m.clearBufferuiv(m.COLOR, 0, P)) : (M[0] = Se2, M[1] = Ae3, M[2] = Me2, M[3] = de3, m.clearBufferiv(m.COLOR, 0, M));
        } else
          I2 |= m.COLOR_BUFFER_BIT;
      }
      E2 && (I2 |= m.DEPTH_BUFFER_BIT), y3 && (I2 |= m.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), m.clear(I2);
    }, this.clearColor = function() {
      this.clear(true, false, false);
    }, this.clearDepth = function() {
      this.clear(false, true, false);
    }, this.clearStencil = function() {
      this.clear(false, false, true);
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", be3, false), t.removeEventListener("webglcontextrestored", Ke2, false), t.removeEventListener("webglcontextcreationerror", Ve, false), ne2.dispose(), Q2.dispose(), ie3.dispose(), r.dispose(), H3.dispose(), Y3.dispose(), te3.dispose(), le3.dispose(), Z2.dispose(), he3.dispose(), ee3.dispose(), ee3.removeEventListener("sessionstart", di), ee3.removeEventListener("sessionend", ui2), yt2.stop();
    };
    function be3(s) {
      s.preventDefault(), Aa("WebGLRenderer: Context Lost."), p = true;
    }
    function Ke2() {
      Aa("WebGLRenderer: Context Restored."), p = false;
      let s = u.autoReset, E2 = _e3.enabled, y3 = _e3.autoUpdate, I2 = _e3.needsUpdate, D2 = _e3.type;
      X2(), u.autoReset = s, _e3.enabled = E2, _e3.autoUpdate = y3, _e3.needsUpdate = I2, _e3.type = D2;
    }
    function Ve(s) {
      X("WebGLRenderer: A WebGL context could not be created. Reason: ", s.statusMessage);
    }
    function Et2(s) {
      let E2 = s.target;
      E2.removeEventListener("dispose", Et2), Rt2(E2);
    }
    function Rt2(s) {
      ia2(s), r.remove(s);
    }
    function ia2(s) {
      let E2 = r.get(s).programs;
      E2 !== void 0 && (E2.forEach(function(y3) {
        he3.releaseProgram(y3);
      }), s.isShaderMaterial && he3.releaseShaderCache(s));
    }
    this.renderBufferDirect = function(s, E2, y3, I2, D2, re2) {
      E2 === null && (E2 = ze3);
      let ce3 = D2.isMesh && D2.matrixWorld.determinant() < 0, oe3 = aa2(s, E2, y3, I2, D2);
      me3.setMaterial(I2, ce3);
      let de3 = y3.index, Se2 = 1;
      if (I2.wireframe === true) {
        if (de3 = ve2.getWireframeAttribute(y3), de3 === void 0)
          return;
        Se2 = 2;
      }
      let Ae3 = y3.drawRange, Me2 = y3.attributes.position, Ue2 = Ae3.start * Se2, We2 = (Ae3.start + Ae3.count) * Se2;
      re2 !== null && (Ue2 = Math.max(Ue2, re2.start * Se2), We2 = Math.min(We2, (re2.start + re2.count) * Se2)), de3 !== null ? (Ue2 = Math.max(Ue2, 0), We2 = Math.min(We2, de3.count)) : Me2 != null && (Ue2 = Math.max(Ue2, 0), We2 = Math.min(We2, Me2.count));
      let et = We2 - Ue2;
      if (et < 0 || et === 1 / 0)
        return;
      le3.setup(D2, I2, oe3, y3, de3);
      let tt2, Xe2 = _2;
      if (de3 !== null && (tt2 = F.get(de3), Xe2 = se2, Xe2.setIndex(tt2)), D2.isMesh)
        I2.wireframe === true ? (me3.setLineWidth(I2.wireframeLinewidth * rt()), Xe2.setMode(m.LINES)) : Xe2.setMode(m.TRIANGLES);
      else if (D2.isLine) {
        let Te3 = I2.linewidth;
        Te3 === void 0 && (Te3 = 1), me3.setLineWidth(Te3 * rt()), D2.isLineSegments ? Xe2.setMode(m.LINES) : D2.isLineLoop ? Xe2.setMode(m.LINE_LOOP) : Xe2.setMode(m.LINE_STRIP);
      } else
        D2.isPoints ? Xe2.setMode(m.POINTS) : D2.isSprite && Xe2.setMode(m.TRIANGLES);
      if (D2.isBatchedMesh)
        if (D2._multiDrawInstances !== null)
          Ta("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), Xe2.renderMultiDrawInstances(D2._multiDrawStarts, D2._multiDrawCounts, D2._multiDrawCount, D2._multiDrawInstances);
        else if (Ge2.get("WEBGL_multi_draw"))
          Xe2.renderMultiDraw(D2._multiDrawStarts, D2._multiDrawCounts, D2._multiDrawCount);
        else {
          let Te3 = D2._multiDrawStarts, ke2 = D2._multiDrawCounts, ye2 = D2._multiDrawCount, mt2 = de3 ? F.get(de3).bytesPerElement : 1, kt3 = r.get(I2).currentProgram.getUniforms();
          for (let _t2 = 0; _t2 < ye2; _t2++)
            kt3.setValue(m, "_gl_DrawID", _t2), Xe2.render(Te3[_t2] / mt2, ke2[_t2]);
        }
      else if (D2.isInstancedMesh)
        Xe2.renderInstances(Ue2, et, D2.count);
      else if (y3.isInstancedBufferGeometry) {
        let Te3 = y3._maxInstanceCount !== void 0 ? y3._maxInstanceCount : 1 / 0, ke2 = Math.min(y3.instanceCount, Te3);
        Xe2.renderInstances(Ue2, et, ke2);
      } else
        Xe2.render(Ue2, et);
    };
    function fi2(s, E2, y3) {
      s.transparent === true && s.side === _p && s.forceSinglePass === false ? (s.side = Ll, s.needsUpdate = true, fn2(s, E2, y3), s.side = vr, s.needsUpdate = true, fn2(s, E2, y3), s.side = _p) : fn2(s, E2, y3);
    }
    this.compile = function(s, E2, y3 = null) {
      y3 === null && (y3 = s), C = ie3.get(y3), C.init(E2), N3.push(C), y3.traverseVisible(function(D2) {
        D2.isLight && D2.layers.test(E2.layers) && (C.pushLight(D2), D2.castShadow && C.pushShadow(D2));
      }), s !== y3 && s.traverseVisible(function(D2) {
        D2.isLight && D2.layers.test(E2.layers) && (C.pushLight(D2), D2.castShadow && C.pushShadow(D2));
      }), C.setupLights();
      let I2 = /* @__PURE__ */ new Set();
      return s.traverse(function(D2) {
        if (!(D2.isMesh || D2.isPoints || D2.isLine || D2.isSprite))
          return;
        let re2 = D2.material;
        if (re2)
          if (Array.isArray(re2))
            for (let ce3 = 0; ce3 < re2.length; ce3++) {
              let oe3 = re2[ce3];
              fi2(oe3, y3, D2), I2.add(oe3);
            }
          else
            fi2(re2, y3, D2), I2.add(re2);
      }), C = N3.pop(), I2;
    }, this.compileAsync = function(s, E2, y3 = null) {
      let I2 = this.compile(s, E2, y3);
      return new Promise((D2) => {
        function re2() {
          if (I2.forEach(function(ce3) {
            r.get(ce3).currentProgram.isReady() && I2.delete(ce3);
          }), I2.size === 0) {
            D2(s);
            return;
          }
          setTimeout(re2, 10);
        }
        Ge2.get("KHR_parallel_shader_compile") !== null ? re2() : setTimeout(re2, 10);
      });
    };
    let Cn2 = null;
    function ra2(s) {
      Cn2 && Cn2(s);
    }
    function di() {
      yt2.stop();
    }
    function ui2() {
      yt2.start();
    }
    let yt2 = new Jr2();
    yt2.setAnimationLoop(ra2), typeof self < "u" && yt2.setContext(self), this.setAnimationLoop = function(s) {
      Cn2 = s, ee3.setAnimationLoop(s), s === null ? yt2.stop() : yt2.start();
    }, ee3.addEventListener("sessionstart", di), ee3.addEventListener("sessionend", ui2), this.render = function(s, E2) {
      if (E2 !== void 0 && E2.isCamera !== true) {
        X("WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (p === true)
        return;
      let y3 = ee3.enabled === true && ee3.isPresenting === true, I2 = q3 !== null && (G2 === null || y3) && q3.begin(c, G2);
      if (s.matrixWorldAutoUpdate === true && s.updateMatrixWorld(), E2.parent === null && E2.matrixWorldAutoUpdate === true && E2.updateMatrixWorld(), ee3.enabled === true && ee3.isPresenting === true && (q3 === null || q3.isCompositing() === false) && (ee3.cameraAutoUpdate === true && ee3.updateCamera(E2), E2 = ee3.getCamera()), s.isScene === true && s.onBeforeRender(c, s, E2, G2), C = ie3.get(s, N3.length), C.init(E2), N3.push(C), lt2.multiplyMatrices(E2.projectionMatrix, E2.matrixWorldInverse), Ce3.setFromProjectionMatrix(lt2, jt, E2.reversedDepth), Ne2 = this.localClippingEnabled, pe3 = ue3.init(this.clippingPlanes, Ne2), A = Q2.get(s, T.length), A.init(), T.push(A), ee3.enabled === true && ee3.isPresenting === true) {
        let ce3 = c.xr.getDepthSensingMesh();
        ce3 !== null && Pn2(ce3, E2, -1 / 0, c.sortObjects);
      }
      Pn2(s, E2, 0, c.sortObjects), A.finish(), c.sortObjects === true && A.sort(nt, je2), Le2 = ee3.enabled === false || ee3.isPresenting === false || ee3.hasDepthSensing() === false, Le2 && ne2.addToRenderList(A, s), this.info.render.frame++, pe3 === true && ue3.beginShadows();
      let D2 = C.state.shadowsArray;
      if (_e3.render(D2, s, E2), pe3 === true && ue3.endShadows(), this.info.autoReset === true && this.info.reset(), (I2 && q3.hasRenderPass()) === false) {
        let ce3 = A.opaque, oe3 = A.transmissive;
        if (C.setupLights(), E2.isArrayCamera) {
          let de3 = E2.cameras;
          if (oe3.length > 0)
            for (let Se2 = 0, Ae3 = de3.length; Se2 < Ae3; Se2++) {
              let Me2 = de3[Se2];
              hi2(ce3, oe3, s, Me2);
            }
          Le2 && ne2.render(s);
          for (let Se2 = 0, Ae3 = de3.length; Se2 < Ae3; Se2++) {
            let Me2 = de3[Se2];
            pi2(A, s, Me2, Me2.viewport);
          }
        } else
          oe3.length > 0 && hi2(ce3, oe3, s, E2), Le2 && ne2.render(s), pi2(A, s, E2);
      }
      G2 !== null && k === 0 && (v.updateMultisampleRenderTarget(G2), v.updateRenderTargetMipmap(G2)), I2 && q3.end(c), s.isScene === true && s.onAfterRender(c, s, E2), le3.resetDefaultState(), z2 = -1, K = null, N3.pop(), N3.length > 0 ? (C = N3[N3.length - 1], pe3 === true && ue3.setGlobalState(c.clippingPlanes, C.state.camera)) : C = null, T.pop(), T.length > 0 ? A = T[T.length - 1] : A = null;
    };
    function Pn2(s, E2, y3, I2) {
      if (s.visible === false)
        return;
      if (s.layers.test(E2.layers)) {
        if (s.isGroup)
          y3 = s.renderOrder;
        else if (s.isLOD)
          s.autoUpdate === true && s.update(E2);
        else if (s.isLight)
          C.pushLight(s), s.castShadow && C.pushShadow(s);
        else if (s.isSprite) {
          if (!s.frustumCulled || Ce3.intersectsSprite(s)) {
            I2 && He2.setFromMatrixPosition(s.matrixWorld).applyMatrix4(lt2);
            let ce3 = te3.update(s), oe3 = s.material;
            oe3.visible && A.push(s, ce3, oe3, y3, He2.z, null);
          }
        } else if ((s.isMesh || s.isLine || s.isPoints) && (!s.frustumCulled || Ce3.intersectsObject(s))) {
          let ce3 = te3.update(s), oe3 = s.material;
          if (I2 && (s.boundingSphere !== void 0 ? (s.boundingSphere === null && s.computeBoundingSphere(), He2.copy(s.boundingSphere.center)) : (ce3.boundingSphere === null && ce3.computeBoundingSphere(), He2.copy(ce3.boundingSphere.center)), He2.applyMatrix4(s.matrixWorld).applyMatrix4(lt2)), Array.isArray(oe3)) {
            let de3 = ce3.groups;
            for (let Se2 = 0, Ae3 = de3.length; Se2 < Ae3; Se2++) {
              let Me2 = de3[Se2], Ue2 = oe3[Me2.materialIndex];
              Ue2 && Ue2.visible && A.push(s, ce3, Ue2, y3, He2.z, Me2);
            }
          } else
            oe3.visible && A.push(s, ce3, oe3, y3, He2.z, null);
        }
      }
      let re2 = s.children;
      for (let ce3 = 0, oe3 = re2.length; ce3 < oe3; ce3++)
        Pn2(re2[ce3], E2, y3, I2);
    }
    function pi2(s, E2, y3, I2) {
      let { opaque: D2, transmissive: re2, transparent: ce3 } = s;
      C.setupLightsView(y3), pe3 === true && ue3.setGlobalState(c.clippingPlanes, y3), I2 && me3.viewport(B2.copy(I2)), D2.length > 0 && cn2(D2, E2, y3), re2.length > 0 && cn2(re2, E2, y3), ce3.length > 0 && cn2(ce3, E2, y3), me3.buffers.depth.setTest(true), me3.buffers.depth.setMask(true), me3.buffers.color.setMask(true), me3.setPolygonOffset(false);
    }
    function hi2(s, E2, y3, I2) {
      if ((y3.isScene === true ? y3.overrideMaterial : null) !== null)
        return;
      if (C.state.transmissionRenderTarget[I2.id] === void 0) {
        let Ue2 = Ge2.has("EXT_color_buffer_half_float") || Ge2.has("EXT_color_buffer_float");
        C.state.transmissionRenderTarget[I2.id] = new ts(1, 1, { generateMipmaps: true, type: Ue2 ? xc : ia, minFilter: On, samples: qe2.samples, stencilBuffer: a, resolveDepthBuffer: false, resolveStencilBuffer: false, colorSpace: Ft.workingColorSpace });
      }
      let re2 = C.state.transmissionRenderTarget[I2.id], ce3 = I2.viewport || B2;
      re2.setSize(ce3.z * c.transmissionResolutionScale, ce3.w * c.transmissionResolutionScale);
      let oe3 = c.getRenderTarget(), de3 = c.getActiveCubeFace(), Se2 = c.getActiveMipmapLevel();
      c.setRenderTarget(re2), c.getClearColor(xe3), ge3 = c.getClearAlpha(), ge3 < 1 && c.setClearColor(16777215, 0.5), c.clear(), Le2 && ne2.render(y3);
      let Ae3 = c.toneMapping;
      c.toneMapping = Kp;
      let Me2 = I2.viewport;
      if (I2.viewport !== void 0 && (I2.viewport = void 0), C.setupLightsView(I2), pe3 === true && ue3.setGlobalState(c.clippingPlanes, I2), cn2(s, y3, I2), v.updateMultisampleRenderTarget(re2), v.updateRenderTargetMipmap(re2), Ge2.has("WEBGL_multisampled_render_to_texture") === false) {
        let Ue2 = false;
        for (let We2 = 0, et = E2.length; We2 < et; We2++) {
          let tt2 = E2[We2], { object: Xe2, geometry: Te3, material: ke2, group: ye2 } = tt2;
          if (ke2.side === _p && Xe2.layers.test(I2.layers)) {
            let mt2 = ke2.side;
            ke2.side = Ll, ke2.needsUpdate = true, mi2(Xe2, y3, I2, Te3, ke2, ye2), ke2.side = mt2, ke2.needsUpdate = true, Ue2 = true;
          }
        }
        Ue2 === true && (v.updateMultisampleRenderTarget(re2), v.updateRenderTargetMipmap(re2));
      }
      c.setRenderTarget(oe3, de3, Se2), c.setClearColor(xe3, ge3), Me2 !== void 0 && (I2.viewport = Me2), c.toneMapping = Ae3;
    }
    function cn2(s, E2, y3) {
      let I2 = E2.isScene === true ? E2.overrideMaterial : null;
      for (let D2 = 0, re2 = s.length; D2 < re2; D2++) {
        let ce3 = s[D2], { object: oe3, geometry: de3, group: Se2 } = ce3, Ae3 = ce3.material;
        Ae3.allowOverride === true && I2 !== null && (Ae3 = I2), oe3.layers.test(y3.layers) && mi2(oe3, E2, y3, de3, Ae3, Se2);
      }
    }
    function mi2(s, E2, y3, I2, D2, re2) {
      s.onBeforeRender(c, E2, y3, I2, D2, re2), s.modelViewMatrix.multiplyMatrices(y3.matrixWorldInverse, s.matrixWorld), s.normalMatrix.getNormalMatrix(s.modelViewMatrix), D2.onBeforeRender(c, E2, y3, I2, s, re2), D2.transparent === true && D2.side === _p && D2.forceSinglePass === false ? (D2.side = Ll, D2.needsUpdate = true, c.renderBufferDirect(y3, E2, I2, D2, s, re2), D2.side = vr, D2.needsUpdate = true, c.renderBufferDirect(y3, E2, I2, D2, s, re2), D2.side = _p) : c.renderBufferDirect(y3, E2, I2, D2, s, re2), s.onAfterRender(c, E2, y3, I2, D2, re2);
    }
    function fn2(s, E2, y3) {
      E2.isScene !== true && (E2 = ze3);
      let I2 = r.get(s), D2 = C.state.lights, re2 = C.state.shadowsArray, ce3 = D2.state.version, oe3 = he3.getParameters(s, D2.state, re2, E2, y3), de3 = he3.getProgramCacheKey(oe3), Se2 = I2.programs;
      I2.environment = s.isMeshStandardMaterial ? E2.environment : null, I2.fog = E2.fog, I2.envMap = (s.isMeshStandardMaterial ? Y3 : H3).get(s.envMap || I2.environment), I2.envMapRotation = I2.environment !== null && s.envMap === null ? E2.environmentRotation : s.envMapRotation, Se2 === void 0 && (s.addEventListener("dispose", Et2), Se2 = /* @__PURE__ */ new Map(), I2.programs = Se2);
      let Ae3 = Se2.get(de3);
      if (Ae3 !== void 0) {
        if (I2.currentProgram === Ae3 && I2.lightsStateVersion === ce3)
          return gi2(s, oe3), Ae3;
      } else
        oe3.uniforms = he3.getUniforms(s), s.onBeforeCompile(oe3, c), Ae3 = he3.acquireProgram(oe3, de3), Se2.set(de3, Ae3), I2.uniforms = oe3.uniforms;
      let Me2 = I2.uniforms;
      return (!s.isShaderMaterial && !s.isRawShaderMaterial || s.clipping === true) && (Me2.clippingPlanes = ue3.uniform), gi2(s, oe3), I2.needsLights = sa2(s), I2.lightsStateVersion = ce3, I2.needsLights && (Me2.ambientLightColor.value = D2.state.ambient, Me2.lightProbe.value = D2.state.probe, Me2.directionalLights.value = D2.state.directional, Me2.directionalLightShadows.value = D2.state.directionalShadow, Me2.spotLights.value = D2.state.spot, Me2.spotLightShadows.value = D2.state.spotShadow, Me2.rectAreaLights.value = D2.state.rectArea, Me2.ltc_1.value = D2.state.rectAreaLTC1, Me2.ltc_2.value = D2.state.rectAreaLTC2, Me2.pointLights.value = D2.state.point, Me2.pointLightShadows.value = D2.state.pointShadow, Me2.hemisphereLights.value = D2.state.hemi, Me2.directionalShadowMap.value = D2.state.directionalShadowMap, Me2.directionalShadowMatrix.value = D2.state.directionalShadowMatrix, Me2.spotShadowMap.value = D2.state.spotShadowMap, Me2.spotLightMatrix.value = D2.state.spotLightMatrix, Me2.spotLightMap.value = D2.state.spotLightMap, Me2.pointShadowMap.value = D2.state.pointShadowMap, Me2.pointShadowMatrix.value = D2.state.pointShadowMatrix), I2.currentProgram = Ae3, I2.uniformsList = null, Ae3;
    }
    function _i(s) {
      if (s.uniformsList === null) {
        let E2 = s.currentProgram.getUniforms();
        s.uniformsList = Yt2.seqWithValue(E2.seq, s.uniforms);
      }
      return s.uniformsList;
    }
    function gi2(s, E2) {
      let y3 = r.get(s);
      y3.outputColorSpace = E2.outputColorSpace, y3.batching = E2.batching, y3.batchingColor = E2.batchingColor, y3.instancing = E2.instancing, y3.instancingColor = E2.instancingColor, y3.instancingMorph = E2.instancingMorph, y3.skinning = E2.skinning, y3.morphTargets = E2.morphTargets, y3.morphNormals = E2.morphNormals, y3.morphColors = E2.morphColors, y3.morphTargetsCount = E2.morphTargetsCount, y3.numClippingPlanes = E2.numClippingPlanes, y3.numIntersection = E2.numClipIntersection, y3.vertexAlphas = E2.vertexAlphas, y3.vertexTangents = E2.vertexTangents, y3.toneMapping = E2.toneMapping;
    }
    function aa2(s, E2, y3, I2, D2) {
      E2.isScene !== true && (E2 = ze3), v.resetTextureUnits();
      let re2 = E2.fog, ce3 = I2.isMeshStandardMaterial ? E2.environment : null, oe3 = G2 === null ? c.outputColorSpace : G2.isXRRenderTarget === true ? G2.texture.colorSpace : Ma, de3 = (I2.isMeshStandardMaterial ? Y3 : H3).get(I2.envMap || ce3), Se2 = I2.vertexColors === true && !!y3.attributes.color && y3.attributes.color.itemSize === 4, Ae3 = !!y3.attributes.tangent && (!!I2.normalMap || I2.anisotropy > 0), Me2 = !!y3.morphAttributes.position, Ue2 = !!y3.morphAttributes.normal, We2 = !!y3.morphAttributes.color, et = Kp;
      I2.toneMapped && (G2 === null || G2.isXRRenderTarget === true) && (et = c.toneMapping);
      let tt2 = y3.morphAttributes.position || y3.morphAttributes.normal || y3.morphAttributes.color, Xe2 = tt2 !== void 0 ? tt2.length : 0, Te3 = r.get(I2), ke2 = C.state.lights;
      if (pe3 === true && (Ne2 === true || s !== K)) {
        let ct2 = s === K && I2.id === z2;
        ue3.setState(I2, s, ct2);
      }
      let ye2 = false;
      I2.version === Te3.__version ? (Te3.needsLights && Te3.lightsStateVersion !== ke2.state.version || Te3.outputColorSpace !== oe3 || D2.isBatchedMesh && Te3.batching === false || !D2.isBatchedMesh && Te3.batching === true || D2.isBatchedMesh && Te3.batchingColor === true && D2.colorTexture === null || D2.isBatchedMesh && Te3.batchingColor === false && D2.colorTexture !== null || D2.isInstancedMesh && Te3.instancing === false || !D2.isInstancedMesh && Te3.instancing === true || D2.isSkinnedMesh && Te3.skinning === false || !D2.isSkinnedMesh && Te3.skinning === true || D2.isInstancedMesh && Te3.instancingColor === true && D2.instanceColor === null || D2.isInstancedMesh && Te3.instancingColor === false && D2.instanceColor !== null || D2.isInstancedMesh && Te3.instancingMorph === true && D2.morphTexture === null || D2.isInstancedMesh && Te3.instancingMorph === false && D2.morphTexture !== null || Te3.envMap !== de3 || I2.fog === true && Te3.fog !== re2 || Te3.numClippingPlanes !== void 0 && (Te3.numClippingPlanes !== ue3.numPlanes || Te3.numIntersection !== ue3.numIntersection) || Te3.vertexAlphas !== Se2 || Te3.vertexTangents !== Ae3 || Te3.morphTargets !== Me2 || Te3.morphNormals !== Ue2 || Te3.morphColors !== We2 || Te3.toneMapping !== et || Te3.morphTargetsCount !== Xe2) && (ye2 = true) : (ye2 = true, Te3.__version = I2.version);
      let mt2 = Te3.currentProgram;
      ye2 === true && (mt2 = fn2(I2, E2, D2));
      let kt3 = false, _t2 = false, Qt2 = false, $e2 = mt2.getUniforms(), ft2 = Te3.uniforms;
      if (me3.useProgram(mt2.program) && (kt3 = true, _t2 = true, Qt2 = true), I2.id !== z2 && (z2 = I2.id, _t2 = true), kt3 || K !== s) {
        me3.buffers.depth.getReversed() && s.reversedDepth !== true && (s._reversedDepth = true, s.updateProjectionMatrix()), $e2.setValue(m, "projectionMatrix", s.projectionMatrix), $e2.setValue(m, "viewMatrix", s.matrixWorldInverse);
        let dt = $e2.map.cameraPosition;
        dt !== void 0 && dt.setValue(m, Ie2.setFromMatrixPosition(s.matrixWorld)), qe2.logarithmicDepthBuffer && $e2.setValue(m, "logDepthBufFC", 2 / (Math.log(s.far + 1) / Math.LN2)), (I2.isMeshPhongMaterial || I2.isMeshToonMaterial || I2.isMeshLambertMaterial || I2.isMeshBasicMaterial || I2.isMeshStandardMaterial || I2.isShaderMaterial) && $e2.setValue(m, "isOrthographic", s.isOrthographicCamera === true), K !== s && (K = s, _t2 = true, Qt2 = true);
      }
      if (Te3.needsLights && (ke2.state.directionalShadowMap.length > 0 && $e2.setValue(m, "directionalShadowMap", ke2.state.directionalShadowMap, v), ke2.state.spotShadowMap.length > 0 && $e2.setValue(m, "spotShadowMap", ke2.state.spotShadowMap, v), ke2.state.pointShadowMap.length > 0 && $e2.setValue(m, "pointShadowMap", ke2.state.pointShadowMap, v)), D2.isSkinnedMesh) {
        $e2.setOptional(m, D2, "bindMatrix"), $e2.setOptional(m, D2, "bindMatrixInverse");
        let ct2 = D2.skeleton;
        ct2 && (ct2.boneTexture === null && ct2.computeBoneTexture(), $e2.setValue(m, "boneTexture", ct2.boneTexture, v));
      }
      D2.isBatchedMesh && ($e2.setOptional(m, D2, "batchingTexture"), $e2.setValue(m, "batchingTexture", D2._matricesTexture, v), $e2.setOptional(m, D2, "batchingIdTexture"), $e2.setValue(m, "batchingIdTexture", D2._indirectTexture, v), $e2.setOptional(m, D2, "batchingColorTexture"), D2._colorsTexture !== null && $e2.setValue(m, "batchingColorTexture", D2._colorsTexture, v));
      let gt2 = y3.morphAttributes;
      if ((gt2.position !== void 0 || gt2.normal !== void 0 || gt2.color !== void 0) && De3.update(D2, y3, mt2), (_t2 || Te3.receiveShadow !== D2.receiveShadow) && (Te3.receiveShadow = D2.receiveShadow, $e2.setValue(m, "receiveShadow", D2.receiveShadow)), I2.isMeshGouraudMaterial && I2.envMap !== null && (ft2.envMap.value = de3, ft2.flipEnvMap.value = de3.isCubeTexture && de3.isRenderTargetTexture === false ? -1 : 1), I2.isMeshStandardMaterial && I2.envMap === null && E2.environment !== null && (ft2.envMapIntensity.value = E2.environmentIntensity), ft2.dfgLUT !== void 0 && (ft2.dfgLUT.value = ud2()), _t2 && ($e2.setValue(m, "toneMappingExposure", c.toneMappingExposure), Te3.needsLights && oa2(ft2, Qt2), re2 && I2.fog === true && Re3.refreshFogUniforms(ft2, re2), Re3.refreshMaterialUniforms(ft2, I2, we3, Oe3, C.state.transmissionRenderTarget[s.id]), Yt2.upload(m, _i(Te3), ft2, v)), I2.isShaderMaterial && I2.uniformsNeedUpdate === true && (Yt2.upload(m, _i(Te3), ft2, v), I2.uniformsNeedUpdate = false), I2.isSpriteMaterial && $e2.setValue(m, "center", D2.center), $e2.setValue(m, "modelViewMatrix", D2.modelViewMatrix), $e2.setValue(m, "normalMatrix", D2.normalMatrix), $e2.setValue(m, "modelMatrix", D2.matrixWorld), I2.isShaderMaterial || I2.isRawShaderMaterial) {
        let ct2 = I2.uniformsGroups;
        for (let dt = 0, Ln2 = ct2.length; dt < Ln2; dt++) {
          let Ft3 = ct2[dt];
          Z2.update(Ft3, mt2), Z2.bind(Ft3, mt2);
        }
      }
      return mt2;
    }
    function oa2(s, E2) {
      s.ambientLightColor.needsUpdate = E2, s.lightProbe.needsUpdate = E2, s.directionalLights.needsUpdate = E2, s.directionalLightShadows.needsUpdate = E2, s.pointLights.needsUpdate = E2, s.pointLightShadows.needsUpdate = E2, s.spotLights.needsUpdate = E2, s.spotLightShadows.needsUpdate = E2, s.rectAreaLights.needsUpdate = E2, s.hemisphereLights.needsUpdate = E2;
    }
    function sa2(s) {
      return s.isMeshLambertMaterial || s.isMeshToonMaterial || s.isMeshPhongMaterial || s.isMeshStandardMaterial || s.isShadowMaterial || s.isShaderMaterial && s.lights === true;
    }
    this.getActiveCubeFace = function() {
      return L3;
    }, this.getActiveMipmapLevel = function() {
      return k;
    }, this.getRenderTarget = function() {
      return G2;
    }, this.setRenderTargetTextures = function(s, E2, y3) {
      let I2 = r.get(s);
      I2.__autoAllocateDepthBuffer = s.resolveDepthBuffer === false, I2.__autoAllocateDepthBuffer === false && (I2.__useRenderToTexture = false), r.get(s.texture).__webglTexture = E2, r.get(s.depthTexture).__webglTexture = I2.__autoAllocateDepthBuffer ? void 0 : y3, I2.__hasExternalTextures = true;
    }, this.setRenderTargetFramebuffer = function(s, E2) {
      let y3 = r.get(s);
      y3.__webglFramebuffer = E2, y3.__useDefaultFramebuffer = E2 === void 0;
    };
    let la = m.createFramebuffer();
    this.setRenderTarget = function(s, E2 = 0, y3 = 0) {
      G2 = s, L3 = E2, k = y3;
      let I2 = null, D2 = false, re2 = false;
      if (s) {
        let oe3 = r.get(s);
        if (oe3.__useDefaultFramebuffer !== void 0) {
          me3.bindFramebuffer(m.FRAMEBUFFER, oe3.__webglFramebuffer), B2.copy(s.viewport), V2.copy(s.scissor), J = s.scissorTest, me3.viewport(B2), me3.scissor(V2), me3.setScissorTest(J), z2 = -1;
          return;
        } else if (oe3.__webglFramebuffer === void 0)
          v.setupRenderTarget(s);
        else if (oe3.__hasExternalTextures)
          v.rebindTextures(s, r.get(s.texture).__webglTexture, r.get(s.depthTexture).__webglTexture);
        else if (s.depthBuffer) {
          let Ae3 = s.depthTexture;
          if (oe3.__boundDepthTexture !== Ae3) {
            if (Ae3 !== null && r.has(Ae3) && (s.width !== Ae3.image.width || s.height !== Ae3.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            v.setupDepthRenderbuffer(s);
          }
        }
        let de3 = s.texture;
        (de3.isData3DTexture || de3.isDataArrayTexture || de3.isCompressedArrayTexture) && (re2 = true);
        let Se2 = r.get(s).__webglFramebuffer;
        s.isWebGLCubeRenderTarget ? (Array.isArray(Se2[E2]) ? I2 = Se2[E2][y3] : I2 = Se2[E2], D2 = true) : s.samples > 0 && v.useMultisampledRTT(s) === false ? I2 = r.get(s).__webglMultisampledFramebuffer : Array.isArray(Se2) ? I2 = Se2[y3] : I2 = Se2, B2.copy(s.viewport), V2.copy(s.scissor), J = s.scissorTest;
      } else
        B2.copy(W3).multiplyScalar(we3).floor(), V2.copy($).multiplyScalar(we3).floor(), J = fe3;
      if (y3 !== 0 && (I2 = la), me3.bindFramebuffer(m.FRAMEBUFFER, I2) && me3.drawBuffers(s, I2), me3.viewport(B2), me3.scissor(V2), me3.setScissorTest(J), D2) {
        let oe3 = r.get(s.texture);
        m.framebufferTexture2D(m.FRAMEBUFFER, m.COLOR_ATTACHMENT0, m.TEXTURE_CUBE_MAP_POSITIVE_X + E2, oe3.__webglTexture, y3);
      } else if (re2) {
        let oe3 = E2;
        for (let de3 = 0; de3 < s.textures.length; de3++) {
          let Se2 = r.get(s.textures[de3]);
          m.framebufferTextureLayer(m.FRAMEBUFFER, m.COLOR_ATTACHMENT0 + de3, Se2.__webglTexture, y3, oe3);
        }
      } else if (s !== null && y3 !== 0) {
        let oe3 = r.get(s.texture);
        m.framebufferTexture2D(m.FRAMEBUFFER, m.COLOR_ATTACHMENT0, m.TEXTURE_2D, oe3.__webglTexture, y3);
      }
      z2 = -1;
    }, this.readRenderTargetPixels = function(s, E2, y3, I2, D2, re2, ce3, oe3 = 0) {
      if (!(s && s.isWebGLRenderTarget)) {
        X("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let de3 = r.get(s).__webglFramebuffer;
      if (s.isWebGLCubeRenderTarget && ce3 !== void 0 && (de3 = de3[ce3]), de3) {
        me3.bindFramebuffer(m.FRAMEBUFFER, de3);
        try {
          let Se2 = s.textures[oe3], Ae3 = Se2.format, Me2 = Se2.type;
          if (!qe2.textureFormatReadable(Ae3)) {
            X("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!qe2.textureTypeReadable(Me2)) {
            X("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          E2 >= 0 && E2 <= s.width - I2 && y3 >= 0 && y3 <= s.height - D2 && (s.textures.length > 1 && m.readBuffer(m.COLOR_ATTACHMENT0 + oe3), m.readPixels(E2, y3, I2, D2, j2.convert(Ae3), j2.convert(Me2), re2));
        } finally {
          let Se2 = G2 !== null ? r.get(G2).__webglFramebuffer : null;
          me3.bindFramebuffer(m.FRAMEBUFFER, Se2);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(s, E2, y3, I2, D2, re2, ce3, oe3 = 0) {
      if (!(s && s.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let de3 = r.get(s).__webglFramebuffer;
      if (s.isWebGLCubeRenderTarget && ce3 !== void 0 && (de3 = de3[ce3]), de3)
        if (E2 >= 0 && E2 <= s.width - I2 && y3 >= 0 && y3 <= s.height - D2) {
          me3.bindFramebuffer(m.FRAMEBUFFER, de3);
          let Se2 = s.textures[oe3], Ae3 = Se2.format, Me2 = Se2.type;
          if (!qe2.textureFormatReadable(Ae3))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!qe2.textureTypeReadable(Me2))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          let Ue2 = m.createBuffer();
          m.bindBuffer(m.PIXEL_PACK_BUFFER, Ue2), m.bufferData(m.PIXEL_PACK_BUFFER, re2.byteLength, m.STREAM_READ), s.textures.length > 1 && m.readBuffer(m.COLOR_ATTACHMENT0 + oe3), m.readPixels(E2, y3, I2, D2, j2.convert(Ae3), j2.convert(Me2), 0);
          let We2 = G2 !== null ? r.get(G2).__webglFramebuffer : null;
          me3.bindFramebuffer(m.FRAMEBUFFER, We2);
          let et = m.fenceSync(m.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return m.flush(), await hm(m, et, 4), m.bindBuffer(m.PIXEL_PACK_BUFFER, Ue2), m.getBufferSubData(m.PIXEL_PACK_BUFFER, 0, re2), m.deleteBuffer(Ue2), m.deleteSync(et), re2;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
    }, this.copyFramebufferToTexture = function(s, E2 = null, y3 = 0) {
      let I2 = Math.pow(2, -y3), D2 = Math.floor(s.image.width * I2), re2 = Math.floor(s.image.height * I2), ce3 = E2 !== null ? E2.x : 0, oe3 = E2 !== null ? E2.y : 0;
      v.setTexture2D(s, 0), m.copyTexSubImage2D(m.TEXTURE_2D, y3, 0, 0, ce3, oe3, D2, re2), me3.unbindTexture();
    };
    let ca = m.createFramebuffer(), fa = m.createFramebuffer();
    this.copyTextureToTexture = function(s, E2, y3 = null, I2 = null, D2 = 0, re2 = null) {
      re2 === null && (D2 !== 0 ? (Ta("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), re2 = D2, D2 = 0) : re2 = 0);
      let ce3, oe3, de3, Se2, Ae3, Me2, Ue2, We2, et, tt2 = s.isCompressedTexture ? s.mipmaps[re2] : s.image;
      if (y3 !== null)
        ce3 = y3.max.x - y3.min.x, oe3 = y3.max.y - y3.min.y, de3 = y3.isBox3 ? y3.max.z - y3.min.z : 1, Se2 = y3.min.x, Ae3 = y3.min.y, Me2 = y3.isBox3 ? y3.min.z : 0;
      else {
        let gt2 = Math.pow(2, -D2);
        ce3 = Math.floor(tt2.width * gt2), oe3 = Math.floor(tt2.height * gt2), s.isDataArrayTexture ? de3 = tt2.depth : s.isData3DTexture ? de3 = Math.floor(tt2.depth * gt2) : de3 = 1, Se2 = 0, Ae3 = 0, Me2 = 0;
      }
      I2 !== null ? (Ue2 = I2.x, We2 = I2.y, et = I2.z) : (Ue2 = 0, We2 = 0, et = 0);
      let Xe2 = j2.convert(E2.format), Te3 = j2.convert(E2.type), ke2;
      E2.isData3DTexture ? (v.setTexture3D(E2, 0), ke2 = m.TEXTURE_3D) : E2.isDataArrayTexture || E2.isCompressedArrayTexture ? (v.setTexture2DArray(E2, 0), ke2 = m.TEXTURE_2D_ARRAY) : (v.setTexture2D(E2, 0), ke2 = m.TEXTURE_2D), m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL, E2.flipY), m.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL, E2.premultiplyAlpha), m.pixelStorei(m.UNPACK_ALIGNMENT, E2.unpackAlignment);
      let ye2 = m.getParameter(m.UNPACK_ROW_LENGTH), mt2 = m.getParameter(m.UNPACK_IMAGE_HEIGHT), kt3 = m.getParameter(m.UNPACK_SKIP_PIXELS), _t2 = m.getParameter(m.UNPACK_SKIP_ROWS), Qt2 = m.getParameter(m.UNPACK_SKIP_IMAGES);
      m.pixelStorei(m.UNPACK_ROW_LENGTH, tt2.width), m.pixelStorei(m.UNPACK_IMAGE_HEIGHT, tt2.height), m.pixelStorei(m.UNPACK_SKIP_PIXELS, Se2), m.pixelStorei(m.UNPACK_SKIP_ROWS, Ae3), m.pixelStorei(m.UNPACK_SKIP_IMAGES, Me2);
      let $e2 = s.isDataArrayTexture || s.isData3DTexture, ft2 = E2.isDataArrayTexture || E2.isData3DTexture;
      if (s.isDepthTexture) {
        let gt2 = r.get(s), ct2 = r.get(E2), dt = r.get(gt2.__renderTarget), Ln2 = r.get(ct2.__renderTarget);
        me3.bindFramebuffer(m.READ_FRAMEBUFFER, dt.__webglFramebuffer), me3.bindFramebuffer(m.DRAW_FRAMEBUFFER, Ln2.__webglFramebuffer);
        for (let Ft3 = 0; Ft3 < de3; Ft3++)
          $e2 && (m.framebufferTextureLayer(m.READ_FRAMEBUFFER, m.COLOR_ATTACHMENT0, r.get(s).__webglTexture, D2, Me2 + Ft3), m.framebufferTextureLayer(m.DRAW_FRAMEBUFFER, m.COLOR_ATTACHMENT0, r.get(E2).__webglTexture, re2, et + Ft3)), m.blitFramebuffer(Se2, Ae3, ce3, oe3, Ue2, We2, ce3, oe3, m.DEPTH_BUFFER_BIT, m.NEAREST);
        me3.bindFramebuffer(m.READ_FRAMEBUFFER, null), me3.bindFramebuffer(m.DRAW_FRAMEBUFFER, null);
      } else if (D2 !== 0 || s.isRenderTargetTexture || r.has(s)) {
        let gt2 = r.get(s), ct2 = r.get(E2);
        me3.bindFramebuffer(m.READ_FRAMEBUFFER, ca), me3.bindFramebuffer(m.DRAW_FRAMEBUFFER, fa);
        for (let dt = 0; dt < de3; dt++)
          $e2 ? m.framebufferTextureLayer(m.READ_FRAMEBUFFER, m.COLOR_ATTACHMENT0, gt2.__webglTexture, D2, Me2 + dt) : m.framebufferTexture2D(m.READ_FRAMEBUFFER, m.COLOR_ATTACHMENT0, m.TEXTURE_2D, gt2.__webglTexture, D2), ft2 ? m.framebufferTextureLayer(m.DRAW_FRAMEBUFFER, m.COLOR_ATTACHMENT0, ct2.__webglTexture, re2, et + dt) : m.framebufferTexture2D(m.DRAW_FRAMEBUFFER, m.COLOR_ATTACHMENT0, m.TEXTURE_2D, ct2.__webglTexture, re2), D2 !== 0 ? m.blitFramebuffer(Se2, Ae3, ce3, oe3, Ue2, We2, ce3, oe3, m.COLOR_BUFFER_BIT, m.NEAREST) : ft2 ? m.copyTexSubImage3D(ke2, re2, Ue2, We2, et + dt, Se2, Ae3, ce3, oe3) : m.copyTexSubImage2D(ke2, re2, Ue2, We2, Se2, Ae3, ce3, oe3);
        me3.bindFramebuffer(m.READ_FRAMEBUFFER, null), me3.bindFramebuffer(m.DRAW_FRAMEBUFFER, null);
      } else
        ft2 ? s.isDataTexture || s.isData3DTexture ? m.texSubImage3D(ke2, re2, Ue2, We2, et, ce3, oe3, de3, Xe2, Te3, tt2.data) : E2.isCompressedArrayTexture ? m.compressedTexSubImage3D(ke2, re2, Ue2, We2, et, ce3, oe3, de3, Xe2, tt2.data) : m.texSubImage3D(ke2, re2, Ue2, We2, et, ce3, oe3, de3, Xe2, Te3, tt2) : s.isDataTexture ? m.texSubImage2D(m.TEXTURE_2D, re2, Ue2, We2, ce3, oe3, Xe2, Te3, tt2.data) : s.isCompressedTexture ? m.compressedTexSubImage2D(m.TEXTURE_2D, re2, Ue2, We2, tt2.width, tt2.height, Xe2, tt2.data) : m.texSubImage2D(m.TEXTURE_2D, re2, Ue2, We2, ce3, oe3, Xe2, Te3, tt2);
      m.pixelStorei(m.UNPACK_ROW_LENGTH, ye2), m.pixelStorei(m.UNPACK_IMAGE_HEIGHT, mt2), m.pixelStorei(m.UNPACK_SKIP_PIXELS, kt3), m.pixelStorei(m.UNPACK_SKIP_ROWS, _t2), m.pixelStorei(m.UNPACK_SKIP_IMAGES, Qt2), re2 === 0 && E2.generateMipmaps && m.generateMipmap(ke2), me3.unbindTexture();
    }, this.initRenderTarget = function(s) {
      r.get(s).__webglFramebuffer === void 0 && v.setupRenderTarget(s);
    }, this.initTexture = function(s) {
      s.isCubeTexture ? v.setTextureCube(s, 0) : s.isData3DTexture ? v.setTexture3D(s, 0) : s.isDataArrayTexture || s.isCompressedArrayTexture ? v.setTexture2DArray(s, 0) : v.setTexture2D(s, 0), me3.unbindTexture();
    }, this.resetState = function() {
      L3 = 0, k = 0, G2 = null, me3.reset(), le3.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return jt;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(n) {
    this._outputColorSpace = n;
    let t = this.getContext();
    t.drawingBufferColorSpace = Ft._getDrawingBufferColorSpace(n), t.unpackColorSpace = Ft._getUnpackColorSpace();
  }
};

// http-url:https://esm.sh/simplex-noise@4.0.1/es2020/simplex-noise.bundle.mjs
var M1 = 0.5 * (Math.sqrt(3) - 1);
var r1 = (3 - Math.sqrt(3)) / 6;
var b1 = 1 / 3;
var Y2 = 1 / 6;
var D1 = (Math.sqrt(5) - 1) / 4;
var y = (5 - Math.sqrt(5)) / 20;
var W = (Z2) => Math.floor(Z2) | 0;
var h1 = new Float64Array([1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 1, 0, -1, 0, 0, 1, 0, -1, 0, 1, 0, -1]);
var A1 = new Float64Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]);
var i1 = new Float64Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1, -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1, 1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1, -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0]);
function S1(Z2 = Math.random) {
  let t = G1(Z2), i = new Float64Array(t).map((a) => h1[a % 12 * 2]), n = new Float64Array(t).map((a) => h1[a % 12 * 2 + 1]);
  return function(f, m) {
    let G2 = 0, h36 = 0, M = 0, b = (f + m) * M1, z2 = W(f + b), A = W(m + b), D2 = (z2 + A) * r1, P = z2 - D2, T = A - D2, u = f - P, F = m - T, S, q3;
    u > F ? (S = 1, q3 = 0) : (S = 0, q3 = 1);
    let U2 = u - S + r1, p = F - q3 + r1, d = u - 1 + 2 * r1, g2 = F - 1 + 2 * r1, j2 = z2 & 255, k = A & 255, s = 0.5 - u * u - F * F;
    if (s >= 0) {
      let o = j2 + t[k], w2 = i[o], x = n[o];
      s *= s, G2 = s * s * (w2 * u + x * F);
    }
    let c = 0.5 - U2 * U2 - p * p;
    if (c >= 0) {
      let o = j2 + S + t[k + q3], w2 = i[o], x = n[o];
      c *= c, h36 = c * c * (w2 * U2 + x * p);
    }
    let e = 0.5 - d * d - g2 * g2;
    if (e >= 0) {
      let o = j2 + 1 + t[k + 1], w2 = i[o], x = n[o];
      e *= e, M = e * e * (w2 * d + x * g2);
    }
    return 70 * (G2 + h36 + M);
  };
}
function G1(Z2) {
  let i = new Uint8Array(512);
  for (let n = 0; n < 512 / 2; n++)
    i[n] = n;
  for (let n = 0; n < 512 / 2 - 1; n++) {
    let a = n + ~~(Z2() * (256 - n)), f = i[n];
    i[n] = i[a], i[a] = f;
  }
  for (let n = 256; n < 512; n++)
    i[n] = i[n - 256];
  return i;
}

// vfs:vfs:/src/GrassTerrain.js
var noise2D = S1();
function getTerrainHeight(x, z2, chunkX = 0, chunkZ = 0, chunkSize = 120) {
  const worldX = x + chunkX * chunkSize;
  const worldZ = z2 + chunkZ * chunkSize;
  let base = noise2D(worldX / 220, worldZ / 220);
  base = Math.sign(base) * Math.pow(Math.abs(base), 1.2);
  let mid = noise2D(worldX / 90, worldZ / 90);
  let detail = noise2D(worldX / 30, worldZ / 30);
  let y3 = 0;
  y3 += base * 20;
  y3 += mid * 1;
  y3 += detail * 1;
  y3 += 1;
  return y3;
}
function createGrassMaterial() {
  const vertexShader = `
    precision mediump float;

    attribute vec3 offset;
    attribute vec2 worldOffset;
    attribute vec4 orientation;
    attribute float halfRootAngleSin;
    attribute float halfRootAngleCos;
    attribute float stretch;
    attribute float trail;
    attribute vec2 trailDir;

    uniform float time;
    uniform float bladeHeight;

    varying vec2 vUv;
    varying float frc;
    varying float vTrail;
    varying vec3 vWorldPosition;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(
        0.211324865405187,
        0.366025403784439,
        -0.577350269189626,
        0.024390243902439
      );
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(
        0.5 - vec3(
          dot(x0,x0),
          dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)
        ), 0.0
      );
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    vec3 rotateVectorByQuaternion(vec3 v, vec4 q){
      return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
    }

    vec4 slerp(vec4 v0, vec4 v1, float t) {
      v0 = normalize(v0);
      v1 = normalize(v1);
      float dot_ = dot(v0, v1);
      if (dot_ < 0.0) {
        v1 = -v1;
        dot_ = -dot_;
      }
      const float DOT_THRESHOLD = 0.9995;
      if (dot_ > DOT_THRESHOLD) {
        vec4 result = t * (v1 - v0) + v0;
        result = normalize(result);
        return result;
      }
      float theta_0 = acos(dot_);
      float theta = theta_0 * t;
      float sin_theta = sin(theta);
      float sin_theta_0 = sin(theta_0);
      float s0 = cos(theta) - dot_ * sin_theta / sin_theta_0;
      float s1 = sin_theta / sin_theta_0;
      return (s0 * v0) + (s1 * v1);
    }

    void main() {
      frc = position.y / bladeHeight;

      float noise = 0.5 - snoise(vec2(
        time - worldOffset.x / 50.0,
        time - worldOffset.y / 50.0
      ));

      vec4 direction = vec4(0.0, halfRootAngleSin, 0.0, halfRootAngleCos);
      direction = slerp(direction, orientation, frc);

      vec3 vPosition = vec3(position.x, position.y + position.y * stretch, position.z);
      vPosition = rotateVectorByQuaternion(vPosition, direction);

      float halfAngle = noise * 0.25;
      vPosition = rotateVectorByQuaternion(vPosition, normalize(vec4(
        sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle)
      )));

      float t = clamp(trail, 0.0, 1.0);
      float trailStrength = 3.25;
      t *= trailStrength;

      if (t > 0.001) {
        vec2 d2 = trailDir;
        float len = length(d2);
        if (len > 0.0001) {
          vec3 pushDir = normalize(vec3(d2.x, 0.0, d2.y));
          float heightFactor = frc;
          float baseAmount = 0.35;
          float strength = t * heightFactor * baseAmount;
          vec3 push = pushDir * strength;
          vPosition += push;
        }
      }

      vUv = uv;
      float colorTrailStrength = 0.3;
      vTrail = clamp(trail * colorTrailStrength, 0.0, 1.0);

      vec4 worldPos = modelMatrix * vec4(offset + vPosition, 1.0);
      vWorldPosition = worldPos.xyz;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(offset + vPosition, 1.0);
    }
  `;
  const fragmentShader = `
    precision mediump float;

    uniform sampler2D map;
    uniform sampler2D alphaMap;
    uniform vec3 tipColor;
    uniform vec3 bottomColor;

    uniform float cloudTime;
    uniform float cloudScale;
    uniform float cloudIntensity;

    varying vec2 vUv;
    varying float frc;
    varying float vTrail;
    varying vec3 vWorldPosition;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(
        0.211324865405187,
        0.366025403784439,
        -0.577350269189626,
        0.024390243902439
      );
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(
        0.5 - vec3(
          dot(x0,x0),
          dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)
        ), 0.0
      );
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      float alpha = texture2D(alphaMap, vUv).r;
      if (alpha < 0.15) discard;

      vec4 col = texture2D(map, vUv);
      col = mix(vec4(tipColor, 1.0), col, frc);
      col = mix(vec4(bottomColor, 1.0), col, frc);

      float darkAmount = clamp(vTrail, 0.0, 1.0);
      vec3 darkColor = vec3(0.0, 0.15, 0.0);
      col.rgb = mix(col.rgb, darkColor, darkAmount);

      vec2 cloudUv = vec2(
        (vWorldPosition.x + cloudTime * 10.0) / cloudScale,
        (vWorldPosition.z + cloudTime * 10.0) / cloudScale
      );

      float n = snoise(cloudUv);
      n = n * 0.5 + 0.5;
      n = smoothstep(0.2, 0.8, n);

      float shadow = mix(1.0 - cloudIntensity, 1.0, n);
      col.rgb *= shadow;

      gl_FragColor = col;

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;
  const uniforms = {
    bladeHeight: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    time: { value: 0 },
    tipColor: { value: new V(0, 0.8, 0).convertSRGBToLinear() },
    bottomColor: { value: new V(0, 0.01, 0).convertSRGBToLinear() },
    cloudTime: { value: 0 },
    cloudScale: { value: 40 },
    cloudIntensity: { value: 0.136 }
  };
  return new es({
    vertexShader,
    fragmentShader,
    uniforms,
    side: _p,
    transparent: true
  });
}
function createGrassTerrain(options = {}, width = 300, instances = 5e4, bladeDiffuse, bladeAlpha, chunkX = 0, chunkZ = 0, chunkSize = 120) {
  const { bW = 0.04, bH = 0.3, joints = 3 } = options;
  const baseGeom = new co(bW, bH, 1, joints).translate(
    0,
    bH / 2,
    0
  );
  const attributeData = getAttributeData(instances, width, chunkX, chunkZ, chunkSize);
  const instancedGeom = new Xo();
  instancedGeom.index = baseGeom.index;
  instancedGeom.attributes.position = baseGeom.attributes.position;
  instancedGeom.attributes.uv = baseGeom.attributes.uv;
  instancedGeom.setAttribute(
    "offset",
    new Ye(new Float32Array(attributeData.offsets), 3)
  );
  instancedGeom.setAttribute(
    "worldOffset",
    new Ye(
      new Float32Array(attributeData.worldOffsetsXZ),
      2
    )
  );
  instancedGeom.setAttribute(
    "orientation",
    new Ye(
      new Float32Array(attributeData.orientations),
      4
    )
  );
  instancedGeom.setAttribute(
    "stretch",
    new Ye(new Float32Array(attributeData.stretches), 1)
  );
  instancedGeom.setAttribute(
    "halfRootAngleSin",
    new Ye(
      new Float32Array(attributeData.halfRootAngleSin),
      1
    )
  );
  instancedGeom.setAttribute(
    "halfRootAngleCos",
    new Ye(
      new Float32Array(attributeData.halfRootAngleCos),
      1
    )
  );
  const trailArray = new Float32Array(instances);
  const trailAttr = new Ye(trailArray, 1);
  instancedGeom.setAttribute("trail", trailAttr);
  const trailDirArray = new Float32Array(instances * 2);
  const trailDirAttr = new Ye(trailDirArray, 2);
  instancedGeom.setAttribute("trailDir", trailDirAttr);
  const textureLoader = new Vh();
  const texture = textureLoader.load(bladeDiffuse);
  const alphaMap = textureLoader.load(bladeAlpha);
  const material = createGrassMaterial();
  material.uniforms.map.value = texture;
  material.uniforms.alphaMap.value = alphaMap;
  const grassMesh = new Pt(instancedGeom, material);
  grassMesh.frustumCulled = false;
  const groundGeo = new co(width, width, 64, 64);
  groundGeo.rotateX(-Math.PI / 2);
  const positionAttr = groundGeo.attributes.position;
  for (let i = 0; i < positionAttr.count; i++) {
    const x = positionAttr.getX(i);
    const z2 = positionAttr.getZ(i);
    const y3 = getTerrainHeight(x, z2, chunkX, chunkZ, chunkSize);
    positionAttr.setY(i, y3);
  }
  positionAttr.needsUpdate = true;
  groundGeo.computeVertexNormals();
  const groundMat = new Tn({
    color: "#000f00",
    roughness: 0.95
  });
  const cloudUniforms = {
    uCloudTime: { value: 0 },
    uCloudScale: { value: 300 },
    uCloudIntensity: { value: 0.6 }
  };
  groundMat.onBeforeCompile = (shader) => {
    shader.uniforms.uCloudTime = cloudUniforms.uCloudTime;
    shader.uniforms.uCloudScale = cloudUniforms.uCloudScale;
    shader.uniforms.uCloudIntensity = cloudUniforms.uCloudIntensity;
    shader.vertexShader = `
      varying vec3 vWorldPosition;
      ` + shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      `
        #include <worldpos_vertex>
        vWorldPosition = vec3( worldPosition );
        `
    );
    shader.fragmentShader = `
      varying vec3 vWorldPosition;
      uniform float uCloudTime;
      uniform float uCloudScale;
      uniform float uCloudIntensity;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }

      float noise2d(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) +
               (c - a) * u.y * (1.0 - u.x) +
               (d - b) * u.x * u.y;
      }
      ` + shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `
        vec2 cUv = vec2(
          (vWorldPosition.x + uCloudTime * 10.0) / uCloudScale,
          (vWorldPosition.z + uCloudTime * 10.0) / uCloudScale
        );
        float cn = noise2d(cUv);
        cn = smoothstep(0.2, 0.8, cn);
        float cShadow = mix(1.0 - uCloudIntensity, 1.0, cn);
        gl_FragColor.rgb *= cShadow;

        #include <dithering_fragment>
        `
    );
  };
  groundMat.userData.cloudUniforms = cloudUniforms;
  const groundMesh = new Pt(groundGeo, groundMat);
  groundMesh.receiveShadow = true;
  const group = new Ge();
  group.add(grassMesh);
  group.add(groundMesh);
  group.userData.grassMaterial = material;
  group.userData.trailArray = trailArray;
  group.userData.trailAttribute = trailAttr;
  group.userData.trailDirArray = trailDirArray;
  group.userData.trailDirAttribute = trailDirAttr;
  group.userData.offsetsArray = instancedGeom.getAttribute("offset").array;
  group.userData.terrainWidth = width;
  group.userData.chunkSize = chunkSize;
  group.userData.chunkX = chunkX;
  group.userData.chunkZ = chunkZ;
  group.tick = (elapsed) => {
    const windTime = elapsed / 4;
    const cloudTime = elapsed / 4;
    material.uniforms.time.value = windTime;
    material.uniforms.cloudTime.value = cloudTime;
    if (groundMat.userData.cloudUniforms) {
      groundMat.userData.cloudUniforms.uCloudTime.value = cloudTime;
    }
  };
  return group;
}
function getAttributeData(instances, width, chunkX = 0, chunkZ = 0, chunkSize = 120) {
  const offsets = [];
  const worldOffsetsXZ = [];
  const orientations = [];
  const stretches = [];
  const halfRootAngleSin = [];
  const halfRootAngleCos = [];
  let q0 = new Dt();
  let q1 = new Dt();
  const min = -0.25, max = 0.25;
  for (let i = 0; i < instances; i++) {
    const x = Math.random() * width - width / 2;
    const z2 = Math.random() * width - width / 2;
    const worldX = x + chunkX * chunkSize;
    const worldZ = z2 + chunkZ * chunkSize;
    const y3 = getTerrainHeight(x, z2, chunkX, chunkZ, chunkSize);
    offsets.push(x, y3, z2);
    worldOffsetsXZ.push(worldX, worldZ);
    let angle = Math.PI - Math.random() * 2 * Math.PI;
    halfRootAngleSin.push(Math.sin(0.5 * angle));
    halfRootAngleCos.push(Math.cos(0.5 * angle));
    q0.set(0, Math.sin(angle / 2), 0, Math.cos(angle / 2)).normalize();
    angle = Math.random() * (max - min) + min;
    q1.set(Math.sin(angle / 2), 0, 0, Math.cos(angle / 2)).normalize();
    q0 = multiplyQuaternions(q0, q1);
    angle = Math.random() * (max - min) + min;
    q1.set(0, 0, Math.sin(angle / 2), Math.cos(angle / 2)).normalize();
    q0 = multiplyQuaternions(q0, q1);
    orientations.push(q0.x, q0.y, q0.z, q0.w);
    stretches.push(i < instances / 3 ? Math.random() * 1.8 : Math.random());
  }
  return {
    offsets,
    worldOffsetsXZ,
    orientations,
    stretches,
    halfRootAngleCos,
    halfRootAngleSin
  };
}
function multiplyQuaternions(a, b) {
  return new Dt(
    a.x * b.w + a.y * b.z - a.z * b.y + a.w * b.x,
    -a.x * b.z + a.y * b.w + a.z * b.x + a.w * b.y,
    a.x * b.y - a.y * b.x + a.z * b.w + a.w * b.z,
    -a.x * b.x - a.y * b.y - a.z * b.z + a.w * b.w
  );
}

// http-url:https://esm.sh/three@0.182.0/es2022/examples/jsm/loaders/GLTFLoader.mjs
function z(f, t) {
  if (t === ff)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), f;
  if (t === yf || t === mf) {
    let e = f.getIndex();
    if (e === null) {
      let s = [], a = f.getAttribute("position");
      if (a !== void 0) {
        for (let o = 0; o < a.count; o++)
          s.push(o);
        f.setIndex(s), e = f.getIndex();
      } else
        return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), f;
    }
    let i = e.count - 2, n = [];
    if (t === yf)
      for (let s = 1; s <= i; s++)
        n.push(e.getX(0)), n.push(e.getX(s)), n.push(e.getX(s + 1));
    else
      for (let s = 0; s < i; s++)
        s % 2 === 0 ? (n.push(e.getX(s)), n.push(e.getX(s + 1)), n.push(e.getX(s + 2))) : (n.push(e.getX(s + 2)), n.push(e.getX(s + 1)), n.push(e.getX(s)));
    n.length / 3 !== i && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    let r = f.clone();
    return r.setIndex(n), r.clearGroups(), r;
  } else
    return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", t), f;
}
var Oe2 = class extends _t {
  constructor(t) {
    super(t), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(e) {
      return new ne(e);
    }), this.register(function(e) {
      return new se(e);
    }), this.register(function(e) {
      return new de2(e);
    }), this.register(function(e) {
      return new he2(e);
    }), this.register(function(e) {
      return new pe2(e);
    }), this.register(function(e) {
      return new ie2(e);
    }), this.register(function(e) {
      return new oe2(e);
    }), this.register(function(e) {
      return new ae3(e);
    }), this.register(function(e) {
      return new ce2(e);
    }), this.register(function(e) {
      return new te2(e);
    }), this.register(function(e) {
      return new ue2(e);
    }), this.register(function(e) {
      return new re(e);
    }), this.register(function(e) {
      return new fe2(e);
    }), this.register(function(e) {
      return new le2(e);
    }), this.register(function(e) {
      return new Q(e);
    }), this.register(function(e) {
      return new me2(e);
    }), this.register(function(e) {
      return new ge2(e);
    });
  }
  load(t, e, i, n) {
    let r = this, s;
    if (this.resourcePath !== "")
      s = this.resourcePath;
    else if (this.path !== "") {
      let c = kn.extractUrlBase(t);
      s = kn.resolveURL(c, this.path);
    } else
      s = kn.extractUrlBase(t);
    this.manager.itemStart(t);
    let a = function(c) {
      n ? n(c) : console.error(c), r.manager.itemError(t), r.manager.itemEnd(t);
    }, o = new ie(this.manager);
    o.setPath(this.path), o.setResponseType("arraybuffer"), o.setRequestHeader(this.requestHeader), o.setWithCredentials(this.withCredentials), o.load(t, function(c) {
      try {
        r.parse(c, s, function(l) {
          e(l), r.manager.itemEnd(t);
        }, a);
      } catch (l) {
        a(l);
      }
    }, i, a);
  }
  setDRACOLoader(t) {
    return this.dracoLoader = t, this;
  }
  setKTX2Loader(t) {
    return this.ktx2Loader = t, this;
  }
  setMeshoptDecoder(t) {
    return this.meshoptDecoder = t, this;
  }
  register(t) {
    return this.pluginCallbacks.indexOf(t) === -1 && this.pluginCallbacks.push(t), this;
  }
  unregister(t) {
    return this.pluginCallbacks.indexOf(t) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(t), 1), this;
  }
  parse(t, e, i, n) {
    let r, s = {}, a = {}, o = new TextDecoder();
    if (typeof t == "string")
      r = JSON.parse(t);
    else if (t instanceof ArrayBuffer)
      if (o.decode(new Uint8Array(t, 0, 4)) === ze2) {
        try {
          s[g.KHR_BINARY_GLTF] = new Te2(t);
        } catch (u) {
          n && n(u);
          return;
        }
        r = JSON.parse(s[g.KHR_BINARY_GLTF].content);
      } else
        r = JSON.parse(o.decode(t));
    else
      r = t;
    if (r.asset === void 0 || r.asset.version[0] < 2) {
      n && n(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    let c = new we2(r, { path: e || this.resourcePath || "", crossOrigin: this.crossOrigin, requestHeader: this.requestHeader, manager: this.manager, ktx2Loader: this.ktx2Loader, meshoptDecoder: this.meshoptDecoder });
    c.fileLoader.setRequestHeader(this.requestHeader);
    for (let l = 0; l < this.pluginCallbacks.length; l++) {
      let u = this.pluginCallbacks[l](c);
      u.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), a[u.name] = u, s[u.name] = true;
    }
    if (r.extensionsUsed)
      for (let l = 0; l < r.extensionsUsed.length; ++l) {
        let u = r.extensionsUsed[l], d = r.extensionsRequired || [];
        switch (u) {
          case g.KHR_MATERIALS_UNLIT:
            s[u] = new ee2();
            break;
          case g.KHR_DRACO_MESH_COMPRESSION:
            s[u] = new Ae2(r, this.dracoLoader);
            break;
          case g.KHR_TEXTURE_TRANSFORM:
            s[u] = new Re2();
            break;
          case g.KHR_MESH_QUANTIZATION:
            s[u] = new xe2();
            break;
          default:
            d.indexOf(u) >= 0 && a[u] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + u + '".');
        }
      }
    c.setExtensions(s), c.setPlugins(a), c.parse(i, n);
  }
  parseAsync(t, e) {
    let i = this;
    return new Promise(function(n, r) {
      i.parse(t, e, n, r);
    });
  }
};
function Ct2() {
  let f = {};
  return { get: function(t) {
    return f[t];
  }, add: function(t, e) {
    f[t] = e;
  }, remove: function(t) {
    delete f[t];
  }, removeAll: function() {
    f = {};
  } };
}
var g = { KHR_BINARY_GLTF: "KHR_binary_glTF", KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression", KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual", KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat", KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion", KHR_MATERIALS_IOR: "KHR_materials_ior", KHR_MATERIALS_SHEEN: "KHR_materials_sheen", KHR_MATERIALS_SPECULAR: "KHR_materials_specular", KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission", KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence", KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy", KHR_MATERIALS_UNLIT: "KHR_materials_unlit", KHR_MATERIALS_VOLUME: "KHR_materials_volume", KHR_TEXTURE_BASISU: "KHR_texture_basisu", KHR_TEXTURE_TRANSFORM: "KHR_texture_transform", KHR_MESH_QUANTIZATION: "KHR_mesh_quantization", KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength", EXT_MATERIALS_BUMP: "EXT_materials_bump", EXT_TEXTURE_WEBP: "EXT_texture_webp", EXT_TEXTURE_AVIF: "EXT_texture_avif", EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression", EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing" };
var Q = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
  }
  _markDefs() {
    let t = this.parser, e = this.parser.json.nodes || [];
    for (let i = 0, n = e.length; i < n; i++) {
      let r = e[i];
      r.extensions && r.extensions[this.name] && r.extensions[this.name].light !== void 0 && t._addNodeRef(this.cache, r.extensions[this.name].light);
    }
  }
  _loadLight(t) {
    let e = this.parser, i = "light:" + t, n = e.cache.get(i);
    if (n)
      return n;
    let r = e.json, o = ((r.extensions && r.extensions[this.name] || {}).lights || [])[t], c, l = new V(16777215);
    o.color !== void 0 && l.setRGB(o.color[0], o.color[1], o.color[2], Ma);
    let u = o.range !== void 0 ? o.range : 0;
    switch (o.type) {
      case "directional":
        c = new Uo(l), c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      case "point":
        c = new Do(l), c.distance = u;
        break;
      case "spot":
        c = new No(l), c.distance = u, o.spot = o.spot || {}, o.spot.innerConeAngle = o.spot.innerConeAngle !== void 0 ? o.spot.innerConeAngle : 0, o.spot.outerConeAngle = o.spot.outerConeAngle !== void 0 ? o.spot.outerConeAngle : Math.PI / 4, c.angle = o.spot.outerConeAngle, c.penumbra = 1 - o.spot.innerConeAngle / o.spot.outerConeAngle, c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + o.type);
    }
    return c.position.set(0, 0, 0), y2(c, o), o.intensity !== void 0 && (c.intensity = o.intensity), c.name = e.createUniqueName(o.name || "light_" + t), n = Promise.resolve(c), e.cache.add(i, n), n;
  }
  getDependency(t, e) {
    if (t === "light")
      return this._loadLight(e);
  }
  createNodeAttachment(t) {
    let e = this, i = this.parser, r = i.json.nodes[t], a = (r.extensions && r.extensions[this.name] || {}).light;
    return a === void 0 ? null : this._loadLight(a).then(function(o) {
      return i._getNodeRef(e.cache, a, o);
    });
  }
};
var ee2 = class {
  constructor() {
    this.name = g.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return ze;
  }
  extendParams(t, e, i) {
    let n = [];
    t.color = new V(1, 1, 1), t.opacity = 1;
    let r = e.pbrMetallicRoughness;
    if (r) {
      if (Array.isArray(r.baseColorFactor)) {
        let s = r.baseColorFactor;
        t.color.setRGB(s[0], s[1], s[2], Ma), t.opacity = s[3];
      }
      r.baseColorTexture !== void 0 && n.push(i.assignTexture(t, "map", r.baseColorTexture, Nt));
    }
    return Promise.all(n);
  }
};
var te2 = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(t, e) {
    let n = this.parser.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = n.extensions[this.name].emissiveStrength;
    return r !== void 0 && (e.emissiveIntensity = r), Promise.resolve();
  }
};
var ne = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(t) {
    let i = this.parser.json.materials[t];
    return !i.extensions || !i.extensions[this.name] ? null : Mo;
  }
  extendMaterialParams(t, e) {
    let i = this.parser, n = i.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = [], s = n.extensions[this.name];
    if (s.clearcoatFactor !== void 0 && (e.clearcoat = s.clearcoatFactor), s.clearcoatTexture !== void 0 && r.push(i.assignTexture(e, "clearcoatMap", s.clearcoatTexture)), s.clearcoatRoughnessFactor !== void 0 && (e.clearcoatRoughness = s.clearcoatRoughnessFactor), s.clearcoatRoughnessTexture !== void 0 && r.push(i.assignTexture(e, "clearcoatRoughnessMap", s.clearcoatRoughnessTexture)), s.clearcoatNormalTexture !== void 0 && (r.push(i.assignTexture(e, "clearcoatNormalMap", s.clearcoatNormalTexture)), s.clearcoatNormalTexture.scale !== void 0)) {
      let a = s.clearcoatNormalTexture.scale;
      e.clearcoatNormalScale = new I(a, a);
    }
    return Promise.all(r);
  }
};
var se = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(t) {
    let i = this.parser.json.materials[t];
    return !i.extensions || !i.extensions[this.name] ? null : Mo;
  }
  extendMaterialParams(t, e) {
    let n = this.parser.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = n.extensions[this.name];
    return e.dispersion = r.dispersion !== void 0 ? r.dispersion : 0, Promise.resolve();
  }
};
var re = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(t) {
    let i = this.parser.json.materials[t];
    return !i.extensions || !i.extensions[this.name] ? null : Mo;
  }
  extendMaterialParams(t, e) {
    let i = this.parser, n = i.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = [], s = n.extensions[this.name];
    return s.iridescenceFactor !== void 0 && (e.iridescence = s.iridescenceFactor), s.iridescenceTexture !== void 0 && r.push(i.assignTexture(e, "iridescenceMap", s.iridescenceTexture)), s.iridescenceIor !== void 0 && (e.iridescenceIOR = s.iridescenceIor), e.iridescenceThicknessRange === void 0 && (e.iridescenceThicknessRange = [100, 400]), s.iridescenceThicknessMinimum !== void 0 && (e.iridescenceThicknessRange[0] = s.iridescenceThicknessMinimum), s.iridescenceThicknessMaximum !== void 0 && (e.iridescenceThicknessRange[1] = s.iridescenceThicknessMaximum), s.iridescenceThicknessTexture !== void 0 && r.push(i.assignTexture(e, "iridescenceThicknessMap", s.iridescenceThicknessTexture)), Promise.all(r);
  }
};
var ie2 = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(t) {
    let i = this.parser.json.materials[t];
    return !i.extensions || !i.extensions[this.name] ? null : Mo;
  }
  extendMaterialParams(t, e) {
    let i = this.parser, n = i.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = [];
    e.sheenColor = new V(0, 0, 0), e.sheenRoughness = 0, e.sheen = 1;
    let s = n.extensions[this.name];
    if (s.sheenColorFactor !== void 0) {
      let a = s.sheenColorFactor;
      e.sheenColor.setRGB(a[0], a[1], a[2], Ma);
    }
    return s.sheenRoughnessFactor !== void 0 && (e.sheenRoughness = s.sheenRoughnessFactor), s.sheenColorTexture !== void 0 && r.push(i.assignTexture(e, "sheenColorMap", s.sheenColorTexture, Nt)), s.sheenRoughnessTexture !== void 0 && r.push(i.assignTexture(e, "sheenRoughnessMap", s.sheenRoughnessTexture)), Promise.all(r);
  }
};
var oe2 = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(t) {
    let i = this.parser.json.materials[t];
    return !i.extensions || !i.extensions[this.name] ? null : Mo;
  }
  extendMaterialParams(t, e) {
    let i = this.parser, n = i.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = [], s = n.extensions[this.name];
    return s.transmissionFactor !== void 0 && (e.transmission = s.transmissionFactor), s.transmissionTexture !== void 0 && r.push(i.assignTexture(e, "transmissionMap", s.transmissionTexture)), Promise.all(r);
  }
};
var ae3 = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(t) {
    let i = this.parser.json.materials[t];
    return !i.extensions || !i.extensions[this.name] ? null : Mo;
  }
  extendMaterialParams(t, e) {
    let i = this.parser, n = i.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = [], s = n.extensions[this.name];
    e.thickness = s.thicknessFactor !== void 0 ? s.thicknessFactor : 0, s.thicknessTexture !== void 0 && r.push(i.assignTexture(e, "thicknessMap", s.thicknessTexture)), e.attenuationDistance = s.attenuationDistance || 1 / 0;
    let a = s.attenuationColor || [1, 1, 1];
    return e.attenuationColor = new V().setRGB(a[0], a[1], a[2], Ma), Promise.all(r);
  }
};
var ce2 = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_MATERIALS_IOR;
  }
  getMaterialType(t) {
    let i = this.parser.json.materials[t];
    return !i.extensions || !i.extensions[this.name] ? null : Mo;
  }
  extendMaterialParams(t, e) {
    let n = this.parser.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = n.extensions[this.name];
    return e.ior = r.ior !== void 0 ? r.ior : 1.5, Promise.resolve();
  }
};
var ue2 = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(t) {
    let i = this.parser.json.materials[t];
    return !i.extensions || !i.extensions[this.name] ? null : Mo;
  }
  extendMaterialParams(t, e) {
    let i = this.parser, n = i.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = [], s = n.extensions[this.name];
    e.specularIntensity = s.specularFactor !== void 0 ? s.specularFactor : 1, s.specularTexture !== void 0 && r.push(i.assignTexture(e, "specularIntensityMap", s.specularTexture));
    let a = s.specularColorFactor || [1, 1, 1];
    return e.specularColor = new V().setRGB(a[0], a[1], a[2], Ma), s.specularColorTexture !== void 0 && r.push(i.assignTexture(e, "specularColorMap", s.specularColorTexture, Nt)), Promise.all(r);
  }
};
var le2 = class {
  constructor(t) {
    this.parser = t, this.name = g.EXT_MATERIALS_BUMP;
  }
  getMaterialType(t) {
    let i = this.parser.json.materials[t];
    return !i.extensions || !i.extensions[this.name] ? null : Mo;
  }
  extendMaterialParams(t, e) {
    let i = this.parser, n = i.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = [], s = n.extensions[this.name];
    return e.bumpScale = s.bumpFactor !== void 0 ? s.bumpFactor : 1, s.bumpTexture !== void 0 && r.push(i.assignTexture(e, "bumpMap", s.bumpTexture)), Promise.all(r);
  }
};
var fe2 = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(t) {
    let i = this.parser.json.materials[t];
    return !i.extensions || !i.extensions[this.name] ? null : Mo;
  }
  extendMaterialParams(t, e) {
    let i = this.parser, n = i.json.materials[t];
    if (!n.extensions || !n.extensions[this.name])
      return Promise.resolve();
    let r = [], s = n.extensions[this.name];
    return s.anisotropyStrength !== void 0 && (e.anisotropy = s.anisotropyStrength), s.anisotropyRotation !== void 0 && (e.anisotropyRotation = s.anisotropyRotation), s.anisotropyTexture !== void 0 && r.push(i.assignTexture(e, "anisotropyMap", s.anisotropyTexture)), Promise.all(r);
  }
};
var de2 = class {
  constructor(t) {
    this.parser = t, this.name = g.KHR_TEXTURE_BASISU;
  }
  loadTexture(t) {
    let e = this.parser, i = e.json, n = i.textures[t];
    if (!n.extensions || !n.extensions[this.name])
      return null;
    let r = n.extensions[this.name], s = e.options.ktx2Loader;
    if (!s) {
      if (i.extensionsRequired && i.extensionsRequired.indexOf(this.name) >= 0)
        throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null;
    }
    return e.loadTextureImage(t, r.source, s);
  }
};
var he2 = class {
  constructor(t) {
    this.parser = t, this.name = g.EXT_TEXTURE_WEBP;
  }
  loadTexture(t) {
    let e = this.name, i = this.parser, n = i.json, r = n.textures[t];
    if (!r.extensions || !r.extensions[e])
      return null;
    let s = r.extensions[e], a = n.images[s.source], o = i.textureLoader;
    if (a.uri) {
      let c = i.options.manager.getHandler(a.uri);
      c !== null && (o = c);
    }
    return i.loadTextureImage(t, s.source, o);
  }
};
var pe2 = class {
  constructor(t) {
    this.parser = t, this.name = g.EXT_TEXTURE_AVIF;
  }
  loadTexture(t) {
    let e = this.name, i = this.parser, n = i.json, r = n.textures[t];
    if (!r.extensions || !r.extensions[e])
      return null;
    let s = r.extensions[e], a = n.images[s.source], o = i.textureLoader;
    if (a.uri) {
      let c = i.options.manager.getHandler(a.uri);
      c !== null && (o = c);
    }
    return i.loadTextureImage(t, s.source, o);
  }
};
var me2 = class {
  constructor(t) {
    this.name = g.EXT_MESHOPT_COMPRESSION, this.parser = t;
  }
  loadBufferView(t) {
    let e = this.parser.json, i = e.bufferViews[t];
    if (i.extensions && i.extensions[this.name]) {
      let n = i.extensions[this.name], r = this.parser.getDependency("buffer", n.buffer), s = this.parser.options.meshoptDecoder;
      if (!s || !s.supported) {
        if (e.extensionsRequired && e.extensionsRequired.indexOf(this.name) >= 0)
          throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null;
      }
      return r.then(function(a) {
        let o = n.byteOffset || 0, c = n.byteLength || 0, l = n.count, u = n.byteStride, d = new Uint8Array(a, o, c);
        return s.decodeGltfBufferAsync ? s.decodeGltfBufferAsync(l, u, d, n.mode, n.filter).then(function(h36) {
          return h36.buffer;
        }) : s.ready.then(function() {
          let h36 = new ArrayBuffer(l * u);
          return s.decodeGltfBuffer(new Uint8Array(h36), l, u, d, n.mode, n.filter), h36;
        });
      });
    } else
      return null;
  }
};
var ge2 = class {
  constructor(t) {
    this.name = g.EXT_MESH_GPU_INSTANCING, this.parser = t;
  }
  createNodeMesh(t) {
    let e = this.parser.json, i = e.nodes[t];
    if (!i.extensions || !i.extensions[this.name] || i.mesh === void 0)
      return null;
    let n = e.meshes[i.mesh];
    for (let c of n.primitives)
      if (c.mode !== _.TRIANGLES && c.mode !== _.TRIANGLE_STRIP && c.mode !== _.TRIANGLE_FAN && c.mode !== void 0)
        return null;
    let s = i.extensions[this.name].attributes, a = [], o = {};
    for (let c in s)
      a.push(this.parser.getDependency("accessor", s[c]).then((l) => (o[c] = l, o[c])));
    return a.length < 1 ? null : (a.push(this.parser.createNodeMesh(t)), Promise.all(a).then((c) => {
      let l = c.pop(), u = l.isGroup ? l.children : [l], d = c[0].count, h36 = [];
      for (let m of u) {
        let A = new U(), p = new w(), T = new Mt(), E2 = new w(1, 1, 1), x = new Lr(m.geometry, m.material, d);
        for (let R = 0; R < d; R++)
          o.TRANSLATION && p.fromBufferAttribute(o.TRANSLATION, R), o.ROTATION && T.fromBufferAttribute(o.ROTATION, R), o.SCALE && E2.fromBufferAttribute(o.SCALE, R), x.setMatrixAt(R, A.compose(p, T, E2));
        for (let R in o)
          if (R === "_COLOR_0") {
            let b = o[R];
            x.instanceColor = new Ye(b.array, b.itemSize, b.normalized);
          } else
            R !== "TRANSLATION" && R !== "ROTATION" && R !== "SCALE" && m.geometry.setAttribute(R, o[R]);
        H.prototype.copy.call(x, m), this.parser.assignFinalMaterial(x), h36.push(x);
      }
      return l.isGroup ? (l.clear(), l.add(...h36), l) : h36[0];
    }));
  }
};
var ze2 = "glTF";
var H2 = 12;
var Ce2 = { JSON: 1313821514, BIN: 5130562 };
var Te2 = class {
  constructor(t) {
    this.name = g.KHR_BINARY_GLTF, this.content = null, this.body = null;
    let e = new DataView(t, 0, H2), i = new TextDecoder();
    if (this.header = { magic: i.decode(new Uint8Array(t.slice(0, 4))), version: e.getUint32(4, true), length: e.getUint32(8, true) }, this.header.magic !== ze2)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    let n = this.header.length - H2, r = new DataView(t, H2), s = 0;
    for (; s < n; ) {
      let a = r.getUint32(s, true);
      s += 4;
      let o = r.getUint32(s, true);
      if (s += 4, o === Ce2.JSON) {
        let c = new Uint8Array(t, H2 + s, a);
        this.content = i.decode(c);
      } else if (o === Ce2.BIN) {
        let c = H2 + s;
        this.body = t.slice(c, c + a);
      }
      s += a;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
};
var Ae2 = class {
  constructor(t, e) {
    if (!e)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = g.KHR_DRACO_MESH_COMPRESSION, this.json = t, this.dracoLoader = e, this.dracoLoader.preload();
  }
  decodePrimitive(t, e) {
    let i = this.json, n = this.dracoLoader, r = t.extensions[this.name].bufferView, s = t.extensions[this.name].attributes, a = {}, o = {}, c = {};
    for (let l in s) {
      let u = be2[l] || l.toLowerCase();
      a[u] = s[l];
    }
    for (let l in t.attributes) {
      let u = be2[l] || l.toLowerCase();
      if (s[l] !== void 0) {
        let d = i.accessors[t.attributes[l]], h36 = D[d.componentType];
        c[u] = h36.name, o[u] = d.normalized === true;
      }
    }
    return e.getDependency("bufferView", r).then(function(l) {
      return new Promise(function(u, d) {
        n.decodeDracoFile(l, function(h36) {
          for (let m in h36.attributes) {
            let A = h36.attributes[m], p = o[m];
            p !== void 0 && (A.normalized = p);
          }
          u(h36);
        }, a, c, Ma, d);
      });
    });
  }
};
var Re2 = class {
  constructor() {
    this.name = g.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(t, e) {
    return (e.texCoord === void 0 || e.texCoord === t.channel) && e.offset === void 0 && e.rotation === void 0 && e.scale === void 0 || (t = t.clone(), e.texCoord !== void 0 && (t.channel = e.texCoord), e.offset !== void 0 && t.offset.fromArray(e.offset), e.rotation !== void 0 && (t.rotation = e.rotation), e.scale !== void 0 && t.repeat.fromArray(e.scale), t.needsUpdate = true), t;
  }
};
var xe2 = class {
  constructor() {
    this.name = g.KHR_MESH_QUANTIZATION;
  }
};
var G = class extends Ii {
  constructor(t, e, i, n) {
    super(t, e, i, n);
  }
  copySampleValue_(t) {
    let e = this.resultBuffer, i = this.sampleValues, n = this.valueSize, r = t * n * 3 + n;
    for (let s = 0; s !== n; s++)
      e[s] = i[r + s];
    return e;
  }
  interpolate_(t, e, i, n) {
    let r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = a * 2, c = a * 3, l = n - e, u = (i - e) / l, d = u * u, h36 = d * u, m = t * c, A = m - c, p = -2 * h36 + 3 * d, T = h36 - d, E2 = 1 - p, x = T - d + u;
    for (let R = 0; R !== a; R++) {
      let b = s[A + R + a], I2 = s[A + R + o] * l, w2 = s[m + R + a], P = s[m + R] * l;
      r[R] = E2 * b + x * I2 + p * w2 + T * P;
    }
    return r;
  }
};
var kt2 = new Mt();
var Ee2 = class extends G {
  interpolate_(t, e, i, n) {
    let r = super.interpolate_(t, e, i, n);
    return kt2.fromArray(r).normalize().toArray(r), r;
  }
};
var _ = { FLOAT: 5126, FLOAT_MAT3: 35675, FLOAT_MAT4: 35676, FLOAT_VEC2: 35664, FLOAT_VEC3: 35665, FLOAT_VEC4: 35666, LINEAR: 9729, REPEAT: 10497, SAMPLER_2D: 35678, POINTS: 0, LINES: 1, LINE_LOOP: 2, LINE_STRIP: 3, TRIANGLES: 4, TRIANGLE_STRIP: 5, TRIANGLE_FAN: 6, UNSIGNED_BYTE: 5121, UNSIGNED_SHORT: 5123 };
var D = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
var ke = { 9728: kt, 9729: Vt, 9984: uc, 9985: pc, 9986: dc, 9987: On };
var De2 = { 33071: $t, 33648: Ar, 10497: Sr };
var q2 = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
var be2 = { POSITION: "position", NORMAL: "normal", TANGENT: "tangent", TEXCOORD_0: "uv", TEXCOORD_1: "uv1", TEXCOORD_2: "uv2", TEXCOORD_3: "uv3", COLOR_0: "color", WEIGHTS_0: "skinWeight", JOINTS_0: "skinIndex" };
var N2 = { scale: "scale", translation: "position", rotation: "quaternion", weights: "morphTargetInfluences" };
var Dt3 = { CUBICSPLINE: void 0, LINEAR: Ir, STEP: sn };
var W2 = { OPAQUE: "OPAQUE", MASK: "MASK", BLEND: "BLEND" };
function Pt2(f) {
  return f.DefaultMaterial === void 0 && (f.DefaultMaterial = new Tn({ color: 16777215, emissive: 0, metalness: 1, roughness: 1, transparent: false, depthTest: true, side: vr })), f.DefaultMaterial;
}
function L2(f, t, e) {
  for (let i in e.extensions)
    f[i] === void 0 && (t.userData.gltfExtensions = t.userData.gltfExtensions || {}, t.userData.gltfExtensions[i] = e.extensions[i]);
}
function y2(f, t) {
  t.extras !== void 0 && (typeof t.extras == "object" ? Object.assign(f.userData, t.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + t.extras));
}
function Ht2(f, t, e) {
  let i = false, n = false, r = false;
  for (let c = 0, l = t.length; c < l; c++) {
    let u = t[c];
    if (u.POSITION !== void 0 && (i = true), u.NORMAL !== void 0 && (n = true), u.COLOR_0 !== void 0 && (r = true), i && n && r)
      break;
  }
  if (!i && !n && !r)
    return Promise.resolve(f);
  let s = [], a = [], o = [];
  for (let c = 0, l = t.length; c < l; c++) {
    let u = t[c];
    if (i) {
      let d = u.POSITION !== void 0 ? e.getDependency("accessor", u.POSITION) : f.attributes.position;
      s.push(d);
    }
    if (n) {
      let d = u.NORMAL !== void 0 ? e.getDependency("accessor", u.NORMAL) : f.attributes.normal;
      a.push(d);
    }
    if (r) {
      let d = u.COLOR_0 !== void 0 ? e.getDependency("accessor", u.COLOR_0) : f.attributes.color;
      o.push(d);
    }
  }
  return Promise.all([Promise.all(s), Promise.all(a), Promise.all(o)]).then(function(c) {
    let l = c[0], u = c[1], d = c[2];
    return i && (f.morphAttributes.position = l), n && (f.morphAttributes.normal = u), r && (f.morphAttributes.color = d), f.morphTargetsRelative = true, f;
  });
}
function Bt3(f, t) {
  if (f.updateMorphTargets(), t.weights !== void 0)
    for (let e = 0, i = t.weights.length; e < i; e++)
      f.morphTargetInfluences[e] = t.weights[e];
  if (t.extras && Array.isArray(t.extras.targetNames)) {
    let e = t.extras.targetNames;
    if (f.morphTargetInfluences.length === e.length) {
      f.morphTargetDictionary = {};
      for (let i = 0, n = e.length; i < n; i++)
        f.morphTargetDictionary[e[i]] = i;
    } else
      console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
  }
}
function vt2(f) {
  let t, e = f.extensions && f.extensions[g.KHR_DRACO_MESH_COMPRESSION];
  if (e ? t = "draco:" + e.bufferView + ":" + e.indices + ":" + Z(e.attributes) : t = f.indices + ":" + Z(f.attributes) + ":" + f.mode, f.targets !== void 0)
    for (let i = 0, n = f.targets.length; i < n; i++)
      t += ":" + Z(f.targets[i]);
  return t;
}
function Z(f) {
  let t = "", e = Object.keys(f).sort();
  for (let i = 0, n = e.length; i < n; i++)
    t += e[i] + ":" + f[e[i]] + ";";
  return t;
}
function _e2(f) {
  switch (f) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
  }
}
function Ut(f) {
  return f.search(/\.jpe?g($|\?)/i) > 0 || f.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : f.search(/\.webp($|\?)/i) > 0 || f.search(/^data\:image\/webp/) === 0 ? "image/webp" : f.search(/\.ktx2($|\?)/i) > 0 || f.search(/^data\:image\/ktx2/) === 0 ? "image/ktx2" : "image/png";
}
var Ft2 = new U();
var we2 = class {
  constructor(t = {}, e = {}) {
    this.json = t, this.extensions = {}, this.plugins = {}, this.options = e, this.cache = new Ct2(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let i = false, n = -1, r = false, s = -1;
    if (typeof navigator < "u") {
      let a = navigator.userAgent;
      i = /^((?!chrome|android).)*safari/i.test(a) === true;
      let o = a.match(/Version\/(\d+)/);
      n = i && o ? parseInt(o[1], 10) : -1, r = a.indexOf("Firefox") > -1, s = r ? a.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || i && n < 17 || r && s < 98 ? this.textureLoader = new Vh(this.options.manager) : this.textureLoader = new Jh(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new ie(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(true);
  }
  setExtensions(t) {
    this.extensions = t;
  }
  setPlugins(t) {
    this.plugins = t;
  }
  parse(t, e) {
    let i = this, n = this.json, r = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(s) {
      return s._markDefs && s._markDefs();
    }), Promise.all(this._invokeAll(function(s) {
      return s.beforeRoot && s.beforeRoot();
    })).then(function() {
      return Promise.all([i.getDependencies("scene"), i.getDependencies("animation"), i.getDependencies("camera")]);
    }).then(function(s) {
      let a = { scene: s[0][n.scene || 0], scenes: s[0], animations: s[1], cameras: s[2], asset: n.asset, parser: i, userData: {} };
      return L2(r, a, n), y2(a, n), Promise.all(i._invokeAll(function(o) {
        return o.afterRoot && o.afterRoot(a);
      })).then(function() {
        for (let o of a.scenes)
          o.updateMatrixWorld();
        t(a);
      });
    }).catch(e);
  }
  _markDefs() {
    let t = this.json.nodes || [], e = this.json.skins || [], i = this.json.meshes || [];
    for (let n = 0, r = e.length; n < r; n++) {
      let s = e[n].joints;
      for (let a = 0, o = s.length; a < o; a++)
        t[s[a]].isBone = true;
    }
    for (let n = 0, r = t.length; n < r; n++) {
      let s = t[n];
      s.mesh !== void 0 && (this._addNodeRef(this.meshCache, s.mesh), s.skin !== void 0 && (i[s.mesh].isSkinnedMesh = true)), s.camera !== void 0 && this._addNodeRef(this.cameraCache, s.camera);
    }
  }
  _addNodeRef(t, e) {
    e !== void 0 && (t.refs[e] === void 0 && (t.refs[e] = t.uses[e] = 0), t.refs[e]++);
  }
  _getNodeRef(t, e, i) {
    if (t.refs[e] <= 1)
      return i;
    let n = i.clone(), r = (s, a) => {
      let o = this.associations.get(s);
      o != null && this.associations.set(a, o);
      for (let [c, l] of s.children.entries())
        r(l, a.children[c]);
    };
    return r(i, n), n.name += "_instance_" + t.uses[e]++, n;
  }
  _invokeOne(t) {
    let e = Object.values(this.plugins);
    e.push(this);
    for (let i = 0; i < e.length; i++) {
      let n = t(e[i]);
      if (n)
        return n;
    }
    return null;
  }
  _invokeAll(t) {
    let e = Object.values(this.plugins);
    e.unshift(this);
    let i = [];
    for (let n = 0; n < e.length; n++) {
      let r = t(e[n]);
      r && i.push(r);
    }
    return i;
  }
  getDependency(t, e) {
    let i = t + ":" + e, n = this.cache.get(i);
    if (!n) {
      switch (t) {
        case "scene":
          n = this.loadScene(e);
          break;
        case "node":
          n = this._invokeOne(function(r) {
            return r.loadNode && r.loadNode(e);
          });
          break;
        case "mesh":
          n = this._invokeOne(function(r) {
            return r.loadMesh && r.loadMesh(e);
          });
          break;
        case "accessor":
          n = this.loadAccessor(e);
          break;
        case "bufferView":
          n = this._invokeOne(function(r) {
            return r.loadBufferView && r.loadBufferView(e);
          });
          break;
        case "buffer":
          n = this.loadBuffer(e);
          break;
        case "material":
          n = this._invokeOne(function(r) {
            return r.loadMaterial && r.loadMaterial(e);
          });
          break;
        case "texture":
          n = this._invokeOne(function(r) {
            return r.loadTexture && r.loadTexture(e);
          });
          break;
        case "skin":
          n = this.loadSkin(e);
          break;
        case "animation":
          n = this._invokeOne(function(r) {
            return r.loadAnimation && r.loadAnimation(e);
          });
          break;
        case "camera":
          n = this.loadCamera(e);
          break;
        default:
          if (n = this._invokeOne(function(r) {
            return r != this && r.getDependency && r.getDependency(t, e);
          }), !n)
            throw new Error("Unknown type: " + t);
          break;
      }
      this.cache.add(i, n);
    }
    return n;
  }
  getDependencies(t) {
    let e = this.cache.get(t);
    if (!e) {
      let i = this, n = this.json[t + (t === "mesh" ? "es" : "s")] || [];
      e = Promise.all(n.map(function(r, s) {
        return i.getDependency(t, s);
      })), this.cache.add(t, e);
    }
    return e;
  }
  loadBuffer(t) {
    let e = this.json.buffers[t], i = this.fileLoader;
    if (e.type && e.type !== "arraybuffer")
      throw new Error("THREE.GLTFLoader: " + e.type + " buffer type is not supported.");
    if (e.uri === void 0 && t === 0)
      return Promise.resolve(this.extensions[g.KHR_BINARY_GLTF].body);
    let n = this.options;
    return new Promise(function(r, s) {
      i.load(kn.resolveURL(e.uri, n.path), r, void 0, function() {
        s(new Error('THREE.GLTFLoader: Failed to load buffer "' + e.uri + '".'));
      });
    });
  }
  loadBufferView(t) {
    let e = this.json.bufferViews[t];
    return this.getDependency("buffer", e.buffer).then(function(i) {
      let n = e.byteLength || 0, r = e.byteOffset || 0;
      return i.slice(r, r + n);
    });
  }
  loadAccessor(t) {
    let e = this, i = this.json, n = this.json.accessors[t];
    if (n.bufferView === void 0 && n.sparse === void 0) {
      let s = q2[n.type], a = D[n.componentType], o = n.normalized === true, c = new a(n.count * s);
      return Promise.resolve(new j(c, s, o));
    }
    let r = [];
    return n.bufferView !== void 0 ? r.push(this.getDependency("bufferView", n.bufferView)) : r.push(null), n.sparse !== void 0 && (r.push(this.getDependency("bufferView", n.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", n.sparse.values.bufferView))), Promise.all(r).then(function(s) {
      let a = s[0], o = q2[n.type], c = D[n.componentType], l = c.BYTES_PER_ELEMENT, u = l * o, d = n.byteOffset || 0, h36 = n.bufferView !== void 0 ? i.bufferViews[n.bufferView].byteStride : void 0, m = n.normalized === true, A, p;
      if (h36 && h36 !== u) {
        let T = Math.floor(d / h36), E2 = "InterleavedBuffer:" + n.bufferView + ":" + n.componentType + ":" + T + ":" + n.count, x = e.cache.get(E2);
        x || (A = new c(a, T * h36, n.count * h36 / l), x = new ns(A, h36 / l), e.cache.add(E2, x)), p = new Ai(x, o, d % h36 / l, m);
      } else
        a === null ? A = new c(n.count * o) : A = new c(a, d, n.count * o), p = new j(A, o, m);
      if (n.sparse !== void 0) {
        let T = q2.SCALAR, E2 = D[n.sparse.indices.componentType], x = n.sparse.indices.byteOffset || 0, R = n.sparse.values.byteOffset || 0, b = new E2(s[1], x, n.sparse.count * T), I2 = new c(s[2], R, n.sparse.count * o);
        a !== null && (p = new j(p.array.slice(), p.itemSize, p.normalized)), p.normalized = false;
        for (let w2 = 0, P = b.length; w2 < P; w2++) {
          let C = b[w2];
          if (p.setX(C, I2[w2 * o]), o >= 2 && p.setY(C, I2[w2 * o + 1]), o >= 3 && p.setZ(C, I2[w2 * o + 2]), o >= 4 && p.setW(C, I2[w2 * o + 3]), o >= 5)
            throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
        p.normalized = m;
      }
      return p;
    });
  }
  loadTexture(t) {
    let e = this.json, i = this.options, r = e.textures[t].source, s = e.images[r], a = this.textureLoader;
    if (s.uri) {
      let o = i.manager.getHandler(s.uri);
      o !== null && (a = o);
    }
    return this.loadTextureImage(t, r, a);
  }
  loadTextureImage(t, e, i) {
    let n = this, r = this.json, s = r.textures[t], a = r.images[e], o = (a.uri || a.bufferView) + ":" + s.sampler;
    if (this.textureCache[o])
      return this.textureCache[o];
    let c = this.loadImageSource(e, i).then(function(l) {
      l.flipY = false, l.name = s.name || a.name || "", l.name === "" && typeof a.uri == "string" && a.uri.startsWith("data:image/") === false && (l.name = a.uri);
      let d = (r.samplers || {})[s.sampler] || {};
      return l.magFilter = ke[d.magFilter] || Vt, l.minFilter = ke[d.minFilter] || On, l.wrapS = De2[d.wrapS] || Sr, l.wrapT = De2[d.wrapT] || Sr, l.generateMipmaps = !l.isCompressedTexture && l.minFilter !== kt && l.minFilter !== Vt, n.associations.set(l, { textures: t }), l;
    }).catch(function() {
      return null;
    });
    return this.textureCache[o] = c, c;
  }
  loadImageSource(t, e) {
    let i = this, n = this.json, r = this.options;
    if (this.sourceCache[t] !== void 0)
      return this.sourceCache[t].then((u) => u.clone());
    let s = n.images[t], a = self.URL || self.webkitURL, o = s.uri || "", c = false;
    if (s.bufferView !== void 0)
      o = i.getDependency("bufferView", s.bufferView).then(function(u) {
        c = true;
        let d = new Blob([u], { type: s.mimeType });
        return o = a.createObjectURL(d), o;
      });
    else if (s.uri === void 0)
      throw new Error("THREE.GLTFLoader: Image " + t + " is missing URI and bufferView");
    let l = Promise.resolve(o).then(function(u) {
      return new Promise(function(d, h36) {
        let m = d;
        e.isImageBitmapLoader === true && (m = function(A) {
          let p = new ut(A);
          p.needsUpdate = true, d(p);
        }), e.load(kn.resolveURL(u, r.path), m, void 0, h36);
      });
    }).then(function(u) {
      return c === true && a.revokeObjectURL(o), y2(u, s), u.userData.mimeType = s.mimeType || Ut(s.uri), u;
    }).catch(function(u) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", o), u;
    });
    return this.sourceCache[t] = l, l;
  }
  assignTexture(t, e, i, n) {
    let r = this;
    return this.getDependency("texture", i.index).then(function(s) {
      if (!s)
        return null;
      if (i.texCoord !== void 0 && i.texCoord > 0 && (s = s.clone(), s.channel = i.texCoord), r.extensions[g.KHR_TEXTURE_TRANSFORM]) {
        let a = i.extensions !== void 0 ? i.extensions[g.KHR_TEXTURE_TRANSFORM] : void 0;
        if (a) {
          let o = r.associations.get(s);
          s = r.extensions[g.KHR_TEXTURE_TRANSFORM].extendTexture(s, a), r.associations.set(s, o);
        }
      }
      return n !== void 0 && (s.colorSpace = n), t[e] = s, s;
    });
  }
  assignFinalMaterial(t) {
    let e = t.geometry, i = t.material, n = e.attributes.tangent === void 0, r = e.attributes.color !== void 0, s = e.attributes.normal === void 0;
    if (t.isPoints) {
      let a = "PointsMaterial:" + i.uuid, o = this.cache.get(a);
      o || (o = new mn(), ft.prototype.copy.call(o, i), o.color.copy(i.color), o.map = i.map, o.sizeAttenuation = false, this.cache.add(a, o)), i = o;
    } else if (t.isLine) {
      let a = "LineBasicMaterial:" + i.uuid, o = this.cache.get(a);
      o || (o = new xt(), ft.prototype.copy.call(o, i), o.color.copy(i.color), o.map = i.map, this.cache.add(a, o)), i = o;
    }
    if (n || r || s) {
      let a = "ClonedMaterial:" + i.uuid + ":";
      n && (a += "derivative-tangents:"), r && (a += "vertex-colors:"), s && (a += "flat-shading:");
      let o = this.cache.get(a);
      o || (o = i.clone(), r && (o.vertexColors = true), s && (o.flatShading = true), n && (o.normalScale && (o.normalScale.y *= -1), o.clearcoatNormalScale && (o.clearcoatNormalScale.y *= -1)), this.cache.add(a, o), this.associations.set(o, this.associations.get(i))), i = o;
    }
    t.material = i;
  }
  getMaterialType() {
    return Tn;
  }
  loadMaterial(t) {
    let e = this, i = this.json, n = this.extensions, r = i.materials[t], s, a = {}, o = r.extensions || {}, c = [];
    if (o[g.KHR_MATERIALS_UNLIT]) {
      let u = n[g.KHR_MATERIALS_UNLIT];
      s = u.getMaterialType(), c.push(u.extendParams(a, r, e));
    } else {
      let u = r.pbrMetallicRoughness || {};
      if (a.color = new V(1, 1, 1), a.opacity = 1, Array.isArray(u.baseColorFactor)) {
        let d = u.baseColorFactor;
        a.color.setRGB(d[0], d[1], d[2], Ma), a.opacity = d[3];
      }
      u.baseColorTexture !== void 0 && c.push(e.assignTexture(a, "map", u.baseColorTexture, Nt)), a.metalness = u.metallicFactor !== void 0 ? u.metallicFactor : 1, a.roughness = u.roughnessFactor !== void 0 ? u.roughnessFactor : 1, u.metallicRoughnessTexture !== void 0 && (c.push(e.assignTexture(a, "metalnessMap", u.metallicRoughnessTexture)), c.push(e.assignTexture(a, "roughnessMap", u.metallicRoughnessTexture))), s = this._invokeOne(function(d) {
        return d.getMaterialType && d.getMaterialType(t);
      }), c.push(Promise.all(this._invokeAll(function(d) {
        return d.extendMaterialParams && d.extendMaterialParams(t, a);
      })));
    }
    r.doubleSided === true && (a.side = _p);
    let l = r.alphaMode || W2.OPAQUE;
    if (l === W2.BLEND ? (a.transparent = true, a.depthWrite = false) : (a.transparent = false, l === W2.MASK && (a.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : 0.5)), r.normalTexture !== void 0 && s !== ze && (c.push(e.assignTexture(a, "normalMap", r.normalTexture)), a.normalScale = new I(1, 1), r.normalTexture.scale !== void 0)) {
      let u = r.normalTexture.scale;
      a.normalScale.set(u, u);
    }
    if (r.occlusionTexture !== void 0 && s !== ze && (c.push(e.assignTexture(a, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (a.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && s !== ze) {
      let u = r.emissiveFactor;
      a.emissive = new V().setRGB(u[0], u[1], u[2], Ma);
    }
    return r.emissiveTexture !== void 0 && s !== ze && c.push(e.assignTexture(a, "emissiveMap", r.emissiveTexture, Nt)), Promise.all(c).then(function() {
      let u = new s(a);
      return r.name && (u.name = r.name), y2(u, r), e.associations.set(u, { materials: t }), r.extensions && L2(n, u, r), u;
    });
  }
  createUniqueName(t) {
    let e = Y.sanitizeNodeName(t || "");
    return e in this.nodeNamesUsed ? e + "_" + ++this.nodeNamesUsed[e] : (this.nodeNamesUsed[e] = 0, e);
  }
  loadGeometries(t) {
    let e = this, i = this.extensions, n = this.primitiveCache;
    function r(a) {
      return i[g.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a, e).then(function(o) {
        return Pe3(o, a, e);
      });
    }
    let s = [];
    for (let a = 0, o = t.length; a < o; a++) {
      let c = t[a], l = vt2(c), u = n[l];
      if (u)
        s.push(u.promise);
      else {
        let d;
        c.extensions && c.extensions[g.KHR_DRACO_MESH_COMPRESSION] ? d = r(c) : d = Pe3(new q(), c, e), n[l] = { primitive: c, promise: d }, s.push(d);
      }
    }
    return Promise.all(s);
  }
  loadMesh(t) {
    let e = this, i = this.json, n = this.extensions, r = i.meshes[t], s = r.primitives, a = [];
    for (let o = 0, c = s.length; o < c; o++) {
      let l = s[o].material === void 0 ? Pt2(this.cache) : this.getDependency("material", s[o].material);
      a.push(l);
    }
    return a.push(e.loadGeometries(s)), Promise.all(a).then(function(o) {
      let c = o.slice(0, o.length - 1), l = o[o.length - 1], u = [];
      for (let h36 = 0, m = l.length; h36 < m; h36++) {
        let A = l[h36], p = s[h36], T, E2 = c[h36];
        if (p.mode === _.TRIANGLES || p.mode === _.TRIANGLE_STRIP || p.mode === _.TRIANGLE_FAN || p.mode === void 0)
          T = r.isSkinnedMesh === true ? new Vr(A, E2) : new Pt(A, E2), T.isSkinnedMesh === true && T.normalizeSkinWeights(), p.mode === _.TRIANGLE_STRIP ? T.geometry = z(T.geometry, mf) : p.mode === _.TRIANGLE_FAN && (T.geometry = z(T.geometry, yf));
        else if (p.mode === _.LINES)
          T = new Ht(A, E2);
        else if (p.mode === _.LINE_STRIP)
          T = new ge(A, E2);
        else if (p.mode === _.LINE_LOOP)
          T = new Jr(A, E2);
        else if (p.mode === _.POINTS)
          T = new Xr(A, E2);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + p.mode);
        Object.keys(T.geometry.morphAttributes).length > 0 && Bt3(T, r), T.name = e.createUniqueName(r.name || "mesh_" + t), y2(T, r), p.extensions && L2(n, T, p), e.assignFinalMaterial(T), u.push(T);
      }
      for (let h36 = 0, m = u.length; h36 < m; h36++)
        e.associations.set(u[h36], { meshes: t, primitives: h36 });
      if (u.length === 1)
        return r.extensions && L2(n, u[0], r), u[0];
      let d = new Ge();
      r.extensions && L2(n, d, r), e.associations.set(d, { meshes: t });
      for (let h36 = 0, m = u.length; h36 < m; h36++)
        d.add(u[h36]);
      return d;
    });
  }
  loadCamera(t) {
    let e, i = this.json.cameras[t], n = i[i.type];
    if (!n) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    return i.type === "perspective" ? e = new At(lm.radToDeg(n.yfov), n.aspectRatio || 1, n.znear || 1, n.zfar || 2e6) : i.type === "orthographic" && (e = new Fn(-n.xmag, n.xmag, n.ymag, -n.ymag, n.znear, n.zfar)), i.name && (e.name = this.createUniqueName(i.name)), y2(e, i), Promise.resolve(e);
  }
  loadSkin(t) {
    let e = this.json.skins[t], i = [];
    for (let n = 0, r = e.joints.length; n < r; n++)
      i.push(this._loadNodeShallow(e.joints[n]));
    return e.inverseBindMatrices !== void 0 ? i.push(this.getDependency("accessor", e.inverseBindMatrices)) : i.push(null), Promise.all(i).then(function(n) {
      let r = n.pop(), s = n, a = [], o = [];
      for (let c = 0, l = s.length; c < l; c++) {
        let u = s[c];
        if (u) {
          a.push(u);
          let d = new U();
          r !== null && d.fromArray(r.array, c * 16), o.push(d);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', e.joints[c]);
      }
      return new Dr(a, o);
    });
  }
  loadAnimation(t) {
    let e = this.json, i = this, n = e.animations[t], r = n.name ? n.name : "animation_" + t, s = [], a = [], o = [], c = [], l = [];
    for (let u = 0, d = n.channels.length; u < d; u++) {
      let h36 = n.channels[u], m = n.samplers[h36.sampler], A = h36.target, p = A.node, T = n.parameters !== void 0 ? n.parameters[m.input] : m.input, E2 = n.parameters !== void 0 ? n.parameters[m.output] : m.output;
      A.node !== void 0 && (s.push(this.getDependency("node", p)), a.push(this.getDependency("accessor", T)), o.push(this.getDependency("accessor", E2)), c.push(m), l.push(A));
    }
    return Promise.all([Promise.all(s), Promise.all(a), Promise.all(o), Promise.all(c), Promise.all(l)]).then(function(u) {
      let d = u[0], h36 = u[1], m = u[2], A = u[3], p = u[4], T = [];
      for (let x = 0, R = d.length; x < R; x++) {
        let b = d[x], I2 = h36[x], w2 = m[x], P = A[x], C = p[x];
        if (b === void 0)
          continue;
        b.updateMatrix && b.updateMatrix();
        let j2 = i._createAnimationTracks(b, I2, w2, P, C);
        if (j2)
          for (let K = 0; K < j2.length; K++)
            T.push(j2[K]);
      }
      let E2 = new Bi(r, void 0, T);
      return y2(E2, n), E2;
    });
  }
  createNodeMesh(t) {
    let e = this.json, i = this, n = e.nodes[t];
    return n.mesh === void 0 ? null : i.getDependency("mesh", n.mesh).then(function(r) {
      let s = i._getNodeRef(i.meshCache, n.mesh, r);
      return n.weights !== void 0 && s.traverse(function(a) {
        if (a.isMesh)
          for (let o = 0, c = n.weights.length; o < c; o++)
            a.morphTargetInfluences[o] = n.weights[o];
      }), s;
    });
  }
  loadNode(t) {
    let e = this.json, i = this, n = e.nodes[t], r = i._loadNodeShallow(t), s = [], a = n.children || [];
    for (let c = 0, l = a.length; c < l; c++)
      s.push(i.getDependency("node", a[c]));
    let o = n.skin === void 0 ? Promise.resolve(null) : i.getDependency("skin", n.skin);
    return Promise.all([r, Promise.all(s), o]).then(function(c) {
      let l = c[0], u = c[1], d = c[2];
      d !== null && l.traverse(function(h36) {
        h36.isSkinnedMesh && h36.bind(d, Ft2);
      });
      for (let h36 = 0, m = u.length; h36 < m; h36++)
        l.add(u[h36]);
      return l;
    });
  }
  _loadNodeShallow(t) {
    let e = this.json, i = this.extensions, n = this;
    if (this.nodeCache[t] !== void 0)
      return this.nodeCache[t];
    let r = e.nodes[t], s = r.name ? n.createUniqueName(r.name) : "", a = [], o = n._invokeOne(function(c) {
      return c.createNodeMesh && c.createNodeMesh(t);
    });
    return o && a.push(o), r.camera !== void 0 && a.push(n.getDependency("camera", r.camera).then(function(c) {
      return n._getNodeRef(n.cameraCache, r.camera, c);
    })), n._invokeAll(function(c) {
      return c.createNodeAttachment && c.createNodeAttachment(t);
    }).forEach(function(c) {
      a.push(c);
    }), this.nodeCache[t] = Promise.all(a).then(function(c) {
      let l;
      if (r.isBone === true ? l = new dn() : c.length > 1 ? l = new Ge() : c.length === 1 ? l = c[0] : l = new H(), l !== c[0])
        for (let u = 0, d = c.length; u < d; u++)
          l.add(c[u]);
      if (r.name && (l.userData.name = r.name, l.name = s), y2(l, r), r.extensions && L2(i, l, r), r.matrix !== void 0) {
        let u = new U();
        u.fromArray(r.matrix), l.applyMatrix4(u);
      } else
        r.translation !== void 0 && l.position.fromArray(r.translation), r.rotation !== void 0 && l.quaternion.fromArray(r.rotation), r.scale !== void 0 && l.scale.fromArray(r.scale);
      if (!n.associations.has(l))
        n.associations.set(l, {});
      else if (r.mesh !== void 0 && n.meshCache.refs[r.mesh] > 1) {
        let u = n.associations.get(l);
        n.associations.set(l, { ...u });
      }
      return n.associations.get(l).nodes = t, l;
    }), this.nodeCache[t];
  }
  loadScene(t) {
    let e = this.extensions, i = this.json.scenes[t], n = this, r = new Ge();
    i.name && (r.name = n.createUniqueName(i.name)), y2(r, i), i.extensions && L2(e, r, i);
    let s = i.nodes || [], a = [];
    for (let o = 0, c = s.length; o < c; o++)
      a.push(n.getDependency("node", s[o]));
    return Promise.all(a).then(function(o) {
      for (let l = 0, u = o.length; l < u; l++)
        r.add(o[l]);
      let c = (l) => {
        let u = /* @__PURE__ */ new Map();
        for (let [d, h36] of n.associations)
          (d instanceof ft || d instanceof ut) && u.set(d, h36);
        return l.traverse((d) => {
          let h36 = n.associations.get(d);
          h36 != null && u.set(d, h36);
        }), u;
      };
      return n.associations = c(r), r;
    });
  }
  _createAnimationTracks(t, e, i, n, r) {
    let s = [], a = t.name ? t.name : t.uuid, o = [];
    N2[r.path] === N2.weights ? t.traverse(function(d) {
      d.morphTargetInfluences && o.push(d.name ? d.name : d.uuid);
    }) : o.push(a);
    let c;
    switch (N2[r.path]) {
      case N2.weights:
        c = Ci;
        break;
      case N2.rotation:
        c = zi;
        break;
      case N2.translation:
      case N2.scale:
        c = Fi;
        break;
      default:
        switch (i.itemSize) {
          case 1:
            c = Ci;
            break;
          case 2:
          case 3:
          default:
            c = Fi;
            break;
        }
        break;
    }
    let l = n.interpolation !== void 0 ? Dt3[n.interpolation] : Ir, u = this._getArrayFromAccessor(i);
    for (let d = 0, h36 = o.length; d < h36; d++) {
      let m = new c(o[d] + "." + N2[r.path], e.array, u, l);
      n.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(m), s.push(m);
    }
    return s;
  }
  _getArrayFromAccessor(t) {
    let e = t.array;
    if (t.normalized) {
      let i = _e2(e.constructor), n = new Float32Array(e.length);
      for (let r = 0, s = e.length; r < s; r++)
        n[r] = e[r] * i;
      e = n;
    }
    return e;
  }
  _createCubicSplineTrackInterpolant(t) {
    t.createInterpolant = function(i) {
      let n = this instanceof zi ? Ee2 : G;
      return new n(this.times, this.values, this.getValueSize() / 3, i);
    }, t.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;
  }
};
function Gt3(f, t, e) {
  let i = t.attributes, n = new pt();
  if (i.POSITION !== void 0) {
    let a = e.json.accessors[i.POSITION], o = a.min, c = a.max;
    if (o !== void 0 && c !== void 0) {
      if (n.set(new w(o[0], o[1], o[2]), new w(c[0], c[1], c[2])), a.normalized) {
        let l = _e2(D[a.componentType]);
        n.min.multiplyScalar(l), n.max.multiplyScalar(l);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else
    return;
  let r = t.targets;
  if (r !== void 0) {
    let a = new w(), o = new w();
    for (let c = 0, l = r.length; c < l; c++) {
      let u = r[c];
      if (u.POSITION !== void 0) {
        let d = e.json.accessors[u.POSITION], h36 = d.min, m = d.max;
        if (h36 !== void 0 && m !== void 0) {
          if (o.setX(Math.max(Math.abs(h36[0]), Math.abs(m[0]))), o.setY(Math.max(Math.abs(h36[1]), Math.abs(m[1]))), o.setZ(Math.max(Math.abs(h36[2]), Math.abs(m[2]))), d.normalized) {
            let A = _e2(D[d.componentType]);
            o.multiplyScalar(A);
          }
          a.max(o);
        } else
          console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    n.expandByVector(a);
  }
  f.boundingBox = n;
  let s = new ct();
  n.getCenter(s.center), s.radius = n.min.distanceTo(n.max) / 2, f.boundingSphere = s;
}
function Pe3(f, t, e) {
  let i = t.attributes, n = [];
  function r(s, a) {
    return e.getDependency("accessor", s).then(function(o) {
      f.setAttribute(a, o);
    });
  }
  for (let s in i) {
    let a = be2[s] || s.toLowerCase();
    a in f.attributes || n.push(r(i[s], a));
  }
  if (t.indices !== void 0 && !f.index) {
    let s = e.getDependency("accessor", t.indices).then(function(a) {
      f.setIndex(a);
    });
    n.push(s);
  }
  return Ft.workingColorSpace !== Ma && "COLOR_0" in i && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Ft.workingColorSpace}" not supported.`), y2(f, t), Gt3(f, t, e), Promise.all(n).then(function() {
    return t.targets !== void 0 ? Ht2(f, t.targets, e) : f;
  });
}

// vfs:vfs:/src/Player.js
var Player = class {
  constructor(scene, initialPosition, scale, playerGroundOcclusion2, playerCloudShadow2) {
    this.scene = scene;
    this.playerGroundOcclusion = playerGroundOcclusion2;
    this.playerCloudShadow = playerCloudShadow2;
    this.group = new Ge();
    this.group.position.copy(initialPosition);
    this.group.scale.set(scale, scale, scale);
    this.scene.add(this.group);
    const body = new Pt(
      new cn(1, 2, 1),
      new Tn({ color: 3381759 })
    );
    body.castShadow = true;
    body.position.y = 1;
    this.group.add(body);
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.equipment = null;
    this.boneContainers = null;
    this.raceReady = null;

    // Shared material-shader injection (ground occlusion + cloud shadow).
    // Pulled out so we can reuse it for Soldier.glb OR a race model.
    const injectShader = (mat) => {
      if (!mat || mat.__grudgeShaderInjected) return;
      mat.__grudgeShaderInjected = true;
      mat.onBeforeCompile = (shader) => {
          shader.uniforms.uGroundHeight = this.playerGroundOcclusion.groundHeight;
          shader.uniforms.uGroundMaxHeight = this.playerGroundOcclusion.maxHeight;
          shader.uniforms.uGroundStrength = this.playerGroundOcclusion.strength;
          shader.uniforms.uCloudTime = this.playerCloudShadow.time;
          shader.uniforms.uCloudScale = this.playerCloudShadow.scale;
          shader.uniforms.uCloudIntensity = this.playerCloudShadow.intensity;
          shader.vertexShader = `
                  varying vec3 vWorldPosition;
                  ` + shader.vertexShader.replace(
            "#include <worldpos_vertex>",
            `
                     #include <worldpos_vertex>
                     vWorldPosition = vec3( worldPosition );
                     `
          );
          shader.fragmentShader = `
                  varying vec3 vWorldPosition;
                  uniform float uGroundHeight;
                  uniform float uGroundMaxHeight;
                  uniform float uGroundStrength;

                  uniform float uCloudTime;
                  uniform float uCloudScale;
                  uniform float uCloudIntensity;

                  float hash(vec2 p) {
                     p = fract(p * vec2(123.34, 345.45));
                     p += dot(p, p + 34.345);
                     return fract(p.x * p.y);
                  }

                  float noise2d(vec2 p) {
                     vec2 i = floor(p);
                     vec2 f = fract(p);
                     float a = hash(i);
                     float b = hash(i + vec2(1.0, 0.0));
                     float c = hash(i + vec2(0.0, 1.0));
                     float d = hash(i + vec2(1.0, 1.0));
                     vec2 u = f * f * (3.0 - 2.0 * f);
                     return mix(a, b, u.x) +
                           (c - a) * u.y * (1.0 - u.x) +
                           (d - b) * u.x * u.y;
                  }
                  ` + shader.fragmentShader.replace(
            "#include <dithering_fragment>",
            `
                     // Ground occlusion
                     float h = clamp((vWorldPosition.y - uGroundHeight) / uGroundMaxHeight, 0.0, 1.0);
                     float occlusion = mix(uGroundStrength, 1.0, h);

                     // Cloud shadows
                     vec2 cUv = vec2(
                     (vWorldPosition.x + uCloudTime * 10.0) / uCloudScale,
                     (vWorldPosition.z + uCloudTime * 10.0) / uCloudScale
                     );
                     float cn = noise2d(cUv);
                     cn = smoothstep(0.2, 0.8, cn);
                     float cloudShadow = mix(1.0 - uCloudIntensity, 1.0, cn);

                     gl_FragColor.rgb *= (occlusion * cloudShadow);

                     #include <dithering_fragment>
                     `
          );
      };
      mat.needsUpdate = true;
    };

    // Prepare a model root: apply shadows + shader injection to every mesh,
    // swap out the placeholder body box, and build the AnimationMixer.
    const mountModel = (model, animations, clipMap) => {
      model.traverse((o) => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        o.castShadow = true;
        o.receiveShadow = true;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(injectShader);
      });
      model.rotation.y = Math.PI;
      this.group.rotation.y = Math.PI;
      if (body.parent === this.group) this.group.remove(body);
      this.group.add(model);
      this.mixer = new el(model);

      // clipMap is optional — { idle, walk, run, jump, attack, heavy, sneak, ... }
      const stateFromLogical = {
        idle: "Idle", walk: "Walk", run: "Run", jump: "Jump", fall: "Fall",
        attack: "Attack", heavy: "Heavy", sneak: "Sneak", dodge: "Dodge", block: "Block", death: "Death"
      };
      if (clipMap) {
        for (const [logical, clip] of Object.entries(clipMap)) {
          const stateName = stateFromLogical[logical];
          if (!stateName || !clip) continue;
          this.actions[stateName] = this.mixer.clipAction(clip);
        }
      }

      // Heuristic fill-in from remaining clips (handles Soldier.glb too).
      (animations || []).forEach((clip) => {
        const name = (clip.name || "").toLowerCase();
        if (!this.actions.Idle && name.includes("idle")) this.actions.Idle = this.mixer.clipAction(clip);
        if (!this.actions.Walk && name.includes("walk")) this.actions.Walk = this.mixer.clipAction(clip);
        if (!this.actions.Run  && name.includes("run") && !name.includes("jump")) this.actions.Run  = this.mixer.clipAction(clip);
        if (!this.actions.Jump && name.includes("jump")) this.actions.Jump = this.mixer.clipAction(clip);
        if (!this.actions.Fall && name.includes("fall")) this.actions.Fall = this.mixer.clipAction(clip);
        if (!this.actions.Attack && (name.includes("attack") || name.includes("swing") || name.includes("draw"))) this.actions.Attack = this.mixer.clipAction(clip);
        if (!this.actions.Heavy && (name.includes("heavy") || name.includes("360") || name.includes("overdraw"))) this.actions.Heavy = this.mixer.clipAction(clip);
        if (!this.actions.Sneak && (name.includes("sneak") || name.includes("crouch") || name.includes("strafe"))) this.actions.Sneak = this.mixer.clipAction(clip);
        if (!this.actions.Dodge && (name.includes("dodge") || name.includes("roll"))) this.actions.Dodge = this.mixer.clipAction(clip);
      });

      const fallback = (animations && animations.length) ? this.mixer.clipAction(animations[0]) : null;
      this.actions.Idle   ||= fallback;
      this.actions.Walk   ||= this.actions.Run  || this.actions.Idle;
      this.actions.Run    ||= this.actions.Walk || this.actions.Idle;
      this.actions.Jump   ||= this.actions.Idle;
      this.actions.Fall   ||= this.actions.Jump || this.actions.Idle;
      this.actions.Attack ||= this.actions.Run  || this.actions.Idle;
      this.actions.Heavy  ||= this.actions.Attack;
      this.actions.Sneak  ||= this.actions.Walk;
      this.actions.Dodge  ||= this.actions.Run  || this.actions.Walk;

      // One-shot actions should clamp & not loop.
      ["Attack", "Heavy", "Dodge"].forEach((k) => {
        const a = this.actions[k];
        if (a && a.setLoop) {
          a.setLoop(2200 /* LoopOnce */, 1);
          a.clampWhenFinished = true;
        }
      });

      this.setAnimationState("Idle", 0, 1);
    };
    this._mountModel = mountModel;

    // Prefer the Grudge race wiring if present (window.Grudge.race is a Promise
    // set up by src/wire-race-model.js). Fall back to Soldier.glb otherwise.
    const fallbackSoldier = () => {
      const loader = new Oe2();
      loader.load("https://threejs.org/examples/models/gltf/Soldier.glb", (gltf) => {
        mountModel(gltf.scene, gltf.animations, null);
      });
    };
    const racePromise = (typeof window !== "undefined" && window.Grudge && window.Grudge.race) || null;
    if (racePromise && typeof racePromise.then === "function") {
      this.raceReady = racePromise.then((bundle) => {
        try {
          this.equipment = bundle.equipment || null;
          this.boneContainers = bundle.boneContainers || null;
          mountModel(bundle.root, bundle.animations, bundle.clips);
          if (typeof window !== "undefined") window.GrudgePlayer = this;
        } catch (err) {
          console.warn("[Grudge] race mount failed, falling back to Soldier.glb:", err);
          fallbackSoldier();
        }
      }).catch((err) => {
        console.warn("[Grudge] race load failed, falling back to Soldier.glb:", err);
        fallbackSoldier();
      });
    } else {
      fallbackSoldier();
    }
  }
  setAnimationState(name, fadeDuration, speed) {
    if (!this.mixer)
      return;
    const next = this.actions[name];
    if (!next)
      return;
    if (this.currentAction !== next) {
      if (this.currentAction)
        this.currentAction.fadeOut(fadeDuration);
      next.reset().fadeIn(fadeDuration).play();
      this.currentAction = next;
    }
    next.setEffectiveTimeScale(speed);
  }
  update(dt) {
    if (this.mixer)
      this.mixer.update(dt);
  }
};

// vfs:vfs:/src/Ball.js
var BeachBall = class {
  constructor(scene, position, radius, baseColor = 16777215, {
    slopeFactor = 1,
    // how strongly gravity pulls downhill
    groundFriction = 2,
    // slows while touching ground
    airDrag = 0.3,
    // slows in air (horizontal)
    bounciness = 0.45
    // how "rubbery" the ball is when bouncing
  } = {}) {
    this.scene = scene;
    this.radius = radius;
    this.slopeFactor = slopeFactor;
    this.groundFriction = groundFriction;
    this.airDrag = airDrag;
    this.bounciness = bounciness;
    this.velocity = new w();
    this._planar = new w();
    this._tmpAxis = new w();
    this.lastSlopeSq = 0;
    this.isSleeping = false;
    const geo = new An(radius, 32, 32);
    const posAttr = geo.attributes.position;
    const colors = [];
    const palette = [
      new V(16729156),
      // red
      new V(4491519),
      // blue
      new V(16768324),
      // yellow
      new V(4508740),
      // green
      new V(16746564),
      // orange
      new V(16777215)
      // white
    ];
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y3 = posAttr.getY(i);
      const z2 = posAttr.getZ(i);
      const ny = y3 / radius;
      let c;
      if (ny > 0.9 || ny < -0.9) {
        c = palette[5];
      } else {
        const angle = Math.atan2(z2, x);
        const t = (angle + Math.PI) / (2 * Math.PI);
        const idx = Math.floor(t * 6) % 6;
        c = palette[idx];
      }
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute(
      "color",
      new B(colors, 3)
    );
    const mat = new Tn({
      color: baseColor,
      roughness: 0.35,
      metalness: 0,
      vertexColors: true
    });
    this.mesh = new Pt(geo, mat);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.copy(position);
    this.scene.add(this.mesh);
  }
  applyImpulse(vec) {
    this.velocity.add(vec);
    this.isSleeping = false;
  }
  update(dt, terrainHeightFn, gravity) {
    const pos = this.mesh.position;
    const terrainY = terrainHeightFn(pos.x, pos.z);
    if (this.isSleeping) {
      pos.y = terrainY + this.radius;
      return;
    }
    this.velocity.y += gravity * dt;
    pos.addScaledVector(this.velocity, dt);
    const bottomY = pos.y - this.radius;
    const onGround = bottomY <= terrainY + 0.01;
    if (onGround) {
      pos.y = terrainY + this.radius;
      if (this.velocity.y < 0) {
        this.velocity.y = -this.velocity.y * this.bounciness;
        if (Math.abs(this.velocity.y) < 0.5)
          this.velocity.y = 0;
      }
      this._applySlopeForce(dt, terrainHeightFn, gravity);
    } else {
      this.lastSlopeSq = 0;
    }
    const airDamp = Math.exp(-this.airDrag * dt);
    this.velocity.x *= airDamp;
    this.velocity.z *= airDamp;
    if (onGround) {
      const groundDamp = Math.exp(-this.groundFriction * dt);
      this.velocity.x *= groundDamp;
      this.velocity.z *= groundDamp;
    }
    const planarSpeedSq = this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z;
    const sleepPlanarThresholdSq = 0.08 * 0.08;
    const sleepVerticalThreshold = 0.2;
    const slopeThresholdSq = 5e-4;
    if (onGround && planarSpeedSq < sleepPlanarThresholdSq && Math.abs(this.velocity.y) < sleepVerticalThreshold && this.lastSlopeSq < slopeThresholdSq) {
      this.velocity.set(0, 0, 0);
      this.isSleeping = true;
      pos.y = terrainY + this.radius;
      return;
    } else {
      this.isSleeping = false;
    }
    this._planar.set(this.velocity.x, 0, this.velocity.z);
    const speed = this._planar.length();
    if (speed > 0.05 && onGround) {
      this._tmpAxis.set(this._planar.z, 0, -this._planar.x).normalize();
      const angle = speed * dt / this.radius;
      this.mesh.rotateOnWorldAxis(this._tmpAxis, angle);
    }
  }
  _applySlopeForce(dt, terrainHeightFn, gravity) {
    const pos = this.mesh.position;
    const eps = this.radius * 0.7;
    const hL = terrainHeightFn(pos.x - eps, pos.z);
    const hR = terrainHeightFn(pos.x + eps, pos.z);
    const hD = terrainHeightFn(pos.x, pos.z - eps);
    const hU = terrainHeightFn(pos.x, pos.z + eps);
    const gradX = (hR - hL) / (2 * eps);
    const gradZ = (hU - hD) / (2 * eps);
    const downhill = new w(-gradX, 0, -gradZ);
    const lenSq = downhill.lengthSq();
    this.lastSlopeSq = lenSq;
    if (lenSq < 1e-6)
      return;
    downhill.normalize();
    const g2 = Math.abs(gravity);
    const accel = g2 * this.slopeFactor;
    this.velocity.addScaledVector(downhill, accel * dt);
  }
};

// vfs:vfs:/src/resources/blade_diffuse.jpg
var blade_diffuse_default = "data:image/jpeg;base64,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";

// vfs:vfs:/src/resources/blade_alpha.jpg
var blade_alpha_default = "data:image/jpeg;base64,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";

// vfs:vfs:/src/World.js
var PLAYER_SCALE = 4.2;
var CHUNK_SIZE = 140;
var RENDER_DISTANCE = 1;
var LOD_DISTANCE = 1;
var BALL_RADIUS = 0.9 * PLAYER_SCALE;
var playerGroundOcclusion = {
  groundHeight: { value: 0 },
  maxHeight: { value: 1.8 * PLAYER_SCALE },
  strength: { value: 0.5 }
};
var playerCloudShadow = {
  time: { value: 0 },
  scale: { value: 40 },
  // matches grass shader
  intensity: { value: 0.136 }
};
var World = class {
  constructor(renderer2) {
    this.renderer = renderer2;
    this.scene = new Or();
    this.scene.background = new V(8893951);
    this.scene.fog = new Rr(8893951, 10, 150);
    this.camera = new At(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    this.camera.position.set(0, 6 * PLAYER_SCALE, 12 * PLAYER_SCALE);
    this.cameraParams = {
      yaw: 0,
      pitch: -0.25,
      minPitch: -Math.PI / 3,
      maxPitch: Math.PI / 3,
      distance: 4.5 * PLAYER_SCALE,
      minDistance: 2 * PLAYER_SCALE,
      maxDistance: 12 * PLAYER_SCALE,
      followSpeed: 10,
      mouseSensitivity: 25e-4
    };
    this.isPointerLocked = false;
    this.firstCameraUpdate = true;
    this.cameraTarget = new w();
    this.cameraForward = new w();
    this.cameraEuler = new ee(0, 0, 0, "YXZ");
    this.smoothedCameraHeight = 0;
    this._setupPointerAndCameraControls();
    this._setupLights();
    this._setupSkybox();
    this.chunks = /* @__PURE__ */ new Map();
    this.chunkBuildQueue = [];
    this.lastChunkUpdate = 0;
    this.MAX_CHUNKS_PER_FRAME = 1;
    this.velocityY = 0;
    this.isGrounded = true;
    this.gravity = -45 * PLAYER_SCALE;
    this.jumpSpeed = 17 * PLAYER_SCALE;
    this.keys = {};
    this.controlsState = {
      key: [0, 0, 0],
      current: "Idle",
      fadeDuration: 0.2,
      walkVelocity: 4 * PLAYER_SCALE,
      runVelocity: 10 * PLAYER_SCALE,
      sneakVelocity: 2 * PLAYER_SCALE,
      dodgeVelocity: 22 * PLAYER_SCALE,
      dodgeDuration: 0.35,
      rotateSpeed: 8,
      ease: new w(),
      up: new w(0, 1, 0),
      rotateQuat: new Mt(),
      // combat state
      attackUntil: 0,
      attackAnim: null,
      sneak: false,
      dodgeUntil: 0,
      dodgeDir: new w()
    };
    this._setupKeyboard();
    const startY = this._getTerrainHeightAtWorld(0, 0) + 0.1;
    this.player = new Player(
      this.scene,
      new w(0, startY, 0),
      PLAYER_SCALE,
      playerGroundOcclusion,
      playerCloudShadow
    );
    this.smoothedCameraHeight = startY + 1.6 * PLAYER_SCALE;
    const playerPos = this.player.group.position.clone();
    const forward = new w(0, 0, -1);
    const yawEuler = new ee(0, this.cameraParams.yaw, 0, "YXZ");
    forward.applyEuler(yawEuler).normalize();
    const distanceAhead = 5 * PLAYER_SCALE;
    const spawnX = playerPos.x + forward.x * distanceAhead;
    const spawnZ = playerPos.z + forward.z * distanceAhead;
    const ballGroundY = this._getTerrainHeightAtWorld(spawnX, spawnZ);
    const ballStartPos = new w(
      spawnX,
      ballGroundY + BALL_RADIUS,
      spawnZ
    );
    this.ball = new BeachBall(
      this.scene,
      ballStartPos,
      BALL_RADIUS,
      16777215,
      {
        slopeFactor: 0.9,
        groundFriction: 3,
        airDrag: 0.25,
        bounciness: 0.5
      }
    );
    this._updateChunks(0, 0);
  }
  // ======================================================
  // SETUP HELPERS
  // ======================================================
  _setupLights() {
    const hemi = new Oo(16777215, 2107408, 0.6);
    this.scene.add(hemi);
    const dirLight = new Uo(16777215, 1.5);
    dirLight.position.set(20, 40, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    this.scene.add(dirLight);
  }
  _setupSkybox() {
    const cubeLoader = new Eh();
    cubeLoader.setPath(
      "https://cdn.apewebapps.com/threejs/160/examples/textures/cube/skyboxsun25deg/"
    );
    const skyTexture = cubeLoader.load([
      "nx.jpg",
      "px.jpg",
      "py.jpg",
      "ny.jpg",
      "nz.jpg",
      "pz.jpg"
    ]);
    skyTexture.colorSpace = Nt;
    this.scene.background = skyTexture;
    this.scene.fog.color.set("#171717");
  }
  _setupPointerAndCameraControls() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener("click", () => {
      if (!this.isPointerLocked)
        canvas.requestPointerLock();
    });
    document.addEventListener("pointerlockchange", () => {
      this.isPointerLocked = document.pointerLockElement === canvas;
    });
    window.addEventListener("mousemove", (e) => {
      if (!this.isPointerLocked)
        return;
      this.cameraParams.yaw -= e.movementX * this.cameraParams.mouseSensitivity;
      this.cameraParams.pitch -= e.movementY * this.cameraParams.mouseSensitivity;
      this.cameraParams.pitch = Math.max(
        this.cameraParams.minPitch,
        Math.min(this.cameraParams.maxPitch, this.cameraParams.pitch)
      );
    });
    window.addEventListener("wheel", (e) => {
      this.cameraParams.distance += e.deltaY * 0.01 * PLAYER_SCALE;
      this.cameraParams.distance = Math.max(
        this.cameraParams.minDistance,
        Math.min(this.cameraParams.maxDistance, this.cameraParams.distance)
      );
    });
  }
  _setupKeyboard() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      const k = this.controlsState.key;
      if (e.code === "KeyW" || e.code === "ArrowUp")
        k[0] = -1;
      if (e.code === "KeyS" || e.code === "ArrowDown")
        k[0] = 1;
      if (e.code === "KeyA" || e.code === "ArrowLeft")
        k[1] = -1;
      if (e.code === "KeyD" || e.code === "ArrowRight")
        k[1] = 1;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight")
        k[2] = 1;
      if (e.code === "AltLeft" || e.code === "AltRight") {
        this.controlsState.sneak = true;
        e.preventDefault();
      }
      if (e.code === "ControlLeft" || e.code === "ControlRight") {
        this._triggerDodge();
        e.preventDefault();
      }
      if (e.code === "KeyF")
        this._triggerAttack("Attack");
      if (e.code === "KeyG")
        this._triggerAttack("Heavy");
    });
    window.addEventListener("mousedown", (e) => {
      if (!this.isPointerLocked) return;
      if (e.button === 0) this._triggerAttack("Attack");
      if (e.button === 2) this._triggerAttack("Heavy");
    });
    window.addEventListener("contextmenu", (e) => {
      if (this.isPointerLocked) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
      const k = this.controlsState.key;
      if (e.code === "KeyW" || e.code === "ArrowUp")
        k[0] = 0;
      if (e.code === "KeyS" || e.code === "ArrowDown")
        k[0] = 0;
      if (e.code === "KeyA" || e.code === "ArrowLeft")
        k[1] = 0;
      if (e.code === "KeyD" || e.code === "ArrowRight")
        k[1] = 0;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight")
        k[2] = 0;
      if (e.code === "AltLeft" || e.code === "AltRight")
        this.controlsState.sneak = false;
    });
  }
  // ======================================================
  // CHUNKS / TERRAIN
  // ======================================================
  _getChunkKey(chunkX, chunkZ) {
    return `${chunkX},${chunkZ}`;
  }
  _worldToChunk(worldX, worldZ) {
    return {
      x: Math.floor((worldX + CHUNK_SIZE / 2) / CHUNK_SIZE),
      z: Math.floor((worldZ + CHUNK_SIZE / 2) / CHUNK_SIZE)
    };
  }
  _createChunk(chunkX, chunkZ, isLowDetail = false) {
    const grassInstances = isLowDetail ? 5e3 : 4e4;
    const terrain = createGrassTerrain(
      { bW: 0.09, bH: 1.42 },
      CHUNK_SIZE,
      grassInstances,
      blade_diffuse_default,
      blade_alpha_default,
      chunkX,
      chunkZ,
      CHUNK_SIZE
    );
    terrain.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);
    return {
      x: chunkX,
      z: chunkZ,
      terrain,
      isLowDetail,
      lastAccessed: Date.now()
    };
  }
  _updateChunks(playerX, playerZ) {
    const playerChunk = this._worldToChunk(playerX, playerZ);
    const playerChunkX = playerChunk.x;
    const playerChunkZ = playerChunk.z;
    const activeChunks = /* @__PURE__ */ new Set();
    for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
      for (let z2 = -RENDER_DISTANCE; z2 <= RENDER_DISTANCE; z2++) {
        const chunkX = playerChunkX + x;
        const chunkZ = playerChunkZ + z2;
        const key = this._getChunkKey(chunkX, chunkZ);
        activeChunks.add(key);
        if (!this.chunks.has(key)) {
          const dx = Math.abs(chunkX - playerChunkX);
          const dz = Math.abs(chunkZ - playerChunkZ);
          const isLowDetail = dx > LOD_DISTANCE || dz > LOD_DISTANCE;
          this.chunkBuildQueue.push({ chunkX, chunkZ, isLowDetail });
        } else {
          this.chunks.get(key).lastAccessed = Date.now();
        }
      }
    }
    const toRemove = [];
    this.chunks.forEach((chunk, key) => {
      if (!activeChunks.has(key))
        toRemove.push(key);
    });
    toRemove.forEach((key) => {
      const chunk = this.chunks.get(key);
      if (!chunk)
        return;
      this.scene.remove(chunk.terrain);
      chunk.terrain.traverse((child) => {
        if (child.geometry)
          child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.chunks.delete(key);
    });
  }
  _getTerrainHeightAtWorld(worldX, worldZ) {
    const chunkCoords = this._worldToChunk(worldX, worldZ);
    const localX = worldX - chunkCoords.x * CHUNK_SIZE;
    const localZ = worldZ - chunkCoords.z * CHUNK_SIZE;
    return getTerrainHeight(localX, localZ, chunkCoords.x, chunkCoords.z, CHUNK_SIZE);
  }
  // ======================================================
  // GRASS TRAILS (PLAYER + BALL)
  // ======================================================
  _updateGrassTrail(dt) {
    const decayRate = 0.15;
    const decay = Math.exp(-decayRate * dt);
    const playerRadius = 1.4 * PLAYER_SCALE;
    const ballRadius = BALL_RADIUS * 1.1;
    const playerPos = this.player.group.position;
    const ballPos = this.ball.mesh.position;
    const ballBottomY = ballPos.y - BALL_RADIUS;
    const ballTerrainY = this._getTerrainHeightAtWorld(ballPos.x, ballPos.z);
    const ballOnGround = ballBottomY <= ballTerrainY + 0.05;
    const playerChunk = this._worldToChunk(playerPos.x, playerPos.z);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const key = this._getChunkKey(playerChunk.x + dx, playerChunk.z + dz);
        const chunk = this.chunks.get(key);
        if (!chunk)
          continue;
        const terrain = chunk.terrain;
        if (!terrain.userData.trailArray)
          continue;
        const trail = terrain.userData.trailArray;
        const dir = terrain.userData.trailDirArray;
        const offsets = terrain.userData.offsetsArray;
        const trailAttr = terrain.userData.trailAttribute;
        const trailDirAttr = terrain.userData.trailDirAttribute;
        const chunkWorldX = chunk.x * CHUNK_SIZE;
        const chunkWorldZ = chunk.z * CHUNK_SIZE;
        const localPx = playerPos.x - chunkWorldX;
        const localPz = playerPos.z - chunkWorldZ;
        const localBx = ballPos.x - chunkWorldX;
        const localBz = ballPos.z - chunkWorldZ;
        const playerRadiusSq = playerRadius * playerRadius;
        const ballRadiusSq = ballRadius * ballRadius;
        let needsUpdate = false;
        for (let i = 0, j2 = 0; i < trail.length; i++, j2 += 3) {
          const x = offsets[j2];
          const z2 = offsets[j2 + 2];
          let t = trail[i] * decay;
          const pdx = x - localPx;
          const pdz = z2 - localPz;
          const pDistSq = pdx * pdx + pdz * pdz;
          const bdx = x - localBx;
          const bdz = z2 - localBz;
          const bDistSq = bdx * bdx + bdz * bdz;
          let bestStamp = 0;
          let stampDirX = 0;
          let stampDirZ = 0;
          if (this.isGrounded && pDistSq < playerRadiusSq) {
            const dist = Math.sqrt(Math.max(pDistSq, 1e-6));
            const influence = 1 - dist / playerRadius;
            const strength = 1.2;
            const stamped = influence * strength;
            if (stamped > bestStamp) {
              bestStamp = stamped;
              const inv = 1 / dist;
              stampDirX = pdx * inv;
              stampDirZ = pdz * inv;
            }
          }
          if (ballOnGround && bDistSq < ballRadiusSq) {
            const dist = Math.sqrt(Math.max(bDistSq, 1e-6));
            const influence = 1 - dist / ballRadius;
            const strength = 1.8;
            const stamped = influence * strength;
            if (stamped > bestStamp) {
              bestStamp = stamped;
              const inv = 1 / dist;
              stampDirX = bdx * inv;
              stampDirZ = bdz * inv;
            }
          }
          if (bestStamp > t) {
            t = bestStamp;
            dir[2 * i] = stampDirX;
            dir[2 * i + 1] = stampDirZ;
            needsUpdate = true;
          }
          trail[i] = t;
        }
        if (needsUpdate) {
          trailAttr.needsUpdate = true;
          trailDirAttr.needsUpdate = true;
        }
      }
    }
  }
  // ======================================================
  // PLAYER ↔ BALL INTERACTION
  // ======================================================
  _handlePlayerBallInteraction(move, dt) {
    const playerPos = this.player.group.position;
    const ballPos = this.ball.mesh.position;
    const playerRadius = 0.7 * PLAYER_SCALE;
    const combinedRadius = playerRadius + BALL_RADIUS;
    const combinedRadiusSq = combinedRadius * combinedRadius;
    const dx = ballPos.x - playerPos.x;
    const dz = ballPos.z - playerPos.z;
    const distSq = dx * dx + dz * dz;
    if (distSq < combinedRadiusSq && distSq > 1e-5) {
      const dist = Math.sqrt(distSq);
      const overlap = combinedRadius - dist;
      const dirX = dx / dist;
      const dirZ = dz / dist;
      ballPos.x += dirX * overlap;
      ballPos.z += dirZ * overlap;
      const pushStrengthBase = 25 * PLAYER_SCALE;
      const moveSpeed = move.length() / Math.max(dt, 1e-4);
      const impulseStrength = pushStrengthBase * (moveSpeed / (10 * PLAYER_SCALE));
      const impulse = new w(dirX, 0, dirZ).multiplyScalar(impulseStrength);
      const lift = lm.clamp(
        impulseStrength * 0.4,
        0,
        12 * PLAYER_SCALE
      );
      impulse.y += lift;
      this.ball.applyImpulse(impulse);
    }
  }
  // ======================================================
  // CAMERA
  // ======================================================
  _updateCamera(dt) {
    const playerPos = this.player.group.position;
    const targetY = playerPos.y + 1.6 * PLAYER_SCALE;
    const heightSmoothSpeed = 10;
    const alpha = 1 - Math.exp(-heightSmoothSpeed * dt);
    this.smoothedCameraHeight += (targetY - this.smoothedCameraHeight) * alpha;
    this.cameraTarget.set(playerPos.x, this.smoothedCameraHeight, playerPos.z);
    this.cameraEuler.set(
      this.cameraParams.pitch,
      this.cameraParams.yaw,
      0,
      "YXZ"
    );
    this.cameraForward.set(0, 0, -1).applyEuler(this.cameraEuler);
    const desired = this.cameraTarget.clone().addScaledVector(this.cameraForward, -this.cameraParams.distance);
    if (this.firstCameraUpdate) {
      this.camera.position.copy(desired);
      this.firstCameraUpdate = false;
    } else {
      this.camera.position.lerp(
        desired,
        1 - Math.exp(-this.cameraParams.followSpeed * dt)
      );
    }
    this.camera.lookAt(this.cameraTarget);
  }
  // ======================================================
  // COMBAT
  // ======================================================
  _triggerAttack(kind) {
    if (!this.player || !this.player.actions) return;
    const actionKey = kind === "Heavy" ? "Heavy" : "Attack";
    const action = this.player.actions[actionKey];
    if (!action) return;
    const clip = action.getClip ? action.getClip() : null;
    const duration = clip ? clip.duration : 0.5;
    const rate = kind === "Heavy" ? 0.9 : 1.1;
    const now = (this.clock && this.clock.elapsedTime) || (typeof performance !== "undefined" ? performance.now() / 1000 : Date.now() / 1000);
    this.controlsState.attackAnim = actionKey;
    this.controlsState.attackUntil = now + Math.max(0.2, duration / rate);
  }
  _triggerDodge() {
    const now = (this.clock && this.clock.elapsedTime) || (typeof performance !== "undefined" ? performance.now() / 1000 : Date.now() / 1000);
    // Already dodging? Ignore.
    if (now < this.controlsState.dodgeUntil) return;
    // Direction: movement input rotated by camera yaw; fallback to facing forward.
    const k = this.controlsState.key;
    const local = new w(k[1], 0, k[0]);
    if (local.lengthSq() < 1e-4) local.set(0, 0, -1); // dodge forward when stationary
    local.normalize();
    const az = this.cameraParams.yaw;
    local.applyAxisAngle(this.controlsState.up, az);
    this.controlsState.dodgeDir.copy(local);
    this.controlsState.dodgeUntil = now + this.controlsState.dodgeDuration;
  }
  // ======================================================
  // PUBLIC API
  // ======================================================
  update(dt, elapsed) {
    const cloudTime = elapsed / 4;
    playerCloudShadow.time.value = cloudTime;
    const key = this.controlsState.key;
    const active = key[0] !== 0 || key[1] !== 0;
    const running = key[2] === 1;
    const move = new w();
    const playerPos = this.player.group.position;
    const attacking = elapsed < this.controlsState.attackUntil;
    const dodging = elapsed < this.controlsState.dodgeUntil;
    if (dodging) {
      const dv = this.controlsState.dodgeVelocity * dt;
      move.copy(this.controlsState.dodgeDir).multiplyScalar(dv);
      const angle = Math.atan2(this.controlsState.dodgeDir.x, this.controlsState.dodgeDir.z);
      this.controlsState.rotateQuat.setFromAxisAngle(this.controlsState.up, angle);
      this.player.group.quaternion.rotateTowards(
        this.controlsState.rotateQuat,
        this.controlsState.rotateSpeed * dt
      );
    } else if (active) {
      let speed;
      if (attacking) {
        speed = this.controlsState.walkVelocity * 0.35;
      } else if (this.controlsState.sneak) {
        speed = this.controlsState.sneakVelocity;
      } else {
        speed = running ? this.controlsState.runVelocity : this.controlsState.walkVelocity;
      }
      this.controlsState.ease.set(key[1], 0, key[0]).normalize().multiplyScalar(speed * dt);
      const az = this.cameraParams.yaw;
      move.copy(this.controlsState.ease).applyAxisAngle(
        this.controlsState.up,
        az
      );
      const angle = Math.atan2(this.controlsState.ease.x, this.controlsState.ease.z) + az;
      this.controlsState.rotateQuat.setFromAxisAngle(
        this.controlsState.up,
        angle
      );
      this.player.group.quaternion.rotateTowards(
        this.controlsState.rotateQuat,
        this.controlsState.rotateSpeed * dt
      );
    }
    playerPos.x += move.x;
    playerPos.z += move.z;
    this._handlePlayerBallInteraction(move, dt);
    this.lastChunkUpdate += dt;
    if (this.lastChunkUpdate >= 0.1) {
      this._updateChunks(playerPos.x, playerPos.z);
      this.lastChunkUpdate = 0;
    }
    for (let i = 0; i < this.MAX_CHUNKS_PER_FRAME && this.chunkBuildQueue.length > 0; i++) {
      const { chunkX, chunkZ, isLowDetail } = this.chunkBuildQueue.shift();
      const keyStr = this._getChunkKey(chunkX, chunkZ);
      if (this.chunks.has(keyStr))
        continue;
      const chunk = this._createChunk(chunkX, chunkZ, isLowDetail);
      this.chunks.set(keyStr, chunk);
      this.scene.add(chunk.terrain);
    }
    const prevY = playerPos.y;
    this.velocityY += this.gravity * dt;
    let newY = prevY + this.velocityY * dt;
    const terrainY = this._getTerrainHeightAtWorld(playerPos.x, playerPos.z);
    playerGroundOcclusion.groundHeight.value = terrainY;
    if (newY <= terrainY) {
      newY = terrainY;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
    if (this.isGrounded && (this.keys["Space"] || this.keys["KeyJ"])) {
      this.velocityY = this.jumpSpeed;
      this.isGrounded = false;
    }
    playerPos.y = newY;
    this.ball.update(dt, (x, z2) => this._getTerrainHeightAtWorld(x, z2), this.gravity);
    let nextAnim;
    if (dodging) {
      nextAnim = "Dodge";
    } else if (attacking && this.controlsState.attackAnim) {
      nextAnim = this.controlsState.attackAnim;
    } else if (!this.isGrounded) {
      nextAnim = this.velocityY > 0 ? "Jump" : "Fall";
    } else if (active) {
      if (this.controlsState.sneak) nextAnim = "Sneak";
      else nextAnim = running ? "Run" : "Walk";
    } else {
      nextAnim = "Idle";
    }
    if (this.controlsState.current !== nextAnim) {
      this.controlsState.current = nextAnim;
      let speedScale = 1;
      if (nextAnim === "Run") speedScale = 1.4;
      else if (nextAnim === "Sneak") speedScale = 0.8;
      else if (nextAnim === "Heavy") speedScale = 0.9;
      else if (nextAnim === "Dodge") speedScale = 1.3;
      this.player.setAnimationState(
        nextAnim,
        this.controlsState.fadeDuration,
        speedScale
      );
    }
    this._updateCamera(dt);
    this.player.update(dt);
    this.chunks.forEach((chunk) => {
      if (chunk.terrain.tick)
        chunk.terrain.tick(elapsed);
    });
    this._updateGrassTrail(dt);
  }
  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
};

// vfs:vfs:/src/main.js
var renderer = new Pr2({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = wp;
renderer.outputColorSpace = Nt;
renderer.toneMapping = nf;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);
renderer.domElement.style.outline = "none";
var world = new World(renderer);
var clock = new Zo();
world.clock = clock;
// Expose live debug handles only — THREE + loaders are owned exclusively by
// ./wire-race-model.js (which publishes them under window.Grudge). Keeping a
// second copy here (GrudgeTHREE / GrudgeGLTFLoader) historically caused
// two three-r182 instances to race for the same window surface.
if (typeof window !== "undefined") {
  window.GrudgeWorld = world;
  window.GrudgeRenderer = renderer;
  window.GrudgeClock = clock;
  // Let the wire module upgrade its KTX2 detection now that renderer exists.
  if (window.Grudge && window.Grudge.client && typeof window.Grudge.client.attachRenderer === "function") {
    window.Grudge.client.attachRenderer(renderer);
  }
}
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.elapsedTime;
  world.update(dt, elapsed);
  renderer.render(world.scene, world.camera);
}
animate();
window.addEventListener("resize", () => {
  const w2 = window.innerWidth;
  const h36 = window.innerHeight;
  renderer.setSize(w2, h36);
  world.resize(w2, h36);
});
/*! Bundled license information:

three/build/three.core.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
