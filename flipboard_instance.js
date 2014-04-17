(function(window, $){
	var supportTouch = 'createTouch' in document;

	function FlipBoard(options){
		this.minMoveOffset = options.minMoveOffset || 20;
		this.maxMoveOffset = options.maxMoveOffset || 200;
		this.dropDown = false;
		this.us = options.upperSelector || '.upper-container-news-1';
		this.us2 = options.upperSelector2 || '.upper-container-news-2';
		this.ls = options.lowerSelector || '.lower-container-news-1';
		this.ls2 = options.lowerSelector2 || '.lower-container-news-2';
		this.uls = options.upperLowerSelector || '.upper-lower-container';
		this.lus = options.lowerUpperSelector || '.lower-upper-container';
		this.cus = this.us;
		this.nus = this.us2;
		this.cls = this.ls;
		this.nls = this.ls2;
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
		this.perspective = options.perspective || 2000;

		var mainSelector = options.mainSelector || '.main-container';


		$('body').delegate(mainSelector,FlipBoard.events.tap(),{self:this} ,this.touchStart);


		// $('body').delegate(mainSelector,'touchcancel', function(e){
		// 	e.preventDefault();
		// 	alert("touchcancel");
		// 	console.log("touchcancel,,..should not come here");
		// });

		//Redirecting touchcancel to touchEnd --- this occurs in case of phonegap build
		$('body').delegate(mainSelector,'touchcancel', {self : this} ,this.touchEnd);

		$('body').delegate(mainSelector,FlipBoard.events.drag(), {self:this}, this.touchMove);

		$('body').delegate(mainSelector,FlipBoard.events.tapUp(), {self:this},this.touchEnd);

		return this;
	}

	FlipBoard.prototype.initDisplay = function(){
		$(this.cus).prefixedCSS('transform',this.getTransform(-this.initialIncilination));
		$(this.nus).prefixedCSS('transform',this.getTransform(-this.initialIncilination));

		$(this.cls).prefixedCSS('transform',this.getTransform(this.initialIncilination));
		$(this.nls).prefixedCSS('transform',this.getTransform(this.initialIncilination));

		this.insertNews("current",this.displayList[this.currentPointer]);
		if(this.displayList[this.currentPointer+1]){
			this.insertNews("next",this.displayList[this.currentPointer+1]);
		}
	}

	FlipBoard.prototype.getTransform = function(angle) {
		return 'perspective('+this.perspective+'px) rotateX('+angle+'deg)';
	}

	FlipBoard.prototype.getNextNews = function(){
		var nextNews = this.displayList[this.currentPointer + 2];
		this.currentPointer++; 
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
			if( dy >= self.maxMoveOffset ){
				if(self.hasNextNews()){
					// $(self.nextUpperSelector).css({"display":"block"});
					$(self.cus).prefixedCSS('transform',self.getTransform(-89.999));
					self.dropDown = true;
					var lowerDiffToRotate = 90 - (diffToRotate - 90);
					$(self.uls).prefixedCSS('transition','none').css({'visibility':'visible','z-index':'3'});
					if(lowerDiffToRotate > self.initialIncilination){
						$(self.uls).prefixedCSS('transform',self.getTransform(lowerDiffToRotate));
					}
				}
			}
			else if( dy > self.minMoveOffset) {
				self.upperAlreadyMoving = true;
				// $(self.nextUpperSelector).css({"display":"block"});
				$(self.uls).css({'visibility':'hidden','z-index':'0'});
				$(self.cus).prefixedCSS('transition','none');
				if(self.hasNextNews()){
					$(self.cus).prefixedCSS('transform',self.getTransform(-(diffToRotate-.001)));
				}else{
					if(diffToRotate < self.noNewsRotateOffset){
						$(self.cus).prefixedCSS('transform',self.getTransform(-diffToRotate));
					}
				}
				
			}
		}else{
			if(self.upperAlreadyMoving){
				return
			}
			
			dy = Math.abs(dy);
			var diffToRotate = self.initialIncilination + ( ( (90-self.initialIncilination) / self.maxMoveOffset) * dy );
			if( dy >= self.maxMoveOffset ){
				$(self.nls).css({"display":"block"});
				if(self.hasPrevNews()){
					$(self.cls).prefixedCSS('transform',self.getTransform(-89.999));
					self.dropDown = true;
					var upperDiffToRotate =(180 - diffToRotate);
					$(self.lus).prefixedCSS('transition','none').css({'z-index':'2','visibility':'visible'});
					if(-upperDiffToRotate < self.initialIncilination){
						$(self.lus).prefixedCSS('transform',self.getTransform(-upperDiffToRotate));
						$(self.lus).css('z-index','3');
					}
				}
			}else if( dy > self.minMoveOffset) {
				$(self.nls).css({"display":"block"});
				self.lowerAlreadyMoving = true;
				$(self.lus).css({'visibility':'hidden'});
				$(self.cls).prefixedCSS('transition','none');
				if(self.hasPrevNews()){
					$(self.cls).prefixedCSS('transform',self.getTransform((diffToRotate-.001)));
				}else{
					if(diffToRotate < self.noNewsRotateOffset){
						$(self.cls).prefixedCSS('transform',self.getTransform(diffToRotate));
					}
				}
			}
		}
	}

	FlipBoard.prototype.touchEnd = function(e){
		var self = e.data.self;
		e.preventDefault();
		self.touchStartHappened = false;
		self.finalTime = (new Date).getTime();
		// var finalPoint = FlipBoard.getTouchPosition(e);
		var finalPoint = $.extend(true, self.movePoint || self.firstPoint,{});
		var speed = Math.abs((finalPoint.y - self.firstPoint.y) /(self.finalTime - self.initialTime));
		var dy = (finalPoint.y - self.firstPoint.y);
		
		self.movePoint = undefined;
		if(dy > 0){
			if(dy < self.minMoveOffset){
				return
			}
			if(self.lowerAlreadyMoving) {
				self.dropDown = false;
				$(self.cls).prefixedCSS('transition','-webkit-transform .5s linear');
				$(self.cls).one($.domPrefixed("TransitionEnd"), function(){
					return
				});
				$(self.cls).prefixedCSS('transform',self.getTransform(self.initialIncilination));
				self.lowerAlreadyMoving = false;
				return;
			}

			if(speed > .5 && self.hasNextNews()){
				$(self.nls).css({"display":"none"});
				self.dropDownComplete('upper');
				return
			}

			if( dy < self.maxMoveOffset || !self.hasNextNews()) {
				self.dropDown = false;
				$(self.cus).prefixedCSS('transition','-webkit-transform .5s linear');
				$(self.cus).prefixedCSS('transform',self.getTransform(-self.initialIncilination));
				self.upperAlreadyMoving = false;
				return;
			}
			
			$(self.nls).css({"display":"none"});
			self.dropDownComplete('upper');
		}else{			
			dy = Math.abs(dy);
			if(dy < self.minMoveOffset){
				return
			}
			if(self.upperAlreadyMoving) {
				self.dropDown = false;
				$(self.cus).prefixedCSS('transition','-webkit-transform .5s linear');
				$(self.cus).prefixedCSS('transform',self.getTransform(-self.initialIncilination));
				self.upperAlreadyMoving = false;
				return;
			}
			if(speed > .5 && self.hasPrevNews()){
				// $(self.nextUpperSelector).css({"display":"none"});
				self.dropDownComplete('lower');
				return
			}
			if( dy < self.maxMoveOffset || !self.hasPrevNews()) {
				self.dropDown = false;
				$(self.cls).prefixedCSS('transition','-webkit-transform .5s linear');
				$(self.cls).prefixedCSS('transform',self.getTransform(self.initialIncilination));
				self.lowerAlreadyMoving = false;
				return;
			}
			
			// $(self.nextUpperSelector).css({"display":"none"});
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
		this.dropDown = false;
		var that = this;
		if(that.dropInProgress) {
			return
		}
		that.dropInProgress = true;
		if(direction == 'upper' && that.hasNextNews()){
			$(that.uls).css({"z-index":"3"});
			var time = FlipBoard.getTime($(this.cus));
			$(this.cus).prefixedCSS('transition','-webkit-transform '+time+'s linear');
			$(this.cus).one($.domPrefixed("TransitionEnd"),function(){
				$(that.cus).prefixedCSS('transition','none');
				$(that.cus).unbind($.domPrefixed('TransitionEnd'));
				$(that.cus).prefixedCSS('transform',that.getTransform(-that.initialIncilination)).css({'z-index':'1'});
				$(that.nus).css({'z-index':'2'});
				$(that.uls).css({"visibility":"visible"}).offset();

				$(that.uls).prefixedCSS('transition','-webkit-transform .5s linear');
				$(that.nls).html($(that.cls).html());
				$(that.lus).html($(that.cus).html());	
				$(that.uls).one($.domPrefixed("TransitionEnd"),function(){

					$(that.uls).prefixedCSS('transition','none');
					$(that.uls).unbind($.domPrefixed('TransitionEnd'));

					//writing new hack
					var temp1 = that.cls;
					that.cls = that.uls;
					that.uls = temp1;

					// swapVar(that.cls, that.uls);

					//setTimeout(function(){
						$(that.uls).css({'z-index':'1'});
						$(that.uls).prefixedCSS('transition','none');
					  $(that.uls).prefixedCSS('transform',that.getTransform(90));
					  setTimeout(function(){
					  	$(that.cls).css({"z-index":"2"});
					  },100);
					 	var chNews = that.getNextNews();
						that.upperAlreadyMoving = false;
						that.dropInProgress = false;
						if(chNews){
							that.lowerTemplateFunction($(that.uls), chNews.lower);
							that.upperTemplateFunction($(that.cus),chNews.upper);
						}else{
							$(that.cus).html("");
						}
						var temp = that.cus;
						that.cus = that.nus;
						that.nus = temp;
						// swapVar(that.cus, that.nus);
					//},0);	
				});			
				$(that.uls).prefixedCSS('transform',that.getTransform(0));
			});
			$(this.cus).prefixedCSS('transform',that.getTransform(-90));
		}else if(direction=="lower" && that.hasPrevNews()){
			// $(that.lowerUpperSelector).css({'z-index':'3'});
			var time = FlipBoard.getTime($(this.cls));
			$(this.cls).prefixedCSS('transition','-webkit-transform '+time+'s linear');
			$(this.cls).one($.domPrefixed("TransitionEnd"),function(){
				
				$(that.cls).prefixedCSS('transition','none');
				$(that.cls).unbind($.domPrefixed('TransitionEnd'));
				$(that.cls).prefixedCSS('transform',that.getTransform(that.initialIncilination)).css({'z-index':'1'});
				$(that.nls).css({'z-index':'2'});
				$(that.lus).css({'visibility':'visible','z-index':'3'}).offset();
				$(that.lus).prefixedCSS('transition','-webkit-transform .5s linear');
				$(that.nus).html($(that.cus).html());
				$(that.uls).html($(that.cls).html());
				
				$(that.lus).one($.domPrefixed('TransitionEnd'),function(){
					// $(that.currentUpperSelector).html($(that.lowerUpperSelector).html());
					$(that.lus).prefixedCSS('transition','none');
					$(that.lus).unbind('TransitionEnd');

					//writing new hack
					var temp1 = that.cus;
					that.cus = that.lus;
					that.lus = temp1;
						// swapVar(that.cus, that.lus);
						$(that.lus).css({'z-index':'1'});
						$(that.lus).prefixedCSS('transition','none');
						$(that.lus).prefixedCSS('transform',that.getTransform(-90)).css({'z-index':'1'});
						
						$(that.cus).css({"z-index":"2"});
						
						that.lowerAlreadyMoving = false;
						that.dropInProgress = false;
						var chNews = that.getPrevNews();
						if(chNews){
							that.upperTemplateFunction($(that.lus),chNews.upper);
							that.lowerTemplateFunction($(that.cls),chNews.lower);
						}else{
							$(that.cls).html("");
						}
						var temp = that.cls;
						that.cls = that.nls;
						that.nls = temp;
						// swapVar(that.cls, that.nls);
					
				});
				$(that.lus).prefixedCSS('transform',that.getTransform(-that.initialIncilination));
			});
			$(this.cls).prefixedCSS('transform',this.getTransform(90));
		}else{
			that.dropInProgress = false;
		}
	}

	FlipBoard.prototype.insertNews = function(order, content){
		switch (order)
		{
			case "current":
				this.upperTemplateFunction($(this.cus),content.upper);
				this.lowerTemplateFunction($(this.cls),content.lower);
				break;
			case "next":
				this.upperTemplateFunction($(this.nus),content.upper);
				this.lowerTemplateFunction($(this.uls),content.lower);
				break
			case "prev":
				this.upperTemplateFunction($(this.nls),content.lower);
				this.lowerTemplateFunction($(this.lus),content.upper);
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
	}

	window.FlipBoard = FlipBoard;



	var Modernizr = {};
	Modernizr._prefixes = ["","-webkit-","-moz-","-ms-","-o-",""];
	Modernizr._domPrefixes= ["webkit", "moz", "o", "ms"];
	Modernizr.prefixed = function(property) {
		// TODO: find a better solution (use original Modernizr function)
		// used Webkit as it is used in webkit browsers
		// also it is being used only for 'transform' in this file currenly
		return 'Webkit' + property[0].toUpperCase() + property.slice(1);
	}

	window.Modernizr = Modernizr;


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


})(window, $);



