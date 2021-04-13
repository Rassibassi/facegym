// console.log(faceapi.nets);
let face_expression = 0;

const videoEl = document.getElementById('video');
const ulEl = document.getElementById("expressions");

const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 256 });
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/facegym/models'),
  faceapi.loadFaceExpressionModel('/facegym/models')
]);

const expressions_list = ['neutral',
                          'disgusted',
                          'fearful',
                          'happy',
                          'angry',
                          'sad',
                          'surprised'];

function start() {
    var constraints = {
        audio: false,
        video: true
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        document.getElementById('video').srcObject = stream;

        // return negotiate();
    }, function(err) {
        alert('Could not acquire media: ' + err);
    });
}

function pF(x){
    return parseFloat(x).toFixed(2)
}

async function onPlay() {
    if(videoEl.paused || videoEl.ended){
        return setTimeout(() => onPlay());
    }

    const result = await faceapi.detectSingleFace(videoEl, options).withFaceExpressions();

    if(result !== undefined){
        const detection = result.detection;
        const expressions = result.expressions;

        // console.log(detection);
        const box_dim = document.getElementById('box_dim');
        box_dim.innerHTML = pF(detection._box._height) + " / " + pF(detection._box._width);
        const box_xy = document.getElementById('box_xy');
        box_xy.innerHTML = pF(detection._box._x) + " / " + pF(detection._box._y);

        // console.log(expressions);
        ulEl.innerHTML = "";
        expressions_list.forEach((expression, idx) => {
            const text = `${expression}: ${pF(expressions[expression])}`;
            if(expressions[expression] > 0.4){
                face_expression = idx;
            }
            // console.log(text);
            const liEl = document.createElement("li");
            liEl.innerHTML = text;
            ulEl.appendChild(liEl);
        });
    }

    setTimeout(() => onPlay());
}

start();