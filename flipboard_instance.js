(function(window){
	var supportTouch = 'createTouch' in document;

	function FlipBoard(options){
		this.minMoveOffset = options.minMoveOffset || 20;
		this.maxMoveOffset = options.maxMoveOffset || 200;
		this.dropDown = false;
		this.upperSelector = options.upperSelector || '.upper-container-news-1';
		this.upperSelector2 = options.upperSelector2 || '.upper-container-news-2';
		this.lowerSelector = options.lowerSelector || '.lower-container-news-1';
		this.lowerSelector2 = options.lowerSelector2 || '.lower-container-news-2';
		this.upperLowerSelector = options.upperLowerSelector || '.upper-lower-container';
		this.lowerUpperSelector = options.lowerUpperSelector || '.lower-upper-container';
		this.currentUpperSelector = this.upperSelector;
		this.nextUpperSelector = this.upperSelector2;
		this.currentLowerSelector = this.lowerSelector;
		this.nextLowerSelector = this.lowerSelector2;
		this.firstPoint= {};
		this.prevPoint = {};
		this.movePoint = {};
		this.initialTime;
		this.finalTime;
		this.touchStartHappened = false;
		this.upperAlreadyMoving = false;
		this.lowerAlreadyMoving = false;
		this.dropInProgress = false;
		this.displayList = options.displayList || [];
		this.currentPointer = 0;
		this.noNewsRotateOffset = options.noNewsRotateOffset || 75;
		this.initialIncilination = options.initialIncilination || 0;
		var mainSelector = options.mainSelector || '.main-container';


		$('body').delegate(mainSelector,FlipBoard.events.tap(),{self:this} ,this.touchStart);


		// $('body').delegate(mainSelector,'touchcancel', function(e){
		// 	e.preventDefault();
		// 	alert("touchcancel");
		// 	console.log("touchcancel,,..should not come here");
		// });
		$('body').delegate(mainSelector,'touchcancel', {self : this} ,this.touchEnd);

		$('body').delegate(mainSelector,FlipBoard.events.drag(), {self:this}, this.touchMove);

		$('body').delegate(mainSelector,FlipBoard.events.tapUp(), {self:this},this.touchEnd);

		return this;
	}

	FlipBoard.prototype.initDisplay = function(){
		$(this.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-'+this.initialIncilination+'deg)');
		$(this.nextUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-'+this.initialIncilination+'deg)');

		$(this.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+this.initialIncilination+'deg)');
		$(this.nextLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+this.initialIncilination+'deg)');

		this.insertNews("current",this.displayList[this.currentPointer]);
		if(this.displayList[this.currentPointer+1]){
			this.insertNews("next",this.displayList[this.currentPointer+1]);
		}
	}

	FlipBoard.prototype.getNextNews = function(){
		// console.log("before...........",this.currentPointer);
		var nextNews = this.displayList[this.currentPointer + 2];
		this.currentPointer++; 
		// console.log("after...........",this.currentPointer);
		return nextNews;
	}

	FlipBoard.prototype.getPrevNews = function(){
		var prevNews = this.displayList[this.currentPointer - 2];
		this.currentPointer--;
		return prevNews;
	}

	FlipBoard.prototype.getcurrentNews = function(){
		return this.displayList[this.currentPointer-1];
	}


	FlipBoard.prototype.touchStart = function(e){
		var self = e.data.self;
		e.preventDefault();
		if(self.dropInProgress){
			return
		}
		self.touchStartHappened = true;
		self.initialTime = (new Date).getTime();
		self.firstPoint = FlipBoard.getTouchPosition(e);
		self.prevPoint = self.firstPoint;
	}

	FlipBoard.prototype.touchMove = function(e){
		e.preventDefault();
		var self = e.data.self;
		if(!self.touchStartHappened || self.dropInProgress){
			return
		}
		self.movePoint = FlipBoard.getTouchPosition(e);		
		var dy = (self.movePoint.y  - self.firstPoint.y); 

		if(dy > 0){
			if(self.lowerAlreadyMoving){
				return
			}
			var diffToRotate = self.initialIncilination + (( (90-self.initialIncilination) / (self.maxMoveOffset) ) * dy);
			// console.log('dy........',dy,"maxMoveOffset........",self.maxMoveOffset);
			if( dy >= self.maxMoveOffset ){
				//alert('1');
				if(self.hasNextNews()){
					$(self.nextUpperSelector).css({"display":"block"});
					$(self.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-89.999deg)');
					// console.log('drop down reached');
					self.dropDown = true;
					var lowerDiffToRotate = 90 - (diffToRotate - 90);
					// console.log('drop down reached',lowerDiffToRotate);
					$(self.upperLowerSelector).prefixedCSS('transition','none').css({'visibility':'visible','z-index':'3'});
					if(lowerDiffToRotate > self.initialIncilination){
						$(self.upperLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+lowerDiffToRotate+'deg)');
					}
				}
			}
			else if( dy > self.minMoveOffset) {
				self.upperAlreadyMoving = true;
				$(self.nextUpperSelector).css({"display":"block"});
				$(self.upperLowerSelector).css({'visibility':'hidden','z-index':'0'});
				$(self.currentUpperSelector).prefixedCSS('transition','none');
				if(self.hasNextNews()){
					$(self.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX('+-(diffToRotate-.001)+'deg)');
				}else{
					if(diffToRotate < self.noNewsRotateOffset){
						$(self.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX('+-diffToRotate+'deg)');
					}
				}
				
			}
		}else{
			//console.log("move lower part up");
			if(self.upperAlreadyMoving){
				return
			}
			
			dy = Math.abs(dy);
			//console.log('dy..mmm......',dy,"maxMoveOffset........",self.maxMoveOffset);
			var diffToRotate = self.initialIncilination + ( ( (90-self.initialIncilination) / self.maxMoveOffset) * dy );
			if( dy >= self.maxMoveOffset ){
				$(self.nextLowerSelector).css({"display":"block"});
				//console.log("reached......................................................");
				if(self.hasPrevNews()){
					$(self.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX(-89.999deg)');
					self.dropDown = true;
					var upperDiffToRotate =(180 - diffToRotate);
					// console.log('drop down reached>>>>>>>>>>>>>>>>',upperDiffToRotate);
					// console.log('>>>>>>>>>>>>>>>>>>>.',lowerUpperSelector);
					$(self.lowerUpperSelector).prefixedCSS('transition','none').css({'z-index':'2','visibility':'visible'});
					if(-upperDiffToRotate < self.initialIncilination){
						$(self.lowerUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX('+-upperDiffToRotate+'deg)');
						$(self.lowerUpperSelector).css('z-index','3');
					}
				}
			}else if( dy > self.minMoveOffset) {
				// if()
				// console.log("it is moved nnnnnnnnnnnnn", diffToRotate);
				$(self.nextLowerSelector).css({"display":"block"});
				self.lowerAlreadyMoving = true;
				$(self.lowerUpperSelector).css({'visibility':'hidden'});
				$(self.currentLowerSelector).prefixedCSS('transition','none');
				if(self.hasPrevNews()){
					$(self.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+(diffToRotate-.001)+'deg)');
				}else{
					if(diffToRotate < self.noNewsRotateOffset){
						$(self.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+diffToRotate+'deg)');
					}
				}
			}
		}
	}

	FlipBoard.prototype.touchEnd = function(e){
		// alert("touchEnd");
		var self = e.data.self;
		e.preventDefault();
		self.touchStartHappened = false;
		self.finalTime = (new Date).getTime();
		// var finalPoint = FlipBoard.getTouchPosition(e);
		var finalPoint = $.extend(true, self.movePoint || self.firstPoint,{});
		var speed = Math.abs((finalPoint.y - self.firstPoint.y) /(self.finalTime - self.initialTime));
		var dy = (finalPoint.y - self.firstPoint.y);
		console.log("touch end happened");
		self.movePoint = undefined;
		if(dy > 0){
			if(dy < self.minMoveOffset){
				return
			}
			// alert("positive");
			if(self.lowerAlreadyMoving) {
				// alert("bb");
				self.dropDown = false;
				$(self.currentLowerSelector).prefixedCSS('transition','-webkit-transform .5s linear');
				$(self.currentLowerSelector).one($.domPrefixed("TransitionEnd"), function(){
					return
				});
				$(self.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+self.initialIncilination+'deg)');
				self.lowerAlreadyMoving = false;
				return;
			}
			//alert("11");
			if(speed > .5 && self.hasNextNews()){
				// alert("cc");
				$(self.nextLowerSelector).css({"display":"none"});
				self.dropDownComplete('upper');
				return
			}
			//alert("12");
			if( dy < self.maxMoveOffset || !self.hasNextNews()) {
				// alert("dd");
				console.log("here>>>>>>>>>>>");
				self.dropDown = false;
				$(self.currentUpperSelector).prefixedCSS('transition','-webkit-transform .5s linear');
				$(self.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-'+self.initialIncilination+'deg)');
				self.upperAlreadyMoving = false;
				return;
			}
			// alert("13");
			console.log("speed>.....>>>>>>>>>>>>>..",speed);
			//alert("ee");
			$(self.nextLowerSelector).css({"display":"none"});
			self.dropDownComplete('upper');
		}else{
			console.log("a");
			// alert("negative");
			dy = Math.abs(dy);
			console.log(">>>>>>>>>>>>>>>>>>>",dy)
			if(dy < self.minMoveOffset){
				return
			}
			if(self.upperAlreadyMoving) {
				// alert("b");
				self.dropDown = false;
				$(self.currentUpperSelector).prefixedCSS('transition','-webkit-transform .5s linear');
				$(self.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-'+self.initialIncilination+'deg)');
				self.upperAlreadyMoving = false;
				return;
			}
			if(speed > .5 && self.hasPrevNews()){
				// alert("c");
				$(self.nextUpperSelector).css({"display":"none"});
				self.dropDownComplete('lower');
				return
			}
			if( dy < self.maxMoveOffset || !self.hasPrevNews()) {
				// alert("d");
				self.dropDown = false;
				$(self.currentLowerSelector).prefixedCSS('transition','-webkit-transform .5s linear');
				$(self.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+self.initialIncilination+'deg)');
				self.lowerAlreadyMoving = false;
				return;
			}
			// alert("e");
			$(self.nextUpperSelector).css({"display":"none"});
			self.dropDownComplete('lower');
		}
	}

	FlipBoard.prototype.hasPrevNews = function(){
		return this.displayList[this.currentPointer - 1] ? true : false;
	}

	FlipBoard.prototype.hasNextNews = function(){
		return this.displayList[this.currentPointer + 1] ? true : false;
	}

	FlipBoard.prototype.updateList = function(list){
		if(list){
			this.displayList = list;
		}
		//list ?  (this.displayList =  list.slice()) : return
	}

	FlipBoard.prototype.dropDownComplete = function(direction){
		console.log("dropDownComplete");
		this.dropDown = false;
		var that = this;
		if(that.dropInProgress) {
			return
		}
		that.dropInProgress = true;
		if(direction == 'upper' && that.hasNextNews()){
			// alert("111");
			
			var time = FlipBoard.getTime($(this.currentUpperSelector));
			$(this.currentUpperSelector).prefixedCSS('transition','-webkit-transform '+time+'s linear');
			//alert("112");
			$(this.currentUpperSelector).one($.domPrefixed("TransitionEnd"),function(){
				// console.log("here");
				$(that.currentUpperSelector).prefixedCSS('transition','none');
				$(that.currentUpperSelector).unbind($.domPrefixed('TransitionEnd'));
				$(that.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-'+that.initialIncilination+'deg)').css({'z-index':'1'});
				$(that.nextUpperSelector).css({'z-index':'2'});
				$(that.upperLowerSelector).css({"z-index":"3","visibility":"visible"}).offset();

				$(that.upperLowerSelector).prefixedCSS('transition','-webkit-transform .5s linear');
				$(that.nextLowerSelector).html($(that.currentLowerSelector).html());
				$(that.lowerUpperSelector).html($(that.currentUpperSelector).html());	
				$(that.upperLowerSelector).one($.domPrefixed("TransitionEnd"),function(){
					// $(that.currentLowerSelector).html($(that.upperLowerSelector).html()).offset();
					// alert($(that.upperLowerSelector).css('z-index'));
					// alert($(that.currentLowerSelector).css('z-index'));
					// alert($(that.nextLowerSelector).css('z-index'));
					$(that.upperLowerSelector).prefixedCSS('transition','none');
					$(that.upperLowerSelector).unbind($.domPrefixed('TransitionEnd'));

					//writing new hack
					var temp1 = that.currentLowerSelector;
					that.currentLowerSelector = that.upperLowerSelector;
					that.upperLowerSelector = temp1;

					//setTimeout(function(){
						$(that.upperLowerSelector).css({'z-index':'1'});
						$(that.upperLowerSelector).prefixedCSS('transition','none');
					  $(that.upperLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX(90deg)');
					  // setTimeout(function(){
					  	$(that.currentLowerSelector).css({"z-index":"2"});
					  // },200);
					 	var chNews = that.getNextNews();
						that.upperAlreadyMoving = false;
						that.dropInProgress = false;
						if(chNews){
							that.lowerTemplateFunction($(that.upperLowerSelector), chNews.lower);
							that.upperTemplateFunction($(that.currentUpperSelector),chNews.upper);
						}else{
							$(that.currentUpperSelector).html("");
						}
						var temp = that.currentUpperSelector;
						that.currentUpperSelector = that.nextUpperSelector;
						that.nextUpperSelector = temp;
					//},0);	
				});			
				$(that.upperLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX(0deg)');
			});
			$(this.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-90deg)');
		}else if(direction=="lower" && that.hasPrevNews()){
			var time = FlipBoard.getTime($(this.currentLowerSelector));
			$(this.currentLowerSelector).prefixedCSS('transition','-webkit-transform '+time+'s linear');
			$(this.currentLowerSelector).one($.domPrefixed("TransitionEnd"),function(){
				// console.log("here it is");
				$(that.currentLowerSelector).prefixedCSS('transition','none');
				$(that.currentLowerSelector).unbind($.domPrefixed('TransitionEnd'));
				$(that.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+that.initialIncilination+'deg)').css({'z-index':'1'});
				$(that.nextLowerSelector).css({'z-index':'2'});
				$(that.lowerUpperSelector).css({'z-index':'3','visibility':'visible'}).offset();
				$(that.lowerUpperSelector).prefixedCSS('transition','-webkit-transform .5s linear');
				$(that.nextUpperSelector).html($(that.currentUpperSelector).html());
				$(that.upperLowerSelector).html($(that.currentLowerSelector).html());
				
				$(that.lowerUpperSelector).one($.domPrefixed('TransitionEnd'),function(){
					console.log("coming here");
					// $(that.currentUpperSelector).html($(that.lowerUpperSelector).html());
					$(that.lowerUpperSelector).prefixedCSS('transition','none');
					$(that.lowerUpperSelector).unbind('TransitionEnd');

					//writing new hack
					var temp1 = that.currentUpperSelector;
					that.currentUpperSelector = that.lowerUpperSelector;
					that.lowerUpperSelector = temp1;

					setTimeout(function(){
						$(that.lowerUpperSelector).prefixedCSS('transition','none');
						$(that.lowerUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-90deg)').css({'z-index':'1'});
						// setTimeout(function(){
							$(that.currentUpperSelector).css({"z-index":"2"});
						// },200);
						that.lowerAlreadyMoving = false;
						that.dropInProgress = false;
						var chNews = that.getPrevNews();
						if(chNews){
							that.upperTemplateFunction($(that.lowerUpperSelector),chNews.upper);
							that.lowerTemplateFunction($(that.currentLowerSelector),chNews.lower);
						}else{
							$(that.currentLowerSelector).html("");
						}
						var temp = that.currentLowerSelector;
						that.currentLowerSelector = that.nextLowerSelector;
						that.nextLowerSelector = temp;
					},100);
				});
				$(that.lowerUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-'+that.initialIncilination+'deg)');
			});
			$(this.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX(90deg)');
		}else{
			that.dropInProgress = false;
		}
	}

	FlipBoard.prototype.insertNews = function(order, content){
		switch (order)
		{
			case "current":
				this.upperTemplateFunction($(this.currentUpperSelector),content.upper);
				this.lowerTemplateFunction($(this.currentLowerSelector),content.lower);
				break;
			case "next":
				this.upperTemplateFunction($(this.nextUpperSelector),content.upper);
				this.lowerTemplateFunction($(this.upperLowerSelector),content.lower);
				break
			case "prev":
				this.upperTemplateFunction($(this.nextLowerSelector),content.lower);
				this.lowerTemplateFunction($(this.lowerUpperSelector),content.upper);
				break
			default:
				break;
		}
		return;

	}

	FlipBoard.events = {
		touch: function(){
			return supportTouch ? true : false;
		},
		tap: function(){
			return supportTouch ? 'touchstart' : 'mousedown';
		},
		drag: function(){
			return supportTouch ? 'touchmove' : 'mousemove';
		},
		tapUp: function(){
			return supportTouch ? 'touchend' : 'mouseup';
		}
	};

	FlipBoard.getTouchPosition = function(e){		
		if (FlipBoard.events.touch()) {
			var event = e.originalEvent;
			if(event != undefined && event.changedTouches.length > 0) {
				return {
					x:	e.originalEvent.changedTouches[0].clientX,
					y:	e.originalEvent.changedTouches[0].clientY
				};
			}
			return {x:0,	y:0};
		} else {
			return {x:e.originalEvent.clientX,	y:e.originalEvent.clientY};
		}
	}

	FlipBoard.getTime = function($el){
		var currentTransform = $el.transform();
		var totalTime = .5;
		var angleRemaining = 90 - Math.abs($.getRotateValue(currentTransform)[0]);
		return (.5*angleRemaining)/90;
			// console.log("current transform.",$.getRotateValue(currentTransform));
	}

	window.FlipBoard = FlipBoard;
})(window);

var Modernizr = {};
Modernizr._prefixes = ["","-webkit-","-moz-","-ms-","-o-",""];
Modernizr._domPrefixes= ["webkit", "moz", "o", "ms"];
Modernizr.prefixed = function(property) {
	// TODO: find a better solution (use original Modernizr function)
	// used Webkit as it is used in webkit browsers
	// also it is being used only for 'transform' in this file currenly
	return 'Webkit' + property[0].toUpperCase() + property.slice(1);
}

$.fn.prefixedCSS = function(property, value) {
	var cssValue;
	var prefixedProperties = Modernizr._prefixes.map(function(prefix) {
		return prefix + property;
	});

	if (value === undefined) {
		for (var i = 0; i < prefixedProperties.length; i++) {
			cssValue = cssValue || this.css(prefixedProperties[i]);
		}
		return cssValue;
	} else {
		for (var i = 0; i < prefixedProperties.length; i++) {
			this.css(prefixedProperties[i], value);
		}
		return this;
	}
}

$.fn.transform = function(params) {
		var prefixes = Modernizr._prefixes;
		var domPrefixes = Modernizr._domPrefixes.concat([""]);
		if (!params) {
			var value, transformStr;
			// for (var i = 0; i < prefixes.length && value == undefined; i++) {
			// 	transformStr = domPrefixes[i] ? 'Transform' : 'transform';
			// 	value = this[0].style[domPrefixes[i] + transformStr];
			// }
			return this[0].style[ Modernizr.prefixed('transform') ];
			// return this.css(Modernizr.prefixed('transform'));
		}
}

$.extend({
	domPrefixed: function(name) {
		var prefixes = $.extend([],Modernizr._domPrefixes);
		prefixes.push('');	// to add an event without prefix

		return prefixes.map(function(prefix) {
			if (!prefix) {
				return name.toLowerCase();
			}
			return prefix + name;
		}).join(' ');
	}, 
	getRotateValue : function(transformValue){
		var values;
		transformValue.replace(/rotateX\(([-]?[0-9\.]*)deg\)/g,
			function(all, val) {
				values = [~~val];
				return val;
			}
		);
		return values;
	}
});

