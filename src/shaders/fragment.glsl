#version 300 es
precision highp float;

const float PI = 3.14159265358;

in highp vec2 vTextureCoord;

out highp vec4 fragColor;

uniform float uX1Min;
uniform float uX1Max;
uniform float uX2Min;
uniform float uX2Max;

uniform vec2 uCoefficients[4];

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

vec2 complexMultiply(vec2 u, vec2 v) {
    return vec2(u.x * v.x - u.y * v.y, u.x * v.y + u.y * v.x);
}

void main() {
    vec2 x = vec2(
        ((uX1Max - uX1Min) * vTextureCoord.x + uX1Min + uX1Max) / 2.0, 
        ((uX2Max - uX2Min) * vTextureCoord.y + uX2Min + uX2Max) / 2.0
    );

    vec2 xi = vec2(1.0);
    vec2 y = vec2(0.0);
    for (int i = 0; i < uCoefficients.length(); i++)
    {
        y += complexMultiply(uCoefficients[i], xi);
        xi = complexMultiply(xi, x);
    }

    float L = exp(-10.0 * length(y)) * 0.95 + 0.05;
    float H = (atan(y.y, y.x) * 180.0 / PI + 180.0) / 360.0;
    float S = 1.0;

    fragColor = vec4(hsl2rgb(vec3(H, S, L)), 1.0);
}