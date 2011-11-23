(function( $ ){
    // Methods
    var methods = {
        init: function(video, options){
            $this = this;
            // Bind options
            var player =  $.extend($('<div class="player">'), options);
            player.ready = false;
            player.video = video;
            player.video.preload = 'meta';
            player.insertAfter($(player.video));
            player.append(player.video);
            
            player.init(player);
            
            // MOUSEDOWN CONTROL
            player.mouseDown = 0;
            $(document).bind({
                mousedown:function() { 
                    ++player.mouseDown;
                },
                mouseup:function() { 
                    --player.mouseDown;
                }
            });
            
            player.controls = $('<div class="player-controls">')
            .appendTo(player);
            // PLAY BUTTON
            player.controls.play = $('<a class="player-play">')
            .click(function(){
                $this.play(player);
            })
            .appendTo(player.controls);
            // BAR
            player.controls.bar = $('<div class="player-bar">')
            .click(function(){
                
                })
            .appendTo(player.controls);
            // PROGRESS BUTTON
            player.controls.progress = $('<div class="player-progress">')
            .click(function(){
                
                })
            .appendTo(player.controls.bar);
            // PLAYING BAR
            player.controls.playing = $('<div class="player-playing">')
            .click(function(){
                
                })
            .appendTo(player.controls.bar);
            // SEEKER (a hidden layer for seeking over the others)
            player.controls.seeker = $('<a class="player-seeker">')
            .click(function(e){
                player.seeking = ( e.layerX / $(this).width() *100);
                $this.seek(player);
            //console.log('seek percent', seekpercent);
            })
            .appendTo(player.controls.bar);
            // MUTE (volume icon)
            player.controls.mute = $('<a class="player-mute">')
            .click(function(){
                $this.mute(player);
            })
            .appendTo(player.controls);
            
            // VOLUME BAR
            player.controls.volumebar = $('<a class="player-volumebar">')
            .click(function(){
                
                })
            .appendTo(player.controls);
            // VOLUME LEVEL (for showing volume level)
            player.controls.volumelevel = $('<a class="player-volumelevel">')
            .click(function(){
                
                })
            .appendTo(player.controls.volumebar);
            // VOLUME (a hidden layer for volume setting over the others)
            player.controls.volume = $('<a class="player-volume">')
            .bind({
                mousemove:function(e){
                    if(player.mouseDown){
                        player.volumelevel = ( e.layerX / $(this).width());
                        $this.volume(player);
                    }
                },
                click:function(e){
                    player.mouseDown = 0;
                    player.volumelevel = ( e.layerX / $(this).width());
                    $this.volume(player);
                }
            })
            .appendTo(player.controls.volumebar);
            // SET DEFAULT VOLUME
            $this.volume(player);
            
            
            // METADATA
            var metadata = function(){
                player.ready = true;
                player.duration = this.duration;
                player.playing = this.currentSrc;
                
                $this.pose(player);
                
            //document.querySelector('#duration').innerHTML = asTime(this.duration);
            //using.innerHTML = this.currentSrc;
            // note: .webkitSupportsFullscreen is false while the video is loading, so we bind in to the canplay event
            /*
                if (video.webkitSupportsFullscreen) {
                    fullscreen = document.createElement('input');
                    fullscreen.setAttribute('type', 'button');
                    fullscreen.setAttribute('value', 'fullscreen');
                    controls.insertBefore(fullscreen, controls.firstChild);
                    addEvent(fullscreen, 'click', function () {
                        video.webkitEnterFullScreen();
                    });
                }
                 */
            };
            // READY
            // metadata is loaded already - fire the event handler manually
            if (player.video.readyState > 0) { 
                metadata.call(player.video);
            } else {
                player.video.addEventListener("loadedmetadata", metadata);
            }
            // PROGRESS
            player.video.addEventListener("progress", function (e) {
                //console.log('progress', this.seekable, this.seekable.end(),this.duration);
                var loaded = this.seekable && this.seekable.length ? this.seekable.end() : 0; 
                player.controls.progress.width((100 / (this.duration || 1) * loaded) + '%');
            }, false);
            // WAITING EVENT
            player.video.addEventListener("waiting", function (e) {
                //console.log('waiting');
            }, false);
            // SCREEN CLICK PLAY&PAUSE EVENT
            player.video.addEventListener("click", function (e) {
                $this.play(player);
            }, false);
            // PLAYING EVENT
            player.video.addEventListener("timeupdate", function (e) {
                var percent = (100 / (this.duration || 1) * this.currentTime)
                //console.log(this.seekable.end(), this.played.end());
                player.controls.playing.width(percent +'%');
            },false);
            
            // SEEKING EVENT
            player.video.addEventListener("seeking", function (e) {
                //player.video.pause();
            },false);
            // SEEKED EVENT
            player.video.addEventListener("seeked", function (e) {
                //player.video.play();
            },false);
            // ENDED EVENT
            player.video.addEventListener("ended", function (e) {
                player.controls.playing.width('0%');
                player.controls.play.removeClass('playing');
                console.log('video end')
            },false);
            // ERROR EVENT
            player.video.addEventListener("error", function (e) {
                switch (e.target.error.code) {
                    case e.target.error.MEDIA_ERR_ABORTED:
                        player.errorText = 'You aborted the video playback.';
                        $this.error(player);
                        break;
                    case e.target.error.MEDIA_ERR_NETWORK:
                        player.errorText = 'A network error caused the video download to fail part-way.';
                        $this.error(player);
                        break;
                    case e.target.error.MEDIA_ERR_DECODE:
                        player.errorText = 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.';
                        $this.error(player);
                        break;
                    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        player.errorText = 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
                        $this.error(player);             
                        break;
                    default:
                        player.errorText = 'An unknown error occurred.';
                        $this.error(player);  
                        break;
                }
            },false);
            
            // pose
            $this.pose(player);
            // context menu
            $this.contextmenu(player);
            return false;
        },
        pose: function(player){
            //console.log('pose');
            var w = player.width();
            var h = player.height();
            
            if(player.video.videoWidth){
                
                var pd = w / h;
                var vd = player.video.videoWidth / player.video.videoWidth;
                if(pd >= vd){
                    player.video.width = w;
                    player.video.height = h * vd;
                } else {
                    player.video.width = w * vd;
                    player.video.height = h;
                }
                //console.log(player.video.width, player.video.height, player.video.videoWidth);
                
            }
            
            player.controls.bar.css({
                left: '43px',
                width: w - 153 + 'px'
            });
            
            player.controls.mute.css({
                left: w -100 + 'px'
            });
            
            player.controls.volumebar.css({
                left: w -67 + 'px'
            });
            
        },
        contextmenu: function(player){
            $this = this;
            player.bind({
                'contextmenu':function(e){
                    e.preventDefault();
                    $('#contextmenu').remove();
                    var c = $('<div id="contextmenu">')
                    c.css({
                        position : 'absolute',
                        display  : 'none',
                        'z-index': '10000'
                    })   
                    .appendTo($('body'));
                    $('<a>').click(function(){
                        $this.play(player);
                    })
                    .html(player.menu[0]).appendTo(c);
                    $('<a>').click(function(){
                        $this.pause(player);
                    })
                    .html(player.menu[1]).appendTo(c);
                    $('<a href="http://gokercebeci.com/dev/player">')
                    .html('player v1.00').appendTo(c);
                    // Set position
                    var ww = $(document).width();
                    var wh = $(document).height();
                    var w = c.outerWidth(1);
                    var h = c.outerHeight(1);
                    var x = e.pageX > (ww - w) ? ww : e.pageX;
                    var y = e.pageY > (wh - h) ? wh : e.pageY;
                    c.css({
                        display : 'block',
                        top     : y,
                        left    : x
                    });
                }
            });
            $(document)
            .click(function(){
                $('#contextmenu').remove();
            })
            .keydown(function(e) {
                if ( e.keyCode == 27 ){
                    $('#contextmenu').remove();
                }
            })
            .scroll(function(){
                $('#contextmenu').remove();
            })
            .resize(function(){
                $('#contextmenu').remove();
            });
        },
        
        play   : function(player){
            if (player.ready) {
                // video.playbackRate = 0.5;
                if (player.video.paused) {
                    if (player.video.ended) player.video.currentTime = 0;
                    player.video.play();
                    player.controls.play.addClass('playing');
                } else {
                    player.video.pause();
                    player.controls.play.removeClass('playing');
                }
            }
        },
        stop   : function(player){
        },
        seek   : function(player){
            player.controls.playing.width(player.seeking +'%');
            player.video.currentTime = player.duration * player.seeking *.01;
        },
        mute   : function(player){
            if(player.video.muted){
                player.controls.mute.removeClass('on');
                player.video.muted = false;
                player.controls.volumelevel.width((player.video.volume *100) +'%');
            } else {
                player.controls.mute.addClass('on');
                player.video.muted = true;
                player.controls.volumelevel.width('0%');
            }
        },
        volume : function(player){
            player.video.volume = player.volumelevel;
            player.controls.volumelevel.width((player.video.volume *100) +'%');
        },
        
        
        
        start: function(player){
            player.start(player);
            player.slides.css({
                opacity:'0'
            });
        },  
        finish: function(player){
            player.finish(player);
        },  
        error: function(player){
            player.error(player);
        }
    };
    $.fn.player = function(options) {
        options = $.extend({
            init    : function(){},
            start   : function(){},
            finish  : function(){},
            error   : function(player){
                player.find('.player-error').remove();
                $('<div class="player-error">')
                .html(player.errorText)
                .appendTo(player);
            },
            
            volumelevel  : .8,
            
            menu    : ['next','previous']
        }, options);
        this.each(function(){
            methods.init(this, options);
        });
    };
})(jQuery);