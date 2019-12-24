import PointMesh from '../PointMesh';

export type Segment = [string, number];

class DataSocket {
  private websocket: WebSocket;
  private frameIndex: number = 0;
  private segment: Segment;
  private onFramePointCloudReceived: (index: number, mesh: THREE.Mesh) => void; 
  private onSegmentChange: (segment: Segment) => void;
  private onSegmentsReceived: (segments: [string, number][], self: DataSocket) => void;
  private segments: Segment[];

  constructor(
    onFramePointCloudReceived: (index: number, mesh: THREE.Mesh) => void,
    onSegmentChange: (segment: Segment) => void, 
    onSegmentsReceived: (segments: Segment[], self: DataSocket) => void,
  ) {
    this.onFramePointCloudReceived = onFramePointCloudReceived;
    this.onSegmentChange = onSegmentChange;
    this.onSegmentsReceived = onSegmentsReceived;
  }

  public start() {
    this.websocket = new WebSocket('ws://localhost:9000');
    this.websocket.binaryType = 'arraybuffer';

    this.websocket.onopen = this.onOpen;
    this.websocket.onclose = this.onClose;
    this.websocket.onerror = this.onError;

    const this_ = this;
    this.websocket.addEventListener('message', function (event: MessageEvent) { this_.onMessage(this, event); });
  }

  public changeSegment(segment: Segment) {
    this.onSegmentChange(segment);
    this.segment = segment;
    this.frameIndex = 0;
    this.websocket.send(`${segment[0]}_${this.frameIndex}`);
  }

  private onOpen() {
    console.log('Websocket open');
  }

  private onError() {
    console.log('Websocket error');
  }

  private onClose() {
    console.log('Websocket closed');
  }

  private handleSegmentsMessage(websocket: WebSocket, event: MessageEvent) {
    this.segments = event.data.split(',').map((s: string) => { 
      const [id, numFrames] = s.split('_');
      return [id, Number(numFrames)];
    });

    this.onSegmentsReceived(this.segments, this);
  }

  private handlePointCloudMessage(websocket: WebSocket, event: MessageEvent) {
    this.frameIndex++;
      
    if (this.frameIndex < this.segment[1]) {
      websocket.send(`${this.segment[0]}_${this.frameIndex}`);
    }

    const data = new Float32Array(event.data);

    const offsets = [];
    const intensities = [];
    const lasers = [];
    const labels = [];
    const predictedTypes = [];

    data.forEach((x, index) => {
      if ([0, 1, 2].includes(index % 6)) offsets.push(x);
      else if (index % 6 === 3) intensities.push(x);
      else if (index % 6 === 4) lasers.push(x);
      else if (index % 6 === 5) labels.push(x);
      if (index % 6 === 0) predictedTypes.push(-1);
    });

    console.log(lasers);

    const mesh = (new PointMesh(
      intensities.length,
      offsets,
      intensities,
      lasers,
      labels,
      predictedTypes,
    )).getMesh();

    mesh.scale.x = 0.2;
    mesh.scale.y = 0.2;
    mesh.scale.z = 0.2;

    this.onFramePointCloudReceived(this.frameIndex - 1, mesh);
  }
  
  private onMessage(websocket: WebSocket, event: MessageEvent) {
    if (typeof(event.data) === 'string') {
      // Received comma separated list of supported segment ids
      this.handleSegmentsMessage(websocket, event);
    } else {
      // Received binary point cloud data
      this.handlePointCloudMessage(websocket, event);
    }
  }
}

export default DataSocket;
