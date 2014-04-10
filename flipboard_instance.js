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
		self.touchStartHappened = true;
		self.initialTime = (new Date).getTime();
		self.firstPoint = FlipBoard.getTouchPosition(e);
		self.prevPoint = self.firstPoint;
	}

	FlipBoard.prototype.touchMove = function(e){
		e.preventDefault();
		var self = e.data.self;
		if(!self.touchStartHappened){
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
					$(self.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-89.999deg)');
					console.log('drop down reached');
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
				//console.log("reached......................................................");
				if(self.hasPrevNews()){
					$(self.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX(-89.999deg)');
					self.dropDown = true;
					var upperDiffToRotate =(180 - diffToRotate);
					// console.log('drop down reached>>>>>>>>>>>>>>>>',upperDiffToRotate);
					// console.log('>>>>>>>>>>>>>>>>>>>.',lowerUpperSelector);
					$(self.lowerUpperSelector).prefixedCSS('-webkit-transition','none').css({'z-index':'2','visibility':'visible'});
					if(-upperDiffToRotate < self.initialIncilination){
						$(self.lowerUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX('+-upperDiffToRotate+'deg)');
						$(self.lowerUpperSelector).css('z-index','3');
					}
				}
			}else if( dy > self.minMoveOffset) {
				// if()
				// console.log("it is moved nnnnnnnnnnnnn", diffToRotate);
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
		alert("touchEnd");
		var self = e.data.self;
		e.preventDefault();
		self.touchStartHappened = false;
		self.finalTime = (new Date).getTime();
		// var finalPoint = FlipBoard.getTouchPosition(e);
		var finalPoint = self.movePoint;
		var speed = Math.abs((finalPoint.y - self.firstPoint.y) /(self.finalTime - self.initialTime));
		var dy = (finalPoint.y - self.firstPoint.y);
		console.log("touch end happened");
		if(dy > 0){
			if(self.lowerAlreadyMoving) {
				alert("bb");
				self.dropDown = false;
				$(self.currentLowerSelector).prefixedCSS('transition','all .5s linear');
				$(self.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+self.initialIncilination+'deg)');
				self.lowerAlreadyMoving = false;
				return;
			}
			if(speed > .5 && self.hasNextNews()){
				alert("cc");
				self.dropDownComplete('upper');
				return
			}

			if( dy < self.maxMoveOffset || !self.hasNextNews()) {
				alert("dd");
				self.dropDown = false;
				$(self.currentUpperSelector).prefixedCSS('transition','all .5s linear');
				$(self.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-'+self.initialIncilination+'deg)');
				self.upperAlreadyMoving = false;
				return;
			}
			console.log("speed>.....>>>>>>>>>>>>>..",speed);
			console.log("ee");
			self.dropDownComplete('upper');
		}else{
			console.log("a");
			dy = Math.abs(dy);
			if(self.upperAlreadyMoving) {
				console.log("b");
				self.dropDown = false;
				$(self.currentUpperSelector).prefixedCSS('transition','all .5s linear');
				$(self.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-'+self.initialIncilination+'deg)');
				self.upperAlreadyMoving = false;
				return;
			}
			if(speed > .2 && self.hasPrevNews()){
				console.log("c");
				self.dropDownComplete('lower');
				return
			}
			if( dy < self.maxMoveOffset || !self.hasPrevNews()) {
				console.log("d");
				self.dropDown = false;
				$(self.currentLowerSelector).prefixedCSS('transition','all .5s linear');
				$(self.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+self.initialIncilination+'deg)');
				self.lowerAlreadyMoving = false;
				return;
			}
			console.log("e");
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
		if(direction == 'upper' && that.hasNextNews()){
			// console.log("*****************",$(this.currentUpperSelector).css("-webkit-transform"));
			var time = FlipBoard.getTime($(this.currentUpperSelector));
			$(this.currentUpperSelector).prefixedCSS('transition','all '+time+'s linear');
			$(this.currentUpperSelector).one($.domPrefixed("transitionend"),function(){
				$(that.currentUpperSelector).prefixedCSS('transition','none');
				$(that.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-'+that.initialIncilination+'deg)').css({'z-index':'1'});
				//debugger
				// $(currentUpperSelector).css({'z-index':'1'});
				$(that.nextUpperSelector).css({'z-index':'2'});
				$(that.upperLowerSelector).css({"z-index":"3"}).offset();
				$(that.upperLowerSelector).prefixedCSS('transition','all .5s linear').css({'visibility':'visible'});
				$(that.upperLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX(0deg)');
				$(that.nextLowerSelector).html($(that.currentLowerSelector).html());
				$(that.lowerUpperSelector).html($(that.currentUpperSelector).html());				
				setTimeout(function(){
					$(that.currentLowerSelector).html($(that.upperLowerSelector).html());
					$(that.upperLowerSelector).prefixedCSS('transition','none').css({'z-index':'0'});
					$(that.upperLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX(90deg)');
					var chNews = that.getNextNews();
					that.upperAlreadyMoving = false;
					if(chNews){
						// $(that.upperLowerSelector).html(that.lowerTemplateFunction(chNews.lower));
						that.lowerTemplateFunction($(that.upperLowerSelector), chNews.lower);
						// debugger
						that.upperTemplateFunction($(that.nextUpperSelector),chNews.upper);
					}else{
						$(that.nextUpperSelector).html("");
					}
				},500);
				//toogle selectors
				var temp = that.currentUpperSelector;
				that.currentUpperSelector = that.nextUpperSelector;
				that.nextUpperSelector = temp;
			});
			$(this.currentUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-90deg)');
		}else if(direction=="lower" && that.hasPrevNews()){
			var time = FlipBoard.getTime($(this.currentLowerSelector));
			$(this.currentLowerSelector).prefixedCSS('transition','all '+time+'s linear');
			$(this.currentLowerSelector).one($.domPrefixed("transitionend"),function(){
				$(that.currentLowerSelector).prefixedCSS('transition','none');
				$(that.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX('+that.initialIncilination+'deg)').css({'z-index':'1'});
				//debugger
				//$(currentUpperSelector).css({'z-index':'1'});
				$(that.nextLowerSelector).css({'z-index':'2'});
				$(that.lowerUpperSelector).css({'z-index':'3'}).offset();
				$(that.lowerUpperSelector).prefixedCSS('transition','all .5s linear').css({'visibility':'visible'});
				$(that.lowerUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-'+that.initialIncilination+'deg)');
				$(that.nextUpperSelector).html($(that.currentUpperSelector).html());
				$(that.upperLowerSelector).html($(that.currentLowerSelector).html());
				setTimeout(function(){
					$(that.currentUpperSelector).html($(that.lowerUpperSelector).html());
					$(that.lowerUpperSelector).prefixedCSS('transition','none');
					$(that.lowerUpperSelector).prefixedCSS('transform','perspective(2000px) rotateX(-90deg)').css({'z-index':'0'});
					that.lowerAlreadyMoving = false;
					var chNews = that.getPrevNews();
					if(chNews){
						that.upperTemplateFunction($(that.lowerUpperSelector),chNews.upper);
						// debugger

						that.lowerTemplateFunction($(that.nextLowerSelector),chNews.lower);
					}else{
						$(that.nextLowerSelector).html("");
					}
				},500);
				//toogle selectors
				var temp = that.currentLowerSelector;
				that.currentLowerSelector = that.nextLowerSelector;
				that.nextLowerSelector = temp;
			});
			$(this.currentLowerSelector).prefixedCSS('transform','perspective(2000px) rotateX(90deg)');
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
			console.log("current transform.",$.getRotateValue(currentTransform));
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

