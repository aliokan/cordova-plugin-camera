/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

function takePicture(success, error, opts) {
    if (opts && opts[2] === 1) {
        capture(success, error);
    } else {
        var input = document.createElement('input');
        input.style.position = 'relative';
        input.style.zIndex = 99999;
        input.type = 'file';
        input.name = 'files[]';

        input.onchange = function(inputEvent) {
            var canvas = document.createElement('canvas');

            var reader = new FileReader();
            reader.onload = function(readerEvent) {
                input.parentNode.removeChild(input);

                var imageData = readerEvent.target.result;

                return success(_imageDataToBlob(imageData.substr(imageData.indexOf(',') + 1)));
            };

            reader.readAsDataURL(inputEvent.target.files[0]);
        };

        document.body.appendChild(input);
    }
}

function capture(success, errorCallback) {
    var localMediaStream;

    var video = document.createElement('video');
    var button = document.createElement('button');
    var parent = document.createElement('div');
    parent.style.position = 'relative';
    parent.style.zIndex = 99999;
    parent.appendChild(video);
    parent.appendChild(button);

    video.width = 320;
    video.height = 240;
    button.innerHTML = 'Capture!';

    button.onclick = function() {
        // create a canvas and capture a frame from video stream
        var canvas = document.createElement('canvas');
        canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);

        // convert image stored in canvas to base64 encoded image
        var imageData = canvas.toDataURL('img/png');
        imageData = imageData.replace('data:image/png;base64,', '');

        // stop video stream, remove video and button
        localMediaStream.stop();
        parent.parentNode.removeChild(parent);

        return success(_imageDataToBlob(imageData));
    };

    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    var successCallback = function(stream) {
        localMediaStream = stream.getVideoTracks()[0];
        
        var vendorURL = window.URL || window.webkitURL;
        video.src = vendorURL.createObjectURL(stream);
        video.play();

        document.body.appendChild(parent);
    };

    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true, audio: false}, successCallback, errorCallback);
    } else {
        alert('Browser does not support camera :(');
    }
}

function _imageDataToBlob(imageData)
{
    var binary = _base64ToArrayBuffer(imageData);
    var blob = new Blob([binary], {type: 'image/png'});
    return URL.createObjectURL(blob);
}

function _base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

module.exports = {
    takePicture: takePicture,
    cleanup: function(){}
};

require("cordova/exec/proxy").add("Camera",module.exports);
