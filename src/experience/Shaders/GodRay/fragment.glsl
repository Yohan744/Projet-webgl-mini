uniform vec3 uColor;
uniform float uAlphaBase;
uniform float uAlphaRays;
uniform float uSeed;
uniform float uTime;

varying vec2 vUv;

void main() {
    vec3 glow = uColor;
    float blur = (1.0 - vUv.y) * 3.0 * vUv.x * 3.0 * (1.0 - vUv.x) * 1.5;
    blur = clamp(blur, 0.0, 1.0);

    float t = sin(uTime + uSeed) * 0.5 + 0.5;

    float ray1 = mod(vUv.x * 5.0 + uSeed, 1.0);
    ray1 = smoothstep(0.5, 0.7, ray1);

    float ray2 = mod(vUv.x * 10.0 + uSeed, 1.0);
    ray2 = smoothstep(0.3, 0.5, ray2);

    float ray3 = mod(vUv.x * 15.0 + uSeed, 1.0);
    ray3 = smoothstep(0.1, 0.3, ray3);

    float rays = ray1 + ray2 + ray3;

    float a = uAlphaBase + rays * uAlphaRays * blur;

    gl_FragColor = vec4(glow, a * pow(vUv.y, 2.0));
}
