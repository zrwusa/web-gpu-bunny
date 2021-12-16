import React, {useEffect, useState} from 'react';
import {CheckWebGPU} from '../../utils/check-web-gpu';
import {Shaders} from '../../common/shaders';


const CreateTriangle = async (color = '(1.0,1.0,1.0,1.0)') => {
    const checkgpu = CheckWebGPU();
    if (checkgpu.includes('Your current browser does not support WebGPU!')) {
        console.log(checkgpu);
        throw('Your current browser does not support WebGPU!');
    }

    const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement;
    const adapter = await navigator.gpu?.requestAdapter() as GPUAdapter;
    const device = await adapter?.requestDevice() as GPUDevice;
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;
    const format = 'bgra8unorm';
    /*const swapChain = context.configureSwapChain({
        device: device,
        format: format,
    });*/
    context.configure({
        device: device,
        format: format,
    });

    const shader = Shaders(color);
    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: shader.vertex
            }),
            entryPoint: 'main'
        },
        fragment: {
            module: device.createShaderModule({
                code: shader.fragment
            }),
            entryPoint: 'main',
            targets: [{
                format: format as GPUTextureFormat
            }]
        },
        primitive: {
            topology: 'triangle-list',
        }
    });

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: textureView,
            loadValue: {r: 0.5, g: 0.5, b: 0.8, a: 1.0}, //background color
            storeOp: 'store' as  GPUStoreOp
        }]
    });
    renderPass.setPipeline(pipeline);
    renderPass.draw(3, 1, 0, 0);
    renderPass.endPass();

    device.queue.submit([commandEncoder.finish()]);
};


type HomeProps = { title?: string, }

const Home:React.FunctionComponent<HomeProps> = (props) => {
    const [name] = useState('Page Home111');
    const [color, setColor] = useState('(1.0,1.0,1.0,1.0)');
    useEffect(() => {
        CreateTriangle().then();
    }, []);
    return (<div>
        <h1 className={'demo-home__title--des'}>{props.title}</h1>
        <span>{name}</span>
        <div>
            <h1>Create Triangle</h1>
            <label>Color:</label>
            <input type="text" onChange={(e) => {
                setColor(e.target.value);
            }} value={color}/>
            <button onClick={() => {
                CreateTriangle(color).then();
            }}>Change Color
            </button>
            <canvas id="canvas-webgpu" width="640" height="480"/>
        </div>
    </div>);
};

// class Home extends Component<HomeProps, HomeStates> {
//     constructor(props: HomeProps) {
//         super(props);
//         this.state = {
//             name: 'Page Home',
//             color: '(0.3,0.2,0.1,0.3)',
//         };
//     }
//
//     componentDidMount() {
//         CreateTriangle().then();
//     }
//
//     render(): React.ReactNode {
//         return (<div>
//             <h1 className={'demo-home__title--des'}>{this.props.title}</h1>
//             <span>{this.state.name}</span>
//             <div>
//                 <h1>Create Triangle</h1>
//                 <label>Color:</label>
//                 <button onClick={() => {
//                     CreateTriangle(this.state.color).then();
//                 }}>Change Color</button>
//                 <canvas id="canvas-webgpu" width="640" height="480"/>
//             </div>
//         </div>);
//     }
// }

export default Home;
