import { createApp, reactive, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { Renderer } from './renderer.js';

let app = createApp({
    setup() {
        return {
            view: {
                id: 'view',
                width: 800,
                height: 600
            },
            renderer: ref({})
        }
    },
    
    methods: {
        loadNewScene() {
            let scene_file = document.getElementById('scene_file');

            let reader = new FileReader();
            reader.onload = (event) => {
                let scene = JSON.parse(event.target.result);
                this.renderer.updateScene(scene);
            };
            reader.readAsText(scene_file.files[0], 'UTF-8');
        },

        onKeyDown(event) {
            switch (event.keyCode) {
                case 37: // LEFT Arrow
                    this.renderer.rotateLeft();
                    break;
                case 39: // RIGHT Arrow
                    this.renderer.rotateRight();
                    break;
                case 65: // A key
                    this.renderer.moveLeft();
                    break;
                case 68: // D key
                    this.renderer.moveRight();
                    break;
                case 83: // S key
                    this.renderer.moveBackward();
                    break;
                case 87: // W key
                    this.renderer.moveForward();
                    break;
            }
        }
    }
}).mount('#content');

let S = 20; 

let initial_scene = {
    view: {
        prp: [34, 46, 23],
        srp: [1, 0, 4],
        vup: [0, 0, 1],
        clip: [-3.6, 3.6, -2.7, 2.7, 10, 150]
    },
    models: [
        {
            type: "cube",
            center: [0, 0, 4.5],
            width: 30,
            height: 11,
            depth: 4
        },
        {
            type: "cube",
            center: [15.75, 0, 3.8],
            width: 1.5,
            height: 11.5,
            depth: 1.6
        },
        {
            type: "cube",
            center: [-15.75, 0, 3.8],
            width: 1.5,
            height: 11.5,
            depth: 1.6
        },
        {
            type: "generic",
            vertices: [
                [6, -4.8, 6.5],
                [2, -4.8, 11],
                [-7, -4.8, 11],
                [-10, -4.8, 6.5],
                [6, 4.8, 6.5],
                [2, 4.8, 11],
                [-7, 4.8, 11],
                [-10, 4.8, 6.5],
                [-2.5, -4.8, 6.5],
                [-2.5, -4.8, 11],
                [-2.5, 4.8, 6.5],
                [-2.5, 4.8, 11]
            ],
            edges: [
                [0, 1, 2, 3, 0],
                [4, 5, 6, 7, 4],
                [0, 4],
                [1, 5],
                [2, 6],
                [3, 7],
                [8, 9],
                [10, 11]
            ]
        },
        {
            type: "cube",
            center: [15.2, 3.6, 5.4],
            width: 0.6,
            height: 2,
            depth: 1
        },
        {
            type: "cube",
            center: [15.2, -3.6, 5.4],
            width: 0.6,
            height: 2,
            depth: 1
        },
        {
            type: "cube",
            center: [-15.2, 3.6, 5.4],
            width: 0.6,
            height: 2,
            depth: 1
        },
        {
            type: "cube",
            center: [-15.2, -3.6, 5.4],
            width: 0.6,
            height: 2,
            depth: 1
        },
        {
            type: "cylinder",
            center: [9, 0, 3],
            radius: 0.4,
            height: 8,
            sides: 4,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "cylinder",
            center: [-9, 0, 3],
            radius: 0.4,
            height: 8,
            sides: 4,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "cylinder",
            center: [9, 5, 3],
            radius: 3,
            height: 2,
            sides: 12,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "sphere",
            center: [9, 5, 3],
            radius: 0.9,
            slices: 6,
            stacks: 3,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "cone",
            center: [9, 6, 3],
            radius: 3,
            height: 1,
            sides: 12,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "cylinder",
            center: [9, -5, 3],
            radius: 3,
            height: 2,
            sides: 12,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "sphere",
            center: [9, -5, 3],
            radius: 0.9,
            slices: 6,
            stacks: 3,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "cone",
            center: [9, -6, 3],
            radius: 3,
            height: 1,
            sides: 12,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "cylinder",
            center: [-9, 5, 3],
            radius: 3,
            height: 2,
            sides: 12,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "sphere",
            center: [-9, 5, 3],
            radius: 0.9,
            slices: 6,
            stacks: 3,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "cone",
            center: [-9, 6, 3],
            radius: 3,
            height: 1,
            sides: 12,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "cylinder",
            center: [-9, -5, 3],
            radius: 3,
            height: 2,
            sides: 12,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "sphere",
            center: [-9, -5, 3],
            radius: 0.9,
            slices: 6,
            stacks: 3,
            animation: {
                axis: "y",
                rps: 1
            }
        },
        {
            type: "cone",
            center: [-9, -6, 3],
            radius: 3,
            height: 1,
            sides: 12,
            animation: {
                axis: "y",
                rps: 1
            }
        }
    ]
};

document.addEventListener('keydown', app.onKeyDown, false);
    
app.renderer = new Renderer(app.view, initial_scene);
window.requestAnimationFrame((timestamp) => {
    app.renderer.animate(timestamp);
});
