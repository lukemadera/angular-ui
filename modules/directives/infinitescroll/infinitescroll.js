/**
@todo
- remove jQuery dependency

Uses one array and start / end indices (cursor) to set a combination of DOM elements, javascript data, and backend (AJAX) data to handle paging/infinite scroll loading of content (i.e. a list of objects)
	- handles paging / loading more when scroll to bottom
	- can be used with a backend lookup call to load more results (if "loadMore" attr/scope function is passed in)
		- loadMore function is called when have less than full results among current items stored in javascript, which happens 1 way:
			1. when scroll to end of page / load more results
			
NOTE: for jQuery animate, switched all $(window).animate to $('body, html').animate since was getting errors.. see this post:
http://stackoverflow.com/questions/10846609/ownerdocument-error-when-using-jquerys-scrolltop-animate-functions

Scrolling functions (different ways to scroll the page / div/element)
1. 'scrollTo('
2. '.scrollTop =' (or '.scrollTop=' )
3. '.animate('

//TOC
10. add scroll handle to load more
0.5. init
0.75. resetItems
1. setItems
1.5. setItemsViewCursor
2. scrollToMiddle
2.1. scrollAnimate
5. $scope.$watch('items',..
5.5. $scope.$on('uiInfinitescrollReInit',..
5.55. $scope.$on('uiInfinitescrollRefresh',..
5.6. $scope.$on('uiInfinitescrollLoadMore',..
6. $scope.loadMoreDir
6.5. changePage
7. getMoreItems
8. addLoadMoreItems
9. checkForScrollBar

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	@param {Array} items Initial items to use (if any)
	@param {Array} itemsView Placeholder for final items to display in DOM
	@param {Object} opts
		@param {Object} cursors of start and end indices that tell where items are in the scheme of the entire (full) list so can handle loading more to start and/or end. A second object with 
			@param {Object} items
				@param {Number} start
				@param {Number} end
			@param {Object} itemsView
				@param {Number} current of what item to start on - this will correspond to the current page and then the start and end will be formed as 1 pageSize forward and 1 pageSize backward
		@param {String} scrollId of id for element to watch scrolling on (instead of using window/full page scroll bar OR the ui-infinitescroll-content element built in this directive as the default scroll div)
		@param {String} [instId] Unique id for this instance of the directive. Used for calling events (i.e. for reInit) to avoid acting on ALL directives.
		@param {Number} [alwaysShowLoadMorePrevText =0] 1 to show load more text/button even if scroll load and have scrollbar
		@param {Number} [alwaysShowLoadMoreNextText =0] 1 to show load more text/button even if scroll load and have scrollbar
		@param {Number} [neverShowLoadMorePrevText =0] 1 to NOT show load more text/button even if scroll load and no scrollbar
		@param {Number} [neverShowLoadMoreNextText =0] 1 to NOT show load more text/button even if scroll load and no scrollbar
	@param {Function} loadMore Function to call to load more results (this should update $scope.items, which will then update in the directive via $watch). OR '0' if don't have loadMore function at all

attrs
	@param {Number} [scrollLoad =0] 1 to do paging via scrolling as opposed to with "load more" button to click to load more. NOTE: if set, this you MUST either set pageScroll to 1 OR pass in a scrollId in opts.scrollId scope variable
	@param {Number} [pageScroll =0] 1 to do paging via scrolling for entire window as opposed to a specific div (good for mobile / touch screens where only 1 scroll bar works well)
	@param {Number} [scrollBuffer =50] How much space from top or bottom to start switching the page
	@param {Number} [hasScrollbarBuffer =50] Number of pixels where if the scroll bar is just barely there and can only scroll less than this amount, the prev/next load more buttons will still show (to ensure do not get "stuck" where there's no button but can't scroll enough to trigger loading more)
	@param {Number} [pageSize =10] How many results to show at a time (will load more in increments of pageSize as scroll down / click "more"). NOTE: will show TWO pages at a time - so if want to show 10 TOTAL items, make pageSize be 5.
	@param {Number} [loadMorePageSize =20] How many results to load at a time - must be at least as large as pageSize (and typically should be at least 2 times as big as page size?? maybe not? just need to ensure never have to AJAX twice to display 1 page)
	@param {Number} [noStopLoadMore =0] 1 to not set noMoreLoadMoreItems prev & next to true if don't have enough results returned from load more
	@param {Number} [negativeLoad=0] 1 to try to load more even if at 0 cursor
	@param {Number} [animateScroll=0] 1 to animate when moving back to middle after load more from top or bottom
	@param {Number} [animateScrollDuration=1000] Number of milliseconds for scroll duration
	@param {Number} [itemHeight=0] Number of pixels for an item (if specified, this will keep the current item in the same spot after loading more - otherwise it will go to the middle after loading). NOTE this means ALL items must be the EXACT same height if you want an exact position match!
	@param {Number} [animateAfterItems=0] Number of items to slow pan through (to indicate to user that something has changed) AFTER jump to middle, etc. NOTE: this must be less than half of pageSize (if it's not, it will be cut to 1/4 of page size) otherwise it will cause loading of next pages leading to infinite auto scrolling through ALL items!
	@param {Number} [animateAfterDuration=1000] Milliseconds for how long animation is for the after items animate
	@param {String} [noMoreResultsText =No More Results!] What to display when have no more items to load (i.e. at very bottom)
	@param {String} [loadMorePreviousText =Load More] What to display on TOP to click to load more items
	@param {String} [loadMoreNextText =Load More] What to display on BOTTOM to click to load more items
	@param {Number} [minItemsToShow =0] If set, will try to ensure at least this many items are visible - specifically, on initial load, if have previous items and not enough future/current items, will load some previous items to fill up to this amount.


EXAMPLE usage:
Events:
$scope.$broadcast('uiInfinitescrollReInit', {'instId':$scope.opts.instId});
$scope.$broadcast('uiInfinitescrollLoadMore', {'instId':$scope.opts.instId, 'type':'prev'});

@usage 1 - defaults
partial / html:
	<div ui-infinitescroll items='usersList' items-view='users' load-more='loadMore' opts='scrollOpts'>
		<!-- custom display code to ng-repeat and display the results (items) goes below -->
		<div class='friends-user' ng-repeat='user in users'>
			{{user.name}}
		</div>
		<!-- end: custom display code -->
	</div>

controller / js:
	$scope.users =[];
	$scope.usersList =[];
	$scope.scrollOpts ={};
	
	//handle load more (callbacks)
	var itemsMore =[];
	for(var ii=0; ii<100; ii++) {
		itemsMore[ii] ={'_id':(ii+1), 'name':(ii+1)+'. Item #'+(ii+1)};
	}
	
	// @param {Object} params
		// @param {Number} cursor Where to load from
		// @param {Number} loadMorePageSize How many to return
		// @param {String} searchText The string of text that was searched
	// @param {Function} callback Function to pass the results back to - takes the following arguments:
		// @param {Array} results The new results to add in
		// @param {Object} [params]
	$scope.loadMore =function(params, callback) {
		var results =itemsMore.slice(params.cursor, (params.cursor+params.loadMorePageSize));
		callback(results, {});
	};

	
@usage 2 - page scrolling with negative loading (i.e. starting toward the end of a list then scrolling up to see previous entries)
partial / html:
	<div ui-infinitescroll items='usersList' items-view='users' load-more='loadMore' opts='scrollOpts' page-size='40' negative-load='1' scroll-load='1' page-scroll='1'>
		<!-- custom display code to ng-repeat and display the results (items) goes below -->
		<div class='friends-user' ng-repeat='user in users'>
			{{user.name}}
		</div>
		<!-- end: custom display code -->
	</div>

controller / js:
	$scope.scrollOpts ={};
	$scope.usersList =[];
	$scope.users =[];
	
	//handle load more (callbacks)
	var totItems =1000;
	var itemsMore =[];
	for(var ii=0; ii<totItems; ii++) {
		itemsMore[ii] ={'_id':(ii+1), 'name':(ii+1)+'. Item #'+(ii+1)};
	}
	//var offset =Math.floor(totItems/2);
	var offset =totItems-100;
	
	// @param {Object} params
		// @param {Number} cursor Where to load from
		// @param {Number} loadMorePageSize How many to return
		// @param {String} searchText The string of text that was searched
	// @param {Function} callback Function to pass the results back to - takes the following arguments:
		// @param {Array} results The new results to add in
		// @param {Object} [params]
	$scope.loadMore =function(params, callback) {
		var results =itemsMore.slice(offset+params.cursor, (offset+params.cursor+params.loadMorePageSize));
		callback(results, {});
	};

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiInfinitescroll', ['ui.config', '$timeout', 'uiInfinitescrollData', function (uiConfig, $timeout, uiInfinitescrollData) {
  return {
		restrict: 'A',
		transclude: true,
		scope: {
			items: '=',
			itemsView: '=',
			opts:'=',
			loadMore:'&?'
		},

		compile: function(element, attrs) {
			var defaults ={'pageSize':10, 'scrollLoad':'0', 'loadMorePageSize':20, 'pageScroll':0, 'scrollBuffer':50, 'scrollBufferPercent':33, 'noStopLoadMore':0, 'negativeLoad':0, 'animateLoad':0, 'animateScrollDuration':1000, 'itemHeight':0, 'animateAfterItems':0, 'animateAfterDuration':1000, 'noMoreResultsText':'No More Results!', 'loadMorePreviousText':'Load More', 'loadMoreNextText':'Load More', 'minItemsToShow':0, 'hasScrollbarBuffer':50 };
			for(var xx in defaults) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			//convert to int
			var attrsToInt =['pageSize', 'loadMorePageSize', 'scrollLoad', 'scrollBuffer', 'pageScroll', 'noStopLoadMore', 'negativeLoad', 'animateLoad', 'animateScrollDuration', 'itemHeight', 'animateAfterItems', 'animateAfterDuration', 'minItemsToShow', 'hasScrollbarBuffer'];
			for(var ii=0; ii<attrsToInt.length; ii++) {
				attrs[attrsToInt[ii]] =parseInt(attrs[attrsToInt[ii]], 10);
			}
			/*
			attrs.pageSize =parseInt(attrs.pageSize, 10);
			attrs.loadMorePageSize =parseInt(attrs.loadMorePageSize, 10);
			attrs.scrollLoad =parseInt(attrs.scrollLoad, 10);
			attrs.scrollBuffer =parseInt(attrs.scrollBuffer, 10);
			attrs.pageScroll =parseInt(attrs.pageScroll, 10);
			attrs.noStopLoadMore =parseInt(attrs.noStopLoadMore, 10);
			*/
			//ensure loadMorePageSize is at least as large as pageSize
			if(attrs.loadMorePageSize <attrs.pageSize) {
				attrs.loadMorePageSize =attrs.pageSize;
			}
			//ensure animateAfterItems is less than pageSize (otherwise will have infinite auto scrolling since the animate will trigger loading the next page!
			if(attrs.animateAfterItems >=(Math.floor(attrs.pageSize/2))) {
				attrs.animateAfterItems =Math.floor(attrs.pageSize/4);
			}
			// console.log('attrs.animateAfterItems: '+attrs.animateAfterItems);
			
			if(attrs.id ===undefined) {
				attrs.id ="uiInfinitescroll"+Math.random().toString(36).substring(7);
			}
			var id1 =attrs.id;
			attrs.ids ={
				'input':id1+"Input",
				'contentBottom':id1+"ContentBottom",
				'inputBelow':id1+"InputBelow",
				'scrollContent':id1+"ScrollContent"
			};
			
			var html="<div class='ui-infinitescroll'>"+
				"<div class='ui-infinitescroll-top'>"+
					//"<div style='position:fixed; z-index:9999; max-width:600px; top:20px; background-color:orange;'>page: {{page}} cursors: items.start: {{opts.cursors.items.start}} items.end: {{opts.cursors.items.end}} itemsView.start: {{opts.cursors.itemsView.start}} itemsView.end: {{opts.cursors.itemsView.end}} itemsView.current: {{opts.cursors.itemsView.current}} negative: {{opts.cursors.negative}} items.length: {{items.length}}</div>"+		//TESTING
					// "<div style='position:fixed; z-index:9999; max-width:600px; top:20px; background-color:orange;'>page: {{page}} cursors: items.start: {{opts.cursors.items.start}} items.end: {{opts.cursors.items.end}} itemsView.start: {{opts.cursors.itemsView.start}} itemsView.end: {{opts.cursors.itemsView.end}} cursorsSave.start: {{cursorsSave.start}} cursorsSave.end: {{cursorsSave.end}}</div>"+		//TESTING
					//"<div style='position:absolute; z-index:10; right:0; top:60px; background-color:orange;'>hasScrollbar: {{hasScrollbar}} | scrollLoad: {{scrollLoad}}</div>"+		//TESTING
					//"<div ng-show='itemsFiltered.length <1'>No matches</div>"+
					//it's important to NOT show any loading stuff until AFTER the check for the scrollbar has been done - since showing text increases/changes the height and when they disappear it could then have no scrollbar anymore!
					"<div ng-hide='opts.neverShowLoadMorePrevText || !trigs.scrollbarChecked || trigs.loading || (noMoreLoadMoreItems.prev && opts.cursors.itemsView.start <=opts.cursors.items.start) || (opts.cursors.itemsView.start <=0 && !negativeLoad) || (!opts.alwaysShowLoadMorePrevText && scrollLoad && hasScrollbarBuffer)' class='ui-infinitescroll-more' ng-click='loadMoreDir({\"prev\":true})'>"+attrs.loadMorePreviousText+"</div>"+
					//"<div ng-show='noMoreLoadMoreItemsPrev && queuedItemsPrev.length <1' class='ui-infinitescroll-no-more'>No More Results!</div>"+
				"</div>"+
				"<div id='"+attrs.ids.scrollContent+"' class='ui-infinitescroll-content' ng-transclude></div>"+
				"<div id='"+attrs.ids.contentBottom+"'>"+
					"<div ng-hide='opts.neverShowLoadMoreNextText || !trigs.scrollbarChecked || trigs.loading || (noMoreLoadMoreItems.next && opts.cursors.itemsView.end >=opts.cursors.items.end) || (!opts.alwaysShowLoadMoreNextText && scrollLoad && hasScrollbarBuffer)' class='ui-infinitescroll-more' ng-click='loadMoreDir({})'>"+attrs.loadMoreNextText+"</div>"+
					//"<div>page: {{page}} cursors: items.start: {{opts.cursors.items.start}} items.end: {{opts.cursors.items.end}} itemsView.start: {{opts.cursors.itemsView.start}} itemsView.end: {{opts.cursors.itemsView.end}} itemsView.current: {{opts.cursors.itemsView.current}} items.length: {{items.length}}</div>"+		//TESTING
					//"<div>scrollInfo: %fromTop: {{scrollInfo.percentTop}} %fromBot: {{scrollInfo.percentBottom}} pos: {{scrollInfo.scrollPos}} diff: {{scrollInfo.diff}} height: {{scrollInfo.scrollHeight}} viewportHeight: {{scrollInfo.viewportHeight}}</div>"+		//TESTING
					"<div ng-show='trigs.scrollbarChecked && noMoreLoadMoreItems.next && opts.cursors.items.end <= opts.cursors.itemsView.end' class='ui-infinitescroll-no-more'>"+attrs.noMoreResultsText+"</div>"+
				"</div>"+
			"</div>";
				
			element.replaceWith(html);
		},
		
		controller: function($scope, $element, $attrs) {
			var defaultsOpts ={
				'cursors':{
					'items':{
						'start':0,
						'end':$scope.items.length
					},
					'itemsView':{
						'current':0
					}
				},
				'scrollId':false,
				// 'instId':$attrs.id,
				alwaysShowLoadMorePrevText: 0,
				alwaysShowLoadMoreNextText: 0,
				neverShowLoadMorePrevText: 0,
				neverShowLoadMoreNextText: 0
			};
			if($scope.opts ===undefined) {
				$scope.opts ={};
			}
			for(var xx in defaultsOpts) {
				if($scope.opts[xx] ===undefined) {
					$scope.opts[xx] =defaultsOpts[xx];
				}
			}
			
			$scope.cursorsSave ={
				'start': 0,
				'end': 0
			};
			
			var scrollId =$attrs.ids.scrollContent;		//default
			if($scope.opts.scrollId) {
				scrollId =$scope.opts.scrollId;
			}
			
			$scope.negativeLoad =$attrs.negativeLoad;		//copy into scope
			//to allow / handle loading items below "0". The logic inside this directive (and arrays) can't/won't go below 0 so we'll just keep it at 0 and use this to keep track of what the "negative offset" is
			$scope.opts.cursors.negative =0;
			//$scope.cursorNegative =0;
			$scope.trigs ={
				loading:true,
				scrollbarChecked: false
			};
			//$scope.items =[];
			
			//boolean that will be set to true if (backend) has no more items (i.e. we're at the end of the list and can't load any more)
			$scope.noMoreLoadMoreItems ={
				'prev':false,
				'next':false
			};
			
			$scope.scrollLoad =$attrs.scrollLoad;
			
			//if scroll load style, ensure attrs.ids.scrollContent has scrollable styles (height & overflow)
			if($scope.scrollLoad) {
				if(!$attrs.pageScroll) {
					var ele1 =document.getElementById(scrollId);
					eleAng =angular.element(ele1);
					var height1 =eleAng.css('height');
					var overflow1 =eleAng.css('overflow');
					if(!height1 || !overflow1) {
						eleAng.addClass('ui-infinite-content-scroll');
					}
				}
				
				$scope.hasScrollbar =false;		//init
				$scope.hasScrollbarBuffer =false;
			}
			
			var timeoutInfo ={
				'scrolling':{
					'trig':false,
					'delay':750
				}
			};
			
			var triggers ={
				skipWatch: false		//to avoid triggering $watch items reset on load more
			};
			
			//init / set this instance in the service (so can check for 'exists', 'destroy', etc. later). Need to do this immediately (i.e. NOT after timeout)
			uiInfinitescrollData.initInst($attrs.id, {'attrs':$attrs, 'timeoutInfo':timeoutInfo});
			
			/**
			add scroll handle to load more
			@toc 10.
			*/
			if($attrs.scrollLoad) {
				//don't add right away (otherwise the initial load can duplicate load and jump around - need to let it initialize first)
				$timeout(function() {
					// console.log('uiInfinitescroll if($attrs.scrollLoad) { timeout callback');		//TESTING
					if(uiInfinitescrollData.exists($attrs.id, {})) {
						// console.log('uiInfinitescroll if($attrs.scrollLoad) { timeout callback exists');		//TESTING
					
						if($attrs.pageScroll) {
							if(1) {
								uiInfinitescrollData.addScrollEvt($attrs.id, {'attrs':$attrs, 'timeoutInfo':timeoutInfo, 'callback':function() {
									//console.log('window onscroll: id: '+$attrs.ids.scrollContent+' element: '+document.getElementById($attrs.ids.scrollContent));
									$timeout.cancel(timeoutInfo.scrolling.trig);
									timeoutInfo.scrolling.trig =$timeout(function() {
										//console.log('uiInfinitescroll timeout scrolling loading');
										var buffer =$attrs.scrollBuffer;
										var scrollPos =$(window).scrollTop();
										var oldScrollPos =uiInfinitescrollData.data[$attrs.id].scrollPos;
										// console.log('scrollPos: old: '+uiInfinitescrollData.data[$attrs.id].scrollPos+' new: '+scrollPos);		//TESTING
										uiInfinitescrollData.data[$attrs.id].scrollPos =scrollPos;		//update for next time
										if(oldScrollPos !==-1) {		//don't go the first time since it falsely triggers a scroll..
											var scrollHeight =$(document).height();
											var viewportHeight =$(window).height();
											//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+viewportHeight);
											var percentTop =scrollPos /scrollHeight *100;
											var percentBottom =(scrollPos +viewportHeight) /scrollHeight *100;
											$scope.scrollInfo ={
												'scrollPos':scrollPos,
												'scrollHeight':scrollHeight,
												'viewportHeight':viewportHeight,
												'diff':(scrollHeight-viewportHeight-buffer),
												'percentTop':percentTop,
												'percentBottom':percentBottom
											};
											//if(scrollPos >=(scrollHeight-viewportHeight-buffer) || (percentBottom > (100-$attrs.scrollBufferPercent)) ) {
											if(scrollPos >5 && scrollPos >=(scrollHeight-viewportHeight-buffer)) {		//don't load more if 0 scrollPos (this specificlly fixes an initial double load issue)
												$scope.loadMoreDir({'noDelay':true, 'next':true});
											}
											//prev version
											//if(scrollPos <=buffer || (percentTop <$attrs.scrollBufferPercent) ) {
											if(scrollPos <=buffer ) {
												$scope.loadMoreDir({'noDelay':true, 'prev':true});
											}
										}
									}, timeoutInfo.scrolling.delay);
								}
								});
							}
							else {
							window.onscroll =function() {
								timeoutInfo.scrolling.trig =$timeout(function() {
									var buffer =$attrs.scrollBuffer;
									var scrollPos =$(window).scrollTop();
									var scrollHeight =$(document).height();
									var viewportHeight =$(window).height();
									var percentTop =scrollPos /scrollHeight *100;
									var percentBottom =(scrollPos +viewportHeight) /scrollHeight *100;
									$scope.scrollInfo ={
										'scrollPos':scrollPos,
										'scrollHeight':scrollHeight,
										'viewportHeight':viewportHeight,
										'diff':(scrollHeight-viewportHeight-buffer),
										'percentTop':percentTop,
										'percentBottom':percentBottom
									};
									//if(scrollPos >=(scrollHeight-viewportHeight-buffer) || (percentBottom > (100-$attrs.scrollBufferPercent)) ) {
									if(scrollPos >5 && scrollPos >=(scrollHeight-viewportHeight-buffer)) {		//don't load more if 0 scrollPos (this specificlly fixes an initial double load issue)
										$scope.loadMoreDir({'noDelay':true, 'next':true});
									}
									//prev version
									//if(scrollPos <=buffer || (percentTop <$attrs.scrollBufferPercent) ) {
									if(scrollPos <=buffer ) {
										$scope.loadMoreDir({'noDelay':true, 'prev':true});
									}
								}, timeoutInfo.scrolling.delay);
							};
							}
						}
						else {
							document.getElementById(scrollId).onscroll =function() {
								$timeout.cancel(timeoutInfo.scrolling.trig);
								timeoutInfo.scrolling.trig =$timeout(function() {
									var buffer =$attrs.scrollBuffer;
									var ele =document.getElementById(scrollId);
									var scrollPos =ele.scrollTop;
									var scrollHeight =ele.scrollHeight;
									//var viewportHeight =$(ele).height();
									var viewportHeight =ele.clientHeight;
									if(scrollPos >=(scrollHeight-viewportHeight-buffer)) {
										$scope.loadMoreDir({'noDelay':true, 'next':true});
									}
									//prev version
									if(scrollPos <=buffer) {
										$scope.loadMoreDir({'noDelay':true, 'prev':true});
									}
								}, timeoutInfo.scrolling.delay);
							};
						}
					}
				}, 750);
			}
			
			/**
			@toc 0.5.
			@method init
			*/
			function init(params) {
				$scope.trigs.loading =true;
				$scope.trigs.scrollbarChecked =false;
				$scope.opts.cursors.itemsView.start =$scope.opts.cursors.itemsView.current -$attrs.pageSize;
				$scope.opts.cursors.itemsView.end =$scope.opts.cursors.itemsView.current +$attrs.pageSize;
				//save current cursor positions so can calculate change later
				$scope.cursorsSave.start =$scope.opts.cursors.itemsView.start;
				$scope.cursorsSave.end =$scope.opts.cursors.itemsView.end;
				setItemsViewCursor({});
				
				setItems({});
				if($scope.items.length <$attrs.pageSize*2) {		//load more externally if don't have enough
					$scope.trigs.loading =true;
					$scope.loadMoreDir({});
				}
			}
			
			/**
			@toc 0.75.
			*/
			function resetItems(params) {
				// console.log('uiInfinitescroll resetItems');		//TESTING
				if(uiInfinitescrollData.exists($attrs.id, {})) {
					// console.log('uiInfinitescroll resetItems exists');		//TESTING
					//reset cursors
					$scope.opts.cursors.items.start =0;
					$scope.opts.cursors.items.end =$scope.items.length;
					// $scope.opts.cursors.itemsView.start =0;
					// $scope.opts.cursors.itemsView.end =0;
					$scope.opts.cursors.itemsView.current =0;
					$scope.opts.cursors.negative =0;
					
					//update / reset triggers
					$scope.trigs.loading =true;
					$scope.trigs.scrollbarChecked =false;
					
					$scope.noMoreLoadMoreItems.prev =false;
					$scope.noMoreLoadMoreItems.next =false;
					
					timeoutInfo.scrolling.trig =false;
					
					triggers.skipWatch =false;
					
					//update / reset scroll data
					uiInfinitescrollData.data[$attrs.id].scrollPos =-1;
					
					//update scrolling
					checkForScrollBar({});
					if($attrs.pageScroll) {
						window.scrollTo(0, 0);
					}
					else {
						document.getElementById(scrollId).scrollTop =0;
					}
				}
			}
			
			/**
			Updates viewable (DOM) items (sets the range)
			@toc 1.
			@param params
				@param {Number} [cursorViewStart] If set, will over-ride page and just go to this item. cursor view end will be set to this plus 1 page size
			*/
			function setItems(params) {
				// console.log('uiInfinitescroll setItems');		//TESTING
				if(uiInfinitescrollData.exists($attrs.id, {})) {
					// console.log('cursorsSave: start: '+$scope.cursorsSave.start+' end: '+$scope.cursorsSave.end+' itemsView: start: '+$scope.opts.cursors.itemsView.start+' end: '+$scope.opts.cursors.itemsView.end);		//TESTING
					// console.log('uiInfinitescroll setItems exists');		//TESTING
					var diff =false, height1;
					var ppSend ={};
					if($attrs.itemHeight) {		//save current cursor positions so can calculate change later
						height1 =$attrs.itemHeight;
					}
					
					if(params.cursorViewStart !==undefined) {
						$scope.opts.cursors.itemsView.start =params.cursorViewStart;
						$scope.opts.cursors.itemsView.end =$scope.opts.cursors.itemsView.start +$attrs.pageSize *2;
						if($scope.opts.cursors.itemsView.end >$scope.items.length) {
							$scope.opts.cursors.itemsView.end =$scope.items.length;
						}
						//ensure enough items
						if(($scope.opts.cursors.itemsView.end - $scope.opts.cursors.itemsView.start) <=$attrs.minItemsToShow) {
							$scope.opts.cursors.itemsView.start =$scope.opts.cursors.itemsView.end -$attrs.minItemsToShow;
							if($scope.opts.cursors.itemsView.start <0) {
								$scope.opts.cursors.itemsView.start =0;
							}
						}
					}
					else {
						$scope.opts.cursors.itemsView.end =$scope.opts.cursors.itemsView.start +$attrs.pageSize *2;
						setItemsViewCursor({});
					}
					$scope.itemsView =$scope.items.slice($scope.opts.cursors.itemsView.start, $scope.opts.cursors.itemsView.end);
					// console.log('$scope.opts.cursors.itemsView.start: '+$scope.opts.cursors.itemsView.start);		//TESTING
					
					if($attrs.itemHeight) {
						if(params.prev) {
							ppSend.prev =true;
							if($scope.opts.cursors.itemsView.start ===0) {
								diff =$scope.cursorsSave.start -$scope.opts.cursors.itemsView.start;
							}
						}
						else {
							ppSend.prev =false;
							diff =$scope.opts.cursors.itemsView.end -$scope.cursorsSave.end;
						}
						if(diff) {
							var diffHeight =diff*height1;
							if(diffHeight <0) {
								diffHeight =diffHeight *-1;
							}
							//alert('diffHeight: '+diffHeight);
							ppSend.diffHeight =diffHeight;
						}
					}
					
					if($scope.itemsView.length >=$attrs.pageSize) {		//only scroll if have a full page of items
						scrollToMiddle(ppSend);
					}
					checkForScrollBar({});
					$scope.trigs.loading =false;		//reset
					
					//save current cursor positions so can calculate change later
					$scope.cursorsSave.start =$scope.opts.cursors.itemsView.start;
					$scope.cursorsSave.end =$scope.opts.cursors.itemsView.end;
				}
			}
			
			/**
			@toc 1.5.
			*/
			function setItemsViewCursor(params) {
				if($scope.opts.cursors.itemsView.start <0) {
					$scope.opts.cursors.itemsView.start =0;
				}
				if($scope.opts.cursors.itemsView.end >$scope.items.length) {
					$scope.opts.cursors.itemsView.end =$scope.items.length;
				}
			}
			
			/**
			@toc 2.
			@param {Object} params
				@param {Boolean} [prev] True if loading a previous page (i.e. scrolling up)
				@param {Number} [diffHeight] Pixels of where to scroll to (instead of just going to middle)
				@param {Boolean} [alreadyTimedOut] true to avoid infinite loop if already waited for previous items to load
				@param {Number} [posProportion] 0 to 1 for where to scroll to (0.5 would scroll to middle)
			*/
			function scrollToMiddle(params) {
				// console.log('uiInfinitescroll scrollToMiddle');		//TESTING
				if(uiInfinitescrollData.exists($attrs.id, {})) {
					// console.log('uiInfinitescroll scrollToMiddle exists');		//TESTING
					var scrollPos, scrollHeight, viewportHeight, middle, newMiddle, posProportion;
					
					posProportion =0.5;
					if(params.posProportion) {
						posProportion =params.posProportion;
					}
					
					if($attrs.pageScroll) {
						if(0) {		//@todo - need a better solution than this.. see below
						//if($scope.opts.cursors.itemsView.start ==0) {		//if at top, just go to top (specifically this addresses a double initial load issue that causes the first time to show halfway down rather than at the top - could probably find a better fix - i.e. also check what the last cursor was at?)
							if($attrs.animateScroll) {
								scrollAnimate(false, 0, {duration:$attrs.animateScrollDuration}, {});
							}
							else {
								window.scrollTo(0, 0);
							}
						}
						else {
							scrollPos =$(window).scrollTop();
							scrollHeight =$(document).height();
							viewportHeight =$(window).height();
							// middle =Math.floor((scrollHeight/2) -viewportHeight/2);
							middle =Math.floor((scrollHeight*posProportion) -viewportHeight/2);
							
							if(params.diffHeight) {
								if(params.prev) {
									middle =params.diffHeight;
								}
								else {
									middle =scrollHeight -params.diffHeight -viewportHeight;
								}
							}
							
							//if on first pages without full content, need to wait until content is loaded first (NOTE - theoretically should ALWAYS wait for load content before re-scroll BUT if do, it's a bit jumpy so ONLY do it when necessary - otherwise using old data keeps it smooth as is a workaround..)
							if((params.alreadyTimedOut ===undefined || !params.alreadyTimedOut) && (middle >scrollHeight || scrollHeight <$attrs.itemHeight*$attrs.pageSize*2)) {
								$timeout(function() {
									params.alreadyTimedOut =true;
									scrollToMiddle(params);
								}, 100);
							}
							else {
								if($attrs.animateScroll) {
									scrollAnimate(false, middle, {duration:$attrs.animateScrollDuration}, {});
								}
								else {
									window.scrollTo(0, middle);
								}
								
								if($attrs.animateAfterItems) {
									if(params.prev) {
										newMiddle =middle -$attrs.itemHeight*$attrs.animateAfterItems;
									}
									else {
										newMiddle =middle +$attrs.itemHeight*$attrs.animateAfterItems;
									}
									scrollAnimate(false, newMiddle, {duration:$attrs.animateAfterDuration}, {});
								}
							}
						}
						//console.log('scrollPos: '+$(window).scrollTop());
					}
					else {
						if(0) {		//@todo - need a better solution than this.. see below
						//if($scope.opts.cursors.itemsView.start ==0) {		//if at top, just go to top (specifically this addresses a double initial load issue that causes the first time to show halfway down rather than at the top - could probably find a better fix - i.e. also check what the last cursor was at?)
							if($attrs.animateScroll) {
								scrollAnimate("#"+scrollId, 0, {duration:$attrs.animateScrollDuration}, {});
							}
							else {
								document.getElementById(scrollId).scrollTop =0;
							}
						}
						else {
							var ele =document.getElementById(scrollId);
							scrollPos =ele.scrollTop;
							scrollHeight =ele.scrollHeight;
							//viewportHeight =$(ele).height();
							viewportHeight =ele.clientHeight;
							// middle =Math.floor((scrollHeight/2) -viewportHeight/2);
							middle =Math.floor((scrollHeight*posProportion) -viewportHeight/2);
							
							if(params.diffHeight) {
								if(params.prev) {
									middle =params.diffHeight;
								}
								else {
									//middle =scrollHeight -params.diffHeight +viewportHeight -$attrs.itemHeight;
									//middle =scrollHeight -params.diffHeight -$attrs.itemHeight;
									middle =scrollHeight -params.diffHeight -viewportHeight;
								}
							}
							
							//if on first pages without full content, need to wait until content is loaded first (NOTE - theoretically should ALWAYS wait for load content before re-scroll BUT if do, it's a bit jumpy so ONLY do it when necessary - otherwise using old data keeps it smooth as is a workaround..)
							//console.log('scrollHeight: '+scrollHeight+' 2 pages items height: '+$attrs.itemHeight*$attrs.pageSize*2);
							if((params.alreadyTimedOut ===undefined || !params.alreadyTimedOut) && (middle >scrollHeight || scrollHeight <$attrs.itemHeight*$attrs.pageSize*2)) {
								//console.log('middle: '+middle+' scrollHeight: '+scrollHeight);
								$timeout(function() {
									params.alreadyTimedOut =true;
									scrollToMiddle(params);
								}, 100);
							}
							else {
								if($attrs.animateScroll) {
									scrollAnimate("#"+scrollId, middle, {duration:$attrs.animateScrollDuration}, {});
								}
								else {
									document.getElementById(scrollId).scrollTop =middle;
								}
								
								if($attrs.animateAfterItems) {
									if(params.prev) {
										newMiddle =middle -$attrs.itemHeight*$attrs.animateAfterItems;
									}
									else {
										newMiddle =middle +$attrs.itemHeight*$attrs.animateAfterItems;
									}
									scrollAnimate("#"+scrollId, newMiddle, {duration:$attrs.animateAfterDuration}, {});
								}
							}
						}
						//console.log('scrollPos: '+ele.scrollTop);
					}
				}
			}
			
			/**
			@toc 2.1
			@method scrollAnimate
			@param {String|Boolean} scrollEle the element selector (i.e. '#my-id') to scroll OR false to scroll window/whole page
			@param {Number} scrollTo Pixel top to scroll to
			@param {Object} scrollParams jQuery animate params
				@param {Number} duration
			*/
			function scrollAnimate(scrollEle, scrollTo, scrollParams, params) {
				var defaults ={
					queue: false		//VERY IMPORTANT otherwise they lag and animations happen randomly later (even on different pages when not even viewing the infinitescroll directive anymore if used pageScroll!!!
				};
				scrollParams =angular.extend(defaults, scrollParams);
				if(!scrollEle) {
					//$(window).animate({scrollTop: scrollTo+'px'}, scrollParams);		//ERRORS, need to use 'body, html' instead..
					scrollEle ='body, html';
				}
				$(scrollEle).animate({scrollTop: scrollTo+'px'}, scrollParams);
			}
			
			/**
			Watch for updates on items
			@toc 5.
			@method $scope.$watch('items',..
			*/
			$scope.$watch('items', function(newVal, oldVal) {
				// console.log('$scope.$watch items');
				if(!angular.equals(oldVal, newVal) && !triggers.skipWatch) {		//very important to do this for performance reasons since $watch runs all the time
					// console.log('$scope.$watch items !angular.equals');
					resetItems({});
					init({});
				}
			});
			
			/**
			Used in place of updating $scope.items to have the $watch fire if want to update the directive WITHOUT changing the items (i.e. to change types or backend data to load different items but don't have them yet so need the directive to fire to initiate loadMore)
			@toc 5.5.
			@param {Object} params
				@param {String} instId Identifies the directive to update (only that one will be re-initialized)
			*/
			$scope.$on('uiInfinitescrollReInit', function(evt, params) {
				if($scope.opts.instId !==undefined && params.instId !==undefined && $scope.opts.instId ==params.instId) {		//only update if the correct instance
					//if have items, blank them out; this alone will trigger a reset due to the watch
					if($scope.items.length >0) {
						$scope.items =[];
					}
					else {
						resetItems({});
						init({});
					}
				}
			});
			
			/**
			Used in place of updating $scope.items to have the $watch fire in case it's during a triggers.skipWatch. This is different than uiInfinitescrollReInit in that it will NOT blank out / reset $scope.items.
			@toc 5.55.
			@param {Object} params
				@param {String} instId Identifies the directive to update (only that one will be re-initialized)
			*/
			$scope.$on('uiInfinitescrollRefresh', function(evt, params) {
				if($scope.opts.instId !==undefined && params.instId !==undefined && $scope.opts.instId ==params.instId) {		//only update if the correct instance
					resetItems({});
					init({});
				}
			});
			
			/**
			Used to programmatically load more (prev or next)
			@toc 5.6.
			@param {Object} params
				@param {String} instId Identifies the directive to update (only that one will be re-initialized)
				@param {String} type One of 'prev' or 'next'
			*/
			$scope.$on('uiInfinitescrollLoadMore', function(evt, params) {
				if($scope.opts.instId !==undefined && params.instId !==undefined && $scope.opts.instId ==params.instId) {		//only update if the correct instance
					var params1 ={};
					if(params.type !==undefined && params.type =='prev') {
						params1.prev =true;
					}
					$scope.loadMoreDir(params1);
				}
			});
			
			/**
			Used to programmatically jump to a particular place
			@toc 5.7.
			@param {Object} params
				@param {String} instId Identifies the directive to update (only that one will be re-initialized)
				// @param {Number} cursor The item to scroll to
				@param {Number} [posProportion] 0 to 1 for where to scroll to (0.5 would scroll to middle)
			*/
			$scope.$on('uiInfinitescrollGoTo', function(evt, params) {
				if($scope.opts.instId !==undefined && params.instId !==undefined && $scope.opts.instId ==params.instId) {		//only update if the correct instance
					console.log('uiInfinitescrollGoTo: params: '+JSON.stringify(params));		//TESTING
					scrollToMiddle(params);
				}
			});
			
			/**
			Starts the load more process - checks if need to load more (may already have more items in the existing javascript items array, in which case can just load more internally) and IF need to load more external items, sets a timeout to do so (for performance to avoid rapid firing external calls)
				This is paired with the getMoreItems function below - which handles actually getting the items AFTER the timeout
			@toc 6.
			@param params
				@param {Boolean} [noDelay] True to skip the timeout before loading more (i.e. if coming from scroll, in which case already have waited)
				@param {Boolean} [next]
				@param {Boolean} [prev]
			*/
			$scope.loadMoreDir =function(params) {
				var getMoreItemsTrig =false;
				var minItems;
				if(params.prev) {
					//if have more items left, decrement page & show them
					if(($scope.opts.cursors.items.start ===0 && $scope.opts.cursors.itemsView.start !==0) || $scope.opts.cursors.items.start < ($scope.opts.cursors.itemsView.start -$attrs.pageSize)) {
						$scope.opts.cursors.itemsView.start -=$attrs.pageSize;
						if($scope.opts.cursors.itemsView.start <0) {
							$scope.opts.cursors.itemsView.start =0;
						}
						setItems({'prev':true});
					}
					else {
						getMoreItemsTrig =true;
						//set timeout to get more from backend if function has been given for how to do so
						params.noDelay =true;		//never want to timeout here? Handle that outside this function (should only have on search and on scroll and it's already handled there?)
						getMoreItems({'prev':true});
					}
				}
				else {
					//if have more items left, increment page & show them
					if($scope.opts.cursors.items.end > ($scope.opts.cursors.itemsView.end +$attrs.pageSize) || ($scope.noMoreLoadMoreItems.next && $scope.opts.cursors.items.end >$scope.opts.cursors.itemsView.end) ) {
						if(($scope.opts.cursors.items.end -$scope.opts.cursors.itemsView.end) >$attrs.pageSize) {
							$scope.opts.cursors.itemsView.start +=$attrs.pageSize;
						}
						else {
							$scope.opts.cursors.itemsView.start +=($scope.opts.cursors.items.end -$scope.opts.cursors.itemsView.end);
						}
						minItems =$attrs.pageSize *2;
						if(($scope.opts.cursors.items.end -$scope.opts.cursors.items.start) <minItems) {
							minItems =($scope.opts.cursors.items.end -$scope.opts.cursors.items.start);
						}
						if(($scope.opts.cursors.items.end -$scope.opts.cursors.itemsView.start) <minItems) {
							$scope.opts.cursors.itemsView.start -=minItems;
							if($scope.opts.cursors.itemsView.start <0) {
								$scope.opts.cursors.itemsView.start =0;
							}
						}
						setItems({'next':true});
					}
					else {
						getMoreItemsTrig =true;
						//set timeout to get more from backend if function has been given for how to do so
						params.noDelay =true;		//never want to timeout here? Handle that outside this function (should only have on search and on scroll and it's already handled there?)
						getMoreItems({'next':true});
					}
				}
			};
			
			/**
			Handles loading items from the queue and calling the external loadMore function to pre-fill the queue for the next page (this is the function that runs AFTER the timeout set in $scope.loadMoreDir function)
			If have items in queue, they're added to itemsRaw and then formItems is re-called to re-form filtered items & update display
			@toc 7.
			@param params
				prev
				next
			*/
			function getMoreItems(params) {
				var loadPageSize, cursor;
				if($scope.loadMore !==undefined && $scope.loadMore() !==undefined && typeof($scope.loadMore()) =='function') {		//this is an optional scope attr so don't assume it exists
					var ppTemp ={};
					if(params.prev) {
						ppTemp.prev =true;
						if(($scope.opts.cursors.items.start >0 || $scope.negativeLoad) && !$scope.noMoreLoadMoreItems.prev) {		//only try to load more if have more left to load
							triggers.skipWatch =true;		//prevent $watch from resetting items!
							loadPageSize =$attrs.loadMorePageSize;
							cursor =$scope.opts.cursors.items.start +$scope.opts.cursors.negative -loadPageSize;
							$scope.loadMore()({'cursor':cursor, 'loadMorePageSize':loadPageSize, 'searchText':''}, function(results, ppCustom) {
								addLoadMoreItems(results, ppCustom, ppTemp);
							});
						}
					}
					else {
						ppTemp.next =true;
						if(!$scope.noMoreLoadMoreItems.next) {		//only try to load more if have more left to load
							triggers.skipWatch =true;		//prevent $watch from resetting items!
							loadPageSize =$attrs.loadMorePageSize;
							cursor =$scope.opts.cursors.items.end;
							$scope.loadMore()({'cursor':cursor, 'loadMorePageSize':loadPageSize, 'searchText':''}, function(results, ppCustom) {
								addLoadMoreItems(results, ppCustom, ppTemp);
							});
						}
					}
				}
			}
			
			/**
			This is the callback function that is called from the outer (non-directive) controller with the externally loaded items. These items are added to the queue and the cursor is updated accordingly.
				- Additionally, the noMoreLoadMoreItems trigger is set if the returned results are less than the loadMorePageSize
				- Also, it immediately will load from queue if the current page isn't full yet (if params.partialLoad & params.numToFillCurPage are set)
			@toc 8.
			@param results =array [] of items (will be appended to queue)
			@param ppCustom =params returned from callback
				@param {Number} [numPrevItems] Number of previous items that are mixed in (so can update cursor appropriately) - this is typically for a first load where may want to load some previous items as well as next items
			@param params
				prev {Boolean}
				next {Boolean}
			*/
			function addLoadMoreItems(results, ppCustom, params) {
				var minItems;
				if(results.length >0) {
					if(params.prev) {
						$scope.items =results.concat($scope.items);
						//have more items at beginning so move up by that amount (to get back to the same item we WERE on) and THEN go down 1 page size's worth
						$scope.opts.cursors.itemsView.start =$scope.opts.cursors.itemsView.start +results.length -$attrs.pageSize;
						$scope.cursorsSave.start +=results.length;
						if($scope.opts.cursors.itemsView.start <0) {
							$scope.opts.cursors.itemsView.start =0;
						}
						$scope.opts.cursors.items.start -=results.length;		//don't just add $attrs.loadMorePageSize in case there weren't enough items on the backend (i.e. results could be LESS than this)
						//if negative, reset to 0 and increment opts.cursors.negative
						if($scope.opts.cursors.items.start <0) {
							$scope.opts.cursors.negative -=$scope.opts.cursors.items.start*-1;
							$scope.opts.cursors.items.end += ($scope.opts.cursors.items.start *-1);		//have to push up items.end the same amount we're removing from items.start
							$scope.opts.cursors.items.start =0;
						}
						setItems(params);
					}
					else {
						$scope.items =$scope.items.concat(results);
						$scope.opts.cursors.items.end +=results.length;		//don't just add $attrs.loadMorePageSize in case there weren't enough items on the backend (i.e. results could be LESS than this)
						
						if(results.length >=$attrs.pageSize) {
							$scope.opts.cursors.itemsView.start +=$attrs.pageSize;
						}
						else {
							$scope.opts.cursors.itemsView.start +=results.length;
						}
						minItems =$attrs.pageSize *2;
						if(($scope.opts.cursors.items.end -$scope.opts.cursors.items.start) <minItems) {
							minItems =($scope.opts.cursors.items.end -$scope.opts.cursors.items.start);
						}
						if(($scope.opts.cursors.items.end -$scope.opts.cursors.itemsView.start) <minItems) {
							$scope.opts.cursors.itemsView.start -=minItems;
							if($scope.opts.cursors.itemsView.start <0) {
								$scope.opts.cursors.itemsView.start =0;
							}
						}
						
						if(ppCustom !==undefined && ppCustom.numPrevItems !==undefined && ppCustom.numPrevItems) {
							$scope.opts.cursors.negative -=ppCustom.numPrevItems;
							
							var ppSend ={
								cursorViewStart: ppCustom.numPrevItems
							};
							setItems(ppSend);		//go to specific item
						}
						else {
							setItems(params);
						}
					}
				}
				else {
					if( (params.prev && $scope.opts.cursors.items.start < $scope.opts.cursors.itemsView.start) || (params.next && $scope.opts.cursors.items.end > $scope.opts.cursors.itemsView.end)) {		//display last ones from javascript
						if(params.prev) {
							if(($scope.opts.cursors.itemsView.start -$scope.opts.cursors.items.start) >=$attrs.pageSize) {
								$scope.opts.cursors.itemsView.start -=$attrs.pageSize;
							}
							else {
								$scope.opts.cursors.itemsView.start -=($scope.opts.cursors.itemsView.start -$scope.opts.cursors.items.start);
							}
							if($scope.opts.cursors.itemsView.start <0) {
								$scope.opts.cursors.itemsView.start =0;
							}
						}
						else if(params.next) {
							if(($scope.opts.cursors.items.end -$scope.opts.cursors.itemsView.end) >$attrs.pageSize) {
								$scope.opts.cursors.itemsView.start +=$attrs.pageSize;
							}
							else {
								$scope.opts.cursors.itemsView.start +=($scope.opts.cursors.items.end -$scope.opts.cursors.itemsView.end);
							}
							minItems =$attrs.pageSize *2;
							if(($scope.opts.cursors.items.end -$scope.opts.cursors.items.start) <minItems) {
								minItems =($scope.opts.cursors.items.end -$scope.opts.cursors.items.start);
							}
							if(($scope.opts.cursors.items.end -$scope.opts.cursors.itemsView.start) <minItems) {
								$scope.opts.cursors.itemsView.start -=minItems;
								if($scope.opts.cursors.itemsView.start <0) {
									$scope.opts.cursors.itemsView.start =0;
								}
							}
						}
						setItems(params);
					}
				}
				
				//if don't have enough results, assume backend is done so are out of items
				if(!$attrs.noStopLoadMore) {
				//if(0) {
					if(results.length <$attrs.loadMorePageSize || (params.loadPageSize !==undefined && results.length <params.loadPageSize)) {
						if(params.prev) {
							$scope.noMoreLoadMoreItems.prev =true;
						}
						else {
							$scope.noMoreLoadMoreItems.next =true;
							//2014.10.06 - not sure why this is here but it's causing issues where load more button disappears when it shouldn't..	//2014.10.08 - DO need it for the case where there's 0 prev items
							if(ppCustom !==undefined && ppCustom.numPrevItems !==undefined && ppCustom.numPrevItems ===0) {		//if already loaded previous items, hide prev load more too
								$scope.noMoreLoadMoreItems.prev =true;
							}
						}
					}
				}
				
				//need to use a timeout otherwise it will be reset BEFORE the $watch fires, making it useless..
				$timeout(function() {
					triggers.skipWatch =false;		//reset
					// console.log('triggers.skipWatch: '+triggers.skipWatch);
				}, 100);
			}
			
			/**
			@toc 9.
			*/
			function checkForScrollBar(params) {
				var scrollHeight, scrollPos, viewportHeight;
				if($scope.scrollLoad) {
					$timeout(function() {		//need timeout to wait for items to load / display so scroll height is correct
						if($attrs.pageScroll) {
							//scrollPos =$(window).scrollTop();
							scrollHeight =$(document).height();
							viewportHeight =$(window).height();
							//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+viewportHeight);
							if(scrollHeight >viewportHeight) {
								$scope.hasScrollbar =true;
							}
							else {
								$scope.hasScrollbar =false;
							}
							//do buffer too
							if(scrollHeight >(viewportHeight +$attrs.hasScrollbarBuffer)) {
								$scope.hasScrollbarBuffer =true;
							}
							else {
								$scope.hasScrollbarBuffer =false;
							}
							
						}
						else {
							var ele =document.getElementById(scrollId);
							//scrollPos =ele.scrollTop;
							scrollHeight =ele.scrollHeight;
							viewportHeight =ele.clientHeight;
							//console.log('checkForScrollBar scrollHeight: '+scrollHeight+' viewportHeight: '+viewportHeight);
							if(scrollHeight >viewportHeight) {
								$scope.hasScrollbar =true;
							}
							else {
								$scope.hasScrollbar =false;
							}
							//do buffer too
							if(scrollHeight >(viewportHeight +$attrs.hasScrollbarBuffer)) {
								$scope.hasScrollbarBuffer =true;
							}
							else {
								$scope.hasScrollbarBuffer =false;
							}
						}
						$scope.trigs.scrollbarChecked =true;
					}, 100);
				}
				else {
					$scope.trigs.scrollbarChecked =true;
				}
			}
			
			init({});		//init (called once when directive first loads)
		}
	};
}])
.factory('uiInfinitescrollData', ['ui.config', '$timeout', function (uiConfig, $timeout) {
var inst ={
	data: {},		//each key is a unique form id and each of those holds current data/info
	inited: false,
	
	/**
	*/
	windowScroll: function(instId, data, params) {
		if(data.callback !==undefined) {		//due to timeouts/timing, may be called after it's destroyed so have to check
			data.callback({});
		}
		else {
			// this.destroy(instId, {});
			//do nothing - this is important to NOT destroy since callback may just not be added yet!
		}
	},
	
	/**
	Check to see if this instance is still valid / still on page / still exists (otherwise should destroy it / not act on it)
	@method exists
	*/
	exists:function(instId, params) {
		var exists =false;
		if(this.data[instId] !==undefined) {
			var eleId =this.data[instId].attrs.ids.scrollContent;
			if(document.getElementById(eleId)) {
				exists =true;
			}
		}
		return exists;
	},
	
	/**
	@param {String} instId Unique key for this scrolling event (so don't have multiple events firing on the same element/page and so can cancel/remove the event listeners when destroyed)
	@param {Object} params
		@param {Object} attrs Pass through of attrs of directive (more than what's detailed below - see directive above for what attributes it has)
			@param {Number} pageScroll 1 if want to use window / full page scroll (otherwise will scroll based on an element id)
	*/
	initInst: function(instId, params) {
		params.scrollPos =-1;		//start off invalid. This property is used to check if there was indeed a scroll between the last time and this time (since window.onscroll at least seems to fire initially even when scroll bar is at top - i.e. creating the scroll bar fires onscroll though there's NOT actually any scrolling?)
		this.data[instId] =params;
	},
	
	/**
	*/
	destroy: function(instId, params) {
		if(this.data[instId] !==undefined) {
			delete this.data[instId];
		}
	},
	
	/**
	*/
	removeScrollEvt: function(instId, params) {
		this.destroy(instId, params);
	},
	
	/**
	@param {String} instId Unique key for this scrolling event (so don't have multiple events firing on the same element/page and so can cancel/remove the event listeners when destroyed)
	@param {Object} params
		@param {Object} attrs Pass through of attrs of directive (more than what's detailed below - see directive above for what attributes it has)
			@param {Number} pageScroll 1 if want to use window / full page scroll (otherwise will scroll based on an element id)
	*/
	addScrollEvt: function(instId, params) {
		var thisObj =this;
		var eleId;
		if(!this.inited) {
			window.onscroll =function() {
				for(var xx in thisObj.data) {
					// eleId =xx;
					eleId =thisObj.data[xx].attrs.ids.scrollContent;
					//see if infinite scroll element is still defined / on page (remove event listener otherwise)
					// console.log('uiInfinitescroll addScrollEvt window.onscroll: eleId: '+eleId+' eleId exists: '+document.getElementById(eleId));		//TESTING
					if(document.getElementById(eleId)) {
						thisObj.windowScroll(xx, thisObj.data[xx], {});
					}
					else {		//remove
						// console.log('uiInfinitescroll removeScrollEvt eleId: '+eleId);		//TESTING
						thisObj.removeScrollEvt(xx, {});
						// thisObj.destroy(instId, {});
					}
				}
			};
		}
		this.inited =true;
		
		if(this.data[instId] !==undefined) {		//ONLY if defined, update it (add the callback)
			this.data[instId] =angular.extend(this.data[instId], params);		//must extend, not overwrite since need to keep custom added properties such as scrollPos
		}
	}
	
};
return inst;
}])
;