#version 300 es

in vec4 aVertexPosition;

out highp vec2 vTextureCoord;

void main() {
    gl_Position = aVertexPosition;
    vTextureCoord = aVertexPosition.xy;
}