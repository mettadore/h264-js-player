"use strict";


const spawn  = require('child_process').spawn;
const WebSocketServer = require('ws').Server;
const Splitter        = require('stream-split');
const merge           = require('mout/object/merge');

const NALseparator    = new Buffer([0,0,0,1]);// NAL break

class FFMpegServer {

  constructor(opts) {
	  this.options = {
			  width : opts.width,
		      height: opts.height,
		      port: opts.port,
		      streamUrl: opts.streamUrl
	  };
	  this.wss = new WebSocketServer({ 
		  port: 8081,
	      width  : this.options.width,
	      height : this.options.height
		  });

	  var readStream = this.get_feed();
	  this.readStream = readStream;

	  readStream = readStream.pipe(new Splitter(NALseparator));
	  //readStream.on("data", this.broadcast);

  }
  
  get_feed() {
	  var args = [
	        "-f", "x11grab",
	        "-framerate", this.options.fps,
	        '-i', ':0.0+100,200',
	        '-pix_fmt',  'yuv420p',
	        '-c:v',  'libx264',
	        '-vprofile', 'baseline',
	        '-tune', 'zerolatency',
	        '-f' ,'rawvideo',
	        '-'
	    ];
	
	      // https://trac.ffmpeg.org/wiki/Limiting%20the%20output%20bitrate
    var args2 = [
	        "-rtsp_transport", "tcp",
	        "-i", this.options.streamUrl,
	        '-video_size', '800x500',
	        '-pix_fmt',  'yuv420p',
	        '-c:v',  'libx264',
	        '-vprofile', 'baseline',
	        '-f' ,'rawvideo',
	        '-'
	    ];

    var running = args2;
    console.log("ffmpeg " + running.join(' '));
    var streamer = spawn('ffmpeg', running);
    streamer.stderr.pipe(process.stderr);

    streamer.on("exit", function(code){
      console.log("Failure", code);
    });

    return streamer.stdout;
  }
  
  broadcast(data) {
	    this.wss.clients.forEach(function(socket) {

	      if(socket.buzy)
	        return;

	      socket.buzy = true;
	      socket.buzy = false;

	      socket.send(Buffer.concat([NALseparator, data]), { binary: true}, function ack(error) {
	        socket.buzy = false;
	      });
	    });
	  }

};


module.exports = FFMpegServer;
