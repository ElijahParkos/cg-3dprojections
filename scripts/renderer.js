import * as CG from './transforms.js';
import { Matrix, Vector } from "./matrix.js";

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // scene:               object (...see description on Canvas)
    constructor(canvas, scene) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.scene = this.processScene(scene);
        this.enable_animation = false;  // <-- disabled for easier debugging; enable for animation
        this.start_time = null;
        this.prev_time = null;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
    }

    //
    rotateLeft() {

    }
    
    //
    rotateRight() {

    }
    
    //
    moveLeft() {

    }
    
    //
    moveRight() {

    }
    
    //
    moveBackward() {

    }
    
    //
    moveForward() {

    }

    //
    draw() {
        const models = this.scene.models;
        const view = this.scene.view;
        const z_min = -view.clip[4] / view.clip[5];
        const mper = CG.mat4x4MPer();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const translateViewport = CG.mat4x4Viewport(this.canvas.width, this.canvas.height);
        for(const model of models) {
            let edges = [];
            model.cannonical_vertices = [];
            const transform = CG.mat4x4Perspective(view.prp, view.srp, view.vup, view.clip);
            if (model.type === 'generic') {
                for(const vertex of model.vertices) {
                    model.cannonical_vertices.push(Matrix.multiply([transform, vertex]));
                }
                edges = model.edges;
            }
            if  (model.type === 'cube') {
                const half_length = model.depth / 2;
                const half_width = model.width / 2;
                const half_height = model.height / 2;
                const vertices = [
                    CG.Vector4(model.center.x - half_length, model.center.y - half_width, model.center.z - half_height, 1),
                    CG.Vector4(model.center.x + half_length, model.center.y - half_width, model.center.z - half_height, 1),
                    CG.Vector4(model.center.x - half_length, model.center.y + half_width, model.center.z - half_height, 1),
                    CG.Vector4(model.center.x + half_length, model.center.y + half_width, model.center.z - half_height, 1),
                    CG.Vector4(model.center.x - half_length, model.center.y - half_width, model.center.z + half_height, 1),
                    CG.Vector4(model.center.x + half_length, model.center.y - half_width, model.center.z + half_height, 1),
                    CG.Vector4(model.center.x - half_length, model.center.y + half_width, model.center.z + half_height, 1),
                    CG.Vector4(model.center.x + half_length, model.center.y + half_width, model.center.z + half_height, 1)
                ]; 
                for(const vertex of vertices) {
                    model.cannonical_vertices.push(Matrix.multiply([transform, vertex]));
                }
                edges = [
                    [0, 2, 3, 1, 0], 
                    [4, 6, 7, 5, 4], 
                    [0, 4],
                    [1, 5],
                    [2, 6],
                    [3, 7]
                ];
            }
            if (model.type === 'cone') {
                let angel_degrees = 360 / model.sides;
                let angel_radians = angel_degrees * (Math.PI / 180);
                for (let i = 0; i < model.sides; i++) {

                    // whichever way you want the cone pointed set that value to the center and then the other two values to the radius times cos/sin of the angle
                    let x = model.center.x + model.radius * Math.cos(i * angel_radians); 
                    let y = model.center.y;
                    let z = model.center.z + model.radius * Math.sin(i * angel_radians);
                    let vertex = CG.Vector4(x, y, z, 1);
                    model.cannonical_vertices.push(Matrix.multiply([transform, vertex]));
                }
                let apex = CG.Vector4(model.center.x, model.center.y + model.height, model.center.z, 1); // add height to whichever is the apex
                model.cannonical_vertices.push(Matrix.multiply([transform, apex]));
                for (let i = 0; i < model.sides; i++) {
                    edges.push([i, (i + 1) % model.sides]); // bottom circle
                    edges.push([i, model.sides]); // lines from base to apex (apex lives at index model.sides)
                }
            }
            if (model.type === 'cylinder') {
                let angel_degrees = 360 / model.sides;
                let angel_radians = angel_degrees * (Math.PI / 180);
                for (let i = 0; i < model.sides; i++) {
                    let x = model.center.x + model.radius * Math.cos(i * angel_radians);
                    let y = model.center.y - model.height / 2;
                    let z = model.center.z + model.radius * Math.sin(i * angel_radians);
                    let vertex = CG.Vector4(x, y, z, 1);
                    model.cannonical_vertices.push(Matrix.multiply([transform, vertex])); // bottom circle
                    let vertex2 = CG.Vector4(x, y + model.height, z, 1);
                    model.cannonical_vertices.push(Matrix.multiply([transform, vertex2])); //top circle
                }
                console.log(model.edges);
                for (let i = 0; i < model.sides; i++) {
                    edges.push([i * 2, (i * 2 + 2) % (model.sides * 2)]); // bottom circle
                    edges.push([i * 2 + 1, (i * 2 + 3) % (model.sides * 2)]); // top circle
                    edges.push([i * 2, i * 2 + 1]); // vertical lines
                }
            }    
            // TODO : Implement Sphere

            for(const edge of edges) {
                for(let i = 0; i<edge.length; i++) {
                    const pt0 = model.cannonical_vertices[edge[i]];
                    const pt1 = model.cannonical_vertices[edge[(i+1)%edge.length]];
                    // clip in 3D
                    const line = this.clipLinePerspective({pt0: pt0, pt1: pt1}, z_min);
                    if (line === null) continue; //outside of clipping, don't draw line
                    // project to 2D

                    // translate/scale to viewport
                    const a = Matrix.multiply([translateViewport, mper,
                        CG.Vector4(line.pt0.x, line.pt0.y, line.pt0.z, 1)]);
                    const b = Matrix.multiply([translateViewport, mper,
                        CG.Vector4(line.pt1.x, line.pt1.y, line.pt1.z, 1)]);
                    
                    //draw line
                    this.drawLine(a.x / a.w, a.y / a.w, b.x / b.w, b.y / b.w);
                }
            }

             //console.log(model.cannonical_vertices);
        }

       
        // TODO: implement drawing here!
        // For each model
        //   * For each vertex
        //     * transform endpoints to canonical view volume
        //   * For each line segment in each edge
        //     * clip in 3D
        //     * project to 2D
        //     * translate/scale to viewport (i.e. window)
        //     * draw line
    }

    // Get outcode for a vertex
    // vertex:       Vector4 (transformed vertex in homogeneous coordinates)
    // z_min:        float (near clipping plane in canonical view volume)
    outcodePerspective(vertex, z_min) {
        let outcode = 0;
        if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
            outcode += LEFT;
        }
        else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
            outcode += RIGHT;
        }
        if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
            outcode += BOTTOM;
        }
        else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
            outcode += TOP;
        }
        if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
            outcode += FAR;
        }
        else if (vertex.z > (z_min + FLOAT_EPSILON)) {
            outcode += NEAR;
        }
        return outcode;
    }

    // Clip line - should either return a new line (with two endpoints inside view volume)
    //             or null (if line is completely outside view volume)
    // line:         object {pt0: Vector4, pt1: Vector4}
    // z_min:        float (near clipping plane in canonical view volume)
    clipLinePerspective(line, z_min) {
        let p0 = CG.Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
        let p1 = CG.Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
        let out0 = this.outcodePerspective(p0, z_min);
        let out1 = this.outcodePerspective(p1, z_min);
        let dx = p1.x - p0.x;
        let dy = p1.y - p0.y;
        let dz = p1.z - p0.z;
        while (true) {
            if ((out0 | out1) == 0){
                return {pt0: p0, pt1: p1} //trivial accept
            }
            if ((out0 & out1) != 0) {
                return null; //trivial reject
            }

            let outcodeOut = out0 != 0 ? out0 : out1;


            if  ((outcodeOut & LEFT)   != 0) {
                if (out0 != 0) {
                    let t = (p0.z - p0.x) / (dx - dz);
                    out0 = this.updatePoint(p0, t, dx, dy, dz, z_min);
            } else{
                    let t = (p1.z - p1.x) / (dx - dz);
                    out1 = this.updatePoint(p1, t, dx, dy, dz, z_min);
            } }
            else if ((outcodeOut & RIGHT)  != 0) { 
                if (out0 != 0) {
                    let t = (p0.z + p0.x) / (-dx - dz);
                    out0 = this.updatePoint(p0, t, dx, dy, dz, z_min);
            } else{
                    let t = (p1.z + p1.x) / (-dx - dz);
                    out1 = this.updatePoint(p1, t, dx, dy, dz, z_min);
            } }
            else if ((outcodeOut & BOTTOM) != 0) { 
                if (out0 != 0) {
                    let t = (p0.z - p0.y) / (dy - dz);
                    out0 = this.updatePoint(p0, t, dx, dy, dz, z_min);
            } else {
                    let t = (p1.z - p1.y) / (dy - dz);
                    out1 = this.updatePoint(p1, t, dx, dy, dz, z_min);
            } }
            else if ((outcodeOut & TOP)    != 0) { 
                if (out0 != 0) {
                    let t = (p0.z + p0.y) / (-dy - dz);
                    out0 = this.updatePoint(p0, t, dx, dy, dz, z_min);
            } else {
                    let t = (p1.z + p1.y) / (-dy - dz);
                    out1 = this.updatePoint(p1, t, dx, dy, dz, z_min);
            } }
            else if ((outcodeOut & FAR)    != 0) { 
                if (out0 != 0) {
                    let t = (-p0.z - 1) / dz;
                    out0 = this.updatePoint(p0, t, dx, dy, dz, z_min);
            } else {
                    let t = (-p1.z - 1) / dz;
                    out1 = this.updatePoint(p1, t, dx, dy, dz, z_min);
            } }
            else if ((outcodeOut & NEAR)   != 0) { 
                if (out0 != 0) {
                    let t = (p0.z - z_min) / -dz;
                    out0 = this.updatePoint(p0, t, dx, dy, dz, z_min);
            } else {
                    let t = (p1.z - z_min) / -dz;
                    out1 = this.updatePoint(p1, t, dx, dy, dz, z_min);
            } }

        }
    }
    // Update a point along a line segment and return its new outcode
    updatePoint(p0, t, dx, dy, dz, z_min){
        p0.x += t * dx;
        p0.y += t * dy;
        p0.z += t * dz;
        return this.outcodePerspective(p0, z_min);
    }
    //
    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.draw();

        // Invoke call for next frame in animation
        if (this.enable_animation) {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateScene(scene) {
        this.scene = this.processScene(scene);
        if (!this.enable_animation) {
            this.draw();
        }
    }

    //
    processScene(scene) {
        let processed = {
            view: {
                prp: CG.Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]),
                srp: CG.Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]),
                vup: CG.Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]),
                clip: [...scene.view.clip]
            },
            models: []
        };

        for (let i = 0; i < scene.models.length; i++) {
            let model = { type: scene.models[i].type };
            if (model.type === 'generic') {
                model.vertices = [];
                model.edges = JSON.parse(JSON.stringify(scene.models[i].edges));
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    model.vertices.push(CG.Vector4(scene.models[i].vertices[j][0],
                                                   scene.models[i].vertices[j][1],
                                                   scene.models[i].vertices[j][2],
                                                   1));
                    if (scene.models[i].hasOwnProperty('animation')) {
                        model.animation = JSON.parse(JSON.stringify(scene.models[i].animation));
                    }
                }
            }
            else {
                model.center = CG.Vector4(scene.models[i].center[0],
                                         scene.models[i].center[1],
                                         scene.models[i].center[2],
                                         1);
                for (let key in scene.models[i]) {
                    if (scene.models[i].hasOwnProperty(key) && key !== 'type' && key != 'center') {
                        model[key] = JSON.parse(JSON.stringify(scene.models[i][key]));
                    }
                }
            }

            model.matrix = new Matrix(4, 4);
            processed.models.push(model);
        }

        return processed;
    }
    
    // x0:           float (x coordinate of p0)
    // y0:           float (y coordinate of p0)
    // x1:           float (x coordinate of p1)
    // y1:           float (y coordinate of p1)
    drawLine(x0, y0, x1, y1) {
        this.ctx.strokeStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x0 - 2, y0 - 2, 4, 4);
        this.ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    }
};

export { Renderer };
