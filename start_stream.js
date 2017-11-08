"use strict";

const FFMpegServer = require('./lib/ffmpeg');

const silence = new FFMpegServer({
	  width : 800,
	  height: 500,
	  port:8081,
	  //streamUrl: "rtsp://b1.dnsdojo.com:1935/live/sys3.stream",
	  streamUrl: "rtsp://184.72.239.149/vod/mp4:BigBuckBunny_175k.mov"
	});
