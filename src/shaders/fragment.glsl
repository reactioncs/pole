#version 300 es
precision highp float;

const float PI = 3.14159265358;

in highp vec2 vTextureCoord;

out highp vec4 fragColor;

uniform float uX1Min;
uniform float uX1Max;
uniform float uX2Min;
uniform float uX2Max;

uniform float uA1;
uniform float uA2;
uniform float uB1;
uniform float uB2;
uniform float uC1;
uniform float uC2;

// Helper function for hue2rgb
float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0/2.0) return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
}

// HSL to RGB conversion function
vec3 hsl2rgb(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;

    vec3 rgb;

    if (s == 0.0) {
        rgb = vec3(l); // Achromatic
    } else {
        float q = (l < 0.5) ? l * (1.0 + s) : l + s - l * s;
        float p = 2.0 * l - q;
        rgb.r = hue2rgb(p, q, h + 1.0/3.0);
        rgb.g = hue2rgb(p, q, h);
        rgb.b = hue2rgb(p, q, h - 1.0/3.0);
    }
    return rgb;
}

void main() {
    float x1 = (uX1Max - uX1Min) * vTextureCoord.x + uX1Min + uX1Max;
    float x2 = (uX2Max - uX2Min) * vTextureCoord.y + uX2Min + uX2Max;

    // ax^2 + bx + c
    float Re = uA1 * x1 * x1 - uA1 * x2 * x2 - 2.0 * uA2 * x1 * x2 + uB1 * x1 - uB2 * x2 + uC1;
    float Im = uA2 * x1 * x1 - uA2 * x2 * x2 + 2.0 * uA1 * x1 * x2 + uB1 * x2 + uB2 * x1 + uC2;

    float L = 1.0 / (length(vec2(Re, Im)) + 1.0);
    float H = (atan(Im, Re) * 180.0 / PI + 180.0) / 360.0;
    float S = 1.0;

    fragColor = vec4(hsl2rgb(vec3(H, S, L)), 1.0);
}