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
        this.enable_animation = true;  // <-- disabled for easier debugging; enable for animation
        this.start_time = null;
        this.prev_time = null;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
    }

    //
    rotateLeft() {
        let theta = 5;

        let view = this.scene.view;
        let n = view.prp.subtract(view.srp);
        n.normalize();
        let u = view.vup.cross(n);
        u.normalize();
        let v = n.cross(u);

        let temp_srp = CG.Vector4(view.srp.x, view.srp.y, view.srp.z, 1);

        let translateOrigin = new Matrix(4,4);
        CG.mat4x4Translate(translateOrigin, -view.prp.x, -view.prp.y, -view.prp.z);

        let rotateOrigin = new Matrix(4,4);
        rotateOrigin.values = [
        [u.x, u.y, u.z, 0],
        [v.x, v.y, v.z, 0],
        [n.x, n.y, n.z, 0],
        [0, 0, 0, 1]];
        
        let rotation = new Matrix(4,4);
        CG.mat4x4RotateY(rotation, theta);

        let rotateBack = rotateOrigin.transpose();

        let translateBack = new Matrix(4,4);
        CG.mat4x4Translate(translateBack, view.prp.x, view.prp.y, view.prp.z);

        temp_srp = Matrix.multiply([translateBack, rotateBack, rotation, rotateOrigin, translateOrigin, temp_srp]);
        
        view.srp = CG.Vector3(temp_srp.x, temp_srp.y, temp_srp.z);
        if(!this.enable_animation) this.draw();
    }
    
    //
    rotateRight() {
        let theta = -5;

        let view = this.scene.view;
        let n = view.prp.subtract(view.srp);
        n.normalize();
        let u = view.vup.cross(n);
        u.normalize();
        let v = n.cross(u);

        let temp_srp = CG.Vector4(view.srp.x, view.srp.y, view.srp.z, 1);

        let translateOrigin = new Matrix(4,4);
        CG.mat4x4Translate(translateOrigin, -view.prp.x, -view.prp.y, -view.prp.z);

        let rotateOrigin = new Matrix(4,4);
        rotateOrigin.values = [
        [u.x, u.y, u.z, 0],
        [v.x, v.y, v.z, 0],
        [n.x, n.y, n.z, 0],
        [0, 0, 0, 1]];
        
        let rotation = new Matrix(4,4);
        CG.mat4x4RotateY(rotation, theta);

        let rotateBack = rotateOrigin.transpose();

        let translateBack = new Matrix(4,4);
        CG.mat4x4Translate(translateBack, view.prp.x, view.prp.y, view.prp.z);

        temp_srp = Matrix.multiply([translateBack, rotateBack, rotation, rotateOrigin, translateOrigin, temp_srp]);
        
        view.srp = CG.Vector3(temp_srp.x, temp_srp.y, temp_srp.z);
        if(!this.enable_animation) this.draw();
    }
    
    //
    moveLeft() {
        let view = this.scene.view;
        let n = view.prp.subtract(view.srp);
        n.normalize();
        let u = view.vup.cross(n);
        u.normalize();
        view.prp = view.prp.subtract(u);
        view.srp = view.srp.subtract(u);
        if(!this.enable_animation) this.draw();
    }
    
    //
    moveRight() {
        let view = this.scene.view;
        let n = view.prp.subtract(view.srp);
        n.normalize();
        let u = view.vup.cross(n);
        u.normalize();
        view.prp = view.prp.add(u);
        view.srp = view.srp.add(u);
        if(!this.enable_animation) this.draw();
    }
    
    //
    moveBackward() {
        let view = this.scene.view;
        let n = view.prp.subtract(view.srp);
        n.normalize();
        view.prp = view.prp.add(n);
        view.srp = view.srp.add(n);
        if(!this.enable_animation) this.draw();
    }
    
    //
    moveForward() {
        let view = this.scene.view;
        let n = view.prp.subtract(view.srp);
        n.normalize();
        view.prp = view.prp.subtract(n);
        view.srp = view.srp.subtract(n);
        if(!this.enable_animation) this.draw();
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
                for (let i = 0; i < model.sides; i++) {
                    edges.push([i * 2, (i * 2 + 2) % (model.sides * 2)]); // bottom circle
                    edges.push([i * 2 + 1, (i * 2 + 3) % (model.sides * 2)]); // top circle
                    edges.push([i * 2, i * 2 + 1]); // vertical lines
                }
            }    
            // TODO : Implement Sphere
            if (model.type === 'sphere') {
                let slices = model.slices;
                let stacks = model.stacks;
                for (let i = 0; i <= stacks; i++) {
                    let phi = (i / stacks) * Math.PI;
                    for (let j = 0; j <= slices; j++) {
                        let theta = (j / slices) * 2 * Math.PI;
                        let x = model.center.x + model.radius * Math.sin(phi) * Math.cos(theta);
                        let y = model.center.y + model.radius * Math.cos(phi);
                        let z = model.center.z + model.radius * Math.sin(phi) * Math.sin(theta);
                        let vertex = CG.Vector4(x, y, z, 1);
                        model.cannonical_vertices.push(Matrix.multiply([transform, vertex]));
                    }
                }
                for (let i = 0; i < stacks; i++) {
                    for (let j = 0; j < slices; j++) {
                        let first = i * (slices + 1) + j;
                        let second = first + slices + 1;
                        edges.push([first, second]);
                        edges.push([first, first + 1]);
                        edges.push([second, second + 1]);
                    }
                }
            }
            for(const edge of edges) {
                for(let i = 0; i<edge.length; i++) {
                    const pt0 = model.cannonical_vertices[edge[i]];
                    const pt1 = model.cannonical_vertices[edge[(i+1)%edge.length]];
                    // clip in 3D
                    const line = this.clipLinePerspective({pt0: pt0, pt1: pt1}, z_min);
                    if (line === null) continue; //outside of clipping, don't draw line

                    // project to 2D and translate/scale to viewport
                    const a = Matrix.multiply([translateViewport, mper,
                        CG.Vector4(line.pt0.x, line.pt0.y, line.pt0.z, 1)]);
                    const b = Matrix.multiply([translateViewport, mper,
                        CG.Vector4(line.pt1.x, line.pt1.y, line.pt1.z, 1)]);
                    
                    //draw line
                    this.drawLine(a.x / a.w, a.y / a.w, b.x / b.w, b.y / b.w);
                }
            }

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
        let out0 = {value: this.outcodePerspective(p0, z_min)};
        let out1 = {value: this.outcodePerspective(p1, z_min)};
        let dx = p1.x - p0.x;
        let dy = p1.y - p0.y;
        let dz = p1.z - p0.z;
        while (true) {
            if ((out0.value | out1.value) === 0){
                return {pt0: p0, pt1: p1} //trivial accept
            }
            if (out0.value & out1.value) {
                return null; //trivial reject
            }

            let outcodeOut = out0;
            let pointOut = p0;
            if(outcodeOut.value === 0) {
                outcodeOut = out1;
                pointOut = p1;
            }

            let t = null;
            if(outcodeOut.value & LEFT) t = (pointOut.z - pointOut.x) / (dx - dz); 
            else if(outcodeOut.value & RIGHT) t = (pointOut.z + pointOut.x) / (-dx - dz);
            else if(outcodeOut.value & BOTTOM) t = (pointOut.z - pointOut.y) / (dy - dz);
            else if(outcodeOut.value & TOP) t = (pointOut.z + pointOut.y) / (-dy - dz);
            else if(outcodeOut.value & FAR) t = (-pointOut.z - 1) / dz;
            else if(outcodeOut.value & NEAR) t = (pointOut.z - z_min) / -dz;
            
            if(t === null) continue;
            outcodeOut.value = this.updatePoint(pointOut, t, dx, dy, dz, z_min);
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
